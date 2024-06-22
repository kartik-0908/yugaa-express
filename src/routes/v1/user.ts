import { Router } from 'express';
import { getInviteCodesForShop, getRoleById, getUsersForShopDomain, setDomainwithId } from '../../common/db';
import axios from 'axios';
import { clerkClient } from '@clerk/clerk-sdk-node';
const express = require('express');
const router = Router();

router.use(express.json())
router.post('/invite', async (req, res) => {
    const { body } = req
    let { shop } = body
    const { email } = body
    let { role } = body
    role = role.toLowerCase()
    if (!shop.endsWith(".myshopify.com")) {
        shop += ".myshopify.com";
    }
    console.log(`invite details ${email} ${role} ${shop}`)
    console.log(email)
    try {
        const response = await clerkClient.invitations.createInvitation({
            emailAddress: email,
            publicMetadata: {
                "role": role,
                "shopDomain": shop,
            },
            ignoreExisting: true
        });
        res.json({
            "message": "ok",
        })
    } catch (error) {
        console.log(error)
        res.json({
            "message": "error",
        })
    }




})
router.get('/get-role', async (req, res) => {
    const id = req.query.id;
    console.log("insd get role")

    if (!id) {
        return res.status(400).json({ error: 'Email is required' });
    }
    console.log(id)
    const role = await getRoleById(id as string)
    console.log(role)
    return res.json({ role });
});

router.post('/set-domain', async (req, res) => {
    const { body } = req
    const { id } = body
    const { shopDomain } = body
    console.log(req.body)
    await setDomainwithId(id, shopDomain);
    res.json({
        "message": "ok",
    })
    return;
})

router.post('/get-members', async (req, res) => {
    const { body } = req
    const { shopDomain } = body
    console.log(req.body)
    const data = await getInviteCodesForShop(shopDomain)
    const adminInviteCode = data?.adminInviteCode
    const memberInviteCode = data?.memberInviteCode
    const users = await getUsersForShopDomain(shopDomain)
    console.log(adminInviteCode)
    res.json({
        "message": "ok",
        adminInviteCode,
        memberInviteCode,
        users
    })
    return;
})

module.exports = router;