// src/components/HR/OnboardNewHireModal.tsx - Responsive version with First Name & Last Name
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
  CurrencyRupeeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { Role, BackendRole } from '../types';
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

// Role options mapping to backend roles - ALL roles available for onboarding.
// 'CustomStaff' is relabeled "Other" and always ordered last in the dropdown.
const employeeRoleOptions: Record<string, { label: string; description: string; icon: React.ReactNode; backendRole: BackendRole }> = {
  'SuperAdmin': {
    label: 'Super Admin',
    description: 'Full system access',
    icon: <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
    backendRole: 'SuperAdmin'
  },
  'HR': {
    label: 'HR Partner',
    description: 'HR management',
    icon: <BuildingOfficeIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
    backendRole: 'HR'
  },
  'Manager': {
    label: 'Manager',
    description: 'Team management',
    icon: <BriefcaseIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
    backendRole: 'Manager'
  },
  'Developer': {
    label: 'Developer',
    description: 'Software development',
    icon: <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
    backendRole: 'Developer'
  },
  'Marketing': {
    label: 'Marketing',
    description: 'Marketing & Growth',
    icon: <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
    backendRole: 'Marketing'
  },
  'CustomStaff': {
    label: 'Other',
    description: 'Specialized / custom role',
    icon: <BuildingOffice2Icon className="w-4 h-4 sm:w-5 sm:h-5" />,
    backendRole: 'CustomStaff'
  },
};

// Guarantees "Other" renders last in the <select> regardless of object edits above.
const ROLE_KEYS_ORDERED = Object.keys(employeeRoleOptions).sort((a, b) => {
  if (a === 'CustomStaff') return 1;
  if (b === 'CustomStaff') return -1;
  return 0;
});

const roleAccent: Record<string, { chip: string; ring: string }> = {
  'SuperAdmin': { chip: 'bg-indigo-500', ring: 'focus:ring-indigo-400' },
  'HR': { chip: 'bg-cyan-500', ring: 'focus:ring-cyan-400' },
  'Manager': { chip: 'bg-emerald-500', ring: 'focus:ring-emerald-400' },
  'Developer': { chip: 'bg-blue-500', ring: 'focus:ring-blue-400' },
  'Marketing': { chip: 'bg-amber-500', ring: 'focus:ring-amber-400' },
  'CustomStaff': { chip: 'bg-fuchsia-500', ring: 'focus:ring-fuchsia-400' },
};

