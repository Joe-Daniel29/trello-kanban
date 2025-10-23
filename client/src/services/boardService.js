import axios from 'axios';

// Get the API URL from our environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
 * Fetches all boards for the current user
 */
const getBoards = async () => {
  const config = {
    headers: getAuthHeader(),
  };
  const response = await axios.get(`${API_URL}/api/boards`, config);
  return response.data;
};

/**
 * Creates a new board
 * @param {object} boardData - { name: 'My New Board' }
 */
const createBoard = async (boardData) => {
  const config = {
    headers: getAuthHeader(),
  };
  const response = await axios.post(`${API_URL}/api/boards`, boardData, config);
  return response.data;
};

/**
 * Fetches a single board by its ID, populated with lists and tasks
 * @param {string} boardId - The ID of the board
 */
const getBoardById = async (boardId) => {
  const config = {
    headers: getAuthHeader(),
  };
  // This is the new function that makes the API call
  const response = await axios.get(`${API_URL}/api/boards/${boardId}`, config);
  return response.data;
};


const boardService = {
  getBoards,
  createBoard,
  getBoardById,
};

export default boardService;

