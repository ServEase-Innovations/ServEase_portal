import api from './api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum LeaveType {
  Privilege = 'Privilege',
  Casual = 'Casual',
  Sick = 'Sick',
  Paternity = 'Paternity',
  Maternity = 'Maternity',
  Unpaid = 'Unpaid',
  CompOff = 'CompOff',
}

export enum LeaveRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
  Withdrawn = 'Withdrawn',
}

export interface LeavePolicy {
  leavePolicyId: string;
  year: number;
  privilegeLeaveDays: number;
  flexiLeaveDays: number;
  maternityLeaveDays: number;
  compOffLeaveDays: number;
  carryForwardAllowed: boolean;
  maxCarryForwardDays: number;
  encashmentAllowed: boolean;
  maxEncashmentDays: number;
  minNoticePrivilege: number;
  minNoticeFlexi: number;
  maxConsecutivePrivilege: number;
  maxConsecutiveFlexi: number;
  halfDayLeaveAllowed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  leaveBalanceId: string;
  employeeId: string;
  year: number;
  leaveType: LeaveType;
  totalAllocated: number;
  totalUsed: number;
  totalPending: number;
  totalAvailable: number;
  carriedForward: number;
  lastUpdated: string;
  createdAt: string;
  employee?: {
    employeeId: string;
    fullName: string;
    emailAddress: string;
    assignedRole: string;
  };
}

export interface LeaveRequest {
  leaveRequestId: string;
  employeeId: string;
  leaveType: LeaveType;
  fromDate: string; // Epoch timestamp
  toDate: string; // Epoch timestamp
  isHalfDay: boolean;
  halfDayPeriod?: 'FirstHalf' | 'SecondHalf';
  totalDays: number;
  reason: string;
  contactNumber?: string;
  emergencyContact?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  status: LeaveRequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedById?: string;
  reviewComments?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    employeeId: string;
    fullName: string;
    emailAddress: string;
    assignedRole: string;
  };
  reviewedBy?: {
    employeeId: string;
    fullName: string;
    emailAddress: string;
    assignedRole: string;
  };
}

