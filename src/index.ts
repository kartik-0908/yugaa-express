// src/app.ts
import express from 'express';
import http from 'http'; // Import the HTTP module
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.IO
import { reply } from './common/reply';

const router  = require("./routes/v1/reply")
const webhookRouter  = require("./routes/webhooks")
var cors = require('cors')
const app = express();

app.use(cors())
app .use('/webhooks', webhookRouter)
app.use('/v1', router);


app.get('/',(req,res)=>{
    console.log("inside api root")
    res.json({
        "message": "status ok!!"
    })
})

const port = 3000;
const server = http.createServer(app); // Create an HTTP server
const io = new SocketIOServer(server, {
    cors: {
        origin: '*', // You can specify the allowed origins here
        methods: ['GET', 'POST'],
    }
}); // Create a new instance of Socket.IO with CORS configuration

// Define your WebSocket events
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('clientType', (data) => {
        const { type, merchantId } = data;
        if (type === 'endUser') {
            const roomName = `room-${socket.id}`;
            socket.join(roomName);
            console.log(`End user connected and joined room: ${roomName}`);
            socket.emit('roomAssigned', { roomName });
            // Add logic to interact with AI here
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
        const { roomName, messages, shopifyDomain, conversationId, userInfo, timestamp } = data;
        // Process the message and get AI reply
        const replyMessage = await reply(messages, shopifyDomain, conversationId,timestamp, userInfo, io); // Replace with your AI processing logic
        console.log(roomName)
        console.log(replyMessage)
        io.in(roomName).emit('receiveMessage', { sender: 'bot', message: replyMessage });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // Example of a custom event
    socket.on('message', (msg) => {
        console.log('message: ' + msg);
        io.emit('message', msg); // Broadcast the message to all connected clients
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});