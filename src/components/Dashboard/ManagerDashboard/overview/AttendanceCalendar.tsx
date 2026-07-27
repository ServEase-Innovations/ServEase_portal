// components/overview/AttendanceCalendar.tsx
import React from 'react';
import { ThemeClasses } from '../types';

interface AttendanceCalendarProps {
  tc: ThemeClasses;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ tc }) => {
  return (
    <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
      <h3 className={`font-semibold ${tc.text} mb-2 sm:mb-4 text-base sm:text-lg`}>Attendance Calendar</h3>
      <p className={`text-sm ${tc.textSecondary} mb-3 sm:mb-4`}>June 2026 - previous days are read-only</p>
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-sm">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
          <div key={i} className={`text-[8px] sm:text-xs ${tc.textMuted} font-medium py-1`}>{day}</div>
        ))}
        {Array.from({ length: 30 }, (_, i) => i + 1).map((date) => {
          let bgColor = 'text-gray-400';
          let textColor = 'text-gray-400';
          if (date <= 18 && date >= 3) {
            bgColor = 'bg-emerald-500/20';
            textColor = 'text-emerald-400';
          } else if (date === 19 || date === 20) {
            bgColor = 'bg-rose-500/20';
            textColor = 'text-rose-400';
          } else if (date === 21) {
            bgColor = 'bg-amber-500/20';
            textColor = 'text-amber-400';
          } else if (date === 22) {
            bgColor = 'bg-indigo-500/20';
            textColor = 'text-indigo-400';
          }
          return (
            <div key={date} className={`py-0.5 sm:py-1 rounded ${bgColor} ${textColor} text-[10px] sm:text-sm`}>
              {date}
            </div>
          );
        })}
      </div>
      <div className={`flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 ${tc.border} border-t`}>
        <span className={`flex items-center text-[10px] sm:text-xs ${tc.textSecondary}`}><span className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500/30 rounded inline-block mr-1"></span> Working</span>
        <span className={`flex items-center text-[10px] sm:text-xs ${tc.textSecondary}`}><span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500/30 rounded inline-block mr-1"></span> WFH</span>
        <span className={`flex items-center text-[10px] sm:text-xs ${tc.textSecondary}`}><span className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-500/30 rounded inline-block mr-1"></span> Half-Day</span>
        <span className={`flex items-center text-[10px] sm:text-xs ${tc.textSecondary}`}><span className="w-2 h-2 sm:w-3 sm:h-3 bg-rose-500/30 rounded inline-block mr-1"></span> Leave</span>
        <span className={`flex items-center text-[10px] sm:text-xs ${tc.textSecondary}`}><span className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500/30 rounded inline-block mr-1"></span> Holiday</span>
      </div>
    </div>
  );
};

export default AttendanceCalendar;