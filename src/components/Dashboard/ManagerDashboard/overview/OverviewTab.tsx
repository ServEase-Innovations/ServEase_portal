// components/overview/OverviewTab.tsx
import React from 'react';
import moment from 'moment';
import { CheckIcon } from '@heroicons/react/24/outline';
import { 
  UsersIcon, 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { ThemeClasses, TeamMember } from '../types';
import StatsCard from '../common/StatsCard';
import TimerControls from './TimerControls';
import LeaveModal from '../leave/LeaveModal';
import AttendanceCalendar from './AttendanceCalendar';
import { InfoCard } from '../../shared/InfoCard';
import { StatusBadge } from '../../shared/StatusBadge';
import { ActionButtons, getActionButtonsForState } from '../../shared/ActionButtons';
// import AttendanceCalendar from '../attendance/AttendanceCalendar';


interface OverviewTabProps {
  tc: ThemeClasses;
  showSuccessMessage: boolean;
  successMessage: string;
  isClockedIn: boolean;
  isClockedOut: boolean;
  workStatus: 'working' | 'on-leave' | 'not-working';
  workHours: number;
  workMinutes: number;
  workSeconds: number;
  totalHoursToday: number;
  attendanceLoading: boolean;
  startTime: moment.Moment | null;
  showLeaveModal: boolean;
  setShowLeaveModal: (show: boolean) => void;
  leaveRequest: {
    type: 'Sick' | 'Casual' | 'Earned' | 'Other';
    fromDate: string;
    toDate: string;
    reason: string;
    imageFile: File | null;
    imagePreview: string | null;
  };
  setLeaveRequest: (request: any) => void;
  handleStartWork: () => void;
  handleStopWork: () => void;
  handleResumeWork: () => void;
  handleSubmitLeave: () => void;
  handleLeaveImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  attendanceRecords?: any[];
  todayAttendance?: any;
  previousSessionsHours?: number;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  tc,
  showSuccessMessage,
  successMessage,
  isClockedIn,
  isClockedOut,
  workStatus,
  workHours,
  workMinutes,
  workSeconds,
  totalHoursToday,
  attendanceLoading,
  startTime,
  showLeaveModal,
  setShowLeaveModal,
  leaveRequest,
  setLeaveRequest,
  handleStartWork,
  handleStopWork,
  handleResumeWork,
  handleSubmitLeave,
  handleLeaveImageUpload,
  attendanceRecords = [],
  todayAttendance,
  previousSessionsHours = 0,
}) => {
  // Calculate monthly stats from actual attendance records
  const calculateMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthRecords = attendanceRecords.filter(record => {
      if (!record.calendarDate) return false;
      // Convert to Date object regardless of input type
      const recordDate = new Date(record.calendarDate);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    const presentDays = monthRecords.filter(r => r.shiftStatus === 'Working').length;
    const wfhDays = 0; // Can be added later
    const halfDays = 0; // Can be added later
    const leaveDays = monthRecords.filter(r => r.shiftStatus === 'OnLeave').length;
    const totalHours = monthRecords.reduce((sum, r) => sum + (Number(r.totalHoursComputed) || 0), 0);
    
    return { presentDays, wfhDays, halfDays, leaveDays, totalHours };
  };
  
  const monthlyStats = calculateMonthlyStats();
  
  // Calculate today's progress percentage (assuming 8 hour workday)
  const todayProgressPercent = Math.min((workHours * 3600 + workMinutes * 60 + workSeconds) / (8 * 3600) * 100, 100);
  
  // Format time for display
  const formatTime = (date: any) => {
    if (!date) return '--:--';
    // Date constructor handles both numbers and strings
    const d = new Date(date);
    return moment(d).format('HH:mm');
  };
  
  const firstClockIn = todayAttendance?.clockInTimestamp ? formatTime(todayAttendance.clockInTimestamp) : '--:--';
  const lastClockOut = todayAttendance?.clockOutTimestamp ? formatTime(todayAttendance.clockOutTimestamp) : '--:--';
  
  const statsCards = [
    { label: 'Team Size', value: '4', icon: UsersIcon, subtitle: '2 on leave today' },
    { label: 'Open Tasks', value: '5', icon: ClipboardDocumentCheckIcon, subtitle: '3 blocked' },
    { label: 'Attendance', value: '92%', icon: UserGroupIcon, subtitle: '↑ 4% vs last week' },
    { label: 'Productivity', value: '89', icon: ChartBarIcon, subtitle: 'Team score this month' }
  ];

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
            {isClockedOut && `Completed at: ${moment().format('hh:mm A')}`}
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

      <TimerControls
        isClockedIn={isClockedIn}
        isClockedOut={isClockedOut}
        workStatus={workStatus}
        workHours={workHours}
        workMinutes={workMinutes}
        workSeconds={workSeconds}
        totalHoursToday={totalHoursToday}
        attendanceLoading={attendanceLoading}
        startTime={startTime}
        handleStartWork={handleStartWork}
        handleStopWork={handleStopWork}
        tc={tc}
      />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} stat={stat} tc={tc} isClockedIn={isClockedIn} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className={`lg:col-span-2 ${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-2 sm:mb-4 text-base sm:text-lg`}>Today's Working Progress</h3>
          <p className={`text-sm ${tc.textSecondary} mb-3 sm:mb-4`}>
            {monthlyStats.totalHours.toFixed(1)}h logged this month - {monthlyStats.presentDays} present days
          </p>
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex-1">
              <div className="w-full bg-gray-200/20 rounded-full h-3 sm:h-4">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 sm:h-4 rounded-full transition-all duration-1000" 
                  style={{ width: `${todayProgressPercent}%` }}
                ></div>
              </div>
              <div className={`flex flex-wrap justify-between mt-2 text-[10px] sm:text-sm ${tc.textMuted} gap-1`}>
                <span>{todayProgressPercent.toFixed(0)}% DAY</span>
                <span>LOGIN {firstClockIn}</span>
                <span>LOGOUT {lastClockOut}</span>
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
        <AttendanceCalendar tc={tc} attendanceRecords={attendanceRecords} />
        <InfoCard
          title="Monthly Summary"
          rows={[
            { label: 'Present', value: `${monthlyStats.presentDays} days`, bold: true },
            { label: 'WFH', value: `${monthlyStats.wfhDays} days`, bold: true },
            { label: 'Half-Day', value: `${monthlyStats.halfDays} days`, bold: true },
            { label: 'Leave', value: `${monthlyStats.leaveDays} days`, bold: true },
            { 
              label: 'Total Hours', 
              value: `${monthlyStats.totalHours.toFixed(1)} hours`, 
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

export default OverviewTab;