// components/leave/LeaveTab.tsx
import React, { useEffect, useState } from 'react';
import { PlusIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { ThemeClasses, LeaveRequest } from '../types';
import StatusBadge from '../common/StatusBadge';
import { useLeave } from '../../../../hooks/useLeave';
import { 
  formatLeaveDateRange, 
  getLeaveTypeLabel, 
  getLeaveStatusColor,
  LeaveType,
  LeaveRequestStatus 
} from '../../../../services/leave.service';
import toast from 'react-hot-toast';

interface LeaveTabProps {
  tc: ThemeClasses;
  leaveHistory: LeaveRequest[];
  leaveRequests: LeaveRequest[];
  setShowLeaveModal: (show: boolean) => void;
}

const LeaveTab: React.FC<LeaveTabProps> = ({ 
  tc, 
  setShowLeaveModal 
}) => {
  const { 
    balances, 
    requests, 
    isLoading, 
    error,
    cancelRequest,
    getPendingCount 
  } = useLeave();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Get specific balance types
  const privilegeBalance = balances.find(b => b.leaveType === LeaveType.Privilege);
  const casualBalance = balances.find(b => b.leaveType === LeaveType.Casual);
  const pendingCount = getPendingCount();

  const handleCancelClick = (request: any) => {
    setSelectedRequest(request);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async () => {
    if (!selectedRequest) return;

    if (cancelReason.trim().length < 10) {
      toast.error('Cancellation reason must be at least 10 characters');
      return;
    }

    setIsCancelling(true);
    try {
      await cancelRequest(selectedRequest.leaveRequestId, cancelReason);
      toast.success('Leave request cancelled successfully');
      setShowCancelModal(false);
      setSelectedRequest(null);
      setCancelReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel leave request');
    } finally {
      setIsCancelling(false);
    }
  };

  if (error) {
    return (
      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="text-center">
          <p className="text-rose-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Flexi Leave</h4>
          <p className={`text-xl sm:text-2xl font-bold ${tc.text}`}>
            {isLoading ? '...' : `${casualBalance?.totalAvailable || 0} / ${casualBalance?.totalAllocated || 6}`}
          </p>
          <p className={`text-xs ${tc.textMuted}`}>
            days remaining (Casual/Sick)
          </p>
        </div>
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Privilege Leave</h4>
          <p className={`text-xl sm:text-2xl font-bold ${tc.text}`}>
            {isLoading ? '...' : `${privilegeBalance?.totalAvailable || 0} / ${privilegeBalance?.totalAllocated || 18}`}
          </p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Pending Requests</h4>
          <p className="text-xl sm:text-2xl font-bold text-amber-400">
            {isLoading ? '...' : pendingCount}
          </p>
          <p className={`text-xs ${tc.textMuted}`}>awaiting approval</p>
        </div>
      </div>

      {/* Leave History Table */}
      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>
            Leave History
            {isLoading && <span className="ml-2 text-xs text-gray-400">(Loading...)</span>}
          </h3>
          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            disabled={isLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1 sm:gap-2 disabled:opacity-50"
          >
            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            Apply Leave
          </button>
        </div>

        {requests.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <p className={`${tc.textMuted} mb-4`}>No leave requests yet</p>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="text-indigo-400 hover:text-indigo-300 text-sm"
            >
              Apply for your first leave →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[400px] sm:min-w-0">
              <thead>
                <tr className={`${tc.border} border-b`}>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>
                    Type
                  </th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>
                    From – To
                  </th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell`}>
                    Days
                  </th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>
                    Status
                  </th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell`}>
                    Submitted
                  </th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((leave) => (
                  <tr 
                    key={leave.leaveRequestId} 
                    className={`${tc.border} border-b ${tc.bgCardHover} transition`}
                  >
                    <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.text}`}>
                      {getLeaveTypeLabel(leave.leaveType)}
                    </td>
                    <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.textSecondary}`}>
                      {formatLeaveDateRange(leave.fromDate, leave.toDate)}
                    </td>
                    <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.text} hidden sm:table-cell`}>
                      {leave.totalDays} {leave.isHalfDay && '(Half)'}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3">
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium ${getLeaveStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.textMuted} hidden sm:table-cell`}>
                      {new Date(parseInt(leave.submittedAt)).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3">
                      {leave.status === LeaveRequestStatus.Pending ? (
                        <button
                          onClick={() => handleCancelClick(leave)}
                          className="px-2 sm:px-3 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                        >
                          <XCircleIcon className="w-3 h-3" />
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      ) : (
                        <span className={`text-[10px] sm:text-xs ${tc.textMuted}`}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} max-w-md w-full p-4 sm:p-6`}>
              <h3 className={`text-lg sm:text-xl font-bold ${tc.text} mb-4`}>Cancel Leave Request</h3>
              
              <div className="mb-4">
                <p className={`text-sm ${tc.textSecondary} mb-2`}>
                  You are cancelling your {getLeaveTypeLabel(selectedRequest.leaveType)} request for{' '}
                  {formatLeaveDateRange(selectedRequest.fromDate, selectedRequest.toDate)}
                </p>
                <div className={`p-3 rounded-lg ${tc.bgTableHover} ${tc.border}`}>
                  <p className={`text-xs ${tc.textMuted} mb-1`}>Reason:</p>
                  <p className={`text-sm ${tc.text}`}>{selectedRequest.reason}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${tc.text} mb-2`}>
                  Cancellation Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation (min. 10 characters)..."
                  rows={4}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-transparent outline-none resize-none transition-all text-sm`}
                />
                <p className={`text-[10px] sm:text-xs ${tc.textMuted} mt-1`}>
                  {cancelReason.length}/1000 characters {cancelReason.length < 10 && '(minimum 10)'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedRequest(null);
                    setCancelReason('');
                  }}
                  disabled={isCancelling}
                  className={`w-full sm:w-auto px-4 py-2 ${tc.border} ${tc.textSecondary} rounded-xl text-sm font-medium ${tc.bgTableHover} transition-colors disabled:opacity-50`}
                >
                  Close
                </button>
                <button
                  onClick={handleCancelSubmit}
                  disabled={isCancelling || cancelReason.trim().length < 10}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:from-rose-600 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveTab;