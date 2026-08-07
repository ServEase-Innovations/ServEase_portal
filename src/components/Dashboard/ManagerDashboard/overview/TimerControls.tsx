// components/overview/TimerControls.tsx
import React from 'react';
import { ClockIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';

interface TimerControlsProps {
  isClockedIn: boolean;
  isClockedOut: boolean;
  workStatus: 'working' | 'on-leave' | 'not-working';
  workHours: number;
  workMinutes: number;
  workSeconds: number;
  totalHoursToday: number;
  attendanceLoading: boolean;
  startTime: moment.Moment | null;
  handleStartWork: () => void;
  handleStopWork: () => void;
  tc: ThemeClasses;
  previousSessionsHours?: number; // NEW: Add accumulated hours from previous sessions
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isClockedIn,
  isClockedOut,
  workStatus,
  workHours,
  workMinutes,
  workSeconds,
  totalHoursToday,
  attendanceLoading,
  startTime,
  handleStartWork,
  handleStopWork,
  tc,
  previousSessionsHours = 0, // NEW: Default to 0 if not provided
}) => {
  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // NEW: Calculate total hours display (previous sessions + current session)
  const getTodayHoursDisplay = () => {
    if (isClockedIn) {
      // When working: Show TOTAL (previous sessions + current session)
      const currentSessionHours = workHours + (workMinutes / 60) + (workSeconds / 3600);
      const totalHours = previousSessionsHours + currentSessionHours;
      
      console.log('📊 TimerControls - getTodayHoursDisplay WHILE WORKING:');
      console.log('   - previousSessionsHours:', previousSessionsHours);
      console.log('   - currentSessionHours:', currentSessionHours);
      console.log('   - totalHours:', totalHours);
      console.log('   - workHours:', workHours, 'workMinutes:', workMinutes, 'workSeconds:', workSeconds);
      
      const hrs = Math.floor(totalHours);
      const remainingMinutes = (totalHours - hrs) * 60;
      const mins = Math.floor(remainingMinutes);
      const secs = Math.floor((remainingMinutes - mins) * 60);
      
      return formatTime(hrs, mins, secs);
    } else if (isClockedOut) {
      return `${Math.floor(totalHoursToday)}h ${Math.round((totalHoursToday - Math.floor(totalHoursToday)) * 60)}m`;
    }
    return '00:00:00';
  };

  return (
    <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} mb-6 sm:mb-8 transition-all duration-500 ${isClockedIn ? 'ring-2 ring-emerald-500/50' : ''}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className={`p-3 sm:p-4 rounded-2xl ${tc.timerBg} ${tc.border} border flex-1 sm:flex-none`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <ClockIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${isClockedIn ? 'text-emerald-400 animate-pulse' : tc.textMuted}`} />
              <div>
                <p className={`text-lg sm:text-2xl font-mono font-bold ${isClockedIn ? 'text-emerald-400' : tc.text}`}>
                  {isClockedIn ? formatTime(workHours, workMinutes, workSeconds) : 
                   isClockedOut ? `${Math.floor(totalHoursToday)}h ${Math.round((totalHoursToday - Math.floor(totalHoursToday)) * 60)}m` : 
                   '00:00:00'}
                </p>
                <p className={`text-[10px] sm:text-xs ${tc.textMuted}`}>
                  {isClockedIn ? '🟢 Timer running' : isClockedOut ? '✅ Session completed' : '⏸️ Timer stopped'}
                </p>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <p className={`text-sm font-medium ${tc.text}`}>Today's Progress</p>
            <p className={`text-xs ${tc.textSecondary}`}>
              {isClockedIn ? getTodayHoursDisplay() : 
               isClockedOut ? `Total: ${totalHoursToday.toFixed(2)} hours` :
               workStatus === 'on-leave' ? 'On leave today' : 'Start tracking your work hours'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {!isClockedIn && !isClockedOut && workStatus === 'not-working' ? (
            <button
              type="button"
              onClick={handleStartWork}
              disabled={attendanceLoading}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium text-sm sm:text-base hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span>{attendanceLoading ? '⏳ Starting...' : 'Start Work'}</span>
            </button>
          ) : isClockedIn ? (
            <button
              type="button"
              onClick={handleStopWork}
              disabled={attendanceLoading}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium text-sm sm:text-base hover:from-rose-600 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <StopIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span>{attendanceLoading ? '⏳ Stopping...' : 'Stop Work'}</span>
            </button>
          ) : (
            <div className={`text-sm ${tc.textSecondary} px-3 py-2`}>
              {isClockedOut ? '✅ Completed for today' : workStatus === 'on-leave' ? '📋 On Leave Today' : '⏸️ Not Working'}
            </div>
          )}
        </div>
      </div>
      {isClockedIn && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 ${tc.border} border-t flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs ${tc.textMuted}">
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

export default TimerControls;