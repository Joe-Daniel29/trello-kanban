const asyncHandler = require('express-async-handler');
const Board = require('../models/Board');
const List = require('../models/List');
// This is the new line that fixes the error
// By importing the Task model, we register it with Mongoose
const Task = require('../models/Task'); 

// @desc    Get all boards for a user
// @route   GET /api/boards
// @access  Private
const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({ user: req.user.id });
  res.status(200).json(boards);
});

// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
const createBoard = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Please provide a name for the board');
  }

  const board = await Board.create({
    user: req.user.id,
    name,
  });

  res.status(201).json(board);
});

// @desc    Get a single board by ID with all its lists and tasks
// @route   GET /api/boards/:id
// @access  Private
const getBoardById = asyncHandler(async (req, res) => {
  // First get the board
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  // Check if the user owns the board
  if (board.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // Then get lists sorted by position and populate tasks with sorting (exclude archived lists)
  const lists = await List.find({ board: req.params.id, isArchived: false })
    .sort('position')
    .populate({
      path: 'tasks',
      options: { sort: { position: 1 } } // Sort tasks by position in ascending order
    });

  // Attach sorted lists to board
  const boardWithLists = {
    ...board.toObject(),
    lists: lists
  };

  res.status(200).json(boardWithLists);
});

module.exports = {
  getBoards,
  createBoard,
  getBoardById,
};

