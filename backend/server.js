require("dotenv").config();
const express = require("express");
const app = express();
require("./config/connection");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const authenticateToken = require("./middleware/authMiddleware");
const usersRoutes = require("./routes/users");
const chatsRoutes = require("./routes/chats");
const messageRoutes = require("./routes/message");
const http = require('http');
const server = http.createServer(app);
const Chat = require("./models/chatModel");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use("/api/auth", authRoutes);

app.use(authenticateToken);
app.use("/api/users", usersRoutes);
app.use("/api/chats", chatsRoutes);
app.use('/api/messages', messageRoutes);


const PORT = process.env.PORT;

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Setup user's socket room
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });
  
  // Join chat room
  socket.on('join chat', (room) => {
    socket.join(room);
  });
  
  // Handle new message
  socket.on('new message', (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    
    if (!chat.users) return;
    
    chat.users.forEach(user => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });
  
  // Handle typing indicators
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  // socket.on('group renamed', (updatedChat) => {
  //   io.emit('group renamed', updatedChat);

  // });

  socket.on('group renamed', async (updatedChat) => {
    try {
      const fullChat = await Chat.findById(updatedChat._id)
        .populate("users", "name email pic")
        .populate("groupAdmin", "name email pic")
        .populate({
          path: "latestMessage",
          populate: { path: "sender", select: "name email pic" } 
        });
  
      io.emit('group renamed', fullChat); 
    } catch (error) {
      console.error("Error populating latestMessage:", error);
    }
  });
  
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
