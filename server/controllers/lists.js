const asyncHandler = require('express-async-handler');
const Board = require('../models/Board');
const List = require('../models/List');

// @desc    Update list positions
// @route   PUT /api/boards/:boardId/lists/reorder
// @access  Private
const updateListPositions = asyncHandler(async (req, res) => {
  const { positions } = req.body; // Array of { listId, position }
  const { boardId } = req.params;

  // Update positions in parallel
  await Promise.all(
    positions.map(({ listId, position }) =>
      List.findOneAndUpdate(
        { _id: listId, board: boardId },
        { $set: { position } },
        { new: true }
      )
    )
  );

  // Get all lists in new order
  const lists = await List.find({ board: boardId })
    .sort('position')
    .populate('tasks');

  res.json(lists);
});

const createList = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const { boardId } = req.params;

  if (!title) {
    res.status(400);
    throw new Error('Please provide a title for the list');
  }

  // Find the board to associate the list with
  const board = await Board.findById(boardId);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  // Check if board belongs to the user
  if (board.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // Get the highest position in the board
  const lastList = await List.findOne({ board: boardId })
    .sort('-position')
    .limit(1);
  
  const position = lastList ? lastList.position + 1 : 0;

  // Create the new list
  let list = await List.create({
    title,
    board: boardId,
    tasks: [],
    position,
  });

  // Add the new list's ID to the board's lists array
  board.lists.push(list._id);
  await board.save();

  // Populate the tasks before sending the response
  list = await List.findById(list._id).populate('tasks');

  res.status(201).json(list);
});

module.exports = {
  createList,
  updateListPositions
};

