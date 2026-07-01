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
  role: Role; // will be mapped to BackendRole
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
export const mapFrontendRoleToBackend = (frontendRole: Role): BackendRole => {
  const roleMap: Record<Role, BackendRole> = {
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