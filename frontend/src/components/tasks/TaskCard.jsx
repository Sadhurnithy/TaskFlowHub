import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserIcon, 
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const TaskCard = ({ task, compact = false, onShare }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'in-progress': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-danger-600 bg-danger-100';
      case 'medium': return 'text-warning-600 bg-warning-100';
      default: return 'text-success-600 bg-success-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'in-progress': return <ClockIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  if (compact) {
    return (
      <Link
        to={`/tasks/${task._id}`}
        className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {task.title}
              </h3>
              {task.sharedWith && task.sharedWith.length > 0 && (
                <div className="flex items-center text-primary-600" title={`Shared with ${task.sharedWith.length} user${task.sharedWith.length > 1 ? 's' : ''}`}>
                  <UserGroupIcon className="w-4 h-4" />
                </div>
              )}
            </div>
            {task.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center mt-2 space-x-2">
              <span className={`badge ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className={`badge ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isOverdue && (
              <ExclamationTriangleIcon className="w-5 h-5 text-danger-500 flex-shrink-0" />
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {task.title}
              </h3>
              {task.sharedWith && task.sharedWith.length > 0 && (
                <div className="flex items-center text-primary-600" title={`Shared with ${task.sharedWith.length} user${task.sharedWith.length > 1 ? 's' : ''}`}>
                  <UserGroupIcon className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`badge ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                <span className="ml-1">{task.status}</span>
              </span>
              <span className={`badge ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          </div>

          {task.description && (
            <p className="text-gray-600 mb-4 line-clamp-3">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {task.dueDate && (
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <span className={isOverdue ? 'text-danger-600 font-medium' : ''}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {task.owner && (
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  <span>{task.owner.name}</span>
                </div>
              )}

              {task.sharedWith && task.sharedWith.length > 0 && (
                <div className="flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-1" />
                  <span>{task.sharedWith.length} shared</span>
                </div>
              )}
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <TagIcon className="w-4 h-4 text-gray-400" />
                {task.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {task.completedAt && (
            <span className="text-xs text-success-600">
              Completed {new Date(task.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/tasks/${task._id}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View Details
          </Link>
          {onShare && (
            <button
              onClick={() => onShare(task)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              title="Share Task"
            >
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard; 