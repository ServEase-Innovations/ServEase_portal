// EmployeeDashboard.tsx - Main entry point with updated PayslipsTab integration
import React, { useState, useEffect } from 'react';
import Sidebar from '../../Layout/Sidebar';
import Header from '../../Layout/Header';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useAttendance } from '../../../hooks/useAttendance';

// Import all tab components
import DashboardTab from './DashboardTab';
import AttendanceTab from './AttendanceTab';
import TasksTab from './TasksTab';
import LeaveTab from './LeaveTab';
import PayslipsTab from './PayslipsTab';
import MyTeamTab from './MyTeamTab';
import MessagesTab from './MessagesTab';
import QueriesTab from './QueriesTab';

// Import theme utilities
import { getThemeClasses } from './themeUtils';

const EmployeeDashboard: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Attendance hook for the entire dashboard
  const attendance = useAttendance();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const tc = getThemeClasses(theme);

  // Get the page title and subtitle based on the current path
  const getPageInfo = () => {
    const path = location.pathname;
    
    // Get user info for subtitle
    const userDisplayName = user?.name || 'Rohan';
    const userDesignation = (user as any)?.designation || 'Senior Software Engineer';
    const userEmployeeId = user?.id || 'SE-187';
    
    // Common subtitle
    const subtitle = `${userDesignation} - ${userEmployeeId}`;
    
    // Title mapping
    const titleMap: Record<string, string> = {
      '/dashboard': `Good day, ${userDisplayName} 👋`,
      '/dashboard/': `Good day, ${userDisplayName} 👋`,
      '/dashboard/attendance': 'Attendance',
      '/dashboard/tasks': 'My Tasks',
      '/dashboard/leave': 'Leave Management',
      '/dashboard/payslips': 'Payslips',
      '/dashboard/queries': 'Queries',
      '/dashboard/team': 'My Team',
      '/dashboard/messages': 'Messages',
    };
    
    const title = titleMap[path] || `Good day, ${userDisplayName} 👋`;
    
    // Special subtitles for specific pages
    const subtitleMap: Record<string, string> = {
      '/dashboard/payslips': 'View and download your salary payslips',
      '/dashboard/leave': 'Apply for leave and view history',
      '/dashboard/tasks': 'View your assigned tasks',
      '/dashboard/attendance': 'Track your attendance',
      '/dashboard/queries': 'Send and receive messages',
      '/dashboard/team': 'View your team members',
      '/dashboard/messages': 'Team messages',
    };
    
    const customSubtitle = subtitleMap[path];
    
    return {
      title,
      subtitle: customSubtitle || subtitle,
    };
  };

  const { title, subtitle } = getPageInfo();

  const renderContent = () => {
    const path = location.pathname;
    // Pass the full user object and role to PayslipsTab
    const tabProps = { theme, attendance, user };
    
    if (path === '/dashboard' || path === '/dashboard/') {
      return <DashboardTab {...tabProps} />;
    } else if (path === '/dashboard/attendance') {
      return <AttendanceTab {...tabProps} />;
    } else if (path === '/dashboard/tasks') {
      return <TasksTab {...tabProps} />;
    } else if (path === '/dashboard/leave') {
      return <LeaveTab {...tabProps} />;
    } else if (path === '/dashboard/payslips') {
      // Pass user role to PayslipsTab for proper API access
      return <PayslipsTab theme={theme} attendance={attendance} userRole={user?.role || 'employee'} />;
    } else if (path === '/dashboard/queries') {
      return <QueriesTab {...tabProps} />;
    } else if (path === '/dashboard/team') {
      return <MyTeamTab {...tabProps} />;
    } else if (path === '/dashboard/messages') {
      return <MessagesTab {...tabProps} />;
    } else {
      return <DashboardTab {...tabProps} />;
    }
  };

  return (
    <div className={`flex h-screen ${tc.bg} transition-colors duration-300 overflow-hidden`}>
      <Sidebar 
        role="employee" 
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <Sidebar 
        role="employee"
        isMobile={true}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header 
          title={title}
          subtitle={subtitle}
          theme={theme}
          onThemeToggle={toggleTheme}
          onMobileMenuToggle={toggleMobileSidebar}
          isMobile={isMobile}
        />
        <div className={`flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 ${tc.scrollbar} scrollbar-thin`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;