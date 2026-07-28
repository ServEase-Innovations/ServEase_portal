// src/pages/HRDashboard/components/overview/WorkTimer.tsx

import React from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';
import { TimerDisplay } from '../shared/TimerDisplay';

interface WorkTimerProps {
  isClockedIn: boolean;
  isClockedOut: boolean;
  workStatus: 'working' | 'on-leave' | 'not-working';
  workHours: number;
  workMinutes: number;
  workSeconds: number;
  totalHoursToday: number;
  startTime: moment.Moment | null;
  attendanceLoading: boolean;
  themeClasses: ThemeClasses;
  onStartWork: () => void;
  onStopWork: () => void;
  formatTime: (hours: number, minutes: number, seconds: number) => string;
  getTodayHoursDisplay: () => string;
}

export const WorkTimer: React.FC<WorkTimerProps> = ({
  isClockedIn,
  isClockedOut,
  workStatus,
  workHours,
  workMinutes,
  workSeconds,
  totalHoursToday,
  startTime,
  attendanceLoading,
  themeClasses,
  onStartWork,
  onStopWork,
  formatTime,
  getTodayHoursDisplay
}) => {
  const getStatusBadge = () => {
    if (isClockedIn) {
      return { label: '🟢 Working', class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
    } else if (isClockedOut) {
      return { label: '✅ Clocked Out', class: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
    } else if (workStatus === 'on-leave') {
      return { label: '🔵 On Leave', class: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
    }
    return { label: '⚪ Not Working', class: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' };
  };

  const statusBadge = getStatusBadge();

  const getTimeDisplay = () => {
    if (isClockedIn) {
      return formatTime(workHours, workMinutes, workSeconds);
    } else if (isClockedOut) {
      return `${Math.floor(totalHoursToday)}h ${Math.round((totalHoursToday - Math.floor(totalHoursToday)) * 60)}m`;
    }
    return '00:00:00';
  };

  const isRunning = isClockedIn;

  return (
    <div className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow} mb-6 sm:mb-8 transition-all duration-500 ${isClockedIn ? 'ring-2 ring-emerald-500/50' : ''}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <TimerDisplay 
            time={getTimeDisplay()} 
            isRunning={isRunning} 
            themeClasses={themeClasses}
            label={isClockedIn ? 'Timer running' : 'Session completed'}
          />
          <div className="hidden sm:block">
            <p className={`text-sm font-medium ${themeClasses.text}`}>Today's Progress</p>
            <p className={`text-xs ${themeClasses.textSecondary}`}>
              {isClockedIn ? 'Click stop when you finish' : 
               isClockedOut ? `Total: ${totalHoursToday.toFixed(2)} hours` :
               workStatus === 'on-leave' ? 'On leave today' : 'Start tracking your work hours'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {!isClockedIn && !isClockedOut && workStatus === 'not-working' ? (
            <button
              type="button"
              onClick={onStartWork}
              disabled={attendanceLoading}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium text-sm sm:text-base hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span>{attendanceLoading ? '⏳ Starting...' : 'Start Work'}</span>
            </button>
          ) : isClockedIn ? (
            <button
              type="button"
              onClick={onStopWork}
              disabled={attendanceLoading}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium text-sm sm:text-base hover:from-rose-600 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <StopIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span>{attendanceLoading ? '⏳ Stopping...' : 'Stop Work'}</span>
            </button>
          ) : (
            <div className={`text-sm ${themeClasses.textSecondary} px-3 py-2`}>
              {isClockedOut ? '✅ Completed for today' : workStatus === 'on-leave' ? '📋 On Leave Today' : '⏸️ Not Working'}
            </div>
          )}
        </div>
      </div>
      {isClockedIn && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 ${themeClasses.border} border-t flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs ${themeClasses.textMuted}">
          <span>Started at: {startTime?.format('hh:mm A') || 'N/A'}</span>
          <span className="hidden sm:inline w-px h-4 bg-gray-300/30"></span>
          <span>Elapsed: {formatTime(workHours, workMinutes, workSeconds)}</span>
          <span className="hidden sm:inline w-px h-4 bg-gray-300/30"></span>
          <span>Status: {isClockedIn ? '🟢 Active' : workStatus === 'on-leave' ? '🔵 On Leave' : '⚪ Not Working'}</span>
        </div>
      )}
    </div>
  );
};