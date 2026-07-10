// tabs/LeaveTab.tsx
import React from 'react';
import { getThemeClasses } from './themeUtils';

interface LeaveTabProps {
  theme: 'light' | 'dark';
  attendance: any;
}

const LeaveTab: React.FC<LeaveTabProps> = ({ theme, attendance }) => {
  const tc = getThemeClasses(theme);

  const leaveHistory = [
    { id: 'L-9821', type: 'Casual Leave', from: '2026-05-12', to: '2026-05-12', days: 1, status: 'Approved' as const },
    { id: 'L-9874', type: 'Sick Leave', from: '2026-05-22', to: '2026-05-23', days: 2, status: 'Approved' as const },
    { id: 'L-9912', type: 'Earned Leave', from: '2026-06-15', to: '2026-06-17', days: 3, status: 'Pending' as const },
  ];

  const getStatusColor = (status: string) => {
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
        <h3 className={`font-semibold ${tc.text} mb-2 sm:mb-4 text-base sm:text-lg`}>Leave History</h3>
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
              {leaveHistory.map((leave) => (
                <tr key={leave.id} className={`${tc.border} border-b ${tc.bgCardHover} transition`}>
                  <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-medium text-indigo-400">{leave.id}</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.text} hidden sm:table-cell`}>{leave.type}</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.textSecondary}`}>{leave.from} – {leave.to}</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.text} hidden sm:table-cell`}>{leave.days}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(leave.status)}`}>
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