// src/components/HR/OnboardNewHireModal.tsx - Responsive version
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
  UserGroupIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  BanknotesIcon,
  CurrencyRupeeIcon
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

// Department options matching backend
const departments = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'DevOps',
  'Quality Assurance',
  'Operations',
  'Legal',
  'Administration'
];

// Role options mapping to backend roles
const employeeRoleOptions: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  'SuperAdmin': { 
    label: 'Super Admin', 
    description: 'Full system access',
    icon: <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
  },
  'HR': { 
    label: 'HR Partner', 
    description: 'HR management',
    icon: <BuildingOfficeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
  },
  'Manager': { 
    label: 'Manager', 
    description: 'Team management',
    icon: <BriefcaseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
  },
  'Developer': { 
    label: 'Developer', 
    description: 'Software development',
    icon: <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5" />
  },
  'Marketing': { 
    label: 'Marketing', 
    description: 'Marketing & Growth',
    icon: <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
  },
  'CustomStaff': { 
    label: 'Custom Staff', 
    description: 'Specialized role',
    icon: <BuildingOffice2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
  },
};

const roleGradients: Record<string, string> = {
  'SuperAdmin': 'from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/20',
  'HR': 'from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/20',
  'Manager': 'from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20',
  'Developer': 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/20',
  'Marketing': 'from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/20',
  'CustomStaff': 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/20',
};

const roleBgColors: Record<string, string> = {
  'SuperAdmin': 'bg-indigo-50 dark:bg-indigo-900/20',
  'HR': 'bg-cyan-50 dark:bg-cyan-900/20',
  'Manager': 'bg-emerald-50 dark:bg-emerald-900/20',
  'Developer': 'bg-blue-50 dark:bg-blue-900/20',
  'Marketing': 'bg-amber-50 dark:bg-amber-900/20',
  'CustomStaff': 'bg-purple-50 dark:bg-purple-900/20',
};

const roleSelectedBg: Record<string, string> = {
  'SuperAdmin': 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30',
  'HR': 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-200/50 dark:shadow-cyan-900/30',
  'Manager': 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30',
  'Developer': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30',
  'Marketing': 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30',
  'CustomStaff': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30',
};

