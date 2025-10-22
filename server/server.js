const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const { createServer } = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 5000;

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Adjust for production
  },
});

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/boards', require('./routes/boards')); // Add this line

app.get('/', (req, res) => {
    res.send('Kanban Board API is running!');
});


// Socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

