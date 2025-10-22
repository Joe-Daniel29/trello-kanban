const express = require('express');
// mergeParams is crucial for accessing :boardId from the parent router
const router = express.Router({ mergeParams: true });
const { getListsForBoard, createList } = require('../controllers/lists');
const { protect } = require('../middleware/authMiddleware');

// Import task router
const taskRouter = require('./tasks');

// The protect middleware is applied in the parent router (boards.js)
// so we can apply it here again or trust the parent.
// For clarity and security, we'll protect these routes explicitly.
router.route('/').get(protect, getListsForBoard).post(protect, createList);

// Re-route into other resource routers
router.use('/:listId/tasks', taskRouter);


module.exports = router;

