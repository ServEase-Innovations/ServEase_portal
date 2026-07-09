// src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { User, CreateAccountData, ApiResponse } from '../types';

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5001/',
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authService = {
  login: async (username: string, password: string): Promise<any> => {
    const response = await api.post('auth/login', { username, password });
    console.log('Login API response:', response.data); // Log the response data
    return response.data;
  },

  // Updated: Changed from auth/register to employees/register
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

  // Updated: Changed from /users/me to employees/profile
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

// Export api instance as default
export default api;