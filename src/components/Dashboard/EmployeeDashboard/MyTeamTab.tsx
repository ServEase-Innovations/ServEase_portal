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
    fetchTeamData();
  }, [user]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';

      // Fetch all teams first
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
          
          // Use team members as the employee list
          if (userTeam) {
            setAllEmployees(userTeam.employees);
          }
        } else {
          // If no team, try to get all employees from all teams
          const allTeamEmployees = teams.flatMap(team => team.employees);
          setAllEmployees(allTeamEmployees);
        }
      } else {
        throw new Error('Failed to fetch team data. You may not have access to view teams.');
      }

    } catch (error: any) {
      console.error('Error fetching team data:', error);
      setError(error.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchy from employees
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

  const hierarchy = buildHierarchy(getFilteredEmployees());
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

  // Recursive component to render hierarchy
  const HierarchyNodeComponent: React.FC<{ node: HierarchyNode }> = ({ node }) => {
    const isExpanded = expandedNodes.has(node.employeeId);
    const hasReportees = node.reportees.length > 0;
    const indentLevel = node.level;

    return (
      <div className="relative">
        {/* Horizontal line connecting to parent */}
        {indentLevel > 0 && (
          <div
            className={`absolute left-0 top-8 w-6 h-px ${tc.border}`}
            style={{ left: `${(indentLevel - 1) * 2}rem` }}
          ></div>
        )}

        {/* Employee Card */}
        <div
          className={`relative ${tc.bgCard} rounded-xl ${tc.border} ${tc.shadow} mb-3 transition-all duration-300 hover:scale-[1.01]`}
          style={{ marginLeft: `${indentLevel * 2}rem` }}
        >
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Expand/Collapse Button */}
                {hasReportees && (
                  <button
                    onClick={() => toggleNode(node.employeeId)}
                    className={`flex-shrink-0 p-1 rounded-lg ${tc.bgCardHover} hover:bg-indigo-500/10 transition-colors`}
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-indigo-400" />
                    )}
                  </button>
                )}

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    {node.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    {getStatusDot(node.isActive, node.lastLogin)}
                  </div>
                </div>

                {/* Employee Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold ${tc.text} text-sm sm:text-base truncate`}>
                      {node.fullName}
                    </h3>
                    {node.employeeId === user?.id && (
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] sm:text-xs rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <p className={`text-xs sm:text-sm ${tc.textSecondary} truncate`}>
                    {node.assignedRole}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className={`text-[10px] sm:text-xs ${tc.textMuted} truncate`}>
                      {node.username}
                    </p>
                    <span className={`text-[10px] sm:text-xs ${tc.textMuted}`}>•</span>
                    <p className={`text-[10px] sm:text-xs ${tc.textMuted} truncate`}>
                      {node.assignedDepartment}
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2">
                  {getStatusBadge(node.isActive, node.lastLogin)}
                  
                  <div className="hidden sm:flex gap-1">
                    <button
                      className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors"
                      aria-label={`Chat with ${node.fullName}`}
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors"
                      aria-label={`Email ${node.fullName}`}
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reportees Count Badge */}
            {hasReportees && (
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[10px] sm:text-xs ${tc.textMuted} flex items-center gap-1`}>
                  <UserGroupIcon className="w-3 h-3" />
                  {node.reportees.length} {node.reportees.length === 1 ? 'Direct Report' : 'Direct Reports'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reportees */}
        {hasReportees && isExpanded && (
          <div className="relative">
            {/* Vertical line for children */}
            <div
              className={`absolute top-0 bottom-3 w-px ${tc.border}`}
              style={{ left: `${indentLevel * 2 + 1.5}rem` }}
            ></div>
            
            <div className="space-y-0">
              {node.reportees.map(reportee => (
                <HierarchyNodeComponent key={reportee.employeeId} node={reportee} />
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
          onClick={fetchTeamData}
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

      {/* Hierarchy View */}
      {hierarchy.length > 0 ? (
        <div className="space-y-0">
          {hierarchy.map(node => (
            <HierarchyNodeComponent key={node.employeeId} node={node} />
          ))}
        </div>
      ) : (
        <div className={`${tc.bgCard} p-8 sm:p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
          <UserGroupIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${tc.textMuted} mx-auto mb-3`} />
          <p className={tc.textSecondary}>No team members found matching your filters</p>
          {allEmployees.length === 0 && (
            <p className={`${tc.textMuted} text-sm mt-2`}>You are not assigned to any team yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MyTeamTab;
