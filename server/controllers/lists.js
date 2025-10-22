const asyncHandler = require('express-async-handler');
const List = require('../models/List');
const Board = require('../models/Board');

// @desc    Get all lists for a specific board
// @route   GET /api/boards/:boardId/lists
// @access  Private
const getListsForBoard = asyncHandler(async (req, res) => {
  // Ensure the board exists and belongs to the user
  const board = await Board.findById(req.params.boardId);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  // Check if the board belongs to the logged-in user
  if (board.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const lists = await List.find({ board: req.params.boardId });
  res.status(200).json(lists);
});

// @desc    Create a new list for a board
// @route   POST /api/boards/:boardId/lists
// @access  Private
const createList = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { boardId } = req.params;

  if (!name) {
    res.status(400);
    throw new Error('Please provide a name for the list');
  }
  
  // Check that the parent board exists and belongs to the user
  const board = await Board.findById(boardId);
  if (!board || board.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const list = await List.create({
    name,
    board: boardId,
  });

  res.status(201).json(list);
});

module.exports = {
  getListsForBoard,
  createList,
};
