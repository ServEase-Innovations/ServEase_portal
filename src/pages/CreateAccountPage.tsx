import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import toast from 'react-hot-toast';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const CreateAccountPage = () => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { createAccount, loading, error, clearError, isAuthenticated } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      await createAccount({
        name: fullName,
        email,
        role,
        password
      });
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  const roleOptions = [
    { value: 'super-admin', label: 'Super Admin', icon: ShieldCheckIcon, color: 'purple' },
    { value: 'hr-partner', label: 'HR Partner', icon: BuildingOfficeIcon, color: 'blue' },
    { value: 'manager', label: 'Manager', icon: BriefcaseIcon, color: 'green' },
    { value: 'employee', label: 'Employee', icon: UserGroupIcon, color: 'orange' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Section - Features */}
        <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 md:p-12 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">ServEase</h1>
                <p className="text-xs text-indigo-200">INNOVATION PVT LTD</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4">Welcome to ServEase.</h2>
            <p className="text-indigo-200 text-sm mb-8">
              Sign in to your account or create a new one.
            </p>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">
                The ServEase employee portal.
              </h3>
              <p className="text-sm text-indigo-100">
                Sign in to your account, create a new one, or jump in with a one-click demo role.
              </p>

              <div className="space-y-2 mt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-indigo-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-indigo-100">Email & password sign-in</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-indigo-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-indigo-100">Role-based dashboards</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-indigo-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-indigo-100">2FA & OTP — ready when you are</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs text-indigo-300">
              © 2026 ServEase Innovation Private Limited
            </p>
          </div>
        </div>

        {/* Right Section - Create Account Form */}
        <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          <div className="max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Create account</h2>
            <p className="text-sm text-gray-500 mb-6">
              Sign in to your account or create a new one.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Jane Doe"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="10-digit number"
                    pattern="[0-9]{10}"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="you@company.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
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
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
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
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select your role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((option) => {
                    const isSelected = role === option.value;
                    const colorClasses = {
                      purple: 'border-purple-600 text-purple-600 bg-purple-50',
                      blue: 'border-blue-600 text-blue-600 bg-blue-50',
                      green: 'border-green-600 text-green-600 bg-green-50',
                      orange: 'border-orange-600 text-orange-600 bg-orange-50'
                    };
                    const borderClasses = {
                      purple: 'border-purple-200 hover:border-purple-400',
                      blue: 'border-blue-200 hover:border-blue-400',
                      green: 'border-green-200 hover:border-green-400',
                      orange: 'border-orange-200 hover:border-orange-400'
                    };
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRole(option.value as Role)}
                        className={`p-2 border-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                          isSelected 
                            ? colorClasses[option.color as keyof typeof colorClasses]
                            : `bg-white text-gray-700 ${borderClasses[option.color as keyof typeof borderClasses]}`
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={loading}
                />
                <label htmlFor="agreeTerms" className="text-xs text-gray-600">
                  I agree to the{' '}
                  <button type="button" className="text-indigo-600 hover:underline">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-indigo-600 hover:underline">
                    Privacy Policy
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
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
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;