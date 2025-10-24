    const express = require('express');
    const router = express.Router();
    const {
    getBoards,
    createBoard,
    getBoardById,
    } = require('../controllers/boards');
    const { moveTask } = require('../controllers/tasks');
    const { protect } = require('../middleware/authMiddleware');

    // Import the list router
    const listRouter = require('./lists');

    router.route('/').get(protect, getBoards).post(protect, createBoard);
    router.route('/:id').get(protect, getBoardById);
    
    // Move task route
    router.route('/:boardId/tasks/:taskId/move').put(protect, moveTask);

    // This line tells Express to use the listRouter for any requests
    // that match the pattern /api/boards/:boardId/lists
    router.use('/:boardId/lists', listRouter);

    module.exports = router;

