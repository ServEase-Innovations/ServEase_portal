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
      
      // Get today's record
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = records.find(
        record => record.calendarDate?.split('T')[0] === today
      );
      
      setTodayAttendance(todayRecord || null);
      
      if (todayRecord) {
        // Check if clocked in (has clockIn but no clockOut)
        const hasClockIn = !!todayRecord.clockInTimestamp;
        const hasClockOut = !!todayRecord.clockOutTimestamp;
        
        setIsClockedIn(hasClockIn && !hasClockOut);
        setIsClockedOut(hasClockOut);
        
        if (todayRecord.clockInTimestamp) {
          setStartTime(new Date(todayRecord.clockInTimestamp));
        }
        if (todayRecord.clockOutTimestamp) {
          setEndTime(new Date(todayRecord.clockOutTimestamp));
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
    if (!employeeId) {
      toast.error('Employee ID not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      
      // Check if already clocked in today
      if (todayAttendance) {
        if (todayAttendance.clockInTimestamp && !todayAttendance.clockOutTimestamp) {
          toast.error('Already clocked in today!');
          setIsLoading(false);
          return;
        }
        if (todayAttendance.clockOutTimestamp) {
          toast.error('Already clocked out for today!');
          setIsLoading(false);
          return;
        }
      }

      const data: CreateAttendanceData = {
        employeeId: employeeId,
        calendarDate: now.toISOString(),
        shiftStatus: 'Working',
        clockInTimestamp: now.toISOString(),
        totalHoursComputed: 0,
      };

      await attendanceService.createAttendance(data);
      toast.success('✅ Clocked in successfully!');
      
      await refreshAttendance();
      
      setIsClockedIn(true);
      setIsClockedOut(false);
      setStartTime(now);
    } catch (err: any) {
      console.error('Clock in error:', err);
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

      await attendanceService.updateAttendance(
        Number(todayAttendance.attendanceId),
        data
      );
      
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