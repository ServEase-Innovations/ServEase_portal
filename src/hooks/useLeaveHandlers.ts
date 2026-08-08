// src/hooks/useLeaveHandlers.ts
import { ChangeEvent } from 'react';
import moment from 'moment';

export interface LeaveRequestData {
  type: 'Sick' | 'Casual' | 'Earned' | 'Other';
  fromDate: string;
  toDate: string;
  reason: string;
  imageFile: File | null;
  imagePreview: string | null;
}

export const useLeaveHandlers = () => {
  const handleLeaveImageUpload = (
    e: ChangeEvent<HTMLInputElement>,
    leaveRequest: LeaveRequestData,
    setLeaveRequest: (request: LeaveRequestData) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLeaveRequest({
          ...leaveRequest,
          imageFile: file,
          imagePreview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateLeaveRequest = (leaveRequest: LeaveRequestData): { valid: boolean; error?: string } => {
    if (!leaveRequest.fromDate || !leaveRequest.toDate || !leaveRequest.reason) {
      return { valid: false, error: 'Please fill in all required fields' };
    }

    const fromDate = moment(leaveRequest.fromDate);
    const toDate = moment(leaveRequest.toDate);
    
    if (toDate.isBefore(fromDate)) {
      return { valid: false, error: 'End date cannot be before start date' };
    }

    return { valid: true };
  };

  return {
    handleLeaveImageUpload,
    validateLeaveRequest
  };
};
