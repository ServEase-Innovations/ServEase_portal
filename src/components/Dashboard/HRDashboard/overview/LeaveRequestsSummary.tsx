// src/pages/HRDashboard/components/overview/LeaveRequestsSummary.tsx

import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { LeaveRequest, ThemeClasses } from '../types';

interface LeaveRequestsSummaryProps {
  leaveRequests: LeaveRequest[];
  themeClasses: ThemeClasses;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  getLeaveTypeColor: (type: string) => string;
  getStatusColor: (status: string) => string;
}

export const LeaveRequestsSummary: React.FC<LeaveRequestsSummaryProps> = ({ 
  leaveRequests, 
  themeClasses,
  onApprove,
  onReject,
  getLeaveTypeColor,
  getStatusColor
}) => {
  const pendingRequests = leaveRequests.filter(l => l.status === 'Pending');

  return (
    <div className={`mt-4 sm:mt-6 ${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
        <div>
          <h3 className={`font-semibold ${themeClasses.text} text-base sm:text-lg`}>Pending Leave Requests</h3>
          <p className={`text-sm ${themeClasses.textSecondary}`}>Awaiting your review</p>
        </div>
        <span className="px-2 sm:px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs sm:text-sm font-medium">
          {pendingRequests.length} pending
        </span>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-[700px] sm:min-w-0">
          <thead>
            <tr className={`text-left text-[10px] sm:text-xs ${themeClasses.tableHeader} ${themeClasses.border} border-b`}>
              <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3">Request</th>
              <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3">Type</th>
              <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3 hidden sm:table-cell">Period</th>
              <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3 hidden md:table-cell">Reason</th>
              <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3">Status</th>
              <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((request) => (
              <tr key={request.id} className={`${themeClasses.border} border-b last:border-0 ${themeClasses.bgTableHover} transition-colors`}>
                <td className="py-2 sm:py-3 px-2 sm:px-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-[8px] sm:text-xs font-bold flex-shrink-0">
                      {request.employee.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className={`font-medium ${themeClasses.text} text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none`}>{request.employee}</span>
                  </div>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3">
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getLeaveTypeColor(request.type)} whitespace-nowrap`}>
                    {request.type}
                  </span>
                </td>
                <td className={`py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-sm ${themeClasses.textSecondary} hidden sm:table-cell`}>{request.period}</td>
                <td className={`py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-sm ${themeClasses.textSecondary} max-w-xs truncate hidden md:table-cell`}>{request.reason}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-3">
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(request.status)} whitespace-nowrap`}>
                    {request.status}
                  </span>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button 
                      type="button"
                      onClick={() => onApprove?.(request.id)}
                      className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-[8px] sm:text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                      aria-label={`Approve leave request for ${request.employee}`}
                      title={`Approve leave request for ${request.employee}`}
                    >
                      <CheckCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
                      <span className="hidden sm:inline">Approve</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => onReject?.(request.id)}
                      className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-rose-500/20 text-rose-400 rounded-xl text-[8px] sm:text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                      aria-label={`Reject leave request for ${request.employee}`}
                      title={`Reject leave request for ${request.employee}`}
                    >
                      <XCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
                      <span className="hidden sm:inline">Reject</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};