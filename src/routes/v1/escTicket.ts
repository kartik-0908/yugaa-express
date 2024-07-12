import { Router } from 'express';
import { db } from '../../common/db';
const sgMail = require('@sendgrid/mail');
const express = require('express');
const router = Router();

router.use(express.json())

router.post('/update', async (req, res) => {
    const { id, field, value, by } = req.body;
    console.log(req.body)   

    try {
        await db.aIEscalatedTicket.update({
            where: {
                id: id,
            },
            data: {
                [field]: value,
            },
        });
        if (field === "status") {
            await db.aIEscalatedTicketEvent.create({
                data: {
                    aiEscalatedTicketId: id,
                    type: "STATUS_CHANGED",
                    newStatus: value,
                    changedBy: by
                }
            })
        }
        if (field === "priority") {
            await db.aIEscalatedTicketEvent.create({
                data: {
                    aiEscalatedTicketId: id,
                    type: "PRIORITY_CHANGED",
                    newPriority: value,
                    changedBy: by
                }
            })
        }
        if (field === 'category') {
            await db.aIEscalatedTicketEvent.create({
                data: {
                    aiEscalatedTicketId: id,
                    type: "CATEGORY_CHANGED",
                    newCategory: value,
                    changedBy: by
                }
            })
        }

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email' });
    }
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


module.exports = router;