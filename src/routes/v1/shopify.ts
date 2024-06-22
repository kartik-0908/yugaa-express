import { Router } from 'express';
import { getRoleById, initializePlan, setDomainwithId, storeToken } from '../../common/db';
import axios from 'axios';
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
        const {data} = response
        console.log(data)
        await storeToken(shop, data.access_token)
        await initializePlan(shop)
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
    // await setDomainwithId(id, shopDomain);
    res.json({
        "message": "ok",
    })
    return;
})

module.exports = router;