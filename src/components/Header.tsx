import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../contexts/SocketContext';
import NotificationDropdown from './NotificationDropdown';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              CommunityMod
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  Dashboard
                </Link>
                {(user?.role === 'moderator' || user?.role === 'admin') && (
                  <>
                    <Link
                      to="/moderation"
                      className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                    >
                      Moderation
                    </Link>
                    <Link
                      to="/analytics"
                      className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                    >
                      Analytics
                    </Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown
                      onClose={() => setShowNotifications(false)}
                    />
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="font-medium">{user?.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <p className="text-xs text-primary-600 mt-1 capitalize">
                          {user?.role}
                        </p>
                      </div>
                      
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      
                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;