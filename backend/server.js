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
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
