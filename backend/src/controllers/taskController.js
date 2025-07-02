const { catchAsync } = require('../utils/error');
const taskService = require('../services/taskService');
const { sendTaskShareEmail, sendTaskUpdateEmail } = require('../utils/email');

const createTask = catchAsync(async (req, res) => {
  const { user } = req;
  const taskData = req.body;
  
  const task = await taskService.createTask(taskData, user._id);
  
  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
});

const getTasks = catchAsync(async (req, res) => {
  const { user } = req;
  const filters = req.query;
  
  const result = await taskService.getTasks(user._id, filters);
  
  res.status(200).json({
    success: true,
    data: result
  });
});

const getTaskById = catchAsync(async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  
  const task = await taskService.getTaskById(id, user._id);
  
  res.status(200).json({
    success: true,
    data: task
  });
});

const updateTask = catchAsync(async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const updateData = req.body;
  
  const task = await taskService.updateTask(id, updateData, user._id);
  
  // Send notification to shared users if task was updated
  if (task.sharedWith && task.sharedWith.length > 0) {
    const changes = Object.keys(updateData).join(', ');
    task.sharedWith.forEach(share => {
      sendTaskUpdateEmail(
        share.user.email,
        task.title,
        user.name,
        changes
      );
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

const deleteTask = catchAsync(async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  
  const result = await taskService.deleteTask(id, user._id);
  
  res.status(200).json({
    success: true,
    message: result.message
  });
});

const shareTask = catchAsync(async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const { email, permission } = req.body;
  
  const task = await taskService.shareTask(id, email, permission, user._id);
  
  // Send email notification
  await sendTaskShareEmail(email, task.title, user.name, permission);
  
  res.status(200).json({
    success: true,
    message: 'Task shared successfully',
    data: task
  });
});

const removeTaskSharing = catchAsync(async (req, res) => {
  const { user } = req;
  const { id, userId } = req.params;
  
  const task = await taskService.removeTaskSharing(id, userId, user._id);
  
  res.status(200).json({
    success: true,
    message: 'Task sharing removed successfully',
    data: task
  });
});

const getTaskStats = catchAsync(async (req, res) => {
  const { user } = req;
  
  const stats = await taskService.getTaskStats(user._id);
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

const getTasksByStatus = catchAsync(async (req, res) => {
  const { user } = req;
  const { status } = req.params;
  const filters = { ...req.query, status };
  
  const result = await taskService.getTasks(user._id, filters);
  
  res.status(200).json({
    success: true,
    data: result
  });
});

const getOverdueTasks = catchAsync(async (req, res) => {
  const { user } = req;
  const filters = req.query;
  
  // Add overdue filter
  const result = await taskService.getTasks(user._id, {
    ...filters,
    overdue: true
  });
  
  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  shareTask,
  removeTaskSharing,
  getTaskStats,
  getTasksByStatus,
  getOverdueTasks
}; 