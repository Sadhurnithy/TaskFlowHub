const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');
const { createError } = require('../utils/error');

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-__v');
  
  if (!user) {
    throw createError('User not found', 404);
  }
  
  return user;
};

const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw createError('User not found', 404);
  }
  
  // Allow updating specific fields
  const allowedFields = ['name', 'email', 'timezone', 'notifications', 'preferences'];
  const filteredData = {};
  
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });
  
  // Check if email is being updated and if it's already taken by another user
  if (filteredData.email && filteredData.email !== user.email) {
    const existingUser = await User.findOne({ email: filteredData.email, _id: { $ne: userId } });
    if (existingUser) {
      throw createError('Email is already taken', 400);
    }
  }
  
  Object.assign(user, filteredData);
  await user.save();
  
  return user.fullProfile;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw createError('User not found', 404);
  }
  
  // For OAuth users, they might not have a password
  if (!user.password) {
    throw createError('Password change not available for OAuth accounts', 400);
  }
  
  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw createError('Current password is incorrect', 400);
  }
  
  // Hash new password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  
  user.password = hashedPassword;
  await user.save();
  
  return { message: 'Password changed successfully' };
};

const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw createError('User not found', 404);
  }
  
  // Delete all tasks owned by the user
  await Task.deleteMany({ owner: userId });
  
  // Remove user from shared tasks
  await Task.updateMany(
    { 'sharedWith.user': userId },
    { $pull: { sharedWith: { user: userId } } }
  );
  
  // Delete the user
  await User.findByIdAndDelete(userId);
  
  return { message: 'Account deleted successfully' };
};

const exportUserData = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw createError('User not found', 404);
  }
  
  // Get all tasks owned by the user
  const ownedTasks = await Task.find({ owner: userId }).populate('owner', 'name email');
  
  // Get all tasks shared with the user
  const sharedTasks = await Task.find({ 'sharedWith.user': userId }).populate('owner', 'name email');
  
  const exportData = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      timezone: user.timezone,
      notifications: user.notifications,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    },
    tasks: {
      owned: ownedTasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        tags: task.tags,
        isPublic: task.isPublic,
        sharedWith: task.sharedWith,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt
      })),
      shared: sharedTasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        tags: task.tags,
        isPublic: task.isPublic,
        owner: task.owner,
        sharedWith: task.sharedWith,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt
      }))
    },
    stats: {
      totalOwnedTasks: ownedTasks.length,
      totalSharedTasks: sharedTasks.length,
      completedTasks: ownedTasks.filter(task => task.status === 'completed').length,
      overdueTasks: ownedTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
      ).length
    },
    exportDate: new Date().toISOString()
  };
  
  return exportData;
};

const searchUsers = async (searchTerm, currentUserId, limit = 10) => {
  if (!searchTerm || searchTerm.length < 2) {
    throw createError('Search term must be at least 2 characters', 400);
  }
  
  const users = await User.find({
    $and: [
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      },
      { _id: { $ne: currentUserId } },
      { isActive: true }
    ]
  })
  .select('name email picture')
  .limit(limit);
  
  return users;
};

const getUserStats = async (userId) => {
  const stats = await User.aggregate([
    {
      $match: { _id: userId }
    },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'owner',
        as: 'ownedTasks'
      }
    },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'sharedWith.user',
        as: 'sharedTasks'
      }
    },
    {
      $project: {
        totalOwnedTasks: { $size: '$ownedTasks' },
        totalSharedTasks: { $size: '$sharedTasks' },
        completedTasks: {
          $size: {
            $filter: {
              input: '$ownedTasks',
              cond: { $eq: ['$$this.status', 'completed'] }
            }
          }
        },
        overdueTasks: {
          $size: {
            $filter: {
              input: '$ownedTasks',
              cond: {
                $and: [
                  { $lt: ['$$this.dueDate', new Date()] },
                  { $ne: ['$$this.status', 'completed'] }
                ]
              }
            }
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOwnedTasks: 0,
    totalSharedTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  };
};

const deactivateUser = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw createError('User not found', 404);
  }
  
  user.isActive = false;
  await user.save();
  
  return { message: 'User deactivated successfully' };
};

const reactivateUser = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw createError('User not found', 404);
  }
  
  user.isActive = true;
  await user.save();
  
  return { message: 'User reactivated successfully' };
};

module.exports = {
  getUserById,
  updateUserProfile,
  searchUsers,
  getUserStats,
  deactivateUser,
  reactivateUser,
  changePassword,
  deleteUser,
  exportUserData
}; 