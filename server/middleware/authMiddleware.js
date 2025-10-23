const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc Protects routes by verifying JWT
 * Attaches the user object to the request `req.user`
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the token is in the Authorization header and starts with 'Bearer'
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    res.status(401);
    throw new Error('Access denied. No token provided.');
  }

  try {
    // Get token from header (e.g., "Bearer <token>")
    token = req.headers.authorization.split(' ')[1];

    // Verify the token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the ID from the token
    // We select '-password' to exclude the password hash from the req.user object
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    req.user = user;
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }

  // If no token is found at all
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };

