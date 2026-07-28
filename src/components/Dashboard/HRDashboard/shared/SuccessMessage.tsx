// src/pages/HRDashboard/components/shared/SuccessMessage.tsx

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface SuccessMessageProps {
  message: string;
  show: boolean;
  onClose?: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  message, 
  show, 
  onClose 
}) => {
  if (!show) return null;

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 sm:p-4 rounded-xl flex items-center gap-2 animate-fadeIn mb-4">
      <CheckIcon className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};