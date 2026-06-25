// src/components/HR/OnboardNewHireModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  UserIcon, 
  DevicePhoneMobileIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import toast from 'react-hot-toast';

interface OnboardNewHireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  theme: 'light' | 'dark';
}

const OnboardNewHireModal: React.FC<OnboardNewHireModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  theme 
}) => {
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [createAccountRole, setCreateAccountRole] = useState<Role>('employee');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [onboardLoading, setOnboardLoading] = useState(false);

  // Refs for debounce
  const emailTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { createAccount } = useAuth();

  // Professional role icons with gradient backgrounds
  const roleIcons = {
    'super-admin': <ShieldCheckIcon className="w-5 h-5" />,
    'hr-partner': <BuildingOfficeIcon className="w-5 h-5" />,
    'manager': <BriefcaseIcon className="w-5 h-5" />,
    'employee': <UserGroupIcon className="w-5 h-5" />
  };

  const roleGradients = {
    'super-admin': 'from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/20',
    'hr-partner': 'from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/20',
    'manager': 'from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20',
    'employee': 'from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/20'
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

  // Theme-aware class helpers
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#1a2744]',
        bgCardHover: 'hover:bg-[#243555]',
        bgTable: 'bg-[#1a2744]',
        bgTableHover: 'hover:bg-[#243555]',
        border: 'border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        shadow: 'shadow-xl shadow-black/20',
        input: 'bg-[#0d1f3c] border-white/10 text-white placeholder:text-blue-300/40',
        tableHeader: 'bg-[#0d1f3c] text-blue-300/60',
      };
    }
    return {
      bgCard: 'bg-white/80 backdrop-blur-sm',
      bgCardHover: 'hover:bg-gray-50/80',
      bgTable: 'bg-white',
      bgTableHover: 'hover:bg-gray-50',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      shadow: 'shadow-lg shadow-indigo-500/5',
      input: 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
      tableHeader: 'bg-gray-50 text-gray-500',
    };
  };

  const tc = getThemeClasses();

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

  // Handle email change with debounce - FIXED: Proper cleanup
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear existing timeout
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current);
    }
    
    // Set new timeout
    emailTimeoutRef.current = setTimeout(() => {
      checkEmailUniqueness(value);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }
    };
  }, []);

  // Handle phone number input - only allow digits and max 10
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(value);
  };

  // Handle Onboard New Hire
  const handleOnboardNewHire = async (e: React.FormEvent) => {
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

    if (emailAvailable === false) {
      toast.error('This email is already registered');
      return;
    }

    setOnboardLoading(true);

    try {
      await createAccount({
        name: trimmedFullName,
        email: trimmedEmail,
        role: createAccountRole,
        password: trimmedPassword,
        mobileNumber: trimmedMobileNumber || undefined,
      });

      toast.success(`${trimmedFullName} has been onboarded successfully!`);
      
      // Reset form
      setFullName('');
      setEmail('');
      setMobileNumber('');
      setPassword('');
      setConfirmPassword('');
      setCreateAccountRole('employee');
      setAgreeTerms(false);
      setEmailAvailable(null);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      // Error handled in auth context
    } finally {
      setOnboardLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl ${tc.bgCard} ${tc.border} ${tc.shadow} p-6 lg:p-8 transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-xl font-bold ${tc.text}`}>Onboard New Hire</h2>
            <p className={`text-sm ${tc.textSecondary}`}>Create a new employee account</p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl ${tc.bgTableHover} transition-colors`}
            aria-label="Close modal"
          >
            <XCircleIcon className={`w-6 h-6 ${tc.textMuted}`} />
          </button>
        </div>

        <form onSubmit={handleOnboardNewHire} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${tc.textSecondary}`}>
              Full name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className={`h-5 w-5 ${tc.textMuted}`} />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${tc.input}`}
                placeholder="John Doe"
                required
                disabled={onboardLoading}
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${tc.textSecondary}`}>
              Mobile number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DevicePhoneMobileIcon className={`h-5 w-5 ${tc.textMuted}`} />
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={handlePhoneChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${tc.input}`}
                placeholder="10-digit number"
                pattern="[0-9]{10}"
                maxLength={10}
                disabled={onboardLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${tc.textSecondary}`}>
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className={`h-5 w-5 ${tc.textMuted}`} />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${tc.input} ${emailAvailable === false ? 'border-red-500' : emailAvailable === true ? 'border-green-500' : ''}`}
                placeholder="you@company.com"
                required
                disabled={onboardLoading}
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

          {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${tc.textSecondary}`}>
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className={`h-5 w-5 ${tc.textMuted}`} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${tc.input}`}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                disabled={onboardLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className={`h-5 w-5 ${tc.textMuted} hover:${tc.text}`} />
                ) : (
                  <EyeIcon className={`h-5 w-5 ${tc.textMuted} hover:${tc.text}`} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${tc.textSecondary}`}>
              Confirm password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className={`h-5 w-5 ${tc.textMuted}`} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 ${tc.input}`}
                placeholder="Re-enter password"
                required
                minLength={6}
                disabled={onboardLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className={`h-5 w-5 ${tc.textMuted} hover:${tc.text}`} />
                ) : (
                  <EyeIcon className={`h-5 w-5 ${tc.textMuted} hover:${tc.text}`} />
                )}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className={`block text-sm font-medium mb-1.5 ${tc.textSecondary}`}>
              Select role <span className="text-red-500">*</span>
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
                        : `border-gray-200 dark:border-gray-700 ${tc.bgTableHover}`
                    }`}
                    disabled={onboardLoading}
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
                          isSelected ? 'text-white' : tc.text
                        }`}>
                          {roleLabels[role]}
                        </div>
                        <div className={`text-xs ${
                          isSelected ? 'text-white/80' : tc.textMuted
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

          {/* Terms */}
          <div className="flex items-start">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
              disabled={onboardLoading}
            />
            <label className={`text-xs ${tc.textSecondary}`}>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={onboardLoading || emailAvailable === false || isCheckingEmail}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/30"
          >
            {onboardLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              <>
                <span>Onboard New Hire</span>
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardNewHireModal;