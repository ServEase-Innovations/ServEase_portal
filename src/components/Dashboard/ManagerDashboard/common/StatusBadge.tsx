// components/common/StatusBadge.tsx
import React from 'react';
import { ThemeClasses } from '../types';

interface StatusBadgeProps {
  status: string;
  tc: ThemeClasses;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, tc }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': tc.statusActive,
      'Working': tc.statusWorking,
      'On Leave': tc.statusLeave,
      'Pending': tc.statusPending,
      'In Progress': tc.statusProgress,
      'Completed': tc.statusCompleted,
      'Blocked': tc.statusBlocked,
      'Approved': tc.statusApproved,
      'Rejected': tc.statusRejected
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;