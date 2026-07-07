// Sidebar.tsx - Updated with responsive mobile support
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  InboxIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  CheckCircleIcon,
  CreditCardIcon,
  UserIcon,
  FolderIcon,
  PresentationChartBarIcon,
  RectangleStackIcon,
  AdjustmentsHorizontalIcon,
  QueueListIcon,
  ViewColumnsIcon,
  ScaleIcon,
  ArrowPathIcon,
  ClipboardIcon,
  BookOpenIcon,
  ChartPieIcon,
  TrophyIcon,
  PencilSquareIcon,
  PaperClipIcon,
  FolderOpenIcon,
  WrenchScrewdriverIcon,
  EnvelopeIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  role: string;
  collapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface MenuItem {
  icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string; titleId?: string } & React.RefAttributes<SVGSVGElement>>;
  label: string;
  path: string;
  description: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  role, 
  collapsed = false, 
  onToggle, 
  isMobile = false,
  isMobileOpen = false,
  onMobileClose
}) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const getMenuSections = (): MenuSection[] => {
    const commonItems: MenuItem[] = [
      { icon: HomeIcon, label: 'Dashboard', path: '/dashboard', description: 'Overview' }
    ];

    const roleSections: Record<string, MenuSection[]> = {
      'employee': [
        {
          title: 'Workspace',
          items: [
            { icon: Squares2X2Icon, label: 'Dashboard', path: '/dashboard', description: 'Overview' },
            { icon: CalendarIcon, label: 'Attendance', path: '/dashboard/attendance', description: 'Mark attendance' },
            { icon: CheckCircleIcon, label: 'My Tasks', path: '/dashboard/tasks', description: 'Assigned tasks' },
            { icon: ClipboardDocumentCheckIcon, label: 'Leave', path: '/dashboard/leave', description: 'Apply for leave' },
            { icon: CreditCardIcon, label: 'Payslips', path: '/dashboard/payslips', description: 'Salary payslips' }
          ]
        },
        {
          title: 'Team',
          items: [
            { icon: UserGroupIcon, label: 'My Team', path: '/dashboard/team', description: 'Team members' },
            { icon: ChatBubbleLeftRightIcon, label: 'Messages', path: '/dashboard/messages', description: 'Team messages' }
          ]
        },
        {
          title: 'Queries',
          items: [
            { icon: EnvelopeIcon, label: 'Queries', path: '/dashboard/queries', description: 'Send & receive messages' }
          ]
        },
        {
          title: 'Support',
          items: [
            { icon: QuestionMarkCircleIcon, label: 'Help & Support', path: '/dashboard/support', description: 'Get help' }
          ]
        }
      ],
      'hr-partner': [
        {
          title: 'People Ops',
          items: [
            { icon: HomeIcon, label: 'Dashboard', path: '/dashboard', description: 'Overview' },
            { icon: UserPlusIcon, label: 'Onboarding', path: '/dashboard/onboarding', description: 'New hires' },
            { icon: UserGroupIcon, label: 'Attendance', path: '/dashboard/attendance', description: 'Track attendance' },
            { icon: ClipboardDocumentCheckIcon, label: 'Leave Management', path: '/dashboard/leaves', description: 'Manage leaves' },
            { icon: BanknotesIcon, label: 'Salary & Attendance', path: '/dashboard/salary', description: 'Payroll & attendance' }
          ]
        },
        {
          title: 'Company',
          items: [
            { icon: CalendarIcon, label: 'Holidays', path: '/dashboard/holidays', description: 'Company holidays' },
            { icon: BellIcon, label: 'Announcements', path: '/dashboard/announcements', description: 'Make announcements' }
          ]
        },
        {
          title: 'Queries',
          items: [
            { icon: EnvelopeIcon, label: 'Queries', path: '/dashboard/queries', description: 'Send & receive messages' }
          ]
        }
      ],
      'manager': [
        {
          title: 'Team',
          items: [
            { icon: HomeIcon, label: 'Overview', path: '/dashboard', description: 'Team overview' },
            { icon: UsersIcon, label: 'My Team', path: '/dashboard/team', description: 'Team members' },
            { icon: ViewColumnsIcon, label: 'Project Teams', path: '/dashboard/project-teams', description: 'Project teams' },
            { icon: PencilSquareIcon, label: 'Assign Tasks', path: '/dashboard/assign-tasks', description: 'Assign tasks' },
            { icon: QueueListIcon, label: 'Tasks Board', path: '/dashboard/tasks-board', description: 'Task management' },
            { icon: ClockIcon, label: 'Attendance', path: '/dashboard/attendance', description: 'Team attendance' },
            { icon: ClipboardDocumentCheckIcon, label: 'Leave Approvals', path: '/dashboard/leave-approvals', description: 'Approve leaves' },
            { icon: TrophyIcon, label: 'Performance', path: '/dashboard/performance', description: 'Team performance' },
            { icon: DocumentTextIcon, label: 'Reports', path: '/dashboard/reports', description: 'Team reports' }
          ]
        },
        {
          title: 'Queries',
          items: [
            { icon: EnvelopeIcon, label: 'Queries', path: '/dashboard/queries', description: 'Send & receive messages' }
          ]
        }
      ],
      'super-admin': [
        {
          title: 'Operations',
          items: [
            { icon: HomeIcon, label: 'Dashboard', path: '/dashboard', description: 'Overview' },
            { icon: UsersIcon, label: 'Employees', path: '/dashboard/employees', description: 'All employees' },
            { icon: BuildingOfficeIcon, label: 'Departments', path: '/dashboard/departments', description: 'Manage departments' },
            { icon: UserGroupIcon, label: 'Teams', path: '/dashboard/teams', description: 'Manage teams' },
            { icon: ViewColumnsIcon, label: 'Project Teams', path: '/dashboard/project-teams', description: 'Project teams' },
            { icon: QueueListIcon, label: 'Tasks', path: '/dashboard/tasks', description: 'All tasks' }
          ]
        },
        {
          title: 'People',
          items: [
            { icon: UserGroupIcon, label: 'Attendance', path: '/dashboard/attendance', description: 'Track attendance' },
            { icon: ClipboardDocumentCheckIcon, label: 'Leave Approvals', path: '/dashboard/leave-approvals', description: 'Approve leaves' },
            { icon: CalendarIcon, label: 'Holidays', path: '/dashboard/holidays', description: 'Company holidays' },
            { icon: BellIcon, label: 'Announcements', path: '/dashboard/announcements', description: 'Make announcements' },
            { icon: BookOpenIcon, label: 'Activity Logs', path: '/dashboard/activity-logs', description: 'View activity logs' }
          ]
        },
        {
          title: 'Insights',
          items: [
            { icon: ChartBarIcon, label: 'Performance', path: '/dashboard/performance', description: 'Performance metrics' },
            { icon: BanknotesIcon, label: 'Payroll', path: '/dashboard/payroll', description: 'Payroll management' },
            { icon: ChartPieIcon, label: 'Analytics', path: '/dashboard/analytics', description: 'Analytics & insights' }
          ]
        },
        {
          title: 'Queries',
          items: [
            { icon: EnvelopeIcon, label: 'Queries', path: '/dashboard/queries', description: 'View & respond to messages' }
          ]
        },
        {
          title: 'System',
          items: [
            { icon: Cog6ToothIcon, label: 'Settings', path: '/dashboard/settings', description: 'System settings' }
          ]
        }
      ]
    };

    return roleSections[role] || [];
  };

  const menuSections = getMenuSections();

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <div 
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
            isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onMobileClose}
        />
        
        {/* Mobile Sidebar */}
        <div 
          className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-br from-[#0a1628] via-[#1a2744] to-[#2a3f6a] transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between min-h-[72px]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SE</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white leading-tight">ServEase</h1>
                  <span className="text-[10px] text-blue-300/70 font-medium tracking-wide">INNOVATION PVT LTD</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onMobileClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-blue-300"
                aria-label="Close sidebar"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <p className="text-[10px] font-bold text-blue-300/40 uppercase tracking-wider px-3 py-2">
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item, itemIndex) => {
                      const isActive = location.pathname === item.path || 
                                      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                      
                      return (
                        <button
                          key={itemIndex}
                          onClick={() => handleNavigation(item.path)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left
                            ${isActive 
                              ? 'bg-white/15 text-white shadow-lg shadow-black/10' 
                              : 'text-blue-200/80 hover:bg-white/8 hover:text-white'
                            }
                          `}
                        >
                          <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-blue-300/70 group-hover:text-white'}`} />
                          <span className={`text-sm font-medium transition-colors duration-200 ${isActive ? 'text-white' : ''}`}>
                            {item.label}
                          </span>
                          {isActive && (
                            <div className="w-1 h-6 bg-indigo-400 rounded-full absolute right-2 shadow-lg shadow-indigo-500/30"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 text-blue-200/80 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 w-full group"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div 
      className={`
        h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2744] to-[#2a3f6a] flex flex-col transition-all duration-300 text-white shadow-xl
        ${collapsed ? 'w-20' : 'w-64'}
        hidden lg:flex
      `}
    >
      {/* Logo Section */}
      <div className={`
        p-4 border-b border-white/10 flex items-center min-h-[72px]
        ${collapsed ? 'justify-center' : 'justify-between'}
      `}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SE</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">ServEase</h1>
                <span className="text-[10px] text-blue-300/70 font-medium tracking-wide">INNOVATION PVT LTD</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SE</span>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-blue-300/40 uppercase tracking-wider px-3 py-2">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item, itemIndex) => {
                const isActive = location.pathname === item.path || 
                                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                
                return (
                  <Link
                    key={itemIndex}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-white/15 text-white shadow-lg shadow-black/10' 
                        : 'text-blue-200/80 hover:bg-white/8 hover:text-white'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.label : ''}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-blue-300/70 group-hover:text-white'}`} />
                    {!collapsed && (
                      <span className={`text-sm font-medium transition-colors duration-200 ${isActive ? 'text-white' : ''}`}>
                        {item.label}
                      </span>
                    )}
                    {isActive && !collapsed && (
                      <div className="w-1 h-6 bg-indigo-400 rounded-full absolute right-2 shadow-lg shadow-indigo-500/30"></div>
                    )}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900/95 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/5">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        {!collapsed ? (
          <>
            {/* Quick Actions */}
            <div className="bg-white/5 rounded-xl p-3 mb-3 backdrop-blur-sm">
              <p className="text-[10px] font-semibold text-blue-300/60 uppercase tracking-wider mb-2">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {role === 'employee' ? (
                  <>
                    <button 
                      onClick={() => navigate('/dashboard/leave')}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200 text-white/90 font-medium"
                    >
                      Apply Leave
                    </button>
                    <button 
                      onClick={() => navigate('/dashboard/tasks')}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200 text-white/90 font-medium"
                    >
                      View Tasks
                    </button>
                  </>
                ) : role === 'manager' ? (
                  <>
                    <button 
                      onClick={() => navigate('/dashboard/assign-tasks')}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200 text-white/90 font-medium"
                    >
                      Assign Task
                    </button>
                    <button 
                      onClick={() => navigate('/dashboard/leave-approvals')}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200 text-white/90 font-medium"
                    >
                      Approve Leave
                    </button>
                  </>
                ) : role === 'hr-partner' ? (
                  <>
                    <button 
                      onClick={() => navigate('/dashboard/onboarding')}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200 text-white/90 font-medium"
                    >
                      New Hire
                    </button>
                    <button 
                      onClick={() => navigate('/dashboard/announcements')}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200 text-white/90 font-medium"
                    >
                      Announce
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate('/dashboard/employees')}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200 text-white/90 font-medium"
                    >
                      Add User
                    </button>
                    <button 
                      onClick={() => navigate('/dashboard/analytics')}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200 text-white/90 font-medium"
                    >
                      Analytics
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 text-blue-200/80 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 w-full group"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-1.5">
            <button 
              onClick={() => navigate('/dashboard/leave')}
              className="w-full p-2.5 text-blue-200/70 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              title="Quick Action"
            >
              <ClipboardDocumentCheckIcon className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full p-2.5 text-blue-200/70 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mx-auto group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;