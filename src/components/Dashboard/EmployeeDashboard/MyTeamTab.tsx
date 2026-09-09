// tabs/MyTeamTab.tsx - Hierarchical Org Chart View
import React, { useState, useEffect } from 'react';
import { getThemeClasses } from './themeUtils';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  UserGroupIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface MyTeamTabProps {
  theme: 'light' | 'dark';
  attendance: any;
}

interface Employee {
  employeeId: string;
  fullName: string;
  assignedRole: string;
  emailAddress: string;
  assignedDepartment: string;
  isActive: boolean;
  username: string;
  joinedAt: string | null;
  lastLogin: string | null;
  managerId: string | null;
}

interface HierarchyNode extends Employee {
  reportees: HierarchyNode[];
  level: number;
}

interface Team {
  teamId: string;
  teamName: string;
  projectTitle: string;
  projectSummary: string | null;
  milestoneDeadline: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  employees: Employee[];
}

const MyTeamTab: React.FC<MyTeamTabProps> = ({ theme, attendance }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const tc = getThemeClasses(theme);
  const { user } = useAuth();

  useEffect(() => {
    fetchHierarchyData();
  }, [user]);

  const fetchHierarchyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';

      // Fetch employee's hierarchy
      const hierarchyResponse = await fetch(apiUrl + 'hierarchy/my-hierarchy', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (hierarchyResponse.ok) {
        const hierarchyData = await hierarchyResponse.json();
        
        // Build employee list from hierarchy
        const employees: Employee[] = [
          hierarchyData.currentEmployee,
          ...hierarchyData.managers,
          ...hierarchyData.directReports,
          ...hierarchyData.subReports
        ];

        setAllEmployees(employees);
        
        // Also try to fetch team data
        const teamsResponse = await fetch(apiUrl + 'teams', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (teamsResponse.ok) {
          const teams: Team[] = await teamsResponse.json();
          setAllTeams(teams);

          // Find the team that the current user belongs to
          if (user?.teamId) {
            const userTeam = teams.find(team => team.teamId === user.teamId);
            setTeamData(userTeam || null);
          }
        }
      } else {
        throw new Error('Failed to fetch hierarchy data');
      }

    } catch (error: any) {
      console.error('Error fetching hierarchy:', error);
      setError(error.message || 'Failed to load hierarchy data');
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchy centered on current user
  const buildUserCenteredHierarchy = (employees: Employee[]): HierarchyNode[] => {
    if (!user?.id) return buildHierarchy(employees);

    try {
      const hierarchy: HierarchyNode[] = [];
      const employeeMap = new Map<string, HierarchyNode>();

      // Find current user in the employee list
      const currentEmployee = employees.find(emp => emp.employeeId === user.id);
      
      if (!currentEmployee) {
        // If current user not found, fallback to normal hierarchy
        return buildHierarchy(employees);
      }

      // Helper to add employee to map
      const addToMap = (emp: Employee, level: number) => {
        if (!employeeMap.has(emp.employeeId)) {
          employeeMap.set(emp.employeeId, {
            ...emp,
            reportees: [],
            level
          });
        }
        return employeeMap.get(emp.employeeId)!;
      };

      // 1. Add current user at level 0
      addToMap(currentEmployee, 0);

      // 2. Build manager chain (up to 3 levels)
      let currentManagerId = currentEmployee.managerId;
      let managerLevel = -1;
      const processedManagers = new Set<string>();

      while (currentManagerId && managerLevel >= -3 && !processedManagers.has(currentManagerId)) {
        processedManagers.add(currentManagerId);
        const manager = employees.find(emp => emp.employeeId === currentManagerId);
        
        if (manager) {
          addToMap(manager, managerLevel);
          currentManagerId = manager.managerId;
          managerLevel--;
        } else {
          break;
        }
      }

      // 3. Add current user's direct reports (level 1)
      const directReports = employees.filter(emp => 
        emp.managerId && emp.managerId.toString() === currentEmployee.employeeId.toString()
      );

      directReports.forEach(report => {
        addToMap(report, 1);
        
        // 4. Add their direct reports (level 2)
        const subReports = employees.filter(emp => 
          emp.managerId && emp.managerId.toString() === report.employeeId.toString()
        );
        subReports.forEach(subReport => {
          addToMap(subReport, 2);
        });
      });

      // Build the tree structure
      employeeMap.forEach((node, id) => {
        if (node.level < 0) {
          // This is a manager above current user
          const directReport = Array.from(employeeMap.values()).find(
            emp => emp.managerId && emp.managerId.toString() === id && emp.level === node.level + 1
          );
          if (directReport) {
            node.reportees.push(directReport);
          }
        } else if (node.level === 0) {
          // This is the current user - add their direct reports
          const reports = Array.from(employeeMap.values()).filter(
            emp => emp.managerId && emp.managerId.toString() === id && emp.level === 1
          );
          node.reportees.push(...reports);
        } else if (node.level === 1) {
          // Direct reports - add their sub-reports
          const subReports = Array.from(employeeMap.values()).filter(
            emp => emp.managerId && emp.managerId.toString() === id && emp.level === 2
          );
          node.reportees.push(...subReports);
        }
      });

      // Find the root (top-most manager or current user if no manager)
      const root = Array.from(employeeMap.values()).find(
        node => node.level === Math.min(...Array.from(employeeMap.values()).map(n => n.level))
      );
      
      return root ? [root] : buildHierarchy(employees);

    } catch (error) {
      console.error('Error building user-centered hierarchy:', error);
      return buildHierarchy(employees);
    }
  };

  // Fallback: Build hierarchy from employees
  const buildHierarchy = (employees: Employee[]): HierarchyNode[] => {
    const employeeMap = new Map<string, HierarchyNode>();
    const rootNodes: HierarchyNode[] = [];

    // Create nodes for all employees
    employees.forEach(emp => {
      employeeMap.set(emp.employeeId, {
        ...emp,
        reportees: [],
        level: 0
      });
    });

    // Build the tree structure
    employees.forEach(emp => {
      const node = employeeMap.get(emp.employeeId);
      if (node) {
        if (emp.managerId) {
          const manager = employeeMap.get(emp.managerId);
          if (manager) {
            manager.reportees.push(node);
            node.level = manager.level + 1;
          } else {
            // Manager not in the list, treat as root
            rootNodes.push(node);
          }
        } else {
          // No manager, this is a root node
          rootNodes.push(node);
        }
      }
    });

    return rootNodes;
  };

  // Get employees to display based on team/department filter
  const getFilteredEmployees = (): Employee[] => {
    let employees = allEmployees;

    // Apply department filter
    if (selectedDepartment !== 'all') {
      employees = employees.filter(e => e.assignedDepartment === selectedDepartment);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      employees = employees.filter(e =>
        e.fullName.toLowerCase().includes(query) ||
        e.assignedRole.toLowerCase().includes(query) ||
        e.emailAddress.toLowerCase().includes(query) ||
        e.username.toLowerCase().includes(query)
      );
    }

    return employees;
  };

  const [hierarchy, setHierarchy] = React.useState<HierarchyNode[]>([]);

  React.useEffect(() => {
    if (user?.id && allEmployees.length > 0) {
      const userHierarchy = buildUserCenteredHierarchy(allEmployees);
      setHierarchy(userHierarchy);
    }
  }, [user, allEmployees, searchQuery, selectedDepartment]);

  const allFilteredEmployees = getFilteredEmployees();
  const departments = ['all', ...new Set(allEmployees.map(m => m.assignedDepartment))];

  const toggleNode = (employeeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set(allEmployees.map(e => e.employeeId));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getStatusBadge = (isActive: boolean, lastLogin: string | null) => {
    if (!isActive) {
      return <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium bg-gray-500/20 text-gray-400">Inactive</span>;
    }
    
    if (lastLogin) {
      const lastLoginTime = new Date(lastLogin).getTime();
      const now = Date.now();
      const diff = now - lastLoginTime;
      const minutes = diff / (1000 * 60);
      
      if (minutes < 30) {
        return <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium bg-emerald-500/20 text-emerald-400">Online</span>;
      }
    }
    
    return <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium bg-gray-500/20 text-gray-400">Offline</span>;
  };

  const getStatusDot = (isActive: boolean, lastLogin: string | null) => {
    if (!isActive) {
      return <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block bg-gray-400"></span>;
    }
    
    if (lastLogin) {
      const lastLoginTime = new Date(lastLogin).getTime();
      const now = Date.now();
      const diff = now - lastLoginTime;
      const minutes = diff / (1000 * 60);
      
      if (minutes < 30) {
        return <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block bg-emerald-500"></span>;
      }
    }
    
    return <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block bg-gray-400"></span>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getOnlineCount = () => {
    return allFilteredEmployees.filter(m => {
      if (!m.isActive || !m.lastLogin) return false;
      const lastLoginTime = new Date(m.lastLogin).getTime();
      const now = Date.now();
      const diff = now - lastLoginTime;
      const minutes = diff / (1000 * 60);
      return minutes < 30;
    }).length;
  };

  // Recursive component to render hierarchy in graph format
  const HierarchyNodeComponent: React.FC<{ node: HierarchyNode; isLast?: boolean }> = ({ node, isLast = false }) => {
    const isExpanded = expandedNodes.has(node.employeeId);
    const hasReportees = node.reportees.length > 0;
    const indentLevel = Math.max(0, node.level); // Ensure non-negative
    const isCurrentUser = node.employeeId === user?.id;
    const isManagerAbove = node.level < 0;

    return (
      <div className="relative">
        {/* Connection lines */}
        {indentLevel > 0 && !isManagerAbove && (
          <>
            {/* Vertical line from parent */}
            <div
              className={`absolute top-0 w-px ${isCurrentUser ? 'bg-gradient-to-b from-indigo-500 to-purple-500' : 'bg-gradient-to-b from-indigo-500/30 to-purple-500/30'}`}
              style={{
                left: `${(indentLevel - 1) * 2.5 + 0.5}rem`,
                height: '2.5rem'
              }}
            ></div>
            {/* Horizontal line to card */}
            <div
              className={`absolute top-10 h-px ${isCurrentUser ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30'}`}
              style={{
                left: `${(indentLevel - 1) * 2.5 + 0.5}rem`,
                width: '2rem'
              }}
            ></div>
            {/* Connection dot */}
            <div
              className={`absolute w-2 h-2 rounded-full ${isCurrentUser ? 'bg-indigo-500 border-2 border-indigo-400' : 'bg-indigo-500/50 border-2 border-indigo-400/50'}`}
              style={{
                left: `${(indentLevel - 1) * 2.5 + 0.5}rem`,
                top: '2.5rem',
                transform: 'translate(-50%, -50%)'
              }}
            ></div>
          </>
        )}

        {/* Employee Card with enhanced styling */}
        <div
          className={`relative ${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} mb-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
            isCurrentUser ? 'ring-2 ring-indigo-500 shadow-indigo-500/20 hover:shadow-indigo-500/30' : 
            isManagerAbove ? 'hover:shadow-blue-500/10' :
            'hover:shadow-indigo-500/10'
          }`}
          style={{ 
            marginLeft: `${Math.max(0, indentLevel) * 2.5}rem`,
            background: isCurrentUser 
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)'
              : isManagerAbove
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)'
              : undefined
          }}
        >
          {/* Role indicator bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
            isCurrentUser ? 'bg-gradient-to-b from-indigo-500 to-purple-500' :
            isManagerAbove ? 'bg-gradient-to-b from-blue-500 to-cyan-500' :
            indentLevel === 0 ? 'bg-gradient-to-b from-indigo-500 to-purple-500' :
            indentLevel === 1 ? 'bg-gradient-to-b from-blue-500 to-cyan-500' :
            'bg-gradient-to-b from-emerald-500 to-teal-500'
          }`}></div>

          <div className="p-4 sm:p-5 pl-5 sm:pl-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Expand/Collapse Button */}
                {hasReportees && (
                  <button
                    onClick={() => toggleNode(node.employeeId)}
                    className={`flex-shrink-0 p-2 rounded-xl ${tc.bgCardHover} hover:bg-indigo-500/20 transition-all duration-200 mt-1 ring-2 ${
                      isExpanded ? 'ring-indigo-500/50 bg-indigo-500/10' : 'ring-transparent'
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5 text-indigo-400" />
                    )}
                  </button>
                )}

                {/* Avatar with level-based styling */}
                <div className="relative flex-shrink-0 mt-1">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${
                    isCurrentUser ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 ring-4 ring-indigo-500/30' :
                    isManagerAbove ? 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500' :
                    indentLevel === 0 ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' :
                    indentLevel === 1 ? 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500' :
                    'bg-gradient-to-br from-emerald-500 via-green-500 to-lime-500'
                  } flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg ${
                    isCurrentUser ? 'shadow-indigo-500/50' : isManagerAbove ? 'shadow-blue-500/30' : 'shadow-blue-500/30'
                  }`}>
                    {node.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 ring-2 ring-white dark:ring-gray-800 rounded-full">
                    {getStatusDot(node.isActive, node.lastLogin)}
                  </div>
                  {/* Level badges */}
                  {isManagerAbove && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      ⬆️
                    </div>
                  )}
                  {isCurrentUser && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      ⭐
                    </div>
                  )}
                </div>

                {/* Employee Info */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className={`font-bold ${tc.text} text-base sm:text-lg truncate`}>
                      {node.fullName}
                    </h3>
                    {isCurrentUser && (
                      <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-400 text-xs rounded-full border border-indigo-500/50 font-bold animate-pulse">
                        YOU
                      </span>
                    )}
                    {isManagerAbove && (
                      <span className="px-2.5 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30 font-semibold">
                        Your Manager
                      </span>
                    )}
                    {getStatusBadge(node.isActive, node.lastLogin)}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <BriefcaseIcon className="w-4 h-4 text-indigo-400/70" />
                    <p className={`text-sm sm:text-base ${tc.textSecondary} font-medium truncate`}>
                      {node.assignedRole}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="w-3.5 h-3.5 text-gray-400" />
                      <p className={`text-xs sm:text-sm ${tc.textMuted}`}>
                        {node.username}
                      </p>
                    </div>
                    <span className={`text-xs ${tc.textMuted}`}>•</span>
                    <div className="flex items-center gap-1.5">
                      <BuildingOfficeIcon className="w-3.5 h-3.5 text-gray-400" />
                      <p className={`text-xs sm:text-sm ${tc.textMuted}`}>
                        {node.assignedDepartment}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
                    <p className={`text-xs ${tc.textMuted} truncate`}>
                      {node.emailAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    className="p-2 rounded-xl hover:bg-indigo-500/10 text-indigo-400 transition-all duration-200 hover:scale-110"
                    aria-label={`Chat with ${node.fullName}`}
                    title="Send Message"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 rounded-xl hover:bg-blue-500/10 text-blue-400 transition-all duration-200 hover:scale-110"
                    aria-label={`Email ${node.fullName}`}
                    title="Send Email"
                  >
                    <EnvelopeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Reportees Count Badge */}
            {hasReportees && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${tc.textMuted} flex items-center gap-2`}>
                    <UserGroupIcon className="w-4 h-4" />
                    <span className="font-medium">
                      {node.reportees.length} {node.reportees.length === 1 ? 'Direct Report' : 'Direct Reports'}
                    </span>
                  </span>
                  {isExpanded && (
                    <span className="text-xs text-indigo-400 font-medium">
                      Click to collapse ↑
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reportees with connection lines */}
        {hasReportees && isExpanded && (
          <div className="relative pl-5">
            {/* Main vertical line for all children */}
            <div
              className={`absolute top-0 w-px bg-gradient-to-b from-indigo-500/30 to-transparent`}
              style={{
                left: `${Math.max(0, indentLevel) * 2.5 + 0.5}rem`,
                height: '100%'
              }}
            ></div>
            
            <div className="space-y-0">
              {node.reportees.map((reportee, idx) => (
                <HierarchyNodeComponent 
                  key={reportee.employeeId} 
                  node={reportee}
                  isLast={idx === node.reportees.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} text-center`}>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchHierarchyData}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Team Info Banner */}
      {teamData && (
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold ${tc.text} mb-1`}>{teamData.teamName}</h2>
              <p className={`text-sm sm:text-base ${tc.textSecondary} mb-2`}>{teamData.projectTitle}</p>
              {teamData.projectSummary && (
                <p className={`text-xs sm:text-sm ${tc.textMuted}`}>{teamData.projectSummary}</p>
              )}
            </div>
            {teamData.milestoneDeadline && (
              <div className={`${tc.bgCardHover} px-4 py-3 rounded-xl ${tc.border}`}>
                <div className="flex items-center gap-2">
                  <CalendarIcon className={`w-5 h-5 ${tc.textMuted}`} />
                  <div>
                    <p className={`text-xs ${tc.textMuted}`}>Milestone</p>
                    <p className={`text-sm font-semibold ${tc.text}`}>{formatDate(teamData.milestoneDeadline)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <UsersIcon className="w-5 h-5 sm:w-8 sm:h-8 text-indigo-400" />
            <div>
              <p className={`text-lg sm:text-2xl font-bold ${tc.text}`}>{allFilteredEmployees.length}</p>
              <p className={`text-[8px] sm:text-xs ${tc.textMuted}`}>Total Members</p>
            </div>
          </div>
        </div>
        <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div>
              <p className={`text-lg sm:text-2xl font-bold ${tc.text}`}>{getOnlineCount()}</p>
              <p className={`text-[8px] sm:text-xs ${tc.textMuted}`}>Online Now</p>
            </div>
          </div>
        </div>
        <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <BriefcaseIcon className="w-5 h-5 sm:w-8 sm:h-8 text-blue-400" />
            <div>
              <p className={`text-lg sm:text-2xl font-bold ${tc.text}`}>{departments.length - 1}</p>
              <p className={`text-[8px] sm:text-xs ${tc.textMuted}`}>Departments</p>
            </div>
          </div>
        </div>
        <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <UserGroupIcon className="w-5 h-5 sm:w-8 sm:h-8 text-purple-400" />
            <div>
              <p className={`text-lg sm:text-2xl font-bold ${tc.text}`}>{allTeams.length}</p>
              <p className={`text-[8px] sm:text-xs ${tc.textMuted}`}>Total Teams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filters, and Controls */}
      <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              aria-label="Filter by department"
              className={`px-3 sm:px-4 py-1.5 sm:py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
          
          {/* View Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-xs sm:text-sm bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-xs sm:text-sm bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors"
              >
                Collapse All
              </button>
            </div>
            
            <div className={`text-xs sm:text-sm ${tc.textMuted}`}>
              Showing {allFilteredEmployees.length} member{allFilteredEmployees.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchy View with enhanced header */}
      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <UserGroupIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${tc.text}`}>Organization Chart</h3>
              <p className={`text-sm ${tc.textMuted}`}>Hierarchical structure showing reporting relationships</p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-xl ${tc.bgCardHover} ${tc.border}`}>
            <p className={`text-xs ${tc.textMuted}`}>Levels: <span className={`font-bold ${tc.text}`}>{Math.max(...hierarchy.map(h => getMaxDepth(h))) + 1}</span></p>
          </div>
        </div>

        {hierarchy.length > 0 ? (
          <div className="space-y-0 overflow-x-auto">
            {hierarchy.map(node => (
              <HierarchyNodeComponent key={node.employeeId} node={node} />
            ))}
          </div>
        ) : (
          <div className={`${tc.bgCardHover} p-8 sm:p-12 rounded-2xl ${tc.border} text-center`}>
            <UserGroupIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${tc.textMuted} mx-auto mb-3`} />
            <p className={tc.textSecondary}>No team members found matching your filters</p>
            {allEmployees.length === 0 && (
              <p className={`${tc.textMuted} text-sm mt-2`}>You are not assigned to any team yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get max depth
const getMaxDepth = (node: HierarchyNode): number => {
  if (node.reportees.length === 0) return node.level;
  return Math.max(...node.reportees.map(r => getMaxDepth(r)));
};

export default MyTeamTab;
