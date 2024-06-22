import express from 'express';
import http from 'http'; // Import the HTTP module
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.IO
// import { reply } from './common/reply';
// import { getPreviousMessages } from './common/user';
const app = express();
const v1router = require("./routes/v1/routes")
const webhookRouter = require("./routes/webhooks/routes")
// const emailRouter = require("./routes/email")
var cors = require('cors')
app.use(cors())
app.use('/webhooks', webhookRouter)
// app.use('/email', emailRouter)
app.use('/v1', v1router);


app.get('/', async (req, res) => {
    console.log("inside api root")
    res.json({
        "message": "status ok"
    })
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
        const { ticketId, roomName, messages, shopifyDomain, conversationId, userInfo, timestamp } = data;
        // Process the message and get AI reply
        io.in(conversationId).emit('status', { status: 'understanding' });
        // const replyMessage = await reply(ticketId,messages, shopifyDomain, conversationId, timestamp, userInfo, io); // Replace with your AI processing logic
        // io.in(roomName).emit('receiveMessage', { sender: 'bot', message: replyMessage });
    });

    socket.on('getPreviousMessages', async (data) => {
        const { ticketId } = data;
        console.log(`Fetching previous messages for ticket ID: ${ticketId}`);

        // const previousMessages = await getPreviousMessages(ticketId);

        // const formattedMessages = previousMessages.map(message => ({
        //     sender: message.senderType === 'user' ? 'user' : 'bot',
        //     message: message.text,
        //     timeStamp: message.timestamp
        // }));
        // socket.emit('previousMessages', { prevMessages: formattedMessages });
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