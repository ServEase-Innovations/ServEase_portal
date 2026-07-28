// src/pages/HRDashboard/hooks/useTimer.ts

import { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import toast from 'react-hot-toast';
import { WorkSession } from '../types';

export const useTimer = (employeeName: string) => {
  const [isWorking, setIsWorking] = useState(false);
  const [workHours, setWorkHours] = useState(0);
  const [workMinutes, setWorkMinutes] = useState(0);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [startTime, setStartTime] = useState<moment.Moment | null>(null);
  const [workStatus, setWorkStatus] = useState<'working' | 'on-leave' | 'not-working'>('not-working');
  const [totalHoursToday, setTotalHoursToday] = useState(0);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isClockedOut, setIsClockedOut] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('hrWorkSessions');
    if (savedSessions) {
      try {
        setWorkSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error('Error loading work sessions:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isClockedIn && !timerInterval) {
      const interval = setInterval(() => {
        setWorkSeconds(prev => {
          if (prev >= 59) {
            setWorkMinutes(m => {
              if (m >= 59) {
                setWorkHours(h => h + 1);
                return 0;
              }
              return m + 1;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      setTimerInterval(interval);
    }
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isClockedIn]);

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleStartWork = useCallback(async () => {
    setAttendanceLoading(true);
    try {
      const now = moment();
      setStartTime(now);
      setIsClockedIn(true);
      setIsClockedOut(false);
      setWorkStatus('working');
      setIsWorking(true);
      
      setSuccessMessage(`Work started at ${now.format('hh:mm A')}`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      toast.success(`Work started at ${now.format('hh:mm A')}`);
    } catch (error) {
      console.error('Failed to start work:', error);
      toast.error('Failed to start work');
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  const handleStopWork = useCallback(async () => {
    setAttendanceLoading(true);
    try {
      const now = moment();
      const start = startTime || moment();
      
      const duration = moment.duration(now.diff(start));
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const seconds = duration.seconds();
      
      setIsClockedIn(false);
      setIsClockedOut(true);
      setWorkStatus('not-working');
      setIsWorking(false);
      setTotalHoursToday(hours + minutes / 60);
      
      setSuccessMessage(
        `Work session completed! Duration: ${hours}h ${minutes}m`
      );
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      toast.success(`Work session completed! Duration: ${hours}h ${minutes}m`);
      
      const session: WorkSession = {
        id: `WS-${Date.now()}`,
        date: now.format('YYYY-MM-DD'),
        startTime: start.toISOString(),
        endTime: now.toISOString(),
        duration: duration.asSeconds(),
        status: 'working',
        employeeName: employeeName
      };
      
      const updatedSessions = [session, ...workSessions];
      setWorkSessions(updatedSessions);
      localStorage.setItem('hrWorkSessions', JSON.stringify(updatedSessions));
      
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    } catch (error) {
      console.error('Failed to stop work:', error);
      toast.error('Failed to stop work');
    } finally {
      setAttendanceLoading(false);
    }
  }, [startTime, timerInterval, workSessions, employeeName]);

  const getStatusBadge = () => {
    if (isClockedIn) {
      return { label: '🟢 Working', class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
    } else if (isClockedOut) {
      return { label: '✅ Clocked Out', class: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
    } else if (workStatus === 'on-leave') {
      return { label: '🔵 On Leave', class: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
    }
    return { label: '⚪ Not Working', class: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' };
  };

  const getTodayHoursDisplay = () => {
    if (isClockedIn) {
      return formatTime(workHours, workMinutes, workSeconds);
    } else if (isClockedOut) {
      return `${Math.floor(totalHoursToday)}h ${Math.round((totalHoursToday - Math.floor(totalHoursToday)) * 60)}m`;
    }
    return '0h 0m';
  };

  return {
    isWorking,
    workHours,
    workMinutes,
    workSeconds,
    startTime,
    workStatus,
    totalHoursToday,
    isClockedIn,
    isClockedOut,
    attendanceLoading,
    showSuccessMessage,
    successMessage,
    workSessions,
    formatTime,
    handleStartWork,
    handleStopWork,
    getStatusBadge,
    getTodayHoursDisplay,
    setWorkStatus,
    setShowSuccessMessage,
    setSuccessMessage,
    setIsClockedOut,
    setWorkSessions
  };
};