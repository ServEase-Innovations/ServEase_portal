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
 * Calculate and format today's total hours display
 * Shows accumulated hours from previous sessions + current session time
 * 
 * @param isClockedIn - Whether user is currently clocked in
 * @param isClockedOut - Whether user is clocked out for the day
 * @param workHours - Current session hours
 * @param workMinutes - Current session minutes
 * @param workSeconds - Current session seconds
 * @param previousSessionsHours - Accumulated hours from previous sessions today
 * @param totalHoursToday - Total hours when clocked out
 * @param totalWorkedToday - Formatted string for display when not working
 * @returns Formatted time string
 */
export const getTodayHoursDisplay = (
  isClockedIn: boolean,
  isClockedOut: boolean,
  workHours: number,
  workMinutes: number,
  workSeconds: number,
  previousSessionsHours: number,
  totalHoursToday: number,
  totalWorkedToday: string = '0h 0m'
): string => {
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
