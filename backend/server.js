const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error: ", err));

// Message Schema aur Model
const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  author: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String, required: true },
});

const Message = mongoose.model('Message', messageSchema);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  // 🔐 Security Check: Client se aane wala token verify karenge
  const clientKey = socket.handshake.auth.token;
  const serverSecretKey = process.env.SOCKET_SECRET_KEY || "mera_secret_123"; // Render par variable set kar sakte hain

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

  // Jab message aaye, toh database me save karke baki sabko bhejo
  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
        room: data.room,
        author: data.author,
        message: data.message,
        time: data.time,
      });

      await newMessage.save();
      console.log("Message saved to DB");
    } catch (err) {
      console.log("Error saving message: ", err);
    }

    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

server.listen(3001, () => {
  console.log('SERVER RUNNING ON PORT 3001');
});