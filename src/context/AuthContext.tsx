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
  createAccount: (userData: CreateAccountData | any) => Promise<void>;
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
    'SUPERADMIN': 'super-admin',
    'SUPER ADMIN': 'super-admin',
    'super-admin': 'super-admin',
    'SuperAdmin': 'super-admin',
    'Super Admin': 'super-admin',
    'superadmin': 'super-admin',
    'HR': 'hr-partner',
    'hr': 'hr-partner',
    'HR_PARTNER': 'hr-partner',
    'hr-partner': 'hr-partner',
    'Hr': 'hr-partner',
    'human resources': 'hr-partner',
    'MANAGER': 'manager',
    'manager': 'manager',
    'Manager': 'manager',
    'Project Manager': 'manager',
    'Team Manager': 'manager',
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
    // Security: Don't log user-controlled data
    console.warn('Unknown role from API, defaulting to employee');
    return 'employee';
  }
  return mappedRole;
};

// Helper to map API response to User type
const mapUserData = (data: any): User => {
  return {
    id: data.employeeId || data.id,
    name: data.fullName || data.name,
    username: data.username || '',
    email: data.emailAddress || data.email || '',
    role: mapRole(data.assignedRole || data.role),
    mobileNumber: data.mobileNumber || '',
    isActive: data.isActive !== undefined ? data.isActive : true,
    assignedRole: data.assignedRole,
    assignedDepartment: data.assignedDepartment,
    baseSalary: data.baseSalary,
    allowances: data.allowances,
    deductions: data.deductions,
    joinedAt: data.joinedAt,
    lastLogin: data.lastLogin,
    managerId: data.managerId,
    teamId: data.teamId,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start as loading
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from API on mount (cookie auth) - NO localStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Fetch user from API using HTTP-only cookie
        const response = await authService.getCurrentUser();
        if (response) {
          const userData = mapUserData(response);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // No valid session, user needs to login
        console.log('No valid session found');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Login function
  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Attempting login
      // Login successful
      const response = await authService.login(username, password);
      console.log('Login successful');
      
      // Handle the API response structure
      const employeeData = response.data?.employee || response.employee;
      
      // Token is now stored in HTTP-only cookie by the server
      // User data is fetched from API on demand - NO localStorage
      
      // Map user data to User type
      const userData = mapUserData(employeeData);
      
      setUser(userData);
      setToken(null); // No token in state
      setIsAuthenticated(true);
      
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

  const createAccount = useCallback(async (userData: CreateAccountData | any) => {
    setLoading(true);
    setError(null);
    
    try {
      let backendRole: string;
      
      if (userData.role && typeof userData.role === 'string') {
        const backendRoles = ['SuperAdmin', 'HR', 'Manager', 'Developer', 'Marketing', 'CustomStaff'];
        if (backendRoles.includes(userData.role)) {
          backendRole = userData.role;
        } else {
          const roleMapping: Record<string, string> = {
            'super-admin': 'SuperAdmin',
            'hr-partner': 'HR',
            'manager': 'Manager',
            'employee': 'Developer'
          };
          backendRole = roleMapping[userData.role] || 'Developer';
        }
      } else {
        backendRole = 'Developer';
      }

      const payload = {
        fullName: userData.name,
        emailAddress: userData.email,
        assignedRole: backendRole,
        assignedDepartment: userData.department || 'Engineering',
        baseSalary: userData.baseSalary || 0,
        allowances: userData.allowances || 0,
        deductions: userData.deductions || 0,
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password,
      };

      // Creating account
      const response = await authService.register(payload);
      
      if (response.error) {
        throw new Error(response.message || 'Registration failed');
      }

      toast.success('Account created successfully!');
      setLoading(false);
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
      // Call backend to clear HTTP-only cookies
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      // No localStorage to clear - using cookies only
      toast.success('Logged out successfully');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response) {
        // Map data and store in state only (no localStorage)
        const userData = mapUserData(response);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setIsAuthenticated(false);
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