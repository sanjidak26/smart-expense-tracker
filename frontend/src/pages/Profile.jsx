import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  Lock,
  KeyRound,
  Loader2,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) {
      addToast('Name and email fields cannot be empty', 'warning');
      return;
    }

    try {
      setUpdatingProfile(true);
      const response = await api.put('/auth/profile', profileForm);
      
      // Update context and token if changed
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      updateUser({
        name: response.data.name,
        email: response.data.email,
      });

      addToast('Profile details updated successfully', 'success');
    } catch (error) {
      console.error(error);
      addToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill in all password fields', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'warning');
      return;
    }

    try {
      setUpdatingPassword(true);
      await api.put('/auth/password', {
        currentPassword,
        newPassword,
      });

      addToast('Password changed successfully', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error(error);
      addToast(error.response?.data?.message || 'Password update failed', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-55">
          Profile Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Manage your personal information and login credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* EDIT PROFILE FORM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-2xl text-brand-600 dark:text-brand-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Personal Information</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Update your display name and email address</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    placeholder="Your Name"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-brand-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    placeholder="email@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-brand-500 transition-colors" />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-650 hover:bg-brand-700 disabled:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-md transition duration-200 cursor-pointer"
              >
                {updatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Details...</span>
                  </>
                ) : (
                  <span>Update Profile</span>
                )}
              </button>
            </form>
          </div>

          {/* Secure session info badge */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4.5 h-4.5 text-gold shrink-0" />
            <span>Updates are secured with end-to-end token encryption.</span>
          </div>
        </div>

        {/* CHANGE PASSWORD FORM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-3 bg-brand-50 dark:bg-brand-900/40 rounded-2xl text-brand-600 dark:text-brand-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Security Credentials</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Modify your login password below</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">
                Current Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-brand-500 transition-colors" />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">
                New Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-brand-500 transition-colors" />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">
                Confirm New Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-500 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-brand-500 transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-650 hover:bg-brand-700 disabled:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-md transition duration-200 cursor-pointer"
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
