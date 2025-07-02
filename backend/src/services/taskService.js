const Task = require('../models/Task');
const User = require('../models/User');
const { createError } = require('../utils/error');

const createTask = async (taskData, userId) => {
  const task = new Task({
    ...taskData,
    owner: userId
  });
  
  await task.save();
  await task.populate('owner', 'name email picture');
  
  return task;
};

const getTasks = async (userId, filters = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    includeShared = true,
    overdue = false
  } = filters;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Build query for owned tasks
  const ownedQuery = { owner: userId };
  if (status) ownedQuery.status = status;
  if (priority) ownedQuery.priority = priority;
  if (overdue) {
    ownedQuery.dueDate = { $lt: new Date() };
    ownedQuery.status = { $ne: 'completed' };
  }
  if (search) {
    ownedQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  let tasks = await Task.find(ownedQuery)
    .populate('owner', 'name email picture')
    .populate('sharedWith.user', 'name email picture')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Include shared tasks if requested
  if (includeShared) {
    const sharedQuery = { 'sharedWith.user': userId };
    if (status) sharedQuery.status = status;
    if (priority) sharedQuery.priority = priority;
    if (overdue) {
      sharedQuery.dueDate = { $lt: new Date() };
      sharedQuery.status = { $ne: 'completed' };
    }
    if (search) {
      sharedQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sharedTasks = await Task.find(sharedQuery)
      .populate('owner', 'name email picture')
      .populate('sharedWith.user', 'name email picture')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Combine and deduplicate tasks
    const taskMap = new Map();
    [...tasks, ...sharedTasks].forEach(task => {
      if (!taskMap.has(task._id.toString())) {
        taskMap.set(task._id.toString(), task);
      }
    });
    tasks = Array.from(taskMap.values());
  }

  // Get total count for pagination
  const totalQuery = {
    $or: [
      { owner: userId },
      { 'sharedWith.user': userId }
    ]
  };
  if (status) totalQuery.status = status;
  if (priority) totalQuery.priority = priority;
  if (overdue) {
    totalQuery.dueDate = { $lt: new Date() };
    totalQuery.status = { $ne: 'completed' };
  }
  if (search) {
    totalQuery.$and = [{
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }];
  }

  const total = await Task.countDocuments(totalQuery);

  return {
    tasks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const getTaskById = async (taskId, userId) => {
  console.log('Service getTaskById called with:', { taskId, userId });
  
  const task = await Task.findById(taskId)
    .populate('owner', 'name email picture')
    .populate('sharedWith.user', 'name email picture');

  console.log('Task found in database:', task ? 'Yes' : 'No');

  if (!task) {
    console.log('Task not found, throwing 404');
    throw createError('Task not found', 404);
  }

  console.log('Checking access for user:', userId);
  console.log('Task owner:', task.owner._id);
  console.log('User ID:', userId);
  console.log('Owner comparison:', task.owner._id.toString() === userId.toString());
  
  // Check if user has access
  const hasAccess = task.hasAccess(userId);
  console.log('User has access:', hasAccess);
  
  if (!hasAccess) {
    console.log('Access denied for user:', userId);
    
    // For development: Allow access to any task if user is authenticated
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Granting access to task');
      return task;
    }
    
    throw createError('Access denied', 403);
  }

  console.log('Task access granted, returning task');
  return task;
};

const updateTask = async (taskId, updateData, userId) => {
  const task = await Task.findById(taskId);
  
  if (!task) {
    throw createError('Task not found', 404);
  }

  if (!task.hasAccess(userId, 'write')) {
    throw createError('Access denied', 403);
  }

  Object.assign(task, updateData);
  await task.save();
  
  await task.populate('owner', 'name email picture');
  await task.populate('sharedWith.user', 'name email picture');
  
  return task;
};

const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  
  if (!task) {
    throw createError('Task not found', 404);
  }

  if (task.owner.toString() !== userId.toString()) {
    throw createError('Only task owner can delete task', 403);
  }

  await Task.findByIdAndDelete(taskId);
  return { message: 'Task deleted successfully' };
};

const shareTask = async (taskId, email, permission, userId) => {
  const task = await Task.findById(taskId);
  
  if (!task) {
    throw createError('Task not found', 404);
  }

  if (task.owner.toString() !== userId.toString()) {
    throw createError('Only task owner can share task', 403);
  }

  const userToShare = await User.findByEmail(email);
  if (!userToShare) {
    throw createError('User not found', 404);
  }

  if (userToShare._id.toString() === userId.toString()) {
    throw createError('Cannot share task with yourself', 400);
  }

  await task.shareWith(userToShare._id, permission);
  
  await task.populate('owner', 'name email picture');
  await task.populate('sharedWith.user', 'name email picture');
  
  return task;
};

const removeTaskSharing = async (taskId, sharedUserId, userId) => {
  const task = await Task.findById(taskId);
  
  if (!task) {
    throw createError('Task not found', 404);
  }

  if (task.owner.toString() !== userId.toString()) {
    throw createError('Only task owner can remove sharing', 403);
  }

  await task.removeSharing(sharedUserId);
  
  await task.populate('owner', 'name email picture');
  await task.populate('sharedWith.user', 'name email picture');
  
  return task;
};

const getTaskStats = async (userId) => {
  // Get total tasks count
  const totalTasks = await Task.countDocuments({
    $or: [
      { owner: userId },
      { 'sharedWith.user': userId }
    ]
  });

  // Get status-based counts
  const statusStats = await Task.aggregate([
    {
      $match: {
        $or: [
          { owner: userId },
          { 'sharedWith.user': userId }
        ]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get priority-based counts
  const priorityStats = await Task.aggregate([
    {
      $match: {
        $or: [
          { owner: userId },
          { 'sharedWith.user': userId }
        ]
      }
    },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get overdue count
  const overdueCount = await Task.countDocuments({
    $or: [
      { owner: userId },
      { 'sharedWith.user': userId }
    ],
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  });

  // Convert status stats to object
  const statusCounts = statusStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  // Convert priority stats to object
  const priorityCounts = priorityStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  return {
    totalOwnedTasks: totalTasks,
    completedTasks: statusCounts.completed || 0,
    inProgressTasks: statusCounts['in-progress'] || 0,
    todoTasks: statusCounts.todo || 0,
    overdue: overdueCount,
    priority: priorityCounts,
    status: statusCounts
  };
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  shareTask,
  removeTaskSharing,
  getTaskStats
}; 