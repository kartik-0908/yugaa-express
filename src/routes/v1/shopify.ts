import { Router } from 'express';
import { db } from '../../common/db';
import axios from 'axios';
import { publishShopifyStoreProcessData } from '../../common/pubsubPublisher';
const express = require('express');
const router = Router();

router.use(express.json())

router.post('/access-token', async (req, res) => {
    const { body } = req
    const { shop } = body
    const { code } = body
    console.log(req.body)
    try {
        console.log(process.env.SHOPIFY_KEY)
        const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
            client_id: process.env.SHOPIFY_KEY,
            client_secret: process.env.SHOPIFY_SECRET_KEY,
            code: code,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const { data } = response
        console.log(data)
        const accessToken = data.access_token;
        const existingShop = await db.shopifyInstalledShop.findUnique({
            where: {
                shop: shop,
            },
        });
        if (existingShop) {
            const updatedShop = await db.shopifyInstalledShop.update({
                where: {
                    shop: shop,
                },
                data: {
                    accessToken: accessToken,
                },
            });
            console.log("Updated token for existing shop: ", updatedShop);
        } else {
            const newInstalledShop = await db.shopifyInstalledShop.create({
                data: {
                    shop: shop,
                    accessToken: accessToken,
                },
            });
            console.log("Stored token for new shop: ", newInstalledShop);
        }
        await publishShopifyStoreProcessData(shop)
    } catch (error) {
        console.log(error)
    }
    res.json({
        "message": "ok",
    })
    return;
})

router.post('/get-members', async (req, res) => {
    const { body } = req
    const { shopDomain } = body
    console.log(req.body)
    res.json({
        "message": "ok",
    })
    return;
})

router.post('/getEmail', async (req, res) => {
    const { body } = req
    const { shopDomain } = body
    try {
        const resp = await db.shopifyInstalledShop.findUnique({
            where: {
                shop: shopDomain,
            },
        });

        const emails = resp?.email
        res.json({
            emails
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            "message": "Internal server error",
        })
    }
    return;
})

router.post('/autoAssignment', async (req, res) => {
    const { body } = req
    const { shopDomain } = body
    try {
        const resp = await db.shopifyInstalledShop.findUnique({
            where: {
                shop: shopDomain,
            },
        });
        res.json({
            isAutoAssignment: resp?.autoAssignment
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            "message": "Internal server error",
        })
    }
    return;
})

router.post('/updateAutoAssignment', async (req, res) => {
    const { body } = req
    const { shopDomain, autoAssignment } = body
    console.log(req.body)
    try {
        const resp = await db.shopifyInstalledShop.update({
            where: {
                shop: shopDomain,
            },
            data:{
                autoAssignment: autoAssignment
            }
        });
        res.json({
            "message": "ok"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            "message": "Internal server error",
        })
    }
    return;
})



module.exports = router;