import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
require('dotenv').config();
const app = express();
const v1router = require("./routes/v1/routes")
const webhookRouter = require("./routes/webhooks/routes")
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { publishShopifyStoreProcessData } from './common/pubsubPublisher';
import { getPreviousMessages } from './common/user';
import { db } from './common/db';
import { replytriaal } from './common/reply.js';
// const emailRouter = require("./routes/email")
var cors = require('cors')
app.use(cors())
app.use('/webhooks', webhookRouter)
// app.use('/email', emailRouter)
app.use('/v1', v1router);


app.get('/', async (req, res) => {
    // await publishShopifyStoreProcessData("may15ka.myshopify.com")
    // await replytriaal();
    console.log("inside api root")
    console.log(process.env.AZURE_OPENAI_API_KEY)

    // await sendInitialEmail()
    try {
        res.json({
            "message": "status ok"
        })
    } catch (error) {
        console.log(error);
        res.json({

            "message": "error"
        })
    }

})

app.get('/check', async (req, res) => {
    console.log("inside check root")
    console.log("process.env.hi")
    console.log(process.env.hi)
    console.log("process.env.hi_env")
    console.log(process.env.hi_env)
    console.log(process.env.DATABASE_URL)
    res.json({
        "message": "status ok inside check"
    })
})

const port = 3001;
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('clientType', (data) => {
        const { type, merchantId } = data;
        if (type === 'endUser') {
            const roomName = `room-${socket.id}`;
            socket.join(roomName);
            console.log(`End user connected and joined room: ${roomName}`);
            socket.emit('roomAssigned', { roomName });
        } else if (type === 'merchant') {
            const roomName = `merchant-${merchantId}`;
            socket.join(roomName);
            console.log(`Merchant connected and joined room: ${roomName}`);

            // Join all end user rooms for this merchant
            const endUserRooms = Array.from(socket.rooms).filter(room => room.startsWith('room-'));
            endUserRooms.forEach(room => {
                io.sockets.sockets.get(socket.id)?.join(room);
            });
        }
    });

    socket.on('sendMessage', async (data) => {
        const { ticketId, roomName, message, shopifyDomain, userInfo, timestamp } = data;
        // io.in(conversationId).emit('status', { status: 'understanding' });
        console.log(message)
        await replytriaal( ticketId, message, shopifyDomain, io, roomName,false)
        // io.in(roomName).emit('receiveMessage', { sender: 'bot', message: replyMessage });
    });
    socket.on('ticketEscalate', async (data) => {
        const { ticketId, roomName, email, shopifyDomain } = data;
        // io.in(conversationId).emit('status', { status: 'understanding' });
        // console.log(message)
        await replytriaal(ticketId, "", shopifyDomain, io, roomName, true, email)
        // io.in(roomName).emit('receiveMessage', { sender: 'bot', message: replyMessage });
    });

    socket.on('getPreviousMessages', async (data) => {
        const { ticketId } = data;
        console.log(`Fetching previous messages for ticket ID: ${ticketId}`);
        const previousMessages = await getPreviousMessages(ticketId);
        const formattedMessages = previousMessages.map(message => ({
            sender: message.sender,
            message: message.message,
            timeStamp: message.createdAt
        }));
        // console.log(formattedMessages)
        socket.emit('previousMessages', { prevMessages: formattedMessages });
    });
    socket.on('create-ticket', async (data) => {
        const { ticketId } = data;
        console.log(`Createing ticket ID: ${ticketId}`);
        const resp = await db.aIConversationTicket.findUnique({
            where: {
                id: ticketId
            }
        })
        if (!resp) {
            await db.aIConversationTicket.create({
                data: {
                    id: ticketId
                }
            })
        }

    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('message', (msg) => {
        console.log('message: ' + msg);
        io.emit('message', msg);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});