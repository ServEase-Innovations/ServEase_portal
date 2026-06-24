// src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { User, LoginCredentials, CreateAccountData, ApiResponse } from '../types';



// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL:  'http://localhost:5000/api',
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
      // Clear local storage and redirect to login
      localStorage.removeItem('servease_token');
      localStorage.removeItem('servease_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: CreateAccountData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Optional: Call logout endpoint if needed
    localStorage.removeItem('servease_token');
    localStorage.removeItem('servease_user');
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// User API calls
export const userService = {
  getAll: async (): Promise<ApiResponse<{ users: User[] }>> => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: any): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Team API calls
export const teamService = {
  getAll: async (): Promise<ApiResponse<{ teams: any[] }>> => {
    const response = await api.get('/teams');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ team: any }>> => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  create: async (teamData: any): Promise<ApiResponse<{ team: any }>> => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  addMember: async (teamId: string, userId: string): Promise<ApiResponse<{ member: any }>> => {
    const response = await api.post('/teams/members', { teamId, userId });
    return response.data;
  },

  removeMember: async (teamId: string, userId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  },
};

export default api;