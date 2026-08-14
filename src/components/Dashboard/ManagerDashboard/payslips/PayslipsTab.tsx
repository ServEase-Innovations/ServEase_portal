// components/payslips/PayslipsTab.tsx - Updated with API integration
import React, { useState, useMemo, useEffect } from 'react';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ChevronDownIcon,
  EyeIcon,
  CloudArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { ThemeClasses, Payslip } from '../types';
import { payslipService } from '../../../../services/api';
import moment from 'moment';
import toast from 'react-hot-toast';

interface PayslipsTabProps {
  tc: ThemeClasses;
  userRole: string;
  employeeId?: string;
}

const PayslipsTab: React.FC<PayslipsTabProps> = ({ tc, userRole, employeeId }) => {
  const currentDate = moment();
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month() + 1;

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedPayslip, setExpandedPayslip] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userRole === 'super-admin' || userRole === 'manager';
  const isSelf = !isAdmin;

  // Helper to build params
  const buildParams = (): { month?: number; year?: number } => {
    const params: { month?: number; year?: number } = {};
    const year = selectedYear !== 'all' ? Number(selectedYear) : undefined;
    const month = selectedMonth !== 'all' ? Number(selectedMonth) : undefined;
    if (month) params.month = month;
    if (year) params.year = year;
    return params;
  };

  // Helper to fetch payslips based on user role
  const fetchPayslipsByRole = async (params: { month?: number; year?: number }) => {
    if (isSelf) {
      // Employee/HR view - only approved/paid payslips
      const data = await payslipService.getMyPayslips(params);
      return data.payslips || [];
    } else if (employeeId) {
      // Admin viewing specific employee
      const result = await payslipService.getEmployeePayslips(employeeId, params);
      return result.payslips || [];
    } else {
      // Admin viewing all payslips
      const data = await payslipService.getAllPayslips(params);
      return data.payslips || [];
    }
  };

  // Fetch payslips
  useEffect(() => {
    fetchPayslips();
  }, [selectedYear, selectedMonth, isSelf, employeeId]);

  const fetchPayslips = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = buildParams();
      const payslipData = await fetchPayslipsByRole(params);
      setPayslips(payslipData);
    } catch (err: any) {
      console.error('Failed to fetch payslips:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load payslips';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate years from 2020 to current year
  const years = useMemo(() => {
    const yearList = [];
    for (let year = 2020; year <= currentYear; year++) {
      yearList.push(year.toString());
    }
    return yearList.reverse();
  }, [currentYear]);

  // Available months
  const availableMonths = useMemo(() => {
    const months = [
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' },
    ];

    if (selectedYear === currentYear.toString()) {
      return months.slice(0, currentMonth);
    }
    return months;
  }, [selectedYear, currentYear, currentMonth]);

  // Filter payslips
  const filteredPayslips = useMemo(() => {
    let filtered = payslips;

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(p => {
        const monthNum = new Date(p.generatedAt).getMonth() + 1;
        return monthNum.toString().padStart(2, '0') === selectedMonth;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.employeeNameSnapshot?.toLowerCase().includes(query) ||
        p.employeeId?.toLowerCase().includes(query) ||
        p.employeeDepartmentSnapshot?.toLowerCase().includes(query) ||
        p.payslipNumber?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [payslips, selectedMonth, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredPayslips.length;
    const generated = filteredPayslips.filter(p => p.status === 'Draft').length;
    const approved = filteredPayslips.filter(p => p.status === 'Approved').length;
    const paid = filteredPayslips.filter(p => p.status === 'Paid').length;

    const totalNet = filteredPayslips.reduce((sum, p) => {
      return sum + (typeof p.netSalary === 'number' ? p.netSalary : 0);
    }, 0);

    return { total, generated, approved, paid, totalNet };
  }, [filteredPayslips]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <ClockIcon className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'Approved':
        return <CheckCircleIcon className="w-4 h-4 text-emerald-400" />;
      case 'Paid':
        return <CheckCircleIcon className="w-4 h-4 text-blue-400" />;
      case 'Cancelled':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Approved':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Paid':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'Generated';
      case 'Approved':
        return 'Approved';
      case 'Paid':
        return 'Paid';
      case 'Cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleDownload = async (payslip: Payslip) => {
    try {
      const month = new Date(payslip.generatedAt).getMonth() + 1;
      const year = new Date(payslip.generatedAt).getFullYear();

      const blob = await payslipService.downloadPayslipPdf(
        payslip.employeeId,
        month,
        year
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${payslip.payslipNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove(); // Use remove() instead of removeChild()
      window.URL.revokeObjectURL(url);

      toast.success('Payslip downloaded successfully');
    } catch (error: any) {
      console.error('Failed to download payslip:', error);
      const errorMsg = error.response?.data?.message || 'Failed to download payslip';
      toast.error(errorMsg);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedPayslip(expandedPayslip === id ? null : id);
  };

  const formatCurrency = (value: number, currency: string = 'INR') => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
      }).format(value);
    } catch {
      return `₹${value.toFixed(2)}`;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${tc.bgCard} p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
        <ArrowPathIcon className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
        <p className={`text-sm ${tc.textSecondary}`}>Loading payslips...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${tc.bgCard} p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
        <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-400" />
        </div>
        <h3 className={`text-lg font-semibold ${tc.text}`}>Failed to Load Payslips</h3>
        <p className={`text-sm ${tc.textSecondary} mt-2`}>{error}</p>
        <button
          onClick={fetchPayslips}
          className="mt-4 px-6 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h4 className={`text-xs sm:text-sm ${tc.textSecondary}`}>Total Payslips</h4>
              <DocumentTextIcon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${tc.text} mt-1`}>{stats.total}</p>
            <p className={`text-[10px] sm:text-xs ${tc.textMuted}`}>Available for download</p>
          </div>
        </div>

        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h4 className={`text-xs sm:text-sm ${tc.textSecondary}`}>Draft</h4>
              <ClockIcon className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
            </div>
            <p className={`text-xl sm:text-2xl font-bold text-amber-400 mt-1`}>{stats.generated}</p>
            <p className={`text-[10px] sm:text-xs ${tc.textMuted}`}>Awaiting approval</p>
          </div>
        </div>

        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h4 className={`text-xs sm:text-sm ${tc.textSecondary}`}>Approved</h4>
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className={`text-xl sm:text-2xl font-bold text-emerald-400 mt-1`}>{stats.approved}</p>
            <p className={`text-[10px] sm:text-xs ${tc.textMuted}`}>Ready to download</p>
          </div>
        </div>

        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h4 className={`text-xs sm:text-sm ${tc.textSecondary}`}>Paid</h4>
              <CheckCircleIcon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className={`text-xl sm:text-2xl font-bold text-blue-400 mt-1`}>{stats.paid}</p>
            <p className={`text-[10px] sm:text-xs ${tc.textMuted}`}>Payment completed</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} transition-all duration-300 hover:shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -mr-24 -mt-24 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Year Dropdown */}
              <div className="relative flex-1 sm:flex-none min-w-[140px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={`w-full pl-9 pr-8 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none font-medium`}
                >
                  <option value="all">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year} {year === currentYear.toString() ? '⭐' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Month Dropdown */}
              <div className="relative flex-1 sm:flex-none min-w-[150px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={`w-full pl-9 pr-8 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none font-medium`}
                >
                  <option value="all">All Months</option>
                  {availableMonths.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Search Input */}
              <div className="relative flex-1 sm:flex-none min-w-[200px]">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  type="text"
                  placeholder="🔍 Search by name, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? tc.statusActiveBtn : tc.statusInactiveBtn}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" strokeWidth="2" rx="1" />
                  <rect x="14" y="3" width="7" height="7" strokeWidth="2" rx="1" />
                  <rect x="3" y="14" width="7" height="7" strokeWidth="2" rx="1" />
                  <rect x="14" y="14" width="7" height="7" strokeWidth="2" rx="1" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'list' ? tc.statusActiveBtn : tc.statusInactiveBtn}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
                  <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
                  <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 flex items-center justify-between">
            <span className={`text-sm ${tc.textSecondary} flex items-center gap-2`}>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tc.badge}`}>
                {filteredPayslips.length}
              </span>
              payslip{filteredPayslips.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      </div>

      {/* Payslips Display */}
      {filteredPayslips.length === 0 ? (
        <div className={`${tc.bgCard} p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center transition-all duration-300 hover:shadow-lg`}>
          <div className="w-20 h-20 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <DocumentTextIcon className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className={`text-lg font-semibold ${tc.text}`}>No Payslips Found</h3>
          <p className={`text-sm ${tc.textSecondary} mt-2`}>
            {searchQuery || selectedYear !== 'all' || selectedMonth !== 'all'
              ? 'Try adjusting your filters or search criteria'
              : 'No payslips available for the selected period'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPayslips.map((payslip, index) => {
            const isCurrent = new Date(payslip.generatedAt).getFullYear() === currentYear &&
              new Date(payslip.generatedAt).getMonth() + 1 === currentMonth;
            const canDownload = payslip.status === 'Approved' || payslip.status === 'Paid';

            return (
              <div
                key={payslip.payslipId}
                className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group animate-fadeIn ${isCurrent ? 'ring-2 ring-emerald-500/50' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${isCurrent ? 'from-emerald-500 to-emerald-600' : 'from-indigo-500 to-purple-600'} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${isCurrent ? 'shadow-emerald-500/25' : 'shadow-indigo-500/25'} group-hover:scale-110 transition-transform`}>
                        {(() => {
                          let month, year;
                          
                          // Method 1: From payrollRun object (preferred)
                          if (payslip.payrollRun?.payrollMonth && payslip.payrollRun?.payrollYear) {
                            month = payslip.payrollRun.payrollMonth;
                            year = payslip.payrollRun.payrollYear;
                          }
                          // Method 2: From payslip number - PS-YYYYMM-X format
                          else if (payslip.payslipNumber) {
                            const match = payslip.payslipNumber.match(/PS-(\d{4})(\d{2})-/);
                            if (match) {
                              year = parseInt(match[1]);
                              month = parseInt(match[2]);
                            }
                          }
                          
                          // Display proper month
                          if (month && year) {
                            return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
                          }
                          
                          // Fallback: use generatedAt
                          return new Date(payslip.generatedAt).toLocaleString('default', { month: 'short' });
                        })()}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${tc.text} text-sm`}>
                          {(() => {
                            let month, year;
                            
                            // Method 1: From payrollRun object (preferred)
                            if (payslip.payrollRun?.payrollMonth && payslip.payrollRun?.payrollYear) {
                              month = payslip.payrollRun.payrollMonth;
                              year = payslip.payrollRun.payrollYear;
                            }
                            // Method 2: From payslip number - PS-YYYYMM-X format
                            else if (payslip.payslipNumber) {
                              const match = payslip.payslipNumber.match(/PS-(\d{4})(\d{2})-/);
                              if (match) {
                                year = parseInt(match[1]);
                                month = parseInt(match[2]);
                              }
                            }
                            
                            // Display proper month and year
                            if (month && year) {
                              const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
                              return `${monthName} ${year}`;
                            }
                            
                            // Fallback: use generatedAt
                            const fallbackDate = new Date(payslip.generatedAt);
                            return `${fallbackDate.toLocaleString('default', { month: 'long' })} ${fallbackDate.getFullYear()}`;
                          })()}
                        </h4>
                        <p className={`text-xs ${tc.textMuted}`}>#{payslip.payslipNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-medium border border-emerald-500/30">
                          Current
                        </span>
                      )}
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(payslip.status)} flex items-center gap-1 border`}>
                        {getStatusIcon(payslip.status)}
                        {getStatusLabel(payslip.status)}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Employee</span>
                      <span className={`font-medium ${tc.text}`}>{payslip.employeeNameSnapshot}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Department</span>
                      <span className={`text-xs ${tc.textMuted}`}>{payslip.employeeDepartmentSnapshot}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Paid On</span>
                      <span className={`text-xs ${tc.textMuted}`}>
                        {payslip.paidAt ? new Date(payslip.paidAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className={`mt-3 pt-3 ${tc.border} border-t grid grid-cols-2 gap-2`}>
                    <div className={`p-2 rounded-lg ${tc.bgInput}`}>
                      <p className={`text-[10px] ${tc.textMuted}`}>Gross</p>
                      <p className={`text-sm font-bold ${tc.text}`}>
                        {formatCurrency(payslip.totalEarnings, payslip.currency)}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10`}>
                      <p className={`text-[10px] ${tc.textMuted}`}>Net</p>
                      <p className={`text-sm font-bold text-emerald-400`}>
                        {formatCurrency(payslip.netSalary, payslip.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(payslip.payslipId)}
                      className={`flex-1 px-3 py-1.5 ${tc.border} ${tc.textSecondary} rounded-xl text-xs font-medium hover:${tc.bgCardHover} transition-all duration-300 flex items-center justify-center gap-1`}
                    >
                      <EyeIcon className="w-3 h-3" />
                      {expandedPayslip === payslip.payslipId ? 'Hide' : 'Preview'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(payslip)}
                      disabled={!canDownload}
                      className={`flex-1 px-3 py-1.5 bg-gradient-to-r ${isCurrent ? 'from-emerald-500 to-emerald-600' : 'from-indigo-500 to-indigo-600'} text-white rounded-xl text-xs font-medium hover:from-${isCurrent ? 'emerald' : 'indigo'}-600 hover:to-${isCurrent ? 'emerald' : 'indigo'}-700 transition-all duration-300 shadow-lg ${isCurrent ? 'shadow-emerald-500/25' : 'shadow-indigo-500/25'} flex items-center justify-center gap-1 ${!canDownload ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                      <CloudArrowDownIcon className="w-3 h-3" />
                      Download
                    </button>
                  </div>

                  {/* Expandable Preview */}
                  {expandedPayslip === payslip.payslipId && (
                    <div className={`mt-3 pt-3 ${tc.border} border-t ${tc.bgInput} rounded-xl p-3 animate-slideDown`}>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className={tc.textMuted}>Generated On</span>
                          <span className={tc.text}>{new Date(payslip.generatedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={tc.textMuted}>Working Days</span>
                          <span className={tc.text}>{payslip.workingDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={tc.textMuted}>Payable Days</span>
                          <span className={tc.text}>{payslip.payableDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={tc.textMuted}>Unpaid Leave</span>
                          <span className={tc.text}>{payslip.unpaidLeaveDays}</span>
                        </div>
                        {payslip.earnings && payslip.earnings.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <p className={`text-[10px] font-medium ${tc.textMuted} mb-1`}>Earnings</p>
                            {payslip.earnings.map((earning) => (
                              <div key={earning.earningType} className="flex justify-between text-xs">
                                <span className={tc.textMuted}>{earning.earningType}</span>
                                <span className={tc.text}>{formatCurrency(Number(earning.amount), payslip.currency)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden transition-all duration-300 hover:shadow-lg`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Gross</th>
                  <th className="px-4 py-3 font-medium">Net</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayslips.map((payslip, index) => {
                  const isCurrent = new Date(payslip.generatedAt).getFullYear() === currentYear &&
                    new Date(payslip.generatedAt).getMonth() + 1 === currentMonth;
                  const canDownload = payslip.status === 'Approved' || payslip.status === 'Paid';

                  return (
                    <tr
                      key={payslip.payslipId}
                      className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-all duration-300 hover:bg-opacity-50 animate-fadeIn ${isCurrent ? 'bg-emerald-500/5' : ''}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 bg-gradient-to-br ${isCurrent ? 'from-emerald-500 to-emerald-600' : 'from-indigo-500 to-purple-600'} rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg ${isCurrent ? 'shadow-emerald-500/25' : 'shadow-indigo-500/25'}`}>
                            {(() => {
                              let month, year;
                              
                              // Method 1: From payrollRun object (preferred)
                              if (payslip.payrollRun?.payrollMonth && payslip.payrollRun?.payrollYear) {
                                month = payslip.payrollRun.payrollMonth;
                                year = payslip.payrollRun.payrollYear;
                              }
                              // Method 2: From payslip number - PS-YYYYMM-X format
                              else if (payslip.payslipNumber) {
                                const match = payslip.payslipNumber.match(/PS-(\d{4})(\d{2})-/);
                                if (match) {
                                  year = parseInt(match[1]);
                                  month = parseInt(match[2]);
                                }
                              }
                              
                              // Display proper month
                              if (month && year) {
                                return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
                              }
                              
                              // Fallback: use generatedAt
                              return new Date(payslip.generatedAt).toLocaleString('default', { month: 'short' });
                            })()}
                          </div>
                          <div>
                            <span className={`font-medium ${tc.text} text-sm`}>
                              {(() => {
                                let month, year;
                                
                                // Method 1: From payrollRun object (preferred)
                                if (payslip.payrollRun?.payrollMonth && payslip.payrollRun?.payrollYear) {
                                  month = payslip.payrollRun.payrollMonth;
                                  year = payslip.payrollRun.payrollYear;
                                }
                                // Method 2: From payslip number - PS-YYYYMM-X format
                                else if (payslip.payslipNumber) {
                                  const match = payslip.payslipNumber.match(/PS-(\d{4})(\d{2})-/);
                                  if (match) {
                                    year = parseInt(match[1]);
                                    month = parseInt(match[2]);
                                  }
                                }
                                
                                // Display proper month and year
                                if (month && year) {
                                  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
                                  return `${monthName} ${year}`;
                                }
                                
                                // Fallback: use generatedAt
                                const fallbackDate = new Date(payslip.generatedAt);
                                return `${fallbackDate.toLocaleString('default', { month: 'long' })} ${fallbackDate.getFullYear()}`;
                              })()}
                            </span>
                            {isCurrent && (
                              <span className="ml-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-medium border border-emerald-500/30">
                                Current
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm ${tc.text}`}>{payslip.employeeNameSnapshot}</td>
                      <td className={`px-4 py-3 text-xs ${tc.textMuted}`}>{payslip.employeeDepartmentSnapshot}</td>
                      <td className={`px-4 py-3 text-sm font-medium ${tc.text}`}>
                        {formatCurrency(payslip.totalEarnings, payslip.currency)}
                      </td>
                      <td className={`px-4 py-3 text-sm font-bold text-emerald-400`}>
                        {formatCurrency(payslip.netSalary, payslip.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(payslip.status)} flex items-center gap-1 border w-fit`}>
                          {getStatusIcon(payslip.status)}
                          {getStatusLabel(payslip.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(payslip.payslipId)}
                            className={`p-1.5 rounded-lg ${tc.btnBg} transition-all hover:scale-110`}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(payslip)}
                            disabled={!canDownload}
                            className={`p-1.5 rounded-lg bg-gradient-to-r ${isCurrent ? 'from-emerald-500 to-emerald-600' : 'from-indigo-500 to-indigo-600'} text-white transition-all hover:scale-110 ${!canDownload ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <CloudArrowDownIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PayslipsTab;