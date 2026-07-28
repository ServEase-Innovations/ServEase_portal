// src/pages/HRDashboard/components/leaves/MyLeaveTab.tsx

import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';

interface MyLeaveTabProps {
  leaveHistory: any[];
  themeClasses: ThemeClasses;
  getLeaveStatusColor: (status: string) => string;
  onApplyLeave: () => void;
}

export const MyLeaveTab: React.FC<MyLeaveTabProps> = ({
  leaveHistory,
  themeClasses,
  getLeaveStatusColor,
  onApplyLeave
}) => {
  const displayLeaves = leaveHistory.length > 0 ? leaveHistory : [
    { id: 'L-9821', type: 'Casual', from: '2026-05-12', to: '2026-05-12', days: 1, status: 'Approved' },
    { id: 'L-9874', type: 'Sick', from: '2026-05-22', to: '2026-05-23', days: 2, status: 'Approved' },
    { id: 'L-9912', type: 'Earned', from: '2026-06-15', to: '2026-06-17', days: 3, status: 'Pending' },
  ];

  const pendingCount = displayLeaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
          <h4 className={`text-sm ${themeClasses.textSecondary}`}>Sick Leave</h4>
          <p className={`text-xl sm:text-2xl font-bold ${themeClasses.text}`}>4 / 10</p>
          <p className={`text-xs ${themeClasses.textMuted}`}>days remaining</p>
        </div>
        <div className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
          <h4 className={`text-sm ${themeClasses.textSecondary}`}>Earned Leave</h4>
          <p className={`text-xl sm:text-2xl font-bold ${themeClasses.text}`}>9 / 18</p>
          <p className={`text-xs ${themeClasses.textMuted}`}>days remaining</p>
        </div>
        <div className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
          <h4 className={`text-sm ${themeClasses.textSecondary}`}>Pending Requests</h4>
          <p className="text-xl sm:text-2xl font-bold text-amber-400">{pendingCount}</p>
          <p className={`text-xs ${themeClasses.textMuted}`}>awaiting approval</p>
        </div>
      </div>

      <div className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${themeClasses.text} text-base sm:text-lg`}>Leave History</h3>
          <button
            type="button"
            onClick={onApplyLeave}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1 sm:gap-2"
          >
            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            Apply Leave
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[400px] sm:min-w-0">
            <thead>
              <tr className={`${themeClasses.border} border-b`}>
                <th className={`text-left text-[10px] sm:text-xs font-medium ${themeClasses.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>ID</th>
                <th className={`text-left text-[10px] sm:text-xs font-medium ${themeClasses.textMuted} py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell`}>Type</th>
                <th className={`text-left text-[10px] sm:text-xs font-medium ${themeClasses.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>From – To</th>
                <th className={`text-left text-[10px] sm:text-xs font-medium ${themeClasses.textMuted} py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell`}>Days</th>
                <th className={`text-left text-[10px] sm:text-xs font-medium ${themeClasses.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayLeaves.map((leave: any) => (
                <tr key={leave.id} className={`${themeClasses.border} border-b ${themeClasses.bgCardHover} transition`}>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-medium text-indigo-400">{leave.id}</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${themeClasses.text} hidden sm:table-cell`}>{leave.type}</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${themeClasses.textSecondary}`}>{leave.from} – {leave.to}</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${themeClasses.text} hidden sm:table-cell`}>{leave.days}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium ${getLeaveStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
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