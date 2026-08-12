// components/payslips/GeneratePayslip.tsx - Fixed version with proper date handling
import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlusIcon,
  CalendarIcon,
  UserGroupIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';
import { payslipService } from '../../../../services/api';
import { Employee } from '../types';
import toast from 'react-hot-toast';
import moment from 'moment';

interface GeneratePayslipProps {
  tc: ThemeClasses;
  userRole: string;
}

const GeneratePayslip: React.FC<GeneratePayslipProps> = ({ tc, userRole }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [generationResult, setGenerationResult] = useState<{
    success: boolean;
    message: string;
    payslip?: any;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check if user has permission
  const canGenerate = userRole === 'super-admin' || userRole === 'manager';

  // Fetch employees on mount
  useEffect(() => {
    if (canGenerate) {
      fetchEmployees();
    }
  }, [canGenerate]);

  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const data = await payslipService.getAllEmployees();
      setEmployees(data.filter(emp => emp.isActive !== false));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    const query = searchTerm.toLowerCase();
    return employees.filter(
      emp =>
        emp.fullName.toLowerCase().includes(query) ||
        emp.employeeId.includes(query) ||
        emp.assignedDepartment?.toLowerCase().includes(query) ||
        emp.emailAddress?.toLowerCase().includes(query)
    );
  }, [employees, searchTerm]);

  // Generate months
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Generate years (2020 to current + 1)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let year = 2020; year <= currentYear + 1; year++) {
      yearList.push(year);
    }
    return yearList.reverse();
  }, []);

  // Get the last day of the selected month/year
  const getLastDayOfMonth = (month: number, year: number): string => {
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  };

  // Get the first day of the selected month/year
  const getFirstDayOfMonth = (month: number, year: number): string => {
    return `${year}-${String(month).padStart(2, '0')}-01`;
  };

  // Validate the date is within the payroll period
  const validateDate = (date: string, month: number, year: number): boolean => {
    const firstDay = getFirstDayOfMonth(month, year);
    const lastDay = getLastDayOfMonth(month, year);
    return date >= firstDay && date <= lastDay;
  };

  // Get default date based on selected month/year
  const getDefaultDate = (month: number, year: number): string => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // If selected month/year is current, use today's date (if within month)
    if (month === currentMonth && year === currentYear) {
      const todayStr = today.toISOString().split('T')[0];
      const lastDay = getLastDayOfMonth(month, year);
      // If today is past the last day, use the last day
      if (todayStr > lastDay) {
        return lastDay;
      }
      return todayStr;
    }

    // For past months, use the last day of the month (or a reasonable date)
    // Use a date that's well within the payroll period (e.g., 15th of the month)
    const midMonth = `${year}-${String(month).padStart(2, '0')}-15`;
    const lastDay = getLastDayOfMonth(month, year);
    
    // For very recent past months, use a mid-month date
    if (year === currentYear && month === currentMonth - 1) {
      return midMonth;
    }
    
    // For older months, use the 1st of the month (safe date)
    return getFirstDayOfMonth(month, year);
  };

  // Update date when month or year changes
  useEffect(() => {
    const defaultDate = getDefaultDate(selectedMonth, selectedYear);
    setSelectedDate(defaultDate);
    setValidationError(null);
  }, [selectedMonth, selectedYear]);

  // Validate date when it changes
  useEffect(() => {
    if (selectedDate) {
      const isValid = validateDate(selectedDate, selectedMonth, selectedYear);
      if (!isValid) {
        const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
        const lastDay = getLastDayOfMonth(selectedMonth, selectedYear);
        setValidationError(`Date must be between ${firstDay} and ${lastDay}`);
      } else {
        setValidationError(null);
      }
    }
  }, [selectedDate, selectedMonth, selectedYear]);

  const handleGenerate = async () => {
    if (!selectedEmployeeId) {
      toast.error('Please select an employee');
      return;
    }

    // Validate date before submitting
    if (!validateDate(selectedDate, selectedMonth, selectedYear)) {
      const lastDay = getLastDayOfMonth(selectedMonth, selectedYear);
      toast.error(`Please select a date within the payroll period (up to ${lastDay})`);
      return;
    }

    setIsLoading(true);
    setGenerationResult(null);

    try {
      const payload = {
        employeeId: selectedEmployeeId,
        date: selectedDate,
        month: selectedMonth,
        year: selectedYear,
      };

      console.log('Generating payslip with payload:', payload);

      const result = await payslipService.generatePayslip(payload);

      setGenerationResult({
        success: true,
        message: result.message || 'Payslip generated successfully!',
        payslip: result.payslip,
      });

      toast.success('Payslip generated successfully!');
    } catch (error: any) {
      console.error('Generation error:', error);
      
      let errorMessage = error.response?.data?.message || 'Failed to generate payslip';
      
      // Provide more helpful error messages
      if (errorMessage.includes('falls after the payroll period end')) {
        const lastDay = getLastDayOfMonth(selectedMonth, selectedYear);
        errorMessage = `The selected date (${selectedDate}) is after the payroll period end (${lastDay}). Please select a date on or before ${lastDay}.`;
      }
      
      setGenerationResult({
        success: false,
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedEmployee = () => {
    return employees.find(emp => emp.employeeId === selectedEmployeeId);
  };

  const selectedEmployee = getSelectedEmployee();

  // Get month name for display
  const getMonthName = (month: number) => {
    return months.find(m => m.value === month)?.label || '';
  };

  if (!canGenerate) {
    return (
      <div className={`${tc.bgCard} p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
        <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-400" />
        </div>
        <h3 className={`text-lg font-semibold ${tc.text}`}>Access Denied</h3>
        <p className={`text-sm ${tc.textSecondary} mt-2`}>
          You don't have permission to generate payslips.
          <br />
          This feature is available for Managers and Super Admins only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <UserPlusIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${tc.text}`}>Generate Payslip</h2>
            <p className={`text-sm ${tc.textSecondary}`}>
              Generate a payslip for an employee for a specific month and year.
              <span className="block text-xs text-indigo-400/70 mt-1">
                Available for Super Admin and Manager roles
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Generation Form */}
      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Selection */}
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${tc.textSecondary} mb-2`}>
              Select Employee <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                <UserGroupIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search by name, ID, department, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              />
            </div>
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/10">
              {isLoadingEmployees ? (
                <div className="flex items-center justify-center py-8">
                  <ArrowPathIcon className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  {searchTerm ? 'No employees match your search' : 'No employees found'}
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <button
                    key={employee.employeeId}
                    onClick={() => {
                      setSelectedEmployeeId(employee.employeeId);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-white/5 ${
                      selectedEmployeeId === employee.employeeId
                        ? 'bg-indigo-500/20 border-l-2 border-indigo-400'
                        : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                      {employee.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${tc.text}`}>{employee.fullName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>ID: {employee.employeeId}</span>
                        <span>•</span>
                        <span>{employee.assignedDepartment || 'N/A'}</span>
                        <span>•</span>
                        <span className="text-indigo-400">{employee.assignedRole}</span>
                      </div>
                    </div>
                    {selectedEmployeeId === employee.employeeId && (
                      <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Month Selection */}
          <div>
            <label className={`block text-sm font-medium ${tc.textSecondary} mb-2`}>
              Month <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className={`w-full pl-10 pr-8 py-3 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none`}
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Year Selection */}
          <div>
            <label className={`block text-sm font-medium ${tc.textSecondary} mb-2`}>
              Year <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={`w-full pl-10 pr-8 py-3 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none`}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Date Input */}
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${tc.textSecondary} mb-2`}>
              Effective Date <span className="text-red-400">*</span>
              <span className="block text-xs text-gray-400 mt-0.5">
                Must be between {getFirstDayOfMonth(selectedMonth, selectedYear)} and {getLastDayOfMonth(selectedMonth, selectedYear)}
              </span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getFirstDayOfMonth(selectedMonth, selectedYear)}
                max={getLastDayOfMonth(selectedMonth, selectedYear)}
                className={`w-full pl-10 pr-4 py-3 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                  validationError ? 'border-red-500/50 ring-2 ring-red-500/50' : ''
                }`}
              />
            </div>
            {validationError && (
              <p className="text-xs text-red-400 mt-1">{validationError}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              💡 Using {getMonthName(selectedMonth)} {selectedYear}, {getFirstDayOfMonth(selectedMonth, selectedYear)} to {getLastDayOfMonth(selectedMonth, selectedYear)}
            </p>
          </div>
        </div>

        {/* Selected Employee Preview */}
        {selectedEmployee && (
          <div className={`mt-6 p-4 rounded-xl ${tc.bgInput} border border-indigo-500/20`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {selectedEmployee.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className={`font-semibold ${tc.text}`}>{selectedEmployee.fullName}</h4>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs">
                    {selectedEmployee.assignedRole}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>{selectedEmployee.assignedDepartment || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>{selectedEmployee.emailAddress || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>ID: {selectedEmployee.employeeId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !selectedEmployeeId || !!validationError}
            className={`w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-5 h-5" />
                Generate Payslip
              </>
            )}
          </button>
          <span className={`text-xs ${tc.textMuted}`}>
            {!selectedEmployeeId
              ? 'Please select an employee first'
              : validationError
              ? validationError
              : `Generating for ${selectedEmployee?.fullName || 'selected employee'} for ${getMonthName(selectedMonth)} ${selectedYear}`}
          </span>
        </div>
      </div>

      {/* Generation Result */}
      {generationResult && (
        <div
          className={`p-6 rounded-2xl border ${
            generationResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          } animate-fadeIn`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                generationResult.success
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {generationResult.success ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <XCircleIcon className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-semibold ${
                  generationResult.success ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {generationResult.success ? 'Success!' : 'Failed'}
              </h4>
              <p className={`text-sm ${tc.textSecondary} mt-1 whitespace-pre-wrap`}>
                {generationResult.message}
              </p>

              {generationResult.success && generationResult.payslip && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className={`p-3 rounded-lg ${tc.bgInput}`}>
                    <p className={`text-xs ${tc.textMuted}`}>Payslip Number</p>
                    <p className={`text-sm font-medium ${tc.text}`}>
                      {generationResult.payslip.payslipNumber}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${tc.bgInput}`}>
                    <p className={`text-xs ${tc.textMuted}`}>Employee</p>
                    <p className={`text-sm font-medium ${tc.text}`}>
                      {generationResult.payslip.employeeNameSnapshot}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${tc.bgInput}`}>
                    <p className={`text-xs ${tc.textMuted}`}>Net Salary</p>
                    <p className={`text-sm font-bold text-emerald-400`}>
                      {generationResult.payslip.currency || '₹'}{' '}
                      {Number(generationResult.payslip.netSalary).toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${tc.bgInput}`}>
                    <p className={`text-xs ${tc.textMuted}`}>Status</p>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                      {generationResult.payslip.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className={`${tc.bgCard} p-4 rounded-xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm ${tc.textSecondary}`}>
              <span className="text-indigo-400 font-medium">Note:</span> Generating a payslip will
              create a new payslip for the selected employee for the specified month and year.
              The payslip will be in <span className="text-amber-400">Draft</span> status and can
              be edited by Super Admin or Manager before approval.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                Draft
              </span>
              <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                Approved
              </span>
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                Paid
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default GeneratePayslip;