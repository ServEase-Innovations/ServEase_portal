// src/pages/HRDashboard/components/leaves/LeaveManagementTab.tsx

import React from 'react';
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { LeaveRequest, ThemeClasses } from '../types';

interface LeaveManagementTabProps {
  leaveRequests: LeaveRequest[];
  themeClasses: ThemeClasses;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  getLeaveTypeColor: (type: string) => string;
  getStatusColor: (status: string) => string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const LeaveManagementTab: React.FC<LeaveManagementTabProps> = ({
  leaveRequests,
  themeClasses,
  searchQuery,
  onSearchChange,
  getLeaveTypeColor,
  getStatusColor,
  onApprove,
  onReject
}) => {
  const pendingCount = leaveRequests.filter(l => l.status === 'Pending').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>Leave Requests</h2>
          <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>Approve or reject employee leave requests</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="px-2 sm:px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] sm:text-sm font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full"></span>
            {pendingCount} pending
          </span>
          <div className="relative">
            <MagnifyingGlassIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${themeClasses.textMuted} absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2`} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search..."
              className={`pl-7 sm:pl-9 pr-3 sm:pr-4 py-1 sm:py-2 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all w-24 sm:w-40`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search leave requests"
            />
          </div>
        </div>
      </div>

      <div className={`${themeClasses.bgCard} rounded-2xl ${themeClasses.border} ${themeClasses.shadow} overflow-hidden`}>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[800px] sm:min-w-0">
            <thead>
              <tr className={`text-left text-[10px] sm:text-xs ${themeClasses.tableHeader} ${themeClasses.border} border-b`}>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Request</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Type</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Period</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden md:table-cell">Duration</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden lg:table-cell">Reason</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden xl:table-cell">Department</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Status</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <tr key={request.id} className={`${themeClasses.border} border-b last:border-0 ${themeClasses.bgTableHover} transition-colors`}>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-[8px] sm:text-xs font-bold flex-shrink-0">
                        {request.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium ${themeClasses.text} text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none`}>{request.employee}</p>
                        <p className={`text-[8px] sm:text-xs ${themeClasses.textMuted} hidden sm:block`}>{request.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getLeaveTypeColor(request.type)} whitespace-nowrap`}>
                      {request.type}
                    </span>
                  </td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} hidden sm:table-cell`}>{request.period}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} hidden md:table-cell`}>{request.duration}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} max-w-xs truncate hidden lg:table-cell`}>{request.reason}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} hidden xl:table-cell`}>{request.department}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(request.status)} whitespace-nowrap`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    {request.status === 'Pending' ? (
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
                    ) : (
                      <span className={`text-[8px] sm:text-xs ${themeClasses.textMuted}`}>Reviewed</span>
                    )}
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