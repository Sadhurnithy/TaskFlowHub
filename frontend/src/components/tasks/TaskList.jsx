import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ShareIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import LoadingSpinner from '../common/LoadingSpinner';

const TaskList = () => {
  const { tasks, loading, fetchTasks, shareTask, removeTaskSharing } = useTask();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    overdue: false
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({ email: '', permission: 'read' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    setFilters({
      status: params.status || '',
      priority: params.priority || '',
      overdue: params.overdue === 'true'
    });
    setSearchTerm(params.search || '');
    
    fetchTasks(params);
  }, [searchParams, fetchTasks]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', overdue: false });
    setSearchTerm('');
    setSearchParams({});
  };

  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status && task.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    // Overdue filter
    if (filters.overdue) {
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
      if (!isOverdue) {
        return false;
      }
    }

    return true;
  });

  const hasActiveFilters = filters.status || filters.priority || filters.overdue || searchTerm;

  const handleShare = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareData.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    try {
      setIsSharing(true);
      const result = await shareTask(selectedTask._id, shareData.email, shareData.permission);
      if (result.success) {
        alert('Task shared successfully!');
        setShowShareModal(false);
        setShareData({ email: '', permission: 'read' });
        setSelectedTask(null);
      } else {
        alert(`Failed to share task: ${result.error}`);
      }
    } catch (error) {
      alert('Error sharing task. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const openShareModal = (task) => {
    setSelectedTask(task);
    setShowShareModal(true);
    setShareData({ email: '', permission: 'read' });
  };

  const handleRemoveShare = async (sharedUserId) => {
    if (!selectedTask) return;
    if (!window.confirm('Remove this user from shared list?')) return;
    const result = await removeTaskSharing(selectedTask._id, sharedUserId);
    if (result.success) {
      // Update selectedTask with new sharedWith list
      setSelectedTask(result.task);
    } else {
      alert(result.error || 'Failed to remove sharing');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-2 text-gray-600">
              Manage and organize your tasks efficiently
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Task
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="input pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-sm"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="input-sm"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.overdue}
                onChange={(e) => handleFilterChange('overdue', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Overdue Only</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
            </p>
            {filteredTasks.some(task => task.sharedWith && task.sharedWith.length > 0) && (
              <div className="flex items-center text-primary-600">
                <UserGroupIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {filteredTasks.filter(task => task.sharedWith && task.sharedWith.length > 0).length} shared
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredTasks.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {hasActiveFilters 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first task.'
            }
          </p>
          <div className="mt-6">
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Task
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <TaskCard key={task._id} task={task} onShare={openShareModal} />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowShareModal(false)}
            >
              <span className="sr-only">Close</span>
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ShareIcon className="w-5 h-5 mr-2" /> Share Task
            </h2>
            {/* Shared With List */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Already Shared With:</h3>
              {(!selectedTask.sharedWith || selectedTask.sharedWith.length === 0) ? (
                <div className="text-xs text-gray-500 italic">This task is not shared with anyone yet.</div>
              ) : (
                <div className="space-y-2">
                  {selectedTask.sharedWith.map((share, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center space-x-3">
                        {share.user.picture ? (
                          <img src={share.user.picture} alt={share.user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                        ) : (
                          <UserIcon className="w-7 h-7 text-gray-300 border border-gray-200 rounded-full p-1" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-sm">{share.user.name}</span>
                          <span className="text-xs text-gray-500">{share.user.email}</span>
                        </div>
                        <span className="ml-4 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize border border-gray-200">
                          {share.permission}
                        </span>
                      </div>
                      {/* Only owner can remove, and not themselves */}
                      {user && selectedTask.owner && user._id === selectedTask.owner._id && share.user._id !== user._id && (
                        <button
                          onClick={() => handleRemoveShare(share.user._id)}
                          className="ml-2 text-danger-600 hover:text-danger-800 p-1 rounded-full transition-colors group-hover:bg-danger-50"
                          title="Remove access"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={shareData.email}
                  onChange={e => setShareData({ ...shareData, email: e.target.value })}
                  className="input w-full"
                  required
                  placeholder="Enter user's email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permission</label>
                <select
                  value={shareData.permission}
                  onChange={e => setShareData({ ...shareData, permission: e.target.value })}
                  className="input w-full"
                >
                  <option value="read">Read</option>
                  <option value="edit">Edit</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isSharing}
              >
                {isSharing ? 'Sharing...' : 'Share Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList; 