const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Connect to MongoDB (only if not already connected)
let isConnected = false;
const connectToDB = async () => {
  if (isConnected) return;
  try {
    await connectDB();
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://trello-kanban-joe.vercel.app',
    'https://trello-kanban-backend-joe.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Handle preflight requests
app.options('*', cors());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://trello-kanban-joe.vercel.app'
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware for parsing JSON
app.use(express.json());

// Middleware to ensure database connection
app.use(async (req, res, next) => {
  try {
    await connectToDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// API test route
app.get('/', (req, res) => {
  res.send('Kanban Board API is running!');
});

// Debug route to check environment variables (remove in production)
app.get('/debug', (req, res) => {
  res.json({
    message: 'Debug info',
    hasMongoUri: !!process.env.MONGO_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
});

// === API Routes ===
app.use('/api/auth', require('../routes/auth'));
app.use('/api/boards', require('../routes/boards'));
app.use('/api/lists', require('../routes/lists'));
app.use('/api/tasks', require('../routes/tasks'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinBoard', (boardId) => {
    socket.join(boardId);
    console.log(`User ${socket.id} joined board ${boardId}`);
  });

  // Example: Listen for task movements (we will build this out later)
  socket.on('taskMove', (data) => {
    // Broadcast the move to everyone in the same board room
    io.to(data.boardId).emit('taskMoved', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    details: err
  });
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message // Temporarily show actual error message for debugging
  });
});

// Export the app for Vercel
module.exports = app;
