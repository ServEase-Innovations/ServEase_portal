// src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { User, CreateAccountData, ApiResponse } from '../types';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/';

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5001/', //http://localhost:5001/
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
    if (error.response?.status === 401) {
      localStorage.removeItem('servease_token');
      localStorage.removeItem('servease_user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authService = {
  login: async (username: string, password: string): Promise<any> => {
    const response = await api.post('auth/login', { username, password });
    console.log('Login API response:', response.data);
    
    // Store token from response
    if (response.data.token) {
      localStorage.setItem('servease_token', response.data.token);
    }
    
    return response.data;
  },

  register: async (userData: any): Promise<any> => {
    const response = await api.post('employees/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem('servease_token');
    if (token) {
      try {
        await api.post('auth/logout');
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    localStorage.removeItem('servease_token');
    localStorage.removeItem('servease_user');
  },

  getCurrentUser: async (): Promise<any> => {
    const response = await api.get('employees/profile');
    return response.data;
  },
};

// User API calls
export const userService = {
  getAll: async (): Promise<any> => {
    const response = await api.get('/employees');
    return response.data;
  },

  getById: async (id: string): Promise<any> => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  create: async (userData: any): Promise<any> => {
    const response = await api.post('/employees', userData);
    return response.data;
  },

  update: async (id: string, userData: any): Promise<any> => {
    const response = await api.put(`/employees/${id}`, userData);
    return response.data;
  },

  delete: async (id: string): Promise<any> => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};

// Daily Task API calls
export const dailyTaskService = {
  // Create a new daily task
  create: async (data: {
    workDescription: string;
    status: 'Pending' | 'Completed';
    newIdeas?: string;
    jiraLinks?: Array<{ label?: string; url: string }>;
  }): Promise<any> => {
    const response = await api.post('/daily-tasks', data);
    return response.data;
  },

  // Get all tasks (reviewer only)
  getAll: async (params?: {
    date?: string;
    employeeId?: string;
    status?: 'Pending' | 'Completed';
  }): Promise<any> => {
    const response = await api.get('/daily-tasks', { params });
    return response.data;
  },

  // Get my tasks
  getMyTasks: async (params?: {
    date?: string;
    status?: 'Pending' | 'Completed';
  }): Promise<any> => {
    const response = await api.get('/daily-tasks/mine', { params });
    return response.data;
  },

  // Get task by ID
  getById: async (id: string): Promise<any> => {
    const response = await api.get(`/daily-tasks/${id}`);
    return response.data;
  },

  // Update task
  update: async (id: string, data: {
    workDescription?: string;
    status?: 'Pending' | 'Completed';
    newIdeas?: string | null;
    jiraLinks?: Array<{ label?: string; url: string }>;
  }): Promise<any> => {
    const response = await api.patch(`/daily-tasks/${id}`, data);
    return response.data;
  },

  // Upload attachments
  uploadAttachments: async (taskId: string, formData: FormData): Promise<any> => {
    const response = await api.post(`/daily-tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (taskId: string, attachmentId: string): Promise<any> => {
    const response = await api.delete(`/daily-tasks/${taskId}/attachments/${attachmentId}`);
    return response.data;
  },
};

// Export api instance as default
export default api;