import { useState, useEffect, useCallback } from 'react';
import {
  getLeaveBalances,
  getLeaveRequestsByEmployee,
  createLeaveRequest,
  cancelLeaveRequest,
  LeaveBalance,
  LeaveRequest,
  CreateLeaveRequestData,
  LeaveRequestStatus,
  LeaveType,
} from '../services/leave.service';
import { useAuth } from './useAuth';

export const useLeave = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch leave balances for the current user
   */
  const fetchBalances = useCallback(async (year?: number) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getLeaveBalances(user.id.toString(), year);
      setBalances(data);
    } catch (err: any) {
      console.error('Error fetching leave balances:', err);
      setError(err.response?.data?.message || 'Failed to load leave balances');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Fetch leave requests for the current user
   */
  const fetchRequests = useCallback(async (status?: LeaveRequestStatus) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getLeaveRequestsByEmployee(user.id.toString(), status);
      setRequests(data);
    } catch (err: any) {
      console.error('Error fetching leave requests:', err);
      setError(err.response?.data?.message || 'Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Submit a new leave request
   */
  const submitLeaveRequest = useCallback(async (data: Omit<CreateLeaveRequestData, 'employeeId'>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestData: CreateLeaveRequestData = {
        ...data,
        employeeId: user.id.toString(),
      };

      const newRequest = await createLeaveRequest(requestData);
      
      // Refresh balances and requests
      await Promise.all([fetchBalances(), fetchRequests()]);

      return newRequest;
    } catch (err: any) {
      console.error('Error submitting leave request:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit leave request';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, fetchBalances, fetchRequests]);

  /**
   * Cancel a leave request
   */
  const cancelRequest = useCallback(async (leaveRequestId: string, reason: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const cancelled = await cancelLeaveRequest(
        leaveRequestId,
        user.id.toString(),
        reason
      );

      // Refresh balances and requests
      await Promise.all([fetchBalances(), fetchRequests()]);

      return cancelled;
    } catch (err: any) {
      console.error('Error cancelling leave request:', err);
      const errorMessage = err.response?.data?.message || 'Failed to cancel leave request';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, fetchBalances, fetchRequests]);

  /**
   * Get balance for a specific leave type
   */
  const getBalanceByType = useCallback((leaveType: LeaveType): LeaveBalance | undefined => {
    return balances.find(b => b.leaveType === leaveType);
  }, [balances]);

  /**
   * Get total available leaves across all types
   */
  const getTotalAvailableLeaves = useCallback((): number => {
    return balances.reduce((total, balance) => total + balance.totalAvailable, 0);
  }, [balances]);

  /**
   * Get pending requests count
   */
  const getPendingCount = useCallback((): number => {
    return requests.filter(r => r.status === LeaveRequestStatus.Pending).length;
  }, [requests]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchBalances(), fetchRequests()]);
  }, [fetchBalances, fetchRequests]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      refresh();
    }
  }, [user?.id]); // Only depend on id, not refresh

  return {
    balances,
    requests,
    isLoading,
    error,
    fetchBalances,
    fetchRequests,
    submitLeaveRequest,
    cancelRequest,
    getBalanceByType,
    getTotalAvailableLeaves,
    getPendingCount,
    refresh,
  };
};
