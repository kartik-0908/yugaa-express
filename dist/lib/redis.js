"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL || "");
exports.default = redis;
