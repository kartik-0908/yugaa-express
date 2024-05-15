"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/v1.ts
const express_1 = require("express");
const reply_1 = require("../../common/reply");
const Redis = require("ioredis");
require('dotenv').config();
const webhookRouter = require("./webhooks");
const redis = new Redis(process.env.REDIS_URL);
const router = (0, express_1.Router)();
router.use('/webhooks', webhookRouter);
// Example route
router.get('/', (req, res) => {
    res.send('Welcome to API version 1');
});
// Add more routes here
router.get('/example', (req, res) => {
    res.send('This is an example route in version 1');
});
router.post('/reply', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messages, domain, conversationId, timestamp, userDetails } = req.body;
    // console.log(req.body)
    try {
        yield redis.lpush('create-conv', JSON.stringify({
            shop: domain,
            id: conversationId,
            time: timestamp
        }));
        yield redis.lpush('create-mssg', JSON.stringify({
            convId: conversationId,
            timestamp: timestamp,
            sender: 'user',
            text: messages[messages.length - 1][1]
        }));
        const botResponse = yield (0, reply_1.generateBotResponse)(domain, messages);
        yield redis.lpush('create-mssg', JSON.stringify({
            convId: conversationId,
            timestamp: new Date(),
            sender: 'bot',
            text: botResponse
        }));
        res.json({
            message: botResponse
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
module.exports = router;
