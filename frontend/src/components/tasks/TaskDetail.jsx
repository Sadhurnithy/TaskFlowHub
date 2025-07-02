import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTaskById, updateTask, deleteTask, shareTask, removeTaskSharing } = useTask();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({ email: '', permission: 'read' });
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: []
  });
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    console.log('TaskDetail component mounted with ID:', id);
    fetchTask();
  }, [id]);

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        tags: task.tags || []
      });
    }
  }, [task]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const taskData = await getTaskById(id);
      setTask(taskData);
    } catch (error) {
      console.error('Error fetching task:', error);
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      console.log('Updating task status to:', newStatus);
      const result = await updateTask(id, { status: newStatus });
      if (result.success) {
        console.log('Task status updated successfully');
        setTask(result.task);
      } else {
        console.error('Failed to update task status:', result.error);
        alert('Failed to update task status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        console.log('Deleting task:', id);
        const result = await deleteTask(id);
        if (result.success) {
          console.log('Task deleted successfully');
          alert('Task deleted successfully!');
          navigate('/tasks');
        } else {
          console.error('Failed to delete task:', result.error);
          alert('Failed to delete task. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
      }
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareData.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    try {
      setIsSharing(true);
      console.log('Sharing task with:', shareData);
      console.log('Task ID:', id);
      console.log('User token exists:', !!localStorage.getItem('token'));
      
      const result = await shareTask(id, shareData.email, shareData.permission);
      console.log('Share result:', result);
      
      if (result.success) {
        console.log('Task shared successfully');
        setTask(result.task);
        setShowShareModal(false);
        setShareData({ email: '', permission: 'read' });
        alert('Task shared successfully!');
      } else {
        console.error('Failed to share task:', result.error);
        alert(`Failed to share task: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sharing task:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Error sharing task. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'User not found. Please check the email address.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You can only share tasks that you own.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid request.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSharing(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Saving task edits:', editData);
      const result = await updateTask(id, editData);
      if (result.success) {
        console.log('Task updated successfully');
        setTask(result.task);
        setEditing(false);
        alert('Task updated successfully!');
      } else {
        console.error('Failed to update task:', result.error);
        alert('Failed to update task. Please try again.');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    // Reset edit data to original task data
    if (task) {
      setEditData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        tags: task.tags || []
      });
    }
  };

  const handleRemoveShare = async (sharedUserId) => {
    if (!task) return;
    if (!window.confirm('Remove this user from shared list?')) return;
    const result = await removeTaskSharing(task._id, sharedUserId);
    if (result.success) {
      setTask(result.task);
    } else {
      alert(result.error || 'Failed to remove sharing');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!task) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Task not found</h2>
          <p className="mt-2 text-gray-600">The task you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/tasks')}
            className="btn-primary mt-4"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

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

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Tasks
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            {editing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={editData.title}
                    onChange={handleEditChange}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                    rows={4}
                    className="input w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={editData.priority}
                      onChange={handleEditChange}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={editData.dueDate}
                      onChange={handleEditChange}
                      className="input"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3 pt-4">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button type="button" onClick={handleCancelEdit} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
                <div className="flex items-center space-x-4">
                  <span className={`badge ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`badge ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  {isOverdue && (
                    <span className="badge-danger flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      Overdue
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {!editing && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="btn-secondary flex items-center"
              >
                <ShareIcon className="w-4 h-4 mr-2" />
                Share
              </button>
              <button
                onClick={() => setEditing(true)}
                className="btn-primary flex items-center"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex items-center"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {!editing && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              {task.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          )}

          {/* Status Actions */}
          <div className="card mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleStatusChange('todo')}
                className={`btn ${task.status === 'todo' ? 'btn-primary' : 'btn-secondary'}`}
              >
                To Do
              </button>
              <button
                onClick={() => handleStatusChange('in-progress')}
                className={`btn ${task.status === 'in-progress' ? 'btn-primary' : 'btn-secondary'}`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className={`btn ${task.status === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h3>
            <div className="space-y-4">
              {task.dueDate && (
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Due Date</p>
                    <p className={`text-sm ${isOverdue ? 'text-danger-600' : 'text-gray-600'}`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {task.owner && (
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Owner</p>
                    <p className="text-sm text-gray-600">{task.owner.name}</p>
                  </div>
                </div>
              )}

              {task.completedAt && (
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-success-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completed</p>
                    <p className="text-sm text-gray-600">
                      {new Date(task.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shared With */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shared With</h3>
            {(!task.sharedWith || task.sharedWith.length === 0) ? (
              <div className="text-xs text-gray-500 italic">This task is not shared with anyone yet.</div>
            ) : (
              <div className="space-y-2">
                {task.sharedWith.map((share, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden min-w-0">
                      {share.user.picture ? (
                        <img src={share.user.picture} alt={share.user.name} className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0" />
                      ) : (
                        <UserIcon className="w-7 h-7 text-gray-300 border border-gray-200 rounded-full p-1 flex-shrink-0" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-gray-900 text-sm truncate">{share.user.name}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[120px]">{share.user.email}</span>
                      </div>
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize border border-gray-200 flex-shrink-0">
                        {share.permission}
                      </span>
                    </div>
                    {/* Only owner can remove, and not themselves */}
                    {user && task.owner && user._id === task.owner._id && share.user._id !== user._id && (
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
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Task</h3>
              {/* Shared With List in Modal */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Already Shared With:</h4>
                {(!task.sharedWith || task.sharedWith.length === 0) ? (
                  <div className="text-xs text-gray-500 italic">This task is not shared with anyone yet.</div>
                ) : (
                  <div className="space-y-2">
                    {task.sharedWith.map((share, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 hover:shadow-md transition-shadow group">
                        <div className="flex items-center space-x-3 overflow-hidden min-w-0">
                          {share.user.picture ? (
                            <img src={share.user.picture} alt={share.user.name} className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0" />
                          ) : (
                            <UserIcon className="w-7 h-7 text-gray-300 border border-gray-200 rounded-full p-1 flex-shrink-0" />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-gray-900 text-sm truncate">{share.user.name}</span>
                            <span className="text-xs text-gray-500 truncate max-w-[120px]">{share.user.email}</span>
                          </div>
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize border border-gray-200 flex-shrink-0">
                            {share.permission}
                          </span>
                        </div>
                        {/* Only owner can remove, and not themselves */}
                        {user && task.owner && user._id === task.owner._id && share.user._id !== user._id && (
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={shareData.email}
                    onChange={(e) => setShareData(prev => ({ ...prev, email: e.target.value }))}
                    className="input"
                    placeholder="Enter email address"
                    required
                    disabled={isSharing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permission
                  </label>
                  <select
                    value={shareData.permission}
                    onChange={(e) => setShareData(prev => ({ ...prev, permission: e.target.value }))}
                    className="input"
                    disabled={isSharing}
                  >
                    <option value="read">Read Only</option>
                    <option value="write">Read & Write</option>
                  </select>
                </div>
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="btn-secondary"
                    disabled={isSharing}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sharing...
                      </>
                    ) : (
                      'Share'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail; 