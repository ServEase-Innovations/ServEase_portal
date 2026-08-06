// src/services/attendance.service.ts
import api from './api';
import { Attendance } from '../types';

export interface CreateAttendanceData {
  employeeId: string;
  calendarDate: string;
  shiftStatus: 'Working' | 'OnLeave' | 'Absent';
  clockInTimestamp?: string;
  clockOutTimestamp?: string;
  totalHoursComputed: number;
}

export interface UpdateAttendanceData {
  shiftStatus?: 'Working' | 'OnLeave' | 'Absent';
  clockInTimestamp?: string;
  clockOutTimestamp?: string;
  totalHoursComputed?: number;
}

export const attendanceService = {
  // Create attendance record
  createAttendance: async (data: CreateAttendanceData): Promise<Attendance> => {
    // Backend expects epoch milliseconds (numbers), not ISO strings
    const payload = {
      ...data,
      employeeId: data.employeeId,
      calendarDate: new Date(data.calendarDate).getTime(), // Convert to epoch milliseconds
      clockInTimestamp: data.clockInTimestamp ? new Date(data.clockInTimestamp).getTime() : undefined,
      clockOutTimestamp: data.clockOutTimestamp ? new Date(data.clockOutTimestamp).getTime() : undefined,
      shiftStatus: data.shiftStatus,
      totalHoursComputed: data.totalHoursComputed,
    };
    
    console.log('🔵 Attendance Service - Creating attendance');
    console.log('Input data:', data);
    console.log('Payload to send:', payload);
    
    try {
      const response = await api.post('/attendance', payload);
      console.log('✅ Attendance created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Create attendance error:', error);
      console.error('Error response:', error.response?.data);
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
    const payload: any = { ...data };
    
    if (data.clockInTimestamp) {
      payload.clockInTimestamp = new Date(data.clockInTimestamp).getTime();
    }
    
    // Handle clockOutTimestamp - explicitly send null to clear it
    if (data.clockOutTimestamp === undefined) {
      payload.clockOutTimestamp = null; // Explicitly clear the field
    } else if (data.clockOutTimestamp) {
      payload.clockOutTimestamp = new Date(data.clockOutTimestamp).getTime();
    }
    
    if (data.totalHoursComputed !== undefined) {
      payload.totalHoursComputed = data.totalHoursComputed;
    }
    
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
    } catch (error: any) {
      // If 404, no record found for today
      if (error.response?.status === 404) {
        return null;
      }
      // For other errors, rethrow
      throw error;
    }
  }
};