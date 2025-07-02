// WebSocket event constants and configuration

const SOCKET_EVENTS = {
  // Task events
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_SHARED: 'task:shared',
  
  // Task actions
  TASK_CREATE: 'task:create',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_SHARE: 'task:share',
  
  // Success responses
  TASK_CREATE_SUCCESS: 'task:create:success',
  TASK_UPDATE_SUCCESS: 'task:update:success',
  TASK_DELETE_SUCCESS: 'task:delete:success',
  TASK_SHARE_SUCCESS: 'task:share:success',
  
  // Typing indicators
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  
  // Room management
  TASK_JOIN: 'task:join',
  TASK_LEAVE: 'task:leave',
  
  // Error handling
  ERROR: 'error',
  
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect'
};

const SOCKET_ROOMS = {
  USER: (userId) => `user:${userId}`,
  TASK: (taskId) => `task:${taskId}`,
  GLOBAL: 'global'
};

const SOCKET_CONFIG = {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
};

module.exports = {
  SOCKET_EVENTS,
  SOCKET_ROOMS,
  SOCKET_CONFIG
}; 