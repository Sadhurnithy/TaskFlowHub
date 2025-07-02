const Joi = require('joi');
const { createError } = require('../utils/error');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(createError(errorMessage, 400));
    }
    
    next();
  };
};

// Validation schemas
const taskSchema = Joi.object({
  title: Joi.string().required().min(1).max(200).trim(),
  description: Joi.string().optional().max(1000).trim(),
  status: Joi.string().valid('todo', 'in-progress', 'completed').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  dueDate: Joi.date().optional().greater('now'),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  isPublic: Joi.boolean().default(false)
});

const taskUpdateSchema = Joi.object({
  title: Joi.string().optional().min(1).max(200).trim(),
  description: Joi.string().optional().max(1000).trim(),
  status: Joi.string().valid('todo', 'in-progress', 'completed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  dueDate: Joi.date().optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  isPublic: Joi.boolean().optional()
});

const shareTaskSchema = Joi.object({
  email: Joi.string().email().required(),
  permission: Joi.string().valid('read', 'write').default('read')
});

const userProfileSchema = Joi.object({
  name: Joi.string().optional().min(1).max(100).trim(),
  email: Joi.string().email().optional(),
  timezone: Joi.string().optional(),
  notifications: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    taskUpdates: Joi.boolean().optional(),
    dueDateReminders: Joi.boolean().optional()
  }).optional(),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark').optional(),
    notifications: Joi.boolean().optional()
  }).optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const searchSchema = Joi.object({
  q: Joi.string().optional().min(1).max(100).trim(),
  status: Joi.string().valid('todo', 'in-progress', 'completed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'dueDate', 'priority', 'title').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  validate,
  taskSchema,
  taskUpdateSchema,
  shareTaskSchema,
  userProfileSchema,
  changePasswordSchema,
  searchSchema
}; 