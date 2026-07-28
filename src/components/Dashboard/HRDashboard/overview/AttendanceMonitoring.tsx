// src/pages/HRDashboard/components/overview/AttendanceMonitoring.tsx

import React from 'react';
import { ThemeClasses } from '../types';

interface AttendanceMonitoringProps {
  themeClasses: ThemeClasses;
}

export const AttendanceMonitoring: React.FC<AttendanceMonitoringProps> = ({ themeClasses }) => {
  const departments = ['Platform', 'Design', 'Product', 'DevOps', 'Marketing', 'Sales'];
  const percentages = [92, 88, 95, 85, 78, 90];

  return (
    <div className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
      <h3 className={`font-semibold ${themeClasses.text} mb-1 sm:mb-2 text-base sm:text-lg`}>Attendance Monitoring</h3>
      <p className={`${themeClasses.textSecondary} text-sm mb-3 sm:mb-4`}>Live presence across departments today</p>
      <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
        {departments.map((dept, i) => (
          <div key={i} className={`flex items-center justify-between ${themeClasses.bgTableHover} p-1 rounded-xl transition-colors gap-2`}>
            <span className={`text-xs sm:text-sm font-medium ${themeClasses.text} w-16 sm:w-24 flex-shrink-0 truncate`}>{dept}</span>
            <div className="flex-1 mx-2 sm:mx-4 min-w-[40px]">
              <div className="w-full bg-gray-200/20 rounded-full h-1.5 sm:h-2 overflow-hidden">
                <div 
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                    percentages[i] >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                    percentages[i] >= 80 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                  }`} 
                  style={{ width: `${percentages[i]}%` }}
                />
              </div>
            </div>
            <span className={`text-xs sm:text-sm font-semibold w-10 sm:w-12 text-right ${themeClasses.text} flex-shrink-0`}>{percentages[i]}%</span>
          </div>
        ))}
      </div>
      <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 ${themeClasses.border} border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0`}>
        <span className={`text-[10px] sm:text-xs ${themeClasses.textMuted}`}>22 working days this month</span>
        <button className={`text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors`}>View details →</button>
      </div>
    </div>
  );
};