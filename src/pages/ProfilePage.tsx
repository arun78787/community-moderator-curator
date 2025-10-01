import React, { useState } from 'react';
import { User, Mail, Calendar, CreditCard as Edit, Save, X, Shield, TrendingUp, MessageSquare, Flag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type ProfileForm = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would update the user via API
      toast.success('Profile updated successfully');
      setIsEditing(false);
      await refreshUser();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'text-purple-600 bg-purple-100',
      moderator: 'text-primary-600 bg-primary-100',
      user: 'text-gray-600 bg-gray-100',
    };
    return colors[role] || 'text-gray-600 bg-gray-100';
  };

  const getReputationLevel = (score: number) => {
    if (score >= 1000) return { level: 'Excellent', color: 'text-purple-600' };
    if (score >= 500) return { level: 'Good', color: 'text-green-600' };
    if (score >= 100) return { level: 'Fair', color: 'text-yellow-600' };
    return { level: 'New', color: 'text-gray-600' };
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  const reputation = getReputationLevel(user.reputation_score || 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account settings and view your activity</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleColor(user.role)}`}>
                    <Shield className="w-4 h-4 mr-1" />
                    {user.role}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${reputation.color === 'text-purple-600' ? 'bg-purple-100' : reputation.color === 'text-green-600' ? 'bg-green-100' : reputation.color === 'text-yellow-600' ? 'bg-yellow-100' : 'bg-gray-100'} ${reputation.color}`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {reputation.level}
                  </span>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Profile Form */}
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                      errors.name ? 'border-error-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-error-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                      errors.email ? 'border-error-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-error-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-900 font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900 font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Member since:</span>
                    <span className="text-gray-900 font-medium">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Community Standing</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Reputation:</span>
                    <span className="text-gray-900 font-medium">
                      {user.reputation_score || 0} points ({reputation.level})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Role:</span>
                    <span className="text-gray-900 font-medium capitalize">{user.role}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Posts Created</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Flags Submitted</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
              <Flag className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reputation Score</p>
              <p className="text-2xl font-bold text-gray-900">{user.reputation_score || 0}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <p className="text-xs text-success-600 mt-2">{reputation.level} standing</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          
          <div className="space-y-4">
            {/* Mock recent activity */}
            <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Created a new post</p>
                <p className="text-sm text-gray-600 mt-1">Shared thoughts about community guidelines</p>
                <p className="text-xs text-gray-500 mt-2">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                <Flag className="w-5 h-5 text-warning-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Flagged inappropriate content</p>
                <p className="text-sm text-gray-600 mt-1">Reported spam post for moderation review</p>
                <p className="text-xs text-gray-500 mt-2">1 day ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Reputation increased</p>
                <p className="text-sm text-gray-600 mt-1">Earned +10 points for helpful community contribution</p>
                <p className="text-xs text-gray-500 mt-2">3 days ago</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-gray-100 mt-6">
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View all activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;