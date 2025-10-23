import axios from './axiosConfig';

// Get the API URL from our environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Creates the authorization header with the user's token.
 */
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
};

/**
 * Creates a new task.
 * @param {string} boardId - The ID of the board.
 * @param {string} listId - The ID of the list.
 * @param {object} taskData - An object containing the task's title, e.g., { title: 'New Task' }
 */
const createTask = async (boardId, listId, taskData) => {
  const config = {
    headers: getAuthHeader(),
  };
  // We send { title: ... } but our controller is expecting { title: ... }
  // So this is a 1:1 match, no transformation needed.
  const response = await axios.post(
    `${API_URL}/boards/${boardId}/lists/${listId}/tasks`,
    taskData,
    config
  );
  return response.data;
};

// --- NEW FUNCTION ---
/**
 * Updates an existing task.
 * @param {string} boardId - The ID of the board.
 * @param {string} listId - The ID of the list.
 * @param {string} taskId - The ID of the task to update.
 * @param {object} taskData - An object with the fields to update, e.g., { isCompleted: true }
 */
const updateTask = async (boardId, listId, taskId, taskData) => {
  const config = {
    headers: getAuthHeader(),
  };
  const response = await axios.put(
    `${API_URL}/boards/${boardId}/lists/${listId}/tasks/${taskId}`,
    taskData,
    config
  );
  return response.data;
};
// --- --- --- --- ---

/**
 * Updates the positions of tasks within a list
 * @param {string} boardId - The ID of the board
 * @param {string} listId - The ID of the list containing the tasks
 * @param {Array} positions - Array of {taskId, position} objects
 */
const updatePositions = async (boardId, listId, positions) => {
  const config = {
    headers: getAuthHeader(),
  };
  const response = await axios.put(
    `${API_URL}/boards/${boardId}/lists/${listId}/tasks/reorder`,
    { positions },
    config
  );
  return response.data;
};

const taskService = {
  createTask,
  updateTask,
  updatePositions,
};

export default taskService;

