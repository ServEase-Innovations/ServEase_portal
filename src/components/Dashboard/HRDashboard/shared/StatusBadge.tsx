// src/pages/HRDashboard/components/shared/StatusBadge.tsx

import React from 'react';
import { ThemeClasses } from '../types';

interface StatusBadgeProps {
  status: string;
  themeClasses: ThemeClasses;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  themeClasses, 
  className = '' 
}) => {
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Active': themeClasses.statusActive,
      'Pending': themeClasses.statusPending,
      'Approved': themeClasses.statusApproved,
      'Rejected': themeClasses.statusRejected,
      'Live': themeClasses.statusLive,
      'Draft': themeClasses.statusDraft,
      'National': themeClasses.statusNational,
      'Regional': themeClasses.statusRegional,
      'Optional': themeClasses.statusOptional
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(status)} ${className}`}>
      {status}
    </span>
  );
};