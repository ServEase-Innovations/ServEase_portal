// components/leave/LeaveApprovalsTab.tsx
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';
import {
  LeaveRequest,
  LeaveRequestStatus,
  getPendingLeaveRequestsForManager,
  approveLeaveRequest,
  rejectLeaveRequest,
  formatLeaveDateRange,
  getLeaveTypeLabel,
  getLeaveStatusColor,
} from '../../../../services/leave.service';
import { useAuth } from '../../../../hooks/useAuth';
import toast from 'react-hot-toast';

interface LeaveApprovalsTabProps {
  tc: ThemeClasses;
}

const LeaveApprovalsTab: React.FC<LeaveApprovalsTabProps> = ({ tc }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch pending leave requests for this manager
  useEffect(() => {
    if (user?.id) {
      fetchPendingRequests();
    }
  }, [user?.id]);

  const fetchPendingRequests = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await getPendingLeaveRequestsForManager(user.id);
      setRequests(data);
    } catch (error: any) {
      console.error('Error fetching pending requests:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: LeaveRequest) => {
    if (!user?.id || !window.confirm(`Approve leave request for ${request.employee?.fullName}?`)) {
      return;
    }

    setProcessingId(request.leaveRequestId);
    try {
      await approveLeaveRequest(request.leaveRequestId, user.id);
      toast.success(`Leave request approved for ${request.employee?.fullName}`);
      await fetchPendingRequests(); // Refresh list
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve leave request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!user?.id || !selectedRequest) return;

    if (rejectReason.trim().length < 10) {
      toast.error('Rejection reason must be at least 10 characters');
      return;
    }

    setProcessingId(selectedRequest.leaveRequestId);
    try {
      await rejectLeaveRequest(selectedRequest.leaveRequestId, user.id, rejectReason);
      toast.success(`Leave request rejected for ${selectedRequest.employee?.fullName}`);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      await fetchPendingRequests(); // Refresh list
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject leave request');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = requests.filter(r => r.status === LeaveRequestStatus.Pending).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Leave Approvals</h2>
          <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>Approve or reject employee leave requests</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs sm:text-sm font-medium w-fit">
          {pendingCount} pending
        </span>
      </div>

      {(() => {
        if (isLoading) {
          return (
            <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} p-12 text-center`}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className={`mt-4 ${tc.textMuted}`}>Loading leave requests...</p>
            </div>
          );
        }
        
        if (requests.length === 0) {
          return (
            <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} p-8 sm:p-12 text-center`}>
              <ClockIcon className={`w-12 h-12 sm:w-16 sm:h-16 ${tc.textMuted} mx-auto mb-4`} />
              <p className={`${tc.text} font-medium mb-2`}>No pending leave requests</p>
              <p className={`text-xs sm:text-sm ${tc.textMuted}`}>All leave requests have been processed</p>
            </div>
          );
        }
        
        return (
        <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className={`text-left text-[10px] sm:text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Employee</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Type</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Period</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Days</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden md:table-cell">Reason</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.leaveRequestId} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-[10px] sm:text-xs font-bold flex-shrink-0">
                          {request.employee?.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className={`font-medium ${tc.text} text-xs sm:text-sm truncate`}>
                          {request.employee?.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      {(() => {
                        const getLeaveTypeStyles = (type: string) => {
                          if (type === 'Sick') return 'bg-red-500/20 text-red-400';
                          if (type === 'Casual') return 'bg-blue-500/20 text-blue-400';
                          return 'bg-purple-500/20 text-purple-400';
                        };
                        
                        return (
                          <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getLeaveTypeStyles(request.leaveType)}`}>
                            {getLeaveTypeLabel(request.leaveType)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm ${tc.textSecondary}`}>
                      {formatLeaveDateRange(request.fromDate, request.toDate)}
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm ${tc.textSecondary} hidden sm:table-cell`}>
                      {request.totalDays} {request.isHalfDay ? '(Half)' : 'day(s)'}
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm ${tc.textSecondary} hidden md:table-cell`}>
                      <div className="max-w-xs truncate" title={request.reason}>
                        {request.reason}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      {(() => {
                        const isPending = request.status === LeaveRequestStatus.Pending;
                        const isProcessing = processingId === request.leaveRequestId;
                        
                        if (!isPending) {
                          return (
                            <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getLeaveStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          );
                        }
                        
                        return (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button 
                              type="button"
                              onClick={() => handleApprove(request)}
                              disabled={isProcessing}
                              className="px-2 sm:px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircleIcon className="w-3 h-3" />
                              <span className="hidden sm:inline">Approve</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleRejectClick(request)}
                              disabled={isProcessing}
                              className="px-2 sm:px-3 py-1 bg-rose-500/20 text-rose-400 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <XCircleIcon className="w-3 h-3" />
                              <span className="hidden sm:inline">Reject</span>
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        );
      })()}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} max-w-md w-full p-4 sm:p-6`}>
            <h3 className={`text-lg sm:text-xl font-bold ${tc.text} mb-4`}>Reject Leave Request</h3>
            
            <div className="mb-4">
              <p className={`text-sm ${tc.textSecondary} mb-2`}>
                You are rejecting {selectedRequest.employee?.fullName}'s leave request for{' '}
                {formatLeaveDateRange(selectedRequest.fromDate, selectedRequest.toDate)}
              </p>
              <div className={`p-3 rounded-lg ${tc.bgTableHover} ${tc.border}`}>
                <p className={`text-xs ${tc.textMuted} mb-1`}>Reason:</p>
                <p className={`text-sm ${tc.text}`}>{selectedRequest.reason}</p>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="reject-reason-input" className={`block text-sm font-medium ${tc.text} mb-2`}>
                Rejection Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="reject-reason-input"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection (min. 10 characters)..."
                rows={4}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-transparent outline-none resize-none transition-all text-sm`}
              />
              <p className={`text-[10px] sm:text-xs ${tc.textMuted} mt-1`}>
                {rejectReason.length}/1000 characters {rejectReason.length < 10 && '(minimum 10)'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectReason('');
                }}
                disabled={processingId === selectedRequest.leaveRequestId}
                className={`w-full sm:w-auto px-4 py-2 ${tc.border} ${tc.textSecondary} rounded-xl text-sm font-medium ${tc.bgTableHover} transition-colors disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={processingId === selectedRequest.leaveRequestId || rejectReason.trim().length < 10}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:from-rose-600 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === selectedRequest.leaveRequestId ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovalsTab;