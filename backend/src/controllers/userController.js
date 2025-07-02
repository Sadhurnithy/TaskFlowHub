const { catchAsync } = require('../utils/error');
const userService = require('../services/userService');

const getProfile = catchAsync(async (req, res) => {
  const { user } = req;
  
  const userProfile = await userService.getUserById(user._id);
  
  res.status(200).json({
    success: true,
    data: userProfile.fullProfile
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const { user } = req;
  const updateData = req.body;
  
  const updatedProfile = await userService.updateUserProfile(user._id, updateData);
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedProfile
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { user } = req;
  const { currentPassword, newPassword } = req.body;
  
  await userService.changePassword(user._id, currentPassword, newPassword);
  
  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

const deleteAccount = catchAsync(async (req, res) => {
  const { user } = req;
  
  await userService.deleteUser(user._id);
  
  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

const exportData = catchAsync(async (req, res) => {
  const { user } = req;
  
  const exportData = await userService.exportUserData(user._id);
  
  res.status(200).json({
    success: true,
    data: exportData
  });
});

const searchUsers = catchAsync(async (req, res) => {
  const { user } = req;
  const { q, limit } = req.query;
  
  const users = await userService.searchUsers(q, user._id, parseInt(limit) || 10);
  
  res.status(200).json({
    success: true,
    data: users
  });
});

const getUserStats = catchAsync(async (req, res) => {
  const { user } = req;
  
  const stats = await userService.getUserStats(user._id);
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

const deactivateAccount = catchAsync(async (req, res) => {
  const { user } = req;
  
  const result = await userService.deactivateUser(user._id);
  
  res.status(200).json({
    success: true,
    message: result.message
  });
});

const reactivateAccount = catchAsync(async (req, res) => {
  const { user } = req;
  
  const result = await userService.reactivateUser(user._id);
  
  res.status(200).json({
    success: true,
    message: result.message
  });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  exportData,
  searchUsers,
  getUserStats,
  deactivateAccount,
  reactivateAccount
}; 