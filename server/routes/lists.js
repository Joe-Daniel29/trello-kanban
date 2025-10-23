const express = require('express');
const router = express.Router({ mergeParams: true });
const { createList, updateListPositions } = require('../controllers/lists');
const { protect } = require('../middleware/authMiddleware');

// Import the new task router
const taskRouter = require('./tasks');

// List routes
router.route('/').post(protect, createList);
router.route('/reorder').put(protect, updateListPositions);

// Nested task routes
router.use('/:listId/tasks', taskRouter);
// --- --- --- --- ---

module.exports = router;

