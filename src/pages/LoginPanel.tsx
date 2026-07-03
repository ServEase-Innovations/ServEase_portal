// src/components/LoginPanel.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  XMarkIcon,
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface LoginPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ isOpen, onClose, isDarkMode }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (trimmedPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await login(trimmedUsername, trimmedPassword);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div 
      className={`lg:sticky lg:top-24 transition-all duration-700 ease-in-out ${
        isOpen 
          ? 'lg:w-[45%] opacity-100 translate-x-0 max-h-[calc(100vh-120px)] overflow-y-auto' 
          : 'lg:w-0 opacity-0 translate-x-20 overflow-hidden lg:max-h-0'
      } w-full`}
    >
      {isOpen && (
        <div 
          className={`
            rounded-3xl shadow-2xl overflow-hidden border transition-all duration-700 ease-in-out
            transform-gpu will-change-transform
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
            ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10'}
          `}
          style={{
            animation: isOpen ? 'slideInRight 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
            boxShadow: isDarkMode 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
              : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Animated Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
          
          {/* Close Button with Hover Animation */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className={`
                p-2 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm
                hover:scale-110 active:scale-95
                ${isDarkMode 
                  ? 'bg-gray-800/90 hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'bg-white/90 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }
              `}
              aria-label="Close login panel"
            >
              <XMarkIcon className="w-5 h-5 transition-transform duration-300 hover:rotate-90" />
            </button>
          </div>

          {/* Brand Section with Subtle Animation */}
          <div className="relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1a2744] to-[#2a3f6a]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
              {/* Animated floating particles */}
              <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-bounce"></div>
              <div className="absolute bottom-20 right-10 w-3 h-3 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/15 rounded-full animate-bounce delay-500"></div>
            </div>
            
            <div className="relative z-10 p-6 md:p-8 text-white">
              {/* Logo with Scale Animation */}
              <div className="flex items-center mb-4 group">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-3 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">ServEase</h1>
                  <p className="text-[10px] text-blue-300">INNOVATION PVT LTD</p>
                </div>
              </div>

              {/* Welcome Text with Fade Animation */}
              <div className="space-y-1 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  Welcome back.
                  <SparklesIcon className="w-5 h-5 text-yellow-400 animate-pulse" />
                </h2>
                <p className="text-blue-200 text-sm mb-4">
                  Sign in to your account to manage your work efficiently.
                </p>
              </div>

              {/* Features List with Stagger Animation */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  WELCOME TO
                </h3>
                <p className="text-sm font-medium text-white">
                  The ServEase employee portal.
                </p>
                <p className="text-sm text-blue-200">
                  Sign in to your account to get started.
                </p>

                <div className="space-y-2 mt-3">
                  {[
                    'Username & password sign-in',
                    'Role-based dashboards',
                    'Secure & reliable'
                  ].map((text, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3 transform transition-all duration-500 hover:translate-x-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative">
                        <CheckCircleIcon className="w-4 h-4 text-blue-300 flex-shrink-0" />
                        <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-sm text-blue-100">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer with Fade */}
              <div className="mt-4 pt-3 border-t border-white/10 animate-fadeIn">
                <p className="text-[10px] text-blue-300">
                  © 2026 ServEase Innovation Private Limited
                </p>
              </div>
            </div>
          </div>

          {/* Login Form with Stagger Animation */}
          <div className={`p-6 md:p-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Field */}
              <div className="transform transition-all duration-500 hover:translate-x-1">
                <label className={`block text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className={`h-5 w-5 transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-gray-500 group-hover:text-indigo-400 group-hover:scale-110' 
                        : 'text-gray-400 group-hover:text-indigo-500 group-hover:scale-110'
                    }`} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`
                      w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all duration-300
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      hover:shadow-md hover:shadow-indigo-500/10
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 hover:border-gray-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300'
                      }
                    `}
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="transform transition-all duration-500 hover:translate-x-1" style={{ animationDelay: '100ms' }}>
                <label className={`block text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className={`h-5 w-5 transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-gray-500 group-hover:text-indigo-400 group-hover:scale-110' 
                        : 'text-gray-400 group-hover:text-indigo-500 group-hover:scale-110'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`
                      w-full pl-10 pr-12 py-3 border rounded-xl outline-none transition-all duration-300
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      hover:shadow-md hover:shadow-indigo-500/10
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 hover:border-gray-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300'
                      }
                    `}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center group"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className={`h-5 w-5 transition-all duration-300 ${
                        isDarkMode 
                          ? 'text-gray-400 group-hover:text-gray-200 group-hover:scale-110' 
                          : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'
                      }`} />
                    ) : (
                      <EyeIcon className={`h-5 w-5 transition-all duration-300 ${
                        isDarkMode 
                          ? 'text-gray-400 group-hover:text-gray-200 group-hover:scale-110' 
                          : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'
                      }`} />
                    )}
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2">
                  <label className={`flex items-center text-sm transition-all duration-300 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className={`
                        mr-2 rounded focus:ring-indigo-500 transition-all duration-300
                        hover:scale-110
                        ${isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-indigo-600' 
                          : 'border-gray-300 text-indigo-600'
                        }
                      `}
                    />
                    Remember me
                  </label>
                  <button 
                    type="button" 
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline transition-all duration-300 hover:scale-105"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Submit Button with Ripple Effect */}
              <div className="transform transition-all duration-500 hover:translate-x-1" style={{ animationDelay: '200ms' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group overflow-hidden hover:shadow-xl hover:shadow-indigo-500/30 dark:hover:shadow-indigo-900/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Ripple effect background */}
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  
                  {loading ? (
                    <span className="relative flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="relative flex items-center">
                      <span>Sign in</span>
                      <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                    </span>
                  )}
                  
                  {/* Animated shimmer on hover */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                </button>
              </div>
            </form>

            {/* Footer Link */}
            <div className={`mt-4 pt-3 border-t transition-colors duration-300 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } text-center`}>
              <p className={`text-xs transition-all duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Need an account?{' '}
                <button 
                  type="button"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline transition-all duration-300 hover:scale-105 inline-block"
                >
                  Contact your HR administrator
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPanel;