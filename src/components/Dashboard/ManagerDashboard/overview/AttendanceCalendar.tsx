// components/overview/AttendanceCalendar.tsx
import React from 'react';
import { ThemeClasses } from '../types';

interface AttendanceCalendarProps {
  tc: ThemeClasses;
  attendanceRecords?: any[];
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ tc, attendanceRecords = [] }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDate = now.getDate();
  
  // Get the first day of the month to calculate calendar offset
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Create attendance map for quick lookup
  const attendanceMap = new Map();
  attendanceRecords.forEach(record => {
    if (!record.calendarDate) return;
    // Date constructor handles both numbers and strings
    const recordDate = new Date(record.calendarDate);
    if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
      attendanceMap.set(recordDate.getDate(), record);
    }
  });
  
  // Get color for a specific date
  const getDateColor = (date: number) => {
    // Check if this date is a weekend (Saturday=6, Sunday=0)
    const dateObj = new Date(currentYear, currentMonth, date);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday=0, Saturday=6
    
    // Weekends are always holidays (purple)
    if (isWeekend) {
      return { bg: 'bg-purple-500/20', text: 'text-purple-400' };
    }
    
    if (date > currentDate) {
      // Future dates
      return { bg: '', text: 'text-gray-400' };
    }
    
    const record = attendanceMap.get(date);
    if (!record) {
      // No record = absent
      return { bg: 'bg-gray-500/20', text: 'text-gray-400' };
    }
    
    // Present/Working
    if (record.shiftStatus === 'Working') {
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-400' };
    }
    // On Leave
    if (record.shiftStatus === 'OnLeave') {
      return { bg: 'bg-rose-500/20', text: 'text-rose-400' };
    }
    // Absent
    return { bg: 'bg-gray-500/20', text: 'text-gray-400' };
  };
  
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  return (
    <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
      <h3 className={`font-semibold ${tc.text} mb-2 sm:mb-4 text-base sm:text-lg`}>Attendance Calendar</h3>
      <p className={`text-sm ${tc.textSecondary} mb-3 sm:mb-4`}>{monthName} - previous days are read-only</p>
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-sm">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
          <div key={i} className={`text-[8px] sm:text-xs ${tc.textMuted} font-medium py-1`}>{day}</div>
        ))}
        {/* Empty cells for days before the 1st */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="py-0.5 sm:py-1"></div>
        ))}
        {/* Actual days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((date) => {
          const { bg, text } = getDateColor(date);
          const isToday = date === currentDate;
          
          return (
            <div 
              key={date} 
              className={`py-0.5 sm:py-1 rounded ${bg} ${text} text-[10px] sm:text-sm ${isToday ? 'ring-2 ring-indigo-400 font-bold' : ''}`}
            >
              {date}
            </div>
          );
        })}
      </div>
      <div className={`flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 ${tc.border} border-t`}>
        <span className={`flex items-center text-[10px] sm:text-xs ${tc.textSecondary}`}><span className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500/30 rounded inline-block mr-1"></span> Working</span>
        <span className={`flex items-center text-[10px] sm:text-xs ${tc.textSecondary}`}><span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500/30 rounded inline-block mr-1"></span> WFH</span>
        <span className={`flex items-center text-[10px] sm:text-xs ${tc.textSecondary}`}><span className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-500/30 rounded inline-block mr-1"></span> Half-Day</span>
        <span className={`flex items-center text-[10px] sm:text-xs ${tc.textSecondary}`}><span className="w-2 h-2 sm:w-3 sm:h-3 bg-rose-500/30 rounded inline-block mr-1"></span> Leave</span>
        <span className={`flex items-center text-[10px] sm:text-xs ${tc.textSecondary}`}><span className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500/30 rounded inline-block mr-1"></span> Holiday</span>
      </div>
    </div>
  );
};

export default AttendanceCalendar;