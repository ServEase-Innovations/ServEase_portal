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
    // Ensure clockInTimestamp is a full ISO datetime
    const payload = {
      ...data,
      clockInTimestamp: data.clockInTimestamp ? new Date(data.clockInTimestamp).toISOString() : undefined,
      calendarDate: new Date(data.calendarDate).toISOString().split('T')[0],
    };
    const response = await api.post('/attendance', payload);
    return response.data;
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
    // Ensure timestamps are proper ISO strings
    const payload: any = { ...data };
    
    if (data.clockInTimestamp) {
      payload.clockInTimestamp = new Date(data.clockInTimestamp).toISOString();
    }
    if (data.clockOutTimestamp) {
      payload.clockOutTimestamp = new Date(data.clockOutTimestamp).toISOString();
    }
    if (data.totalHoursComputed !== undefined) {
      payload.totalHoursComputed = data.totalHoursComputed;
    }
    
    const response = await api.put(`/attendance/${id}`, payload);
    return response.data;
  },

  // Delete attendance record
  deleteAttendance: async (id: string | number): Promise<void> => {
    await api.delete(`/attendance/${id}`);
  },

  // Get attendance for a specific employee
  getAttendanceByEmployee: async (employeeId: string): Promise<Attendance[]> => {
    const allAttendance = await attendanceService.getAttendance();
    return allAttendance.filter(record => record.employeeId === employeeId);
  },

  // Get today's attendance for an employee
  getTodayAttendance: async (employeeId: string): Promise<Attendance | null> => {
    const allAttendance = await attendanceService.getAttendance();
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = allAttendance.find(
      record => record.employeeId === employeeId && 
      record.calendarDate?.split('T')[0] === today
    );
    return todayRecord || null;
  }
};