// src/routes/v1.ts
import { Router } from 'express';
import { generateBotResponse } from '../common/reply';
const Redis = require("ioredis");
require('dotenv').config();
const redis = new Redis(process.env.REDIS_URL);
const router = Router();

// Example route
router.get('/', (req, res) => {
    res.send('Welcome to API version 1');
});

// Add more routes here
router.get('/example', (req, res) => {
    res.send('This is an example route in version 1');
});


router.post('/reply', async (req, res) => {
    const { messages, domain, conversationId, timestamp, userDetails } = req.body;
    // console.log(req.body)
    try {
        // await redis.lpush('create-conv', JSON.stringify({
        //     shop: shopDomain,
        //     id: conversationId,
        //     time: timestamp
        // }));

        // await redis.lpush('create-mssg', JSON.stringify({
        //     convId: conversationId,
        //     timestamp: timestamp,
        //     sender: 'user',
        //     text: 'message'
        // }));
        console.log("befiore resp")
        const botResponse = await generateBotResponse(domain, messages);

        res.json({
            message: botResponse
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
