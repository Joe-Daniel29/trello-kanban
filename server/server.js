const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors'); // Import cors

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('MongoDB connection error:', err);
  // Don't exit the process in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://trello-kanban-joe.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Handle preflight requests
app.options('*', cors());

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

// API test route
app.get('/', (req, res) => {
  res.send('Kanban Board API is running!');
});

// === API Routes ===
app.use('/api/auth', require('./routes/auth'));
app.use('/api/boards', require('./routes/boards'));
// We will add more routes here (lists, tasks, etc.)

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

// Set the port
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

