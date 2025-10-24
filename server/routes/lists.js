const express = require('express');
const router = express.Router({ mergeParams: true });
const { createList, updateListPositions, archiveList, getArchivedLists, unarchiveList, deleteList, deleteAllArchivedLists } = require('../controllers/lists');
const { protect } = require('../middleware/authMiddleware');

// Import the new task router
const taskRouter = require('./tasks');

// List routes
router.route('/').post(protect, createList);
router.route('/reorder').put(protect, updateListPositions);
router.route('/archived').get(protect, getArchivedLists).delete(protect, deleteAllArchivedLists);
router.route('/:listId/archive').put(protect, archiveList);
router.route('/:listId/unarchive').put(protect, unarchiveList);
router.route('/:listId').delete(protect, deleteList);

// Nested task routes
router.use('/:listId/tasks', taskRouter);
// --- --- --- --- ---

module.exports = router;

