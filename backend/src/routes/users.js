const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');
const { validate, userProfileSchema, changePasswordSchema } = require('../middlewares/validate');

// User profile routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, validate(userProfileSchema), userController.updateProfile);

// User search and stats
router.get('/search', auth, userController.searchUsers);
router.get('/stats', auth, userController.getUserStats);

// Account management
router.post('/change-password', auth, validate(changePasswordSchema), userController.changePassword);
router.delete('/account', auth, userController.deleteAccount);
router.post('/deactivate', auth, userController.deactivateAccount);
router.post('/reactivate', auth, userController.reactivateAccount);

// Data export
router.get('/export', auth, userController.exportData);

module.exports = router; 