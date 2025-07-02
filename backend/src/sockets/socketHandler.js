const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');

module.exports = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle task updates
    socket.on('task:update', async (data) => {
      try {
        const { taskId, updates } = data;
        
        if (!taskId || !updates) {
          socket.emit('error', { message: 'Invalid data provided' });
          return;
        }
        
        // Verify user has access to the task
        const task = await Task.findById(taskId);
        if (!task || !task.hasAccess(socket.userId, 'write')) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Update task
        Object.assign(task, updates);
        await task.save();
        await task.populate('owner', 'name email picture');
        await task.populate('sharedWith.user', 'name email picture');

        // Emit update to task owner and shared users
        const recipients = [task.owner._id.toString(), ...task.sharedWith.map(s => s.user._id.toString())];
        
        recipients.forEach(recipientId => {
          if (recipientId !== socket.userId) {
            io.to(`user:${recipientId}`).emit('task:updated', {
              task,
              updatedBy: socket.user.name
            });
          }
        });

        socket.emit('task:update:success', { task });
      } catch (error) {
        console.error('Task update error:', error);
        socket.emit('error', { message: error.message || 'Failed to update task' });
      }
    });

    // Handle task creation
    socket.on('task:create', async (data) => {
      try {
        if (!data || !data.title) {
          socket.emit('error', { message: 'Task title is required' });
          return;
        }
        
        const task = new Task({
          ...data,
          owner: socket.userId
        });
        
        await task.save();
        await task.populate('owner', 'name email picture');

        // Emit to all connected users (for real-time dashboard updates)
        io.emit('task:created', {
          task,
          createdBy: socket.user.name
        });

        socket.emit('task:create:success', { task });
      } catch (error) {
        console.error('Task creation error:', error);
        socket.emit('error', { message: error.message || 'Failed to create task' });
      }
    });

    // Handle task deletion
    socket.on('task:delete', async (data) => {
      try {
        const { taskId } = data;
        
        if (!taskId) {
          socket.emit('error', { message: 'Task ID is required' });
          return;
        }
        
        const task = await Task.findById(taskId);
        if (!task || task.owner.toString() !== socket.userId) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        await Task.findByIdAndDelete(taskId);

        // Emit to all connected users
        io.emit('task:deleted', {
          taskId,
          deletedBy: socket.user.name
        });

        socket.emit('task:delete:success', { taskId });
      } catch (error) {
        console.error('Task deletion error:', error);
        socket.emit('error', { message: error.message || 'Failed to delete task' });
      }
    });

    // Handle task sharing
    socket.on('task:share', async (data) => {
      try {
        const { taskId, email, permission } = data;
        
        if (!taskId || !email) {
          socket.emit('error', { message: 'Task ID and email are required' });
          return;
        }
        
        const task = await Task.findById(taskId);
        if (!task || task.owner.toString() !== socket.userId) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        const userToShare = await User.findOne({ email });
        if (!userToShare) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        await task.shareWith(userToShare._id, permission);
        await task.populate('sharedWith.user', 'name email picture');

        // Emit to the user being shared with
        io.to(`user:${userToShare._id}`).emit('task:shared', {
          task,
          sharedBy: socket.user.name,
          permission
        });

        socket.emit('task:share:success', { task });
      } catch (error) {
        console.error('Task sharing error:', error);
        socket.emit('error', { message: error.message || 'Failed to share task' });
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      const { taskId } = data;
      socket.to(`task:${taskId}`).emit('typing:start', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('typing:stop', (data) => {
      const { taskId } = data;
      socket.to(`task:${taskId}`).emit('typing:stop', {
        userId: socket.userId
      });
    });

    // Handle task room joining
    socket.on('task:join', (data) => {
      const { taskId } = data;
      socket.join(`task:${taskId}`);
    });

    socket.on('task:leave', (data) => {
      const { taskId } = data;
      socket.leave(`task:${taskId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.userId})`);
    });
  });

  // Export socket instance for use in other parts of the app
  return io;
}; 