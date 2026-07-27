// components/attendance/AttendanceTab.tsx
import React from 'react';
import { ThemeClasses, TeamMember } from '../types';
import StatusBadge from '../common/StatusBadge';

interface AttendanceTabProps {
  tc: ThemeClasses;
  teamMembers: TeamMember[];
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ tc, teamMembers }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Team Attendance</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Real-time presence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamMembers.map((member) => (
          <div key={member.id} className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow} flex items-center gap-4 hover:${tc.bgCardHover} transition-all duration-300`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
              member.status === 'On Leave' ? 'bg-yellow-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'
            }`}>
              {member.initials}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${tc.text}`}>{member.name}</p>
              <p className={`text-xs ${tc.textSecondary}`}>{member.role}</p>
              <StatusBadge status={member.status === 'On Leave' ? 'On Leave' : 'Working'} tc={tc} />
            </div>
          </div>
        ))}
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-4`}>Attendance Trend</h3>
        <p className={`text-sm ${tc.textSecondary} mb-4`}>Last 7 days - % present</p>
        <div className="h-48 flex items-end justify-between gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const heights = [85, 78, 92, 88, 95, 70, 75];
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t transition-all duration-500 hover:opacity-80" 
                  style={{ height: `${heights[i]}%`, minHeight: '20px' }}
                />
                <span className={`text-xs ${tc.textMuted} mt-2`}>{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTab;