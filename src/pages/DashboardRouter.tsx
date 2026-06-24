// DashboardRouter.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// import ManagerDashboard from './ManagerDashboard';
// import HRDashboard from './HRDashboard';
// import SuperAdminDashboard from './SuperAdminDashboard';
// import EmployeeDashboard from './EmployeeDashboard';
import Profile from './Profile';
import Settings from './Settings';
import ManagerDashboard from '../components/Dashboard/ManagerDashBoard';
import HRDashboard from '../components/Dashboard/HRDashboard';
import SuperAdminDashboard from '../components/Dashboard/SuperAdminDashBoard';
import EmployeeDashboard from '../components/Dashboard/EmployeeDashboard';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  // Get the appropriate dashboard based on user role
  const getDashboard = () => {
    switch (user?.role) {
      case 'manager':
        return <ManagerDashboard />;
      case 'hr-partner':
        return <HRDashboard />;
      case 'super-admin':
        return <SuperAdminDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      default:
        return <ManagerDashboard />;
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