// src/services/api.ts - Fully updated with payslip APIs
import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  User, 
  Payslip,
  PayslipListResponse,
  PayslipGenerateResponse,
  GeneratePayslipPayload,
  Employee,
} from '../types';

// Get API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/';

// Create axios instance with base URL and credentials support
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor - No longer need to add token manually (cookies are sent automatically)
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically included with withCredentials: true
    // Keep fallback for Authorization header during migration
    const token = localStorage.getItem('servease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔴 API Error:', error.response?.status);
    }
    
    if (error.response?.status === 401) {
      // Clear any remaining localStorage tokens (migration cleanup)
      localStorage.removeItem('servease_token');
      localStorage.removeItem('servease_user');
      
      // Only redirect to login if it's an auth-related endpoint
      const url = error.config?.url || '';
      if (url.includes('/auth/') || url.includes('/employees/profile') || url.includes('/me')) {
        // Notify the app to redirect via event instead of direct navigation
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

// ============= AUTH API =============

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role?: string;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('auth/login', { username, password });
    
    // Token is now in HTTP-only cookie, no need to store in localStorage
    // But keep user data in localStorage for now (will be removed in next step)
    
    return response.data;
  },

  register: async (userData: RegisterData): Promise<User> => {
    const response = await api.post<User>('employees/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      // Call backend to clear cookies
      await api.post('auth/logout');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout API error:', error);
      }
    }
    // Clear localStorage (migration cleanup)
    localStorage.removeItem('servease_token');
    localStorage.removeItem('servease_user');
  },

  getCurrentUser: async (): Promise<User> => {
    // New endpoint that uses cookie authentication
    const response = await api.get<User>('auth/me');
    return response.data;
  },
};

// ============= USER API =============

interface UpdateUserData {
  fullName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/employees');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/employees/${id}`);
    return response.data;
  },

  create: async (userData: RegisterData): Promise<User> => {
    const response = await api.post<User>('/employees', userData);
    return response.data;
  },

  update: async (id: string, userData: UpdateUserData): Promise<User> => {
    const response = await api.put<User>(`/employees/${id}`, userData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },
};

// ============= DAILY TASK API =============

interface DailyTaskData {
  workDescription: string;
  status: 'Pending' | 'Completed';
  newIdeas?: string;
  jiraLinks?: Array<{ label?: string; url: string }>;
}

interface DailyTask extends DailyTaskData {
  taskId: string;
  employeeId: string;
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
}

interface DailyTaskQueryParams {
  date?: string;
  employeeId?: string;
  status?: 'Pending' | 'Completed';
}

