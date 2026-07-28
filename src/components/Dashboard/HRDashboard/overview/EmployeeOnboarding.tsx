// src/pages/HRDashboard/components/overview/EmployeeOnboarding.tsx

import React from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { OnboardingEmployee, ThemeClasses } from '../types';

interface EmployeeOnboardingProps {
  employees: OnboardingEmployee[];
  themeClasses: ThemeClasses;
  onOnboardNew: () => void;
}

export const EmployeeOnboarding: React.FC<EmployeeOnboardingProps> = ({ 
  employees, 
  themeClasses,
  onOnboardNew 
}) => {
  return (
    <div className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
        <div>
          <h3 className={`font-semibold ${themeClasses.text} text-base sm:text-lg`}>Employee Onboarding</h3>
          <p className={`text-sm ${themeClasses.textSecondary}`}>Pipeline of new joiners</p>
        </div>
        <button className={`text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors`}>View all →</button>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {employees.map((employee) => (
          <div key={employee.id} className={`${themeClasses.border} border-b last:border-0 pb-3 last:pb-0 ${themeClasses.bgTableHover} p-2 rounded-xl transition-colors`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <p className={`font-medium ${themeClasses.text} text-sm sm:text-base truncate`}>{employee.name}</p>
                  <span className={`text-[10px] sm:text-xs ${themeClasses.textMuted}`}>{employee.id}</span>
                </div>
                <p className={`text-xs sm:text-sm ${themeClasses.textSecondary} truncate`}>{employee.role}</p>
                <p className={`text-[10px] sm:text-xs ${themeClasses.textMuted}`}>Start date - {employee.startDate}</p>
              </div>
              <span className={`text-sm font-semibold text-indigo-400 flex-shrink-0`}>{employee.progress}%</span>
            </div>
            <div className="w-full bg-gray-200/20 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  employee.progress >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                  employee.progress >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                }`} 
                style={{ width: `${employee.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <button 
        type="button"
        onClick={onOnboardNew}
        className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2 sm:py-2.5 rounded-xl text-sm sm:text-base hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
        aria-label="Onboard new hire"
      >
        <UserPlusIcon className="w-4 h-4" aria-hidden="true" />
        Onboard new hire
      </button>
    </div>
  );
};