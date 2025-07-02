import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTask } from '../../contexts/TaskContext';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import LoadingSpinner from '../common/LoadingSpinner';

const TaskList = () => {
  const { tasks, loading, fetchTasks } = useTask();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    overdue: false
  });

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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
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
    </div>
  );
};

export default TaskList; 