export const dailyTaskService = {
  create: async (data: DailyTaskData): Promise<DailyTask> => {
    const response = await api.post<DailyTask>('/daily-tasks', data);
    return response.data;
  },

  getAll: async (params?: DailyTaskQueryParams): Promise<DailyTask[]> => {
    const response = await api.get<DailyTask[]>('/daily-tasks', { params });
    return response.data;
  },

  getMyTasks: async (params?: Omit<DailyTaskQueryParams, 'employeeId'>): Promise<DailyTask[]> => {
    const response = await api.get<DailyTask[]>('/daily-tasks/mine', { params });
    return response.data;
  },

  getById: async (id: string): Promise<DailyTask> => {
    const response = await api.get<DailyTask>(`/daily-tasks/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<DailyTaskData>): Promise<DailyTask> => {
    const response = await api.patch<DailyTask>(`/daily-tasks/${id}`, data);
    return response.data;
  },

  uploadAttachments: async (taskId: string, formData: FormData): Promise<{ attachments: string[] }> => {
    const response = await api.post<{ attachments: string[] }>(`/daily-tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    await api.delete(`/daily-tasks/${taskId}/attachments/${attachmentId}`);
  },
};

// ============= PAYSLIP API =============

export const payslipService = {
  /**
   * Get all payslips with optional filters
   * @param params - Filter parameters (employeeId, month, year, status)
   * @returns List of payslips
   * @access SuperAdmin, Manager
   */
  getAllPayslips: async (params?: {
    employeeId?: string;
    month?: number;
    year?: number;
    status?: 'Draft' | 'Approved' | 'Paid' | 'Cancelled';
  }): Promise<PayslipListResponse> => {
    const response = await api.get<PayslipListResponse>('/payslips', { params });
    return response.data;
  },

  /**
   * Get the authenticated employee's payslips
   * @param params - Filter parameters (month, year, status)
   * @returns List of payslips (only Approved and Paid)
   * @access Employee, HR Partner (self-service)
   */
  getMyPayslips: async (params?: {
    month?: number;
    year?: number;
    status?: 'Approved' | 'Paid';
  }): Promise<PayslipListResponse> => {
    const response = await api.get<PayslipListResponse>('/payslips/mine', { params });
    return response.data;
  },

  /**
   * Get payslips for a specific employee
   * @param employeeId - Employee ID
   * @param params - Filter parameters (month, year, status)
   * @returns Single payslip (if month/year provided) or list of payslips
   * @access SuperAdmin, Manager, or self (restricted to current/previous month)
   */
  getEmployeePayslips: async (
    employeeId: string,
    params?: {
      month?: number;
      year?: number;
      status?: 'Draft' | 'Approved' | 'Paid' | 'Cancelled';
    }
  ): Promise<{ payslip?: Payslip; count?: number; payslips?: Payslip[] }> => {
    const response = await api.get<{ payslip?: Payslip; count?: number; payslips?: Payslip[] }>(
      `/payslips/employee/${employeeId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Generate a payslip for an employee
   * @param payload - Employee ID, date, month, year
   * @returns Generated payslip
   * @access SuperAdmin, Manager
   */
  generatePayslip: async (payload: GeneratePayslipPayload): Promise<PayslipGenerateResponse> => {
    const response = await api.post<PayslipGenerateResponse>('/payslips/generate', payload);
    return response.data;
  },

  /**
   * Download payslip PDF
   * @param employeeId - Employee ID
   * @param month - Month (1-12)
   * @param year - Year
   * @returns PDF blob
   * @access SuperAdmin, Manager, or self (restricted to current/previous month)
   */
  downloadPayslipPdf: async (
    employeeId: string,
    month: number,
    year: number
  ): Promise<Blob> => {
    const response = await api.get<Blob>(`/payslips/employee/${employeeId}/pdf`, {
      params: { month, year },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Update a draft payslip
   * @param employeeId - Employee ID
   * @param month - Month (1-12)
   * @param year - Year
   * @param data - Update data
   * @returns Updated payslip
   * @access SuperAdmin, Manager
   */
  updateDraftPayslip: async (
    employeeId: string,
    month: number,
    year: number,
    data: {
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
  ): Promise<{ message: string; payslip?: Payslip }> => {
    const response = await api.patch<{ message: string; payslip?: Payslip }>(
      `/payslips/employee/${employeeId}`,
      data,
      { params: { month, year } }
    );
    return response.data;
  },

  /**
   * Get all employees (for payslip generation dropdown)
   * @returns List of active employees
   * @access SuperAdmin, Manager
   */
  getAllEmployees: async (): Promise<Employee[]> => {
    const response = await api.get<Employee[]>('/employees');
    return response.data;
  },
};

// ============= PAYSLIP AUTOMATION API =============

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

export interface HistoricalGenerationResult {
  success: boolean;
  totalMonths: number;
  successfulMonths: number;
  failedMonths: number;
  totalGenerationTime: number;
  monthResults: Array<{
    month: number;
    year: number;
    success: boolean;
    totalEmployees: number;
    successfulPayslips: number;
    failedPayslips: number;
    errors: Array<{ employeeId: string; error: string }>;
  }>;
  overallErrors: string[];
}

export interface PayslipCoverage {
  coverage: Array<{
    month: number;
    year: number;
    totalPayslips: number;
    totalEmployees: number;
    coveragePercentage: number;
  }>;
  missingMonths: Array<{ month: number; year: number }>;
  summary: {
    totalMonthsCovered: number;
    totalMonthsExpected: number;
    overallCoveragePercentage: number;
  };
}

export interface SchedulerStatus {
  scheduler: {
    isActive: boolean;
    isRunning: boolean;
    nextScheduledRun: string | null;
    taskName: string | null;
  };
  configuration: {
    enabled: boolean;
    cronExpression: string;
    timezone: string;
    retryAttempts: number;
    retryDelayMs: number;
  };
}

export const payslipAutomationService = {
  /**
   * Manually trigger monthly payslip generation for current month
   * @returns Bulk generation result
   * @access SuperAdmin, Manager
   */
  triggerMonthlyGeneration: async (): Promise<{ message: string; result: BulkPayslipResult }> => {
    const response = await api.post<{ message: string; result: BulkPayslipResult }>('/payslips/automation/generate-monthly');
    return response.data;
  },

  /**
   * Generate payslips for a specific month/year
   * @param month - Month (1-12)
   * @param year - Year
   * @returns Bulk generation result
   * @access SuperAdmin, Manager
   */
  generateForMonth: async (month: number, year: number): Promise<{ 
    message: string; 
    period: { month: number; year: number }; 
    result: BulkPayslipResult;
  }> => {
    const response = await api.post<{ 
      message: string; 
      period: { month: number; year: number }; 
      result: BulkPayslipResult;
    }>('/payslips/automation/generate-for-month', { month, year });
    return response.data;
  },

  /**
   * Generate historical payslips from January 2026 to current month
   * @returns Historical generation result
   * @access SuperAdmin, Manager
   */
  generateHistoricalPayslips: async (): Promise<{ 
    message: string; 
    result: HistoricalGenerationResult;
  }> => {
    const response = await api.post<{ 
      message: string; 
      result: HistoricalGenerationResult;
    }>('/payslips/automation/generate-historical');
    return response.data;
  },

  /**
   * Generate payslips for a custom date range
   * @param startMonth - Starting month (1-12)
   * @param startYear - Starting year
   * @param endMonth - Ending month (1-12) 
   * @param endYear - Ending year
   * @returns Historical generation result
   * @access SuperAdmin, Manager
   */
  generateForDateRange: async (
    startMonth: number, 
    startYear: number, 
    endMonth: number, 
    endYear: number
  ): Promise<{ 
    message: string; 
    dateRange: { startMonth: number; startYear: number; endMonth: number; endYear: number };
    result: HistoricalGenerationResult;
  }> => {
    const response = await api.post<{ 
      message: string; 
      dateRange: { startMonth: number; startYear: number; endMonth: number; endYear: number };
      result: HistoricalGenerationResult;
    }>('/payslips/automation/generate-date-range', { 
      startMonth, 
      startYear, 
      endMonth, 
      endYear 
    });
    return response.data;
  },

  /**
   * Get payslip coverage analysis
   * @returns Coverage analysis showing missing months
   * @access SuperAdmin, Manager
   */
  getCoverage: async (): Promise<PayslipCoverage & { message: string }> => {
    const response = await api.get<PayslipCoverage & { message: string }>('/payslips/automation/coverage');
    return response.data;
  },

  /**
   * Get scheduler status
   * @returns Current scheduler status and configuration
   * @access SuperAdmin, Manager
   */
  getSchedulerStatus: async (): Promise<SchedulerStatus> => {
    const response = await api.get<SchedulerStatus>('/payslips/automation/scheduler/status');
    return response.data;
  },

  /**
   * Start the automatic payslip scheduler
   * @returns Success message and status
   * @access SuperAdmin only
   */
  startScheduler: async (): Promise<{ message: string; status: SchedulerStatus }> => {
    const response = await api.post<{ message: string; status: SchedulerStatus }>('/payslips/automation/scheduler/start');
    return response.data;
  },

  /**
   * Stop the automatic payslip scheduler
   * @returns Success message and status
   * @access SuperAdmin only
   */
  stopScheduler: async (): Promise<{ message: string; status: SchedulerStatus }> => {
    const response = await api.post<{ message: string; status: SchedulerStatus }>('/payslips/automation/scheduler/stop');
    return response.data;
  },
};

// Export api instance as default
export default api;
// Automation API endpoints
export const payslipAutomationApi = {
  /**
   * Get automation status
   * @returns Current automation status
   * @access SuperAdmin, HR
   */
  getStatus: async () => {
    const response = await api.get('/payslips/automation/status');
    return response.data;
  },

  /**
   * Start the scheduler
   * @returns Success message
   * @access SuperAdmin
   */
  startScheduler: async () => {
    const response = await api.post('/payslips/automation/scheduler/start');
    return response.data;
  },

  /**
   * Stop the scheduler
   * @returns Success message
   * @access SuperAdmin
   */
  stopScheduler: async () => {
    const response = await api.post('/payslips/automation/scheduler/stop');
    return response.data;
  },

  /**
   * Generate historical payslips
   * @param request - Historical generation request
   * @returns Generation progress
   * @access SuperAdmin
   */
  generateHistorical: async (request: any) => {
    const response = await api.post('/payslips/automation/generate-historical', request);
    return response.data;
  },

  /**
   * Get coverage analysis
   * @returns Coverage analysis data
   * @access SuperAdmin, HR
   */
  getCoverageAnalysis: async () => {
    const response = await api.get('/payslips/automation/coverage-analysis');
    return response.data;
  },

  /**
   * Generate current month payslips
   * @param request - Generation request
   * @returns Generation result
   * @access SuperAdmin
   */
  generateCurrentMonth: async (request: any) => {
    const response = await api.post('/payslips/automation/generate-bulk', request);
    return response.data;
  },

  /**
   * Get generation progress
   * @param sessionId - Generation session ID
   * @returns Current progress
   * @access SuperAdmin, HR
   */
  getProgress: async (sessionId: string) => {
    const response = await api.get(`/payslips/automation/progress/${sessionId}`);
    return response.data;
  },
};