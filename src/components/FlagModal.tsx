import React, { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { flagsService } from '../services/api';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  content: string;
  author: {
    name: string;
  };
}

interface FlagModalProps {
  post: Post;
  onClose: () => void;
  onFlagSubmitted: () => void;
}

const flagCategories = [
  { value: 'spam', label: 'Spam', description: 'Unwanted or repetitive content' },
  { value: 'harassment', label: 'Harassment', description: 'Bullying or targeted harassment' },
  { value: 'hate-speech', label: 'Hate Speech', description: 'Content that promotes hatred' },
  { value: 'violence', label: 'Violence', description: 'Threats or violent content' },
  { value: 'nudity', label: 'Nudity/Sexual', description: 'Inappropriate sexual content' },
  { value: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
  { value: 'copyright', label: 'Copyright', description: 'Unauthorized use of copyrighted material' },
  { value: 'other', label: 'Other', description: 'Other policy violations' },
];

const FlagModal: React.FC<FlagModalProps> = ({ post, onClose, onFlagSubmitted }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error('Please select a reason');
      return;
    }

    setIsLoading(true);
    
    try {
      await flagsService.create({
        post_id: post.id,
        reason_category: selectedCategory,
        reason_text: reasonText.trim() || null,
      });
      
      onFlagSubmitted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to flag post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
              <Flag className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Flag Post</h3>
              <p className="text-sm text-gray-600">Help us keep the community safe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Post Preview */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Post by {post.author.name}</h4>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-gray-900 line-clamp-3">{post.content}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Warning */}
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-warning-800 font-medium">Important</p>
                  <p className="text-sm text-warning-700 mt-1">
                    False flags may result in restrictions on your account. Please only flag content that violates our community guidelines.
                  </p>
                </div>
              </div>
            </div>

            {/* Flag Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Why are you flagging this post? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {flagCategories.map((category) => (
                  <label
                    key={category.value}
                    className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedCategory === category.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={selectedCategory === category.value}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{category.label}</p>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <label htmlFor="reasonText" className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                id="reasonText"
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Provide any additional context that might help moderators review this content..."
                maxLength={500}
              />
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {reasonText.length}/500 characters
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedCategory}
              className="flex items-center space-x-2 px-6 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isLoading ? 'Submitting...' : 'Submit Flag'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlagModal;