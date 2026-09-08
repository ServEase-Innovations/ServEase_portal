// src/pages/HRDashboard/components/salary/SalaryTab.tsx

import React, { useState, useEffect } from 'react';
import { ThemeClasses } from '../types';
import toast from 'react-hot-toast';

interface SalaryTabProps {
  themeClasses: ThemeClasses;
}

interface Employee {
  employeeId: string;
  fullName: string;
  assignedDepartment: string;
  assignedRole: string;
  baseSalary: string;
  allowances: string;
  deductions: string;
  isActive: boolean;
}

interface AttendanceRecord {
  employeeId: string;
  shiftStatus: 'Working' | 'OnLeave' | 'Absent';
  calendarDate: number;
}

interface SalaryData {
  employeeId: string;
  fullName: string;
  department: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  presentDays: number;
  leaveDays: number;
  absentDays: number;
  totalWorkingDays: number;
  netPayable: number;
}

export const SalaryTab: React.FC<SalaryTabProps> = ({ themeClasses }) => {
  const [salaryData, setSalaryData] = useState<SalaryData[]>([]);
  const [filteredData, setFilteredData] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchSalaryData();
  }, [selectedMonth]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredData(
        salaryData.filter(
          (record) =>
            record.fullName.toLowerCase().includes(query) ||
            record.department.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredData(salaryData);
    }
  }, [searchQuery, salaryData]);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';
      const token = localStorage.getItem('servease_token');

      // Fetch employees
      const employeesResponse = await fetch(apiUrl + 'employees', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!employeesResponse.ok) {
        throw new Error('Failed to fetch employees');
      }

      const employees: Employee[] = await employeesResponse.json();
      const activeEmployees = employees.filter((emp) => emp.isActive);

      // Fetch attendance for selected month
      const attendanceResponse = await fetch(apiUrl + 'attendance', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!attendanceResponse.ok) {
        throw new Error('Failed to fetch attendance');
      }

      const allAttendance: AttendanceRecord[] = await attendanceResponse.json();

      // Filter attendance for selected month
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthStart = new Date(year, month - 1, 1).getTime();
      const monthEnd = new Date(year, month, 0, 23, 59, 59).getTime();

      const monthAttendance = allAttendance.filter((record) => {
        return record.calendarDate >= monthStart && record.calendarDate <= monthEnd;
      });

      // Calculate working days in month (excluding weekends)
      const totalWorkingDays = calculateWorkingDays(year, month - 1);

      // Process salary data
      const processedData: SalaryData[] = activeEmployees.map((emp) => {
        const empAttendance = monthAttendance.filter(
          (att) => att.employeeId === emp.employeeId
        );

        const presentDays = empAttendance.filter((att) => att.shiftStatus === 'Working').length;
        const leaveDays = empAttendance.filter((att) => att.shiftStatus === 'OnLeave').length;
        const absentDays = empAttendance.filter((att) => att.shiftStatus === 'Absent').length;

        const baseSalary = parseFloat(emp.baseSalary) || 0;
        const allowances = parseFloat(emp.allowances) || 0;
        const deductions = parseFloat(emp.deductions) || 0;

        const grossSalary = baseSalary + allowances;
        
        // Calculate per-day salary
        const perDaySalary = grossSalary / totalWorkingDays;
        
        // Calculate loss of pay for absent days
        const lopDeduction = absentDays * perDaySalary;
        
        // Net payable = gross - deductions - LOP
        const netPayable = grossSalary - deductions - lopDeduction;

        return {
          employeeId: emp.employeeId,
          fullName: emp.fullName,
          department: emp.assignedDepartment,
          baseSalary,
          allowances,
          deductions,
          presentDays,
          leaveDays,
          absentDays,
          totalWorkingDays,
          netPayable: Math.max(0, netPayable), // Ensure non-negative
        };
      });

      setSalaryData(processedData);
      setFilteredData(processedData);
    } catch (error: any) {
      console.error('Error fetching salary data:', error);
      setError(error.message || 'Failed to load salary data');
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingDays = (year: number, month: number): number => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let workingDays = 0;

    for (let day = firstDay; day <= lastDay; day.setDate(day.getDate() + 1)) {
      const dayOfWeek = day.getDay();
      // Count Monday to Friday (1-5) as working days
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  };

  const totalPayable = filteredData.reduce((sum, record) => sum + record.netPayable, 0);

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${themeClasses.bgCard} p-6 rounded-2xl ${themeClasses.border} text-center`}>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchSalaryData}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>
            Salary & Attendance Report
          </h2>
          <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>
            Monthly attendance-linked payable summary - {getMonthName(selectedMonth)}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`px-3 py-2 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
          />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`px-3 py-2 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-40`}
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className={`${themeClasses.bgCard} p-4 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className={`text-xs ${themeClasses.textMuted}`}>Total Employees</p>
            <p className={`text-xl font-bold ${themeClasses.text}`}>{filteredData.length}</p>
          </div>
          <div>
            <p className={`text-xs ${themeClasses.textMuted}`}>Working Days</p>
            <p className={`text-xl font-bold ${themeClasses.text}`}>
              {filteredData[0]?.totalWorkingDays || 0}
            </p>
          </div>
          <div>
            <p className={`text-xs ${themeClasses.textMuted}`}>Total Payable</p>
            <p className={`text-xl font-bold text-emerald-400`}>{formatCurrency(totalPayable)}</p>
          </div>
          <div>
            <p className={`text-xs ${themeClasses.textMuted}`}>Avg. Attendance</p>
            <p className={`text-xl font-bold ${themeClasses.text}`}>
              {filteredData.length > 0
                ? Math.round(
                    (filteredData.reduce((sum, r) => sum + r.presentDays, 0) /
                      filteredData.length /
                      (filteredData[0]?.totalWorkingDays || 1)) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className={`${themeClasses.bgCard} p-8 rounded-2xl ${themeClasses.border} text-center`}>
          <p className={themeClasses.textSecondary}>No salary records found</p>
        </div>
      ) : (
        <div
          className={`${themeClasses.bgCard} rounded-2xl ${themeClasses.border} ${themeClasses.shadow} overflow-hidden`}
        >
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[800px] sm:min-w-0">
              <thead>
                <tr
                  className={`text-left text-[10px] sm:text-xs ${themeClasses.tableHeader} ${themeClasses.border} border-b`}
                >
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Employee</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">
                    Department
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-center">Present</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-center hidden md:table-cell">
                    Leaves
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-center hidden md:table-cell">
                    Absent
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right hidden lg:table-cell">
                    Base Salary
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right">Net Payable</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record) => (
                  <tr
                    key={record.employeeId}
                    className={`${themeClasses.border} border-b last:border-0 ${themeClasses.bgTableHover} transition-colors`}
                  >
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-[8px] sm:text-xs shadow-lg shadow-indigo-500/25 flex-shrink-0">
                          {record.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <span
                          className={`font-medium ${themeClasses.text} text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none`}
                        >
                          {record.fullName}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} hidden sm:table-cell`}
                    >
                      {record.department}
                    </td>
                    <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-center`}>
                      <span className="text-emerald-400 font-semibold">
                        {record.presentDays}/{record.totalWorkingDays}
                      </span>
                    </td>
                    <td
                      className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-center text-amber-400 hidden md:table-cell`}
                    >
                      {record.leaveDays}
                    </td>
                    <td
                      className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-center text-rose-400 hidden md:table-cell`}
                    >
                      {record.absentDays}
                    </td>
                    <td
                      className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-right ${themeClasses.textSecondary} hidden lg:table-cell`}
                    >
                      {formatCurrency(record.baseSalary)}
                    </td>
                    <td
                      className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-right font-semibold text-indigo-400`}
                    >
                      {formatCurrency(record.netPayable)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className={`${themeClasses.tableHeader} ${themeClasses.border} border-t`}>
                <tr>
                  <td
                    colSpan={6}
                    className={`px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-sm font-semibold ${themeClasses.text} text-right hidden lg:table-cell`}
                  >
                    Total Payable:
                  </td>
                  <td
                    className={`px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-sm font-bold text-indigo-400 text-right`}
                  >
                    {formatCurrency(totalPayable)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};