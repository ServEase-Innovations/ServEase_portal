// src/pages/DashboardRouter.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Profile from './Profile';
import Settings from './Settings';
import ManagerDashboard from '../components/Dashboard/ManagerDashBoard';
import HRDashboard from '../components/Dashboard/HRDashboard';
import SuperAdminDashboard from '../components/Dashboard/SuperAdminDashBoard';
import EmployeeDashboard from '../components/Dashboard/EmployeeDashboard';

const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  console.log('DashboardRouter - user:', user, 'isAuthenticated:', isAuthenticated);

  // Get the appropriate dashboard based on user role
  const getDashboard = () => {
    console.log('DashboardRouter - rendering dashboard for role:', user?.role);
    
    switch (user?.role) {
      case 'super-admin':
        return <SuperAdminDashboard />;
      case 'hr-partner':
        return <HRDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      default:
        console.log('DashboardRouter - Unknown role, defaulting to EmployeeDashboard');
        return <EmployeeDashboard />;
    }
  };

  return (
    <Routes>
      {/* Profile and Settings routes - always accessible */}
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<Settings />} />
      
      {/* Dashboard routes */}
      <Route path="/" element={getDashboard()} />
      <Route path="/*" element={getDashboard()} />
      
      {/* Redirect any unknown dashboard routes to main dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default DashboardRouter;