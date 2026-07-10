// tabs/MyTeamTab.tsx
import React, { useState } from 'react';
import { getThemeClasses } from './themeUtils';
import {
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface MyTeamTabProps {
  theme: 'light' | 'dark';
  attendance: any;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  location: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  avatar?: string;
  joinDate: string;
  reportsTo: string;
  skills: string[];
  projects: string[];
}

const MyTeamTab: React.FC<MyTeamTabProps> = ({ theme, attendance }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const tc = getThemeClasses(theme);

  const teamMembers: TeamMember[] = [
    {
      id: 'EMP-001',
      name: 'Priya Nair',
      role: 'Engineering Manager',
      email: 'priya.nair@serveasein.com',
      department: 'Engineering',
      location: 'Gurugram, India',
      status: 'online',
      joinDate: '2024-01-15',
      reportsTo: 'Aarav Mehta',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      projects: ['Atlas Core', 'HRMS Platform']
    },
    {
      id: 'EMP-002',
      name: 'Rohan Verma',
      role: 'Senior Software Engineer',
      email: 'rohan.verma@serveasein.com',
      department: 'Engineering',
      location: 'Bangalore, India',
      status: 'online',
      joinDate: '2024-03-01',
      reportsTo: 'Priya Nair',
      skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
      projects: ['Atlas Core']
    },
    {
      id: 'EMP-003',
      name: 'Ishita Roy',
      role: 'Software Engineer',
      email: 'ishita.roy@serveasein.com',
      department: 'Engineering',
      location: 'Gurugram, India',
      status: 'busy',
      joinDate: '2024-06-10',
      reportsTo: 'Priya Nair',
      skills: ['React', 'JavaScript', 'CSS', 'Figma'],
      projects: ['Atlas Core']
    },
    {
      id: 'EMP-004',
      name: 'Amit Patel',
      role: 'DevOps Engineer',
      email: 'amit.patel@serveasein.com',
      department: 'DevOps',
      location: 'Mumbai, India',
      status: 'away',
      joinDate: '2024-02-20',
      reportsTo: 'Priya Nair',
      skills: ['Kubernetes', 'Docker', 'Jenkins', 'Terraform'],
      projects: ['Atlas Core', 'CI/CD Pipeline']
    },
    {
      id: 'EMP-005',
      name: 'Sanya Kapoor',
      role: 'HR Business Partner',
      email: 'sanya.kapoor@serveasein.com',
      department: 'Human Resources',
      location: 'Gurugram, India',
      status: 'online',
      joinDate: '2023-11-01',
      reportsTo: 'Aarav Mehta',
      skills: ['Recruitment', 'Employee Relations', 'Performance Management'],
      projects: ['Talent Acquisition', 'Culture Building']
    },
    {
      id: 'EMP-006',
      name: 'Vikram Singh',
      role: 'QA Lead',
      email: 'vikram.singh@serveasein.com',
      department: 'Quality Assurance',
      location: 'Pune, India',
      status: 'offline',
      joinDate: '2024-04-15',
      reportsTo: 'Priya Nair',
      skills: ['Selenium', 'Cypress', 'Automation Testing', 'API Testing'],
      projects: ['Atlas Core', 'Testing Framework']
    },
    {
      id: 'EMP-007',
      name: 'Neha Gupta',
      role: 'Product Manager',
      email: 'neha.gupta@serveasein.com',
      department: 'Product',
      location: 'Gurugram, India',
      status: 'online',
      joinDate: '2024-01-10',
      reportsTo: 'Aarav Mehta',
      skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics'],
      projects: ['Atlas Core', 'Product Roadmap']
    }
  ];

  const departments = ['all', ...new Set(teamMembers.map(m => m.department))];
  const statuses = ['all', 'online', 'offline', 'away', 'busy'];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      online: { label: 'Online', class: tc.statusOnline },
      offline: { label: 'Offline', class: tc.statusOffline },
      away: { label: 'Away', class: tc.statusAway },
      busy: { label: 'Busy', class: tc.statusBusy },
    };
    const s = statusMap[status as keyof typeof statusMap] || statusMap.offline;
    return <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${s.class}`}>{s.label}</span>;
  };

  const getStatusDot = (status: string) => {
    const colors = {
      online: 'bg-emerald-500',
      offline: 'bg-gray-400',
      away: 'bg-amber-500',
      busy: 'bg-rose-500',
    };
    return <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block ${colors[status as keyof typeof colors]}`}></span>;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
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
              <p className={`text-lg sm:text-2xl font-bold ${tc.text}`}>{teamMembers.filter(m => m.status === 'online').length}</p>
              <p className={`text-[8px] sm:text-xs ${tc.textMuted}`}>Online Now</p>
            </div>
          </div>
        </div>
        <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <BriefcaseIcon className="w-5 h-5 sm:w-8 sm:h-8 text-blue-400" />
            <div>
              <p className={`text-lg sm:text-2xl font-bold ${tc.text}`}>{new Set(teamMembers.map(m => m.department)).size}</p>
              <p className={`text-[8px] sm:text-xs ${tc.textMuted}`}>Departments</p>
            </div>
          </div>
        </div>
        <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <BuildingOfficeIcon className="w-5 h-5 sm:w-8 sm:h-8 text-purple-400" />
            <div>
              <p className={`text-lg sm:text-2xl font-bold ${tc.text}`}>{new Set(teamMembers.map(m => m.location)).size}</p>
              <p className={`text-[8px] sm:text-xs ${tc.textMuted}`}>Locations</p>
            </div>
          </div>
        </div>
      </div>

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
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by status"
            className={`px-3 sm:px-4 py-1.5 sm:py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} ${tc.bgCardHover} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-base sm:text-lg md:text-xl">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1">
                    {getStatusDot(member.status)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-semibold ${tc.text} text-sm sm:text-base truncate`}>{member.name}</h3>
                  <p className={`text-xs sm:text-sm ${tc.textSecondary} truncate`}>{member.role}</p>
                  <p className={`text-[10px] sm:text-xs ${tc.textMuted} truncate`}>{member.id}</p>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-1.5 w-full sm:w-auto justify-start sm:justify-end">
                <button className="p-1.5 sm:p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors" aria-label={`Chat with ${member.name}`}>
                  <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button className="p-1.5 sm:p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors" aria-label={`Call ${member.name}`}>
                  <PhoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button className="p-1.5 sm:p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors" aria-label={`Video call with ${member.name}`}>
                  <VideoCameraIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <EnvelopeIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${tc.textMuted} flex-shrink-0`} />
                <span className={`${tc.textSecondary} truncate`}>{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <MapPinIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${tc.textMuted} flex-shrink-0`} />
                <span className={`${tc.textSecondary} truncate`}>{member.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <BuildingOfficeIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${tc.textMuted} flex-shrink-0`} />
                <span className={`${tc.textSecondary} truncate`}>{member.department}</span>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1">
              {member.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-xs rounded-full ${tc.border} ${tc.textMuted}`}>
                  {skill}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-xs rounded-full ${tc.border} ${tc.textMuted}`}>
                  +{member.skills.length - 3}
                </span>
              )}
            </div>

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 ${tc.border} border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                {getStatusBadge(member.status)}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs ${tc.textMuted}">
                <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className={`${tc.bgCard} p-8 sm:p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
          <UserGroupIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${tc.textMuted} mx-auto mb-3`} />
          <p className={tc.textSecondary}>No team members found matching your filters</p>
        </div>
      )}
    </div>
  );
};

export default MyTeamTab;