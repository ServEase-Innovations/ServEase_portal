// tabs/MyTeamTab.tsx
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
  CalendarIcon
} from '@heroicons/react/24/outline';

interface MyTeamTabProps {
  theme: 'light' | 'dark';
  attendance: any;
}

interface TeamMember {
  employeeId: string;
  fullName: string;
  assignedRole: string;
  emailAddress: string;
  assignedDepartment: string;
  isActive: boolean;
  username: string;
  joinedAt: string | null;
  lastLogin: string | null;
}

interface Team {
  teamId: string;
  teamName: string;
  projectTitle: string;
  projectSummary: string | null;
  milestoneDeadline: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  employees: TeamMember[];
}

const MyTeamTab: React.FC<MyTeamTabProps> = ({ theme, attendance }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
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

      // Fetch all teams
      const response = await fetch(apiUrl + 'team', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }

      const teams: Team[] = await response.json();
      setAllTeams(teams);

      // Find the team that the current user belongs to
      if (user?.teamId) {
        const userTeam = teams.find(team => team.teamId === user.teamId);
        setTeamData(userTeam || null);
      } else {
        // If user doesn't have a team, show all employees from all teams
        setTeamData(null);
      }

    } catch (error: any) {
      console.error('Error fetching team data:', error);
      setError(error.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const teamMembers: TeamMember[] = teamData ? teamData.employees : allTeams.flatMap(team => team.employees);
  
  const departments = ['all', ...new Set(teamMembers.map(m => m.assignedDepartment))];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.assignedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.emailAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || member.assignedDepartment === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusBadge = (isActive: boolean, lastLogin: string | null) => {
    if (!isActive) {
      return <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium bg-gray-500/20 text-gray-400">Inactive</span>;
    }
    
    // Check if logged in recently (within last 30 minutes)
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
    return teamMembers.filter(m => {
      if (!m.isActive || !m.lastLogin) return false;
      const lastLoginTime = new Date(m.lastLogin).getTime();
      const now = Date.now();
      const diff = now - lastLoginTime;
      const minutes = diff / (1000 * 60);
      return minutes < 30;
    }).length;
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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <UsersIcon className="w-5 h-5 sm:w-8 sm:h-8 text-indigo-400" />
            <div>
              <p className={`text-lg sm:text-2xl font-bold ${tc.text}`}>{teamMembers.length}</p>
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

      {/* Search and Filters */}
      <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
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
      </div>

      {/* Team Members Grid */}

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {filteredMembers.map((member) => (
          <div key={member.employeeId} className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} ${tc.bgCardHover} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-base sm:text-lg md:text-xl">
                    {member.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1">
                    {getStatusDot(member.isActive, member.lastLogin)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-semibold ${tc.text} text-sm sm:text-base truncate`}>{member.fullName}</h3>
                  <p className={`text-xs sm:text-sm ${tc.textSecondary} truncate`}>{member.assignedRole}</p>
                  <p className={`text-[10px] sm:text-xs ${tc.textMuted} truncate`}>{member.username}</p>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-1.5 w-full sm:w-auto justify-start sm:justify-end">
                <button className="p-1.5 sm:p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors" aria-label={`Chat with ${member.fullName}`}>
                  <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button className="p-1.5 sm:p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors" aria-label={`Call ${member.fullName}`}>
                  <PhoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button className="p-1.5 sm:p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors" aria-label={`Video call with ${member.fullName}`}>
                  <VideoCameraIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <EnvelopeIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${tc.textMuted} flex-shrink-0`} />
                <span className={`${tc.textSecondary} truncate`}>{member.emailAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <BuildingOfficeIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${tc.textMuted} flex-shrink-0`} />
                <span className={`${tc.textSecondary} truncate`}>{member.assignedDepartment}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <CalendarIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${tc.textMuted} flex-shrink-0`} />
                <span className={`${tc.textSecondary} truncate`}>Joined {formatDate(member.joinedAt)}</span>
              </div>
            </div>

            <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 ${tc.border} border-t flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                {getStatusBadge(member.isActive, member.lastLogin)}
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs ${tc.textMuted}">
                <span>ID: {member.username}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className={`${tc.bgCard} p-8 sm:p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
          <UserGroupIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${tc.textMuted} mx-auto mb-3`} />
          <p className={tc.textSecondary}>No team members found matching your filters</p>
          {teamMembers.length === 0 && (
            <p className={`${tc.textMuted} text-sm mt-2`}>You are not assigned to any team yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MyTeamTab;