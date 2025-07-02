import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';
import { apiConfig } from '../config/api';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const { on, off } = useSocket();

  // Debounce function to prevent too many requests
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Listen for real-time updates
  useEffect(() => {
    const handleTaskCreated = (data) => {
      setTasks(prev => [data.task, ...prev]);
    };

    const handleTaskUpdated = (data) => {
      setTasks(prev => prev.map(task => 
        task._id === data.task._id ? data.task : task
      ));
    };

    const handleTaskDeleted = (data) => {
      setTasks(prev => prev.filter(task => task._id !== data.taskId));
    };

    const handleTaskShared = (data) => {
      setTasks(prev => prev.map(task => 
        task._id === data.task._id ? data.task : task
      ));
    };

    on('task:created', handleTaskCreated);
    on('task:updated', handleTaskUpdated);
    on('task:deleted', handleTaskDeleted);
    on('task:shared', handleTaskShared);

    return () => {
      off('task:created', handleTaskCreated);
      off('task:updated', handleTaskUpdated);
      off('task:deleted', handleTaskDeleted);
      off('task:shared', handleTaskShared);
    };
  }, [on, off]);

  const fetchTasks = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams(filters);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiConfig.baseURL}/tasks?${params}`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setTasks(response.data.data.tasks);
      return response.data.data;
    } catch (error) {
      console.error('Fetch tasks error:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch tasks');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced version of fetchTasks
  const debouncedFetchTasks = useCallback(
    debounce(fetchTasks, 500),
    [fetchTasks]
  );

  const createTask = async (taskData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${apiConfig.baseURL}/tasks`, taskData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const newTask = response.data.data;
      setTasks(prev => [newTask, ...prev]);
      return { success: true, task: newTask };
    } catch (error) {
      console.error('Create task error:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to create task');
      }
      return { success: false, error: error.response?.data?.message || 'Failed to create task' };
    }
  };

  const updateTask = async (taskId, updateData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.put(`${apiConfig.baseURL}/tasks/${taskId}`, updateData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedTask = response.data.data;
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('Update task error:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to update task');
      }
      return { success: false, error: error.response?.data?.message || 'Failed to update task' };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      await axios.delete(`${apiConfig.baseURL}/tasks/${taskId}`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setTasks(prev => prev.filter(task => task._id !== taskId));
      return { success: true };
    } catch (error) {
      console.error('Delete task error:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to delete task');
      }
      return { success: false, error: error.response?.data?.message || 'Failed to delete task' };
    }
  };

  const shareTask = async (taskId, email, permission) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${apiConfig.baseURL}/tasks/${taskId}/share`, {
        email,
        permission
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedTask = response.data.data;
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('Share task error:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to share task');
      }
      return { success: false, error: error.response?.data?.message || 'Failed to share task' };
    }
  };

  const fetchTaskStats = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiConfig.baseURL}/tasks/stats`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setStats(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Fetch stats error:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch stats');
      }
      throw error;
    }
  }, []);

  const getTaskById = async (taskId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      console.log('Making API call to get task:', taskId);
      console.log('Token exists:', !!token);
      
      const response = await axios.get(`${apiConfig.baseURL}/tasks/${taskId}`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API response received:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Get task by ID error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (error.response?.status === 403) {
        setError('You don\'t have permission to view this task.');
      } else if (error.response?.status === 404) {
        setError('Task not found.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch task');
      }
      throw error;
    }
  };

  const value = {
    tasks,
    loading,
    error,
    stats,
    fetchTasks: debouncedFetchTasks,
    createTask,
    updateTask,
    deleteTask,
    shareTask,
    fetchTaskStats,
    getTaskById,
    setError
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 