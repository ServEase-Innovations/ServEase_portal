// src/services/api.ts - Fully updated with payslip APIs
import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  User, 
  CreateAccountData, 
  ApiResponse,
  Payslip,
  PayslipListResponse,
  PayslipGenerateResponse,
  GeneratePayslipPayload,
  Employee,
} from '../types';

// Get API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/';

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
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
      const url = error.config?.url || '';
      if (url.includes('/auth/') || url.includes('/employees/profile')) {
        localStorage.removeItem('servease_token');
        localStorage.removeItem('servease_user');
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
    
    if (response.data.token) {
      localStorage.setItem('servease_token', response.data.token);
    }
    
    return response.data;
  },

  register: async (userData: RegisterData): Promise<User> => {
    const response = await api.post<User>('employees/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem('servease_token');
    if (token) {
      try {
        await api.post('auth/logout');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Logout API error:', error);
        }
      }
    }
    localStorage.removeItem('servease_token');
    localStorage.removeItem('servease_user');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('employees/profile');
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

// Export api instance as default
export default api;