import { Router } from 'express';
import { db } from '../../common/db';
const express = require('express');
const router = Router();
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
});

router.use(express.json())
router.post('/verify', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'code is required' });
    }
    // console.log(code)
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
    // console.log(startTime)
    // console.log(endTime)
    // console.log(shopDomain)
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
        // console.log(tickets)
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
    // console.log(startTime)
    // console.log(endTime)
    // console.log(shopDomain)
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
        // console.log(tickets)
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
    // console.log(shopDomain)
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
        // console.log(result)
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

router.post('/unanswered', async (req, res) => {
    console.log("fetching for unanswered messages")
    const { shopDomain } = req.body
    const { startTime } = req.body
    const { endTime } = req.body
    console.log(shopDomain)
    try {
        const count = await db.message.count({
            where: {
                unanswered: true,
                createdAt: {
                    gte: startTime,
                    lte: endTime
                },
                sender: 'ai',
                aiconversationticket: {
                    shopDomain: shopDomain
                }
            },

        });
        res.json({
            count
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})
router.post('/answered', async (req, res) => {
    console.log("fetching for unanswered messages")
    const { shopDomain } = req.body
    const { startTime } = req.body
    const { endTime } = req.body
    console.log(shopDomain)
    try {
        const count = await db.message.count({
            where: {
                unanswered: false,
                createdAt: {
                    gte: startTime,
                    lte: endTime
                },
                sender: 'ai',
                aiconversationticket: {
                    shopDomain: shopDomain
                }
            },

        });
        res.json({
            count
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/count-ai-tickets', async (req, res) => {
    console.log("fetching for analytics total tickets")
    const { startTime } = req.body
    const { endTime } = req.body
    const { shopDomain } = req.body
    console.log(startTime)
    console.log(endTime)
    console.log(shopDomain)
    try {
        const count = await db.aIConversationTicket.count({
            where: {
                shopDomain: shopDomain,
                createdAt: {
                    gte: startTime,
                    lte: endTime,
                },
            },
        })
        // console.log(count)
        res.json({
            count
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/avg-session', async (req, res) => {
    console.log("fetching for analytics total tickets")
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
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
        let totalDifference = 0;
        let totalTickets = 0;

        tickets.forEach(ticket => {
            if (ticket.messages.length > 1) {
                const firstMessageTime = new Date(ticket.messages[0].createdAt).getTime();
                const lastMessageTime = new Date(ticket.messages[ticket.messages.length - 1].createdAt).getTime();
                const differenceInSeconds = (lastMessageTime - firstMessageTime) / 1000;
                totalDifference += differenceInSeconds;
                totalTickets += 1;
            }
        });

        const avgSession = totalTickets > 0 ? totalDifference / totalTickets : 0;
        res.json({
            avgSession
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/transfer-rate', async (req, res) => {
    console.log("fetching for analytics transfer rate")
    const { startTime } = req.body
    const { endTime } = req.body
    const { shopDomain } = req.body
    console.log(startTime)
    console.log(endTime)
    console.log(shopDomain)
    try {
        const totalTickets = await db.aIConversationTicket.count({
            where: {
                shopDomain: shopDomain,
                createdAt: {
                    gte: startTime,
                    lte: endTime,
                },
            },
        });

        const escalatedTickets = await db.aIConversationTicket.count({
            where: {
                shopDomain: shopDomain,
                createdAt: {
                    gte: startTime,
                    lte: endTime,
                },
                AIEscalatedTicket: {
                    some: {}, // This checks if there is at least one related AIEscalatedTicket
                },
            },
        });

        let ratio = totalTickets > 0 ? escalatedTickets / totalTickets : 0;
        ratio *= 100;
        res.json({
            ratio
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/customizations', async (req, res) => {
    console.log("fetching customizations")
    const { shopDomain } = req.body
    console.log(shopDomain)
    try {

        const settings = await db.chatbotCustomization.findUnique({
            where: {
                shopDomain: shopDomain
            }
        })
        res.json({
            settings
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/customizations', async (req, res) => {
    console.log("fetching customizations")
    const { shopDomain } = req.body
    console.log(shopDomain)
    try {

        const settings = await db.chatbotCustomization.findUnique({
            where: {
                shopDomain: shopDomain
            }
        })
        res.json({
            settings
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})
router.post('/appearance', async (req, res) => {
    console.log("fetching customizations")
    const { shopDomain, selectedColor, botName, fontFamily, fontColor, widgetPosition } = req.body
    console.log(shopDomain)
    try {
        await db.chatbotCustomization.update({
            where: {
                shopDomain: shopDomain
            },
            data: {
                selectedColor,
                botName,
                fontFamily,
                fontColor,
                widgetPosition
            }
        })
        res.json({
            "message": "success"
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})
router.post('/appearance/logo', async (req, res) => {
    console.log("fetching customizations")
    const { shopDomain, logourl, filename } = req.body
    console.log(shopDomain)
    try {
        await db.chatbotCustomization.update({
            where: {
                shopDomain: shopDomain
            },
            data: {
                logo: logourl,
                logoFilename: filename
            }
        })
        res.json({
            "message": "success"
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/language', async (req, res) => {
    console.log("fetching customizations")
    const { shopDomain, toneAndStyle, positiveReinforcement, errorHandling, politeness, clarityAndSimplicity, personalization } = req.body
    console.log(shopDomain)
    try {
        await db.chatbotCustomization.update({
            where: {
                shopDomain: shopDomain
            },
            data: {
                toneAndStyle,
                positiveReinforcement,
                errorHandling,
                politeness,
                clarityAndSimplicity,
                personalization
            }
        })
        res.json({
            "message": "success"
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/behaviour', async (req, res) => {
    console.log("fetching customizations")
    const { shopDomain, responseLength, clarificationPrompt, apologyAndRetryAttempt, errorMessageStyle, greetingmessage } = req.body
    console.log(shopDomain)
    try {
        await db.chatbotCustomization.update({
            where: {
                shopDomain: shopDomain
            },
            data: {
                responseLength,
                clarificationPrompt,
                apologyAndRetryAttempt,
                errorMessageStyle,
                greetingMessage: greetingmessage
            }
        })
        res.json({
            "message": "success"
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/chat', async (req, res) => {
    console.log("fetching chat list")
    const { shopDomain, offset, count } = req.body
    console.log(shopDomain)
    try {
        const retcount = await db.aIConversationTicket.count({
            where: {
                shopDomain: shopDomain,
            },
        });
        const tickets = await db.aIConversationTicket.findMany({
            skip: offset,
            take: count,
            where: {
                shopDomain: shopDomain
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                    select: {
                        id: true,
                        sender: true,
                        message: true,
                        createdAt: true,
                        unanswered: true,
                    },
                },
            },
        });
        res.json({
            retcount, tickets
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/completeChat', async (req, res) => {
    console.log("fetching chat list")
    const { id, } = req.body
    try {
        const ticket = await db.aIConversationTicket.findUnique({
            where: {
                id: id
            },
            include: {
                messages: true
            }
        })
        res.json({
            ticket
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/feature-request', async (req, res) => {
    const { shortdesc, message, category, shopDomain } = req.body
    console.log(req.body)
    try {
        await db.featureRequest.create({
            data: {
                shop: shopDomain,
                description: shortdesc,
                details: message,
                category: category
            }
        })

        res.json({
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})
router.post('/getEscwithStatus', async (req, res) => {
    const { shopDomain, offset, count, status } = req.body
    // console.log(shopDomain)
    try {
        const retcount = await db.aIEscalatedTicket.count({
            where: {
                shopDomain: shopDomain,
                status: status
            },
        });
        const tickets = await db.aIEscalatedTicket.findMany({
            skip: offset,
            take: count,
            where: {
                shopDomain: shopDomain
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                aiConversationTicketId: true,
                createdAt: true,
                customerEmail: true

            },
        });
        // console.log(tickets)
        res.json({
            retcount, tickets
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/getEscTicketwithId', async (req, res) => {
    const { id, } = req.body
    try {
        const escalatedTicket = await db.aIEscalatedTicket.findUnique({
            where: { id: id },
            include: {
                events: {
                    orderBy: { createdAt: 'asc' },
                },
                aiConversationTicket: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'asc' },
                        },
                    },
                },
            },
        });


        res.json({
            escalatedTicket
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})

router.post('/getEscTicketEvents', async (req, res) => {
    const { id } = req.body
    console.log(id)
    try {
        const events = await db.aIEscalatedTicketEvent.findMany({
            where: {
                aiEscalatedTicketId: id
            },
            orderBy: {
                createdAt: 'asc',
            },
            include:{
                email: true,
            }
            
        });
        // console.log(events)
        res.json({
            events
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            "message": "Technical Error"
        })
    }
})


module.exports = router;