const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyGoogleToken } = require('../config/oauth');
const { createError } = require('../utils/error');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw createError('Invalid token', 401);
  }
};

const authenticateWithGoogle = async (idToken) => {
  try {
    // Verify Google token
    const googleUser = await verifyGoogleToken(idToken);
    
    if (!googleUser.emailVerified) {
      throw createError('Email not verified with Google', 400);
    }

    // Find or create user
    let user = await User.findByGoogleId(googleUser.googleId);
    
    if (!user) {
      // Check if user exists with same email
      user = await User.findByEmail(googleUser.email);
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleUser.googleId;
        user.picture = googleUser.picture;
        await user.save();
      } else {
        // Create new user
        user = new User({
          googleId: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture
        });
        await user.save();
      }
    } else {
      // Update existing user info
      user.name = googleUser.name;
      user.picture = googleUser.picture;
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);
    
    return {
      user: user.fullProfile,
      token
    };
  } catch (error) {
    throw error;
  }
};

const refreshToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw createError('User not found or inactive', 401);
  }

  const token = generateToken(user._id);
  return {
    user: user.fullProfile,
    token
  };
};

const logout = async (userId) => {
  // In a more complex system, you might want to blacklist the token
  // For now, we'll just return success
  return { message: 'Logged out successfully' };
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateWithGoogle,
  refreshToken,
  logout
}; 