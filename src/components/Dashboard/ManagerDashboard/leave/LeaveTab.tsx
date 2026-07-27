// components/leave/LeaveTab.tsx
import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ThemeClasses, LeaveRequest } from '../types';
import StatusBadge from '../common/StatusBadge';

interface LeaveTabProps {
  tc: ThemeClasses;
  leaveHistory: LeaveRequest[];
  leaveRequests: LeaveRequest[];
  setShowLeaveModal: (show: boolean) => void;
}

const LeaveTab: React.FC<LeaveTabProps> = ({ 
  tc, 
  leaveHistory, 
  leaveRequests, 
  setShowLeaveModal 
}) => {
  const leaveRows = [
    ...leaveHistory.map(l => ({
      id: l.id,
      type: l.type,
      from: l.fromDate,
      to: l.toDate,
      days: 1,
      status: l.status
    })),
    ...leaveRequests.map(l => ({
      id: l.id,
      type: l.type,
      from: l.fromDate,
      to: l.toDate,
      days: 1,
      status: l.status
    }))
  ];

  const getLeaveStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return tc.statusApproved;
      case 'Pending': return tc.statusPending;
      case 'Rejected': return tc.statusRejected;
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Sick Leave</h4>
          <p className={`text-xl sm:text-2xl font-bold ${tc.text}`}>4 / 10</p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Earned Leave</h4>
          <p className={`text-xl sm:text-2xl font-bold ${tc.text}`}>9 / 18</p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Pending Requests</h4>
          <p className="text-xl sm:text-2xl font-bold text-amber-400">3</p>
          <p className={`text-xs ${tc.textMuted}`}>awaiting approval</p>
        </div>
      </div>

      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>Leave History</h3>
          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1 sm:gap-2"
          >
            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            Apply Leave
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[400px] sm:min-w-0">
            <thead>
              <tr className={`${tc.border} border-b`}>
                <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>ID</th>
                <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell`}>Type</th>
                <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>From – To</th>
                <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell`}>Days</th>
                <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRows.map((leave) => (
                <tr key={leave.id} className={`${tc.border} border-b ${tc.bgCardHover} transition`}>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-medium text-indigo-400">{leave.id}</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.text} hidden sm:table-cell`}>{leave.type}</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.textSecondary}`}>{leave.from} – {leave.to}</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.text} hidden sm:table-cell`}>{leave.days || 1}</td>
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

export default LeaveTab;