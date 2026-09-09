// src/pages/HRDashboard/components/attendance/AttendanceTab.tsx

import React, { useState, useEffect } from 'react';
import { ThemeClasses } from '../types';
import { ChevronRightIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

interface AttendanceTabProps {
  themeClasses: ThemeClasses;
}

interface AttendanceRecord {
  attendanceId: string;
  employeeId: string;
  calendarDate: number;
  shiftStatus: 'Working' | 'OnLeave' | 'Absent';
  clockInTimestamp: number | null;
  clockOutTimestamp: number | null;
  totalHoursComputed: number;
  employee?: {
    fullName: string;
    assignedDepartment: string;
    assignedRole: string;
    emailAddress?: string;
  };
}

interface DepartmentStats {
  [key: string]: {
    present: number;
    total: number;
    percentage: number;
    employees: Array<{
      employeeId: string;
      fullName: string;
      role: string;
      status: 'Working' | 'OnLeave' | 'Absent' | 'Not Marked';
      clockIn?: string;
      clockOut?: string;
      hours?: number;
    }>;
  };
}

interface Employee {
  employeeId: string;
  fullName: string;
  assignedDepartment: string;
  assignedRole: string;
  emailAddress: string;
  isActive: boolean;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ themeClasses }) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [allAttendanceData, setAllAttendanceData] = useState<AttendanceRecord[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats>({});
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Format time
  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';
        const token = localStorage.getItem('servease_token');

        // Fetch attendance records
        const attendanceResponse = await fetch(apiUrl + 'attendance', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (!attendanceResponse.ok) {
          throw new Error('Failed to fetch attendance data');
        }

        const attendanceRecords: AttendanceRecord[] = await attendanceResponse.json();
        setAllAttendanceData(attendanceRecords);
        
        // Fetch all employees to calculate totals
        const employeesResponse = await fetch(apiUrl + 'employees', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (!employeesResponse.ok) {
          throw new Error('Failed to fetch employees');
        }

        const employees: Employee[] = await employeesResponse.json();
        const activeEmployees = employees.filter((emp: Employee) => emp.isActive);
        setAllEmployees(activeEmployees);
        setTotalEmployees(activeEmployees.length);

        // Calculate stats for selected date
        calculateStatsForDate(selectedDate, attendanceRecords, activeEmployees);

      } catch (error: any) {
        console.error('Error fetching attendance:', error);
        setError(error.message || 'Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Recalculate when date changes
  useEffect(() => {
    if (allAttendanceData.length > 0 && allEmployees.length > 0) {
      calculateStatsForDate(selectedDate, allAttendanceData, allEmployees);
    }
  }, [selectedDate, allAttendanceData, allEmployees]);

  const calculateStatsForDate = (date: Date, attendanceRecords: AttendanceRecord[], employees: Employee[]) => {
    // Normalize date to start of day
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const targetTimestamp = targetDate.getTime();

    const dayAttendance = attendanceRecords.filter(record => {
      const recordDate = new Date(record.calendarDate);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === targetTimestamp;
    });

    setAttendanceData(dayAttendance);

    // Calculate present
    const present = dayAttendance.filter(record => 
      record.shiftStatus === 'Working' && record.clockInTimestamp
    ).length;
    setPresentToday(present);

    // Calculate department-wise stats
    const deptStats: DepartmentStats = {};
    
    // Initialize departments with all employees
    employees.forEach((emp: Employee) => {
      const dept = emp.assignedDepartment || 'Unassigned';
      if (!deptStats[dept]) {
        deptStats[dept] = { present: 0, total: 0, percentage: 0, employees: [] };
      }
      
      // Find attendance record for this employee on selected date
      const empAttendance = dayAttendance.find(att => att.employeeId === emp.employeeId);
      
      let status: 'Working' | 'OnLeave' | 'Absent' | 'Not Marked' = 'Not Marked';
      let clockIn: string | undefined;
      let clockOut: string | undefined;
      let hours: number | undefined;

      if (empAttendance) {
        status = empAttendance.shiftStatus;
        clockIn = formatTime(empAttendance.clockInTimestamp);
        clockOut = formatTime(empAttendance.clockOutTimestamp);
        hours = empAttendance.totalHoursComputed;
      }

      deptStats[dept].employees.push({
        employeeId: emp.employeeId,
        fullName: emp.fullName,
        role: emp.assignedRole,
        status,
        clockIn,
        clockOut,
        hours,
      });

      deptStats[dept].total++;
      if (status === 'Working') {
        deptStats[dept].present++;
      }
    });

    // Calculate percentages
    Object.keys(deptStats).forEach(dept => {
      if (deptStats[dept].total > 0) {
        deptStats[dept].percentage = Math.round((deptStats[dept].present / deptStats[dept].total) * 100);
      }
    });

    setDepartmentStats(deptStats);
  };

  // Calculate week attendance
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Convert Sunday = 0 to Sunday = 6 for our array
  const todayIndex = currentDay === 0 ? 6 : currentDay - 1;
  
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    return days.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  };

  const weekDates = getWeekDates();
  
  const dayPercentages = weekDates.map((date, index) => {
    const dateTimestamp = date.getTime();
    const dayAttendance = allAttendanceData.filter(record => {
      const recordDate = new Date(record.calendarDate);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === dateTimestamp;
    });
    
    const present = dayAttendance.filter(record => 
      record.shiftStatus === 'Working' && record.clockInTimestamp
    ).length;
    
    return totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0;
  });

  // Get sorted departments
  const sortedDepartments = Object.keys(departmentStats).sort();

  const handleDayClick = (date: Date, index: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only allow clicking on today or past days
    if (date.getTime() <= today.getTime()) {
      setSelectedDate(date);
      setSelectedDepartment(null); // Close department modal when changing date
    }
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
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
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>Attendance Monitoring</h2>
        <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>
          {selectedDate.toDateString() === new Date().toDateString() 
            ? `Live presence - ${presentToday} of ${totalEmployees} employees present today`
            : `${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} - ${presentToday} of ${totalEmployees} employees present`
          }
        </p>
      </div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {days.map((day, i) => {
          const date = weekDates[i];
          const isToday = i === todayIndex;
          const isFutureDay = date.getTime() > new Date().setHours(0, 0, 0, 0);
          const isSelected = isSelectedDate(date);
          
          return (
            <button
              key={i}
              onClick={() => handleDayClick(date, i)}
              disabled={isFutureDay}
              className={`${themeClasses.bgCard} p-2 sm:p-4 rounded-2xl ${themeClasses.border} ${
                isSelected ? 'ring-2 ring-indigo-500' : ''
              } ${themeClasses.shadow} text-center ${
                isFutureDay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-indigo-400'
              } transition-all`}
            >
              <p className={`text-[8px] sm:text-sm font-medium ${themeClasses.textSecondary}`}>
                {day} {isToday && '(Today)'}
              </p>
              <p className={`text-sm sm:text-2xl font-bold ${
                isFutureDay ? themeClasses.textMuted :
                dayPercentages[i] >= 85 ? 'text-emerald-400' : 
                dayPercentages[i] >= 70 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {isFutureDay ? '-' : `${dayPercentages[i]}%`}
              </p>
              {!isFutureDay && (
                <div className="w-full bg-gray-200/20 rounded-full h-1 sm:h-1.5 mt-1 sm:mt-2">
                  <div 
                    className={`h-1 sm:h-1.5 rounded-full ${
                      dayPercentages[i] >= 85 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                      dayPercentages[i] >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 
                      'bg-gradient-to-r from-rose-500 to-rose-400'
                    }`} 
                    style={{ width: `${dayPercentages[i]}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Department-wise Attendance */}
      <div className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
        <h3 className={`font-semibold ${themeClasses.text} mb-3 sm:mb-4 text-base sm:text-lg`}>
          Department-wise Attendance
        </h3>
        
        {sortedDepartments.length === 0 ? (
          <p className={`text-center py-8 ${themeClasses.textSecondary}`}>
            No departments found
          </p>
        ) : (
          <div className="space-y-2 sm:space-y-4">
            {sortedDepartments.map((dept, i) => {
              const stats = departmentStats[dept];
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`w-full flex items-center justify-between ${themeClasses.bgTableHover} p-1.5 sm:p-2 rounded-xl transition-all gap-2 hover:ring-2 hover:ring-indigo-400 cursor-pointer`}
                >
                  <span className={`text-[10px] sm:text-sm font-medium ${themeClasses.text} w-20 sm:w-32 flex-shrink-0 truncate text-left`}>
                    {dept}
                  </span>
                  <div className="flex-1 mx-2 sm:mx-4 min-w-[30px]">
                    <div className="w-full bg-gray-200/20 rounded-full h-1.5 sm:h-2.5 overflow-hidden">
                      <div 
                        className={`h-1.5 sm:h-2.5 rounded-full transition-all duration-500 ${
                          stats.percentage >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                          stats.percentage >= 80 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 
                          'bg-gradient-to-r from-rose-500 to-rose-400'
                        }`} 
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 w-28 sm:w-44 justify-end flex-shrink-0">
                    <span className={`text-[10px] sm:text-sm font-semibold w-10 sm:w-12 text-right ${themeClasses.text}`}>
                      {stats.percentage}%
                    </span>
                    <span className={`text-[8px] sm:text-xs ${themeClasses.textMuted}`}>
                      {stats.present}/{stats.total}
                    </span>
                    <ChevronRightIcon className={`w-4 h-4 ${themeClasses.textMuted}`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Department Detail Modal */}
      {selectedDepartment && departmentStats[selectedDepartment] && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${themeClasses.bgCard} rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${themeClasses.border}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${themeClasses.border}`}>
              <div>
                <h3 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>
                  {selectedDepartment} Department
                </h3>
                <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>
                  {departmentStats[selectedDepartment].present} of {departmentStats[selectedDepartment].total} employees present
                  {selectedDate.toDateString() !== new Date().toDateString() && 
                    ` on ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  }
                </p>
              </div>
              <button
                onClick={() => setSelectedDepartment(null)}
                className={`p-2 rounded-lg hover:${themeClasses.bgTableHover} transition-colors`}
              >
                <XMarkIcon className={`w-6 h-6 ${themeClasses.text}`} />
              </button>
            </div>

            {/* Employee List */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4 sm:p-6">
              <div className="space-y-2">
                {departmentStats[selectedDepartment].employees.map((emp) => (
                  <div
                    key={emp.employeeId}
                    className={`flex items-center justify-between p-3 sm:p-4 ${themeClasses.bgTableHover} rounded-xl`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full ${
                        emp.status === 'Working' ? 'bg-emerald-500/20' :
                        emp.status === 'OnLeave' ? 'bg-amber-500/20' :
                        emp.status === 'Absent' ? 'bg-rose-500/20' :
                        'bg-gray-500/20'
                      } flex items-center justify-center flex-shrink-0`}>
                        <UserIcon className={`w-5 h-5 ${
                          emp.status === 'Working' ? 'text-emerald-400' :
                          emp.status === 'OnLeave' ? 'text-amber-400' :
                          emp.status === 'Absent' ? 'text-rose-400' :
                          themeClasses.textMuted
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${themeClasses.text} truncate`}>{emp.fullName}</p>
                        <p className={`text-xs ${themeClasses.textMuted} truncate`}>{emp.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      {emp.status === 'Working' && (
                        <div className="text-right hidden sm:block">
                          <p className={`text-xs ${themeClasses.textSecondary}`}>
                            {emp.clockIn} - {emp.clockOut}
                          </p>
                          {emp.hours && (
                            <p className={`text-xs ${themeClasses.textMuted}`}>
                              {emp.hours.toFixed(2)}h
                            </p>
                          )}
                        </div>
                      )}
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'Working' ? 'bg-emerald-500/20 text-emerald-400' :
                        emp.status === 'OnLeave' ? 'bg-amber-500/20 text-amber-400' :
                        emp.status === 'Absent' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {emp.status === 'Not Marked' ? 'No Record' : emp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};