// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, CreateAccountData, Role, BackendRole, mapBackendRoleToFrontend, mapFrontendRoleToBackend } from '../types';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  createAccount: (userData: CreateAccountData) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to map role from API to app role
const mapRole = (apiRole: string): 'super-admin' | 'hr-partner' | 'manager' | 'employee' => {
  const roleMap: Record<string, 'super-admin' | 'hr-partner' | 'manager' | 'employee'> = {
    // Super Admin variations
    'SUPERADMIN': 'super-admin',
    'SUPER ADMIN': 'super-admin',
    'super-admin': 'super-admin',
    'SuperAdmin': 'super-admin',
    'Super Admin': 'super-admin',
    'superadmin': 'super-admin',
    
    // HR variations
    'HR': 'hr-partner',
    'hr': 'hr-partner',
    'HR_PARTNER': 'hr-partner',
    'hr-partner': 'hr-partner',
    'Hr': 'hr-partner',
    'human resources': 'hr-partner',
    
    // Manager variations
    'MANAGER': 'manager',
    'manager': 'manager',
    'Manager': 'manager',
    'Project Manager': 'manager',
    'Team Manager': 'manager',
    
    // Employee variations - these all map to employee dashboard
    'DEVELOPER': 'employee',
    'Developer': 'employee',
    'developer': 'employee',
    'MARKETING': 'employee',
    'Marketing': 'employee',
    'marketing': 'employee',
    'CUSTOMSTAFF': 'employee',
    'CustomStaff': 'employee',
    'customstaff': 'employee',
    'Custom Staff': 'employee',
    'EMPLOYEE': 'employee',
    'employee': 'employee',
    'Employee': 'employee',
    'Staff': 'employee',
    'staff': 'employee',
  };
  
  const mappedRole = roleMap[apiRole];
  if (!mappedRole) {
    console.warn(`Unknown role "${apiRole}" from API, defaulting to employee`);
    return 'employee';
  }
  return mappedRole;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('servease_token');
    const storedUser = localStorage.getItem('servease_user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('User loaded from localStorage:', parsedUser);
      } catch (e) {
        console.error('Error loading user from localStorage:', e);
        localStorage.removeItem('servease_token');
        localStorage.removeItem('servease_user');
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Login function - handles API response structure
  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with username:', username);
      const response = await authService.login(username, password);
      console.log('Login response:', response);
      
      // Handle the API response structure
      const employeeData = response.data?.employee || response.employee;
      const token = response.data?.token || response.accessToken;
      
      // if (!employeeData || !Token) {
      //   throw new Error('Invalid response from server');
      // }

      // Map the employee data to your User type
      const userData: User = {
        id: employeeData.employeeId || employeeData.id,
        name: employeeData.fullName || employeeData.name,
        username: employeeData.username || username,
        email: employeeData.emailAddress || employeeData.email || '',
        role: mapRole(employeeData.assignedRole || employeeData.role),
        mobileNumber: employeeData.mobileNumber || '',
        isActive: employeeData.isActive !== undefined ? employeeData.isActive : true,
        assignedRole: employeeData.assignedRole,
        assignedDepartment: employeeData.assignedDepartment,
        baseSalary: employeeData.baseSalary,
        allowances: employeeData.allowances,
        deductions: employeeData.deductions,
        joinedAt: employeeData.joinedAt,
        lastLogin: employeeData.lastLogin,
        managerId: employeeData.managerId,
        teamId: employeeData.teamId,
      };
      
      console.log('Mapped user data:', userData);
      console.log('Mapped role:', userData.role);
      
      // Store token and user
      localStorage.setItem('servease_token',token);
      localStorage.setItem('servease_user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Auth state updated - isAuthenticated:', true);
      toast.success(`Welcome back, ${userData.name || 'User'}!`);
      setLoading(false);
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  // Create account function - UPDATED to match CreateAccountData type
  const createAccount = useCallback(async (userData: CreateAccountData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Transform the data to match the backend schema
      const payload = {
        fullName: userData.name,
        emailAddress: userData.email,
        assignedRole: mapFrontendRoleToBackend(userData.role),
        assignedDepartment: userData.department || 'Engineering',
        baseSalary: userData.baseSalary || 0,
        allowances: userData.allowances || 0,
        deductions: userData.deductions || 0,
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password,
      };

      console.log('Creating account with payload:', payload);
      const response = await authService.register(payload);
      console.log('Registration response:', response);
      
      if (response.error) {
        throw new Error(response.message || 'Registration failed');
      }

      toast.success('Account created successfully!');
      
      setLoading(false);
      
      // Return the response for the component to handle
      return response;
    } catch (err: any) {
      console.error('Account creation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Account creation failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('servease_token');
      localStorage.removeItem('servease_user');
      toast.success('Logged out successfully');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response) {
        // Map the response to User type
        const userData: User = {
          id: response.employeeId || response.id,
          name: response.fullName || response.name,
          username: response.username || '',
          email: response.emailAddress || response.email || '',
          role: mapRole(response.assignedRole || response.role),
          mobileNumber: response.mobileNumber || '',
          isActive: response.isActive !== undefined ? response.isActive : true,
          assignedRole: response.assignedRole,
          assignedDepartment: response.assignedDepartment,
          baseSalary: response.baseSalary,
          allowances: response.allowances,
          deductions: response.deductions,
          joinedAt: response.joinedAt,
          lastLogin: response.lastLogin,
          managerId: response.managerId,
          teamId: response.teamId,
        };
        setUser(userData);
        localStorage.setItem('servease_user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  const value = {
    user,
    token,
    login,
    logout,
    createAccount,
    loading,
    error,
    clearError,
    isAuthenticated,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};