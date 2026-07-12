// tabs/DashboardTab.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getThemeClasses } from './themeUtils';
import moment from 'moment';
import { 
  ClockIcon,
  CheckCircleIcon, 
  CalendarDaysIcon,
  CheckIcon,
  PlayIcon,
  StopIcon,
  XCircleIcon,
  ArrowUpTrayIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface DashboardTabProps {
  theme: 'light' | 'dark';
  attendance: any;
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
  
  const {
    todayAttendance,
    isLoading: attendanceLoading,
    clockIn,
    clockOut,
    isClockedIn,
    isClockedOut,
    totalHoursToday,
  } = attendance;

  const [isWorking, setIsWorking] = useState(false);
  const [workHours, setWorkHours] = useState(0);
  const [workMinutes, setWorkMinutes] = useState(0);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [startTime, setStartTime] = useState<moment.Moment | null>(null);
  const [totalWorkedToday, setTotalWorkedToday] = useState('0h 0m');
  const [workStatus, setWorkStatus] = useState<'working' | 'on-leave' | 'not-working'>('not-working');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    type: 'Sick' as 'Sick' | 'Casual' | 'Earned' | 'Other',
    fromDate: '',
    toDate: '',
    reason: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Sync with attendance state
  useEffect(() => {
    if (isClockedIn) {
      setWorkStatus('working');
      setIsWorking(true);
      
      if (todayAttendance?.clockInTimestamp) {
        const start = moment(todayAttendance.clockInTimestamp);
        setStartTime(start);
        
        // Calculate elapsed time using moment
        const now = moment();
        const duration = moment.duration(now.diff(start));
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        
        setWorkHours(hours);
        setWorkMinutes(minutes);
        setWorkSeconds(seconds);
        
        if (!timerInterval) {
          const interval = setInterval(() => {
            setWorkSeconds(prev => {
              if (prev >= 59) {
                setWorkMinutes(m => {
                  if (m >= 59) {
                    setWorkHours(h => h + 1);
                    return 0;
                  }
                  return m + 1;
                });
                return 0;
              }
              return prev + 1;
            });
          }, 1000);
          setTimerInterval(interval);
        }
      }
    } else if (isClockedOut && todayAttendance) {
      setWorkStatus('not-working');
      setIsWorking(false);
      
      const totalHrs = Number(todayAttendance.totalHoursComputed) || 0;
      const hrs = Math.floor(totalHrs);
      const mins = Math.round((totalHrs - hrs) * 60);
      setTotalWorkedToday(`${hrs}h ${mins}m`);
      setWorkHours(hrs);
      setWorkMinutes(mins);
      setWorkSeconds(0);
      
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [isClockedIn, isClockedOut, todayAttendance]);

  useEffect(() => {
    if (isClockedIn && !timerInterval) {
      const interval = setInterval(() => {
        setWorkSeconds(prev => {
          if (prev >= 59) {
            setWorkMinutes(m => {
              if (m >= 59) {
                setWorkHours(h => h + 1);
                return 0;
              }
              return m + 1;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      setTimerInterval(interval);
    }
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isClockedIn]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('workSessions');
    if (savedSessions) {
      try {
        setWorkSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error('Error loading work sessions:', e);
      }
    }

    const savedLeaves = localStorage.getItem('leaveHistory');
    if (savedLeaves) {
      try {
        setLeaveHistory(JSON.parse(savedLeaves));
      } catch (e) {
        console.error('Error loading leave history:', e);
      }
    }
  }, []);

  // Handle Start Work - uses API with moment
  const handleStartWork = async () => {
    try {
      // Set start time using moment
      const now = moment();
      setStartTime(now);
      
      await clockIn();
      setSuccessMessage(`Work started at ${now.format('hh:mm A')}`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Failed to start work:', error);
    }
  };

  // Handle Stop Work - uses API with moment
  const handleStopWork = async () => {
    try {
      const now = moment();
      const start = startTime || moment(todayAttendance?.clockInTimestamp);
      
      // Calculate duration using moment
      const duration = moment.duration(now.diff(start));
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const seconds = duration.seconds();
      
      await clockOut();
      
      const totalHrs = totalHoursToday || 0;
      const hrs = Math.floor(totalHrs);
      const mins = Math.round((totalHrs - hrs) * 60);
      
      setSuccessMessage(
        `Work session completed! Duration: ${hrs}h ${mins}m | ` +
        `Started: ${start.format('hh:mm A')} | Ended: ${now.format('hh:mm A')}`
      );
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      // Save work session with moment timestamps
      const session: WorkSession = {
        id: `WS-${Date.now()}`,
        date: now.format('YYYY-MM-DD'),
        startTime: start.toISOString(),
        endTime: now.toISOString(),
        duration: duration.asSeconds(),
        status: 'working'
      };
      
      const updatedSessions = [session, ...workSessions];
      setWorkSessions(updatedSessions);
      localStorage.setItem('workSessions', JSON.stringify(updatedSessions));
      
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    } catch (error) {
      console.error('Failed to stop work:', error);
    }
  };

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleLeaveImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLeaveRequest({ ...leaveRequest, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLeaveRequest({ ...leaveRequest, imageFile: file, imagePreview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitLeave = () => {
    if (!leaveRequest.fromDate || !leaveRequest.toDate || !leaveRequest.reason) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate dates with moment
    const fromDate = moment(leaveRequest.fromDate);
    const toDate = moment(leaveRequest.toDate);
    
    if (toDate.isBefore(fromDate)) {
      alert('End date cannot be before start date');
      return;
    }

    const newLeave: LeaveRequest = {
      id: `L-${String(leaveHistory.length + 1).padStart(3, '0')}`,
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
    
    setSuccessMessage(`Leave request submitted for ${fromDate.format('MMM D')} - ${toDate.format('MMM D, YYYY')}`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

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

  const getTodayHoursDisplay = () => {
    if (isClockedIn) {
      return formatTime(workHours, workMinutes, workSeconds);
    } else if (isClockedOut) {
      return `${Math.floor(totalHoursToday)}h ${Math.round((totalHoursToday - Math.floor(totalHoursToday)) * 60)}m`;
    }
    return totalWorkedToday || '0h 0m';
  };

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
          <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium ${statusBadge.class}`}>
            {statusBadge.label}
          </span>
          <span className={`text-xs sm:text-sm ${tc.textSecondary}`}>
            {isClockedIn && startTime && `Started at: ${startTime.format('hh:mm A')}`}
            {isClockedIn && !startTime && todayAttendance?.clockInTimestamp && `Started at: ${moment(todayAttendance.clockInTimestamp).format('hh:mm A')}`}
            {isClockedOut && todayAttendance && `Completed at: ${moment(todayAttendance.clockOutTimestamp).format('hh:mm A')}`}
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
                setWorkStatus('not-working');
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-amber-500/30 transition-all"
            >
              🔄 Start New Session
            </button>
          )}
          {workStatus === 'on-leave' && (
            <button
              type="button"
              onClick={() => {
                setWorkStatus('not-working');
                setShowLeaveModal(true);
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-amber-500/30 transition-all"
            >
              ✏️ Modify Leave
            </button>
          )}
        </div>
      </div>

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Apply for Leave</h3>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className={`p-1.5 rounded-lg ${tc.textMuted} hover:${tc.text} transition-colors`}
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${tc.text} mb-1.5`}>Leave Type</label>
                <select
                  value={leaveRequest.type}
                  onChange={(e) => setLeaveRequest({ ...leaveRequest, type: e.target.value as any })}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
                >
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Earned">Earned Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={`block text-sm font-medium ${tc.text} mb-1.5`}>From Date</label>
                  <input
                    type="date"
                    value={leaveRequest.fromDate}
                    onChange={(e) => setLeaveRequest({ ...leaveRequest, fromDate: e.target.value })}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${tc.text} mb-1.5`}>To Date</label>
                  <input
                    type="date"
                    value={leaveRequest.toDate}
                    onChange={(e) => setLeaveRequest({ ...leaveRequest, toDate: e.target.value })}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${tc.text} mb-1.5`}>Reason</label>
                <textarea
                  value={leaveRequest.reason}
                  onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave..."
                  rows={3}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none resize-none transition-all text-sm`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${tc.text} mb-1.5`}>Supporting Document (Optional)</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className={`px-3 sm:px-4 py-2 sm:py-2.5 ${tc.btnBg} rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-all hover:scale-105 flex items-center gap-2`}>
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    Upload Document
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleLeaveImageUpload}
                      className="hidden"
                    />
                  </label>
                  {leaveRequest.imagePreview && (
                    <div className="flex items-center gap-2">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border ${tc.border}">
                        <img src={leaveRequest.imagePreview} alt="Leave document" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLeaveRequest({ ...leaveRequest, imageFile: null, imagePreview: null });
                        }}
                        className={`p-1 rounded-lg ${tc.textMuted} hover:text-rose-400 transition-colors`}
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className={`text-[10px] sm:text-xs ${tc.textMuted} mt-1`}>
                  Upload medical certificate, or any supporting document (optional)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className={`w-full sm:w-auto px-4 py-2 ${tc.border} ${tc.textSecondary} rounded-xl text-sm font-medium ${tc.bgTableHover} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitLeave}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  Submit Leave Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 ${tc.border} border-t flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs ${tc.textMuted}">
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

export default DashboardTab;