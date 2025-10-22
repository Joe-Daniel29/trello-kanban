const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const List = require('../models/List');

// @desc    Get all tasks for a list
// @route   GET /api/boards/:boardId/lists/:listId/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { listId } = req.params;

  // We could add a check here to ensure the user has access to the board/list
  const tasks = await Task.find({ list: listId });

  res.status(200).json(tasks);
});

// @desc    Create a new task
// @route   POST /api/boards/:boardId/lists/:listId/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const { title } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Please add a title');
  }

  const list = await List.findById(listId);

  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }

  // We should also verify that the list belongs to the board and the user has access.
  // This will be added in a later step for simplicity.

  const task = await Task.create({
    title,
    list: listId,
    board: req.params.boardId, // Get boardId from params
  });

  res.status(201).json(task);
});

module.exports = {
  getTasks,
  createTask,
};
