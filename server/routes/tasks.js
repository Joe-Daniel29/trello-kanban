const express = require('express');

// We MUST set mergeParams: true for the router to access :listId
const router = express.Router({ mergeParams: true });

const { createTask, updateTask, updateTaskPositions } = require('../controllers/tasks');
const { protect } = require('../middleware/authMiddleware');

// This route handles POST requests to /api/boards/:boardId/lists/:listId/tasks
router.route('/').post(protect, createTask);

// This route handles PUT requests to /api/boards/:boardId/lists/:listId/tasks/reorder
// Put more specific routes before parameter routes
router.route('/reorder').put(protect, updateTaskPositions);

// This route handles PUT requests to /api/boards/:boardId/lists/:listId/tasks/:taskId
router.route('/:taskId').put(protect, updateTask);

module.exports = router;

