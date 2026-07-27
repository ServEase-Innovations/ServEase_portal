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
  handleSubmitLeave: () => void;
  handleLeaveImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  handleSubmitLeave,
  handleLeaveImageUpload,
}) => {
  const stats = [
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
          {!isClockedIn && !isClockedOut && workStatus === 'not-working' && (
            <>
              <button
                type="button"
                onClick={handleStartWork}
                disabled={attendanceLoading}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {attendanceLoading ? '⏳ Processing...' : '✅ Working Today'}
              </button>
              <button
                type="button"
                onClick={() => setShowLeaveModal(true)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-500/30 transition-all"
              >
                📋 On Leave
              </button>
            </>
          )}
          {isClockedIn && (
            <button
              type="button"
              onClick={handleStopWork}
              disabled={attendanceLoading}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {attendanceLoading ? '⏳ Processing...' : '⏹️ Stop Working'}
            </button>
          )}
          {isClockedOut && (
            <button
              type="button"
              onClick={() => {
                // Reset clock out state - handled in parent
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-amber-500/30 transition-all"
            >
              🔄 Start New Session
            </button>
          )}
          {workStatus === 'on-leave' && (
            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-amber-500/30 transition-all"
            >
              ✏️ Modify Leave
            </button>
          )}
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
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} tc={tc} isClockedIn={isClockedIn} />
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

        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-2 sm:mb-4 text-base sm:text-lg`}>Team & Project</h3>
          <p className={`text-sm ${tc.textSecondary} mb-3 sm:mb-4`}>Your current assignment</p>
          <div className="space-y-2 sm:space-y-3 text-sm">
            <div className={`flex justify-between items-center pb-2 ${tc.border} border-b`}>
              <span className={tc.textSecondary}>Team</span>
              <span className={`font-medium ${tc.text}`}>Platform</span>
            </div>
            <div className={`flex justify-between items-center pb-2 ${tc.border} border-b`}>
              <span className={tc.textSecondary}>Manager</span>
              <span className={`font-medium ${tc.text}`}>Priya Nair</span>
            </div>
            <div className={`flex justify-between items-center pb-2 ${tc.border} border-b`}>
              <span className={tc.textSecondary}>Project</span>
              <span className={`font-medium ${tc.text}`}>Atlas Core</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={tc.textSecondary}>Squad size</span>
              <span className={`font-medium ${tc.text}`}>14 people</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AttendanceCalendar tc={tc} />
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-2 sm:mb-4 text-base sm:text-lg`}>Monthly Summary</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className={`flex justify-between items-center pb-2 ${tc.border} border-b`}>
              <span className={tc.textSecondary}>Present</span>
              <span className={`font-bold ${tc.text}`}>14 days</span>
            </div>
            <div className={`flex justify-between items-center pb-2 ${tc.border} border-b`}>
              <span className={tc.textSecondary}>WFH</span>
              <span className={`font-bold ${tc.text}`}>0 days</span>
            </div>
            <div className={`flex justify-between items-center pb-2 ${tc.border} border-b`}>
              <span className={tc.textSecondary}>Half-Day</span>
              <span className={`font-bold ${tc.text}`}>0 days</span>
            </div>
            <div className={`flex justify-between items-center pb-2 ${tc.border} border-b`}>
              <span className={tc.textSecondary}>Leave</span>
              <span className={`font-bold ${tc.text}`}>2 days</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className={`${tc.textSecondary} font-medium`}>Total Hours</span>
              <span className="font-bold text-indigo-400">111.5 hours</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewTab;