require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: '*', // In production, replace with specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());

// Basic Route to check status
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/ai', require('./routes/ai'));

// Setup Socket.io
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`New socket connection established: ${socket.id}`);

  // Join a Session Room
  socket.on('join_room', ({ sessionId, username }) => {
    socket.join(sessionId);
    console.log(`User ${username || socket.id} joined room: ${sessionId}`);
    
    // Broadcast notification that user joined (optional)
    socket.to(sessionId).emit('user_joined', {
      user: username || 'A user',
      message: 'has joined the session room.'
    });
  });

  // Handle Real-Time Chat Message
  socket.on('send_message', async ({ sessionId, senderId, senderName, text }) => {
    try {
      if (!sessionId || !senderId || !text) {
        return console.error('Socket message validation failed: missing fields.');
      }

      // Save message in MongoDB
      const savedMessage = await Message.create({
        sessionId,
        sender: senderId,
        text
      });

      const messagePayload = {
        _id: savedMessage._id,
        sessionId,
        sender: {
          _id: senderId,
          name: senderName || 'User'
        },
        text,
        createdAt: savedMessage.createdAt
      };

      // Broadcast message to everyone in the session room
      io.to(sessionId).emit('receive_message', messagePayload);
      console.log(`Message from ${senderName} sent in room: ${sessionId}`);
    } catch (error) {
      console.error('Error saving socket message:', error);
    }
  });

  // Handle Disconnection
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Server Listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
