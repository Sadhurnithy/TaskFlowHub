const jwt = require('jsonwebtoken');
const { createError } = require('../utils/error');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(createError('Access denied. No token provided.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-__v');
    
    if (!user) {
      return next(createError('Invalid token. User not found.', 401));
    }

    if (!user.isActive) {
      return next(createError('Account is deactivated.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError('Invalid token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(createError('Token expired.', 401));
    }
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-__v');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};

module.exports = { auth, optionalAuth }; 