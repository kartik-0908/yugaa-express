"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../lib/prisma");
const redis_1 = __importDefault(require("../../lib/redis"));
require('dotenv').config();
const router = (0, express_1.Router)();
const secretKey = process.env.SHOPIFY_SECRET_KEY || "";
const verifyWebhook = (hmac, body) => {
    const generatedHmac = crypto_1.default.createHmac('sha256', secretKey).update(body, 'utf8').digest('base64');
    return generatedHmac === hmac;
};
const verifyShopifyWebhook = (req, res, next) => {
    const hmac = req.get('x-shopify-hmac-sha256') || "";
    const body = JSON.stringify(req.body);
    if (verifyWebhook(hmac, body)) {
        next();
    }
    else {
        res.status(401).json({ message: "Not verified" });
    }
};
// router.use(verifyShopifyWebhook);
router.get('/', (req, res) => {
    res.json({
        "message": "inside webhook"
    });
});
router.post('/customers/data_request', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shop_domain: shopDomain, customer } = req.body;
    const customerId = customer.id;
    try {
        const customerData = yield prisma_1.client.customer.findFirst({
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
        }
        else {
            res.status(404).json({ message: "Customer not found or deleted" });
        }
    }
    catch (error) {
        console.error("Error retrieving customer data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post('/customers/redact', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shop_domain: shopDomain, customer } = req.body;
    const customerEmail = customer.email;
    try {
        yield prisma_1.client.customer.updateMany({
            where: {
                shopDomain,
                email: customerEmail,
            },
            data: {
                deleted: true,
            },
        });
        res.status(200).json({ message: "Customer and orders redacted successfully" });
    }
    catch (error) {
        console.error("Error redacting customer and orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post('/shop/redact', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shop_domain: shopDomain } = req.body;
    try {
        yield prisma_1.client.shopify_installed_shop.deleteMany({
            where: { shop: shopDomain },
        });
        res.status(200).json({ message: "Shop data erased successfully" });
    }
    catch (error) {
        console.error("Error erasing shop data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post('/app_subscriptions/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = req.get('x-shopify-shop-domain') || "";
    const triggeredAt = req.get('x-shopify-triggered-at') || "2024-04-29T21:46:47.145320653Z";
    const payload = req.body;
    try {
        yield prisma_1.client.$transaction((client) => __awaiter(void 0, void 0, void 0, function* () {
            yield client.$executeRaw `SELECT pg_advisory_xact_lock(hashtext(${shop}));`;
            const { app_subscription } = payload;
            const lastUpdateTimestamp = new Date(payload.eventTimestamp);
            const currentTimestamp = new Date(triggeredAt);
            if (app_subscription.status === "CANCELLED") {
                const planDetails = yield client.planDetails.findUnique({
                    where: { shopifyDomain: shop },
                    select: { planId: true, eventTimestamp: true },
                });
                if (planDetails && lastUpdateTimestamp < currentTimestamp) {
                    yield client.planDetails.update({
                        where: { shopifyDomain: shop },
                        data: {
                            planId: 0,
                            convleft: 50,
                            shopifyid: app_subscription.admin_graphql_api_id,
                            eventTimestamp: triggeredAt,
                        },
                    });
                }
            }
            else if (app_subscription.status === "ACTIVE") {
                yield client.planDetails.update({
                    where: { shopifyDomain: shop },
                    data: {
                        planId: app_subscription.name === "Basic Plan for Yugaa" ? 1 : 2,
                        convleft: app_subscription.name === "Basic Plan for Yugaa" ? 1500 : 2500,
                        shopifyid: app_subscription.admin_graphql_api_id,
                        eventTimestamp: triggeredAt,
                    },
                });
            }
        }));
        res.status(200).json({ message: "Plan details updated successfully" });
    }
    catch (error) {
        console.error("Error updating plan details:", error);
        res.status(500).json({ message: "Error updating plan details" });
    }
}));
router.post('/app/uninstalled', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = req.get('x-shopify-shop-domain');
    const body = req.body;
    try {
        const installedShop = yield prisma_1.client.shopify_installed_shop.findUnique({
            where: { shop },
            select: { accessToken: true },
        });
        if (installedShop) {
            yield prisma_1.client.registeredWebhooks.deleteMany({ where: { shopDomain: shop } });
            yield prisma_1.client.shopify_installed_shop.deleteMany({ where: { shop } });
            yield prisma_1.client.planDetails.update({
                where: { shopifyDomain: shop },
                data: { planId: 0, convleft: 0 },
            });
        }
        res.status(200).json({ message: "Shop uninstalled" });
    }
    catch (error) {
        console.error("Error erasing shop data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
const extractProductData = (products) => {
    return products.map((product) => {
        const { id } = product;
        return [id];
    });
};
router.post('/products/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = req.get('x-shopify-shop-domain') || "exampleshop";
    const payload = req.body;
    const extractedData = extractProductData([payload]);
    try {
        for (const [id] of extractedData) {
            yield redis_1.default.lpush('product-update', JSON.stringify({
                id: id,
                shopDomain: shop,
                type: "new"
            }));
        }
        res.status(200).json({ message: "successfully" });
    }
    catch (error) {
        console.error("Error handling product creation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post('/products/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = req.get('x-shopify-shop-domain') || "exampleshop";
    const payload = req.body;
    const extractedData = extractProductData([payload]);
    try {
        for (const [id] of extractedData) {
            yield redis_1.default.lpush('product-update', JSON.stringify({
                id: id,
                shopDomain: shop,
                type: "update"
            }));
        }
        res.status(200).json({ message: "successfully" });
    }
    catch (error) {
        console.error("Error handling product update:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.post('/products/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = req.get('x-shopify-shop-domain') || "exampleshop";
    const payload = req.body;
    const { id } = payload;
    try {
        yield redis_1.default.lpush('product-update', JSON.stringify({
            id: id,
            shopDomain: shop,
            type: "delete"
        }));
        res.status(200).json({ message: "successfully" });
    }
    catch (error) {
        console.error("Error handling product deletion:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
module.exports = router;
