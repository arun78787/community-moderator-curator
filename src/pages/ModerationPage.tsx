import React, { useState, useEffect } from 'react';
import { 
  Flag, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Filter,
  ChevronDown,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { moderationService } from '../services/api';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

interface FlaggedPost {
  id: string;
  post: {
    id: string;
    content: string;
    media_url?: string;
    author: {
      id: string;
      name: string;
    };
    created_at: string;
  };
  flagged_by: {
    id: string;
    name: string;
  };
  reason_category: string;
  reason_text?: string;
  created_at: string;
  status: 'pending' | 'approved' | 'removed';
  ai_analysis?: {
    labels: string[];
    scores: Record<string, number>;
    overall_risk: number;
  };
}

const ModerationPage: React.FC = () => {
  const [flags, setFlags] = useState<FlaggedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<FlaggedPost | null>(null);
  const [filter, setFilter] = useState('pending');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    fetchFlags();
  }, [filter, sortBy]);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const response = await moderationService.getQueue({
        status: filter === 'all' ? undefined : filter,
        sort: sortBy,
      });
      setFlags(response.data.flags || []);
    } catch (error: any) {
      toast.error('Failed to fetch moderation queue');
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (flagId: string, action: 'approve' | 'remove' | 'escalate', reason?: string) => {
    try {
      await moderationService.takeAction(flagId, {
        action,
        reason: reason || '',
      });
      
      toast.success(`Post ${action}d successfully`);
      fetchFlags();
      setSelectedFlag(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to take action');
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'spam': 'Spam',
      'harassment': 'Harassment',
      'hate-speech': 'Hate Speech',
      'violence': 'Violence',
      'nudity': 'Nudity/Sexual',
      'misinformation': 'Misinformation',
      'copyright': 'Copyright',
      'other': 'Other',
    };
    return labels[category] || category;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'removed':
        return <XCircle className="w-5 h-5 text-error-600" />;
      default:
        return <Clock className="w-5 h-5 text-warning-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800';
      case 'removed':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-warning-100 text-warning-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Moderation Queue
        </h1>
        <p className="text-gray-600">
          Review and take action on flagged content
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Flags</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="removed">Removed</option>
              </select>
              <ChevronDown className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="created_at">Newest First</option>
                <option value="risk_score">Highest Risk</option>
                <option value="priority">Priority</option>
              </select>
              <ChevronDown className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{flags.length} flag{flags.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Flags List */}
      {flags.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No flags to review</h3>
          <p className="text-gray-600">
            {filter === 'pending' ? 'All caught up! No pending flags to review.' : 'No flags match your current filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <div key={flag.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Flag className="w-6 h-6 text-warning-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(flag.reason_category)}`}>
                          {getCategoryLabel(flag.reason_category)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(flag.status)}`}>
                          {flag.status}
                        </span>
                        {flag.ai_analysis && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(flag.ai_analysis.overall_risk)}`}>
                            Risk: {Math.round(flag.ai_analysis.overall_risk * 100)}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Flagged by <span className="font-medium">{flag.flagged_by.name}</span> •{' '}
                        {formatDistanceToNow(new Date(flag.created_at), { addSuffix: true })}
                      </p>
                      {flag.reason_text && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          "{flag.reason_text}"
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(flag.status)}
                  </div>
                </div>

                {/* Post Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{flag.post.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(flag.post.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-11">
                    <p className="text-gray-900 text-sm line-clamp-3 mb-3">{flag.post.content}</p>
                    {flag.post.media_url && (
                      <div className="rounded-lg overflow-hidden mb-3">
                        <img
                          src={flag.post.media_url}
                          alt="Flagged content"
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Analysis */}
                {flag.ai_analysis && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-sm text-blue-900 mb-2">AI Analysis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(flag.ai_analysis.scores).map(([label, score]) => (
                        <div key={label} className="text-center">
                          <div className={`text-xs px-2 py-1 rounded ${score > 0.7 ? 'bg-red-100 text-red-800' : score > 0.4 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {Math.round(score * 100)}%
                          </div>
                          <p className="text-xs text-blue-700 mt-1 capitalize">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {flag.status === 'pending' && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedFlag(flag)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleModerationAction(flag.id, 'approve', 'Content approved after review')}
                        className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors duration-200"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      
                      <button
                        onClick={() => handleModerationAction(flag.id, 'remove', 'Content removed for policy violation')}
                        className="flex items-center space-x-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors duration-200"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                      
                      <button
                        onClick={() => handleModerationAction(flag.id, 'escalate', 'Escalated for senior review')}
                        className="flex items-center space-x-2 px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors duration-200"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Escalate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Flag Modal */}
      {selectedFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Flag Details</h3>
                <button
                  onClick={() => setSelectedFlag(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Flag Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Flag Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium">{getCategoryLabel(selectedFlag.reason_category)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium capitalize">{selectedFlag.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Flagged by:</span>
                      <span className="ml-2 font-medium">{selectedFlag.flagged_by.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-2 font-medium">
                        {format(new Date(selectedFlag.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                  {selectedFlag.reason_text && (
                    <div className="mt-4">
                      <span className="text-gray-500 text-sm">Additional details:</span>
                      <p className="mt-1 p-3 bg-gray-50 rounded text-sm">{selectedFlag.reason_text}</p>
                    </div>
                  )}
                </div>

                {/* Original Post */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Original Post</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedFlag.post.author.name}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(selectedFlag.post.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-900 mb-3">{selectedFlag.post.content}</p>
                    {selectedFlag.post.media_url && (
                      <img
                        src={selectedFlag.post.media_url}
                        alt="Post media"
                        className="w-full max-h-64 object-cover rounded"
                      />
                    )}
                  </div>
                </div>

                {/* AI Analysis Details */}
                {selectedFlag.ai_analysis && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">AI Analysis Results</h4>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Risk Scores</h5>
                          <div className="space-y-2">
                            {Object.entries(selectedFlag.ai_analysis.scores).map(([label, score]) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="text-sm capitalize text-gray-600">{label}:</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        score > 0.7 ? 'bg-red-500' : score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                                      }`}
                                      style={{ width: `${score * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{Math.round(score * 100)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Overall Assessment</h5>
                          <div className={`p-3 rounded-lg ${getRiskColor(selectedFlag.ai_analysis.overall_risk)}`}>
                            <p className="text-sm font-medium">
                              Risk Level: {Math.round(selectedFlag.ai_analysis.overall_risk * 100)}%
                            </p>
                            <p className="text-xs mt-1">
                              {selectedFlag.ai_analysis.overall_risk > 0.8 ? 'High risk content detected' :
                               selectedFlag.ai_analysis.overall_risk > 0.5 ? 'Moderate risk content' :
                               'Low risk content'}
                            </p>
                          </div>
                          
                          {selectedFlag.ai_analysis.labels.length > 0 && (
                            <div className="mt-3">
                              <h6 className="text-xs text-gray-500 mb-2">Detected Labels:</h6>
                              <div className="flex flex-wrap gap-1">
                                {selectedFlag.ai_analysis.labels.map((label, index) => (
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
              </div>

              {/* Action Buttons */}
              {selectedFlag.status === 'pending' && (
                <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleModerationAction(selectedFlag.id, 'approve')}
                    className="flex items-center space-x-2 px-6 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors duration-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => handleModerationAction(selectedFlag.id, 'remove')}
                    className="flex items-center space-x-2 px-6 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors duration-200"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                  
                  <button
                    onClick={() => handleModerationAction(selectedFlag.id, 'escalate')}
                    className="flex items-center space-x-2 px-6 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors duration-200"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Escalate</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationPage;