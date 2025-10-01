import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  Shield, 
  BarChart3, 
  Settings, 
  Users,
  Flag
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/',
      icon: Home,
      label: 'Home',
      roles: ['user', 'moderator', 'admin'],
    },
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      roles: ['user', 'moderator', 'admin'],
    },
    {
      to: '/moderation',
      icon: Shield,
      label: 'Moderation',
      roles: ['moderator', 'admin'],
    },
    {
      to: '/analytics',
      icon: BarChart3,
      label: 'Analytics',
      roles: ['moderator', 'admin'],
    },
    {
      to: '/admin',
      icon: Settings,
      label: 'Admin Panel',
      roles: ['admin'],
    },
  ];

  const filteredNavItems = navItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      {/* User info section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;