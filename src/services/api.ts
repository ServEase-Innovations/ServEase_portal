// src/services/api.ts
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
    return response.data;
  },

  register: async (userData: RegisterData): Promise<User> => {
    const response = await api.post<User>('employees/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('auth/logout');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout API error:', error);
      }
    }
    localStorage.removeItem('servease_token');
    localStorage.removeItem('servease_user');
  },

  getCurrentUser: async (): Promise<User> => {
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

interface DailyTask {
  dailyTaskSubmissionId: string;
  employeeId: string;
  workDescription: string;
  status: 'Pending' | 'Completed';
  newIdeas: string | null;
  submissionDate: string;
  submissionDateEpoch: string;
  submittedAt: string;
  submittedAtEpoch: string;
  updatedAt: string;
  updatedAtEpoch: string;
  jiraLinks: Array<{
    dailyTaskJiraLinkId: string;
    label: string | null;
    url: string;
    createdAt: string;
    createdAtEpoch: string;
  }>;
  attachments: Array<{
    dailyTaskAttachmentId: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: string;
    uploadedAtEpoch: string;
  }>;
  employee?: any;
}

interface DailyTaskQueryParams {
  date?: string;
  employeeId?: string;
  status?: 'Pending' | 'Completed';
}

interface DailyTaskListResponse {
  date: string;
  count: number;
  dailyTasks: DailyTask[];
}

interface DailyTaskCreateResponse {
  message: string;
  dailyTask: DailyTask;
}

// ✅ FIXED: Daily Task Service with proper response handling
export const dailyTaskService = {
  create: async (data: DailyTaskData): Promise<DailyTaskCreateResponse> => {
    const response = await api.post<DailyTaskCreateResponse>('/daily-tasks', data);
    return response.data;
  },

  getAll: async (params?: DailyTaskQueryParams): Promise<DailyTaskListResponse> => {
    const response = await api.get<DailyTaskListResponse>('/daily-tasks', { params });
    return response.data;
  },

  getMyTasks: async (params?: Omit<DailyTaskQueryParams, 'employeeId'>): Promise<DailyTaskListResponse> => {
    try {
      console.log('🔵 [api] getMyTasks called with params:', params);
      const response = await api.get<DailyTaskListResponse>('/daily-tasks/mine', { params });
      console.log('🔵 [api] getMyTasks raw response:', response);
      console.log('🔵 [api] getMyTasks data:', response.data);
      
      // ✅ FIXED: Ensure we return the correct structure
      if (response.data && response.data.dailyTasks !== undefined) {
        console.log('✅ [api] Returning response.data with dailyTasks:', response.data.dailyTasks.length);
        return response.data;
      } else if (response.data && Array.isArray(response.data)) {
        // If the API returns an array directly, wrap it
        console.log('✅ [api] Response is array, wrapping:', response.data.length);
        return {
          date: params?.date || new Date().toISOString().split('T')[0],
          count: response.data.length,
          dailyTasks: response.data
        };
      } else {
        // Return empty structure
        console.log('⚠️ [api] No dailyTasks found, returning empty');
        return {
          date: params?.date || new Date().toISOString().split('T')[0],
          count: 0,
          dailyTasks: []
        };
      }
    } catch (error) {
      console.error('❌ [api] getMyTasks error:', error);
      // Return empty structure on error to prevent crashes
      return {
        date: params?.date || new Date().toISOString().split('T')[0],
        count: 0,
        dailyTasks: []
      };
    }
  },

  getById: async (id: string): Promise<{ dailyTask: DailyTask }> => {
    const response = await api.get<{ dailyTask: DailyTask }>(`/daily-tasks/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<DailyTaskData>): Promise<DailyTaskCreateResponse> => {
    const response = await api.patch<DailyTaskCreateResponse>(`/daily-tasks/${id}`, data);
    return response.data;
  },

  uploadAttachments: async (taskId: string, formData: FormData): Promise<DailyTaskCreateResponse> => {
    const response = await api.post<DailyTaskCreateResponse>(`/daily-tasks/${taskId}/attachments`, formData, {
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
  getAllPayslips: async (params?: {
    employeeId?: string;
    month?: number;
    year?: number;
    status?: 'Draft' | 'Approved' | 'Paid' | 'Cancelled';
  }): Promise<PayslipListResponse> => {
    const response = await api.get<PayslipListResponse>('/payslips', { params });
    return response.data;
  },

  getMyPayslips: async (params?: {
    month?: number;
    year?: number;
    status?: 'Approved' | 'Paid';
  }): Promise<PayslipListResponse> => {
    const response = await api.get<PayslipListResponse>('/payslips/mine', { params });
    return response.data;
  },

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

  generatePayslip: async (payload: GeneratePayslipPayload): Promise<PayslipGenerateResponse> => {
    const response = await api.post<PayslipGenerateResponse>('/payslips/generate', payload);
    return response.data;
  },

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
  triggerMonthlyGeneration: async (): Promise<{ message: string; result: BulkPayslipResult }> => {
    const response = await api.post<{ message: string; result: BulkPayslipResult }>('/payslips/automation/generate-monthly');
    return response.data;
  },

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

  getCoverage: async (): Promise<PayslipCoverage & { message: string }> => {
    const response = await api.get<PayslipCoverage & { message: string }>('/payslips/automation/coverage');
    return response.data;
  },

  getSchedulerStatus: async (): Promise<SchedulerStatus> => {
    const response = await api.get<SchedulerStatus>('/payslips/automation/scheduler/status');
    return response.data;
  },

  startScheduler: async (): Promise<{ message: string; status: SchedulerStatus }> => {
    const response = await api.post<{ message: string; status: SchedulerStatus }>('/payslips/automation/scheduler/start');
    return response.data;
  },

  stopScheduler: async (): Promise<{ message: string; status: SchedulerStatus }> => {
    const response = await api.post<{ message: string; status: SchedulerStatus }>('/payslips/automation/scheduler/stop');
    return response.data;
  },
};

// Export api instance as default
export default api;

// Automation API endpoints
export const payslipAutomationApi = {
  getStatus: async () => {
    const response = await api.get('/payslips/automation/status');
    return response.data;
  },

  startScheduler: async () => {
    const response = await api.post('/payslips/automation/scheduler/start');
    return response.data;
  },

  stopScheduler: async () => {
    const response = await api.post('/payslips/automation/scheduler/stop');
    return response.data;
  },

  generateHistorical: async (request: any) => {
    const response = await api.post('/payslips/automation/generate-historical', request);
    return response.data;
  },

  getCoverageAnalysis: async () => {
    const response = await api.get('/payslips/automation/coverage-analysis');
    return response.data;
  },

  generateCurrentMonth: async (request: any) => {
    const response = await api.post('/payslips/automation/generate-bulk', request);
    return response.data;
  },

  getProgress: async (sessionId: string) => {
    const response = await api.get(`/payslips/automation/progress/${sessionId}`);
    return response.data;
  },
};