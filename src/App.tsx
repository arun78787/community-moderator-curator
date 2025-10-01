import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ModerationPage from './pages/ModerationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPage from './pages/AdminPage';
import PostPage from './pages/PostPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ 
  children, 
  roles = [] 
}) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/moderation" 
          element={
            <ProtectedRoute roles={['moderator', 'admin']}>
              <ModerationPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute roles={['moderator', 'admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <Toaster position="top-right" />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;