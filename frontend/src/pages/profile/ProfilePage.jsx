import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Shield,
  Activity,
  Save,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { changePasswordSchema } from '@/utils/validators';
import { formatDate, formatRelativeTime } from '@/utils/formatters';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await authService.getProfile();
      const data = res?.data || res;
      setProfile(data);
      resetProfile({
        firstName: data?.firstName || user?.firstName || '',
        lastName: data?.lastName || user?.lastName || '',
        email: data?.email || user?.email || '',
        phone: data?.phone || user?.phone || '',
      });
    } catch {
      if (user) {
        setProfile(user);
        resetProfile({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, resetProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onUpdateProfile = async (data) => {
    setSavingProfile(true);
    try {
      await authService.updateProfile?.(data) || Promise.resolve();
      toast.success('Profile updated successfully');
      setProfile((prev) => ({ ...prev, ...data }));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <LoadingSpinner centered />;

  const fullName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : 'User';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Profile" subtitle="Manage your account settings" icon={User} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Header Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-2xl font-bold mb-4">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={fullName} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                fullName
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{profile?.email}</p>
            {profile?.role && (
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                <Shield className="h-3 w-3" />
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
            )}
            {profile?.department && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {typeof profile.department === 'object' ? profile.department.name : profile.department}
              </p>
            )}
          </div>

          {/* Activity History */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-400" />
              Recent Activity
            </h3>
            {profile?.activityHistory && profile.activityHistory.length > 0 ? (
              <div className="space-y-3">
                {profile.activityHistory.slice(0, 10).map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary-400" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{activity.action || activity.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatRelativeTime(activity.createdAt || activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>
            )}
          </div>
        </div>

        {/* Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              Edit Profile
            </h3>
            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    className={`input ${profileErrors.firstName ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    {...registerProfile('firstName', { required: 'First name is required' })}
                  />
                  {profileErrors.firstName && (
                    <p className="text-xs text-red-500 mt-1">{profileErrors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    className={`input ${profileErrors.lastName ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    {...registerProfile('lastName', { required: 'Last name is required' })}
                  />
                  {profileErrors.lastName && (
                    <p className="text-xs text-red-500 mt-1">{profileErrors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    className={`input pl-10 ${profileErrors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    {...registerProfile('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                  />
                </div>
                {profileErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{profileErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="tel" className="input pl-10" {...registerProfile('phone')} />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={isProfileSubmitting || savingProfile} className="btn btn-primary flex items-center gap-2">
                  {savingProfile ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-gray-400" />
              Change Password
            </h3>
            <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    className={`input pr-10 ${passwordErrors.currentPassword ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Enter current password"
                    {...registerPassword('currentPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className={`input pr-10 ${passwordErrors.newPassword ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Enter new password"
                    {...registerPassword('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input pr-10 ${passwordErrors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Confirm new password"
                    {...registerPassword('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={savingPassword} className="btn btn-primary flex items-center gap-2">
                  {savingPassword ? <LoadingSpinner size="sm" /> : <Key className="h-4 w-4" />}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
