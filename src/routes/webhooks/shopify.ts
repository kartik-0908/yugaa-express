import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../../common/db';
import { updateProductwithID } from '../../common/pubsubPublisher';
const getRawBody = require('raw-body')
require('dotenv').config();
const router = Router();
const secretKey = process.env.SHOPIFY_SECRET_KEY || "";
const verifyWebhook = (hmac: string, body: string) => {
    const generatedHmac = crypto.createHmac('sha256', secretKey).update(body, 'utf8').digest('base64');
    return generatedHmac === hmac;
};

const verifyShopifyWebhook = async (req: any, res: any, next: any) => {
    const hmac = req.get('x-shopify-hmac-sha256') || "";
    const body = await getRawBody(req);

    if (verifyWebhook(hmac, body)) {
        req.body = JSON.parse(body)
        console.log("from shopify")
        next();
    } else {
        console.log("not vrified webhook")
        res.status(401).json({ message: "Not verified" });
    }
};

router.use(verifyShopifyWebhook);
router.get('/', (req, res) => {
    res.json({
        "message": "inside webhook"
    })
})
router.post('/customers/data_request', async (req, res) => {
    const { shop_domain: shopDomain, customer } = req.body;
    const customerId = customer.id;

    try {
        const customerData = await db.customer.findFirst({
            where: {
                shopDomain,
                id: customerId,
                deleted: false,
            },
            select: {
                firstName: true,
                lastName: true,
                email: true,
            },
        });

        if (customerData) {
            res.status(200).json(customerData);
        } else {
            res.status(404).json({ message: "Customer not found or deleted" });
        }
    } catch (error) {
        console.error("Error retrieving customer data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.post('/customers/redact', async (req, res) => {
    const { shop_domain: shopDomain, customer } = req.body;
    const customerEmail = customer.email;

    try {
        await db.customer.updateMany({
            where: {
                shopDomain,
                email: customerEmail,
            },
            data: {
                deleted: true,
            },
        });

        res.status(200).json({ message: "Customer and orders redacted successfully" });
    } catch (error) {
        console.error("Error redacting customer and orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.post('/shop/redact', async (req, res) => {
    const { shop_domain: shopDomain } = req.body;

    try {
        await db.shopifyInstalledShop.deleteMany({
            where: { shop: shopDomain },
        });
        res.status(200).json({ message: "Shop data erased successfully" });
    } catch (error) {
        console.error("Error erasing shop data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/app_subscriptions/update', async (req, res) => {
    const shop = req.get('x-shopify-shop-domain') || "";
    const triggeredAt = req.get('x-shopify-triggered-at') || "2024-04-29T21:46:47.145320653Z";
    const payload = req.body;

    try {
        await db.$transaction(async (db) => {
            await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${shop}));`;

            const { app_subscription } = payload;
            const lastUpdateTimestamp = new Date(payload.eventTimestamp);
            const currentTimestamp = new Date(triggeredAt);

            if (app_subscription.status === "CANCELLED") {
                const planDetails = await db.planDetails.findUnique({
                    where: { shopifyDomain: shop },
                    select: { planId: true, eventTimestamp: true },
                });

                if (planDetails && lastUpdateTimestamp < currentTimestamp) {
                    await db.planDetails.update({
                        where: { shopifyDomain: shop },
                        data: {
                            planId: 0,
                            convleft: 50,
                            shopifyid: app_subscription.admin_graphql_api_id,
                            eventTimestamp: triggeredAt,
                        },
                    });
                }
            } else if (app_subscription.status === "ACTIVE") {
                await db.planDetails.update({
                    where: { shopifyDomain: shop },
                    data: {
                        planId: app_subscription.name === "Basic Plan for Yugaa" ? 1 : 2,
                        convleft: app_subscription.name === "Basic Plan for Yugaa" ? 1500 : 2500,
                        shopifyid: app_subscription.admin_graphql_api_id,
                        eventTimestamp: triggeredAt,
                    },
                });
            }
        });

        res.status(200).json({ message: "Plan details updated successfully" });
    } catch (error) {
        console.error("Error updating plan details:", error);
        res.status(500).json({ message: "Error updating plan details" });
    }
});

router.post('/app/uninstalled', async (req, res) => {
    const shop = req.get('x-shopify-shop-domain');
    const body = req.body;

    try {
        const installedShop = await db.shopifyInstalledShop.findUnique({
            where: { shop },
            select: { accessToken: true },
        });

        if (installedShop) {
            await db.registeredWebhooks.deleteMany({ where: { shopDomain: shop } });
            await db.shopifyInstalledShop.update({
                where: {
                    shop
                },
                data: {
                    accessToken: null
                }
            })
            await db.planDetails.update({
                where: { shopifyDomain: shop },
                data: { planId: 0, convleft: 0 },
            });
        }
        res.status(200).json({ message: "Shop uninstalled" });
    } catch (error) {
        console.error("Error erasing shop data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const extractProductData = (products: any) => {
    return products.map((product: any) => {
        const { id } = product;
        return [id];
    });
};

router.post('/products/create', async (req, res) => {
    const shop = req.get('x-shopify-shop-domain') || "exampleshop";
    const payload = req.body;
    console.log()
    const extractedData = extractProductData([payload]);
    try {
        for (const [id] of extractedData) {
            await updateProductwithID(shop, id, "new");
        }
        res.status(200).json({ message: "successfully" });
    } catch (error) {
        console.error("Error handling product creation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.post('/products/update', async (req, res) => {
    const shop = req.get('x-shopify-shop-domain') || "exampleshop";
    const payload = req.body;

    const extractedData = extractProductData([payload]);

    try {
        for (const [id] of extractedData) {
            await updateProductwithID(shop, id, "update");
        }
        res.status(200).json({ message: "successfully" });
    } catch (error) {
        console.error("Error handling product update:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/products/delete', async (req, res) => {
    const shop = req.get('x-shopify-shop-domain') || "exampleshop";
    const payload = req.body;
    const { id } = payload;

    try {
        await updateProductwithID(shop, id, "delete");
        res.status(200).json({ message: "successfully" });
    } catch (error) {
        console.error("Error handling product deletion:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;