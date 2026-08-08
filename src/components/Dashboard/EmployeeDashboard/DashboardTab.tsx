// tabs/DashboardTab.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getThemeClasses } from './themeUtils';
import { useAttendanceHandlers } from '../../../hooks/useAttendanceHandlers';
import { formatTime, getTodayHoursDisplay as calculateTodayHours } from '../../../utils/timeCalculations';
import { useLeaveHandlers } from '../../../hooks/useLeaveHandlers';
import { useAttendanceTimer } from '../../../hooks/useAttendanceTimer';
import { Attendance } from '../../../types';
import moment from 'moment';
import LeaveModal from '../ManagerDashboard/leave/LeaveModal';
import { InfoCard } from '../shared/InfoCard';
import { StatusBadge } from '../shared/StatusBadge';
import { ActionButtons, getActionButtonsForState } from '../shared/ActionButtons';
import { 
  ClockIcon,
  CheckCircleIcon, 
  CalendarDaysIcon,
  CheckIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';

// Attendance hook return type
interface AttendanceHookReturn {
  attendanceRecords: Attendance[];
  todayAttendance: Attendance | null;
  isLoading: boolean;
  error: string | null;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  resumeWork: () => Promise<void>;
  refreshAttendance: () => Promise<void>;
  isClockedIn: boolean;
  isClockedOut: boolean;
  totalHoursToday: number;
  startTime: Date | null;
  endTime: Date | null;
}

interface DashboardTabProps {
  theme: 'light' | 'dark';
  attendance: AttendanceHookReturn;
}

interface WorkSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  status: 'working' | 'on-leave' | 'not-working';
}

