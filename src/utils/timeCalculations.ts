// src/utils/timeCalculations.ts
/**
 * Utility functions for time calculations and formatting
 */

/**
 * Format time values into HH:MM:SS string
 */
export const formatTime = (hours: number, minutes: number, seconds: number): string => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Parameters for getTodayHoursDisplay function
 */
export interface TodayHoursDisplayParams {
  isClockedIn: boolean;
  isClockedOut: boolean;
  workHours: number;
  workMinutes: number;
  workSeconds: number;
  previousSessionsHours: number;
  totalHoursToday: number;
  totalWorkedToday?: string;
}

/**
 * Calculate and format today's total hours display
 * Shows accumulated hours from previous sessions + current session time
 * 
 * @param params - Parameters object containing clock state and time values
 * @returns Formatted time string
 */
export const getTodayHoursDisplay = (params: TodayHoursDisplayParams): string => {
  const {
    isClockedIn,
    isClockedOut,
    workHours,
    workMinutes,
    workSeconds,
    previousSessionsHours,
    totalHoursToday,
    totalWorkedToday = '0h 0m'
  } = params;

  if (isClockedIn) {
    // When working: Show TOTAL (previous sessions + current session)
    const currentSessionHours = workHours + (workMinutes / 60) + (workSeconds / 3600);
    const totalHours = previousSessionsHours + currentSessionHours;
    
    console.log('📊 getTodayHoursDisplay CALCULATION:');
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
  return totalWorkedToday;
};
