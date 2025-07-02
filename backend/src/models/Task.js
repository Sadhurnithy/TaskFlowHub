const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

// Virtual for task age
taskSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Indexes for better query performance
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });
taskSchema.index({ 'sharedWith.user': 1 });
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ createdAt: -1 });

// Pre-save middleware to handle completion
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = null;
  }
  next();
});

// Static method to find tasks by owner
taskSchema.statics.findByOwner = function(ownerId, options = {}) {
  const query = { owner: ownerId };
  
  if (options.status) query.status = options.status;
  if (options.priority) query.priority = options.priority;
  if (options.search) {
    query.$or = [
      { title: { $regex: options.search, $options: 'i' } },
      { description: { $regex: options.search, $options: 'i' } }
    ];
  }
  
  return this.find(query)
    .populate('owner', 'name email picture')
    .populate('sharedWith.user', 'name email picture')
    .sort(options.sort || { createdAt: -1 });
};

// Static method to find shared tasks
taskSchema.statics.findSharedWith = function(userId) {
  return this.find({
    'sharedWith.user': userId
  })
  .populate('owner', 'name email picture')
  .populate('sharedWith.user', 'name email picture')
  .sort({ updatedAt: -1 });
};

// Instance method to share task with user
taskSchema.methods.shareWith = function(userId, permission = 'read') {
  const existingShare = this.sharedWith.find(share => 
    share.user.toString() === userId.toString()
  );
  
  if (existingShare) {
    existingShare.permission = permission;
    existingShare.sharedAt = new Date();
  } else {
    this.sharedWith.push({
      user: userId,
      permission,
      sharedAt: new Date()
    });
  }
  
  return this.save();
};

// Instance method to remove sharing
taskSchema.methods.removeSharing = function(userId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.user.toString() !== userId.toString()
  );
  return this.save();
};

// Instance method to check if user has access
taskSchema.methods.hasAccess = function(userId, requiredPermission = 'read') {
  console.log('hasAccess called with:', { userId, requiredPermission });
  console.log('Task owner:', this.owner);
  console.log('Owner type:', typeof this.owner);
  console.log('User ID type:', typeof userId);
  
  const ownerStr = this.owner.toString();
  const userIdStr = userId.toString();
  
  console.log('Owner string:', ownerStr);
  console.log('User ID string:', userIdStr);
  console.log('Owner comparison:', ownerStr === userIdStr);
  
  if (ownerStr === userIdStr) {
    console.log('User is owner, granting access');
    return true;
  }
  
  console.log('User is not owner, checking shared access');
  const share = this.sharedWith.find(s => s.user.toString() === userIdStr);
  console.log('Found share:', share);
  
  if (!share) {
    console.log('No share found, denying access');
    return false;
  }
  
  if (requiredPermission === 'write') {
    const hasWrite = share.permission === 'write';
    console.log('Write permission required, has write:', hasWrite);
    return hasWrite;
  }
  
  console.log('Read permission granted');
  return true;
};

module.exports = mongoose.model('Task', taskSchema); 