interface LeaveRequest {
  id: string;
  type: 'Sick' | 'Casual' | 'Earned' | 'Other';
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  imageUrl?: string | null;
  submittedAt: string;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ theme, attendance }) => {
  const { user } = useAuth();
  const tc = getThemeClasses(theme);
  
  console.log('🔷 DashboardTab rendered');
  console.log('Attendance prop:', attendance);
  console.log('Attendance clockIn function:', typeof attendance.clockIn);
  console.log('🔍 Button visibility check:');
  console.log('  - isClockedIn:', attendance.isClockedIn);
  console.log('  - isClockedOut:', attendance.isClockedOut);
  console.log('  - todayAttendance:', attendance.todayAttendance);
  
  const {
    todayAttendance,
    isLoading: attendanceLoading,
    clockIn,
    clockOut,
    resumeWork,
    isClockedIn,
    isClockedOut,
    totalHoursToday,
  } = attendance;
  
  console.log('  - workStatus will be checked after useState');

  // Use shared timer logic
  const {
    workHours,
    workMinutes,
    workSeconds,
    startTime,
    totalWorkedToday,
    workStatus,
    setWorkStatus,
    previousSessionsHours, // Get previous sessions hours
  } = useAttendanceTimer({
    isClockedIn,
    isClockedOut,
    todayAttendance
  });

  console.log('  - workStatus:', workStatus);
  console.log('  - Should show Start Work button:', !isClockedIn && !isClockedOut && workStatus === 'not-working');

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    type: 'Sick' as 'Sick' | 'Casual' | 'Earned' | 'Other',
    fromDate: '',
    toDate: '',
    reason: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);

  // Use shared attendance handlers
  const {
    handleStartWork,
    handleStopWork,
    handleResumeWork,
    showSuccessMessage,
    successMessage,
    showSuccess
  } = useAttendanceHandlers({
    clockIn,
    clockOut,
    resumeWork,
    totalHoursToday
  });

  // Use shared leave handlers
  const { handleLeaveImageUpload: handleLeaveImageUploadUtil, validateLeaveRequest } = useLeaveHandlers();

  // Validate and load leave history from localStorage
  useEffect(() => {
    const savedLeaves = localStorage.getItem('leaveHistory');
    if (savedLeaves) {
      try {
        const parsed = JSON.parse(savedLeaves);
        // Validate that it's an array with expected structure
        if (Array.isArray(parsed)) {
          const validLeaves = parsed.filter((leave: any) => 
            leave && 
            typeof leave.id === 'string' &&
            typeof leave.type === 'string' &&
            typeof leave.fromDate === 'string' &&
            typeof leave.toDate === 'string' &&
            typeof leave.reason === 'string' &&
            typeof leave.status === 'string'
          );
          setLeaveHistory(validLeaves);
        } else {
          console.warn('Invalid leave history format in localStorage');
          setLeaveHistory([]);
        }
      } catch (e) {
        console.error('Error loading leave history:', e);
        // Clear corrupted data
        localStorage.removeItem('leaveHistory');
        setLeaveHistory([]);
      }
    }
  }, []);

  const handleLeaveImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleLeaveImageUploadUtil(e, leaveRequest, setLeaveRequest);
  };

  const handleSubmitLeave = () => {
    const validation = validateLeaveRequest(leaveRequest);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const fromDate = moment(leaveRequest.fromDate);
    const toDate = moment(leaveRequest.toDate);

    const newLeave: LeaveRequest = {
      id: crypto.randomUUID(), // Use UUID instead of length-based ID
      type: leaveRequest.type,
      fromDate: fromDate.format('YYYY-MM-DD'),
      toDate: toDate.format('YYYY-MM-DD'),
      reason: leaveRequest.reason,
      status: 'Pending',
      imageUrl: leaveRequest.imagePreview,
      submittedAt: moment().toISOString()
    };

    const updatedLeaves = [newLeave, ...leaveHistory];
    setLeaveHistory(updatedLeaves);
    localStorage.setItem('leaveHistory', JSON.stringify(updatedLeaves));
    
    setWorkStatus('on-leave');
    setShowLeaveModal(false);
    setLeaveRequest({
      type: 'Sick',
      fromDate: '',
      toDate: '',
      reason: '',
      imageFile: null,
      imagePreview: null,
    });
    
    showSuccess(`Leave request submitted for ${fromDate.format('MMM D')} - ${toDate.format('MMM D, YYYY')}`);
  };

  const getTodayHoursDisplay = () => {
    return calculateTodayHours({
      isClockedIn,
      isClockedOut,
      workHours,
      workMinutes,
      workSeconds,
      previousSessionsHours,
      totalHoursToday,
      totalWorkedToday
    });
  };

  const actionButtons = getActionButtonsForState(
    isClockedIn,
    isClockedOut,
    workStatus,
    attendanceLoading,
    {
      handleStartWork,
      handleStopWork,
      handleResumeWork,
      setShowLeaveModal
    }
  );

  const stats = [
    { 
      label: "Today's Hours", 
      value: getTodayHoursDisplay(), 
      icon: ClockIcon, 
      subtitle: isClockedIn ? '⏳ Working...' : isClockedOut ? '✅ Completed' : workStatus === 'on-leave' ? '🔵 On Leave' : 'Ready to start' 
    },
    { 
      label: 'Login Time', 
      value: startTime ? startTime.format('hh:mm A') : (todayAttendance?.clockInTimestamp ? moment(todayAttendance.clockInTimestamp).format('hh:mm A') : '—'), 
      icon: ClockIcon, 
      subtitle: startTime ? `Status: ${isClockedIn ? '🟢 Active' : isClockedOut ? '✅ Completed' : '🔴 Stopped'}` : 'Not logged in' 
    },
    { label: 'Tasks Open', value: '1', icon: CheckCircleIcon, subtitle: '0 completed this week' },
    { label: 'Leave Balance', value: '12d', icon: CalendarDaysIcon, subtitle: `${leaveHistory.filter(l => l.status === 'Pending').length} pending requests` }
  ];

  return (
    <>
      {showSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 sm:p-4 rounded-xl flex items-center gap-2 animate-fadeIn mb-4">
          <CheckIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow} mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <StatusBadge isClockedIn={isClockedIn} isClockedOut={isClockedOut} workStatus={workStatus} />
          <span className={`text-xs sm:text-sm ${tc.textSecondary}`}>
            {isClockedIn && startTime && `Started at: ${startTime.format('hh:mm A')}`}
            {isClockedIn && !startTime && todayAttendance?.clockInTimestamp && `Started at: ${moment(todayAttendance.clockInTimestamp).format('hh:mm A')}`}
            {isClockedOut && todayAttendance && `Completed at: ${moment(todayAttendance.clockOutTimestamp).format('hh:mm A')}`}
            {workStatus === 'on-leave' && 'Currently on leave'}
            {!isClockedIn && !isClockedOut && workStatus === 'not-working' && 'Ready to start working'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <ActionButtons buttons={actionButtons} />
        </div>
      </div>

      <LeaveModal
        showLeaveModal={showLeaveModal}
        setShowLeaveModal={setShowLeaveModal}
        leaveRequest={leaveRequest}
        setLeaveRequest={setLeaveRequest}
        handleSubmitLeave={handleSubmitLeave}
        handleLeaveImageUpload={handleLeaveImageUpload}
        tc={tc}
      />

      {/* Timer Controls */}
      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} mb-6 sm:mb-8 transition-all duration-500 ${isClockedIn ? 'ring-2 ring-emerald-500/50' : ''}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className={`p-3 sm:p-4 rounded-2xl ${tc.timerBg} ${tc.border} border flex-1 sm:flex-none`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <ClockIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${isClockedIn ? 'text-emerald-400 animate-pulse' : tc.textMuted}`} />
                <div>
                  <p className={`text-lg sm:text-2xl font-mono font-bold ${isClockedIn ? 'text-emerald-400' : tc.text}`}>
                    {isClockedIn ? formatTime(workHours, workMinutes, workSeconds) : 
                     isClockedOut ? `${Math.floor(totalHoursToday)}h ${Math.round((totalHoursToday - Math.floor(totalHoursToday)) * 60)}m` : 
                     '00:00:00'}
                  </p>
                  <p className={`text-[10px] sm:text-xs ${tc.textMuted}`}>
                    {isClockedIn ? '🟢 Timer running' : isClockedOut ? '✅ Session completed' : '⏸️ Timer stopped'}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <p className={`text-sm font-medium ${tc.text}`}>Today's Progress</p>
              <p className={`text-xs ${tc.textSecondary}`}>
                {isClockedIn ? 'Click stop when you finish' : 
                 isClockedOut ? `Total: ${totalHoursToday.toFixed(2)} hours` :
                 workStatus === 'on-leave' ? 'On leave today' : 'Start tracking your work hours'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {!isClockedIn && !isClockedOut && workStatus === 'not-working' ? (
              <button
                type="button"
                onClick={handleStartWork}
                disabled={attendanceLoading}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium text-sm sm:text-base hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                <span>{attendanceLoading ? '⏳ Starting...' : 'Start Work'}</span>
              </button>
            ) : isClockedIn ? (
              <button
                type="button"
                onClick={handleStopWork}
                disabled={attendanceLoading}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium text-sm sm:text-base hover:from-rose-600 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <StopIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                <span>{attendanceLoading ? '⏳ Stopping...' : 'Stop Work'}</span>
              </button>
            ) : (
              <div className={`text-sm ${tc.textSecondary} px-3 py-2`}>
                {isClockedOut ? '✅ Completed for today' : workStatus === 'on-leave' ? '📋 On Leave Today' : '⏸️ Not Working'}
              </div>
            )}
          </div>
        </div>
        {isClockedIn && (
          <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 ${tc.border} border-t flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs ${tc.textMuted}`}>
            <span>Started at: {startTime?.format('hh:mm A') || (todayAttendance?.clockInTimestamp ? moment(todayAttendance.clockInTimestamp).format('hh:mm A') : 'N/A')}</span>
            <span className="hidden sm:inline w-px h-4 bg-gray-300/30"></span>
            <span>Elapsed: {formatTime(workHours, workMinutes, workSeconds)}</span>
            <span className="hidden sm:inline w-px h-4 bg-gray-300/30"></span>
            <span>Status: {isClockedIn ? '🟢 Active' : workStatus === 'on-leave' ? '🔵 On Leave' : '⚪ Not Working'}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} ${tc.bgCardHover} transition-all duration-300 group cursor-pointer hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] sm:text-sm ${tc.textSecondary} truncate`}>{stat.label}</p>
                <p className={`text-base sm:text-2xl font-bold ${tc.text} ${stat.label === "Today's Hours" && isClockedIn ? 'text-emerald-400' : ''} truncate`}>{stat.value}</p>
                <p className={`text-[8px] sm:text-xs ${tc.textMuted} truncate`}>{stat.subtitle}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-xl bg-indigo-500/10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-2`}>
                <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className={`lg:col-span-2 ${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-2 sm:mb-4 text-base sm:text-lg`}>Today's Working Progress</h3>
          <p className={`text-sm ${tc.textSecondary} mb-3 sm:mb-4`}>111.5h logged this month - 14 present days</p>
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex-1">
              <div className="w-full bg-gray-200/20 rounded-full h-3 sm:h-4">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 sm:h-4 rounded-full transition-all duration-1000" style={{ width: isClockedIn ? `${Math.min((workHours * 3600 + workMinutes * 60 + workSeconds) / 28800 * 100, 100)}%` : isClockedOut ? '100%' : '65%' }}></div>
              </div>
              <div className={`flex flex-wrap justify-between mt-2 text-[10px] sm:text-sm ${tc.textMuted} gap-1`}>
                <span>100% DAY</span>
                <span>LOGIN 09:18</span>
                <span>LOGOUT 18:32</span>
              </div>
            </div>
          </div>
        </div>

        <InfoCard
          title="Team & Project"
          subtitle="Your current assignment"
          rows={[
            { label: 'Team', value: 'Platform' },
            { label: 'Manager', value: 'Priya Nair' },
            { label: 'Project', value: 'Atlas Core' },
            { label: 'Squad size', value: '14 people', noBorder: true }
          ]}
          tc={tc}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-2 sm:mb-4 text-base sm:text-lg`}>Attendance Calendar</h3>
          <p className={`text-sm ${tc.textSecondary} mb-3 sm:mb-4`}>June 2026 - previous days are read-only</p>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-sm">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
              <div key={i} className={`text-[8px] sm:text-xs ${tc.textMuted} font-medium py-1`}>{day}</div>
            ))}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((date) => {
              let bgColor = 'text-gray-400';
              let textColor = 'text-gray-400';
              if (date <= 18 && date >= 3) {
                bgColor = 'bg-emerald-500/20';
                textColor = 'text-emerald-400';
              } else if (date === 19 || date === 20) {
                bgColor = 'bg-rose-500/20';
                textColor = 'text-rose-400';
              } else if (date === 21) {
                bgColor = 'bg-amber-500/20';
                textColor = 'text-amber-400';
              } else if (date === 22) {
                bgColor = 'bg-indigo-500/20';
                textColor = 'text-indigo-400';
              }
              return (
                <div key={date} className={`py-0.5 sm:py-1 rounded ${bgColor} ${textColor} text-[10px] sm:text-sm`}>
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

        <InfoCard
          title="Monthly Summary"
          rows={[
            { label: 'Present', value: '14 days', bold: true },
            { label: 'WFH', value: '0 days', bold: true },
            { label: 'Half-Day', value: '0 days', bold: true },
            { label: 'Leave', value: '2 days', bold: true },
            { 
              label: 'Total Hours', 
              value: '111.5 hours', 
              bold: true, 
              noBorder: true, 
              topPadding: true,
              valueClass: 'text-indigo-400',
              labelClass: 'font-medium'
            }
          ]}
          tc={tc}
        />
      </div>
    </>
  );
};

export default DashboardTab;