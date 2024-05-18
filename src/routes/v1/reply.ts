// src/routes/v1.ts
import { Router } from 'express';
import { generateBotResponse } from '../../common/reply';
const Redis = require("ioredis");
require('dotenv').config();
const redis = new Redis(process.env.REDIS_URL);
const router = Router();
const express = require("express")
router.use(express.json())

// Example route
router.get('/', (req, res) => {
    res.send('Welcome to API version 1');
});

// Add more routes here
router.get('/example', (req, res) => {
    res.send('This is an example route in version 1');
});


module.exports = router