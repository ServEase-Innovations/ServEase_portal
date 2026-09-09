// src/pages/HRDashboard/components/leaves/LeaveManagementTab.tsx

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';
import toast from 'react-hot-toast';

interface LeaveManagementTabProps {
  themeClasses: ThemeClasses;
}

interface LeaveRequestAPI {
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
  employee?: {
    employeeId: string;
    fullName: string;
    emailAddress: string;
    assignedDepartment: string;
    assignedRole: string;
  };
  reviewedBy?: {
    fullName: string;
  };
}


export const LeaveManagementTab: React.FC<LeaveManagementTabProps> = ({ themeClasses }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestAPI[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequestAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Fetch leave requests
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Filter requests when search or filter changes
  useEffect(() => {
    let filtered = leaveRequests;

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req => 
        req.employee?.fullName.toLowerCase().includes(query) ||
        req.employee?.assignedDepartment.toLowerCase().includes(query) ||
        req.leaveType.toLowerCase().includes(query) ||
        req.reason.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, leaveRequests]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';
      const token = localStorage.getItem('servease_token');

      // Get date range for the current year (or last 6 months to next 6 months)
      const today = new Date();
      const fromDate = new Date(today.getFullYear(), 0, 1); // Jan 1st of current year
      const toDate = new Date(today.getFullYear(), 11, 31); // Dec 31st of current year

      const fromDateStr = fromDate.toISOString().split('T')[0];
      const toDateStr = toDate.toISOString().split('T')[0];

      const response = await fetch(
        apiUrl + `leave/request?fromDate=${fromDateStr}&toDate=${toDateStr}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leave requests');
      }

      const data: LeaveRequestAPI[] = await response.json();
      setLeaveRequests(data);
      setFilteredRequests(data);

    } catch (error: any) {
      console.error('Error fetching leave requests:', error);
      setError(error.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveRequestId: string) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';
      const token = localStorage.getItem('servease_token');

      const response = await fetch(apiUrl + `leave/request/${leaveRequestId}/approve`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          reviewComments: 'Approved by HR'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve leave request');
      }

      toast.success('Leave request approved successfully');
      
      // Refresh the list
      fetchLeaveRequests();

    } catch (error: any) {
      console.error('Error approving leave request:', error);
      toast.error(error.message || 'Failed to approve leave request');
    }
  };

  const handleReject = async (leaveRequestId: string) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    
    if (!reason) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';
      const token = localStorage.getItem('servease_token');

      const response = await fetch(apiUrl + `leave/request/${leaveRequestId}/reject`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          reviewComments: reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject leave request');
      }

      toast.success('Leave request rejected');
      
      // Refresh the list
      fetchLeaveRequests();

    } catch (error: any) {
      console.error('Error rejecting leave request:', error);
      toast.error(error.message || 'Failed to reject leave request');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-500/20 text-amber-400';
      case 'Approved': return 'bg-emerald-500/20 text-emerald-400';
      case 'Rejected': return 'bg-rose-500/20 text-rose-400';
      case 'Cancelled': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatDateRange = (fromDate: number, toDate: number) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (from.toDateString() === to.toDateString()) {
      return formatDate(fromDate);
    }
    
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };

  const pendingCount = leaveRequests.filter(l => l.status === 'Pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${themeClasses.bgCard} p-6 rounded-2xl ${themeClasses.border} text-center`}>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchLeaveRequests}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>Leave Requests</h2>
          <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>
            Approve or reject employee leave requests - {leaveRequests.length} total requests
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="px-2 sm:px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] sm:text-sm font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full"></span>
            {pendingCount} pending
          </span>
          <div className="relative">
            <MagnifyingGlassIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${themeClasses.textMuted} absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2`} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search..."
              className={`pl-7 sm:pl-9 pr-3 sm:pr-4 py-1 sm:py-2 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all w-24 sm:w-40`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search leave requests"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              statusFilter === filter
                ? 'bg-indigo-500 text-white'
                : `${themeClasses.bgCard} ${themeClasses.text} hover:bg-indigo-500/10`
            }`}
          >
            {filter}
            {filter !== 'All' && (
              <span className="ml-2 opacity-70">
                ({leaveRequests.filter(r => r.status === filter).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className={`${themeClasses.bgCard} p-8 rounded-2xl ${themeClasses.border} text-center`}>
          <p className={`${themeClasses.textSecondary}`}>
            {searchQuery || statusFilter !== 'All' 
              ? 'No leave requests match your filters'
              : 'No leave requests found'
            }
          </p>
        </div>
      ) : (
        <div className={`${themeClasses.bgCard} rounded-2xl ${themeClasses.border} ${themeClasses.shadow} overflow-hidden`}>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[800px] sm:min-w-0">
              <thead>
                <tr className={`text-left text-[10px] sm:text-xs ${themeClasses.tableHeader} ${themeClasses.border} border-b`}>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Employee</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Type</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Period</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden md:table-cell">Days</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden lg:table-cell">Reason</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden xl:table-cell">Department</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.leaveRequestId} className={`${themeClasses.border} border-b last:border-0 ${themeClasses.bgTableHover} transition-colors`}>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-[8px] sm:text-xs font-bold flex-shrink-0">
                          {request.employee?.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-medium ${themeClasses.text} text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none`}>
                            {request.employee?.fullName || 'Unknown'}
                          </p>
                          <p className={`text-[8px] sm:text-xs ${themeClasses.textMuted} hidden sm:block`}>
                            {request.employee?.emailAddress}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getLeaveTypeColor(request.leaveType)} whitespace-nowrap`}>
                        {request.leaveType}
                      </span>
                    </td>
                    <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} hidden sm:table-cell`}>
                      {formatDateRange(request.fromDate, request.toDate)}
                    </td>
                    <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} hidden md:table-cell`}>
                      {request.totalDays} {request.isHalfDay && '(Half)'}
                    </td>
                    <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} max-w-xs truncate hidden lg:table-cell`}>
                      {request.reason}
                    </td>
                    <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} hidden xl:table-cell`}>
                      {request.employee?.assignedDepartment || '-'}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(request.status)} whitespace-nowrap`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      {request.status === 'Pending' ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button 
                            type="button"
                            onClick={() => handleApprove(request.leaveRequestId)}
                            className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-[8px] sm:text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                            aria-label={`Approve leave request for ${request.employee?.fullName}`}
                            title={`Approve leave request for ${request.employee?.fullName}`}
                          >
                            <CheckCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
                            <span className="hidden sm:inline">Approve</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleReject(request.leaveRequestId)}
                            className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-rose-500/20 text-rose-400 rounded-xl text-[8px] sm:text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                            aria-label={`Reject leave request for ${request.employee?.fullName}`}
                            title={`Reject leave request for ${request.employee?.fullName}`}
                          >
                            <XCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
                            <span className="hidden sm:inline">Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-[8px] sm:text-xs ${themeClasses.textMuted}`}>
                            {request.reviewedBy?.fullName || 'System'}
                          </span>
                          {request.reviewComments && (
                            <span className={`text-[7px] sm:text-[10px] ${themeClasses.textMuted} italic truncate max-w-[100px]`} title={request.reviewComments}>
                              {request.reviewComments}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};