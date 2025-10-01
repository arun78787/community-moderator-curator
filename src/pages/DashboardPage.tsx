import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Flag, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { postsService, moderationService, analyticsService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalPosts: number;
  myPosts: number;
  totalFlags: number;
  pendingFlags: number;
}

interface RecentActivity {
  id: string;
  type: 'post' | 'flag' | 'moderation';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    myPosts: 0,
    totalFlags: 0,
    pendingFlags: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's posts
      const postsResponse = await postsService.getAll({ author: user?.id });
      
      // Fetch moderation stats if user is moderator/admin
      let moderationStats = null;
      if (user?.role === 'moderator' || user?.role === 'admin') {
        try {
          moderationStats = await moderationService.getQueue();
        } catch (error) {
          console.log('Error fetching moderation stats:', error);
        }
      }

      setStats({
        totalPosts: postsResponse.data.total || 0,
        myPosts: postsResponse.data.posts?.length || 0,
        totalFlags: moderationStats?.data?.total || 0,
        pendingFlags: moderationStats?.data?.pending || 0,
      });

      // Mock recent activity - in a real app this would come from an API
      setRecentActivity([
        {
          id: '1',
          type: 'post',
          title: 'Post created',
          description: 'Your latest post was published successfully',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'flag',
          title: 'Content flagged',
          description: 'A post was flagged for review',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="w-5 h-5 text-primary-600" />;
      case 'flag':
        return <Flag className="w-5 h-5 text-warning-600" />;
      case 'moderation':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'post':
        return 'bg-primary-100';
      case 'flag':
        return 'bg-warning-100';
      case 'moderation':
        return 'bg-success-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening in your community today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* My Posts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.myPosts}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View all posts →
            </Link>
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Community Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-secondary-600 font-medium text-sm">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              Active community
            </span>
          </div>
        </div>

        {/* Flags (Moderators/Admins only) */}
        {(user?.role === 'moderator' || user?.role === 'admin') && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Flags</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingFlags}</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                  <Flag className="w-6 h-6 text-warning-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/moderation"
                  className="text-warning-600 hover:text-warning-700 font-medium text-sm"
                >
                  Review queue →
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Flags</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFlags}</p>
                </div>
                <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-error-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/analytics"
                  className="text-error-600 hover:text-error-700 font-medium text-sm"
                >
                  View analytics →
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Reputation (for regular users) */}
        {user?.role === 'user' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reputation</p>
                <p className="text-2xl font-bold text-gray-900">{user.reputation_score || 0}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-success-600 font-medium text-sm">
                Good standing
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityBg(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </span>
                          {activity.status && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.status === 'pending' 
                                ? 'bg-warning-100 text-warning-800'
                                : 'bg-success-100 text-success-800'
                            }`}>
                              {activity.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Create Post */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to="/"
                  className="w-full flex items-center space-x-3 p-4 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-900">Create Post</p>
                    <p className="text-sm text-primary-600">Share something with the community</p>
                  </div>
                </Link>

                {(user?.role === 'moderator' || user?.role === 'admin') && (
                  <>
                    <Link
                      to="/moderation"
                      className="w-full flex items-center space-x-3 p-4 bg-warning-50 hover:bg-warning-100 border border-warning-200 rounded-lg transition-colors duration-200"
                    >
                      <div className="w-10 h-10 bg-warning-600 rounded-full flex items-center justify-center">
                        <Flag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-warning-900">Review Flags</p>
                        <p className="text-sm text-warning-600">Moderate flagged content</p>
                      </div>
                    </Link>

                    <Link
                      to="/analytics"
                      className="w-full flex items-center space-x-3 p-4 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 rounded-lg transition-colors duration-200"
                    >
                      <div className="w-10 h-10 bg-secondary-600 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">View Analytics</p>
                        <p className="text-sm text-secondary-600">Check moderation metrics</p>
                      </div>
                    </Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="w-full flex items-center space-x-3 p-4 bg-accent-50 hover:bg-accent-100 border border-accent-200 rounded-lg transition-colors duration-200"
                  >
                    <div className="w-10 h-10 bg-accent-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-accent-900">Admin Panel</p>
                      <p className="text-sm text-accent-600">Manage community settings</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Health</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Content Quality</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className="w-4/5 h-2 bg-success-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-success-600">80%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Moderation Response</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className="w-5/6 h-2 bg-primary-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-primary-600">92%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User Engagement</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className="w-3/4 h-2 bg-secondary-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-secondary-600">75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;