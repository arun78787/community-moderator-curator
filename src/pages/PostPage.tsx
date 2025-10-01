import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Clock, Flag, CreditCard as Edit, Trash2, AlertTriangle, Shield } from 'lucide-react';
import { postsService, flagsService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow, format } from 'date-fns';
import FlagModal from '../components/FlagModal';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  content: string;
  media_url?: string;
  author: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  status: string;
  _count?: {
    flags: number;
  };
  flags?: Array<{
    id: string;
    reason_category: string;
    reason_text?: string;
    created_at: string;
    flagged_by: {
      name: string;
    };
  }>;
  ai_analysis?: {
    labels: string[];
    scores: Record<string, number>;
    overall_risk: number;
  };
}

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postsService.getById(id!);
      setPost(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Post not found');
      } else {
        toast.error('Failed to load post');
      }
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await postsService.delete(id!);
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleFlagSubmitted = () => {
    setShowFlagModal(false);
    toast.success('Post flagged successfully');
    fetchPost(); // Refresh to show updated flag count
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'spam': 'bg-yellow-100 text-yellow-800',
      'harassment': 'bg-red-100 text-red-800',
      'hate-speech': 'bg-red-100 text-red-800',
      'violence': 'bg-red-100 text-red-800',
      'nudity': 'bg-purple-100 text-purple-800',
      'misinformation': 'bg-orange-100 text-orange-800',
      'copyright': 'bg-blue-100 text-blue-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 0.8) return 'text-red-600 bg-red-50';
    if (risk >= 0.5) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-6"></div>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
        <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to feed</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Main Post */}
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        {/* Post Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(post.created_at), 'MMM d, yyyy h:mm a')}</span>
                  {post.updated_at !== post.created_at && (
                    <>
                      <span>•</span>
                      <span>Edited {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Menu */}
            <div className="flex items-center space-x-2">
              {user && user.id !== post.author.id && (
                <button
                  onClick={() => setShowFlagModal(true)}
                  className="p-2 text-gray-500 hover:text-error-600 hover:bg-error-50 rounded-full transition-colors duration-200"
                  title="Flag post"
                >
                  <Flag className="w-5 h-5" />
                </button>
              )}
              
              {user && user.id === post.author.id && (
                <>
                  <button
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors duration-200"
                    title="Edit post"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-gray-500 hover:text-error-600 hover:bg-error-50 rounded-full transition-colors duration-200"
                    title="Delete post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="prose max-w-none">
            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Post Media */}
          {post.media_url && (
            <div className="mt-6 rounded-lg overflow-hidden">
              <img
                src={post.media_url}
                alt="Post media"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
        </div>

        {/* Post Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              {post._count?.flags && post._count.flags > 0 && (
                <span className="flex items-center space-x-1">
                  <Flag className="w-4 h-4" />
                  <span>{post._count.flags} flag{post._count.flags !== 1 ? 's' : ''}</span>
                </span>
              )}
              <span>Post ID: {post.id.slice(0, 8)}...</span>
            </div>
            
            {post.status !== 'active' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                {post.status}
              </span>
            )}
          </div>
        </div>
      </article>

      {/* AI Analysis (for moderators/admins) */}
      {post.ai_analysis && (user?.role === 'moderator' || user?.role === 'admin') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                <p className="text-sm text-gray-600">Automated content analysis results</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3">Risk Scores</h4>
                <div className="space-y-3">
                  {Object.entries(post.ai_analysis.scores).map(([label, score]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-gray-600">{label}:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              score > 0.7 ? 'bg-red-500' : score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{Math.round(score * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3">Overall Assessment</h4>
                <div className={`p-3 rounded-lg ${getRiskColor(post.ai_analysis.overall_risk)}`}>
                  <p className="text-sm font-medium">
                    Risk Level: {Math.round(post.ai_analysis.overall_risk * 100)}%
                  </p>
                  <p className="text-xs mt-1">
                    {post.ai_analysis.overall_risk > 0.8 ? 'High risk content detected' :
                     post.ai_analysis.overall_risk > 0.5 ? 'Moderate risk content' :
                     'Low risk content'}
                  </p>
                </div>
                
                {post.ai_analysis.labels.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-xs text-gray-500 mb-2">Detected Labels:</h5>
                    <div className="flex flex-wrap gap-1">
                      {post.ai_analysis.labels.map((label, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flags (for moderators/admins) */}
      {post.flags && post.flags.length > 0 && (user?.role === 'moderator' || user?.role === 'admin') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Flags ({post.flags.length})
            </h3>
            
            <div className="space-y-4">
              {post.flags.map((flag) => (
                <div key={flag.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(flag.reason_category)}`}>
                        {flag.reason_category.replace('_', ' ').replace('-', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        by {flag.flagged_by.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(flag.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {flag.reason_text && (
                    <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded">
                      "{flag.reason_text}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showFlagModal && (
        <FlagModal
          post={post}
          onClose={() => setShowFlagModal(false)}
          onFlagSubmitted={handleFlagSubmitted}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-error-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this post? This will permanently remove it from the community.
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors duration-200"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPage;