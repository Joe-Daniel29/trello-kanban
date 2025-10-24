const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const List = require('../models/List');

// @desc    Create a new task
// @route   POST /api/boards/:boardId/lists/:listId/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const { listId, boardId } = req.params; // Get boardId from params

  if (!title) {
    res.status(400);
    throw new Error('Please provide a title for the task');
  }

  // Get the highest position in the list
  const lastTask = await Task.findOne({ list: listId })
    .sort('-position')
    .limit(1);
  
  const position = lastTask ? lastTask.position + 1000 : 0; // Use larger increments for easier reordering

  // Create the new task
  const task = await Task.create({
    title,
    list: listId,
    board: boardId,
    user: req.user.id,
    position,
    isCompleted: false // Explicitly set initial state
  });

  // Add the task's ID to the parent list's tasks array
  await List.findByIdAndUpdate(listId, {
    $push: { tasks: task._id },
  });

  // Fetch the populated task to return
  const populatedTask = await Task.findById(task._id).populate('user');
  res.status(201).json(populatedTask);
});

// @desc    Update a task
// @route   PUT /api/boards/:boardId/lists/:listId/tasks/:taskId
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, isCompleted } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if the task's user matches the requesting user
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // Update task fields
  if (title !== undefined) {
    task.title = title;
  }
  
  // Explicitly handle the toggle
  if (isCompleted !== undefined) {
    task.isCompleted = isCompleted;
  }

  const updatedTask = await task.save();
  
  // Return populated task
  const populatedTask = await Task.findById(updatedTask._id).populate('user');
  res.status(200).json(updatedTask);
});

// @desc    Reorder tasks in a list
// @route   PUT /api/boards/:boardId/lists/:listId/tasks/reorder
// @access  Private
const updateTaskPositions = asyncHandler(async (req, res) => {
  const { listId, boardId } = req.params;
  const { positions } = req.body;

  if (!positions || !Array.isArray(positions)) {
    res.status(400);
    throw new Error('Positions array is required');
  }

  try {
    // Calculate new positions with large gaps between them
    const tasksToUpdate = positions.map(({ taskId, position }, index) => ({
      taskId,
      position: (index + 1) * 1000  // Create gaps of 1000 between positions
    }));

    // Update positions in parallel
    await Promise.all(
      tasksToUpdate.map(({ taskId, position }) =>
        Task.findOneAndUpdate(
          { _id: taskId, list: listId, board: boardId },
          { $set: { position } },
          { new: true }
        )
      )
    );

    // Get all tasks in new order
    const tasks = await Task.find({ list: listId, board: boardId })
      .sort('position');

    res.json(tasks);
  } catch (error) {
    console.error('Error updating task positions:', error);
    res.status(500);
    throw new Error('Failed to update task positions');
  }
});

// @desc    Move a task from one list to another
// @route   PUT /api/boards/:boardId/tasks/:taskId/move
// @access  Private
const moveTask = asyncHandler(async (req, res) => {
  const { boardId, taskId } = req.params;
  const { fromListId, toListId, position } = req.body;

  if (!fromListId || !toListId) {
    res.status(400);
    throw new Error('fromListId and toListId are required');
  }

  // Find the task
  const task = await Task.findById(taskId);
  
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if task belongs to the board
  if (task.board.toString() !== boardId) {
    res.status(400);
    throw new Error('Task does not belong to this board');
  }

  // Check if task belongs to the source list
  if (task.list.toString() !== fromListId) {
    res.status(400);
    throw new Error('Task does not belong to the source list');
  }

  // Check if the task's user matches the requesting user
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // Verify both lists exist and belong to the board
  const [sourceList, targetList] = await Promise.all([
    List.findById(fromListId),
    List.findById(toListId)
  ]);

  if (!sourceList || !targetList) {
    res.status(404);
    throw new Error('Source or target list not found');
  }

  if (sourceList.board.toString() !== boardId || targetList.board.toString() !== boardId) {
    res.status(400);
    throw new Error('Lists do not belong to this board');
  }

  // Remove task from source list
  await List.findByIdAndUpdate(fromListId, {
    $pull: { tasks: taskId }
  });

  // Add task to target list
  await List.findByIdAndUpdate(toListId, {
    $push: { tasks: taskId }
  });

  // Update task's list and position
  const newPosition = position !== undefined ? position : 0;
  await Task.findByIdAndUpdate(taskId, {
    list: toListId,
    position: newPosition
  });

  // Get the updated task
  const updatedTask = await Task.findById(taskId);
  
  res.json(updatedTask);
});

module.exports = {
  createTask,
  updateTask,
  updateTaskPositions,
  moveTask
};

