// components/team/MyTeamTab.tsx
import React, { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ThemeClasses, TeamMember } from '../types';
import StatusBadge from '../common/StatusBadge';

interface MyTeamTabProps {
  tc: ThemeClasses;
  teamMembers: TeamMember[];
}

const MyTeamTab: React.FC<MyTeamTabProps> = ({ tc, teamMembers }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>My Team</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Members of the Platform squad</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className={`w-4 h-4 ${tc.textMuted} absolute left-3 top-1/2 transform -translate-y-1/2`} />
            <input
              type="text"
              placeholder="Search members..."
              className={`pl-9 pr-4 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search team members"
            />
          </div>
          <button 
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            aria-label="Add new team member"
          >
            <PlusIcon className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-6 py-3 font-medium">Member</th>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                        member.status === 'On Leave' ? 'bg-yellow-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                      }`}>
                        {member.initials}
                      </div>
                      <div>
                        <p className={`font-medium ${tc.text}`}>{member.name}</p>
                        <p className={`text-xs ${tc.textSecondary}`}>{member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{member.id}</td>
                  <td className={`px-6 py-4 text-sm ${tc.text}`}>{member.role}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={member.status} tc={tc} />
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{member.joined}</td>
                  <td className="px-6 py-4">
                    <button 
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                      aria-label={`View ${member.name}'s profile`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyTeamTab;