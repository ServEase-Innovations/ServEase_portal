// src/pages/HRDashboard/hooks/useLeaveManagement.ts

import { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import toast from 'react-hot-toast';
import { LeaveRequest } from '../types';

export const useLeaveManagement = (initialLeaves: LeaveRequest[]) => {
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    type: 'Sick' as 'Sick' | 'Casual' | 'Earned' | 'Other',
    fromDate: '',
    toDate: '',
    reason: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  useEffect(() => {
    const savedLeaves = localStorage.getItem('hrLeaveHistory');
    if (savedLeaves) {
      try {
        setLeaveHistory(JSON.parse(savedLeaves));
      } catch (e) {
        console.error('Error loading leave history:', e);
      }
    }
  }, []);

  const handleLeaveImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLeaveRequest({ ...leaveRequest, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLeaveRequest({ ...leaveRequest, imageFile: file, imagePreview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitLeave = useCallback(() => {
    if (!leaveRequest.fromDate || !leaveRequest.toDate || !leaveRequest.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    const fromDate = moment(leaveRequest.fromDate);
    const toDate = moment(leaveRequest.toDate);
    
    if (toDate.isBefore(fromDate)) {
      toast.error('End date cannot be before start date');
      return;
    }

    const duration = toDate.diff(fromDate, 'days') + 1;

    const newLeave: LeaveRequest = {
      id: `LV-${String(leaveHistory.length + initialLeaves.length + 1).padStart(3, '0')}`,
      employee: 'Sanya Kapoor',
      type: leaveRequest.type as any,
      period: `${fromDate.format('YYYY-MM-DD')} - ${toDate.format('YYYY-MM-DD')}`,
      fromDate: fromDate.format('YYYY-MM-DD'),
      toDate: toDate.format('YYYY-MM-DD'),
      duration: `${duration}d`,
      reason: leaveRequest.reason,
      status: 'Pending',
      department: 'HR',
      imageUrl: leaveRequest.imagePreview,
      submittedAt: moment().toISOString()
    };

    const updatedLeaves = [newLeave, ...leaveHistory];
    setLeaveHistory(updatedLeaves);
    localStorage.setItem('hrLeaveHistory', JSON.stringify(updatedLeaves));
    
    setShowLeaveModal(false);
    setLeaveRequest({
      type: 'Sick',
      fromDate: '',
      toDate: '',
      reason: '',
      imageFile: null,
      imagePreview: null,
    });
    
    const successMsg = `Leave request submitted for ${fromDate.format('MMM D')} - ${toDate.format('MMM D, YYYY')}`;
    toast.success(successMsg);
    return successMsg;
  }, [leaveRequest, leaveHistory, initialLeaves]);

  return {
    leaveHistory,
    showLeaveModal,
    leaveRequest,
    setShowLeaveModal,
    setLeaveRequest,
    handleLeaveImageUpload,
    handleSubmitLeave,
    setLeaveHistory
  };
};