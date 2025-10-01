import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'moderation' | 'flag' | 'info';
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, isAuthenticated } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 99)]);
    toast(notification.message, {
      icon: notification.type === 'moderation' ? '🛡️' : notification.type === 'flag' ? '🚩' : 'ℹ️',
      duration: 4000,
    });
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:4000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      newSocket.on('notification', (data) => {
        addNotification(data);
      });

      newSocket.on('moderation:new-flag', (data) => {
        if (user.role === 'moderator' || user.role === 'admin') {
          addNotification({
            type: 'flag',
            message: `New content flagged: ${data.reason}`,
            data,
          });
        }
      });

      newSocket.on('moderation:action', (data) => {
        addNotification({
          type: 'moderation',
          message: `Moderation action: ${data.action}`,
          data,
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user]);

  const value: SocketContextType = {
    socket,
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};