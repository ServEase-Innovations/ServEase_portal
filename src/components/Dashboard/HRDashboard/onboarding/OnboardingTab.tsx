// src/pages/HRDashboard/components/onboarding/OnboardingTab.tsx

import React from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { OnboardingEmployee, ThemeClasses } from '../types';

interface OnboardingTabProps {
  employees: OnboardingEmployee[];
  themeClasses: ThemeClasses;
  onOnboardNew: () => void;
}

export const OnboardingTab: React.FC<OnboardingTabProps> = ({ 
  employees, 
  themeClasses,
  onOnboardNew 
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>Employee Onboarding</h2>
          <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>Pipeline of new joiners and their onboarding stage</p>
        </div>
        <button 
          type="button"
          onClick={onOnboardNew}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 sm:gap-2"
          aria-label="Onboard new hire"
        >
          <UserPlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          Onboard New Hire
        </button>
      </div>

      <div className={`${themeClasses.bgCard} rounded-2xl ${themeClasses.border} ${themeClasses.shadow} overflow-hidden`}>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px] sm:min-w-0">
            <thead>
              <tr className={`text-left text-[10px] sm:text-xs ${themeClasses.tableHeader} ${themeClasses.border} border-b`}>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Employee</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Role</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden md:table-cell">Start Date</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden lg:table-cell">Department</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Progress</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Status</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className={`${themeClasses.border} border-b last:border-0 ${themeClasses.bgTableHover} transition-colors`}>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-sm shadow-lg shadow-indigo-500/25 flex-shrink-0">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium ${themeClasses.text} text-xs sm:text-sm truncate`}>{employee.name}</p>
                        <p className={`text-[8px] sm:text-xs ${themeClasses.textMuted} truncate`}>{employee.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.text} hidden sm:table-cell truncate max-w-[100px]`}>{employee.role}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} hidden md:table-cell`}>{employee.startDate}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 hidden lg:table-cell">
                    <span className={`px-1.5 sm:px-2 py-0.5 ${themeClasses.bgTableHover} ${themeClasses.textSecondary} rounded-full text-[8px] sm:text-xs`}>{employee.department}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-16 sm:w-32 bg-gray-200/20 rounded-full h-1.5 sm:h-2">
                        <div 
                          className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                            employee.progress >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                            employee.progress >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                          }`} 
                          style={{ width: `${employee.progress}%` }}
                        />
                      </div>
                      <span className={`text-[10px] sm:text-sm font-semibold text-indigo-400`}>{employee.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${
                      employee.progress >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 
                      employee.progress >= 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {employee.progress >= 70 ? 'On Track' : employee.progress >= 40 ? 'In Progress' : 'Just Started'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <button 
                      type="button"
                      className="text-indigo-400 hover:text-indigo-300 text-xs sm:text-sm font-medium transition-colors"
                      aria-label={`View onboarding details for ${employee.name}`}
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