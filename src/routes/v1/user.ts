import { Router } from 'express';
import { db } from '../../common/db';
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
        // console.log(response)
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
    const id = req.query.id as string;
    console.log("insd get role")

    if (!id) {
        return res.status(400).json({ error: 'Email is required' });
    }
    console.log(id)
    const invitedUser = await db.user.findUnique({
        where: { id },
    });
    console.log(invitedUser?.role)
    return res.json({ role: invitedUser?.role });
});
router.post('/getRoleDomain', async (req, res) => {
    const { userId } = req.body
    console.log(userId)
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
        });
        return res.json({ role: user?.role, shopDomain: user?.shopDomain });
    } catch (error) {
        console.log(error)
        res.json({
            "message": "error",
        })
    }
});
router.post('/get-members', async (req, res) => {
    const { body } = req
    const { shopDomain } = body
    console.log(req.body)
    const shopData = await db.shopifyInstalledShop.findUnique({
        where: {
            shop: shopDomain,
        },
        select: {
            adminInviteCode: true,
            memberInviteCode: true,
        },
    });

    if (!shopData) {
        console.log(`No shop found with the shop name: ${shopDomain}`);
        res.json({
            "message": "No shop found with the shop name: ${shopDomain}",
        })
        return;
    }
    const adminInviteCode = shopData.adminInviteCode;
    const memberInviteCode = shopData.memberInviteCode;
    const users = await db.user.findMany({
        where: {
            shopDomain: shopDomain,
        },
        select: {
            email: true,
            firstName: true,
            lastName: true,
            image: true,
            role: true,
        },
    });
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