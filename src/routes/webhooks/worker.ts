import { Router } from 'express';
import { db } from '../../common/db';
const express = require('express')

const router = Router();

router.use(express.json())

router.post('/initialize/plan', async function (req, res) {
    const { shopDomain } = req.body;
    try {
        const resp = await db.planDetails.findUnique({
            where: {
                shopifyDomain: shopDomain
            }
        })
        if (!resp) {
            const planDetails = await db.planDetails.create({
                data: {
                    shopifyDomain: shopDomain,
                    planId: 0,
                    planStartDate: new Date(),
                    convleft: 50
                },
            });
        }
        res.status(200).json({
            success: true,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: (err as Error).message,
        });
    }
}
);

router.post('/initialize/customizations', async function (req, res) {
    const { shopDomain } = req.body;
    try {
        const existingCustomization = await db.chatbotCustomization.findUnique({
            where: {
                shopDomain: shopDomain,
            },
        });
        if (!existingCustomization) {
            const defaultCustomization = await db.chatbotCustomization.create({
                data: {
                    shopDomain: shopDomain,
                    botName: 'Yugaa',
                    greetingMessage: 'Hello, how can I assist you?',
                    selectedColor: "#1C2434",
                    fontFamily: "Arial, sans-serif",
                    fontColor: "White",
                    widgetPosition: "right",
                    toneAndStyle: "Conversational and friendly, with a touch of humor when appropriate. Maintain a professional tone for business-related queries.",
                    userGuidance: "Provide clear guidance and instructions. Clearly instruct users on how to navigate the chatbot, ask for information, or perform specific actions.",
                    positiveReinforcement: "Include positive phrases to acknowledge user inputs. Express gratitude and provide positive feedback where applicable to enhance user experience.",
                    errorHandling: "Clearly communicate errors with user-friendly messages. Provide suggestions for correction and avoid technical jargon. Apologize when necessary",
                    politeness: "Always use polite phrases and courteous language. Avoid language that may be perceived as rude or insensitive. Thank users for their inputs.",
                    clarityAndSimplicity: "Prioritize straightforward language. Avoid complex jargon and use concise sentences. Break down information into easily digestible chunks.",
                    personalization: "Address users by name whenever possible. Reference past interactions to create a personalized experience. Use personalized greetings based on user history.",
                    responseLength: "Medium",
                    clarificationPrompt: "I need more information to assist you. Could you provide additional details?",
                    apologyAndRetryAttempt: "I apologize for any confusion. Could you please provide your query again?",
                    errorMessageStyle: "Standard",
                    logo: "https://storage.googleapis.com/yugaa-logo-files/user.png"
                },
            });
            console.log('Default customization initialized for shop:', shopDomain);
        } else {
            console.log('Customization already exists for shop:', shopDomain);
        }
        res.status(200).json({
            success: true,
            message: 'Webhook received',
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: (err as Error).message,
        });
    }
}
);

function trimShopifyDomain(url: string): string {
    const shopifySuffix = '.myshopify.com';
    if (url.endsWith(shopifySuffix)) {
        return url.slice(0, -shopifySuffix.length);
    }
    return url;
}

router.post('/initialize/email', async function (req, res) {
    const { shopDomain } = req.body;
    const shop = trimShopifyDomain(shopDomain)

    try {
        const newEmail = `${shop}@yugaa.tech`;
        const shopData = await db.shopifyInstalledShop.findUnique({
            where: {
                shop: shopDomain
            },
            select: {
                email: true
            }
        })
        if (shopData) {
            const currentEmails = shopData.email;
            if (!currentEmails.includes(newEmail)) {
                currentEmails.push(newEmail);
                await db.shopifyInstalledShop.update({
                    where: { shop: shopDomain },
                    data: { email: currentEmails },
                });
                console.log(`Email added for shop: ${shop}`);
            } else {
                console.log(`Email already exists for shop: ${shop}`);
            }
        }
        res.status(200).json({
            success: true,
            message: 'Webhook received',
        });
    } catch (err) {
        // console.log(err)
        res.status(400).json({
            success: false,
            message: (err as Error).message,
        });
    }
}
);

router.post('/save-webhook', async function (req, res) {
    const { id, address, topic, createdAt, updatedAt, shopDomain } = req.body;
    try {
        const createdWebhook = await db.registeredWebhooks.create({
            data: {
                id,
                address,
                topic,
                createdAt,
                updatedAt,
                shopDomain,
            },
        });
        res.status(200).json({
            success: true,
            message: 'Webhook received',
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: (err as Error).message,
        });
    }
}
);

router.post('/save-mssg', async function (req, res) {
    const { ticketId, sender, message } = req.body;
    try {
        await db.message.create({
            data: {
                ticketId,
                sender,
                message
            }
        })
        res.status(200).json({
            success: true,
            message: 'Webhook received',
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: (err as Error).message,
        });
    }
})





module.exports = router;