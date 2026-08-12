// types/index.ts - Complete types file with all definitions

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Working';
  joined: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  dueDate: string;
  project: string;
}

export interface LeaveRequest {
  id: string;
  employee: string;
  type: 'Casual' | 'Sick' | 'Annual' | 'Earned' | 'Other';
  period: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  imageUrl?: string | null;
  submittedAt: string;
}

export interface ProjectTeam {
  id: string;
  name: string;
  members: number;
  project: string;
  lead: string;
  created: string;
}

export interface Message {
  id: string;
  sender: string;
  senderRole: 'Employee' | 'Manager' | 'HR' | 'Super Admin';
  receiver: string;
  receiverRole: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  category: 'General' | 'HR' | 'Payroll' | 'IT' | 'Leave' | 'Other';
}

export interface WorkSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  status: 'working' | 'on-leave' | 'not-working';
  employeeName: string;
}

export interface PayslipData {
  employeeId: string;
  name: string;
  designation: string;
  email: string;
  payPeriod: string;
  paymentDate: string;
  earnings: {
    basic: number;
    hra: number;
    special: number;
    performanceBonus: number;
  };
  deductions: {
    providentFund: number;
    tds: number;
    professionalTax: number;
  };
}

export interface TaskHistory {
  id: string;
  jiraLinks: string[];
  taskDescription: string;
  status: 'In Progress' | 'Completed' | 'Pending';
  newIdea: string;
  stylingAdded: boolean;
  imageUrl?: string | null;
  submittedAt: string;
  date: string;
}

export interface PerformanceData {
  name: string;
  role: string;
  kpi: number;
  sla: number;
  prs: number;
  rating: number;
  done: string;
}

export interface ThemeClasses {
  bg: string;
  bgCard: string;
  bgCardHover: string;
  bgInput: string;
  bgTable: string;
  bgTableHover: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  shadow: string;
  gradient: string;
  cardGradient: string;
  statBg: string;
  input: string;
  tableHeader: string;
  badge: string;
  scrollbar: string;
  statusActive: string;
  statusWorking: string;
  statusLeave: string;
  statusPending: string;
  statusProgress: string;
  statusCompleted: string;
  statusBlocked: string;
  statusApproved: string;
  statusRejected: string;
  statusInactive: string;
  priorityCritical: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  timerBg: string;
  btnBg: string;
  statusActiveBtn: string;
  statusInactiveBtn: string;
  taskCard: string;
  taskCardHover: string;
}

// ============= PAYSLIP TYPES =============

export interface Payslip {
  payslipId: string;
  payrollRunId: string;
  employeeId: string;
  payslipNumber: string;
  employeeNameSnapshot: string;
  employeeEmailSnapshot: string;
  employeeRoleSnapshot: string;
  employeeDepartmentSnapshot: string;
  bankAccountMasked: string | null;
  currency: string;
  workingDays: number;
  payableDays: number;
  unpaidLeaveDays: number;
  baseSalarySnapshot: number;
  allowanceSnapshot: number;
  deductionSnapshot: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  status: 'Draft' | 'Approved' | 'Paid' | 'Cancelled';
  generatedAt: string;
  generatedAtEpoch: string;
  updatedAt: string;
  updatedAtEpoch: string;
  approvedAt: string | null;
  approvedAtEpoch: string | null;
  paidAt: string | null;
  paidAtEpoch: string | null;
  paymentReference: string | null;
  pdfUrl: string | null;
  employee?: {
    employeeId: string;
    fullName: string;
    emailAddress: string;
    assignedRole: string;
    assignedDepartment: string;
    teamId: string | null;
    managerId: string | null;
  };
  payrollRun?: {
    payrollRunId: string;
    payrollMonth: number;
    payrollYear: number;
    periodStart: string;
    periodEnd: string;
    currency: string;
    status: string;
  };
  earnings: PayslipEarning[];
  deductions: PayslipDeduction[];
  auditLogs: PayslipAuditLog[];
}

export interface PayslipEarning {
  payslipEarningId: string;
  earningType: string;
  description: string | null;
  amount: string;
  isTaxable: boolean;
  createdAt: string;
  createdAtEpoch: string;
}

export interface PayslipDeduction {
  payslipDeductionId: string;
  deductionType: string;
  description: string | null;
  amount: string;
  createdAt: string;
  createdAtEpoch: string;
}

export interface PayslipAuditLog {
  payslipAuditLogId: string;
  action: string;
  performedById: string;
  previousData: any;
  updatedData: any;
  createdAt: string;
  createdAtEpoch: string;
  performedBy?: {
    employeeId: string;
    fullName: string;
    assignedRole: string;
  };
}

export interface GeneratePayslipPayload {
  employeeId: string;
  date: string;
  month: number;
  year: number;
}

export interface PayslipListResponse {
  count: number;
  payslips: Payslip[];
}

export interface PayslipGenerateResponse {
  message: string;
  payslip?: Payslip;
}

export interface Employee {
  employeeId: string;
  fullName: string;
  emailAddress: string;
  assignedRole: string;
  assignedDepartment: string;
  isActive: boolean;
  baseSalary: number;
  allowances: number;
  deductions: number;
  managerId?: string;
  teamId?: string;
}

// ============= AUTH TYPES =============

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'super-admin' | 'hr-partner' | 'manager' | 'employee';
  mobileNumber?: string;
  isActive?: boolean;
  assignedRole?: string;
  assignedDepartment?: string;
  baseSalary?: number;
  allowances?: number;
  deductions?: number;
  joinedAt?: string;
  lastLogin?: string;
  managerId?: string;
  teamId?: string;
}

export type Role = 'super-admin' | 'hr-partner' | 'manager' | 'employee';
export type BackendRole = 'SuperAdmin' | 'HR' | 'Manager' | 'Developer' | 'Marketing' | 'CustomStaff';

export interface CreateAccountData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: Role | string;
  department?: string;
  baseSalary?: number;
  allowances?: number;
  deductions?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const mapBackendRoleToFrontend = (backendRole: string): Role => {
  const roleMap: Record<string, Role> = {
    'SuperAdmin': 'super-admin',
    'Super Admin': 'super-admin',
    'super-admin': 'super-admin',
    'superadmin': 'super-admin',
    'HR': 'hr-partner',
    'hr-partner': 'hr-partner',
    'hr': 'hr-partner',
    'Manager': 'manager',
    'manager': 'manager',
    'Developer': 'employee',
    'Marketing': 'employee',
    'CustomStaff': 'employee',
    'employee': 'employee',
  };
  return roleMap[backendRole] || 'employee';
};

export const mapFrontendRoleToBackend = (frontendRole: Role): BackendRole => {
  const roleMap: Record<Role, BackendRole> = {
    'super-admin': 'SuperAdmin',
    'hr-partner': 'HR',
    'manager': 'Manager',
    'employee': 'Developer',
  };
  return roleMap[frontendRole] || 'Developer';
};