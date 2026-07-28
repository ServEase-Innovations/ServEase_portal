// src/pages/HRDashboard/components/shared/TimerDisplay.tsx

import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';

interface TimerDisplayProps {
  time: string;
  isRunning: boolean;
  themeClasses: ThemeClasses;
  label?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  time, 
  isRunning, 
  themeClasses,
  label = 'Timer running'
}) => {
  return (
    <div className={`p-3 sm:p-4 rounded-2xl ${themeClasses.timerBg} ${themeClasses.border} border flex-1 sm:flex-none`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <ClockIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${isRunning ? 'text-emerald-400 animate-pulse' : themeClasses.textMuted}`} />
        <div>
          <p className={`text-lg sm:text-2xl font-mono font-bold ${isRunning ? 'text-emerald-400' : themeClasses.text}`}>
            {time}
          </p>
          <p className={`text-[10px] sm:text-xs ${themeClasses.textMuted}`}>
            {isRunning ? `🟢 ${label}` : '⏸️ Timer stopped'}
          </p>
        </div>
      </div>
    </div>
  );
};