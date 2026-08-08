// src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { User, CreateAccountData, ApiResponse } from '../types';

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
      // Only redirect to login if it's an auth-related endpoint
      // Don't redirect on attendance errors - let the component handle it
      const url = error.config?.url || '';
      if (url.includes('/auth/') || url.includes('/employees/profile')) {
        localStorage.removeItem('servease_token');
        localStorage.removeItem('servease_user');
        
        // Notify the app to redirect via event instead of direct navigation
        // This keeps navigation concerns in the UI layer
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
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
    
    // Store token from response
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

// User API calls
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

// Daily Task API calls
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
  // Create a new daily task
  create: async (data: DailyTaskData): Promise<DailyTask> => {
    const response = await api.post<DailyTask>('/daily-tasks', data);
    return response.data;
  },

  // Get all tasks (reviewer only)
  getAll: async (params?: DailyTaskQueryParams): Promise<DailyTask[]> => {
    const response = await api.get<DailyTask[]>('/daily-tasks', { params });
    return response.data;
  },

  // Get my tasks
  getMyTasks: async (params?: Omit<DailyTaskQueryParams, 'employeeId'>): Promise<DailyTask[]> => {
    const response = await api.get<DailyTask[]>('/daily-tasks/mine', { params });
    return response.data;
  },

  // Get task by ID
  getById: async (id: string): Promise<DailyTask> => {
    const response = await api.get<DailyTask>(`/daily-tasks/${id}`);
    return response.data;
  },

  // Update task
  update: async (id: string, data: Partial<DailyTaskData>): Promise<DailyTask> => {
    const response = await api.patch<DailyTask>(`/daily-tasks/${id}`, data);
    return response.data;
  },

  // Upload attachments
  uploadAttachments: async (taskId: string, formData: FormData): Promise<{ attachments: string[] }> => {
    const response = await api.post<{ attachments: string[] }>(`/daily-tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    await api.delete(`/daily-tasks/${taskId}/attachments/${attachmentId}`);
  },
};

// Export api instance as default
export default api;