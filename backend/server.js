const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose'); // 1. Mongoose import kiya

const app = express();
app.use(cors());

// 2. MongoDB Connection (Jo aapne Render me MONGO_URI set kiya hai, yeh wahan se utha lega)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error: ", err));

// 3. Message ka Schema aur Model banaya
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
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  // 4. Jab message aaye, toh use database me save karke fir baki sabko bhejo
  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
        room: data.room,
        author: data.author,
        message: data.message,
        time: data.time,
      });

      await newMessage.save(); // Database me save ho gaya!
      console.log("Message saved to DB");
    } catch (err) {
      console.log("Error saving message: ", err);
    }

    // Dusre users ko message emit kar do
    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

server.listen(3001, () => {
  console.log('SERVER RUNNING ON PORT 3001');
});