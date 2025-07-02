const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middlewares/auth');
const { validate, taskSchema, taskUpdateSchema, shareTaskSchema } = require('../middlewares/validate');
const { apiLimiter, taskCreationLimiter } = require('../middlewares/rateLimiter');

// Apply rate limiting to all task routes
router.use(apiLimiter);

// Task CRUD operations
router.get('/', auth, taskController.getTasks);
router.post('/', auth, taskCreationLimiter, validate(taskSchema), taskController.createTask);

// Stats route (must come before /:id routes)
router.get('/stats', auth, taskController.getTaskStats);

// Filtered task routes (must come before /:id routes)
router.get('/status/:status', auth, taskController.getTasksByStatus);
router.get('/overdue', auth, taskController.getOverdueTasks);

// Specific task operations
router.get('/:id', auth, taskController.getTaskById);
router.put('/:id', auth, validate(taskUpdateSchema), taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);

// Task sharing
router.post('/:id/share', auth, validate(shareTaskSchema), taskController.shareTask);
router.delete('/:id/share/:userId', auth, taskController.removeTaskSharing);

module.exports = router; 