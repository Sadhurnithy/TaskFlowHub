import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusIcon, 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import TaskCard from '../tasks/TaskCard';
import CreateTaskModal from '../tasks/CreateTaskModal';
import LoadingSpinner from '../common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, loading, stats, fetchTasks, fetchTaskStats } = useTask();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTasks({ limit: 5 });
        const statsData = await fetchTaskStats();
        console.log('Dashboard stats loaded:', statsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    loadData();
  }, [fetchTasks, fetchTaskStats]);

  const recentTasks = tasks.slice(0, 5);
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
  );
  const sharedTasks = tasks.filter(task => 
    task.sharedWith && task.sharedWith.length > 0
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-100';
      case 'in-progress': return 'text-warning-600 bg-warning-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-danger-600 bg-danger-100';
      case 'medium': return 'text-warning-600 bg-warning-100';
      default: return 'text-success-600 bg-success-100';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your tasks today
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Tasks"
          value={stats?.totalOwnedTasks ?? 0}
          icon={ClipboardDocumentListIcon}
          color="text-primary-600 bg-primary-100"
        />
        <StatCard
          title="Completed"
          value={stats?.completedTasks ?? 0}
          icon={CheckCircleIcon}
          color="text-success-600 bg-success-100"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressTasks ?? 0}
          icon={ClockIcon}
          color="text-warning-600 bg-warning-100"
        />
        <StatCard
          title="Overdue"
          value={stats?.overdue ?? 0}
          icon={ExclamationTriangleIcon}
          color="text-danger-600 bg-danger-100"
        />
        <StatCard
          title="Shared Tasks"
          value={tasks.filter(task => task.sharedWith && task.sharedWith.length > 0).length}
          icon={UserGroupIcon}
          color="text-indigo-600 bg-indigo-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
            <Link
              to="/tasks"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first task.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Task
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <TaskCard key={task._id} task={task} compact />
              ))}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Overdue Tasks</h2>
            {overdueTasks.length > 0 && (
              <span className="badge-danger">{overdueTasks.length}</span>
            )}
          </div>
          
          {overdueTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-success-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
              <p className="mt-1 text-sm text-gray-500">
                No overdue tasks. Great job staying on top of things!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {overdueTasks.slice(0, 3).map((task) => (
                <div key={task._id} className="flex items-center p-4 bg-danger-50 rounded-lg border border-danger-200">
                  <ExclamationTriangleIcon className="w-5 h-5 text-danger-600 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/tasks/${task._id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              ))}
              {overdueTasks.length > 3 && (
                <div className="text-center">
                  <Link
                    to="/tasks?overdue=true"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View all {overdueTasks.length} overdue tasks
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Shared Tasks Section */}
      {sharedTasks.length > 0 && (
        <div className="mt-8">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <UserGroupIcon className="w-6 h-6 mr-2 text-indigo-600" />
                Shared Tasks
              </h2>
              <span className="badge-info">{sharedTasks.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedTasks.slice(0, 6).map((task) => (
                <TaskCard key={task._id} task={task} compact />
              ))}
            </div>
            
            {sharedTasks.length > 6 && (
              <div className="text-center mt-6">
                <Link
                  to="/tasks"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all {sharedTasks.length} shared tasks
                </Link>
              </div>
            )}
          </div>
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

export default Dashboard; 