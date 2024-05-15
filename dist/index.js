"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const router = require("./routes/v1/reply");
var cors = require('cors');
const app = (0, express_1.default)();
app.use(cors());
app.use(express_1.default.json());
app.use('/v1', router);
app.get('/', (req, res) => {
    console.log("inside api root");
    res.json({
        "message": "status ok!!"
    });
});
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
