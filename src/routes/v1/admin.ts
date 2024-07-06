import { Router } from 'express';
import { db } from '../../common/db';
const express = require('express');
const router = Router();

router.use(express.json())
router.post('/verify', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'code is required' });
    }
    console.log(code)
    const shopDomain = await db.shopifyInstalledShop.findMany({
        where: {
            adminInviteCode: code
        }
    })
    console.log(shopDomain)
    return res.json({ shopDomain });
});

router.post('/access-token', async (req, res) => {
    const { shopDomain } = req.body;
    console.log(shopDomain)
    try {
        const token = await db.shopifyInstalledShop.findUnique({
            where: {
                shop: shopDomain
            },
            select: {
                accessToken: true
            }
        })
        if (!token) {
            res.status(400).json({
                "message": "token not found"
            })
            return;
        }
        res.json({
            accessToken: token?.accessToken
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            "message": "error"
        })
    }
})

router.post('/settings', async (req, res) => {
    const { shopDomain } = req.body;
    console.log(shopDomain)
    try {
        const settings = await db.chatbotCustomization.findUnique({
            where: {
                shopDomain: shopDomain,
            },
            select: {
                selectedColor: true,
                botName: true,
                fontColor: true,
                widgetPosition: true,
                fontFamily: true,
                logo: true
            },
        });
        if (!settings) {
            res.status(400).json({
                "message": "settings not found"
            })
            return;
        }
        res.json(settings)
    } catch (error) {
        console.log(error)
        res.status(400).json({
            "message": "error"
        })
    }
})

router.post('/ai-tickets', async (req, res) => {
    console.log("fetching for home peqk inetaqrction time")
    const { startTime } = req.body
    const { endTime } = req.body
    const { shopDomain } = req.body
    console.log(startTime)
    console.log(endTime)
    console.log(shopDomain)
    try {
        const tickets = await db.aIConversationTicket.findMany({
            where: {
                shopDomain: shopDomain,
                createdAt: {
                    gte: startTime,
                    lte: endTime,
                },
            },
            select: {
                id: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        })
        console.log(tickets)
        res.json({
            tickets
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/total-interaction', async (req, res) => {
    console.log("fetching for home total interaction time")
    const { startTime } = req.body
    const { endTime } = req.body
    const { shopDomain } = req.body
    console.log(startTime)
    console.log(endTime)
    console.log(shopDomain)
    try {
        const tickets = await db.aIConversationTicket.findMany({
            where: {
                shopDomain: shopDomain,
                createdAt: {
                    gte: startTime,
                    lte: endTime,
                },
            },
            select: {
                id: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        })
        console.log(tickets)
        res.json({
            tickets
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/recent-chats', async (req, res) => {
    console.log("fetching for home total interaction time")
    const { shopDomain } = req.body
    console.log(shopDomain)
    try {
        const tickets = await db.aIConversationTicket.findMany({
            where: {
              shopDomain: shopDomain,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 3,
            include: {
              messages: {
                take: 2, 
              },
            },
          });
          const result = tickets.map(ticket => ({
            id: ticket.id,
            messages: ticket.messages,
          }));
        console.log(result)
        res.json({
            result
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

module.exports = router;