const OnboardNewHireModal: React.FC<OnboardNewHireModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  theme 
}) => {
  // Form state - matching backend schema
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('Developer');
  const [selectedDepartment, setSelectedDepartment] = useState('Engineering');
  const [baseSalary, setBaseSalary] = useState('60000');
  const [allowances, setAllowances] = useState('5000');
  const [deductions, setDeductions] = useState('1000');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [onboardLoading, setOnboardLoading] = useState(false);

  // Refs for debounce
  const emailTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { createAccount } = useAuth();

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
        scrollbar: 'scrollbar-thumb-white/10 scrollbar-track-transparent',
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
      scrollbar: 'scrollbar-thumb-gray-200 scrollbar-track-transparent',
    };
  };

  const tc = getThemeClasses();

  // Check email uniqueness with debounce
  const checkEmailUniqueness = async (emailValue: string) => {
    const trimmedEmail = emailValue.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    setIsCheckingEmail(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current);
    }
    
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

  // Handle salary input - only allow numbers
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const value = e.target.value.replace(/\D/g, '');
    setter(value);
  };

  // Handle Onboard New Hire - matching backend schema
  const handleOnboardNewHire = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedFullName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      toast.error('Please fill in all required fields');
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
      const payload = {
        name: trimmedFullName,
        email: trimmedEmail,
        role: selectedRole as any,
        password: trimmedPassword,
        confirmPassword: trimmedConfirmPassword,
        mobileNumber: mobileNumber.trim() || undefined,
        department: selectedDepartment,
        baseSalary: parseFloat(baseSalary) || 0,
        allowances: parseFloat(allowances) || 0,
        deductions: parseFloat(deductions) || 0,
      };

      await createAccount(payload);

      toast.success(`${trimmedFullName} has been onboarded successfully!`);
      
      // Reset form
      setFullName('');
      setEmail('');
      setMobileNumber('');
      setPassword('');
      setConfirmPassword('');
      setSelectedRole('Developer');
      setSelectedDepartment('Engineering');
      setBaseSalary('60000');
      setAllowances('5000');
      setDeductions('1000');
      setAgreeTerms(false);
      setEmailAvailable(null);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error('Onboarding error:', err);
    } finally {
      setOnboardLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl ${tc.bgCard} ${tc.border} ${tc.shadow} p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${tc.scrollbar} scrollbar-thin`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h2 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Onboard New Hire</h2>
            <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>Create a new employee account</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-xl ${tc.bgTableHover} transition-colors flex-shrink-0`}
            aria-label="Close modal"
          >
            <XCircleIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${tc.textMuted}`} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleOnboardNewHire} className="space-y-3 sm:space-y-4">
          {/* Full Name */}
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Full name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base ${tc.input}`}
                placeholder="John Doe"
                required
                disabled={onboardLoading}
                aria-label="Full name"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Mobile number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DevicePhoneMobileIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={handlePhoneChange}
                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base ${tc.input}`}
                placeholder="10-digit number"
                pattern="[0-9]{10}"
                maxLength={10}
                disabled={onboardLoading}
                aria-label="Mobile number"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base ${tc.input} ${emailAvailable === false ? 'border-red-500' : emailAvailable === true ? 'border-green-500' : ''}`}
                placeholder="you@company.com"
                required
                disabled={onboardLoading}
                aria-label="Email address"
              />
              {isCheckingEmail && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {!isCheckingEmail && emailAvailable === true && email.trim() && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" aria-hidden="true" />
                </div>
              )}
              {!isCheckingEmail && emailAvailable === false && email.trim() && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-red-500 text-[10px] sm:text-xs font-medium">Email taken</span>
                </div>
              )}
            </div>
            {emailAvailable === false && email.trim() && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1">This email is already registered</p>
            )}
            {emailAvailable === true && email.trim() && (
              <p className="text-green-500 text-[10px] sm:text-xs mt-1">Email is available</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base ${tc.input}`}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                disabled={onboardLoading}
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted} hover:${tc.text}`} aria-hidden="true" />
                ) : (
                  <EyeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted} hover:${tc.text}`} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Confirm password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base ${tc.input}`}
                placeholder="Re-enter password"
                required
                minLength={6}
                disabled={onboardLoading}
                aria-label="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted} hover:${tc.text}`} aria-hidden="true" />
                ) : (
                  <EyeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted} hover:${tc.text}`} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2 sm:space-y-3">
            <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Select role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {Object.entries(employeeRoleOptions).map(([roleKey, roleInfo]) => {
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setSelectedRole(roleKey)}
                    className={`relative p-2 sm:p-3 border-2 rounded-xl transition-all duration-300 text-left ${
                      isSelected
                        ? roleSelectedBg[roleKey]
                        : `border-gray-200 dark:border-gray-700 ${tc.bgTableHover}`
                    }`}
                    disabled={onboardLoading}
                    aria-label={`Select ${roleInfo.label} role`}
                    title={`Select ${roleInfo.label} role`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : `bg-gradient-to-br ${roleGradients[roleKey]} ${roleBgColors[roleKey]}`
                      }`}>
                        {roleInfo.icon}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs sm:text-sm font-semibold ${
                          isSelected ? 'text-white' : tc.text
                        } truncate`}>
                          {roleInfo.label}
                        </div>
                        <div className={`text-[8px] sm:text-xs ${
                          isSelected ? 'text-white/80' : tc.textMuted
                        } truncate`}>
                          {roleInfo.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                        <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-md" aria-hidden="true" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Department <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BuildingOfficeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
              </div>
              <select
                id="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base ${tc.input}`}
                required
                disabled={onboardLoading}
                aria-label="Select department"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Salary Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
                Base Salary
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyRupeeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={baseSalary}
                  onChange={(e) => handleSalaryChange(e, setBaseSalary)}
                  className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base ${tc.input}`}
                  placeholder="60000"
                  disabled={onboardLoading}
                  aria-label="Base salary"
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
                Allowances
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyRupeeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={allowances}
                  onChange={(e) => handleSalaryChange(e, setAllowances)}
                  className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base ${tc.input}`}
                  placeholder="5000"
                  disabled={onboardLoading}
                  aria-label="Allowances"
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
                Deductions
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyRupeeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={deductions}
                  onChange={(e) => handleSalaryChange(e, setDeductions)}
                  className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base ${tc.input}`}
                  placeholder="1000"
                  disabled={onboardLoading}
                  aria-label="Deductions"
                />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 sm:mt-1 mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 flex-shrink-0"
              disabled={onboardLoading}
              aria-label="Agree to terms and conditions"
            />
            <label className={`text-[10px] sm:text-xs ${tc.textSecondary}`}>
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
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/30"
          >
            {onboardLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              <>
                <span>Onboard New Hire</span>
                <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardNewHireModal;