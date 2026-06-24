// EmployeeDashboard.tsx - Complete with all components including My Team and Messages
import React, { useState, useEffect } from 'react';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  CalendarDaysIcon,
  UserGroupIcon,
  ArrowUpTrayIcon,
  LinkIcon,
  CheckBadgeIcon,
  PaperAirplaneIcon,
  HomeIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  BanknotesIcon,
  SunIcon,
  MoonIcon,
  InboxIcon,
  EnvelopeIcon,
  TrashIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisHorizontalIcon,
  StarIcon,
  UserPlusIcon,
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

// Use EnvelopeIcon as MailIcon
const MailIcon = EnvelopeIcon;

import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Types
interface Message {
  id: string;
  sender: string;
  senderRole: 'Employee' | 'Manager' | 'HR' | 'Super Admin';
  receiver: string;
  receiverRole: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  category: 'General' | 'HR' | 'Payroll' | 'IT' | 'Leave' | 'Other';
}

// Payslip Data Interface
interface PayslipData {
  employeeId: string;
  name: string;
  designation: string;
  email: string;
  payPeriod: string;
  paymentDate: string;
  earnings: {
    basic: number;
    hra: number;
    special: number;
    performanceBonus: number;
  };
  deductions: {
    providentFund: number;
    tds: number;
    professionalTax: number;
  };
}

// Team Member Interface
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  location: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  avatar?: string;
  joinDate: string;
  reportsTo: string;
  skills: string[];
  projects: string[];
}

// Chat Message Interface
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  read: boolean;
}

