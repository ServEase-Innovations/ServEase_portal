// components/leave/LeaveApprovalsTab.tsx
import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { ThemeClasses, LeaveRequest } from '../types';
import StatusBadge from '../common/StatusBadge';

interface LeaveApprovalsTabProps {
  tc: ThemeClasses;
  leaveRequests: LeaveRequest[];
}

const LeaveApprovalsTab: React.FC<LeaveApprovalsTabProps> = ({ tc, leaveRequests }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Leave Approvals</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Approve or reject employee leave requests</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
          {leaveRequests.filter(l => l.status === 'Pending').length} pending
        </span>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-6 py-3 font-medium">Request</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Period</th>
                <th className="px-6 py-3 font-medium">Reason</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <tr key={request.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {request.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`font-medium ${tc.text}`}>{request.employee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.type === 'Sick' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {request.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{request.period}</td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{request.reason}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={request.status} tc={tc} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                        aria-label={`Approve ${request.employee}'s leave request`}
                      >
                        <CheckCircleIcon className="w-3 h-3" />
                        Approve
                      </button>
                      <button 
                        className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-xl text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                        aria-label={`Reject ${request.employee}'s leave request`}
                      >
                        <XCircleIcon className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
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

export default LeaveApprovalsTab;