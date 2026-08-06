// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import CreateAccountPage from './pages/CreateAccountPage';
import DashboardRouter from './pages/DashboardRouter';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, initializing, user } = useAuth();
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'loading:', loading, 'initializing:', initializing, 'user:', user);
  
  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  console.log('ProtectedRoute - Authenticated, rendering children');
  return <>{children}</>;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, initializing } = useAuth();
  
  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Main App Routes
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
     
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/create-account" element={
        <PublicRoute>
          <CreateAccountPage isOpen={true} onClose={() => {}} theme="light" />
        </PublicRoute>
      } />
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <DashboardRouter />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  console.log('App rendering with AuthProvider');
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                background: '#065F46',
                color: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: '#991B1B',
                color: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;