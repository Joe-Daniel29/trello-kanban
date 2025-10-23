import axios from './axiosConfig';

// Get the base API URL from our environment variables
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
 * Creates a new list on a specific board
 * @param {string} boardId - The ID of the board
 * @param {object} listData - An object containing the list's name, e.g., { name: 'To Do' }
 */
const updatePositions = async (boardId, positions) => {
  const response = await axios.put(
    `${API_URL}/api/boards/${boardId}/lists/reorder`,
    { positions }
  );
  return response.data;
};

const createList = async (boardId, listData) => {
  try {
    // The backend model expects 'title', but the frontend is sending 'name'.
    const formattedData = { title: listData.name };

    // Construct the proper URL with /boards/
    const response = await axios.post(
      `${API_URL}/boards/${boardId}/lists`,
      formattedData
    );

    // Ensure the response has the required fields
    if (!response.data || !response.data._id) {
      throw new Error('Invalid response from server when creating list');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

const listService = {
  createList,
  updatePositions,
};

export default listService;

