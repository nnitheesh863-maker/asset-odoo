import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account settings</p>
      </div>

      <div className="glass-card-solid p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl"><User size={20} className="text-primary-600" /></div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
            <p className="text-sm text-gray-500">{user?.name} ({user?.employeeId})</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">{user?.email}</p></div>
          <div><p className="text-xs text-gray-500">Role</p><p className="text-sm font-medium">{user?.role?.replace('_', ' ')}</p></div>
          <div><p className="text-xs text-gray-500">Department</p><p className="text-sm font-medium">{user?.department?.name || '—'}</p></div>
          <div><p className="text-xs text-gray-500">Status</p><p className="text-sm font-medium">{user?.status}</p></div>
        </div>
      </div>

      <div className="glass-card-solid p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl"><Lock size={20} className="text-yellow-600" /></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
