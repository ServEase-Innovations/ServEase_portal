// src/types/index.ts

// Role types mapping to backend roles
export type Role = 'super-admin' | 'hr-partner' | 'manager' | 'employee';

// Backend role types (as returned from API)
export type BackendRole = 'SuperAdmin' | 'HR' | 'Manager' | 'Developer' | 'Marketing' | 'CustomStaff';

// User interface matching backend Employee model
export interface User {
  id: string; // employeeId from backend
  name: string; // fullName from backend
  username: string;
  email: string; // emailAddress from backend
  role: Role; // mapped from assignedRole
  mobileNumber?: string;
  isActive: boolean;
  assignedRole?: BackendRole; // raw role from backend
  assignedDepartment?: string;
  baseSalary?: number;
  allowances?: number;
  deductions?: number;
  joinedAt?: string;
  lastLogin?: string;
  managerId?: string;
  teamId?: string;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
}

// Login credentials - matches backend auth/login
export interface LoginCredentials {
  username: string;
  password: string;
}

// Create account data - matches backend employees/register endpoint
export interface CreateAccountData {
  name: string; // fullName
  email: string; // emailAddress
  role: Role | BackendRole; // Allow both frontend and backend roles
  password: string;
  confirmPassword?: string; // for validation
  mobileNumber?: string;
  department?: string; // assignedDepartment
  baseSalary?: number;
  allowances?: number;
  deductions?: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth Response from login
export interface AuthResponse {
  employee?: {
    employeeId: string;
    fullName: string;
    username: string;
    emailAddress: string;
    assignedRole: BackendRole;
    assignedDepartment: string;
  };
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

// Registration Response
export interface RegisterResponse {
  message: string;
  employee: {
    employeeId: string;
    fullName: string;
    username: string;
    emailAddress: string;
    assignedRole: BackendRole;
  };
}

// Employee type matching backend model
export interface Employee {
  employeeId: string;
  fullName: string;
  emailAddress: string;
  assignedRole: BackendRole;
  assignedDepartment: string;
  appraisalState?: 'Pristine' | 'AppraisalConsideration' | 'PerformanceWarning';
  privateAdminNotes?: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  isActive: boolean;
  joinedAt: string;
  lastLogin?: string;
  username: string;
  managerId?: string;
  teamId?: string;
}

// Team interface matching backend model
export interface Team {
  teamId: string;
  teamName: string;
  projectTitle: string;
  projectSummary?: string;
  milestoneDeadline: string;
  createdAt: string;
  updatedAt: string;
  employees?: Employee[];
}

// Team Member (for frontend convenience)
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user?: User;
  joinedAt: string;
}

// Attendance matching backend model
export interface Attendance {
  attendanceId: number;
  employeeId: string;
  calendarDate: string;
  shiftStatus: 'Working' | 'OnLeave' | 'Absent';
  clockInTimestamp?: string;
  clockOutTimestamp?: string;
  totalHoursComputed: number;
  employee?: Employee;
}

// ============= PAYSLIP TYPES =============

// Payslip status enum matching backend
export type PayslipStatus = 'Draft' | 'Approved' | 'Paid' | 'Cancelled';

// Payslip earning
export interface PayslipEarning {
  payslipEarningId: string;
  earningType: string;
  description: string | null;
  amount: string;
  isTaxable: boolean;
  createdAt: string;
  createdAtEpoch: string;
}

// Payslip deduction
export interface PayslipDeduction {
  payslipDeductionId: string;
  deductionType: string;
  description: string | null;
  amount: string;
  createdAt: string;
  createdAtEpoch: string;
}

// Payslip audit log
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

// Main Payslip interface matching backend serialized response
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
  status: PayslipStatus;
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

// Payload for generating a payslip
export interface GeneratePayslipPayload {
  employeeId: string;
  date: string; // YYYY-MM-DD format
  month: number; // 1-12
  year: number;
}

// Response for payslip list
export interface PayslipListResponse {
  count: number;
  payslips: Payslip[];
}

// Response for payslip generation
export interface PayslipGenerateResponse {
  message: string;
  payslip?: Payslip;
}

// Response for employee payslip query (single or list)
export interface EmployeePayslipResponse {
  payslip?: Payslip;
  count?: number;
  payslips?: Payslip[];
}

// Payload for updating a draft payslip
export interface UpdatePayslipPayload {
  workingDays?: number;
  payableDays?: number;
  unpaidLeaveDays?: number;
  bankAccountMasked?: string | null;
  earnings?: Array<{
    earningType: string;
    description?: string | null;
    amount: number;
    isTaxable?: boolean;
  }>;
  deductions?: Array<{
    deductionType: string;
    description?: string | null;
    amount: number;
  }>;
}

// Response for payslip update
export interface PayslipUpdateResponse {
  message: string;
  payslip?: Payslip;
}

// Payslip query params
export interface PayslipQueryParams {
  employeeId?: string;
  month?: number;
  year?: number;
  status?: PayslipStatus;
}

// ============= THEME CLASSES =============

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

// ============= HELPER FUNCTIONS =============

// Helper function to map backend role to frontend role
export const mapBackendRoleToFrontend = (backendRole: BackendRole | string): Role => {
  const roleMap: Record<string, Role> = {
    'SuperAdmin': 'super-admin',
    'HR': 'hr-partner',
    'Manager': 'manager',
    'Developer': 'employee',
    'Marketing': 'employee',
    'CustomStaff': 'employee',
  };
  
  return roleMap[backendRole] || 'employee';
};

// Helper function to map frontend role to backend role
export const mapFrontendRoleToBackend = (frontendRole: Role | string): BackendRole => {
  const roleMap: Record<string, BackendRole> = {
    'super-admin': 'SuperAdmin',
    'hr-partner': 'HR',
    'manager': 'Manager',
    'employee': 'Developer', // Default to Developer for employees
  };
  
  return roleMap[frontendRole] || 'Developer';
};

// Helper to convert Employee to User
export const employeeToUser = (employee: Employee): User => {
  return {
    id: employee.employeeId,
    name: employee.fullName,
    username: employee.username,
    email: employee.emailAddress,
    role: mapBackendRoleToFrontend(employee.assignedRole),
    assignedRole: employee.assignedRole,
    assignedDepartment: employee.assignedDepartment,
    baseSalary: employee.baseSalary,
    allowances: employee.allowances,
    deductions: employee.deductions,
    isActive: employee.isActive,
    joinedAt: employee.joinedAt,
    lastLogin: employee.lastLogin,
    managerId: employee.managerId,
    teamId: employee.teamId,
    mobileNumber: '',
  };
};

// Helper to convert User to CreateAccountData format
export const userToCreateAccountData = (userData: {
  name: string;
  email: string;
  role: Role;
  password: string;
  confirmPassword?: string;
  mobileNumber?: string;
  department?: string;
  baseSalary?: number;
  allowances?: number;
  deductions?: number;
}): CreateAccountData => {
  return {
    name: userData.name,
    email: userData.email,
    role: userData.role,
    password: userData.password,
    confirmPassword: userData.confirmPassword || userData.password,
    mobileNumber: userData.mobileNumber,
    department: userData.department || 'Engineering',
    baseSalary: userData.baseSalary || 0,
    allowances: userData.allowances || 0,
    deductions: userData.deductions || 0,
  };
};

// ============= DAILY TASK TYPES =============

export interface DailyTaskData {
  workDescription: string;
  status: 'Pending' | 'Completed';
  newIdeas?: string;
  jiraLinks?: Array<{ label?: string; url: string }>;
}

export interface DailyTask extends DailyTaskData {
  taskId: string;
  employeeId: string;
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyTaskQueryParams {
  date?: string;
  employeeId?: string;
  status?: 'Pending' | 'Completed';
}

// ============= LEAVE TYPES =============

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

// ============= PROJECT TEAM TYPES =============

export interface ProjectTeam {
  id: string;
  name: string;
  members: number;
  project: string;
  lead: string;
  created: string;
}

// ============= MESSAGE TYPES =============

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

// ============= WORK SESSION TYPES =============

export interface WorkSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  status: 'working' | 'on-leave' | 'not-working';
  employeeName: string;
}

// ============= TASK HISTORY TYPES =============

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

// ============= PERFORMANCE TYPES =============

export interface PerformanceData {
  name: string;
  role: string;
  kpi: number;
  sla: number;
  prs: number;
  rating: number;
  done: string;
}

// ============= TASK TYPES =============

export interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  dueDate: string;
  project: string;
}

