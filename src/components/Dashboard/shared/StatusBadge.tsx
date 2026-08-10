// components/Dashboard/shared/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  isClockedIn: boolean;
  isClockedOut: boolean;
  workStatus: 'working' | 'on-leave' | 'not-working';
  shiftStatus?: 'Working' | 'OnLeave' | 'Absent'; // NEW: From backend
  totalHoursToday?: number; // NEW: To show if day is complete
}

export const getStatusBadge = (
  isClockedIn: boolean,
  isClockedOut: boolean,
  workStatus: 'working' | 'on-leave' | 'not-working',
  shiftStatus?: 'Working' | 'OnLeave' | 'Absent',
  totalHoursToday?: number
): { label: string; class: string } => {
  // If clocked in, show Working
  if (isClockedIn) {
    return { label: '🟢 Working', class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
  }
  
  // If clocked out, show Present/Absent based on hours worked
  if (isClockedOut && totalHoursToday !== undefined) {
    if (shiftStatus === 'Absent') {
      return { label: '❌ Absent', class: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' };
    } else if (shiftStatus === 'Working' && totalHoursToday >= 8.0) {
      return { label: '✅ Present', class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
    } else if (shiftStatus === 'Working') {
      // Working but clocked out with less than 8 hours (edge case)
      return { label: '⚠️ Incomplete', class: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' };
    }
  }
  
  // If on leave
  if (workStatus === 'on-leave' || shiftStatus === 'OnLeave') {
    return { label: '🔵 On Leave', class: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
  }
  
  // Default: Not working yet
  return { label: '⚪ Not Working', class: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' };
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  isClockedIn, 
  isClockedOut, 
  workStatus,
  shiftStatus,
  totalHoursToday 
}) => {
  const badge = getStatusBadge(isClockedIn, isClockedOut, workStatus, shiftStatus, totalHoursToday);
  
  return (
    <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium ${badge.class}`}>
      {badge.label}
    </span>
  );
};
