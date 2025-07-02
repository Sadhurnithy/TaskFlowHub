const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

// Apply rate limiting to auth routes
router.use(authLimiter);

// Authentication routes
router.post('/google', authController.loginWithGoogle);
router.post('/refresh', auth, authController.refreshToken);
router.get('/profile', auth, authController.getProfile);
router.post('/logout', auth, authController.logout);

module.exports = router; 