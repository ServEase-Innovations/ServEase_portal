// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, CreateAccountData } from '../types';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  createAccount: (userData: CreateAccountData) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for offline testing
const DEMO_USERS = [
  {
    id: '1',
    name: 'Sanya Kapoor',
    email: 'sanya.kapoor@servease.com',
    password: 'password123',
    role: 'super-admin' as Role,
    mobileNumber: '9876543210',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@servease.com',
    password: 'password123',
    role: 'hr-partner' as Role,
    mobileNumber: '9876543211',
  },
  {
    id: '3',
    name: 'Priya Nair',
    email: 'priya.nair@servease.com',
    password: 'password123',
    role: 'manager' as Role,
    mobileNumber: '9876543212',
  },
  {
    id: '4',
    name: 'Rohan Verma',
    email: 'rohan.verma@servease.com',
    password: 'password123',
    role: 'employee' as Role,
    mobileNumber: '9876543213',
  },
];

// Initialize demo users in localStorage if not already present
const initializeDemoUsers = () => {
  const existingUsers = localStorage.getItem('servease_users');
  if (!existingUsers) {
    localStorage.setItem('servease_users', JSON.stringify(DEMO_USERS));
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize demo users on mount
  useEffect(() => {
    initializeDemoUsers();
  }, []);

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
      } catch (e) {
        localStorage.removeItem('servease_token');
        localStorage.removeItem('servease_user');
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to login via API first
      try {
        const response = await authService.login(email, password);
        
        if (response.error) {
          throw new Error(response.error);
        }

        const { user: userData, token: authToken } = response.data!;
        
        // Store token and user
        localStorage.setItem('servease_token', authToken);
        localStorage.setItem('servease_user', JSON.stringify(userData));
        
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success(`Welcome back, ${userData.name || 'User'}!`);
        setLoading(false);
        return;
      } catch (apiError) {
        // If API fails, try demo login locally
        console.log('API login failed, trying demo login...');
        
        const demoUser = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        );

        if (!demoUser) {
          // Check if user exists in localStorage
          const users = JSON.parse(localStorage.getItem('servease_users') || '[]');
          const localUser = users.find(
            (u: any) => u.email === email && u.password === password
          );

          if (!localUser) {
            throw new Error('Invalid email or password');
          }

          // Login with local user
          const { password: _, ...userWithoutPassword } = localUser;
          const authToken = `local_token_${Date.now()}`;
          
          localStorage.setItem('servease_token', authToken);
          localStorage.setItem('servease_user', JSON.stringify(userWithoutPassword));
          
          setToken(authToken);
          setUser(userWithoutPassword);
          setIsAuthenticated(true);
          
          toast.success(`Welcome back, ${userWithoutPassword.name || 'User'}!`);
          setLoading(false);
          return;
        }

        // Login with demo user
        const { password: _, ...userWithoutPassword } = demoUser;
        const authToken = `demo_token_${Date.now()}`;
        
        localStorage.setItem('servease_token', authToken);
        localStorage.setItem('servease_user', JSON.stringify(userWithoutPassword));
        
        setToken(authToken);
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        
        toast.success(`Welcome back, ${userWithoutPassword.name || 'User'}!`);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const createAccount = useCallback(async (userData: CreateAccountData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to register via API first
      try {
        const response = await authService.register(userData);
        
        if (response.error) {
          throw new Error(response.error);
        }

        const { user: newUser, token: authToken } = response.data!;
        
        // Store token and user
        localStorage.setItem('servease_token', authToken);
        localStorage.setItem('servease_user', JSON.stringify(newUser));
        
        setToken(authToken);
        setUser(newUser);
        setIsAuthenticated(true);
        
        toast.success(`Account created successfully! Welcome, ${newUser.name || 'User'}!`);
        setLoading(false);
        return;
      } catch (apiError) {
        // If API fails, save locally
        console.log('API registration failed, saving locally...');
        
        const users = JSON.parse(localStorage.getItem('servease_users') || '[]');
        
        // Check if email already exists
        if (users.some((u: any) => u.email === userData.email)) {
          throw new Error('Email already registered');
        }

        const newUser: User & { password: string } = {
          id: `user_${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          mobileNumber: userData.mobileNumber || '',
          password: userData.password,
        };

        users.push(newUser);
        localStorage.setItem('servease_users', JSON.stringify(users));

        const { password: _, ...userWithoutPassword } = newUser;
        const authToken = `local_token_${Date.now()}`;
        
        localStorage.setItem('servease_token', authToken);
        localStorage.setItem('servease_user', JSON.stringify(userWithoutPassword));
        
        setToken(authToken);
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        
        toast.success(`Account created successfully! Welcome, ${userWithoutPassword.name || 'User'}!`);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Account creation failed';
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
      if (response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('servease_user', JSON.stringify(response.data.user));
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