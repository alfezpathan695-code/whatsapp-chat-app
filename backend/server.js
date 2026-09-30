const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  // 🔐 Security Check: Client se aane wala secret key verify karenge
  const clientKey = socket.handshake.auth.token;
  const serverSecretKey = process.env.SOCKET_SECRET_KEY || "Alfejpathan@dooper.in"; // Render par set ki gayi key

  if (clientKey !== serverSecretKey) {
    console.log(`Unauthorized connection blocked from socket ID: ${socket.id}`);
    socket.disconnect(true); // Turant connection kaat do
    return;
  }

  console.log(`Secure User Connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  // Bina database ke seedha message baki users ko emit kar do
  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

server.listen(3001, () => {
  console.log('SERVER RUNNING ON PORT 3001');
});