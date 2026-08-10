// src/services/attendance.service.ts
import api from './api';
import { Attendance } from '../types';
import { AxiosError } from 'axios';

export interface CreateAttendanceData {
  employeeId: string;
  calendarDate: string;
  shiftStatus: ShiftStatus;
  clockInTimestamp?: string;
  clockOutTimestamp?: string;
  // totalHoursComputed is removed - server calculates it
}

// Type alias for shift status to avoid union type repetition
type ShiftStatus = 'Working' | 'OnLeave' | 'Absent';

export interface UpdateAttendanceData {
  shiftStatus?: ShiftStatus;
  clockInTimestamp?: string;
  clockOutTimestamp?: string | null; // null to explicitly clear
  // totalHoursComputed is removed - server calculates it
}

// Type-safe payload interface for update
interface UpdateAttendancePayload {
  shiftStatus?: ShiftStatus;
  clockInTimestamp?: number;
  clockOutTimestamp?: number | null;
}

/**
 * Validates and converts a date string/timestamp to epoch milliseconds
 * @param date - Date string or timestamp
 * @param fieldName - Name of the field (for error messages)
 * @returns Epoch milliseconds
 * @throws TypeError if date is invalid
 */
const toEpochMilliseconds = (date: string | number, fieldName: string): number => {
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) {
    throw new TypeError(`Invalid date provided for ${fieldName}: ${date}`);
  }
  return timestamp;
};

/**
 * Logs error safely - hides sensitive data in production
 */
const logError = (message: string, error: unknown) => {
  console.error(message, error);
  // Only log detailed error response in development
  if (process.env.NODE_ENV === 'development') {
    if (error instanceof Error && 'response' in error) {
      console.error('Error response:', (error as AxiosError).response?.data);
    }
  }
};

export const attendanceService = {
  // Create attendance record
  createAttendance: async (data: CreateAttendanceData): Promise<Attendance> => {
    // Backend expects epoch milliseconds (numbers), not ISO strings
    const payload = {
      employeeId: data.employeeId,
      calendarDate: toEpochMilliseconds(data.calendarDate, 'calendarDate'),
      shiftStatus: data.shiftStatus,
      clockInTimestamp: data.clockInTimestamp ? toEpochMilliseconds(data.clockInTimestamp, 'clockInTimestamp') : undefined,
      clockOutTimestamp: data.clockOutTimestamp ? toEpochMilliseconds(data.clockOutTimestamp, 'clockOutTimestamp') : undefined,
      // totalHoursComputed is NOT sent - server calculates it
    };
    
    console.log('🔵 Attendance Service - Creating attendance');
    console.log('Input data:', data);
    console.log('Payload to send:', payload);
    
    try {
      const response = await api.post('/attendance', payload);
      console.log('✅ Attendance created:', response.data);
      return response.data;
    } catch (error: unknown) {
      logError('❌ Create attendance error:', error);
      throw error;
    }
  },

  // Get all attendance records
  getAttendance: async (): Promise<Attendance[]> => {
    const response = await api.get('/attendance');
    return response.data;
  },

  // Get attendance by ID
  getAttendanceById: async (id: string | number): Promise<Attendance> => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },

  // Update attendance record
  updateAttendance: async (id: string | number, data: UpdateAttendanceData): Promise<Attendance> => {
    // Backend expects epoch milliseconds (numbers), not ISO strings
    const payload: UpdateAttendancePayload = {};
    
    if (data.shiftStatus !== undefined) {
      payload.shiftStatus = data.shiftStatus;
    }
    
    if (data.clockInTimestamp) {
      payload.clockInTimestamp = toEpochMilliseconds(data.clockInTimestamp, 'clockInTimestamp');
    }
    
    // Handle clockOutTimestamp - can be null (to clear it) or a timestamp
    if (data.clockOutTimestamp === null) {
      payload.clockOutTimestamp = null; // Explicitly clear the field
    } else if (data.clockOutTimestamp !== undefined) {
      payload.clockOutTimestamp = toEpochMilliseconds(data.clockOutTimestamp, 'clockOutTimestamp');
    }
    
    // totalHoursComputed is NOT sent - server calculates it
    
    console.log('🔵 Attendance Service - Updating attendance');
    console.log('Input data:', data);
    console.log('Payload to send:', payload);
    
    const response = await api.put(`/attendance/${id}`, payload);
    console.log('✅ Attendance updated:', response.data);
    return response.data;
  },

  // Delete attendance record
  deleteAttendance: async (id: string | number): Promise<void> => {
    await api.delete(`/attendance/${id}`);
  },

  // Get attendance for a specific employee
  getAttendanceByEmployee: async (employeeId: string): Promise<Attendance[]> => {
    const response = await api.get(`/attendance/employee/${employeeId}`);
    return response.data;
  },

  // Get today's attendance for an employee
  getTodayAttendance: async (employeeId: string): Promise<Attendance | null> => {
    try {
      const response = await api.get(`/attendance/employee/${employeeId}/today`);
      return response.data;
    } catch (error: unknown) {
      // If 404, no record found for today
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      // For other errors, rethrow
      throw error;
    }
  }
};