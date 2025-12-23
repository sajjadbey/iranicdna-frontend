import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, Calendar, Dna } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { DNAFileUpload } from '../components/profile/DNAFileUpload';
import { DNAFileList } from '../components/profile/DNAFileList';
import { dnaFileService } from '../services/dnaFileService';
import type { UpdateProfileData } from '../types/auth';
import type { DNAFile } from '../types/dnaFile';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [dnaFiles, setDnaFiles] = useState<DNAFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  
  const [formData, setFormData] = useState<UpdateProfileData>({
    username: user?.username || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'dna-files'>('profile');

  // Fetch DNA files
  useEffect(() => {
    const fetchDNAFiles = async () => {
      try {
        const files = await dnaFileService.getUserDNAFiles();
        setDnaFiles(files);
      } catch (err) {
        console.error('Failed to fetch DNA files:', err);
      } finally {
        setLoadingFiles(false);
      }
    };

    if (user) {
      fetchDNAFiles();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData: UpdateProfileData = { ...formData };
      
      // Include password data if user is changing password
      if (passwordData.new_password) {
        if (passwordData.new_password !== passwordData.new_password_confirm) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        updateData.current_password = passwordData.current_password;
        updateData.new_password = passwordData.new_password;
        updateData.new_password_confirm = passwordData.new_password_confirm;
      }

      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      
      // Clear password fields
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadSuccess = (file: DNAFile) => {
    setDnaFiles([file, ...dnaFiles]);
    setSuccess('DNA file uploaded successfully!');
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleFileUploadError = (errorMsg: string) => {
    setError(errorMsg);
    setTimeout(() => setError(''), 5000);
  };

  const handleFileDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this DNA file?')) {
      return;
    }

    try {
      await dnaFileService.deleteDNAFile(id);
      setDnaFiles(dnaFiles.filter(f => f.id !== id));
      setSuccess('DNA file deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleFileUpdate = async (id: string, data: { sample_name?: string; description?: string }) => {
    try {
      const updated = await dnaFileService.updateDNAFile(id, data);
      setDnaFiles(dnaFiles.map(f => f.id === id ? updated : f));
      setSuccess('DNA file updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update file');
      setTimeout(() => setError(''), 5000);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center text-white">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-gray-400">Manage your account and DNA files</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('dna-files')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'dna-files'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Dna className="w-5 h-5" />
              DNA Files
              {dnaFiles.length > 0 && (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {dnaFiles.length}
                </span>
              )}
            </button>
          </div>

          {/* Card with glassmorphism */}
          <div className="bg-[var(--color-card)]/50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-8">

            {/* Success/Error Messages */}
            {success && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center gap-2 text-emerald-300"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{success}</span>
              </motion.div>
            )}
            
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300"
              >
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Tab Content */}
            {activeTab === 'profile' ? (
              /* Profile Tab */
              <>
                {/* Account Info */}
                <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-white">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Member since:</span>
                    <span className="text-white">{new Date(user.date_joined).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
                  Basic Information
                </h2>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Your username"
                  />
                </div>

                {/* First & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Change Password Section */}
              <div className="space-y-5 pt-6 border-t border-white/10">
                <h2 className="text-xl font-semibold text-white">Change Password</h2>
                <p className="text-sm text-gray-400">Leave blank to keep current password</p>

                {/* Current Password */}
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="current_password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="new_password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="new_password_confirm" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="new_password_confirm"
                      name="new_password_confirm"
                      value={passwordData.new_password_confirm}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Repeat new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Profile...
                  </span>
                ) : (
                  'Save Changes'
                )}
                  </motion.button>
                </form>
              </>
            ) : (
              /* DNA Files Tab */
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Upload DNA File</h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Upload your raw DNA data from 23andMe, MyHeritage, MySmartGene, or other providers.
                    Files are automatically detected and validated.
                  </p>
                  <DNAFileUpload
                    onUploadSuccess={handleFileUploadSuccess}
                    onUploadError={handleFileUploadError}
                  />
                </div>

                <div className="border-t border-white/10 pt-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">Your DNA Files</h2>
                  {loadingFiles ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading DNA files...</p>
                    </div>
                  ) : (
                    <DNAFileList
                      files={dnaFiles}
                      onDelete={handleFileDelete}
                      onUpdate={handleFileUpdate}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};