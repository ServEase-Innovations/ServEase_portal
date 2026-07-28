// src/pages/HRDashboard/components/attendance/AttendanceTab.tsx

import React from 'react';
import { ThemeClasses } from '../types';

interface AttendanceTabProps {
  themeClasses: ThemeClasses;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ themeClasses }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayPercentages = [92, 95, 89, 93, 88, 41, 12];
  const departments = ['Platform', 'Design', 'Product', 'DevOps', 'Marketing', 'Sales', 'HR', 'Finance'];
  const deptPercentages = [92, 88, 95, 85, 78, 90, 96, 89];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>Attendance Monitoring</h2>
        <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>Live presence across departments today</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {days.map((day, i) => (
          <div key={i} className={`${themeClasses.bgCard} p-2 sm:p-4 rounded-2xl ${themeClasses.border} ${themeClasses.shadow} text-center`}>
            <p className={`text-[8px] sm:text-sm font-medium ${themeClasses.textSecondary}`}>{day}</p>
            <p className={`text-sm sm:text-2xl font-bold ${
              dayPercentages[i] >= 85 ? 'text-emerald-400' : 
              dayPercentages[i] >= 70 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {dayPercentages[i]}%
            </p>
            <div className="w-full bg-gray-200/20 rounded-full h-1 sm:h-1.5 mt-1 sm:mt-2">
              <div 
                className={`h-1 sm:h-1.5 rounded-full ${
                  dayPercentages[i] >= 85 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                  dayPercentages[i] >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                }`} 
                style={{ width: `${dayPercentages[i]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
        <h3 className={`font-semibold ${themeClasses.text} mb-3 sm:mb-4 text-base sm:text-lg`}>Department-wise Attendance</h3>
        <div className="space-y-2 sm:space-y-4">
          {departments.map((dept, i) => (
            <div key={i} className={`flex items-center justify-between ${themeClasses.bgTableHover} p-1.5 sm:p-2 rounded-xl transition-colors gap-2`}>
              <span className={`text-[10px] sm:text-sm font-medium ${themeClasses.text} w-14 sm:w-24 flex-shrink-0 truncate`}>{dept}</span>
              <div className="flex-1 mx-2 sm:mx-4 min-w-[30px]">
                <div className="w-full bg-gray-200/20 rounded-full h-1.5 sm:h-2.5 overflow-hidden">
                  <div 
                    className={`h-1.5 sm:h-2.5 rounded-full transition-all duration-500 ${
                      deptPercentages[i] >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                      deptPercentages[i] >= 80 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                    }`} 
                    style={{ width: `${deptPercentages[i]}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 w-16 sm:w-32 justify-end flex-shrink-0">
                <span className={`text-[10px] sm:text-sm font-semibold w-8 sm:w-12 text-right ${themeClasses.text}`}>{deptPercentages[i]}%</span>
                <span className={`text-[8px] sm:text-xs ${themeClasses.textMuted} hidden sm:inline`}>{Math.round(deptPercentages[i] * 0.15)} present</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};