const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/authMiddleware'); // Import the middleware

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe); // Protect this route

module.exports = router;

