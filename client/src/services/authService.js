import axios from './axiosConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AUTH_URL = `${API_URL}/auth`;

// Register user
const register = async (userData) => {
  const response = await axios.post(`${AUTH_URL}/register`, userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${AUTH_URL}/login`, userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get current user from localStorage
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;

