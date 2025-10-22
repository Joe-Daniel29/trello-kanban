const express = require('express');
const router = express.Router();
const { getBoards, createBoard } = require('../controllers/boards');
const { protect } = require('../middleware/authMiddleware');

// Re-route into other resource routers
const listRouter = require('./lists');
router.use('/:boardId/lists', listRouter);

// All routes here are protected
router.route('/').get(protect, getBoards).post(protect, createBoard);

module.exports = router;

