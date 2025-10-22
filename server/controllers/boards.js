const asyncHandler = require('express-async-handler');
const Board = require('../models/Board');
const User = require('../models/User');

// @desc    Get all boards for a user
// @route   GET /api/boards
// @access  Private
const getBoards = asyncHandler(async (req, res) => {
  // We get the user from the protect middleware (req.user)
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
    throw new Error('Please add a name for the board');
  }

  const board = await Board.create({
    name,
    user: req.user.id, // Associate board with the logged-in user
  });

  res.status(201).json(board);
});

module.exports = {
  getBoards,
  createBoard,
};
