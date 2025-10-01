import React, { useState, useRef } from 'react';
import { X, Image, Send, Upload } from 'lucide-react';
import { postsService } from '../services/api';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      
      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      await postsService.create(formData);
      onPostCreated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                What's on your mind?
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts with the community..."
                maxLength={2000}
              />
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {content.length}/2000 characters
                </span>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Selected Image:</span>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-error-600 hover:text-error-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{selectedFile.name}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <Image className="w-5 h-5" />
              <span>Add Image</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>{isLoading ? 'Creating...' : 'Create Post'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;