// src/hooks/useAttendanceHandlers.ts
import { useState } from 'react';
import moment from 'moment';

interface UseAttendanceHandlersProps {
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  resumeWork: () => Promise<void>;
  totalHoursToday: number;
}

interface WorkSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'working' | 'on-leave' | 'not-working';
  employeeName?: string;
}

export const useAttendanceHandlers = ({
  clockIn,
  clockOut,
  resumeWork,
  totalHoursToday
}: UseAttendanceHandlersProps) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (message: string, duration = 3000) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), duration);
  };

  const handleStartWork = async () => {
    console.log('🟢 handleStartWork called');
    try {
      const now = moment();
      
      console.log('📞 Calling clockIn API...');
      await clockIn();
      console.log('✅ clockIn completed');
      
      showSuccess(`Work started at ${now.format('hh:mm A')}`);
    } catch (error) {
      console.error('❌ Failed to start work:', error);
      throw error;
    }
  };

  const handleStopWork = async () => {
    console.log('🔴 handleStopWork called');
    try {
      console.log('📞 Calling clockOut API...');
      await clockOut();
      console.log('✅ clockOut completed');
      
      const totalHrs = totalHoursToday || 0;
      const hrs = Math.floor(totalHrs);
      const mins = Math.round((totalHrs - hrs) * 60);
      
      showSuccess(`Work session completed! Duration: ${hrs}h ${mins}m`);
    } catch (error) {
      console.error('❌ Failed to stop work:', error);
      throw error;
    }
  };

  const handleResumeWork = async () => {
    console.log('🔄 handleResumeWork called');
    try {
      const now = moment();
      
      console.log('📞 Calling resumeWork API...');
      await resumeWork();
      console.log('✅ resumeWork completed');
      
      showSuccess(`Work resumed at ${now.format('hh:mm A')}`);
    } catch (error) {
      console.error('❌ Failed to resume work:', error);
      throw error;
    }
  };

  return {
    handleStartWork,
    handleStopWork,
    handleResumeWork,
    showSuccessMessage,
    successMessage,
    showSuccess
  };
};

// Shared utility functions
export const formatTime = (hours: number, minutes: number, seconds: number): string => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
