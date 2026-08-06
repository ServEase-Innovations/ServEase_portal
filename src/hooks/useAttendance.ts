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

  const refreshAttendance = useCallback(async () => {
    if (!employeeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const records = await attendanceService.getAttendanceByEmployee(employeeId);
      setAttendanceRecords(records);
      
      // Get today's record - compare using epoch timestamps
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const todayRecord = records.find(record => {
        if (!record.calendarDate) return false;
        
        // calendarDate comes as epoch milliseconds from backend
        const recordDate = typeof record.calendarDate === 'number' 
          ? record.calendarDate 
          : new Date(record.calendarDate).getTime();
        
        return recordDate >= todayStart.getTime() && recordDate <= todayEnd.getTime();
      });
      
      setTodayAttendance(todayRecord || null);
      
      if (todayRecord) {
        // Check if clocked in (has clockIn but no clockOut)
        const hasClockIn = !!todayRecord.clockInTimestamp;
        const hasClockOut = !!todayRecord.clockOutTimestamp;
        
        setIsClockedIn(hasClockIn && !hasClockOut);
        setIsClockedOut(hasClockOut);
        
        if (todayRecord.clockInTimestamp) {
          // Handle both number (epoch) and string (ISO) formats
          const clockInValue = typeof todayRecord.clockInTimestamp === 'number'
            ? todayRecord.clockInTimestamp
            : new Date(todayRecord.clockInTimestamp).getTime();
          setStartTime(new Date(clockInValue));
        }
        if (todayRecord.clockOutTimestamp) {
          const clockOutValue = typeof todayRecord.clockOutTimestamp === 'number'
            ? todayRecord.clockOutTimestamp
            : new Date(todayRecord.clockOutTimestamp).getTime();
          setEndTime(new Date(clockOutValue));
        }
        
        setTotalHoursToday(Number(todayRecord.totalHoursComputed) || 0);
      } else {
        setIsClockedIn(false);
        setIsClockedOut(false);
        setTotalHoursToday(0);
        setStartTime(null);
        setEndTime(null);
      }
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      setError(err.message || 'Failed to fetch attendance records');
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
        
        // If currently clocked in, don't allow another clock-in
        if (todayAttendance.clockInTimestamp && !todayAttendance.clockOutTimestamp) {
          toast.error('Already clocked in! Please clock out first.');
          setIsLoading(false);
          return;
        }
        
        // If clocked out, start a new session by updating the existing record
        if (todayAttendance.clockOutTimestamp) {
          console.log('Previous session completed, starting new session by updating record...');
          
          const updateData: UpdateAttendanceData = {
            clockInTimestamp: now.toISOString(),
            clockOutTimestamp: null, // Clear clock-out to start new session
            shiftStatus: 'Working',
            // totalHoursComputed NOT sent - backend calculates it
          };
          
          // Update instead of create
          const result = await attendanceService.updateAttendance(
            Number(todayAttendance.attendanceId),
            updateData
          );
          
          console.log('✅ Session updated (new clock-in):', result);
          toast.success('✅ New work session started!');
          
          setIsClockedIn(true);
          setIsClockedOut(false);
          setStartTime(now);
          
          await refreshAttendance();
          setIsLoading(false);
          return;
        }
      }

      // No existing record, create a new one
      const data: CreateAttendanceData = {
        employeeId: employeeId,
        calendarDate: now.toISOString(),
        shiftStatus: 'Working',
        clockInTimestamp: now.toISOString(),
        // totalHoursComputed NOT sent - backend calculates it
      };

      console.log('📤 Sending clock in request (new record):', data);
      const result = await attendanceService.createAttendance(data);
      console.log('✅ Clock in result:', result);
      toast.success('✅ Clocked in successfully!');
      
      setIsClockedIn(true);
      setIsClockedOut(false);
      setStartTime(now);
      
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
      toast.success(`🔄 Work resumed! Previous hours: ${previousHours.toFixed(2)}h`);
      
      setIsClockedIn(true);
      setIsClockedOut(false);
      setStartTime(now); // Set new start time for timer
      setEndTime(null); // Clear end time since we're resuming
      
      await refreshAttendance();
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