export interface CreateLeaveRequestData {
  employeeId: string;
  leaveType: LeaveType;
  fromDate: string; // YYYY-MM-DD format
  toDate: string; // YYYY-MM-DD format
  isHalfDay?: boolean;
  halfDayPeriod?: 'FirstHalf' | 'SecondHalf';
  reason: string;
  contactNumber?: string;
  emergencyContact?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get leave policy for a specific year
 */
export const getLeavePolicy = async (year: number = new Date().getFullYear()): Promise<LeavePolicy> => {
  const response = await api.get(`/leave/policy/${year}`);
  return response.data;
};

/**
 * Update leave policy (HR only)
 */
export const updateLeavePolicy = async (year: number, data: Partial<LeavePolicy>): Promise<LeavePolicy> => {
  const response = await api.put(`/leave/policy/${year}`, data);
  return response.data;
};

/**
 * Initialize leave balances for an employee
 */
export const initializeLeaveBalances = async (
  employeeId: string,
  year: number = new Date().getFullYear()
): Promise<LeaveBalance[]> => {
  const response = await api.post('/leave/balance/initialize', { employeeId, year });
  return response.data;
};

/**
 * Get leave balances for an employee
 */
export const getLeaveBalances = async (
  employeeId: string,
  year: number = new Date().getFullYear()
): Promise<LeaveBalance[]> => {
  const response = await api.get(`/leave/balance/${employeeId}`, {
    params: { year },
  });
  return response.data;
};

/**
 * Create a new leave request
 */
export const createLeaveRequest = async (data: CreateLeaveRequestData): Promise<LeaveRequest> => {
  const response = await api.post('/leave/request', data);
  return response.data;
};

/**
 * Get leave requests for an employee
 */
export const getLeaveRequestsByEmployee = async (
  employeeId: string,
  status?: LeaveRequestStatus
): Promise<LeaveRequest[]> => {
  const response = await api.get('/leave/request', {
    params: { employeeId, status },
  });
  return response.data;
};

/**
 * Get a specific leave request by ID
 */
export const getLeaveRequestById = async (leaveRequestId: string): Promise<LeaveRequest> => {
  const response = await api.get(`/leave/request/${leaveRequestId}`);
  return response.data;
};

/**
 * Get pending leave requests for a manager
 */
export const getPendingLeaveRequestsForManager = async (managerId: string): Promise<LeaveRequest[]> => {
  const response = await api.get(`/leave/request/pending/manager/${managerId}`);
  return response.data;
};

/**
 * Approve a leave request (Manager/HR)
 */
export const approveLeaveRequest = async (
  leaveRequestId: string,
  reviewedById: string,
  reviewComments?: string
): Promise<LeaveRequest> => {
  const response = await api.put(`/leave/request/${leaveRequestId}/approve`, {
    reviewedById,
    reviewComments,
  });
  return response.data;
};

/**
 * Reject a leave request (Manager/HR)
 */
export const rejectLeaveRequest = async (
  leaveRequestId: string,
  reviewedById: string,
  reviewComments: string
): Promise<LeaveRequest> => {
  const response = await api.put(`/leave/request/${leaveRequestId}/reject`, {
    reviewedById,
    reviewComments,
  });
  return response.data;
};

/**
 * Cancel a leave request (Employee)
 */
export const cancelLeaveRequest = async (
  leaveRequestId: string,
  employeeId: string,
  cancellationReason: string
): Promise<LeaveRequest> => {
  const response = await api.put(`/leave/request/${leaveRequestId}/cancel`, {
    employeeId,
    cancellationReason,
  });
  return response.data;
};

/**
 * Get leave requests by date range
 */
export const getLeaveRequestsByDateRange = async (
  fromDate: string,
  toDate: string,
  status?: LeaveRequestStatus
): Promise<LeaveRequest[]> => {
  const response = await api.get('/leave/request', {
    params: { fromDate, toDate, status },
  });
  return response.data;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format epoch timestamp to readable date
 */
export const formatLeaveDate = (epoch: string): string => {
  const date = new Date(Number.parseInt(epoch, 10));
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date range for display
 */
export const formatLeaveDateRange = (fromEpoch: string, toEpoch: string): string => {
  const from = formatLeaveDate(fromEpoch);
  const to = formatLeaveDate(toEpoch);
  return fromEpoch === toEpoch ? from : `${from} – ${to}`;
};

/**
 * Get leave type display name
 */
export const getLeaveTypeLabel = (type: LeaveType): string => {
  const labels: Record<LeaveType, string> = {
    [LeaveType.Privilege]: 'Privilege Leave',
    [LeaveType.Casual]: 'Casual Leave',
    [LeaveType.Sick]: 'Sick Leave',
    [LeaveType.Paternity]: 'Paternity Leave',
    [LeaveType.Maternity]: 'Maternity Leave',
    [LeaveType.Unpaid]: 'Unpaid Leave',
    [LeaveType.CompOff]: 'Comp Off',
  };
  return labels[type] || type;
};

/**
 * Get leave status badge color
 */
export const getLeaveStatusColor = (status: LeaveRequestStatus): string => {
  const colors: Record<LeaveRequestStatus, string> = {
    [LeaveRequestStatus.Pending]: 'bg-amber-500/20 text-amber-400',
    [LeaveRequestStatus.Approved]: 'bg-emerald-500/20 text-emerald-400',
    [LeaveRequestStatus.Rejected]: 'bg-rose-500/20 text-rose-400',
    [LeaveRequestStatus.Cancelled]: 'bg-gray-500/20 text-gray-400',
    [LeaveRequestStatus.Withdrawn]: 'bg-gray-500/20 text-gray-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
};

/**
 * Calculate working days between two dates (excludes weekends)
 */
export const calculateWorkingDays = (fromDate: string, toDate: string): number => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};
