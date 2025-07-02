const { catchAsync } = require('../utils/error');
const authService = require('../services/authService');
const { sendWelcomeEmail } = require('../utils/email');

const loginWithGoogle = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  
  if (!idToken) {
    return res.status(400).json({ message: 'Google ID token is required' });
  }

  const result = await authService.authenticateWithGoogle(idToken);
  
  // Send welcome email for new users (optional)
  if (result.user.createdAt === result.user.updatedAt) {
    await sendWelcomeEmail(result.user.email, result.user.name);
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { userId } = req.user;
  
  const result = await authService.refreshToken(userId);
  
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result
  });
});

const logout = catchAsync(async (req, res) => {
  const { userId } = req.user;
  
  await authService.logout(userId);
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

const getProfile = catchAsync(async (req, res) => {
  const { user } = req;
  
  res.status(200).json({
    success: true,
    data: user.fullProfile
  });
});

module.exports = {
  loginWithGoogle,
  refreshToken,
  logout,
  getProfile
}; 