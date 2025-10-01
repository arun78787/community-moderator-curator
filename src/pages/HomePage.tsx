import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Flag, 
  Clock,
  User,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { postsService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import CreatePostModal from '../components/CreatePostModal';
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
  _count?: {
    flags: number;
  };
}

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [flagModalPost, setFlagModalPost] = useState<Post | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchPosts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await postsService.getAll({
        page,
        limit: 10,
        search: search || undefined,
      });
      
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, searchTerm);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page, searchTerm);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostCreated = () => {
    setShowCreateModal(false);
    fetchPosts(currentPage, searchTerm);
    toast.success('Post created successfully!');
  };

  const handleFlag = (post: Post) => {
    setFlagModalPost(post);
  };

  const handleFlagSubmitted = () => {
    setFlagModalPost(null);
    toast.success('Post flagged successfully');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Community Feed
            </h1>
            <p className="text-gray-600">
              Discover and share content with the community
            </p>
          </div>
          
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Post</span>
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </form>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Filter className="w-5 h-5 text-gray-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
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
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Be the first to share something!'}
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Create First Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{post.author.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isAuthenticated && (
                      <button
                        onClick={() => handleFlag(post)}
                        className="p-2 text-gray-500 hover:text-error-600 hover:bg-error-50 rounded-full transition-colors duration-200"
                        title="Flag post"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="prose max-w-none">
                  <p className="text-gray-900 leading-relaxed">{post.content}</p>
                </div>

                {/* Post Media */}
                {post.media_url && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img
                      src={post.media_url}
                      alt="Post media"
                      className="w-full h-auto max-h-96 object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>

              {/* Post Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/post/${post.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200"
                  >
                    View Details
                  </Link>
                  
                  {post._count?.flags && post._count.flags > 0 && (
                    <span className="text-xs text-gray-500">
                      {post._count.flags} flag{post._count.flags !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    page === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {flagModalPost && (
        <FlagModal
          post={flagModalPost}
          onClose={() => setFlagModalPost(null)}
          onFlagSubmitted={handleFlagSubmitted}
        />
      )}
    </div>
  );
};

export default HomePage;