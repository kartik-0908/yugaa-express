import { Router } from 'express';
import { db } from '../../common/db';
const sgMail = require('@sendgrid/mail');
const express = require('express');
const router = Router();

router.use(express.json())

router.post('/send-email', async (req, res) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const { to, subject, text, from, ticketId, status } = req.body;
    console.log(ticketId)
    const msg = {
        to,
        from: from,
        subject,
        text,
        replyTo: from,
        headers: {
            'References': ticketId,
            'In-Reply-To': ticketId,
            'Message-ID': ticketId,
        },
    };

    try {
        await sgMail.send(msg);
        const newEmail = await db.email.create({
            data: {
                subject: subject,
                text: text,
                from: from,
                to: to,
            }
        })
        await db.aIEscalatedTicketEvent.create({
            data: {
                aiEscalatedTicketId: ticketId,
                emailId: newEmail.id,
                type: "EMAIL_SENT",
            }
        })
        await db.aIEscalatedTicket.update({
            where: {
                id: ticketId,
            },
            data: {
                status: status,
            }
        })
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.log(error)
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