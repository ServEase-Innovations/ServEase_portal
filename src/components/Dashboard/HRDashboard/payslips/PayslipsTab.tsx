// src/pages/HRDashboard/components/payslips/PayslipsTab.tsx

import React, { useState, useMemo } from 'react';
import { 
  DocumentTextIcon, 
  ArrowUpTrayIcon, 
  ArrowUpIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ChevronDownIcon,
  EyeIcon,
  PrinterIcon,
  CloudArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  FireIcon,
  GiftIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';
import PayslipAutomation from './PayslipAutomation';
import moment from 'moment';

interface PayslipData {
  id: string;
  month: string;
  year: string;
  paidOn: string;
  gross: string;
  net: string;
  status: 'Generated' | 'Processing' | 'Pending';
  employeeName: string;
  employeeId: string;
  department: string;
}

interface PayslipsTabProps {
  tc: ThemeClasses;
  downloadPayslip: (month?: string, year?: string) => void;
  payslips: { month: string; paidOn: string; gross: string; net: string; }[];
  generatePayslipData: (employeeName?: string) => any;
}

const PayslipsTab: React.FC<PayslipsTabProps> = ({ tc, downloadPayslip, payslips, generatePayslipData }) => {
  const currentDate = moment();
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month() + 1; // 1-12
  const currentDay = currentDate.date();

  const [activeTab, setActiveTab] = useState<'payslips' | 'automation'>('payslips');
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedPayslip, setExpandedPayslip] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Generate years from 2020 to current year (past years only)
  const years = useMemo(() => {
    const yearList = [];
    for (let year = 2020; year <= currentYear; year++) {
      yearList.push(year.toString());
    }
    return yearList.reverse(); // Show latest first
  }, [currentYear]);

  // Generate months based on selected year
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
      { value: '12', label: 'December' }
    ];

    // If selected year is current year, only show months up to current month
    if (selectedYear === currentYear.toString()) {
      return months.slice(0, currentMonth);
    }
    
    // For past years, show all months
    return months;
  }, [selectedYear, currentYear, currentMonth]);

  // Helper function to extract month/year from payslip
  const extractPayslipPeriod = (payslip: any): { month: number; year: number } => {
    let month, year;
    
    // Method 1: From payrollRun object (preferred)
    if (payslip.payrollRun?.payrollMonth && payslip.payrollRun?.payrollYear) {
      month = payslip.payrollRun.payrollMonth;
      year = payslip.payrollRun.payrollYear;
    }
    // Method 2: From payslip number (fallback) - PS-YYYYMM-X format
    else if (payslip.payslipNumber) {
      const regex = /PS-(\d{4})(\d{2})-/;
      const match = regex.exec(payslip.payslipNumber);
      if (match) {
        year = Number.parseInt(match[1], 10);
        month = Number.parseInt(match[2], 10);
      }
    }
    // Method 3: From direct properties (fallback)
    else {
      month = payslip.month || currentMonth;
      year = payslip.year || currentYear;
    }
    
    return { month: month || currentMonth, year: year || currentYear };
  };

  // Helper function to map status
  const mapPayslipStatus = (status: string): 'Generated' | 'Processing' | 'Pending' => {
    if (status === 'Draft' || status === 'Paid') {
      return 'Generated';
    }
    return status as 'Generated' | 'Processing' | 'Pending';
  };

  // Helper function to process a single payslip
  const processPayslip = (payslip: any): PayslipData => {
    const { month, year } = extractPayslipPeriod(payslip);
    const monthName = new Date(year, (month || 1) - 1).toLocaleString('default', { month: 'long' });
    
    return {
      id: payslip.payslipId || payslip.id || `PS-${year}-${(month || 1).toString().padStart(2, '0')}`,
      month: `${monthName} ${year}`,
      year: year.toString(),
      paidOn: payslip.paidOn || payslip.generatedAt || new Date().toISOString().split('T')[0],
      gross: payslip.gross || `₹${(Number(payslip.totalEarnings || 0)).toLocaleString()}`,
      net: payslip.net || `₹${(Number(payslip.netSalary || 0)).toLocaleString()}`,
      status: mapPayslipStatus(payslip.status),
      employeeName: payslip.employeeName || payslip.employeeNameSnapshot || payslip.employee?.fullName || 'Employee',
      employeeId: payslip.employeeId || payslip.employee?.employeeId || 'EMP-001',
      department: payslip.department || payslip.employeeDepartmentSnapshot || payslip.employee?.assignedDepartment || 'Unknown'
    };
  };

  // Generate payslip data with actual API data
  const allPayslips: PayslipData[] = useMemo(() => {
    console.log('Raw payslips data:', payslips); // Debug log
    
    // Convert actual payslips from API to the expected format
    const actualPayslips = payslips.map(processPayslip);

    // Sort by year descending, then month descending
    return actualPayslips.sort((a, b) => {
      if (a.year !== b.year) return Number.parseInt(b.year, 10) - Number.parseInt(a.year, 10);
      // Parse month from the "Month YYYY" format
      const monthA = new Date(Date.parse(a.month + " 1")).getMonth();
      const monthB = new Date(Date.parse(b.month + " 1")).getMonth();
      return monthB - monthA;
    });
  }, [payslips, currentYear, currentMonth]);

  // Filter payslips based on year, month, and search
  const filteredPayslips = useMemo(() => {
    let filtered = allPayslips;

    // Filter by year
    if (selectedYear !== 'all') {
      filtered = filtered.filter(p => p.year === selectedYear);
    }

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(p => {
        const monthNum = new Date(p.month).getMonth() + 1;
        return monthNum.toString().padStart(2, '0') === selectedMonth;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.month.toLowerCase().includes(query) ||
        p.employeeName.toLowerCase().includes(query) ||
        p.employeeId.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allPayslips, selectedYear, selectedMonth, searchQuery]);

  // Check if current month payslip is available
  const isCurrentMonthAvailable = useMemo(() => {
    const currentMonthStr = currentMonth.toString().padStart(2, '0');
    return allPayslips.some(p => 
      p.year === currentYear.toString() && 
      new Date(p.month).getMonth() + 1 === currentMonth
    );
  }, [allPayslips, currentYear, currentMonth]);

  // Check if user can generate current month payslip (after 25th of month)
  const canGenerateCurrentMonth = useMemo(() => {
    return currentDay >= 25 && !isCurrentMonthAvailable;
  }, [currentDay, isCurrentMonthAvailable]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredPayslips.length;
    const generated = filteredPayslips.filter(p => p.status === 'Generated').length;
    const pending = filteredPayslips.filter(p => p.status === 'Pending').length;
    const processing = filteredPayslips.filter(p => p.status === 'Processing').length;
    
    const totalNet = filteredPayslips.reduce((sum, p) => {
      const netValue = parseInt(p.net.replace(/[₹,]/g, ''));
      return sum + (isNaN(netValue) ? 0 : netValue);
    }, 0);

    return { total, generated, pending, processing, totalNet };
  }, [filteredPayslips]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Generated': return <CheckCircleIcon className="w-4 h-4 text-emerald-400" />;
      case 'Processing': return <ClockIcon className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'Pending': return <ClockIcon className="w-4 h-4 text-blue-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Generated': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Processing': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleDownload = (payslip: PayslipData) => {
    setIsAnimating(true);
    setTimeout(() => {
      const month = new Date(payslip.month).getMonth() + 1;
      const year = payslip.year;
      downloadPayslip(month.toString().padStart(2, '0'), year);
      setIsAnimating(false);
    }, 300);
  };

  const handleGenerateCurrent = () => {
    const month = currentMonth.toString().padStart(2, '0');
    const year = currentYear.toString();
    downloadPayslip(month, year);
    setShowGenerateModal(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedPayslip(expandedPayslip === id ? null : id);
  };

  const formatCurrency = (value: string) => {
    return value;
  };

  // Get current month name
  const currentMonthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Navigation */}
      <div className={`${tc.bgCard} p-2 rounded-2xl ${tc.border} ${tc.shadow} flex gap-1`}>
        <button
          type="button"
          onClick={() => setActiveTab('payslips')}
          className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'payslips'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : `${tc.textSecondary} hover:${tc.bgCardHover}`
          }`}
        >
          <DocumentTextIcon className="w-4 h-4" />
          My Payslips
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('automation')}
          className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'automation'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
              : `${tc.textSecondary} hover:${tc.bgCardHover}`
          }`}
        >
          <CogIcon className="w-4 h-4" />
          Automation
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'automation' ? (
        <PayslipAutomation tc={tc} />
      ) : (
        <div className="space-y-4 sm:space-y-6">
      {/* Generate Current Month Payslip Banner */}
      {canGenerateCurrentMonth && (
        <div className={`bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 animate-fadeIn relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full -ml-8 -mb-8"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 animate-pulse">
                <GiftIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`font-semibold text-emerald-400 text-base sm:text-lg`}>
                  🎉 Generate Your {currentMonthName} Payslip
                </h3>
                <p className={`text-sm ${tc.textSecondary}`}>
                  Your payslip for {currentMonthName} {currentYear} is now ready for download
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                    Available from 25th
                  </span>
                  <span className="text-xs text-emerald-400/60">•</span>
                  <span className="text-xs text-emerald-400/60">Generated on {currentDate.format('DD MMM YYYY')}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateCurrent}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center gap-2 group whitespace-nowrap"
            >
              <CloudArrowDownIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Generate Now
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards with Animation */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h4 className={`text-xs sm:text-sm ${tc.textSecondary}`}>Generated</h4>
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className={`text-xl sm:text-2xl font-bold text-emerald-400 mt-1`}>{stats.generated}</p>
            <p className={`text-[10px] sm:text-xs ${tc.textMuted}`}>Ready to download</p>
          </div>
        </div>

        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h4 className={`text-xs sm:text-sm ${tc.textSecondary}`}>Processing</h4>
              <ClockIcon className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
            </div>
            <p className={`text-xl sm:text-2xl font-bold text-amber-400 mt-1`}>{stats.processing}</p>
            <p className={`text-[10px] sm:text-xs ${tc.textMuted}`}>Generating...</p>
          </div>
        </div>

        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h4 className={`text-xs sm:text-sm ${tc.textSecondary}`}>Pending</h4>
              <ClockIcon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className={`text-xl sm:text-2xl font-bold text-blue-400 mt-1`}>{stats.pending}</p>
            <p className={`text-[10px] sm:text-xs ${tc.textMuted}`}>Awaiting generation</p>
          </div>
        </div>

        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-all duration-300 group cursor-pointer relative overflow-hidden lg:col-span-1 col-span-2`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h4 className={`text-xs sm:text-sm ${tc.textSecondary}`}>Total Earnings</h4>
              <ArrowUpIcon className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className={`text-xl sm:text-2xl font-bold text-purple-400 mt-1`}>₹{stats.totalNet.toLocaleString()}</p>
            <p className={`text-[10px] sm:text-xs ${tc.textMuted}`}>Net amount</p>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section with Visual Highlights */}
      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} transition-all duration-300 hover:shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -mr-24 -mt-24 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Year Dropdown - Enhanced */}
              <div className="relative flex-1 sm:flex-none min-w-[140px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={`w-full pl-9 pr-8 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none font-medium ${selectedYear !== 'all' ? 'text-indigo-400 border-indigo-500/30' : ''}`}
                  aria-label="Select year"
                >
                  <option value="all">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year} {year === currentYear.toString() ? '⭐' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                {selectedYear !== 'all' && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              {/* Month Dropdown - Enhanced */}
              <div className="relative flex-1 sm:flex-none min-w-[150px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={`w-full pl-9 pr-8 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none font-medium ${selectedMonth !== 'all' ? 'text-indigo-400 border-indigo-500/30' : ''}`}
                  aria-label="Select month"
                >
                  <option value="all">All Months</option>
                  {availableMonths.map(month => {
                    const isCurrent = month.value === currentMonth.toString().padStart(2, '0') && selectedYear === currentYear.toString();
                    return (
                      <option key={month.value} value={month.value}>
                        {month.label} {isCurrent ? '📍' : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Search Input - Enhanced */}
              <div className="relative flex-1 sm:flex-none min-w-[200px]">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                  type="text"
                  placeholder="🔍 Search by name, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${searchQuery ? 'border-indigo-500/30 bg-indigo-500/5' : ''}`}
                  aria-label="Search payslips"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-gray-500/10 text-gray-400'}`}
                aria-label="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" strokeWidth="2" rx="1" />
                  <rect x="14" y="3" width="7" height="7" strokeWidth="2" rx="1" />
                  <rect x="3" y="14" width="7" height="7" strokeWidth="2" rx="1" />
                  <rect x="14" y="14" width="7" height="7" strokeWidth="2" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-gray-500/10 text-gray-400'}`}
                aria-label="List view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
                  <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
                  <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Active Filters Display - Enhanced */}
          {(selectedYear !== 'all' || selectedMonth !== 'all' || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/10">
              <span className="text-xs text-indigo-400/60 font-medium flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" />
                Active Filters:
              </span>
              {selectedYear !== 'all' && (
                <span className={`px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5 animate-fadeIn`}>
                  <CalendarIcon className="w-3 h-3" />
                  {selectedYear}
                  <button onClick={() => setSelectedYear('all')} className="hover:text-rose-400 transition-colors ml-1">×</button>
                </span>
              )}
              {selectedMonth !== 'all' && (
                <span className={`px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5 animate-fadeIn`}>
                  <CalendarIcon className="w-3 h-3" />
                  {availableMonths.find(m => m.value === selectedMonth)?.label}
                  <button onClick={() => setSelectedMonth('all')} className="hover:text-rose-400 transition-colors ml-1">×</button>
                </span>
              )}
              {searchQuery && (
                <span className={`px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5 animate-fadeIn`}>
                  <MagnifyingGlassIcon className="w-3 h-3" />
                  {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:text-rose-400 transition-colors ml-1">×</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedYear('all');
                  setSelectedMonth('all');
                  setSearchQuery('');
                }}
                className="ml-auto text-xs text-rose-400/70 hover:text-rose-400 transition-colors font-medium flex items-center gap-1"
              >
                <FireIcon className="w-3 h-3" />
                Clear All
              </button>
            </div>
          )}

          {/* Results Count - Enhanced */}
          <div className="mt-3 flex items-center justify-between">
            <span className={`text-sm ${tc.textSecondary} flex items-center gap-2`}>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tc.badge}`}>
                {filteredPayslips.length}
              </span>
              payslip{filteredPayslips.length !== 1 ? 's' : ''} found
            </span>
            {selectedYear === currentYear.toString() && selectedMonth === 'all' && (
              <span className="text-xs text-emerald-400/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Current year
              </span>
            )}
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
        // Grid View with Enhanced Cards
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPayslips.map((payslip, index) => {
            const isCurrent = payslip.year === currentYear.toString() && 
                            new Date(payslip.month).getMonth() + 1 === currentMonth;
            return (
              <div
                key={payslip.id}
                className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group animate-fadeIn ${isCurrent ? 'ring-2 ring-emerald-500/50' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-5">
                  {/* Header with Current Month Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${isCurrent ? 'from-emerald-500 to-emerald-600' : 'from-indigo-500 to-purple-600'} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${isCurrent ? 'shadow-emerald-500/25' : 'shadow-indigo-500/25'} group-hover:scale-110 transition-transform`}>
                        {new Date(payslip.month).toLocaleString('default', { month: 'short' })}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${tc.text} text-sm`}>{payslip.month}</h4>
                        <p className={`text-xs ${tc.textMuted}`}>ID: {payslip.id}</p>
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
                        {payslip.status}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Employee</span>
                      <span className={`font-medium ${tc.text}`}>{payslip.employeeName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>ID</span>
                      <span className={`font-mono text-xs ${tc.textMuted}`}>{payslip.employeeId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Department</span>
                      <span className={`text-xs ${tc.textMuted}`}>{payslip.department}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Paid On</span>
                      <span className={`text-xs ${tc.textMuted}`}>{payslip.paidOn}</span>
                    </div>
                  </div>

                  {/* Earnings with Visual Enhancement */}
                  <div className={`mt-3 pt-3 ${tc.border} border-t grid grid-cols-2 gap-2`}>
                    <div className={`p-2 rounded-lg ${tc.bgInput}`}>
                      <p className={`text-[10px] ${tc.textMuted}`}>Gross</p>
                      <p className={`text-sm font-bold ${tc.text}`}>{payslip.gross}</p>
                    </div>
                    <div className={`p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10`}>
                      <p className={`text-[10px] ${tc.textMuted}`}>Net</p>
                      <p className={`text-sm font-bold text-emerald-400`}>{payslip.net}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => toggleExpand(payslip.id)}
                      className={`flex-1 px-3 py-1.5 ${tc.border} ${tc.textSecondary} rounded-xl text-xs font-medium hover:${tc.bgCardHover} transition-all duration-300 flex items-center justify-center gap-1`}
                    >
                      <EyeIcon className="w-3 h-3" />
                      {expandedPayslip === payslip.id ? 'Hide' : 'Preview'}
                    </button>
                    <button
                      onClick={() => handleDownload(payslip)}
                      disabled={payslip.status !== 'Generated'}
                      className={`flex-1 px-3 py-1.5 bg-gradient-to-r ${isCurrent ? 'from-emerald-500 to-emerald-600' : 'from-indigo-500 to-indigo-600'} text-white rounded-xl text-xs font-medium hover:from-${isCurrent ? 'emerald' : 'indigo'}-600 hover:to-${isCurrent ? 'emerald' : 'indigo'}-700 transition-all duration-300 shadow-lg ${isCurrent ? 'shadow-emerald-500/25' : 'shadow-indigo-500/25'} flex items-center justify-center gap-1 ${payslip.status !== 'Generated' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                      <CloudArrowDownIcon className="w-3 h-3" />
                      Download
                    </button>
                  </div>

                  {/* Expandable Preview */}
                  {expandedPayslip === payslip.id && (
                    <div className={`mt-3 pt-3 ${tc.border} border-t ${tc.bgInput} rounded-xl p-3 animate-slideDown`}>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className={tc.textMuted}>Generated On</span>
                          <span className={tc.text}>{payslip.paidOn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={tc.textMuted}>Status</span>
                          <span className={`${getStatusColor(payslip.status)} px-2 py-0.5 rounded-full`}>
                            {payslip.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={tc.textMuted}>Payment Method</span>
                          <span className={tc.text}>Bank Transfer</span>
                        </div>
                        <button
                          onClick={() => handleDownload(payslip)}
                          className="w-full mt-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-medium hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
                        >
                          <PrinterIcon className="w-3 h-3" />
                          Print Preview
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View with Enhanced Table
        <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden transition-all duration-300 hover:shadow-lg`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Gross</th>
                  <th className="px-4 py-3 font-medium">Net</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayslips.map((payslip, index) => {
                  const isCurrent = payslip.year === currentYear.toString() && 
                                   new Date(payslip.month).getMonth() + 1 === currentMonth;
                  return (
                    <tr 
                      key={payslip.id} 
                      className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-all duration-300 hover:bg-opacity-50 animate-fadeIn ${isCurrent ? 'bg-emerald-500/5' : ''}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 bg-gradient-to-br ${isCurrent ? 'from-emerald-500 to-emerald-600' : 'from-indigo-500 to-purple-600'} rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg ${isCurrent ? 'shadow-emerald-500/25' : 'shadow-indigo-500/25'}`}>
                            {new Date(payslip.month).toLocaleString('default', { month: 'short' })}
                          </div>
                          <div>
                            <span className={`font-medium ${tc.text} text-sm`}>{payslip.month}</span>
                            {isCurrent && (
                              <span className="ml-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-medium border border-emerald-500/30">
                                Current
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm ${tc.text}`}>{payslip.employeeName}</td>
                      <td className={`px-4 py-3 text-xs font-mono ${tc.textMuted}`}>{payslip.employeeId}</td>
                      <td className={`px-4 py-3 text-xs ${tc.textMuted}`}>{payslip.department}</td>
                      <td className={`px-4 py-3 text-sm font-medium ${tc.text}`}>{payslip.gross}</td>
                      <td className={`px-4 py-3 text-sm font-bold text-emerald-400`}>{payslip.net}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(payslip.status)} flex items-center gap-1 border w-fit`}>
                          {getStatusIcon(payslip.status)}
                          {payslip.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleExpand(payslip.id)}
                            className={`p-1.5 rounded-lg ${tc.btnBg} transition-all hover:scale-110`}
                            aria-label="Preview payslip"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(payslip)}
                            disabled={payslip.status !== 'Generated'}
                            className={`p-1.5 rounded-lg bg-gradient-to-r ${isCurrent ? 'from-emerald-500 to-emerald-600' : 'from-indigo-500 to-indigo-600'} text-white transition-all hover:scale-110 ${payslip.status !== 'Generated' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label="Download payslip"
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

      {/* Quick Action - Generate Current */}
      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} transition-all duration-300 hover:shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -ml-16 -mb-16"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 animate-pulse">
              <ArrowUpIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-semibold ${tc.text} flex items-center gap-2`}>
                Generate Current Payslip
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  {currentMonthName} {currentYear}
                </span>
              </h3>
              <p className={`text-sm ${tc.textSecondary}`}>
                {canGenerateCurrentMonth 
                  ? 'Your payslip is ready for download' 
                  : `Available from 25th of ${currentMonthName}`}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs ${tc.textMuted} flex items-center gap-1`}>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  {currentDate.format('DD MMM YYYY')}
                </span>
                {currentDay >= 25 && (
                  <span className="text-xs text-emerald-400/70 flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3" />
                    Available
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (canGenerateCurrentMonth) {
                handleGenerateCurrent();
              } else {
                // Show notification that it's not available yet
                setSuccessMessage(`Payslip for ${currentMonthName} will be available from 25th`);
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
              }
            }}
            className={`px-6 py-2.5 bg-gradient-to-r ${
              canGenerateCurrentMonth 
                ? 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25 hover:shadow-emerald-500/40' 
                : 'from-gray-500 to-gray-600 cursor-not-allowed opacity-50'
            } text-white rounded-xl font-medium transition-all duration-300 shadow-lg flex items-center gap-2 group`}
            disabled={!canGenerateCurrentMonth}
          >
            <CloudArrowDownIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {canGenerateCurrentMonth ? 'Generate Now' : `Available on 25th`}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl shadow-lg animate-fadeIn z-50 max-w-md">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* CSS Animations */}
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
      )}
    </div>
  );
};

export default PayslipsTab;