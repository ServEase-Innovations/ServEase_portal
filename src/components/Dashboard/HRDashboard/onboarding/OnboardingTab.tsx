// src/pages/HRDashboard/components/onboarding/OnboardingTab.tsx

import React, { useState } from 'react';
import { UserPlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { OnboardingEmployee, ThemeClasses } from '../types';

interface OnboardingTabProps {
  employees: OnboardingEmployee[];
  themeClasses: ThemeClasses;
  onOnboardNew: () => void;
  onRoleChange?: (employeeId: string, newRole: string) => void;
}

const ROLE_OPTIONS = [
  'Software Engineer',
  'Product Manager',
  'Designer',
  'Data Analyst',
  'Sales Executive',
  'Marketing Specialist',
  'HR Coordinator',
  'Finance Analyst',
  'Customer Support',
  'Operations Lead',
  'Other',
];

export const OnboardingTab: React.FC<OnboardingTabProps> = ({
  employees,
  themeClasses,
  onOnboardNew,
  onRoleChange,
}) => {
  // Local fallback state so the dropdown works even if the parent
  // doesn't wire up onRoleChange yet.
  const [localRoles, setLocalRoles] = useState<Record<string, string>>({});

  const getRoleValue = (employee: OnboardingEmployee) => {
    const current = localRoles[employee.id] ?? employee.role;
    return ROLE_OPTIONS.includes(current) ? current : 'Other';
  };

  const handleRoleChange = (employeeId: string, newRole: string) => {
    setLocalRoles(prev => ({ ...prev, [employeeId]: newRole }));
    onRoleChange?.(employeeId, newRole);
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header banner — tilted accent block instead of a plain heading row */}
      <div className="relative overflow-hidden rounded-2xl border-4 border-black bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
        <div className="absolute -right-8 -top-10 h-40 w-40 rotate-12 rounded-3xl bg-lime-400/30 blur-2xl" />
        <div className="absolute -left-6 bottom-0 h-24 w-24 -rotate-12 rounded-full bg-amber-300/30 blur-xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-8 py-5 sm:py-7">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-lime-300">
              <SparklesIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
              New joiners pipeline
            </div>
            <h2 className="mt-2 text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
              Employee Onboarding
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90">
              Track every new hire's journey from day one to fully ramped
            </p>
          </div>
          <button
            type="button"
            onClick={onOnboardNew}
            className="group flex items-center gap-2 rounded-xl border-2 border-black bg-lime-400 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-150 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] active:translate-x-0 active:translate-y-0 active:shadow-none"
            aria-label="Onboard new hire"
          >
            <UserPlusIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            Onboard New Hire
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className={`rounded-2xl border-4 border-black ${themeClasses.bgCard} shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] overflow-hidden`}>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[760px] sm:min-w-0">
            <thead>
              <tr className="border-b-4 border-black bg-gradient-to-r from-fuchsia-500 to-indigo-600 text-left text-[10px] sm:text-xs text-white">
                <th className="px-3 sm:px-6 py-2.5 sm:py-3 font-black">Employee</th>
                <th className="px-3 sm:px-6 py-2.5 sm:py-3 font-black hidden sm:table-cell">Role</th>
                <th className="px-3 sm:px-6 py-2.5 sm:py-3 font-black hidden md:table-cell">Start Date</th>
                <th className="px-3 sm:px-6 py-2.5 sm:py-3 font-black hidden lg:table-cell">Department</th>
                <th className="px-3 sm:px-6 py-2.5 sm:py-3 font-black">Progress</th>
                <th className="px-3 sm:px-6 py-2.5 sm:py-3 font-black hidden sm:table-cell">Status</th>
                <th className="px-3 sm:px-6 py-2.5 sm:py-3 font-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, idx) => (
                <tr
                  key={employee.id}
                  className={`border-b-2 border-black/70 last:border-0 transition-colors ${
                    idx % 2 === 0 ? 'bg-transparent' : 'bg-black/5'
                  } hover:bg-lime-400/10`}
                >
                  <td className="px-3 sm:px-6 py-2.5 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-11 sm:h-11 flex-shrink-0 -rotate-3 rounded-xl border-2 border-black bg-gradient-to-br from-amber-400 via-fuchsia-500 to-indigo-600 flex items-center justify-center text-white font-black text-[10px] sm:text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold ${themeClasses.text} text-xs sm:text-sm truncate`}>{employee.name}</p>
                        <p className={`text-[8px] sm:text-xs ${themeClasses.textMuted} truncate`}>{employee.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role dropdown */}
                  <td className="px-3 sm:px-6 py-2.5 sm:py-4 hidden sm:table-cell">
                    <select
                      value={getRoleValue(employee)}
                      onChange={e => handleRoleChange(employee.id, e.target.value)}
                      aria-label={`Role for ${employee.name}`}
                      className="w-full max-w-[150px] cursor-pointer rounded-lg border-2 border-black bg-white px-2 py-1 text-[10px] sm:text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] focus:outline-none focus:ring-2 focus:ring-lime-400"
                    >
                      {ROLE_OPTIONS.map(role => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className={`px-3 sm:px-6 py-2.5 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} hidden md:table-cell`}>
                    {employee.startDate}
                  </td>
                  <td className="px-3 sm:px-6 py-2.5 sm:py-4 hidden lg:table-cell">
                    <span className="rounded-full border-2 border-black bg-amber-300 px-2 py-0.5 text-[8px] sm:text-xs font-bold text-black">
                      {employee.department}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2.5 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-16 sm:w-32 h-2 sm:h-2.5 rounded-full border-2 border-black bg-white overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            employee.progress >= 70
                              ? 'bg-gradient-to-r from-lime-400 to-emerald-500'
                              : employee.progress >= 40
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                              : 'bg-gradient-to-r from-rose-500 to-fuchsia-600'
                          }`}
                          style={{ width: `${employee.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] sm:text-sm font-black text-fuchsia-500">{employee.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-2.5 sm:py-4 hidden sm:table-cell">
                    <span
                      className={`inline-block -rotate-2 rounded-lg border-2 border-black px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] ${
                        employee.progress >= 70
                          ? 'bg-emerald-400 text-black'
                          : employee.progress >= 40
                          ? 'bg-amber-300 text-black'
                          : 'bg-rose-400 text-black'
                      }`}
                    >
                      {employee.progress >= 70 ? 'On Track' : employee.progress >= 40 ? 'In Progress' : 'Just Started'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2.5 sm:py-4">
                    <button
                      type="button"
                      className="rounded-lg border-2 border-black bg-indigo-500 px-2.5 py-1 text-[10px] sm:text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
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