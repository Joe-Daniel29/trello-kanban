import axios from 'axios';

// Get the API URL from our environment variables
const API_URL = import.meta.env.VITE_API_URL || '/api/boards';

/**
 * Creates the authorization header with the user's token.
 * This is a helper function to avoid repeating code.
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
  const response = await axios.get(API_URL, config);
  return response.data;
};

/**
 * Creates a new board
 * @param {object} boardData - An object containing the board's name, e.g., { name: 'My New Board' }
 */
const createBoard = async (boardData) => {
  const config = {
    headers: getAuthHeader(),
  };
  const response = await axios.post(API_URL, boardData, config);
  return response.data;
};

const boardService = {
  getBoards,
  createBoard,
};

export default boardService;
