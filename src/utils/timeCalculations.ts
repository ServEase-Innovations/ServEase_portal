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

/**
 * Calculate total hours with breakdown (hours, minutes, seconds)
 * Used for displaying timer in HH:MM:SS format
 * 
 * @param previousSessionsHours - Hours accumulated from previous sessions today
 * @param workHours - Current session hours
 * @param workMinutes - Current session minutes
 * @param workSeconds - Current session seconds
 * @returns Object with hours, minutes, seconds breakdown
 */
export const calculateTotalHours = (
  previousSessionsHours: number,
  workHours: number,
  workMinutes: number,
  workSeconds: number
): { hours: number; minutes: number; seconds: number; totalHours: number } => {
  const totalHours = previousSessionsHours + (workHours + workMinutes / 60 + workSeconds / 3600);
  const hours = Math.floor(totalHours);
  const remainingMinutes = (totalHours - hours) * 60;
  const minutes = Math.floor(remainingMinutes);
  const seconds = Math.floor((remainingMinutes - minutes) * 60);
  
  return { hours, minutes, seconds, totalHours };
};

/**
 * Get display string for timer when clocked in
 * 
 * @param previousSessionsHours - Hours from previous sessions
 * @param workHours - Current hours
 * @param workMinutes - Current minutes
 * @param workSeconds - Current seconds
 * @returns Formatted time string HH:MM:SS
 */
export const getTimerDisplay = (
  previousSessionsHours: number,
  workHours: number,
  workMinutes: number,
  workSeconds: number
): string => {
  const { hours, minutes, seconds } = calculateTotalHours(
    previousSessionsHours,
    workHours,
    workMinutes,
    workSeconds
  );
  return formatTime(hours, minutes, seconds);
};

/**
 * Get display string for timer when clocked out
 * 
 * @param totalHoursToday - Total hours worked today
 * @returns Formatted string like "8h 30m"
 */
export const getClockedOutDisplay = (totalHoursToday: number): string => {
  const hours = Math.floor(totalHoursToday);
  const minutes = Math.round((totalHoursToday - hours) * 60);
  return `${hours}h ${minutes}m`;
};

/**
 * Get timer status text based on clock state
 */
export const getTimerStatusText = (
  isClockedIn: boolean,
  isClockedOut: boolean
): string => {
  if (isClockedIn) return '🟢 Timer running';
  if (isClockedOut) return '✅ Session completed';
  return '⏸️ Timer stopped';
};
