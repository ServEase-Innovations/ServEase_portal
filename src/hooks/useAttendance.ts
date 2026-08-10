// src/hooks/useAttendance.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { attendanceService, CreateAttendanceData, UpdateAttendanceData } from '../services/attendance.service';
import { Attendance } from '../types';
import toast from 'react-hot-toast';

interface UseAttendanceReturn {
  attendanceRecords: Attendance[];
  todayAttendance: Attendance | null;
  isLoading: boolean;
  error: string | null;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  resumeWork: () => Promise<void>;
  refreshAttendance: () => Promise<void>;
  isClockedIn: boolean;
  isClockedOut: boolean;
  totalHoursToday: number;
  startTime: Date | null;
  endTime: Date | null;
}

export const useAttendance = (): UseAttendanceReturn => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isClockedOut, setIsClockedOut] = useState(false);
  const [totalHoursToday, setTotalHoursToday] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const employeeId = user?.id || '';

  // Helper function to normalize timestamp to epoch milliseconds
  const normalizeTimestamp = (timestamp: number | string | null | undefined): number | null => {
    if (!timestamp) return null;
    return typeof timestamp === 'number' 
      ? timestamp 
      : new Date(timestamp).getTime();
  };

  // Helper function to check if record is from today
  const isTodayRecord = (record: Attendance): boolean => {
    if (!record.calendarDate) {
      console.log('❌ isTodayRecord: No calendarDate in record');
      return false;
    }
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const recordDate = normalizeTimestamp(record.calendarDate);
    if (!recordDate) {
      console.log('❌ isTodayRecord: Could not normalize recordDate');
      return false;
    }
    
    const isToday = recordDate >= todayStart.getTime() && recordDate <= todayEnd.getTime();
    
    console.log('🔍 isTodayRecord check:', {
      recordDate: new Date(recordDate).toISOString(),
      todayStart: todayStart.toISOString(),
      todayEnd: todayEnd.toISOString(),
      isToday,
      recordId: record.attendanceId
    });
    
    return isToday;
  };

  // Helper function to update attendance state from record
  const updateStateFromRecord = (todayRecord: Attendance | null) => {
    if (todayRecord) {
      const hasClockIn = !!todayRecord.clockInTimestamp;
      const hasClockOut = !!todayRecord.clockOutTimestamp;
      
      setIsClockedIn(hasClockIn && !hasClockOut);
      setIsClockedOut(hasClockOut);
      
      const clockInValue = normalizeTimestamp(todayRecord.clockInTimestamp);
      const clockOutValue = normalizeTimestamp(todayRecord.clockOutTimestamp);
      
      setStartTime(clockInValue ? new Date(clockInValue) : null);
      setEndTime(clockOutValue ? new Date(clockOutValue) : null);
      setTotalHoursToday(Number(todayRecord.totalHoursComputed) || 0);
    } else {
      setIsClockedIn(false);
      setIsClockedOut(false);
      setTotalHoursToday(0);
      setStartTime(null);
      setEndTime(null);
    }
  };

  const refreshAttendance = useCallback(async () => {
    if (!employeeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const records = await attendanceService.getAttendanceByEmployee(employeeId);
      setAttendanceRecords(records);
      
      const todayRecord = records.find(isTodayRecord);
      setTodayAttendance(todayRecord || null);
      updateStateFromRecord(todayRecord || null);
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      const errorMsg = err.response?.status === 401 
        ? 'Authentication required. Please login again.'
        : err.message || 'Failed to fetch attendance records';
      setError(errorMsg);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  const clockIn = useCallback(async () => {
    console.log('🔵 clockIn called');
    console.log('Employee ID:', employeeId);
    console.log('Today Attendance:', todayAttendance);
    
    if (!employeeId) {
      toast.error('Employee ID not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();

      // Check if there's already an attendance record for today
      if (todayAttendance) {
        console.log('Found existing attendance:', todayAttendance);
        console.log('Checking if record is from today...');
        
        // CRITICAL: Check if this record is actually from TODAY
        // If it's from a previous day, create a NEW record instead of updating old one
        const recordIsFromToday = isTodayRecord(todayAttendance);
        console.log('recordIsFromToday:', recordIsFromToday);
        
        if (recordIsFromToday) {
          // Record is from TODAY - check if we can resume or if already working
          console.log('✅ Record IS from today - checking clock status...');
          
          // If currently clocked in, don't allow another clock-in
          if (todayAttendance.clockInTimestamp && !todayAttendance.clockOutTimestamp) {
            toast.error('Already clocked in! Please clock out first.');
            setIsLoading(false);
            return;
          }
          
          // If clocked out, start a new session WITHIN THE SAME DAY by updating record
          if (todayAttendance.clockOutTimestamp) {
            console.log('Previous session completed TODAY, starting new session (updating same day record)...');
            
            const updateData: UpdateAttendanceData = {
              clockInTimestamp: now.toISOString(),
              clockOutTimestamp: null, // Clear clock-out to start new session
              shiftStatus: 'Working',
              // totalHoursComputed NOT sent - backend calculates it
            };
            
            // Update instead of create (same day, new session)
            const result = await attendanceService.updateAttendance(
              Number(todayAttendance.attendanceId),
              updateData
            );
            
            console.log('✅ Same-day session updated (new clock-in):', result);
            toast.success('✅ New work session started!');
            
            setIsClockedIn(true);
            setIsClockedOut(false);
            setStartTime(now);
            
            await refreshAttendance();
            setIsLoading(false);
            return;
          }
        } else {
          // Record is NOT from today - create a NEW record
          console.log('⚠️ Found record is from a PREVIOUS day - creating NEW record for today');
          console.log('Old record calendarDate:', todayAttendance.calendarDate);
          console.log('Today timestamp:', now.getTime());
          // Fall through to create new record below
        }
      }

      // No existing record for TODAY, create a new one with totalHours = 0
      const data: CreateAttendanceData = {
        employeeId: employeeId,
        calendarDate: now.toISOString(),
        shiftStatus: 'Working',
        clockInTimestamp: now.toISOString(),
        totalHoursComputed: 0, // EXPLICIT: Start fresh for new day
      };

      console.log('📤 Creating NEW attendance record for today (fresh start):', data);
      const result = await attendanceService.createAttendance(data);
      console.log('✅ Clock in result (new record):', result);
      toast.success('✅ Clocked in successfully!');
      
      setIsClockedIn(true);
      setIsClockedOut(false);
      setStartTime(now);
      setTotalHoursToday(0); // Reset hours display
      
      await refreshAttendance();
    } catch (err: any) {
      console.error('❌ Clock in error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to clock in';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, todayAttendance, refreshAttendance]);

  const resumeWork = useCallback(async () => {
    console.log('🔵 resumeWork called');
    console.log('Employee ID:', employeeId);
    console.log('Today Attendance:', todayAttendance);
    
    if (!employeeId || !todayAttendance) {
      toast.error('No attendance record found to resume');
      return;
    }

    if (!todayAttendance.attendanceId) {
      toast.error('Invalid attendance record');
      return;
    }

    // If already clocked in, don't allow resume
    if (todayAttendance.clockInTimestamp && !todayAttendance.clockOutTimestamp) {
      toast.error('Already working! Cannot resume.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      
      // Save the accumulated hours from previous session(s) for display only
      const previousHours = Number(todayAttendance.totalHoursComputed) || 0;
      
      // Resume by setting NEW clockIn time and clearing clockOut
      // DON'T send totalHoursComputed - backend will keep it unchanged
      const updateData: UpdateAttendanceData = {
        clockInTimestamp: now.toISOString(), // Set NEW clock-in time for this session
        clockOutTimestamp: null, // Clear clock-out to resume work
        shiftStatus: 'Working',
        // totalHoursComputed NOT sent - backend preserves accumulated hours
      };

      console.log('📤 Resuming work - setting new clockIn time, backend keeps accumulated hours:', previousHours);
      const result = await attendanceService.updateAttendance(
        Number(todayAttendance.attendanceId),
        updateData
      );
      
      console.log('✅ Work resumed:', result);
      toast.success(`🔄 Work resumed!`);
      
      // Wait for refresh to complete before updating local state
      await refreshAttendance();
      
      // Now set local state after refresh
      setIsClockedIn(true);
      setIsClockedOut(false);
      setStartTime(now); // Set new start time for timer
      setEndTime(null); // Clear end time since we're resuming
    } catch (err: any) {
      console.error('❌ Resume work error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to resume work';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, todayAttendance, refreshAttendance]);

  const clockOut = useCallback(async () => {
    if (!employeeId || !todayAttendance) {
      toast.error('No active attendance record found');
      return;
    }

    if (!todayAttendance.attendanceId) {
      toast.error('Invalid attendance record');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      
      if (!todayAttendance.clockInTimestamp) {
        toast.error('No clock in time found');
        setIsLoading(false);
        return;
      }

      // SECURITY: Let backend calculate hours - don't trust client calculation
      // Backend will use the ACTUAL clockIn from database and calculate correctly
      const data: UpdateAttendanceData = {
        clockOutTimestamp: now.toISOString(),
        // DON'T send totalHoursComputed - backend calculates it securely
        shiftStatus: 'Working',
      };

      console.log(`⏸️ Stopping work - letting backend calculate hours`);
      
      const result = await attendanceService.updateAttendance(
        Number(todayAttendance.attendanceId),
        data
      );
      
      console.log('Clock out result:', result);
      
      // Get the total from backend response
      const totalHours = Number(result.totalHoursComputed) || 0;
      toast.success(`⏸️ Work stopped! Total hours today: ${totalHours.toFixed(2)}h`);
      
      await refreshAttendance();
      
      setIsClockedIn(false);
      setIsClockedOut(true);
      setTotalHoursToday(totalHours);
      setEndTime(now);
    } catch (err: any) {
      console.error('Clock out error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to clock out';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, todayAttendance, refreshAttendance]);

  // Load attendance on mount and when employee changes
  useEffect(() => {
    if (employeeId) {
      refreshAttendance();
    }
  }, [employeeId, refreshAttendance]);

  return {
    attendanceRecords,
    todayAttendance,
    isLoading,
    error,
    clockIn,
    clockOut,
    resumeWork,
    refreshAttendance,
    isClockedIn,
    isClockedOut,
    totalHoursToday,
    startTime,
    endTime,
  };
};