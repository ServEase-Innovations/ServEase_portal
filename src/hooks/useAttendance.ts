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
            clockOutTimestamp: undefined, // Clear clock-out to start new session
            totalHoursComputed: 0, // Reset hours
            shiftStatus: 'Working',
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
        totalHoursComputed: 0,
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
      
      // Calculate total hours from clock in time
      let clockInTime: Date;
      if (todayAttendance.clockInTimestamp) {
        clockInTime = new Date(todayAttendance.clockInTimestamp);
      } else {
        toast.error('No clock in time found');
        setIsLoading(false);
        return;
      }
      
      const diffMs = now.getTime() - clockInTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const totalHours = Math.round(diffHours * 100) / 100; // Round to 2 decimal places

      const data: UpdateAttendanceData = {
        clockOutTimestamp: now.toISOString(),
        totalHoursComputed: totalHours,
        shiftStatus: 'Working',
      };

      const result = await attendanceService.updateAttendance(
        Number(todayAttendance.attendanceId),
        data
      );
      
      console.log('Clock out result:', result);
      toast.success(`✅ Clocked out! Total hours: ${totalHours.toFixed(2)}h`);
      
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
    refreshAttendance,
    isClockedIn,
    isClockedOut,
    totalHoursToday,
    startTime,
    endTime,
  };
};