// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import toast from 'react-hot-toast';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  HomeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const LoginPage = () => {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'create'>('signin');

  // Create account state
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [createAccountRole, setCreateAccountRole] = useState<Role>('employee');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const { login, createAccount, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (trimmedPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await login(trimmedEmail, trimmedPassword);
      navigate('/dashboard');
    } catch (err) {
      // Error handled in auth context
    }
  };

  // Handle Create Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const trimmedMobileNumber = mobileNumber.trim();

    if (!trimmedFullName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (trimmedPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      await createAccount({
        name: trimmedFullName,
        email: trimmedEmail,
        role: createAccountRole,
        password: trimmedPassword,
        mobileNumber: trimmedMobileNumber || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      // Error handled in auth context
    }
  };

  // Handle Demo Click
  const handleDemoClick = async (role: Role) => {
    try {
      const demoEmails: Record<Role, string> = {
        'super-admin': 'sanya.kapoor@servease.com',
        'hr-partner': 'priya.sharma@servease.com',
        'manager': 'priya.nair@servease.com',
        'employee': 'rohan.verma@servease.com'
      };
      await login(demoEmails[role], 'password123');
      navigate('/dashboard');
    } catch (err) {
      // Error handled in auth context
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Check email uniqueness with loading
  const checkEmailUniqueness = async (emailValue: string) => {
    const trimmedEmail = emailValue.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    setIsCheckingEmail(true);
    try {
      // Simulate API call to check email uniqueness
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get existing users from localStorage
      const users = JSON.parse(localStorage.getItem('servease_users') || '[]');
      const exists = users.some((user: any) => user.email === trimmedEmail);
      
      setEmailAvailable(!exists);
    } catch (error) {
      setEmailAvailable(null);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Handle email change with debounce
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Debounce email check
    const timeoutId = setTimeout(() => {
      checkEmailUniqueness(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  // Handle phone number input - only allow digits and max 10
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(value);
  };

  // Professional role icons with gradient backgrounds
  const roleIcons = {
    'super-admin': <ShieldCheckIcon className="w-5 h-5" />,
    'hr-partner': <BuildingOfficeIcon className="w-5 h-5" />,
    'manager': <BriefcaseIcon className="w-5 h-5" />,
    'employee': <UserGroupIcon className="w-5 h-5" />
  };

  // Refined professional color palette
  const roleColors = {
    'super-admin': 'border-indigo-400 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20',
    'hr-partner': 'border-cyan-400 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-900/20',
    'manager': 'border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-900/20',
    'employee': 'border-amber-400 text-amber-600 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-900/20'
  };

  const roleBgColors = {
    'super-admin': 'bg-indigo-50 dark:bg-indigo-900/20',
    'hr-partner': 'bg-cyan-50 dark:bg-cyan-900/20',
    'manager': 'bg-emerald-50 dark:bg-emerald-900/20',
    'employee': 'bg-amber-50 dark:bg-amber-900/20'
  };

  const roleSelectedBg = {
    'super-admin': 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30',
    'hr-partner': 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-200/50 dark:shadow-cyan-900/30',
    'manager': 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30',
    'employee': 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30'
  };

  const roleGradients = {
    'super-admin': 'from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/20',
    'hr-partner': 'from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/20',
    'manager': 'from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20',
    'employee': 'from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/20'
  };

  const roleLabels = {
    'super-admin': 'Super Admin',
    'hr-partner': 'HR Partner',
    'manager': 'Manager',
    'employee': 'Employee'
  };

  const roleDescriptions = {
    'super-admin': 'Full system access',
    'hr-partner': 'HR management',
    'manager': 'Team management',
    'employee': 'Employee portal'
  };

  // Create account role selection component
  const CreateAccountRoleSelection = () => {
    return (
      <div className="space-y-3">
        <label className={`block text-sm font-medium mb-1.5 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Select your role <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['super-admin', 'hr-partner', 'manager', 'employee'] as Role[]).map((role) => {
            const isSelected = createAccountRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setCreateAccountRole(role)}
                className={`relative p-3.5 border-2 rounded-xl transition-all duration-300 text-left ${
                  isSelected
                    ? roleSelectedBg[role]
                    : `border-gray-200 dark:border-gray-700 ${isDarkMode ? 'hover:border-gray-500' : 'hover:border-gray-300'}`
                }`}
                disabled={loading}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    isSelected 
                      ? 'bg-white/20 text-white' 
                      : `bg-gradient-to-br ${roleGradients[role]} ${roleBgColors[role]}`
                  }`}>
                    {roleIcons[role]}
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${
                      isSelected ? 'text-white' : isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {roleLabels[role]}
                    </div>
                    <div className={`text-xs ${
                      isSelected ? 'text-white/80' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {roleDescriptions[role]}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircleIcon className="w-4 h-4 text-white drop-shadow-md" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Demo roles selection component
  const DemoRoleSelection = () => {
    return (
      <div className="space-y-3">
        <p className={`text-center text-sm font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          OR TRY A DEMO ROLE
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(['super-admin', 'hr-partner', 'manager', 'employee'] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => handleDemoClick(role)}
              disabled={loading}
              className={`relative p-3.5 border-2 rounded-xl transition-all duration-300 text-left group hover:shadow-md ${
                roleColors[role]
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${roleGradients[role]} ${roleBgColors[role]} group-hover:scale-105 transition-transform duration-200`}>
                  {roleIcons[role]}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {roleLabels[role]}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    One-click demo
                  </div>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <SparklesIcon className="w-4 h-4 text-amber-400" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className={`w-full max-w-6xl overflow-hidden flex flex-col lg:flex-row rounded-3xl shadow-2xl transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Left Section - Brand & Features */}
        <div className="lg:w-2/5 bg-gradient-to-br from-[#0a1628] via-[#1a2744] to-[#2a3f6a] p-8 lg:p-12 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            {/* Back to Home */}
            <Link to="/" className="inline-flex items-center text-blue-300 hover:text-white transition-colors mb-8 text-sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to home
            </Link>

            {/* Logo */}
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-3 backdrop-blur-sm">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">ServEase</h1>
                <p className="text-xs text-blue-300">INNOVATION PVT LTD</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-2">
              {activeTab === 'signin' ? 'Welcome back.' : 'Join ServEase.'}
            </h2>
            <p className="text-blue-200 text-sm mb-8">
              {activeTab === 'signin' 
                ? 'Sign in to your account or create a new one.'
                : 'Create your account and start managing your work efficiently.'
              }
            </p>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                WELCOME TO
              </h3>
              <p className="text-sm font-medium text-white">
                The ServEase employee portal.
              </p>
              <p className="text-sm text-blue-200">
                {activeTab === 'signin'
                  ? 'Sign in to your account, create a new one, or jump in with a one-click demo role.'
                  : 'Create your account and get started with role-based access.'
                }
              </p>

              <div className="space-y-2.5 mt-6">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-blue-300 flex-shrink-0" />
                  <span className="text-sm text-blue-100">Email & password sign-in</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-blue-300 flex-shrink-0" />
                  <span className="text-sm text-blue-100">Role-based dashboards</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-blue-300 flex-shrink-0" />
                  <span className="text-sm text-blue-100">Secure & reliable</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-blue-300">
                © 2026 ServEase Innovation Private Limited
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Login/Create Account Form */}
        <div className={`lg:w-3/5 p-6 lg:p-10 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                Demo mode
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">
                Active
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleDarkMode}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-yellow-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <SunIcon className="w-4 h-4" />
                ) : (
                  <MoonIcon className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                aria-label="Search"
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <MagnifyingGlassIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </button>
              <div className="flex items-center space-x-1">
                <GlobeAltIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>ENG</span>
              </div>
              <div className={`w-px h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>IN</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>22-06-2026</span>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex border-b mb-6 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={() => setActiveTab('signin')}
              className={`pb-3 px-1 text-sm font-medium transition-all duration-300 border-b-2 ${
                activeTab === 'signin'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-3 px-1 ml-6 text-sm font-medium transition-all duration-300 border-b-2 ${
                activeTab === 'create'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              Create account
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500 group-hover:text-indigo-400' : 'text-gray-400 group-hover:text-indigo-500'} transition-colors`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="you@serveasein.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500 group-hover:text-indigo-400' : 'text-gray-400 group-hover:text-indigo-500'} transition-colors`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                    ) : (
                      <EyeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <label className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/30 relative overflow-hidden"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center">
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Tip: any demo email works (e.g. rohan.verma@serveasein.com).
                </p>
              </div>
            </form>
          )}

          {/* Create Account Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Full name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Mobile number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DevicePhoneMobileIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={handlePhoneChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="10-digit number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    } ${emailAvailable === false ? 'border-red-500' : emailAvailable === true ? 'border-green-500' : ''}`}
                    placeholder="you@company.com"
                    required
                    disabled={loading}
                  />
                  {isCheckingEmail && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  {!isCheckingEmail && emailAvailable === true && email.trim() && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {!isCheckingEmail && emailAvailable === false && email.trim() && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <span className="text-red-500 text-xs font-medium">Email taken</span>
                    </div>
                  )}
                </div>
                {emailAvailable === false && email.trim() && (
                  <p className="text-red-500 text-xs mt-1">This email is already registered</p>
                )}
                {emailAvailable === true && email.trim() && (
                  <p className="text-green-500 text-xs mt-1">Email is available</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                    ) : (
                      <EyeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Re-enter password"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                    ) : (
                      <EyeIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`} />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Selection for Create Account */}
              <CreateAccountRoleSelection />

              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                  disabled={loading}
                />
                <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  I agree to the{' '}
                  <button type="button" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    Privacy Policy
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || emailAvailable === false || isCheckingEmail}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/30 relative overflow-hidden"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Demo Roles */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <DemoRoleSelection />
          </div>

          {/* Weather and Footer */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                31°C
              </span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Mostly cloudy
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className={`p-1 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
                aria-label="Search"
                title="Search"
              >
                <MagnifyingGlassIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </button>
              <div className="flex items-center space-x-1">
                <GlobeAltIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>ENG</span>
              </div>
              <div className={`w-px h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>IN</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>15:32</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>22-06-2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;