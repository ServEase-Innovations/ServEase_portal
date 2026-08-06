// GeneratePayslipTab.tsx
import React, { useState } from 'react';
import {
  DocumentArrowDownIcon,
  CalendarIcon,
  UserIcon,
  IdentificationIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface GeneratePayslipData {
  employeeId: string;
  date: string;
  month: number;
  year: number;
}

interface GeneratePayslipTabProps {
  tc: any;
  generatePayslip: (data: GeneratePayslipData) => void;
}

const GeneratePayslipTab: React.FC<GeneratePayslipTabProps> = ({ tc, generatePayslip }) => {
  const [formData, setFormData] = useState<GeneratePayslipData>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'month' || name === 'year' ? parseInt(value) : value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    const parts = date.split('-');
    setFormData(prev => ({
      ...prev,
      date: date,
      year: parseInt(parts[0]),
      month: parseInt(parts[1])
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    // Validation
    if (!formData.employeeId || formData.employeeId.trim() === '') {
      setError('Please enter a valid Employee ID');
      setIsLoading(false);
      return;
    }

    if (!formData.date) {
      setError('Please select a date');
      setIsLoading(false);
      return;
    }

    try {
      // Call the generate payslip function
      await generatePayslip(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Failed to generate payslip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
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
    { value: 12, label: 'December' }
  ];

  return (
    <div className={`${tc.bgSecondary} rounded-xl shadow-lg p-6`}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${tc.text} flex items-center gap-3`}>
          <DocumentArrowDownIcon className="w-8 h-8 text-indigo-500" />
          Generate Payslip
        </h2>
        <p className={`${tc.textSecondary} text-sm mt-1`}>
          Generate and download payslip for any employee by entering their details
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              Payslip generated successfully!
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              The payslip has been downloaded to your device.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee ID */}
        <div className="space-y-1.5">
          <label className={`text-sm font-medium ${tc.text} flex items-center gap-2`}>
            <IdentificationIcon className="w-4 h-4 text-indigo-400" />
            Employee ID
          </label>
          <div className="relative">
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              placeholder="Enter employee ID (e.g., SE-118 or 42)"
              className={`
                w-full pl-4 pr-4 py-2.5 rounded-lg border 
                ${tc.border} ${tc.bg} ${tc.text}
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                transition-all duration-200
                placeholder:text-gray-400 dark:placeholder:text-gray-500
              `}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <UserIcon className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className={`text-xs ${tc.textSecondary} mt-1`}>
            Enter the employee ID to generate their payslip
          </p>
        </div>

        {/* Date Picker */}
        <div className="space-y-1.5">
          <label className={`text-sm font-medium ${tc.text} flex items-center gap-2`}>
            <CalendarIcon className="w-4 h-4 text-indigo-400" />
            Select Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleDateChange}
            className={`
              w-full pl-4 pr-4 py-2.5 rounded-lg border 
              ${tc.border} ${tc.bg} ${tc.text}
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              transition-all duration-200
            `}
          />
          <p className={`text-xs ${tc.textSecondary} mt-1`}>
            Select the date to determine the payslip period
          </p>
        </div>

        {/* Month and Year Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={`text-sm font-medium ${tc.text} flex items-center gap-2`}>
              Month
            </label>
            <select
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              className={`
                w-full pl-4 pr-10 py-2.5 rounded-lg border 
                ${tc.border} ${tc.bg} ${tc.text}
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                transition-all duration-200 appearance-none
              `}
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={`text-sm font-medium ${tc.text} flex items-center gap-2`}>
              Year
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className={`
                w-full pl-4 pr-10 py-2.5 rounded-lg border 
                ${tc.border} ${tc.bg} ${tc.text}
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                transition-all duration-200 appearance-none
              `}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Card */}
        <div className={`p-4 rounded-lg ${tc.bg} border ${tc.border}`}>
          <h4 className={`text-xs font-semibold ${tc.textSecondary} uppercase tracking-wider mb-2`}>
            Payslip Summary
          </h4>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className={tc.textSecondary}>Employee ID</span>
              <span className={`font-medium ${tc.text}`}>
                {formData.employeeId || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={tc.textSecondary}>Period</span>
              <span className={`font-medium ${tc.text}`}>
                {months.find(m => m.value === formData.month)?.label || ''} {formData.year}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={tc.textSecondary}>Date</span>
              <span className={`font-medium ${tc.text}`}>
                {formData.date ? new Date(formData.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'Not selected'}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white
            bg-gradient-to-r from-indigo-600 to-purple-600
            hover:from-indigo-700 hover:to-purple-700
            focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50
            transition-all duration-300 transform hover:scale-[1.02]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            flex items-center justify-center gap-2
            shadow-lg shadow-indigo-500/25
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <DocumentArrowDownIcon className="w-5 h-5" />
              Generate & Download Payslip
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t ${tc.border}">
        <p className={`text-xs ${tc.textSecondary} text-center`}>
          💡 The payslip will be generated in PDF format and downloaded automatically
        </p>
      </div>
    </div>
  );
};

export default GeneratePayslipTab;