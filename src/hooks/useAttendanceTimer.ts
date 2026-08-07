// src/hooks/useAttendanceTimer.ts
import { useState, useEffect } from 'react';
import moment from 'moment';

interface UseAttendanceTimerProps {
  isClockedIn: boolean;
  isClockedOut: boolean;
  todayAttendance: any;
}

export const useAttendanceTimer = ({
  isClockedIn,
  isClockedOut,
  todayAttendance
}: UseAttendanceTimerProps) => {
  const [workHours, setWorkHours] = useState(0);
  const [workMinutes, setWorkMinutes] = useState(0);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [startTime, setStartTime] = useState<moment.Moment | null>(null);
  const [totalWorkedToday, setTotalWorkedToday] = useState('0h 0m');
  const [isWorking, setIsWorking] = useState(false);
  const [workStatus, setWorkStatus] = useState<'working' | 'on-leave' | 'not-working'>('not-working');
  const [previousSessionsHours, setPreviousSessionsHours] = useState(0); // NEW: Track previous sessions

  useEffect(() => {
    // Clear any existing interval
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    if (isClockedIn && todayAttendance?.clockInTimestamp) {
      setWorkStatus('working');
      setIsWorking(true);
      
      const start = moment(todayAttendance.clockInTimestamp);
      setStartTime(start);
      
      // Get previous accumulated hours from completed sessions
      const previousHours = Number(todayAttendance.totalHoursComputed) || 0;
      setPreviousSessionsHours(previousHours); // Store for display
      
      // Function to update timer - shows CURRENT SESSION time only
      const updateTimerFromDB = () => {
        const now = moment();
        const currentSessionDuration = moment.duration(now.diff(start));
        
        // Calculate ONLY current session time (not including previous)
        const currentSessionHours = currentSessionDuration.asHours();
        
        // Convert current session hours to hours:minutes:seconds
        const hours = Math.floor(currentSessionHours);
        const remainingMinutes = (currentSessionHours - hours) * 60;
        const minutes = Math.floor(remainingMinutes);
        const seconds = Math.floor((remainingMinutes - minutes) * 60);
        
        setWorkHours(hours);
        setWorkMinutes(minutes);
        setWorkSeconds(seconds);
      };
      
      // Initial calculation
      updateTimerFromDB();
      
      // Update every second based on DB timestamp (not local state)
      const interval = setInterval(updateTimerFromDB, 1000);
      setTimerInterval(interval);
      
    } else if (isClockedOut && todayAttendance) {
      setWorkStatus('not-working');
      setIsWorking(false);
      
      const totalHrs = Number(todayAttendance.totalHoursComputed) || 0;
      const hrs = Math.floor(totalHrs);
      const mins = Math.round((totalHrs - hrs) * 60);
      setTotalWorkedToday(`${hrs}h ${mins}m`);
      setWorkHours(hrs);
      setWorkMinutes(mins);
      setWorkSeconds(0);
      setPreviousSessionsHours(totalHrs); // Set previous hours for display
      
      if (todayAttendance.clockInTimestamp) {
        setStartTime(moment(todayAttendance.clockInTimestamp));
      }
    } else {
      // Not clocked in yet
      setWorkStatus('not-working');
      setIsWorking(false);
      setWorkHours(0);
      setWorkMinutes(0);
      setWorkSeconds(0);
      setStartTime(null);
      setTotalWorkedToday('0h 0m');
      setPreviousSessionsHours(0); // Reset previous hours
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isClockedIn, isClockedOut, todayAttendance?.clockInTimestamp, todayAttendance?.clockOutTimestamp, todayAttendance?.totalHoursComputed]);

  return {
    workHours,
    workMinutes,
    workSeconds,
    startTime,
    totalWorkedToday,
    isWorking,
    workStatus,
    setWorkStatus,
    timerInterval,
    previousSessionsHours, // NEW: Return previous sessions hours
  };
};
