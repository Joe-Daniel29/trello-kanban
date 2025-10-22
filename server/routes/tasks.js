const express = require('express');
// mergeParams is crucial for accessing :boardId and :listId
const router = express.Router({ mergeParams: true }); 
const { getTasks, createTask } = require('../controllers/tasks');
const { protect } = require('../middleware/authMiddleware');

// All these routes are protected
router.use(protect);

router.route('/').get(getTasks).post(createTask);

module.exports = router;
