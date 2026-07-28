// src/pages/HRDashboard/components/holidays/HolidaysTab.tsx

import React from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Holiday, ThemeClasses } from '../types';

interface HolidaysTabProps {
  holidays: Holiday[];
  themeClasses: ThemeClasses;
  getStatusColor: (status: string) => string;
}

export const HolidaysTab: React.FC<HolidaysTabProps> = ({ 
  holidays, 
  themeClasses,
  getStatusColor 
}) => {
  const nationalCount = holidays.filter(h => h.type === 'National').length;
  const regionalCount = holidays.filter(h => h.type === 'Regional').length;
  const optionalCount = holidays.filter(h => h.type === 'Optional').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>Holiday Calendar</h2>
          <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>Manage national, regional and optional holidays for FY26</p>
        </div>
        <button 
          type="button"
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 sm:gap-2"
          aria-label="Add new holiday"
        >
          <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          Add Holiday
        </button>
      </div>

      <div className={`${themeClasses.bgCard} rounded-2xl ${themeClasses.border} ${themeClasses.shadow} overflow-hidden`}>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[500px] sm:min-w-0">
            <thead>
              <tr className={`text-left text-[10px] sm:text-xs ${themeClasses.tableHeader} ${themeClasses.border} border-b`}>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Date</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Holiday Name</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Type</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Status</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday.id} className={`${themeClasses.border} border-b last:border-0 ${themeClasses.bgTableHover} transition-colors`}>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary}`}>{holiday.date}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 font-medium ${themeClasses.text} text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none`}>{holiday.name}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(holiday.type)} whitespace-nowrap`}>
                      {holiday.type}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                    <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] sm:text-xs">Active</span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button 
                        type="button"
                        className={`p-1 ${themeClasses.bgTableHover} rounded transition-colors`}
                        aria-label={`Edit holiday ${holiday.name}`}
                        title={`Edit holiday ${holiday.name}`}
                      >
                        <PencilIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${themeClasses.textMuted}`} aria-hidden="true" />
                      </button>
                      <button 
                        type="button"
                        className={`p-1 ${themeClasses.bgTableHover} rounded transition-colors`}
                        aria-label={`Delete holiday ${holiday.name}`}
                        title={`Delete holiday ${holiday.name}`}
                      >
                        <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-500/10 p-3 sm:p-4 rounded-2xl border border-blue-500/20">
          <h4 className="font-semibold text-blue-400 text-sm sm:text-base">National Holidays</h4>
          <p className="text-xl sm:text-2xl font-bold text-blue-400">{nationalCount}</p>
          <p className="text-[10px] sm:text-xs text-blue-400/70">Official holidays</p>
        </div>
        <div className="bg-purple-500/10 p-3 sm:p-4 rounded-2xl border border-purple-500/20">
          <h4 className="font-semibold text-purple-400 text-sm sm:text-base">Regional Holidays</h4>
          <p className="text-xl sm:text-2xl font-bold text-purple-400">{regionalCount}</p>
          <p className="text-[10px] sm:text-xs text-purple-400/70">State-specific</p>
        </div>
        <div className="bg-gray-500/10 p-3 sm:p-4 rounded-2xl border border-gray-500/20">
          <h4 className="font-semibold text-gray-400 text-sm sm:text-base">Optional Holidays</h4>
          <p className="text-xl sm:text-2xl font-bold text-gray-400">{optionalCount}</p>
          <p className="text-[10px] sm:text-xs text-gray-400/70">Employee choice</p>
        </div>
      </div>
    </div>
  );
};