// Sub-components for each tab content
const DashboardTab: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const { user } = useAuth();
  const [isWorking, setIsWorking] = useState(false);
  const [workHours, setWorkHours] = useState(0);
  const [workMinutes, setWorkMinutes] = useState(0);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalWorkedToday, setTotalWorkedToday] = useState('0h 0m');

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#1a2744]',
        bgCardHover: 'hover:bg-[#243555]',
        border: 'border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        shadow: 'shadow-xl shadow-black/20',
        statBg: 'bg-[#0d1f3c]',
        input: 'bg-[#0d1f3c] border-white/10 text-white placeholder:text-blue-300/40',
        tableHeader: 'bg-[#0d1f3c] text-blue-300/60',
        badge: 'bg-indigo-500/20 text-indigo-400',
        timerBg: 'bg-[#0d1f3c]',
        timerText: 'text-blue-200',
        statusActive: 'bg-emerald-500/20 text-emerald-400',
        statusInactive: 'bg-rose-500/20 text-rose-400',
      };
    }
    return {
      bgCard: 'bg-white/80 backdrop-blur-sm',
      bgCardHover: 'hover:bg-gray-50/80',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      shadow: 'shadow-lg shadow-indigo-500/5',
      statBg: 'bg-white',
      input: 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
      tableHeader: 'bg-gray-50 text-gray-500',
      badge: 'bg-indigo-100 text-indigo-700',
      timerBg: 'bg-gray-50',
      timerText: 'text-gray-700',
      statusActive: 'bg-green-100 text-green-700',
      statusInactive: 'bg-red-100 text-red-700',
    };
  };

  const tc = getThemeClasses();

  // Timer logic
  useEffect(() => {
    const savedState = localStorage.getItem('workTimerState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.isWorking && parsed.startTime) {
        const start = new Date(parsed.startTime);
        const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        setWorkHours(hours);
        setWorkMinutes(minutes);
        setWorkSeconds(seconds);
        setIsWorking(true);
        setStartTime(start);
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
  }, []);

  const startWork = () => {
    const now = new Date();
    setIsWorking(true);
    setStartTime(now);
    localStorage.setItem('workTimerState', JSON.stringify({
      isWorking: true,
      startTime: now.toISOString()
    }));

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
  };

  const stopWork = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsWorking(false);
    
    const totalSeconds = workHours * 3600 + workMinutes * 60 + workSeconds;
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMins = Math.floor((totalSeconds % 3600) / 60);
    setTotalWorkedToday(`${totalHours}h ${totalMins}m`);
    
    localStorage.removeItem('workTimerState');
  };

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const stats = [
    { label: "Today's Hours", value: isWorking ? formatTime(workHours, workMinutes, workSeconds) : totalWorkedToday || '0h 0m', icon: ClockIcon, subtitle: isWorking ? '⏳ Working...' : 'Ready to start' },
    { label: 'Login Time', value: startTime ? startTime.toLocaleTimeString() : '—', icon: ClockIcon, subtitle: startTime ? `Status: ${isWorking ? '🟢 Active' : '🔴 Stopped'}` : 'Not logged in' },
    { label: 'Tasks Open', value: '1', icon: CheckCircleIcon, subtitle: '0 completed this week' },
    { label: 'Leave Balance', value: '12d', icon: CalendarDaysIcon, subtitle: '3 pending requests' }
  ];

  return (
    <>
      {/* Timer Controls */}
      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} mb-8 transition-all duration-500 ${isWorking ? 'ring-2 ring-emerald-500/50' : ''}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${tc.timerBg} ${tc.border} border`}>
              <div className="flex items-center gap-3">
                <ClockIcon className={`w-6 h-6 ${isWorking ? 'text-emerald-400 animate-pulse' : tc.textMuted}`} />
                <div>
                  <p className={`text-2xl font-mono font-bold ${isWorking ? 'text-emerald-400' : tc.text}`}>
                    {isWorking ? formatTime(workHours, workMinutes, workSeconds) : '00:00:00'}
                  </p>
                  <p className={`text-xs ${tc.textMuted}`}>
                    {isWorking ? '🟢 Timer running' : '⏸️ Timer stopped'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium ${tc.text}`}>Today's Progress</p>
              <p className={`text-xs ${tc.textSecondary}`}>
                {isWorking ? 'Click stop when you finish' : 'Start tracking your work hours'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isWorking ? (
              <button
                type="button"
                onClick={startWork}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center gap-2 group"
                aria-label="Start work timer"
              >
                <PlayIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Work
              </button>
            ) : (
              <button
                type="button"
                onClick={stopWork}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 flex items-center gap-2 group"
                aria-label="Stop work timer"
              >
                <StopIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Stop Work
              </button>
            )}
          </div>
        </div>
        {isWorking && (
          <div className="mt-4 pt-4 ${tc.border} border-t flex items-center gap-4 text-xs ${tc.textMuted}">
            <span>Started at: {startTime?.toLocaleTimeString()}</span>
            <span className="w-px h-4 bg-gray-300/30"></span>
            <span>Elapsed: {formatTime(workHours, workMinutes, workSeconds)}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} ${tc.bgCardHover} transition-all duration-300 group cursor-pointer hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${tc.textSecondary}`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${tc.text} ${stat.label === "Today's Hours" && isWorking ? 'text-emerald-400' : ''}`}>{stat.value}</p>
                <p className={`text-xs ${tc.textMuted}`}>{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-xl bg-indigo-500/10 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className={`lg:col-span-2 ${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-4`}>Today's Working Progress</h3>
          <p className={`text-sm ${tc.textSecondary} mb-4`}>111.5h logged this month - 14 present days</p>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="w-full bg-gray-200/20 rounded-full h-4">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-4 rounded-full transition-all duration-1000" style={{ width: isWorking ? `${Math.min((workHours * 3600 + workMinutes * 60 + workSeconds) / 28800 * 100, 100)}%` : '65%' }}></div>
              </div>
              <div className={`flex justify-between mt-2 text-sm ${tc.textMuted}`}>
                <span>100% DAY</span>
                <span>LOGIN 09:18</span>
                <span>LOGOUT 18:32</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-4`}>Team & Project</h3>
          <p className={`text-sm ${tc.textSecondary} mb-4`}>Your current assignment</p>
          <div className="space-y-3 text-sm">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-4`}>Attendance Calendar</h3>
          <p className={`text-sm ${tc.textSecondary} mb-4`}>June 2026 - previous days are read-only</p>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
              <div key={i} className={`text-xs ${tc.textMuted} font-medium py-1`}>{day}</div>
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
                <div key={date} className={`py-1 rounded ${bgColor} ${textColor}`}>
                  {date}
                </div>
              );
            })}
          </div>
          <div className={`flex flex-wrap gap-3 mt-4 pt-4 ${tc.border} border-t`}>
            <span className={`flex items-center text-xs ${tc.textSecondary}`}><span className="w-3 h-3 bg-emerald-500/30 rounded inline-block mr-1"></span> Working</span>
            <span className={`flex items-center text-xs ${tc.textSecondary}`}><span className="w-3 h-3 bg-blue-500/30 rounded inline-block mr-1"></span> WFH</span>
            <span className={`flex items-center text-xs ${tc.textSecondary}`}><span className="w-3 h-3 bg-amber-500/30 rounded inline-block mr-1"></span> Half-Day</span>
            <span className={`flex items-center text-xs ${tc.textSecondary}`}><span className="w-3 h-3 bg-rose-500/30 rounded inline-block mr-1"></span> Leave</span>
            <span className={`flex items-center text-xs ${tc.textSecondary}`}><span className="w-3 h-3 bg-purple-500/30 rounded inline-block mr-1"></span> Holiday</span>
          </div>
        </div>

        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-4`}>Monthly Summary</h3>
          <div className="space-y-3">
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

const AttendanceTab: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#1a2744]',
        bgCardHover: 'hover:bg-[#243555]',
        border: 'border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        shadow: 'shadow-xl shadow-black/20',
      };
    }
    return {
      bgCard: 'bg-white/80 backdrop-blur-sm',
      bgCardHover: 'hover:bg-gray-50/80',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      shadow: 'shadow-lg shadow-indigo-500/5',
    };
  };

  const tc = getThemeClasses();

  return (
    <div className="space-y-6">
      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-4`}>Attendance Calendar</h3>
        <p className={`text-sm ${tc.textSecondary} mb-4`}>June 2026 - previous days are read-only</p>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
            <div key={i} className={`text-xs ${tc.textMuted} font-medium py-1`}>{day}</div>
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
              <div key={date} className={`py-1 rounded ${bgColor} ${textColor}`}>
                {date}
              </div>
            );
          })}
        </div>
        <div className={`flex flex-wrap gap-3 mt-4 pt-4 ${tc.border} border-t`}>
          <span className={`flex items-center text-xs ${tc.textSecondary}`}><span className="w-3 h-3 bg-emerald-500/30 rounded inline-block mr-1"></span> Working</span>
          <span className={`flex items-center text-xs ${tc.textSecondary}`}><span className="w-3 h-3 bg-blue-500/30 rounded inline-block mr-1"></span> WFH</span>
          <span className={`flex items-center text-xs ${tc.textSecondary}`}><span className="w-3 h-3 bg-amber-500/30 rounded inline-block mr-1"></span> Half-Day</span>
          <span className={`flex items-center text-xs ${tc.textSecondary}`}><span className="w-3 h-3 bg-rose-500/30 rounded inline-block mr-1"></span> Leave</span>
          <span className={`flex items-center text-xs ${tc.textSecondary}`}><span className="w-3 h-3 bg-purple-500/30 rounded inline-block mr-1"></span> Holiday</span>
        </div>
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-4`}>Monthly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <p className="text-2xl font-bold text-emerald-400">14</p>
            <p className={`text-xs ${tc.textSecondary}`}>Present</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <p className="text-2xl font-bold text-blue-400">0</p>
            <p className={`text-xs ${tc.textSecondary}`}>WFH</p>
          </div>
          <div className="text-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <p className="text-2xl font-bold text-amber-400">0</p>
            <p className={`text-xs ${tc.textSecondary}`}>Half-Day</p>
          </div>
          <div className="text-center p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <p className="text-2xl font-bold text-rose-400">2</p>
            <p className={`text-xs ${tc.textSecondary}`}>Leave</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className={`text-sm ${tc.textSecondary}`}>Total Hours: <span className="font-bold text-indigo-400">111.5</span></p>
        </div>
      </div>
    </div>
  );
};

const TasksTab: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#1a2744]',
        bgCardHover: 'hover:bg-[#243555]',
        border: 'border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        shadow: 'shadow-xl shadow-black/20',
        input: 'bg-[#0d1f3c] border-white/10 text-white placeholder:text-blue-300/40',
        bgGray: 'bg-[#0d1f3c]',
        statusActive: 'bg-indigo-600 text-white',
        statusInactive: 'bg-[#0d1f3c] text-blue-200/70',
      };
    }
    return {
      bgCard: 'bg-white/80 backdrop-blur-sm',
      bgCardHover: 'hover:bg-gray-50/80',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      shadow: 'shadow-lg shadow-indigo-500/5',
      input: 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
      bgGray: 'bg-gray-50',
      statusActive: 'bg-indigo-600 text-white',
      statusInactive: 'bg-gray-100 text-gray-600',
    };
  };

  const tc = getThemeClasses();

  const [taskStatus, setTaskStatus] = useState<'In Progress' | 'Completed' | 'Pending'>('In Progress');
  const [jiraUrl, setJiraUrl] = useState('');
  const [dailyUpdate, setDailyUpdate] = useState('');

  const assignedTasks = [
    { title: 'Migrate auth flow to OAuth 2.1', project: 'Atlas Core', due: '2026-06-08' },
  ];

  const jiraHistory = [
    { id: 'ATL-1284', title: 'OAuth 2.1 token rotation', date: '2026-06-01' },
    { id: 'ATL-1271', title: 'Refresh middleware retry policy', date: '2026-05-29' },
    { id: 'ORI-441', title: 'Payslip PDF service spike', date: '2026-05-27' },
  ];

  return (
    <div className="space-y-6">
      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-2`}>Today's Work Submission</h3>
        <p className={`text-sm ${tc.textSecondary} mb-6`}>Submit your daily standup, achievements & blockers</p>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2`}>Status</label>
            <div className="flex gap-3">
              {(['In Progress', 'Completed', 'Pending'] as const).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setTaskStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    taskStatus === status
                      ? tc.statusActive + ' shadow-lg shadow-indigo-500/25'
                      : tc.statusInactive + ' hover:bg-gray-200'
                  }`}
                  aria-label={`Set task status to ${status}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2`}>Jira Ticket URL</label>
            <div className="flex items-center gap-2">
              <LinkIcon className={`w-5 h-5 ${tc.textMuted}`} />
              <input
                type="url"
                value={jiraUrl}
                onChange={(e) => setJiraUrl(e.target.value)}
                placeholder="https://.../browse/ATL-1284"
                className={`flex-1 px-4 py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all`}
                aria-label="Jira ticket URL"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2`}>Assigned Tasks</label>
            {assignedTasks.map((task, index) => (
              <div key={index} className={`flex items-center justify-between p-3 ${tc.bgGray} rounded-xl`}>
                <div>
                  <p className={`text-sm font-medium ${tc.text}`}>{task.title}</p>
                  <p className={`text-xs ${tc.textMuted}`}>{task.project} - due {task.due}</p>
                </div>
                <CheckBadgeIcon className="w-5 h-5 text-emerald-400" />
              </div>
            ))}
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2`}>Daily Update</label>
            <textarea
              value={dailyUpdate}
              onChange={(e) => setDailyUpdate(e.target.value)}
              placeholder="What did you ship today? Any blockers or notes for your manager..."
              rows={3}
              className={`w-full px-4 py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none resize-none transition-all`}
              aria-label="Daily update"
            />
          </div>

          <button 
            type="button"
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            aria-label="Submit daily update"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            Submit daily update
          </button>
        </div>
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-4`}>Jira History</h3>
        <p className={`text-sm ${tc.textSecondary} mb-4`}>Recent ticket references</p>
        <div className="space-y-3">
          {jiraHistory.map((ticket, index) => (
            <div key={index} className={`flex items-center justify-between p-3 ${tc.border} border-b last:border-0`}>
              <div>
                <p className="text-sm font-medium text-indigo-400">{ticket.id}</p>
                <p className={`text-sm ${tc.text}`}>{ticket.title}</p>
              </div>
              <span className={`text-xs ${tc.textMuted}`}>{ticket.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LeaveTab: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#1a2744]',
        bgCardHover: 'hover:bg-[#243555]',
        border: 'border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        shadow: 'shadow-xl shadow-black/20',
        statusApproved: 'bg-emerald-500/20 text-emerald-400',
        statusPending: 'bg-amber-500/20 text-amber-400',
        statusRejected: 'bg-rose-500/20 text-rose-400',
      };
    }
    return {
      bgCard: 'bg-white/80 backdrop-blur-sm',
      bgCardHover: 'hover:bg-gray-50/80',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      shadow: 'shadow-lg shadow-indigo-500/5',
      statusApproved: 'bg-green-100 text-green-700',
      statusPending: 'bg-yellow-100 text-yellow-700',
      statusRejected: 'bg-red-100 text-red-700',
    };
  };

  const tc = getThemeClasses();

  const leaveHistory = [
    { id: 'L-9821', type: 'Casual Leave', from: '2026-05-12', to: '2026-05-12', days: 1, status: 'Approved' as const },
    { id: 'L-9874', type: 'Sick Leave', from: '2026-05-22', to: '2026-05-23', days: 2, status: 'Approved' as const },
    { id: 'L-9912', type: 'Earned Leave', from: '2026-06-15', to: '2026-06-17', days: 3, status: 'Pending' as const },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return tc.statusApproved;
      case 'Pending': return tc.statusPending;
      case 'Rejected': return tc.statusRejected;
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Sick Leave</h4>
          <p className={`text-2xl font-bold ${tc.text}`}>4 / 10</p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Earned Leave</h4>
          <p className={`text-2xl font-bold ${tc.text}`}>9 / 18</p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Pending Requests</h4>
          <p className="text-2xl font-bold text-amber-400">3</p>
          <p className={`text-xs ${tc.textMuted}`}>awaiting approval</p>
        </div>
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-4`}>Leave History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${tc.border} border-b`}>
                <th className={`text-left text-xs font-medium ${tc.textMuted} py-3 px-2`}>ID</th>
                <th className={`text-left text-xs font-medium ${tc.textMuted} py-3 px-2`}>Type</th>
                <th className={`text-left text-xs font-medium ${tc.textMuted} py-3 px-2`}>From – To</th>
                <th className={`text-left text-xs font-medium ${tc.textMuted} py-3 px-2`}>Days</th>
                <th className={`text-left text-xs font-medium ${tc.textMuted} py-3 px-2`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory.map((leave) => (
                <tr key={leave.id} className={`${tc.border} border-b ${tc.bgCardHover} transition`}>
                  <td className="py-3 px-2 text-sm font-medium text-indigo-400">{leave.id}</td>
                  <td className={`py-3 px-2 text-sm ${tc.text}`}>{leave.type}</td>
                  <td className={`py-3 px-2 text-sm ${tc.textSecondary}`}>{leave.from} – {leave.to}</td>
                  <td className={`py-3 px-2 text-sm ${tc.text}`}>{leave.days}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PayslipsTab: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const { user } = useAuth();
  
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#1a2744]',
        bgCardHover: 'hover:bg-[#243555]',
        border: 'border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        shadow: 'shadow-xl shadow-black/20',
        btnBg: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30',
        input: 'bg-[#0d1f3c] border-white/10 text-white placeholder:text-blue-300/40',
      };
    }
    return {
      bgCard: 'bg-white/80 backdrop-blur-sm',
      bgCardHover: 'hover:bg-gray-50/80',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      shadow: 'shadow-lg shadow-indigo-500/5',
      btnBg: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
      input: 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
    };
  };

  const tc = getThemeClasses();

  // Generate payslip data based on user or default
  const generatePayslipData = (employeeName?: string): PayslipData => {
    const baseSalary = 145390;
    const hra = Math.round(baseSalary * 0.4);
    const special = Math.round(baseSalary * 0.3);
    const bonus = Math.round(baseSalary * 0.1);
    const pf = Math.round(baseSalary * 0.12);
    const tds = Math.round(baseSalary * 0.08);
    const pt = 200;

    return {
      employeeId: user?.id || 'SE-118',
      name: employeeName || user?.name || 'Karan Singh',
      designation: ((user as any)?.designation) || 'Backend Engineer',
      email: user?.email || 'karan.singh@serveasein.com',
      payPeriod: 'May 2026',
      paymentDate: '2026-05-31',
      earnings: {
        basic: baseSalary,
        hra: hra,
        special: special,
        performanceBonus: bonus,
      },
      deductions: {
        providentFund: pf,
        tds: tds,
        professionalTax: pt,
      }
    };
  };

  const downloadPayslip = (employeeName?: string) => {
    const data = generatePayslipData(employeeName);
    
    const totalEarnings = Object.values(data.earnings).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(data.deductions).reduce((a, b) => a + b, 0);
    const netPayable = totalEarnings - totalDeductions;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: #f0f2f5; 
            padding: 40px 20px;
          }
          .payslip { 
            max-width: 900px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 16px; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.12); 
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #1a2744 0%, #2a3f6a 100%); 
            color: white; 
            padding: 35px 40px;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
          }
          .header h1 { 
            font-size: 28px; 
            font-weight: 700;
            letter-spacing: 1px;
          }
          .header .sub { 
            opacity: 0.8; 
            font-size: 14px; 
            font-weight: 300;
            margin-top: 4px;
          }
          .header .company { 
            font-size: 12px; 
            opacity: 0.6; 
            margin-top: 8px;
          }
          .header .badge {
            position: absolute;
            right: 40px;
            top: 35px;
            background: rgba(255,255,255,0.15);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .employee-details { 
            padding: 25px 40px; 
            background: #f8fafc; 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 8px 24px; 
            border-bottom: 2px solid #e2e8f0;
          }
          .employee-details .label { 
            color: #64748b; 
            font-size: 11px; 
            font-weight: 600; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .employee-details .value { 
            color: #0f172a; 
            font-size: 14px; 
            font-weight: 500;
          }
          .table-section { 
            padding: 30px 40px; 
          }
          .table-section h2 { 
            font-size: 16px; 
            color: #1a2744; 
            margin-bottom: 20px;
            font-weight: 600;
          }
          table { 
            width: 100%; 
            border-collapse: collapse;
          }
          th { 
            background: #f1f5f9; 
            color: #475569; 
            font-weight: 600; 
            font-size: 12px; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 12px 16px; 
            text-align: left; 
            border-bottom: 2px solid #e2e8f0;
          }
          td { 
            padding: 12px 16px; 
            border-bottom: 1px solid #f1f5f9; 
            font-size: 14px;
          }
          .total-row { 
            background: #f8fafc; 
            font-weight: 600;
          }
          .total-row td {
            border-bottom: 2px solid #e2e8f0;
          }
          .net-row {
            background: #ecfdf5;
          }
          .net-row td {
            border-bottom: none;
            padding: 16px;
          }
          .amount { 
            font-family: 'Courier New', monospace;
            font-weight: 500;
          }
          .footer { 
            padding: 20px 40px; 
            background: #f8fafc; 
            border-top: 2px solid #e2e8f0; 
            font-size: 12px; 
            color: #94a3b8; 
            text-align: center;
          }
          .footer strong {
            color: #64748b;
          }
          @media print {
            body { padding: 0; background: white; }
            .payslip { box-shadow: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="payslip">
          <div class="header">
            <h1>ServEase</h1>
            <div class="sub">INNOVATION PVT LTD</div>
            <div class="company">TOWER B, Cyber Hub, Gurugram, Haryana 122002, India</div>
            <div class="company">CIN: U72900HR2021PTC000000 • people@serveasein.com</div>
            <div class="badge">📄 PAYSLIP</div>
          </div>
          
          <div class="employee-details">
            <div><span class="label">Employee ID</span><div class="value">${data.employeeId}</div></div>
            <div><span class="label">Name</span><div class="value">${data.name}</div></div>
            <div><span class="label">Designation</span><div class="value">${data.designation}</div></div>
            <div><span class="label">Email</span><div class="value">${data.email}</div></div>
            <div><span class="label">Pay Period</span><div class="value">${data.payPeriod}</div></div>
            <div><span class="label">Payment Date</span><div class="value">${data.paymentDate}</div></div>
          </div>

          <div class="table-section">
            <h2>📊 Salary Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th style="width:40%">Earnings</th>
                  <th style="width:10%;text-align:right">Amount</th>
                  <th style="width:40%">Deductions</th>
                  <th style="width:10%;text-align:right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>💰 Basic</td>
                  <td style="text-align:right" class="amount">₹${data.earnings.basic.toLocaleString()}</td>
                  <td>🏦 Provident Fund</td>
                  <td style="text-align:right" class="amount">₹${data.deductions.providentFund.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>🏠 House Rent Allowance</td>
                  <td style="text-align:right" class="amount">₹${data.earnings.hra.toLocaleString()}</td>
                  <td>📊 TDS</td>
                  <td style="text-align:right" class="amount">₹${data.deductions.tds.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>⭐ Special Allowance</td>
                  <td style="text-align:right" class="amount">₹${data.earnings.special.toLocaleString()}</td>
                  <td>📋 Professional Tax</td>
                  <td style="text-align:right" class="amount">₹${data.deductions.professionalTax.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>🎯 Performance Bonus</td>
                  <td style="text-align:right" class="amount">₹${data.earnings.performanceBonus.toLocaleString()}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr class="total-row">
                  <td><strong>📈 Total Earnings</strong></td>
                  <td style="text-align:right" class="amount"><strong>₹${totalEarnings.toLocaleString()}</strong></td>
                  <td><strong>📉 Total Deductions</strong></td>
                  <td style="text-align:right" class="amount"><strong>₹${totalDeductions.toLocaleString()}</strong></td>
                </tr>
                <tr class="net-row">
                  <td colspan="3" style="text-align:right; font-size:18px; font-weight:700; color:#065f46;">
                    💰 Net Payable
                  </td>
                  <td style="text-align:right; font-size:20px; font-weight:700; color:#065f46;" class="amount">
                    ₹${netPayable.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            This is a system-generated payslip and does not require a signature.<br>
            <strong>© 2026 ServEase Innovation Private Limited</strong> • All rights reserved
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${data.employeeId}_${data.payPeriod.replace(' ', '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const payslips = [
    { month: 'May 2026', paidOn: '2026-05-31', gross: '₹1,45,390', net: '₹1,18,849' },
    { month: 'April 2026', paidOn: '2026-04-30', gross: '₹1,42,500', net: '₹1,16,535' },
    { month: 'March 2026', paidOn: '2026-03-31', gross: '₹1,42,500', net: '₹1,16,535' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-transform duration-300`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Sick Leave</h4>
          <p className={`text-2xl font-bold ${tc.text}`}>4 / 10</p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-transform duration-300`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Earned Leave</h4>
          <p className={`text-2xl font-bold ${tc.text}`}>9 / 18</p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-transform duration-300`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Total Earned</h4>
          <p className="text-2xl font-bold text-emerald-400">₹3,52,274</p>
          <p className={`text-xs ${tc.textMuted}`}>last 3 months</p>
        </div>
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`font-semibold ${tc.text} mb-1`}>Payslips</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Download your monthly payslip with ServEase branding</p>
          </div>
          <button
            type="button"
            onClick={() => downloadPayslip()}
            className={`px-4 py-2 ${tc.btnBg} rounded-xl transition-all duration-300 text-sm font-medium flex items-center gap-2 hover:scale-105`}
            aria-label="Generate current payslip"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Generate Current
          </button>
        </div>
        
        <div className="space-y-4">
          {payslips.map((payslip, index) => (
            <div key={index} className={`flex flex-col md:flex-row md:items-center justify-between p-4 ${tc.border} border rounded-2xl ${tc.bgCardHover} transition-all duration-300 hover:shadow-md hover:scale-[1.01]`}>
              <div>
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className={`w-8 h-8 ${tc.textMuted}`} />
                  <div>
                    <h4 className={`font-semibold ${tc.text}`}>{payslip.month}</h4>
                    <p className={`text-xs ${tc.textMuted}`}>Paid on {payslip.paidOn}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 ml-11">
                  <span className={`text-sm ${tc.textSecondary}`}>Gross: <span className={`font-medium ${tc.text}`}>{payslip.gross}</span></span>
                  <span className={`text-sm ${tc.textSecondary}`}>Net: <span className="font-medium text-emerald-400">{payslip.net}</span></span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => downloadPayslip()}
                className={`mt-3 md:mt-0 flex items-center gap-2 px-4 py-2 ${tc.btnBg} rounded-xl transition-all duration-300 text-sm font-medium hover:scale-105`}
                aria-label={`Download payslip for ${payslip.month}`}
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// My Team Tab - New Component
const MyTeamTab: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#1a2744]',
        bgCardHover: 'hover:bg-[#243555]',
        border: 'border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        shadow: 'shadow-xl shadow-black/20',
        input: 'bg-[#0d1f3c] border-white/10 text-white placeholder:text-blue-300/40',
        statusOnline: 'bg-emerald-500/20 text-emerald-400',
        statusOffline: 'bg-gray-500/20 text-gray-400',
        statusAway: 'bg-amber-500/20 text-amber-400',
        statusBusy: 'bg-rose-500/20 text-rose-400',
      };
    }
    return {
      bgCard: 'bg-white/80 backdrop-blur-sm',
      bgCardHover: 'hover:bg-gray-50/80',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      shadow: 'shadow-lg shadow-indigo-500/5',
      input: 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
      statusOnline: 'bg-green-100 text-green-700',
      statusOffline: 'bg-gray-100 text-gray-600',
      statusAway: 'bg-yellow-100 text-yellow-700',
      statusBusy: 'bg-red-100 text-red-700',
    };
  };

  const tc = getThemeClasses();

  // Sample team members data
  const teamMembers: TeamMember[] = [
    {
      id: 'EMP-001',
      name: 'Priya Nair',
      role: 'Engineering Manager',
      email: 'priya.nair@serveasein.com',
      department: 'Engineering',
      location: 'Gurugram, India',
      status: 'online',
      joinDate: '2024-01-15',
      reportsTo: 'Aarav Mehta',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      projects: ['Atlas Core', 'HRMS Platform']
    },
    {
      id: 'EMP-002',
      name: 'Rohan Verma',
      role: 'Senior Software Engineer',
      email: 'rohan.verma@serveasein.com',
      department: 'Engineering',
      location: 'Bangalore, India',
      status: 'online',
      joinDate: '2024-03-01',
      reportsTo: 'Priya Nair',
      skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
      projects: ['Atlas Core']
    },
    {
      id: 'EMP-003',
      name: 'Ishita Roy',
      role: 'Software Engineer',
      email: 'ishita.roy@serveasein.com',
      department: 'Engineering',
      location: 'Gurugram, India',
      status: 'busy',
      joinDate: '2024-06-10',
      reportsTo: 'Priya Nair',
      skills: ['React', 'JavaScript', 'CSS', 'Figma'],
      projects: ['Atlas Core']
    },
    {
      id: 'EMP-004',
      name: 'Amit Patel',
      role: 'DevOps Engineer',
      email: 'amit.patel@serveasein.com',
      department: 'DevOps',
      location: 'Mumbai, India',
      status: 'away',
      joinDate: '2024-02-20',
      reportsTo: 'Priya Nair',
      skills: ['Kubernetes', 'Docker', 'Jenkins', 'Terraform'],
      projects: ['Atlas Core', 'CI/CD Pipeline']
    },
    {
      id: 'EMP-005',
      name: 'Sanya Kapoor',
      role: 'HR Business Partner',
      email: 'sanya.kapoor@serveasein.com',
      department: 'Human Resources',
      location: 'Gurugram, India',
      status: 'online',
      joinDate: '2023-11-01',
      reportsTo: 'Aarav Mehta',
      skills: ['Recruitment', 'Employee Relations', 'Performance Management'],
      projects: ['Talent Acquisition', 'Culture Building']
    },
    {
      id: 'EMP-006',
      name: 'Vikram Singh',
      role: 'QA Lead',
      email: 'vikram.singh@serveasein.com',
      department: 'Quality Assurance',
      location: 'Pune, India',
      status: 'offline',
      joinDate: '2024-04-15',
      reportsTo: 'Priya Nair',
      skills: ['Selenium', 'Cypress', 'Automation Testing', 'API Testing'],
      projects: ['Atlas Core', 'Testing Framework']
    },
    {
      id: 'EMP-007',
      name: 'Neha Gupta',
      role: 'Product Manager',
      email: 'neha.gupta@serveasein.com',
      department: 'Product',
      location: 'Gurugram, India',
      status: 'online',
      joinDate: '2024-01-10',
      reportsTo: 'Aarav Mehta',
      skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics'],
      projects: ['Atlas Core', 'Product Roadmap']
    }
  ];

  const departments = ['all', ...new Set(teamMembers.map(m => m.department))];
  const statuses = ['all', 'online', 'offline', 'away', 'busy'];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      online: { label: 'Online', class: tc.statusOnline },
      offline: { label: 'Offline', class: tc.statusOffline },
      away: { label: 'Away', class: tc.statusAway },
      busy: { label: 'Busy', class: tc.statusBusy },
    };
    const s = statusMap[status as keyof typeof statusMap] || statusMap.offline;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.class}`}>{s.label}</span>;
  };

  const getStatusDot = (status: string) => {
    const colors = {
      online: 'bg-emerald-500',
      offline: 'bg-gray-400',
      away: 'bg-amber-500',
      busy: 'bg-rose-500',
    };
    return <span className={`w-2.5 h-2.5 rounded-full inline-block ${colors[status as keyof typeof colors]}`}></span>;
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-indigo-400" />
            <div>
              <p className={`text-2xl font-bold ${tc.text}`}>{teamMembers.length}</p>
              <p className={`text-xs ${tc.textMuted}`}>Total Members</p>
            </div>
          </div>
        </div>
        <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
            <div>
              <p className={`text-2xl font-bold ${tc.text}`}>{teamMembers.filter(m => m.status === 'online').length}</p>
              <p className={`text-xs ${tc.textMuted}`}>Online Now</p>
            </div>
          </div>
        </div>
        <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center gap-3">
            <BriefcaseIcon className="w-8 h-8 text-blue-400" />
            <div>
              <p className={`text-2xl font-bold ${tc.text}`}>{new Set(teamMembers.map(m => m.department)).size}</p>
              <p className={`text-xs ${tc.textMuted}`}>Departments</p>
            </div>
          </div>
        </div>
        <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center gap-3">
            <BuildingOfficeIcon className="w-8 h-8 text-purple-400" />
            <div>
              <p className={`text-2xl font-bold ${tc.text}`}>{new Set(teamMembers.map(m => m.location)).size}</p>
              <p className={`text-xs ${tc.textMuted}`}>Locations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all`}
              aria-label="Search team members"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className={`px-4 py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all`}
            aria-label="Filter by department"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-4 py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all`}
            aria-label="Filter by status"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} ${tc.bgCardHover} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {getStatusDot(member.status)}
                  </div>
                </div>
                <div>
                  <h3 className={`font-semibold ${tc.text}`}>{member.name}</h3>
                  <p className={`text-sm ${tc.textSecondary}`}>{member.role}</p>
                  <p className={`text-xs ${tc.textMuted}`}>{member.id}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors" aria-label={`Chat with ${member.name}`}>
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors" aria-label={`Call ${member.name}`}>
                  <PhoneIcon className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors" aria-label={`Video call with ${member.name}`}>
                  <VideoCameraIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MailIcon className="w-4 h-4 ${tc.textMuted}" />
                <span className={tc.textSecondary}>{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPinIcon className="w-4 h-4 ${tc.textMuted}" />
                <span className={tc.textSecondary}>{member.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BuildingOfficeIcon className="w-4 h-4 ${tc.textMuted}" />
                <span className={tc.textSecondary}>{member.department}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {member.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className={`px-2 py-0.5 text-xs rounded-full ${tc.border} ${tc.textMuted}`}>
                  {skill}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${tc.border} ${tc.textMuted}`}>
                  +{member.skills.length - 3} more
                </span>
              )}
            </div>

            <div className="mt-4 pt-4 ${tc.border} border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusBadge(member.status)}
              </div>
              <div className="flex items-center gap-3 text-xs ${tc.textMuted}">
                <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className={`${tc.bgCard} p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
          <UserGroupIcon className={`w-12 h-12 ${tc.textMuted} mx-auto mb-3`} />
          <p className={tc.textSecondary}>No team members found matching your filters</p>
        </div>
      )}
    </div>
  );
};

// Messages Tab - Fixed Component
const MessagesTab: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#1a2744]',
        bgCardHover: 'hover:bg-[#243555]',
        border: 'border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        shadow: 'shadow-xl shadow-black/20',
        input: 'bg-[#0d1f3c] border-white/10 text-white placeholder:text-blue-300/40',
        bgChat: 'bg-[#0d1f3c]',
        messageSent: 'bg-indigo-500 text-white',
        messageReceived: 'bg-[#243555] text-white',
      };
    }
    return {
      bgCard: 'bg-white/80 backdrop-blur-sm',
      bgCardHover: 'hover:bg-gray-50/80',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      shadow: 'shadow-lg shadow-indigo-500/5',
      input: 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
      bgChat: 'bg-gray-50',
      messageSent: 'bg-indigo-500 text-white',
      messageReceived: 'bg-white text-gray-800',
    };
  };

  const tc = getThemeClasses();

  // Sample chat contacts
  const contacts = [
    { id: '1', name: 'Priya Nair', role: 'Engineering Manager', status: 'online', lastMessage: 'Great work on the OAuth migration!', time: '10:30 AM', unread: 2 },
    { id: '2', name: 'Aarav Mehta', role: 'Super Admin', status: 'online', lastMessage: 'Please review Q3 performance goals', time: 'Yesterday', unread: 1 },
    { id: '3', name: 'Ishita Roy', role: 'Software Engineer', status: 'busy', lastMessage: 'Can you review my PR?', time: 'Yesterday', unread: 0 },
    { id: '4', name: 'Sanya Kapoor', role: 'HR Business Partner', status: 'online', lastMessage: 'Health insurance documents ready', time: '2 days ago', unread: 0 },
    { id: '5', name: 'Amit Patel', role: 'DevOps Engineer', status: 'away', lastMessage: 'Deployment completed successfully', time: '2 days ago', unread: 0 },
    { id: '6', name: 'Neha Gupta', role: 'Product Manager', status: 'online', lastMessage: 'Product roadmap review tomorrow', time: '3 days ago', unread: 0 },
  ];

  // Sample chat messages
  const chatMessages: Record<string, ChatMessage[]> = {
    '1': [
      { id: '1', senderId: '1', senderName: 'Priya Nair', content: 'Hey Rohan, great work on the OAuth migration!', timestamp: '10:30 AM', type: 'text', read: true },
      { id: '2', senderId: 'me', senderName: 'You', content: 'Thank you Priya! The team did a great job.', timestamp: '10:32 AM', type: 'text', read: true },
      { id: '3', senderId: '1', senderName: 'Priya Nair', content: 'Please create a PR for review by EOD.', timestamp: '10:33 AM', type: 'text', read: false },
    ],
    '2': [
      { id: '1', senderId: '2', senderName: 'Aarav Mehta', content: 'Please review and confirm your Q3 performance goals by end of this week.', timestamp: 'Yesterday', type: 'text', read: false },
    ],
    '3': [
      { id: '1', senderId: '3', senderName: 'Ishita Roy', content: 'Can you please review my PR for the auth flow changes?', timestamp: 'Yesterday', type: 'text', read: true },
      { id: '2', senderId: 'me', senderName: 'You', content: 'Sure Ishita, I\'ll take a look right away.', timestamp: 'Yesterday', type: 'text', read: true },
    ],
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      read: true,
    };
    
    if (chatMessages[selectedChat]) {
      chatMessages[selectedChat].push(message);
    }
    
    setNewMessage('');
  };

  const getStatusDot = (status: string) => {
    const colors = {
      online: 'bg-emerald-500',
      offline: 'bg-gray-400',
      away: 'bg-amber-500',
      busy: 'bg-rose-500',
    };
    return <span className={`w-2 h-2 rounded-full inline-block ${colors[status as keyof typeof colors]}`}></span>;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Contacts List */}
        <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden flex flex-col`}>
          <div className="p-4 border-b ${tc.border}">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all`}
                aria-label="Search messages"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedChat(contact.id)}
                className={`p-4 cursor-pointer transition-all duration-200 border-b ${tc.border} ${tc.bgCardHover} ${
                  selectedChat === contact.id ? 'bg-indigo-500/10 border-indigo-500/30' : ''
                }`}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && setSelectedChat(contact.id)}
                aria-label={`Chat with ${contact.name}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {getStatusDot(contact.status)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${tc.text} truncate`}>{contact.name}</h4>
                      <span className={`text-xs ${tc.textMuted}`}>{contact.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${tc.textSecondary} truncate`}>{contact.lastMessage}</p>
                      {contact.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-medium">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`md:col-span-2 ${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden flex flex-col`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={`p-4 border-b ${tc.border} flex items-center gap-3`}>
                {contacts.find(c => c.id === selectedChat) && (
                  <>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {contacts.find(c => c.id === selectedChat)?.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {getStatusDot(contacts.find(c => c.id === selectedChat)?.status || 'offline')}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${tc.text}`}>
                        {contacts.find(c => c.id === selectedChat)?.name}
                      </h4>
                      <p className={`text-xs ${tc.textMuted}`}>
                        {contacts.find(c => c.id === selectedChat)?.role}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="p-2 rounded-xl hover:bg-indigo-500/10 text-indigo-400 transition-colors"
                        aria-label={`Call ${contacts.find(c => c.id === selectedChat)?.name}`}
                      >
                        <PhoneIcon className="w-5 h-5" />
                      </button>
                      <button 
                        className="p-2 rounded-xl hover:bg-indigo-500/10 text-indigo-400 transition-colors"
                        aria-label={`Video call ${contacts.find(c => c.id === selectedChat)?.name}`}
                      >
                        <VideoCameraIcon className="w-5 h-5" />
                      </button>
                      <button 
                        className="p-2 rounded-xl hover:bg-indigo-500/10 text-indigo-400 transition-colors"
                        aria-label="More options"
                      >
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin space-y-3">
                {(chatMessages[selectedChat] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-xl ${
                      msg.senderId === 'me' ? tc.messageSent : tc.messageReceived
                    }`}>
                      {msg.senderId !== 'me' && (
                        <p className={`text-xs font-medium ${tc.textMuted} mb-1`}>{msg.senderName}</p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderId === 'me' ? 'text-blue-200/70' : tc.textMuted}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className={`p-4 border-t ${tc.border}`}>
                <div className="flex items-center gap-3">
                  <button 
                    className="p-2 rounded-xl hover:bg-indigo-500/10 text-indigo-400 transition-colors"
                    aria-label="Attach file"
                  >
                    <PaperClipIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className={`flex-1 px-4 py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all`}
                    aria-label="Type a message"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-2 rounded-xl ${
                      newMessage.trim() 
                        ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                        : 'bg-gray-200/20 text-gray-400 cursor-not-allowed'
                    } transition-colors`}
                    aria-label="Send message"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className={`w-16 h-16 ${tc.textMuted} mx-auto mb-4`} />
                <h3 className={`text-lg font-semibold ${tc.text} mb-2`}>No Conversation Selected</h3>
                <p className={`text-sm ${tc.textSecondary}`}>Select a contact to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Queries Tab
const QueriesTab: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#1a2744]',
        bgCardHover: 'hover:bg-[#243555]',
        border: 'border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        shadow: 'shadow-xl shadow-black/20',
        input: 'bg-[#0d1f3c] border-white/10 text-white placeholder:text-blue-300/40',
        bgTableHover: 'hover:bg-[#243555]',
        statusActive: 'bg-indigo-600 text-white',
        statusInactive: 'bg-[#0d1f3c] text-blue-200/70',
        senderEmployee: 'bg-blue-500/20 text-blue-400',
        senderManager: 'bg-purple-500/20 text-purple-400',
        senderHR: 'bg-pink-500/20 text-pink-400',
        senderSuperAdmin: 'bg-indigo-500/20 text-indigo-400',
        categoryGeneral: 'bg-gray-500/20 text-gray-400',
        categoryHR: 'bg-pink-500/20 text-pink-400',
        categoryPayroll: 'bg-green-500/20 text-green-400',
        categoryIT: 'bg-blue-500/20 text-blue-400',
        categoryLeave: 'bg-yellow-500/20 text-yellow-400',
        categoryOther: 'bg-purple-500/20 text-purple-400',
      };
    }
    return {
      bgCard: 'bg-white/80 backdrop-blur-sm',
      bgCardHover: 'hover:bg-gray-50/80',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      shadow: 'shadow-lg shadow-indigo-500/5',
      input: 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
      bgTableHover: 'hover:bg-gray-50',
      statusActive: 'bg-indigo-600 text-white',
      statusInactive: 'bg-gray-100 text-gray-600',
      senderEmployee: 'bg-blue-100 text-blue-700',
      senderManager: 'bg-purple-100 text-purple-700',
      senderHR: 'bg-pink-100 text-pink-700',
      senderSuperAdmin: 'bg-indigo-100 text-indigo-700',
      categoryGeneral: 'bg-gray-100 text-gray-700',
      categoryHR: 'bg-pink-100 text-pink-700',
      categoryPayroll: 'bg-green-100 text-green-700',
      categoryIT: 'bg-blue-100 text-blue-700',
      categoryLeave: 'bg-yellow-100 text-yellow-700',
      categoryOther: 'bg-purple-100 text-purple-700',
    };
  };

  const tc = getThemeClasses();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'MSG-001',
      sender: 'Priya Nair',
      senderRole: 'Manager',
      receiver: 'Rohan Verma',
      receiverRole: 'Employee',
      subject: 'Task Update - OAuth Migration',
      content: 'Great progress on the OAuth migration! Please create a PR for review by EOD.',
      timestamp: '2026-06-24 10:30',
      read: false,
      category: 'IT'
    },
    {
      id: 'MSG-002',
      sender: 'Aarav Mehta',
      senderRole: 'Super Admin',
      receiver: 'Rohan Verma',
      receiverRole: 'Employee',
      subject: 'Q3 Performance Goals',
      content: 'Please review and confirm your Q3 performance goals by end of this week.',
      timestamp: '2026-06-23 16:45',
      read: false,
      category: 'General'
    },
    {
      id: 'MSG-003',
      sender: 'Sanya Kapoor',
      senderRole: 'HR',
      receiver: 'Rohan Verma',
      receiverRole: 'Employee',
      subject: 'Health Insurance Renewal',
      content: 'Annual health insurance renewal documents are ready for your review.',
      timestamp: '2026-06-23 14:20',
      read: true,
      category: 'HR'
    },
    {
      id: 'MSG-004',
      sender: 'Ishita Roy',
      senderRole: 'Employee',
      receiver: 'Rohan Verma',
      receiverRole: 'Employee',
      subject: 'Code Review Request',
      content: 'Can you please review my PR for the auth flow changes?',
      timestamp: '2026-06-22 11:15',
      read: true,
      category: 'IT'
    }
  ]);

  const [newMessage, setNewMessage] = useState({
    receiver: '',
    subject: '',
    content: '',
    category: 'General' as Message['category']
  });
  const [showCompose, setShowCompose] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Message['category'] | 'all'>('all');

  const getSenderRoleColor = (role: string) => {
    const colors = {
      'Employee': tc.senderEmployee,
      'Manager': tc.senderManager,
      'HR': tc.senderHR,
      'Super Admin': tc.senderSuperAdmin
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'General': tc.categoryGeneral,
      'HR': tc.categoryHR,
      'Payroll': tc.categoryPayroll,
      'IT': tc.categoryIT,
      'Leave': tc.categoryLeave,
      'Other': tc.categoryOther
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const handleSendMessage = () => {
    if (!newMessage.receiver || !newMessage.subject || !newMessage.content) {
      alert('Please fill in all fields');
      return;
    }

    const message: Message = {
      id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
      sender: 'Rohan Verma',
      senderRole: 'Employee',
      receiver: newMessage.receiver,
      receiverRole: 'Employee',
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: new Date().toLocaleString(),
      read: false,
      category: newMessage.category
    };

    setMessages([message, ...messages]);
    setNewMessage({ receiver: '', subject: '', content: '', category: 'General' });
    setShowCompose(false);
  };

  const markAsRead = (id: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, read: true } : msg
      )
    );
  };

  const filteredMessages = messages.filter(msg => {
    const readFilter = selectedFilter === 'all' ? true : selectedFilter === 'unread' ? !msg.read : msg.read;
    const categoryFilter = selectedCategory === 'all' || msg.category === selectedCategory;
    return readFilter && categoryFilter;
  });

  const recipients = [
    { name: 'Priya Nair', role: 'Manager' },
    { name: 'Aarav Mehta', role: 'Super Admin' },
    { name: 'Sanya Kapoor', role: 'HR' },
    { name: 'Ishita Roy', role: 'Employee' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Queries & Messages</h2>
          <p className={`text-sm ${tc.textSecondary}`}>View and respond to messages from your team and management</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowCompose(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          aria-label="Compose new message"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          Compose Message
        </button>
      </div>

      {showCompose && (
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${tc.text}`}>Compose New Message</h3>
            <button 
              type="button"
              onClick={() => setShowCompose(false)}
              className={`${tc.textMuted} hover:${tc.text}`}
              aria-label="Close compose window"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm ${tc.textSecondary} mb-1`}>Recipient</label>
              <select 
                className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                value={newMessage.receiver}
                onChange={(e) => setNewMessage({ ...newMessage, receiver: e.target.value })}
                aria-label="Select recipient"
              >
                <option value="">Select recipient</option>
                {recipients.map((r) => (
                  <option key={r.name} value={r.name}>{r.name} ({r.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm ${tc.textSecondary} mb-1`}>Category</label>
              <select 
                className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                value={newMessage.category}
                onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value as Message['category'] })}
                aria-label="Select message category"
              >
                <option value="General">General</option>
                <option value="HR">HR</option>
                <option value="Payroll">Payroll</option>
                <option value="IT">IT</option>
                <option value="Leave">Leave</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm ${tc.textSecondary} mb-1`}>Subject</label>
              <input
                type="text"
                placeholder="Enter subject..."
                className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                aria-label="Message subject"
              />
            </div>
            <div>
              <label className={`block text-sm ${tc.textSecondary} mb-1`}>Message</label>
              <textarea
                rows={4}
                placeholder="Type your message here..."
                className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none`}
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                aria-label="Message content"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowCompose(false)}
                className={`px-4 py-2 ${tc.border} ${tc.textSecondary} rounded-xl text-sm font-medium ${tc.bgTableHover} transition-colors`}
                aria-label="Cancel composing message"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSendMessage}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow} flex items-center justify-between flex-wrap gap-4`}>
        <div className="flex items-center gap-4">
          <div>
            <label className={`text-xs ${tc.textSecondary} block mb-1`}>Status</label>
            <select 
              className={`px-3 py-1.5 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'unread' | 'read')}
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div>
            <label className={`text-xs ${tc.textSecondary} block mb-1`}>Category</label>
            <select 
              className={`px-3 py-1.5 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Message['category'] | 'all')}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="General">General</option>
              <option value="HR">HR</option>
              <option value="Payroll">Payroll</option>
              <option value="IT">IT</option>
              <option value="Leave">Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className={`text-sm ${tc.textSecondary}`}>
          {filteredMessages.filter(m => !m.read).length} unread • {filteredMessages.length} total
        </div>
      </div>

      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className={`${tc.bgCard} p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
            <InboxIcon className={`w-12 h-12 ${tc.textMuted} mx-auto mb-3`} />
            <p className={tc.textSecondary}>No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${tc.bgCard} p-5 rounded-2xl ${tc.border} ${tc.shadow} ${!msg.read ? 'border-indigo-500/30 bg-indigo-500/5' : ''} ${tc.bgCardHover} transition-all cursor-pointer`}
              onClick={() => markAsRead(msg.id)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && markAsRead(msg.id)}
              aria-label={`Message from ${msg.sender}: ${msg.subject}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSenderRoleColor(msg.senderRole)}`}>
                      {msg.senderRole}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(msg.category)}`}>
                      {msg.category}
                    </span>
                    {!msg.read && (
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-medium animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                  <h3 className={`font-semibold ${tc.text}`}>{msg.subject}</h3>
                  <p className={`text-sm ${tc.textSecondary} mt-1`}>{msg.content}</p>
                  <div className={`mt-3 flex items-center gap-4 text-xs ${tc.textMuted}`}>
                    <span><strong className={tc.textSecondary}>From:</strong> {msg.sender}</span>
                    <span><strong className={tc.textSecondary}>To:</strong> {msg.receiver} ({msg.receiverRole})</span>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button 
                    type="button"
                    className={`p-1.5 text-indigo-400 ${tc.bgTableHover} rounded-xl transition-colors`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewMessage({ 
                        receiver: msg.sender, 
                        subject: `Re: ${msg.subject}`,
                        content: '',
                        category: msg.category
                      });
                      setShowCompose(true);
                    }}
                    aria-label={`Reply to ${msg.sender}`}
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    className={`p-1.5 ${tc.textMuted} ${tc.bgTableHover} rounded-xl transition-colors hover:text-rose-400`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this message?')) {
                        setMessages(messages.filter(m => m.id !== msg.id));
                      }
                    }}
                    aria-label={`Delete message from ${msg.sender}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main Employee Dashboard Component
const EmployeeDashboard: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bg: 'bg-[#0a1628]',
        scrollbar: 'scrollbar-thumb-white/10 scrollbar-track-transparent',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50/30',
      scrollbar: 'scrollbar-thumb-gray-200 scrollbar-track-transparent',
    };
  };

  const tc = getThemeClasses();

  const renderContent = () => {
    const path = location.pathname;
    
    if (path === '/dashboard' || path === '/dashboard/') {
      return <DashboardTab theme={theme} />;
    } else if (path === '/dashboard/attendance') {
      return <AttendanceTab theme={theme} />;
    } else if (path === '/dashboard/tasks') {
      return <TasksTab theme={theme} />;
    } else if (path === '/dashboard/leave') {
      return <LeaveTab theme={theme} />;
    } else if (path === '/dashboard/payslips') {
      return <PayslipsTab theme={theme} />;
    } else if (path === '/dashboard/queries') {
      return <QueriesTab theme={theme} />;
    } else if (path === '/dashboard/team') {
      return <MyTeamTab theme={theme} />;
    } else if (path === '/dashboard/messages') {
      return <MessagesTab theme={theme} />;
    } else {
      return <DashboardTab theme={theme} />;
    }
  };

  return (
    <div className={`flex h-screen ${tc.bg} transition-colors duration-300`}>
      <Sidebar role="employee" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Good day, Rohan 👋"
          subtitle={`${ ((user as any)?.designation) || 'Senior Software Engineer'} - ${user?.id || 'SE-187'}`}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
        <div className={`flex-1 overflow-y-auto p-8 ${tc.scrollbar} scrollbar-thin`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;