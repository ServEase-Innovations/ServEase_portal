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
// import AttendanceCalendar from '../attendance/AttendanceCalendar';

type InfoRow = {
  label: string;
  value: string;
  bold?: boolean;
  noBorder?: boolean;
  topPadding?: boolean;
  valueClass?: string;
  labelClass?: string;
};

type InfoCardProps = {
  title: string;
  subtitle?: string;
  rows: InfoRow[];
  tc: ThemeClasses;
};

const InfoCard: React.FC<InfoCardProps> = ({ title, subtitle, rows, tc }) => (
  <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
    <h3 className={`font-semibold ${tc.text} mb-2 sm:mb-4 text-base sm:text-lg`}>{title}</h3>
    {subtitle && <p className={`text-sm ${tc.textSecondary} mb-3 sm:mb-4`}>{subtitle}</p>}
    <div className="space-y-2 sm:space-y-3 text-sm">
      {rows.map((row, idx) => (
        <div 
          key={idx} 
          className={`flex justify-between items-center ${row.noBorder ? '' : `pb-2 ${tc.border} border-b`} ${row.topPadding ? 'pt-2' : ''}`}
        >
          <span className={row.labelClass || tc.textSecondary}>{row.label}</span>
          <span className={`${row.bold ? 'font-bold' : 'font-medium'} ${row.valueClass || tc.text}`}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);


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
}) => {
  // Calculate monthly stats from actual attendance records
  const calculateMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthRecords = attendanceRecords.filter(record => {
      if (!record.calendarDate) return false;
      const recordDate = new Date(typeof record.calendarDate === 'number' ? record.calendarDate : record.calendarDate);
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
    const d = new Date(typeof date === 'number' ? date : date);
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

  const getStatusBadge = () => {
    if (isClockedIn) {
      return { label: '🟢 Working', class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
    } else if (isClockedOut) {
      return { label: '✅ Clocked Out', class: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
    } else if (workStatus === 'on-leave') {
      return { label: '🔵 On Leave', class: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
    }
    return { label: '⚪ Not Working', class: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' };
  };

  const statusBadge = getStatusBadge();

  // Action button configurations
  type ActionButton = {
    onClick: () => void;
    disabled?: boolean;
    colorClass: string;
    label: string;
    loadingLabel?: string;
  };

  const getActionButtons = (): ActionButton[] => {
    if (!isClockedIn && !isClockedOut && workStatus === 'not-working') {
      return [
        {
          onClick: handleStartWork,
          disabled: attendanceLoading,
          colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed',
          label: '✅ Working Today',
          loadingLabel: '⏳ Processing...'
        },
        {
          onClick: () => setShowLeaveModal(true),
          colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
          label: '📋 On Leave'
        }
      ];
    }
    if (isClockedIn) {
      return [{
        onClick: handleStopWork,
        disabled: attendanceLoading,
        colorClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed',
        label: '⏹️ Stop Working',
        loadingLabel: '⏳ Processing...'
      }];
    }
    if (isClockedOut) {
      return [{
        onClick: handleResumeWork,
        disabled: attendanceLoading,
        colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed',
        label: '▶️ Resume Work',
        loadingLabel: '⏳ Resuming...'
      }];
    }
    if (workStatus === 'on-leave') {
      return [{
        onClick: () => setShowLeaveModal(true),
        colorClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30',
        label: '✏️ Modify Leave'
      }];
    }
    return [];
  };

  const renderButton = (btn: ActionButton, index: number) => (
    <button
      key={index}
      type="button"
      onClick={btn.onClick}
      disabled={btn.disabled}
      className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 border rounded-xl text-xs sm:text-sm font-medium transition-all ${btn.colorClass}`}
    >
      {btn.disabled && btn.loadingLabel ? btn.loadingLabel : btn.label}
    </button>
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
          <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium ${statusBadge.class}`}>
            {statusBadge.label}
          </span>
          <span className={`text-xs sm:text-sm ${tc.textSecondary}`}>
            {isClockedIn && startTime && `Started at: ${startTime.format('hh:mm A')}`}
            {isClockedOut && `Completed at: ${moment().format('hh:mm A')}`}
            {workStatus === 'on-leave' && 'Currently on leave'}
            {!isClockedIn && !isClockedOut && workStatus === 'not-working' && 'Ready to start working'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {getActionButtons().map(renderButton)}
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