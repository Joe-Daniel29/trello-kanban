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

// @desc    Archive a list
// @route   PUT /api/boards/:boardId/lists/:listId/archive
// @access  Private
const archiveList = asyncHandler(async (req, res) => {
  const { boardId, listId } = req.params;

  // Find the list
  const list = await List.findById(listId);
  
  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }

  // Check if list belongs to the board
  if (list.board.toString() !== boardId) {
    res.status(400);
    throw new Error('List does not belong to this board');
  }

  // Find the board to check ownership
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

  // Mark the list as archived instead of deleting
  list.isArchived = true;
  await list.save();

  res.json({ message: 'List archived successfully', list });
});

// @desc    Get archived lists for a board
// @route   GET /api/boards/:boardId/lists/archived
// @access  Private
const getArchivedLists = asyncHandler(async (req, res) => {
  const { boardId } = req.params;

  // Find the board to check ownership
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

  // Get all archived lists for this board
  const archivedLists = await List.find({ 
    board: boardId, 
    isArchived: true 
  }).populate('tasks').sort('-updatedAt');

  res.json(archivedLists);
});

// @desc    Unarchive a list
// @route   PUT /api/boards/:boardId/lists/:listId/unarchive
// @access  Private
const unarchiveList = asyncHandler(async (req, res) => {
  const { boardId, listId } = req.params;

  // Find the list
  const list = await List.findById(listId);
  
  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }

  // Check if list belongs to the board
  if (list.board.toString() !== boardId) {
    res.status(400);
    throw new Error('List does not belong to this board');
  }

  // Find the board to check ownership
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

  // Unarchive the list
  list.isArchived = false;
  await list.save();

  // Populate tasks before sending response
  await list.populate('tasks');

  res.json({ message: 'List unarchived successfully', list });
});

// @desc    Permanently delete a list
// @route   DELETE /api/boards/:boardId/lists/:listId
// @access  Private
const deleteList = asyncHandler(async (req, res) => {
  const { boardId, listId } = req.params;

  // Find the list
  const list = await List.findById(listId);
  
  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }

  // Check if list belongs to the board
  if (list.board.toString() !== boardId) {
    res.status(400);
    throw new Error('List does not belong to this board');
  }

  // Find the board to check ownership
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

  // Remove the list from the board's lists array
  board.lists = board.lists.filter(id => id.toString() !== listId);
  await board.save();

  // Delete the list permanently
  await List.findByIdAndDelete(listId);

  res.json({ message: 'List deleted permanently' });
});

// @desc    Delete all archived lists for a board
// @route   DELETE /api/boards/:boardId/lists/archived
// @access  Private
const deleteAllArchivedLists = asyncHandler(async (req, res) => {
  const { boardId } = req.params;

  // Find the board to check ownership
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

  // Find all archived lists for this board
  const archivedLists = await List.find({ 
    board: boardId, 
    isArchived: true 
  });

  // Remove archived lists from board's lists array
  const archivedListIds = archivedLists.map(list => list._id.toString());
  board.lists = board.lists.filter(id => !archivedListIds.includes(id.toString()));
  await board.save();

  // Delete all archived lists
  await List.deleteMany({ 
    board: boardId, 
    isArchived: true 
  });

  res.json({ message: 'All archived lists deleted permanently', count: archivedLists.length });
});

module.exports = {
  createList,
  updateListPositions,
  archiveList,
  getArchivedLists,
  unarchiveList,
  deleteList,
  deleteAllArchivedLists
};

