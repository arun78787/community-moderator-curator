import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';

const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 ${isAuthenticated ? 'ml-64' : ''}`}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;