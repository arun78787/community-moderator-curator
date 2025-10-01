import React, { useRef, useEffect } from 'react';
import { X, Bell, Clock } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, clearAll } = useSocket();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'moderation':
        return '🛡️';
      case 'flag':
        return '🚩';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="overflow-y-auto max-h-80">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                !notification.read ? 'bg-primary-50' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;