const OnboardNewHireModal: React.FC<OnboardNewHireModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  theme
}) => {
  // Form state - matching backend schema
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      toast.error('Please enter both first name and last name');
      return;
    }

    if (!trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
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
      // Combine first name and last name to create full name
      const fullName = `${trimmedFirstName} ${trimmedLastName}`.trim();

      // Get the backend role from the selected role
      const selectedRoleInfo = employeeRoleOptions[selectedRole];
      const backendRole = selectedRoleInfo.backendRole;

      // Create payload with the correct backend role
      const payload = {
        name: fullName,
        email: trimmedEmail,
        role: backendRole, // Send the backend role directly (SuperAdmin, HR, Manager, Developer, Marketing, CustomStaff)
        password: trimmedPassword,
        confirmPassword: trimmedConfirmPassword,
        mobileNumber: mobileNumber.trim() || undefined,
        department: selectedDepartment,
        baseSalary: parseFloat(baseSalary) || 0,
        allowances: parseFloat(allowances) || 0,
        deductions: parseFloat(deductions) || 0,
      };

      console.log('Onboarding payload:', payload);

      // Call createAccount with the payload
      await createAccount(payload);

      toast.success(`${fullName} has been onboarded successfully as ${selectedRoleInfo.label}!`);

      // Reset form
      setFirstName('');
      setLastName('');
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
      toast.error(err?.message || 'Failed to onboard new hire. Please try again.');
    } finally {
      setOnboardLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedRoleInfo = employeeRoleOptions[selectedRole];
  const selectedAccent = roleAccent[selectedRole];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border-4 border-black ${tc.bgCard} shadow-[10px_10px_0px_0px_rgba(0,0,0,0.85)] p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${tc.scrollbar} scrollbar-thin`}>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rotate-12 rounded-3xl bg-lime-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 -rotate-12 rounded-full bg-fuchsia-500/20 blur-2xl" />

        {/* Header banner */}
        <div className="relative overflow-hidden rounded-2xl border-4 border-black bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-700 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] px-4 sm:px-6 py-4 sm:py-5 mb-4 sm:mb-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-lime-300">
                <SparklesIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                New account
              </div>
              <h2 className="mt-2 text-lg sm:text-2xl font-black tracking-tight text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                Onboard New Hire
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100/90">Create a new employee account</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl border-2 border-black bg-white/90 hover:bg-white transition-colors flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]"
              aria-label="Close modal"
            >
              <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" aria-hidden="true" />
            </button>
          </div>
        </div>

        <form onSubmit={handleOnboardNewHire} className="space-y-3 sm:space-y-4 relative">
          {/* First Name & Last Name - Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
                First name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-black outline-none transition-all duration-200 text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] ${tc.input}`}
                  placeholder="John"
                  required
                  disabled={onboardLoading}
                  aria-label="First name"
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
                Last name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-black outline-none transition-all duration-200 text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] ${tc.input}`}
                  placeholder="Doe"
                  required
                  disabled={onboardLoading}
                  aria-label="Last name"
                />
              </div>
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
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
                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-black outline-none transition-all duration-200 text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] ${tc.input}`}
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
            <label className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-lime-400 outline-none transition-all duration-200 text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] ${tc.input} ${emailAvailable === false ? 'border-rose-500' : emailAvailable === true ? 'border-emerald-500' : 'border-black'}`}
                placeholder="you@company.com"
                required
                disabled={onboardLoading}
                aria-label="Email address"
              />
              {isCheckingEmail && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {!isCheckingEmail && emailAvailable === true && email.trim() && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" aria-hidden="true" />
                </div>
              )}
              {!isCheckingEmail && emailAvailable === false && email.trim() && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-rose-500 text-[10px] sm:text-xs font-bold">Email taken</span>
                </div>
              )}
            </div>
            {emailAvailable === false && email.trim() && (
              <p className="text-rose-500 text-[10px] sm:text-xs mt-1 font-medium">This email is already registered</p>
            )}
            {emailAvailable === true && email.trim() && (
              <p className="text-emerald-500 text-[10px] sm:text-xs mt-1 font-medium">Email is available</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-black outline-none transition-all duration-200 text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] ${tc.input}`}
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
            <label className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Confirm password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-black outline-none transition-all duration-200 text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] ${tc.input}`}
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

          {/* Role Selection — now a dropdown, "Other" always last */}
          <div>
            <label htmlFor="role" className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Select role <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {selectedRoleInfo.icon}
              </div>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-black rounded-xl outline-none transition-all duration-200 text-sm sm:text-base font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] cursor-pointer ${tc.input} ${selectedAccent.ring}`}
                required
                disabled={onboardLoading}
                aria-label="Select role"
              >
                {ROLE_KEYS_ORDERED.map((roleKey) => (
                  <option key={roleKey} value={roleKey}>
                    {employeeRoleOptions[roleKey].label}
                  </option>
                ))}
              </select>
            </div>
            {/* Live preview chip so the "crazy" color language still shows through */}
            <div className={`mt-2 inline-flex items-center gap-2 rounded-full border-2 border-black px-3 py-1 text-[10px] sm:text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] ${selectedAccent.chip}`}>
              {selectedRoleInfo.icon}
              {selectedRoleInfo.label} — {selectedRoleInfo.description}
            </div>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
              Department <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BuildingOfficeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${tc.textMuted}`} aria-hidden="true" />
              </div>
              <select
                id="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-black outline-none transition-all duration-200 text-sm sm:text-base font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] cursor-pointer ${tc.input}`}
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
              <label className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
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
                  className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-black outline-none transition-all duration-200 text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] ${tc.input}`}
                  placeholder="60000"
                  disabled={onboardLoading}
                  aria-label="Base salary"
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
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
                  className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-black outline-none transition-all duration-200 text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] ${tc.input}`}
                  placeholder="5000"
                  disabled={onboardLoading}
                  aria-label="Allowances"
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5 ${tc.textSecondary}`}>
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
                  className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-black rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-black outline-none transition-all duration-200 text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] ${tc.input}`}
                  placeholder="1000"
                  disabled={onboardLoading}
                  aria-label="Deductions"
                />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start rounded-xl border-2 border-black bg-amber-300/20 px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 sm:mt-1 mr-2 rounded border-2 border-black text-fuchsia-600 focus:ring-fuchsia-500 flex-shrink-0"
              disabled={onboardLoading}
              aria-label="Agree to terms and conditions"
            />
            <label className={`text-[10px] sm:text-xs ${tc.textSecondary}`}>
              I agree to the{' '}
              <button type="button" className="text-fuchsia-600 dark:text-fuchsia-400 hover:underline font-bold">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-fuchsia-600 dark:text-fuchsia-400 hover:underline font-bold">
                Privacy Policy
              </button>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={onboardLoading || emailAvailable === false || isCheckingEmail}
            className="w-full border-2 border-black bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 text-black py-2.5 sm:py-3 rounded-xl font-black text-sm sm:text-base transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            {onboardLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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