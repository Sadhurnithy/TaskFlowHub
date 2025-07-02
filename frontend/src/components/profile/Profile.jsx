import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../config/api';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  KeyIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    timezone: user?.timezone || 'UTC',
    notifications: user?.notifications || {
      email: true,
      push: true,
      taskUpdates: true,
      dueDateReminders: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exportData, setExportData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      timezone: user?.timezone || 'UTC',
      notifications: user?.notifications || {
        email: true,
        push: true,
        taskUpdates: true,
        dueDateReminders: true
      }
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const result = await apiRequest('/users/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (result.success) {
        setSuccess('Password changed successfully!');
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(result.message || 'Failed to change password');
      }
    } catch (error) {
      setError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiRequest('/users/account', {
        method: 'DELETE'
      });

      if (result.success) {
        setSuccess('Account deleted successfully!');
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        setError(result.message || 'Failed to delete account');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiRequest('/users/export', {
        method: 'GET'
      });

      if (result.success) {
        setExportData(result.data);
        setShowExportModal(true);
        setSuccess('Data exported successfully!');
      } else {
        setError(result.message || 'Failed to export data');
      }
    } catch (error) {
      setError(error.message || 'Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadExportData = () => {
    if (!exportData) return;

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-app-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
          <p className="text-sm text-success-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-sm text-danger-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-20 w-20 rounded-full"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Profile picture</p>
                    <p className="text-xs text-gray-400">
                      Connected via Google OAuth
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                {/* Timezone */}
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex items-center space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={loading}
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary flex items-center"
                    disabled={loading}
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-20 w-20 rounded-full"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Name</p>
                      <p className="text-sm text-gray-600">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member Since</p>
                      <p className="text-sm text-gray-600">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Timezone</p>
                      <p className="text-sm text-gray-600">{user?.timezone || 'UTC'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="email"
                  checked={formData.notifications.email}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700">Email notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="push"
                  checked={formData.notifications.push}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700">Push notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="taskUpdates"
                  checked={formData.notifications.taskUpdates}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700">Task updates</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="dueDateReminders"
                  checked={formData.notifications.dueDateReminders}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700">Due date reminders</span>
              </label>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleExportData}
                disabled={loading}
                className="w-full btn-secondary text-left flex items-center"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export Data
              </button>
              <button 
                onClick={() => setShowChangePassword(true)}
                className="w-full btn-secondary text-left flex items-center"
              >
                <KeyIcon className="w-4 h-4 mr-2" />
                Change Password
              </button>
              <button 
                onClick={() => setShowDeleteAccount(true)}
                className="w-full btn-danger text-left flex items-center"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="input"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setError('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-danger-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. All your tasks and data will be permanently deleted.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="btn-danger flex-1"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
              <button
                onClick={() => setShowDeleteAccount(false)}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Data Modal */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Total Owned Tasks:</p>
                  <p className="text-gray-600">{exportData.stats.totalOwnedTasks}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Total Shared Tasks:</p>
                  <p className="text-gray-600">{exportData.stats.totalSharedTasks}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Completed Tasks:</p>
                  <p className="text-gray-600">{exportData.stats.completedTasks}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Overdue Tasks:</p>
                  <p className="text-gray-600">{exportData.stats.overdueTasks}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={downloadExportData}
                className="btn-primary flex items-center"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Download JSON
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 