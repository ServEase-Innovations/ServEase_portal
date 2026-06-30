// src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { User, CreateAccountData, ApiResponse } from '../types';

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000/',
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
    // Return the full response data directly
    return response.data;
  },

  register: async (userData: CreateAccountData): Promise<any> => {
    const response = await api.post('auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('servease_token');
    localStorage.removeItem('servease_user');
  },

  getCurrentUser: async (): Promise<any> => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// User API calls
export const userService = {
  getAll: async (): Promise<any> => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: string): Promise<any> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: any): Promise<any> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  getByUsername: async (username: string): Promise<any> => {
    const response = await api.get(`/users/username/${username}`);
    return response.data;
  },

  updateUsername: async (id: string, username: string): Promise<any> => {
    const response = await api.patch(`/users/${id}/username`, { username });
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean): Promise<any> => {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response.data;
  },

  delete: async (id: string): Promise<any> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default api;