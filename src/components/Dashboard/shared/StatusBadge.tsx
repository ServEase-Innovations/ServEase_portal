// components/Dashboard/shared/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  isClockedIn: boolean;
  isClockedOut: boolean;
  workStatus: 'working' | 'on-leave' | 'not-working';
}

export const getStatusBadge = (
  isClockedIn: boolean,
  isClockedOut: boolean,
  workStatus: 'working' | 'on-leave' | 'not-working'
): { label: string; class: string } => {
  if (isClockedIn) {
    return { label: '🟢 Working', class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
  } else if (isClockedOut) {
    return { label: '✅ Clocked Out', class: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
  } else if (workStatus === 'on-leave') {
    return { label: '🔵 On Leave', class: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
  }
  return { label: '⚪ Not Working', class: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' };
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isClockedIn, isClockedOut, workStatus }) => {
  const badge = getStatusBadge(isClockedIn, isClockedOut, workStatus);
  
  return (
    <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium ${badge.class}`}>
      {badge.label}
    </span>
  );
};