// ============= LEGACY PAYSLIP DATA (for compatibility) =============

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

// ============= PAYSLIP AUTOMATION TYPES =============

export interface BulkPayslipResult {
  success: boolean;
  totalEmployees: number;
  successfulPayslips: number;
  failedPayslips: number;
  generationTimeMs: number;
  errors: Array<{
    employeeId: string;
    error: string;
  }>;
}

export interface MonthResult {
  month: number;
  year: number;
  success: boolean;
  totalEmployees: number;
  successfulPayslips: number;
  failedPayslips: number;
  errors: Array<{ employeeId: string; error: string }>;
}

export interface HistoricalGenerationResult {
  success: boolean;
  totalMonths: number;
  successfulMonths: number;
  failedMonths: number;
  totalGenerationTime: number;
  monthResults: MonthResult[];
  overallErrors: string[];
}

export interface PayslipCoverageMonth {
  month: number;
  year: number;
  totalPayslips: number;
  totalEmployees: number;
  coveragePercentage: number;
}

export interface PayslipCoverage {
  coverage: PayslipCoverageMonth[];
  missingMonths: Array<{ month: number; year: number }>;
  summary: {
    totalMonthsCovered: number;
    totalMonthsExpected: number;
    overallCoveragePercentage: number;
  };
}

