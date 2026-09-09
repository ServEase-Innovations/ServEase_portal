// tabs/LeaveTab.tsx
import React, { useState, useEffect } from 'react';
import { getThemeClasses } from './themeUtils';
import { PlusIcon, XMarkIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface LeaveTabProps {
  theme: 'light' | 'dark';
  attendance: any;
}

interface LeaveBalance {
  leaveBalanceId: string;
  employeeId: string;
  year: number;
  leaveType: 'Privilege' | 'Casual';
  totalAllocated: number;
  totalUsed: number;
  totalAvailable: number;
}

interface LeaveRequestData {
  leaveRequestId: string;
  employeeId: string;
  leaveType: 'Privilege' | 'Casual' | 'Sick' | 'Maternity' | 'Paternity' | 'Emergency';
  fromDate: number;
  toDate: number;
  isHalfDay: boolean;
  halfDayPeriod: string | null;
  totalDays: number;
  reason: string;
  contactNumber: string | null;
  emergencyContact: string | null;
  attachmentUrl: string | null;
  attachmentFileName: string | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  submittedAt: number;
  reviewedAt: number | null;
  reviewedById: string | null;
  reviewComments: string | null;
  cancelledAt: number | null;
  cancellationReason: string | null;
  createdAt: number;
  updatedAt: number;
  reviewedBy?: {
    fullName: string;
  };
}

const LeaveTab: React.FC<LeaveTabProps> = ({ theme, attendance }) => {
  const tc = getThemeClasses(theme);
  const { user } = useAuth();
  
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestData | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Apply leave form state
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Privilege' as 'Privilege' | 'Casual' | 'Sick' | 'Maternity' | 'Paternity' | 'Emergency',
    fromDate: '',
    toDate: '',
    isHalfDay: false,
    halfDayPeriod: 'FirstHalf' as 'FirstHalf' | 'SecondHalf',
    reason: '',
    contactNumber: '',
    emergencyContact: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchLeaveData();
    }
  }, [user]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';
      
      const employeeId = user?.id;

      if (!employeeId) {
        throw new Error('Employee ID not found. Please login again.');
      }

      // Fetch leave balances
      const balanceResponse = await fetch(apiUrl + `leave/balance/${employeeId}?year=${new Date().getFullYear()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (balanceResponse.ok) {
        const balances: LeaveBalance[] = await balanceResponse.json();
        setLeaveBalances(balances);
      } else {
        console.log('No leave balances found, they may need to be initialized by HR');
      }

      // Fetch leave history
      const historyResponse = await fetch(apiUrl + `leave/request?employeeId=${employeeId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!historyResponse.ok) {
        throw new Error('Failed to fetch leave history');
      }

      const history: LeaveRequestData[] = await historyResponse.json();
      setLeaveHistory(history.sort((a, b) => b.submittedAt - a.submittedAt));

    } catch (error: any) {
      console.error('Error fetching leave data:', error);
      setError(error.message || 'Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';

      const requestBody = {
        employeeId: user?.id?.toString(),
        leaveType: leaveForm.leaveType,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        isHalfDay: leaveForm.isHalfDay,
        halfDayPeriod: leaveForm.isHalfDay ? leaveForm.halfDayPeriod : null,
        reason: leaveForm.reason,
        contactNumber: leaveForm.contactNumber || null,
        emergencyContact: leaveForm.emergencyContact || null,
      };

      const response = await fetch(apiUrl + 'leave/request', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit leave request');
      }

      toast.success('Leave request submitted successfully');
      setShowApplyModal(false);
      setLeaveForm({
        leaveType: 'Privilege',
        fromDate: '',
        toDate: '',
        isHalfDay: false,
        halfDayPeriod: 'FirstHalf',
        reason: '',
        contactNumber: '',
        emergencyContact: '',
      });

      fetchLeaveData();

    } catch (error: any) {
      console.error('Error applying leave:', error);
      toast.error(error.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = (request: LeaveRequestData) => {
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
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';
      
      const response = await fetch(apiUrl + `leave/request/${selectedRequest.leaveRequestId}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancellationReason: cancelReason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel leave request');
      }

      toast.success('Leave request cancelled successfully');
      setShowCancelModal(false);
      setSelectedRequest(null);
      setCancelReason('');
      fetchLeaveData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel leave request');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-500/20 text-amber-400';
      case 'Approved': return 'bg-emerald-500/20 text-emerald-400';
      case 'Rejected': return 'bg-rose-500/20 text-rose-400';
      case 'Cancelled': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Privilege': return 'bg-blue-500/20 text-blue-400';
      case 'Casual': return 'bg-cyan-500/20 text-cyan-400';
      case 'Sick': return 'bg-rose-500/20 text-rose-400';
      case 'Maternity': return 'bg-pink-500/20 text-pink-400';
      case 'Paternity': return 'bg-purple-500/20 text-purple-400';
      case 'Emergency': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const privilegeBalance = leaveBalances.find(b => b.leaveType === 'Privilege');
  const casualBalance = leaveBalances.find(b => b.leaveType === 'Casual');
  const pendingCount = leaveHistory.filter(l => l.status === 'Pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} text-center`}>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchLeaveData}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Retry
        </button>
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
            {casualBalance ? `${casualBalance.totalAvailable} / ${casualBalance.totalAllocated}` : '0 / 0'}
          </p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining (Casual/Sick)</p>
        </div>
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Privilege Leave</h4>
          <p className={`text-xl sm:text-2xl font-bold ${tc.text}`}>
            {privilegeBalance ? `${privilegeBalance.totalAvailable} / ${privilegeBalance.totalAllocated}` : '0 / 0'}
          </p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Pending Requests</h4>
          <p className="text-xl sm:text-2xl font-bold text-amber-400">{pendingCount}</p>
          <p className={`text-xs ${tc.textMuted}`}>awaiting approval</p>
        </div>
      </div>

      {/* Leave History */}
      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>
            Leave History ({leaveHistory.length} requests)
          </h3>
          <button
            type="button"
            onClick={() => setShowApplyModal(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1 sm:gap-2"
          >
            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            Apply Leave
          </button>
        </div>

        {leaveHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className={tc.textSecondary}>No leave requests found</p>
            <button
              onClick={() => setShowApplyModal(true)}
              className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm"
            >
              Apply for your first leave
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px] sm:min-w-0">
              <thead>
                <tr className={`${tc.border} border-b`}>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>Type</th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>From – To</th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell`}>Days</th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3 hidden md:table-cell`}>Reason</th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>Status</th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveHistory.map((leave) => (
                  <tr key={leave.leaveRequestId} className={`${tc.border} border-b ${tc.bgCardHover} transition`}>
                    <td className="py-2 sm:py-3 px-2 sm:px-3">
                      <span className={`px-2 py-1 rounded-full text-[8px] sm:text-xs font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.textSecondary}`}>
                      {formatDate(leave.fromDate)} – {formatDate(leave.toDate)}
                    </td>
                    <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.text} hidden sm:table-cell`}>
                      {leave.totalDays}{leave.isHalfDay && ' (Half)'}
                    </td>
                    <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.textSecondary} max-w-xs truncate hidden md:table-cell`}>
                      {leave.reason}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3">
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3">
                      {leave.status === 'Pending' ? (
                        <button
                          type="button"
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
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${tc.bgCard} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${tc.border}`}>
            <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${tc.border}`}>
              <h3 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Apply for Leave</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className={`p-2 rounded-lg hover:${tc.bgCardHover} transition-colors`}
              >
                <XMarkIcon className={`w-6 h-6 ${tc.text}`} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className={`block text-sm font-medium ${tc.text} mb-2`}>
                  Leave Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
                  className={`w-full px-3 py-2 ${tc.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  required
                >
                  <option value="Privilege">Privilege Leave</option>
                  <option value="Casual">Casual Leave (Flexi)</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Maternity">Maternity Leave</option>
                  <option value="Paternity">Paternity Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${tc.text} mb-2`}>
                    From Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    className={`w-full px-3 py-2 ${tc.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${tc.text} mb-2`}>
                    To Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    className={`w-full px-3 py-2 ${tc.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={leaveForm.isHalfDay}
                    onChange={(e) => setLeaveForm({ ...leaveForm, isHalfDay: e.target.checked })}
                    className="w-4 h-4 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className={`text-sm ${tc.text}`}>Half Day</span>
                </label>
                {leaveForm.isHalfDay && (
                  <select
                    value={leaveForm.halfDayPeriod}
                    onChange={(e) => setLeaveForm({ ...leaveForm, halfDayPeriod: e.target.value as any })}
                    className={`px-3 py-1 ${tc.input} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <option value="FirstHalf">First Half</option>
                    <option value="SecondHalf">Second Half</option>
                  </select>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${tc.text} mb-2`}>
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 ${tc.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Enter reason for leave..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${tc.text} mb-2`}>
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={leaveForm.contactNumber}
                    onChange={(e) => setLeaveForm({ ...leaveForm, contactNumber: e.target.value })}
                    className={`w-full px-3 py-2 ${tc.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="+91 1234567890"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${tc.text} mb-2`}>
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={leaveForm.emergencyContact}
                    onChange={(e) => setLeaveForm({ ...leaveForm, emergencyContact: e.target.value })}
                    className={`w-full px-3 py-2 ${tc.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className={`flex-1 px-4 py-2 ${tc.bgCard} border ${tc.border} rounded-lg text-sm font-medium hover:${tc.bgCardHover} transition-colors`}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} max-w-md w-full p-4 sm:p-6`}>
            <h3 className={`text-lg sm:text-xl font-bold ${tc.text} mb-4`}>Cancel Leave Request</h3>
            
            <div className="mb-4">
              <p className={`text-sm ${tc.textSecondary} mb-2`}>
                You are cancelling your {selectedRequest.leaveType} request for{' '}
                {formatDate(selectedRequest.fromDate)} – {formatDate(selectedRequest.toDate)}
              </p>
              <div className={`p-3 rounded-lg ${tc.bgCardHover} ${tc.border}`}>
                <p className={`text-xs ${tc.textMuted} mb-1`}>Reason:</p>
                <p className={`text-sm ${tc.text}`}>{selectedRequest.reason}</p>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="cancel-reason-input" className={`block text-sm font-medium ${tc.text} mb-2`}>
                Cancellation Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="cancel-reason-input"
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
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedRequest(null);
                  setCancelReason('');
                }}
                disabled={isCancelling}
                className={`w-full sm:w-auto px-4 py-2 ${tc.border} ${tc.textSecondary} rounded-xl text-sm font-medium ${tc.bgCardHover} transition-colors disabled:opacity-50`}
              >
                Close
              </button>
              <button
                type="button"
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
  );
};

export default LeaveTab;