export interface SchedulerConfig {
  enabled: boolean;
  cronExpression: string;
  timezone: string;
  retryAttempts: number;
  retryDelayMs: number;
}

export interface SchedulerInfo {
  isActive: boolean;
  isRunning: boolean;
  nextScheduledRun: string | null;
  taskName: string | null;
}

export interface SchedulerStatus {
  scheduler: SchedulerInfo;
  configuration: SchedulerConfig;
}
// ============= PAYSLIP AUTOMATION TYPES =============

// Scheduler status interface
export interface PayslipSchedulerStatus {
  enabled: boolean;
  nextRun: string | null;
  lastRun: string | null;
  schedule: string; // cron expression
  timezone: string;
}

// Automation status response
export interface PayslipAutomationStatus {
  scheduler: PayslipSchedulerStatus;
  lastBulkGeneration: {
    date: string | null;
    processed: number;
    errors: number;
  };
  systemStatus: {
    enabled: boolean;
    version: string;
  };
}

// Historical generation request
export interface PayslipHistoricalRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  employeeIds?: string[];
  dryRun?: boolean;
}

// Bulk generation request
export interface PayslipGenerationRequest {
  date: string;      // YYYY-MM-DD
  employeeIds?: string[];
  dryRun?: boolean;
}

// Generation progress response
export interface PayslipGenerationProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
  completed: boolean;
  startTime: string;
  estimatedCompletion?: string;
}

// Coverage analysis response
export interface PayslipCoverageAnalysis {
  totalEmployees: number;
  monthsAnalyzed: number;
  generatedPayslips: number;
  missingPayslips: number;
  coveragePercentage: number;
  missingRecords: Array<{
    employeeId: string;
    employeeName: string;
    monthYear: string;
    reason?: string;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    year: number;
    expectedCount: number;
    actualCount: number;
    coverage: number;
  }>;
}