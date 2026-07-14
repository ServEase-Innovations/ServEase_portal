// ManagerDashboard.tsx - Complete with Daily Tasks feature
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import { 
  UsersIcon, 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  InboxIcon,
  EnvelopeIcon,
  HomeIcon,
  BuildingOffice2Icon,
  UserIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ClockIcon,
  BriefcaseIcon,
  CalendarIcon,
  MegaphoneIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChartPieIcon,
  PencilIcon,
  EyeIcon,
  SunIcon,
  MoonIcon,
  PlayIcon,
  StopIcon,
  ArrowUpTrayIcon,
  CalendarDaysIcon,
  CheckIcon,
  LinkIcon,
  MinusCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import moment from 'moment';

// Types
interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Working';
  joined: string;
  initials: string;
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  dueDate: string;
  project: string;
}

interface LeaveRequest {
  id: string;
  employee: string;
  type: 'Casual' | 'Sick' | 'Annual' | 'Earned' | 'Other';
  period: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  imageUrl?: string | null;
  submittedAt: string;
}

interface ProjectTeam {
  id: string;
  name: string;
  members: number;
  project: string;
  lead: string;
  created: string;
}

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

interface WorkSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  status: 'working' | 'on-leave' | 'not-working';
  employeeName: string;
}

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

interface TaskHistory {
  id: string;
  jiraLinks: string[];
  taskDescription: string;
  status: 'In Progress' | 'Completed' | 'Pending';
  newIdea: string;
  stylingAdded: boolean;
  imageUrl?: string | null;
  submittedAt: string;
  date: string;
}

const ManagerDashboard = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Work Timer State
  const [isWorking, setIsWorking] = useState(false);
  const [workHours, setWorkHours] = useState(0);
  const [workMinutes, setWorkMinutes] = useState(0);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [startTime, setStartTime] = useState<moment.Moment | null>(null);
  const [workStatus, setWorkStatus] = useState<'working' | 'on-leave' | 'not-working'>('not-working');
  const [totalHoursToday, setTotalHoursToday] = useState(0);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isClockedOut, setIsClockedOut] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Leave Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    type: 'Sick' as 'Sick' | 'Casual' | 'Earned' | 'Other',
    fromDate: '',
    toDate: '',
    reason: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  // Task State
  const [taskStatus, setTaskStatus] = useState<'In Progress' | 'Completed' | 'Pending'>('In Progress');
  const [jiraLinks, setJiraLinks] = useState<string[]>(['']);
  const [taskDescription, setTaskDescription] = useState('');
  const [newIdea, setNewIdea] = useState('');
  const [stylingAdded, setStylingAdded] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [taskImageFile, setTaskImageFile] = useState<File | null>(null);
  const [taskImagePreview, setTaskImagePreview] = useState<string | null>(null);
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([
    {
      id: 'TASK-001',
      jiraLinks: ['https://jira.serveasein.com/browse/ATL-1284'],
      taskDescription: 'Migrated OAuth 2.1 token rotation flow and updated middleware',
      status: 'Completed',
      newIdea: 'Add token refresh retry mechanism with exponential backoff',
      stylingAdded: true,
      imageUrl: null,
      submittedAt: '2026-06-07 17:30',
      date: '2026-06-07'
    },
    {
      id: 'TASK-002',
      jiraLinks: ['https://jira.serveasein.com/browse/ATL-1271'],
      taskDescription: 'Updated retry policy for middleware to handle 429 responses',
      status: 'Completed',
      newIdea: 'Implement circuit breaker pattern for external API calls',
      stylingAdded: false,
      imageUrl: null,
      submittedAt: '2026-06-06 16:45',
      date: '2026-06-06'
    },
    {
      id: 'TASK-003',
      jiraLinks: ['https://jira.serveasein.com/browse/ORI-441'],
      taskDescription: 'Created PDF service spike for payslip generation',
      status: 'Pending',
      newIdea: 'Add QR code for instant payslip verification',
      stylingAdded: false,
      imageUrl: null,
      submittedAt: '2026-06-05 15:20',
      date: '2026-06-05'
    }
  ]);
  const [showTaskSuccess, setShowTaskSuccess] = useState(false);
  
  // Queries state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'MSG-001',
      sender: 'Aarav Mehta',
      senderRole: 'Super Admin',
      receiver: 'Priya Nair',
      receiverRole: 'Manager',
      subject: 'Q3 Budget Approval',
      content: 'Your Q3 budget request for Platform team has been approved. Please proceed with hiring.',
      timestamp: '2026-06-24 09:30',
      read: false,
      category: 'HR'
    },
    {
      id: 'MSG-002',
      sender: 'Ishita Roy',
      senderRole: 'Employee',
      receiver: 'Priya Nair',
      receiverRole: 'Manager',
      subject: 'WFH Request',
      content: 'Requesting WFH for next week due to personal commitments. Have discussed with team.',
      timestamp: '2026-06-23 16:45',
      read: false,
      category: 'Leave'
    },
    {
      id: 'MSG-003',
      sender: 'Sanya Kapoor',
      senderRole: 'HR',
      receiver: 'Priya Nair',
      receiverRole: 'Manager',
      subject: 'New Hire Onboarding',
      content: '3 new engineers joining next month. Please prepare onboarding plan.',
      timestamp: '2026-06-23 14:20',
      read: true,
      category: 'HR'
    },
    {
      id: 'MSG-004',
      sender: 'Karan Singh',
      senderRole: 'Employee',
      receiver: 'Priya Nair',
      receiverRole: 'Manager',
      subject: 'Task Update - OAuth Migration',
      content: 'OAuth migration is 80% complete. Need review on PR #3421.',
      timestamp: '2026-06-22 11:15',
      read: true,
      category: 'IT'
    },
    {
      id: 'MSG-005',
      sender: 'Rohan Verma',
      senderRole: 'Employee',
      receiver: 'Priya Nair',
      receiverRole: 'Manager',
      subject: 'Performance Review',
      content: 'Requesting a 1:1 meeting to discuss performance goals for Q3.',
      timestamp: '2026-06-21 10:00',
      read: false,
      category: 'General'
    }
  ]);

  // Work Sessions State
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);

  const [newMessage, setNewMessage] = useState({
    receiver: '',
    subject: '',
    content: '',
    category: 'General' as Message['category']
  });
  const [showCompose, setShowCompose] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Message['category'] | 'all'>('all');

  // Determine which tab is active based on route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/overview') return 'overview';
    if (path === '/dashboard/team') return 'my-team';
    if (path === '/dashboard/project-teams') return 'project-teams';
    if (path === '/dashboard/assign-tasks') return 'assign-tasks';
    if (path === '/dashboard/tasks-board') return 'tasks-board';
    if (path === '/dashboard/daily-tasks') return 'daily-tasks';
    if (path === '/dashboard/attendance') return 'attendance';
    if (path === '/dashboard/leave-approvals') return 'leave-approvals';
    if (path === '/dashboard/performance') return 'performance';
    if (path === '/dashboard/reports') return 'reports';
    if (path === '/dashboard/queries') return 'queries';
    if (path === '/dashboard/leave') return 'leave';
    if (path === '/dashboard/payslips') return 'payslips';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Load saved work sessions and leave history
  useEffect(() => {
    const savedSessions = localStorage.getItem('managerWorkSessions');
    if (savedSessions) {
      try {
        setWorkSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error('Error loading work sessions:', e);
      }
    }

    const savedLeaves = localStorage.getItem('managerLeaveHistory');
    if (savedLeaves) {
      try {
        setLeaveHistory(JSON.parse(savedLeaves));
      } catch (e) {
        console.error('Error loading leave history:', e);
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Timer logic
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

  // Theme-aware class helpers
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bg: 'bg-[#0a1628]',
        bgCard: 'bg-[#1a2744]',
        bgCardHover: 'hover:bg-[#243555]',
        bgInput: 'bg-[#0d1f3c]',
        bgTable: 'bg-[#1a2744]',
        bgTableHover: 'hover:bg-[#243555]',
        border: 'border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        shadow: 'shadow-xl shadow-black/20',
        gradient: 'bg-gradient-to-br from-[#0a1628] via-[#1a2744] to-[#0d1f3c]',
        cardGradient: 'bg-gradient-to-br from-[#1a2744] to-[#0d1f3c]',
        statBg: 'bg-[#0d1f3c]',
        input: 'bg-[#0d1f3c] border-white/10 text-white placeholder:text-blue-300/40',
        tableHeader: 'bg-[#0d1f3c] text-blue-300/60',
        badge: 'bg-indigo-500/20 text-indigo-400',
        scrollbar: 'scrollbar-thumb-white/10 scrollbar-track-transparent',
        statusActive: 'bg-green-500/20 text-green-400',
        statusWorking: 'bg-blue-500/20 text-blue-400',
        statusLeave: 'bg-yellow-500/20 text-yellow-400',
        statusPending: 'bg-yellow-500/20 text-yellow-400',
        statusProgress: 'bg-blue-500/20 text-blue-400',
        statusCompleted: 'bg-green-500/20 text-green-400',
        statusBlocked: 'bg-red-500/20 text-red-400',
        statusApproved: 'bg-green-500/20 text-green-400',
        statusRejected: 'bg-red-500/20 text-red-400',
        statusInactive: 'bg-gray-500/20 text-gray-400',
        priorityCritical: 'text-red-400 bg-red-500/20',
        priorityHigh: 'text-orange-400 bg-orange-500/20',
        priorityMedium: 'text-blue-400 bg-blue-500/20',
        priorityLow: 'text-gray-400 bg-gray-500/20',
        timerBg: 'bg-[#0d1f3c]',
        btnBg: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30',
        statusActiveBtn: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
        statusInactiveBtn: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
        taskCard: 'bg-[#0d1f3c]',
        taskCardHover: 'hover:bg-[#1a2744]',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50/30',
      bgCard: 'bg-white/80 backdrop-blur-sm',
      bgCardHover: 'hover:bg-gray-50/80',
      bgInput: 'bg-gray-50',
      bgTable: 'bg-white',
      bgTableHover: 'hover:bg-gray-50',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      shadow: 'shadow-lg shadow-indigo-500/5',
      gradient: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50/50',
      cardGradient: 'bg-gradient-to-br from-white to-indigo-50/30',
      statBg: 'bg-white',
      input: 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
      tableHeader: 'bg-gray-50 text-gray-500',
      badge: 'bg-indigo-100 text-indigo-700',
      scrollbar: 'scrollbar-thumb-gray-200 scrollbar-track-transparent',
      statusActive: 'bg-green-100 text-green-700',
      statusWorking: 'bg-blue-100 text-blue-700',
      statusLeave: 'bg-yellow-100 text-yellow-700',
      statusPending: 'bg-yellow-100 text-yellow-700',
      statusProgress: 'bg-blue-100 text-blue-700',
      statusCompleted: 'bg-green-100 text-green-700',
      statusBlocked: 'bg-red-100 text-red-700',
      statusApproved: 'bg-green-100 text-green-700',
      statusRejected: 'bg-red-100 text-red-700',
      statusInactive: 'bg-gray-100 text-gray-700',
      priorityCritical: 'text-red-600 bg-red-50',
      priorityHigh: 'text-orange-600 bg-orange-50',
      priorityMedium: 'text-blue-600 bg-blue-50',
      priorityLow: 'text-gray-600 bg-gray-50',
      timerBg: 'bg-gray-50',
      btnBg: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      statusActiveBtn: 'bg-indigo-100 text-indigo-700 border border-indigo-300',
      statusInactiveBtn: 'bg-gray-100 text-gray-500 border border-gray-200',
      taskCard: 'bg-white',
      taskCardHover: 'hover:bg-gray-50',
    };
  };

  const tc = getThemeClasses();

  // Stats data
  const stats = [
    { label: 'Team Size', value: '4', icon: UsersIcon, subtitle: '2 on leave today' },
    { label: 'Open Tasks', value: '5', icon: ClipboardDocumentCheckIcon, subtitle: '3 blocked' },
    { label: 'Attendance', value: '92%', icon: UserGroupIcon, subtitle: '↑ 4% vs last week' },
    { label: 'Productivity', value: '89', icon: ChartBarIcon, subtitle: 'Team score this month' }
  ];

  // Team members data
  const teamMembers: TeamMember[] = [
    { id: 'SE-042', name: 'Priya Nair', role: 'Engineering Manager', status: 'Active', joined: '2021-09-01', initials: 'PN' },
    { id: 'SE-101', name: 'Ishita Roy', role: 'Frontend Engineer', status: 'Working', joined: '2022-06-12', initials: 'IR' },
    { id: 'SE-118', name: 'Karan Singh', role: 'Backend Engineer', status: 'Working', joined: '2022-08-22', initials: 'KS' },
    { id: 'SE-187', name: 'Rohan Verma', role: 'Senior Software Engineer', status: 'Working', joined: '2023-05-20', initials: 'RV' },
    { id: 'SE-203', name: 'Sneha Pillai', role: 'Software Engineer', status: 'Working', joined: '2023-09-15', initials: 'SP' },
    { id: 'SE-215', name: 'Ananya Iyer', role: 'Frontend Engineer', status: 'Active', joined: '2024-01-10', initials: 'AI' },
    { id: 'SE-228', name: 'Devansh Kapoor', role: 'DevOps Engineer', status: 'Working', joined: '2024-03-05', initials: 'DK' },
    { id: 'SE-241', name: 'Vikram Shah', role: 'Senior Backend Engineer', status: 'Active', joined: '2024-05-20', initials: 'VS' }
  ];

  // Tasks data
  const tasks: Task[] = [
    { id: 'SE-T-2041', title: 'Migrate auth flow to OAuth 2.1', assignee: 'Ishita Roy', priority: 'Medium', status: 'Pending', dueDate: '2026-06-15', project: 'Atlas Core' },
    { id: 'SE-T-2042', title: 'Design tokens audit', assignee: 'Ananya Iyer', priority: 'Medium', status: 'Pending', dueDate: '2026-06-08', project: 'Atlas Core' },
    { id: 'SE-T-2043', title: 'Build payroll PDF service', assignee: 'Karan Singh', priority: 'Critical', status: 'In Progress', dueDate: '2026-06-05', project: 'Orion HR' },
    { id: 'SE-T-2044', title: 'Add CI smoke tests', assignee: 'Sneha Pillai', priority: 'Medium', status: 'Completed', dueDate: '2026-05-30', project: 'Atlas Core' },
    { id: 'SE-T-2045', title: 'Resolve K8s pod restart loop', assignee: 'Devansh Kapoor', priority: 'Critical', status: 'Blocked', dueDate: '2026-06-04', project: 'Infra' },
    { id: 'SE-T-2046', title: 'Quarterly OKR planning', assignee: 'Vikram Shah', priority: 'High', status: 'In Progress', dueDate: '2026-06-12', project: 'Leadership' }
  ];

  // Leave requests
  const leaveRequests: LeaveRequest[] = [
    { id: 'LV-001', employee: 'Ishita Roy', type: 'Casual', period: '2026-06-12', fromDate: '2026-06-12', toDate: '2026-06-12', reason: 'Personal errand', status: 'Pending', submittedAt: '2026-06-10T10:00:00Z' },
    { id: 'LV-002', employee: 'Karan Singh', type: 'Sick', period: '2026-06-04 - 2026-06-05', fromDate: '2026-06-04', toDate: '2026-06-05', reason: 'Flu recovery', status: 'Pending', submittedAt: '2026-06-03T08:30:00Z' }
  ];

  // Project teams
  const projectTeams: ProjectTeam[] = [
    { id: 'PT-ATLAS', name: 'Atlas Auth Migration', members: 4, project: 'Atlas Core', lead: 'Priya Nair', created: '2026-05-20' },
    { id: 'PT-ORION', name: 'Orion HR Implementation', members: 3, project: 'Orion HR', lead: 'Priya Nair', created: '2026-06-01' },
    { id: 'PT-INFRA', name: 'Infrastructure Optimization', members: 3, project: 'Infra', lead: 'Priya Nair', created: '2026-06-10' }
  ];

  // Performance data
  const performanceData = [
    { name: 'Priya Nair', role: 'Engineering Manager', kpi: 85, sla: 90, prs: 4, rating: 3.4, done: '6/6' },
    { name: 'Ishita Roy', role: 'Frontend Engineer', kpi: 86, sla: 88, prs: 5, rating: 3.8, done: '6/7' },
    { name: 'Karan Singh', role: 'Backend Engineer', kpi: 87, sla: 88, prs: 6, rating: 4.2, done: '6/8' },
    { name: 'Rohan Verma', role: 'Senior Software Engineer', kpi: 88, sla: 87, prs: 4, rating: 4.6, done: '6/6' }
  ];

  // Payslips data
  const payslips = [
    { month: 'May 2026', paidOn: '2026-05-31', gross: '₹1,45,390', net: '₹1,18,849' },
    { month: 'April 2026', paidOn: '2026-04-30', gross: '₹1,42,500', net: '₹1,16,535' },
    { month: 'March 2026', paidOn: '2026-03-31', gross: '₹1,42,500', net: '₹1,16,535' },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'Active': tc.statusActive,
      'Working': tc.statusWorking,
      'On Leave': tc.statusLeave,
      'Pending': tc.statusPending,
      'In Progress': tc.statusProgress,
      'Completed': tc.statusCompleted,
      'Blocked': tc.statusBlocked,
      'Approved': tc.statusApproved,
      'Rejected': tc.statusRejected
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'Critical': tc.priorityCritical,
      'High': tc.priorityHigh,
      'Medium': tc.priorityMedium,
      'Low': tc.priorityLow
    };
    return colors[priority as keyof typeof colors] || tc.priorityLow;
  };

  const getSenderRoleColor = (role: string) => {
    const colors = {
      'Employee': 'bg-blue-500/20 text-blue-400',
      'Manager': 'bg-purple-500/20 text-purple-400',
      'HR': 'bg-pink-500/20 text-pink-400',
      'Super Admin': 'bg-indigo-500/20 text-indigo-400'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'General': 'bg-gray-500/20 text-gray-400',
      'HR': 'bg-pink-500/20 text-pink-400',
      'Payroll': 'bg-green-500/20 text-green-400',
      'IT': 'bg-blue-500/20 text-blue-400',
      'Leave': 'bg-yellow-500/20 text-yellow-400',
      'Other': 'bg-purple-500/20 text-purple-400'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getLeaveStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return tc.statusApproved;
      case 'Pending': return tc.statusPending;
      case 'Rejected': return tc.statusRejected;
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return tc.statusApproved;
      case 'In Progress': return tc.statusPending;
      case 'Pending': return tc.statusInactive;
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Timer Functions
  const handleStartWork = async () => {
    setAttendanceLoading(true);
    try {
      const now = moment();
      setStartTime(now);
      setIsClockedIn(true);
      setIsClockedOut(false);
      setWorkStatus('working');
      setIsWorking(true);
      
      setSuccessMessage(`Work started at ${now.format('hh:mm A')}`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Failed to start work:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleStopWork = async () => {
    setAttendanceLoading(true);
    try {
      const now = moment();
      const start = startTime || moment();
      
      const duration = moment.duration(now.diff(start));
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const seconds = duration.seconds();
      
      setIsClockedIn(false);
      setIsClockedOut(true);
      setWorkStatus('not-working');
      setIsWorking(false);
      setTotalHoursToday(hours + minutes / 60);
      
      setSuccessMessage(
        `Work session completed! Duration: ${hours}h ${minutes}m`
      );
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      const session: WorkSession = {
        id: `WS-${Date.now()}`,
        date: now.format('YYYY-MM-DD'),
        startTime: start.toISOString(),
        endTime: now.toISOString(),
        duration: duration.asSeconds(),
        status: 'working',
        employeeName: 'Priya Nair'
      };
      
      const updatedSessions = [session, ...workSessions];
      setWorkSessions(updatedSessions);
      localStorage.setItem('managerWorkSessions', JSON.stringify(updatedSessions));
      
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    } catch (error) {
      console.error('Failed to stop work:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Leave Functions
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

    const fromDate = moment(leaveRequest.fromDate);
    const toDate = moment(leaveRequest.toDate);
    
    if (toDate.isBefore(fromDate)) {
      alert('End date cannot be before start date');
      return;
    }

    const newLeave: LeaveRequest = {
      id: `L-${String(leaveHistory.length + 1).padStart(3, '0')}`,
      employee: 'Priya Nair',
      type: leaveRequest.type as any,
      period: `${fromDate.format('YYYY-MM-DD')} - ${toDate.format('YYYY-MM-DD')}`,
      fromDate: fromDate.format('YYYY-MM-DD'),
      toDate: toDate.format('YYYY-MM-DD'),
      reason: leaveRequest.reason,
      status: 'Pending',
      imageUrl: leaveRequest.imagePreview,
      submittedAt: moment().toISOString()
    };

    const updatedLeaves = [newLeave, ...leaveHistory];
    setLeaveHistory(updatedLeaves);
    localStorage.setItem('managerLeaveHistory', JSON.stringify(updatedLeaves));
    
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

  // Task Functions
  const addJiraLink = () => {
    if (jiraLinks.length < 10) {
      setJiraLinks([...jiraLinks, '']);
    }
  };

  const removeJiraLink = (index: number) => {
    if (jiraLinks.length > 1) {
      const newLinks = jiraLinks.filter((_, i) => i !== index);
      setJiraLinks(newLinks);
    }
  };

  const updateJiraLink = (index: number, value: string) => {
    const newLinks = [...jiraLinks];
    newLinks[index] = value;
    setJiraLinks(newLinks);
  };

  const handleTaskImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTaskImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTaskImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTask = () => {
    const filteredLinks = jiraLinks.filter(link => link.trim() !== '');
    
    if (filteredLinks.length === 0 || !taskDescription) {
      alert('Please fill in at least one Jira link and task description');
      return;
    }

    const newTask: TaskHistory = {
      id: `TASK-${String(taskHistory.length + 1).padStart(3, '0')}`,
      jiraLinks: filteredLinks,
      taskDescription: taskDescription,
      status: taskStatus,
      newIdea: newIdea,
      stylingAdded: stylingAdded,
      imageUrl: taskImagePreview,
      submittedAt: new Date().toLocaleString(),
      date: new Date().toISOString().split('T')[0]
    };

    setTaskHistory([newTask, ...taskHistory]);
    setJiraLinks(['']);
    setTaskDescription('');
    setNewIdea('');
    setStylingAdded(false);
    setAdditionalInfo('');
    setTaskImageFile(null);
    setTaskImagePreview(null);
    setShowTaskSuccess(true);
    setTimeout(() => setShowTaskSuccess(false), 3000);
  };

  const handleSendMessage = () => {
    if (!newMessage.receiver || !newMessage.subject || !newMessage.content) {
      alert('Please fill in all fields');
      return;
    }

    const message: Message = {
      id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
      sender: 'Priya Nair',
      senderRole: 'Manager',
      receiver: newMessage.receiver,
      receiverRole: 'Super Admin',
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

  const generatePayslipData = (employeeName?: string): PayslipData => {
    const baseSalary = 145390;
    const hra = Math.round(baseSalary * 0.4);
    const special = Math.round(baseSalary * 0.3);
    const bonus = Math.round(baseSalary * 0.1);
    const pf = Math.round(baseSalary * 0.12);
    const tds = Math.round(baseSalary * 0.08);
    const pt = 200;

    return {
      employeeId: 'SE-118',
      name: employeeName || 'Karan Singh',
      designation: 'Backend Engineer',
      email: 'karan.singh@serveasein.com',
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: #f0f2f5; 
            padding: 20px;
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
            padding: 25px 30px;
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
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: 1px;
          }
          .header .sub { 
            opacity: 0.8; 
            font-size: 13px; 
            font-weight: 300;
            margin-top: 4px;
          }
          .header .company { 
            font-size: 11px; 
            opacity: 0.6; 
            margin-top: 6px;
          }
          .header .badge {
            float: right;
            background: rgba(255,255,255,0.15);
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 11px;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .employee-details { 
            padding: 20px 30px; 
            background: #f8fafc; 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 6px 20px; 
            border-bottom: 2px solid #e2e8f0;
          }
          .employee-details .label { 
            color: #64748b; 
            font-size: 10px; 
            font-weight: 600; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .employee-details .value { 
            color: #0f172a; 
            font-size: 13px; 
            font-weight: 500;
          }
          .table-section { 
            padding: 25px 30px; 
          }
          .table-section h2 { 
            font-size: 15px; 
            color: #1a2744; 
            margin-bottom: 16px;
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
            font-size: 11px; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px 14px; 
            text-align: left; 
            border-bottom: 2px solid #e2e8f0;
          }
          td { 
            padding: 10px 14px; 
            border-bottom: 1px solid #f1f5f9; 
            font-size: 13px;
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
            padding: 14px;
          }
          .amount { 
            font-family: 'Courier New', monospace;
            font-weight: 500;
          }
          .footer { 
            padding: 16px 30px; 
            background: #f8fafc; 
            border-top: 2px solid #e2e8f0; 
            font-size: 11px; 
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
          @media (max-width: 600px) {
            .header { padding: 20px; }
            .header .badge { float: none; display: inline-block; margin-top: 10px; }
            .employee-details { grid-template-columns: 1fr; padding: 15px 20px; }
            .table-section { padding: 15px 20px; }
            td, th { padding: 8px 10px; font-size: 12px; }
            .footer { padding: 12px 20px; font-size: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="payslip">
          <div class="header">
            <h1>ServEase</h1>
            <div class="sub">INNOVATION PVT LTD</div>
            <div class="company">TOWER B, Cyber Hub, Gurugram, Haryana 122002, India</div>
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
                  <td colspan="3" style="text-align:right; font-size:16px; font-weight:700; color:#065f46;">
                    💰 Net Payable
                  </td>
                  <td style="text-align:right; font-size:18px; font-weight:700; color:#065f46;" class="amount">
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

  const filteredMessages = messages.filter(msg => {
    const readFilter = selectedFilter === 'all' ? true : selectedFilter === 'unread' ? !msg.read : msg.read;
    const categoryFilter = selectedCategory === 'all' || msg.category === selectedCategory;
    return readFilter && categoryFilter;
  });

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
    return '0h 0m';
  };

  // Render Overview Tab
  const renderOverview = () => (
    <>
      {showSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 sm:p-4 rounded-xl flex items-center gap-2 animate-fadeIn mb-4">
          <CheckIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Status Card */}
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
                setWorkStatus('not-working');
                setIsClockedOut(false);
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
            <span>Started at: {startTime?.format('hh:mm A') || 'N/A'}</span>
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

  // Render My Team Tab (Full Team View)
  const renderMyTeam = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>My Team</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Members of the Platform squad</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className={`w-4 h-4 ${tc.textMuted} absolute left-3 top-1/2 transform -translate-y-1/2`} />
            <input
              type="text"
              placeholder="Search members..."
              className={`pl-9 pr-4 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search team members"
            />
          </div>
          <button 
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            aria-label="Add new team member"
          >
            <PlusIcon className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-6 py-3 font-medium">Member</th>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                        member.status === 'On Leave' ? 'bg-yellow-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                      }`}>
                        {member.initials}
                      </div>
                      <div>
                        <p className={`font-medium ${tc.text}`}>{member.name}</p>
                        <p className={`text-xs ${tc.textSecondary}`}>{member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{member.id}</td>
                  <td className={`px-6 py-4 text-sm ${tc.text}`}>{member.role}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{member.joined}</td>
                  <td className="px-6 py-4">
                    <button 
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                      aria-label={`View ${member.name}'s profile`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Project Teams Tab
  const renderProjectTeams = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Project Teams</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Assemble employees from the directory into project squads you lead</p>
        </div>
        <button 
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          aria-label="Create new project team"
        >
          <PlusIcon className="w-4 h-4" />
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectTeams.map((team) => (
          <div key={team.id} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                {team.name.charAt(0)}
              </div>
              <span className={`text-xs ${tc.textMuted}`}>{team.created}</span>
            </div>
            <h3 className={`font-semibold ${tc.text}`}>{team.name}</h3>
            <p className={`text-sm ${tc.textSecondary}`}>{team.members} members</p>
            <p className={`text-xs ${tc.textMuted} mt-1`}>Project - {team.project}</p>
            <div className={`mt-3 pt-3 ${tc.border} border-t flex items-center justify-between`}>
              <p className={`text-xs ${tc.textSecondary}`}>Lead - {team.lead}</p>
              <button 
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                aria-label={`Manage ${team.name} team`}
              >
                Manage →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Assign Tasks Tab
  const renderAssignTasks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Assign Tasks</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Create and route tasks to your team members</p>
        </div>
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-4`}>Create New Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm ${tc.textSecondary} mb-1`}>Task title</label>
            <input
              type="text"
              placeholder="Enter task title..."
              className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              aria-label="Task title"
            />
          </div>
          <div>
            <label className={`block text-sm ${tc.textSecondary} mb-1`}>Assignee</label>
            <select 
              className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              aria-label="Select assignee for task"
            >
              <option value="">Select team member</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm ${tc.textSecondary} mb-1`}>Priority</label>
            <select 
              className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              aria-label="Select task priority"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm ${tc.textSecondary} mb-1`}>Due Date</label>
            <input
              type="date"
              className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              aria-label="Task due date"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            aria-label="Assign task to team member"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            Assign Task
          </button>
        </div>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className={`px-6 py-4 ${tc.border} border-b`}>
          <h3 className={`font-semibold ${tc.text}`}>Recent Tasks</h3>
        </div>
        <div className={`divide-y ${tc.border}`}>
          {tasks.map((task) => (
            <div key={task.id} className={`px-6 py-4 ${tc.bgTableHover} transition-colors`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className={`font-medium ${tc.text}`}>{task.title}</p>
                    <span className={`text-xs ${tc.textMuted}`}>{task.id}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className={`text-sm ${tc.textSecondary}`}>{task.assignee}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`text-xs ${tc.textMuted}`}>{task.dueDate}</span>
                  </div>
                </div>
                <button 
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                  aria-label={`Edit task ${task.title}`}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Tasks Board Tab
  const renderTasksBoard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Tasks Board</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Across your team's projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Pending', 'In Progress', 'Completed', 'Blocked'].map((status) => (
          <div key={status} className={`${tc.bgCard} rounded-2xl p-4 ${tc.border} ${tc.shadow}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${tc.text}`}>{status}</h3>
              <span className={`text-xs ${tc.textMuted} ${tc.bgTableHover} px-2 py-1 rounded-full`}>
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            <div className="space-y-3">
              {tasks.filter(task => task.status === status).map((task) => (
                <div key={task.id} className={`${tc.bgCard} p-4 rounded-xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-medium ${tc.text}`}>{task.title}</p>
                      <p className={`text-xs ${tc.textMuted} mt-1`}>{task.project}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {task.assignee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`text-xs ${tc.textSecondary}`}>{task.assignee}</span>
                    </div>
                    <span className={`text-xs ${tc.textMuted}`}>{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Daily Tasks Tab
  const renderDailyTasks = () => (
    <div className="space-y-4 sm:space-y-6">
      {showTaskSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 sm:p-4 rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Task submitted successfully!</span>
        </div>
      )}

      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-1 sm:mb-2 text-base sm:text-lg`}>Today's Work Submission</h3>
        <p className={`text-sm ${tc.textSecondary} mb-4 sm:mb-6`}>Submit your daily standup, achievements & blockers</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${tc.text} flex items-center gap-2`}>
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                Jira Ticket URLs
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${tc.textMuted}`}>
                  {jiraLinks.filter(link => link.trim() !== '').length} / 10
                </span>
                {jiraLinks.length < 10 && (
                  <button
                    type="button"
                    onClick={addJiraLink}
                    className={`p-1 rounded-lg ${tc.btnBg} transition-all hover:scale-110`}
                    aria-label="Add another Jira link"
                    title="Add another Jira link"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              {jiraLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updateJiraLink(index, e.target.value)}
                      placeholder="https://jira.serveasein.com/browse/ATL-1284"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm pr-8`}
                    />
                    {link && link.trim() !== '' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckIcon className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}
                  </div>
                  {jiraLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeJiraLink(index)}
                      className={`p-1.5 rounded-lg ${tc.textMuted} hover:text-rose-400 transition-colors hover:bg-rose-500/10`}
                      aria-label={`Remove Jira link ${index + 1}`}
                      title="Remove this Jira link"
                    >
                      <MinusCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                  {index === jiraLinks.length - 1 && jiraLinks.length < 10 && (
                    <button
                      type="button"
                      onClick={addJiraLink}
                      className={`p-1.5 rounded-lg ${tc.btnBg} transition-all hover:scale-110`}
                      aria-label="Add another Jira link"
                      title="Add another Jira link"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className={`mt-1.5 text-[10px] sm:text-xs ${tc.textMuted} flex items-center gap-2`}>
              <span>Add up to 10 Jira tickets</span>
              {jiraLinks.filter(link => link.trim() !== '').length === 10 && (
                <span className="text-amber-400">• Maximum limit reached</span>
              )}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
              Task Description
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe what tasks you completed today..."
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none resize-none transition-all text-sm`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <ClipboardDocumentCheckIcon className="w-4 h-4 text-indigo-400" />
              Task Status
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {(['In Progress', 'Completed', 'Pending'] as const).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setTaskStatus(status)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    taskStatus === status
                      ? tc.statusActiveBtn + ' shadow-lg shadow-indigo-500/25'
                      : tc.statusInactiveBtn + ' hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <LightBulbIcon className="w-4 h-4 text-amber-400" />
              New Ideas / Improvements
            </label>
            <input
              type="text"
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="Share any new ideas or improvements you came up with..."
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <SparklesIcon className="w-4 h-4 text-purple-400" />
              Styling / UI Improvements
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStylingAdded(!stylingAdded)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  stylingAdded
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : tc.statusInactiveBtn + ' hover:bg-gray-200'
                }`}
              >
                {stylingAdded ? '✅ Styling Added' : '➕ Add Styling'}
              </button>
              <span className={`text-xs ${tc.textMuted}`}>
                {stylingAdded ? 'New styling/UI improvements have been added' : 'No styling changes made'}
              </span>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-400" />
              Additional Information
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any additional notes, blockers, or comments..."
              rows={2}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none resize-none transition-all text-sm`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <PhotoIcon className="w-4 h-4 text-pink-400" />
              Screenshot / Image Upload
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className={`px-3 sm:px-4 py-2 sm:py-2.5 ${tc.btnBg} rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-all hover:scale-105 flex items-center gap-2`}>
                <ArrowUpTrayIcon className="w-4 h-4" />
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTaskImageUpload}
                  className="hidden"
                />
              </label>
              {taskImagePreview && (
                <div className="flex items-center gap-2">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border ${tc.border}">
                    <img src={taskImagePreview} alt="Task preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTaskImageFile(null);
                      setTaskImagePreview(null);
                    }}
                    title="Remove uploaded image"
                    aria-label="Remove uploaded image"
                    className={`p-1 rounded-lg ${tc.textMuted} hover:text-rose-400 transition-colors`}
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <p className={`text-[10px] sm:text-xs ${tc.textMuted} mt-1`}>
              Upload a screenshot of your work (optional)
            </p>
          </div>

          <button 
            type="button"
            onClick={handleSubmitTask}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group"
          >
            <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            Submit Daily Task Update
          </button>
        </div>
      </div>

      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <div>
            <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>Task History</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Last 3 days of task submissions</p>
          </div>
          <span className={`text-xs ${tc.textMuted}`}>Showing latest 3 entries</span>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {taskHistory.slice(0, 3).map((task) => (
            <div key={task.id} className={`p-3 sm:p-4 rounded-xl ${tc.taskCard} ${tc.border} border ${tc.taskCardHover} transition-all duration-300`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium text-indigo-400`}>{task.id}</span>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  {task.stylingAdded && (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium bg-purple-500/20 text-purple-400">
                      🎨 Styled
                    </span>
                  )}
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${tc.textMuted} bg-gray-500/10`}>
                    {task.jiraLinks.length} link{task.jiraLinks.length > 1 ? 's' : ''}
                  </span>
                </div>
                <span className={`text-[10px] sm:text-xs ${tc.textMuted}`}>{task.submittedAt}</span>
              </div>
              
              <div className="mt-2 space-y-1.5">
                <div className="space-y-1">
                  {task.jiraLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <LinkIcon className={`w-3.5 h-3.5 ${tc.textMuted} flex-shrink-0`} />
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 truncate">
                        {link}
                      </a>
                    </div>
                  ))}
                </div>
                <p className={`text-xs sm:text-sm ${tc.text}`}>{task.taskDescription}</p>
                {task.newIdea && (
                  <div className="flex items-start gap-2 text-xs">
                    <LightBulbIcon className={`w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5`} />
                    <span className={`${tc.textSecondary}`}>{task.newIdea}</span>
                  </div>
                )}
                {task.imageUrl && (
                  <div className="mt-1.5">
                    <img src={task.imageUrl} alt="Task screenshot" className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border ${tc.border}" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Attendance Tab
  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Team Attendance</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Real-time presence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamMembers.map((member) => (
          <div key={member.id} className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow} flex items-center gap-4 hover:${tc.bgCardHover} transition-all duration-300`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
              member.status === 'On Leave' ? 'bg-yellow-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'
            }`}>
              {member.initials}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${tc.text}`}>{member.name}</p>
              <p className={`text-xs ${tc.textSecondary}`}>{member.role}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                {member.status === 'On Leave' ? 'Leave' : 'Working'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-4`}>Attendance Trend</h3>
        <p className={`text-sm ${tc.textSecondary} mb-4`}>Last 7 days - % present</p>
        <div className="h-48 flex items-end justify-between gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const heights = [85, 78, 92, 88, 95, 70, 75];
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t transition-all duration-500 hover:opacity-80" 
                  style={{ height: `${heights[i]}%`, minHeight: '20px' }}
                />
                <span className={`text-xs ${tc.textMuted} mt-2`}>{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render Leave Approvals Tab
  const renderLeaveApprovals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Leave Approvals</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Approve or reject employee leave requests</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
          {leaveRequests.filter(l => l.status === 'Pending').length} pending
        </span>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-6 py-3 font-medium">Request</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Period</th>
                <th className="px-6 py-3 font-medium">Reason</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <tr key={request.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {request.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`font-medium ${tc.text}`}>{request.employee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.type === 'Sick' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {request.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{request.period}</td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{request.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                        aria-label={`Approve ${request.employee}'s leave request`}
                      >
                        <CheckCircleIcon className="w-3 h-3" />
                        Approve
                      </button>
                      <button 
                        className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-xl text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                        aria-label={`Reject ${request.employee}'s leave request`}
                      >
                        <XCircleIcon className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Performance Tab
  const renderPerformance = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${tc.text}`}>Performance Tracking</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Goal completion, KPIs and ratings for your team</p>
      </div>

      <div className="space-y-4">
        {performanceData.map((member) => (
          <div key={member.name} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className={`font-semibold ${tc.text}`}>{member.name}</p>
                  <p className={`text-sm ${tc.textSecondary}`}>{member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-center">
                  <p className={`text-sm ${tc.textSecondary}`}>KPI</p>
                  <p className={`font-semibold ${tc.text}`}>{member.kpi}</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm ${tc.textSecondary}`}>SLA</p>
                  <p className={`font-semibold ${tc.text}`}>{member.sla}%</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm ${tc.textSecondary}`}>PRs/wk</p>
                  <p className={`font-semibold ${tc.text}`}>{member.prs}</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm ${tc.textSecondary}`}>Rating</p>
                  <p className="font-semibold text-indigo-400">{member.rating}★</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm ${tc.textSecondary}`}>Goals</p>
                  <p className="font-semibold text-emerald-400">{member.done}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-4`}>Productivity Trend</h3>
        <p className={`text-sm ${tc.textSecondary} mb-6`}>Team score over 6 months</p>
        <div className="h-64">
          <div className="flex items-end justify-between gap-4 h-full">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [65, 72, 80, 78, 85, 89];
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t transition-all duration-500 hover:from-indigo-600" 
                      style={{ height: `${heights[i]}px`, minHeight: '20px' }}
                    />
                    <span className={`text-xs ${tc.textMuted}`}>{month}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`mt-4 flex items-center justify-between text-sm ${tc.textSecondary}`}>
          <span>↑ 4% vs last month</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-500 rounded"></span> KPI</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-300 rounded"></span> SLA</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-100 rounded"></span> PRs/wk</span>
          </div>
        </div>
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className={`font-semibold ${tc.text}`}>Submit to Super Admin</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Weekly team report</p>
          </div>
          <button 
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            aria-label="Submit weekly team report to Super Admin"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            Send Report
          </button>
        </div>
        <p className={`text-xs ${tc.textMuted} mt-2`}>Last sent - 5 days ago to Aarav Mehta</p>
      </div>
    </div>
  );

  // Render Reports Tab
  const renderReports = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${tc.text}`}>Reports</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Team analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChartBarIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className={`font-semibold ${tc.text}`}>Weekly Report</h3>
              <p className={`text-xs ${tc.textSecondary}`}>Team performance summary</p>
            </div>
          </div>
          <p className={`text-sm ${tc.textSecondary}`}>Platform team delivered 18/22 sprint points. OAuth migration on-track. Need DevOps support for K8s pod restart loop.</p>
          <button 
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            aria-label="View weekly report"
          >
            View Report →
          </button>
        </div>

        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UsersIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className={`font-semibold ${tc.text}`}>Attendance Report</h3>
              <p className={`text-xs ${tc.textSecondary}`}>Monthly attendance summary</p>
            </div>
          </div>
          <p className={`text-sm ${tc.textSecondary}`}>92% attendance rate this month. 4% increase from last week.</p>
          <button 
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            aria-label="View attendance report"
          >
            View Report →
          </button>
        </div>

        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardDocumentCheckIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className={`font-semibold ${tc.text}`}>Task Report</h3>
              <p className={`text-xs ${tc.textSecondary}`}>Task completion overview</p>
            </div>
          </div>
          <p className={`text-sm ${tc.textSecondary}`}>5 open tasks, 3 blocked. Critical tasks in progress.</p>
          <button 
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            aria-label="View task report"
          >
            View Report →
          </button>
        </div>
      </div>
    </div>
  );

  // Render Queries Tab
  const renderQueries = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Queries & Messages</h2>
          <p className={`text-sm ${tc.textSecondary}`}>View and respond to messages from employees, managers, and HR</p>
        </div>
        <button 
          onClick={() => setShowCompose(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          aria-label="Compose new message"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          Compose Message
        </button>
      </div>

      {/* Compose Message Modal */}
      {showCompose && (
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${tc.text}`}>Compose New Message</h3>
            <button 
              onClick={() => setShowCompose(false)}
              className={`${tc.textMuted} hover:${tc.text}`}
              aria-label="Close compose message"
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
                aria-label="Select message recipient"
              >
                <option value="">Select recipient</option>
                <option value="Aarav Mehta">Aarav Mehta (Super Admin)</option>
                <option value="Sanya Kapoor">Sanya Kapoor (HR)</option>
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
                onClick={() => setShowCompose(false)}
                className={`px-4 py-2 ${tc.border} ${tc.textSecondary} rounded-xl text-sm font-medium ${tc.bgTableHover} transition-colors`}
                aria-label="Cancel composing message"
              >
                Cancel
              </button>
              <button 
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

      {/* Filters */}
      <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow} flex items-center justify-between flex-wrap gap-4`}>
        <div className="flex items-center gap-4">
          <div>
            <label className={`text-xs ${tc.textSecondary} block mb-1`}>Status</label>
            <select 
              className={`px-3 py-1.5 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'unread' | 'read')}
              aria-label="Filter messages by read status"
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
              aria-label="Filter messages by category"
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

      {/* Messages List */}
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
              className={`${tc.bgCard} p-5 rounded-2xl ${tc.border} ${tc.shadow} ${!msg.read ? 'border-indigo-500/30 bg-indigo-500/5' : ''} hover:${tc.bgCardHover} transition-all cursor-pointer`}
              onClick={() => markAsRead(msg.id)}
              role="button"
              tabIndex={0}
              aria-label={`Message: ${msg.subject} from ${msg.sender}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  markAsRead(msg.id);
                }
              }}
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
                    aria-label={`Reply to ${msg.sender} about ${msg.subject}`}
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                  <button 
                    className={`p-1.5 ${tc.textMuted} ${tc.bgTableHover} rounded-xl transition-colors hover:text-rose-400`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this message?')) {
                        setMessages(messages.filter(m => m.id !== msg.id));
                      }
                    }}
                    aria-label={`Delete message: ${msg.subject}`}
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

  // Render Leave Tab
  const renderLeave = () => {
    const leaveRows = [
      ...leaveHistory.map(l => ({
        id: l.id,
        type: l.type,
        from: l.fromDate,
        to: l.toDate,
        days: 1,
        status: l.status
      })),
      ...leaveRequests.map(l => ({
        id: l.id,
        type: l.type,
        from: l.fromDate,
        to: l.toDate,
        days: 1,
        status: l.status
      }))
    ];

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
            <h4 className={`text-sm ${tc.textSecondary}`}>Sick Leave</h4>
            <p className={`text-xl sm:text-2xl font-bold ${tc.text}`}>4 / 10</p>
            <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
          </div>
          <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
            <h4 className={`text-sm ${tc.textSecondary}`}>Earned Leave</h4>
            <p className={`text-xl sm:text-2xl font-bold ${tc.text}`}>9 / 18</p>
            <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
          </div>
          <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
            <h4 className={`text-sm ${tc.textSecondary}`}>Pending Requests</h4>
            <p className="text-xl sm:text-2xl font-bold text-amber-400">3</p>
            <p className={`text-xs ${tc.textMuted}`}>awaiting approval</p>
          </div>
        </div>

        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>Leave History</h3>
            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1 sm:gap-2"
            >
              <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              Apply Leave
            </button>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[400px] sm:min-w-0">
              <thead>
                <tr className={`${tc.border} border-b`}>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>ID</th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell`}>Type</th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>From – To</th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell`}>Days</th>
                  <th className={`text-left text-[10px] sm:text-xs font-medium ${tc.textMuted} py-2 sm:py-3 px-2 sm:px-3`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveRows.map((leave) => (
                  <tr key={leave.id} className={`${tc.border} border-b ${tc.bgCardHover} transition`}>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-medium text-indigo-400">{leave.id}</td>
                    <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.text} hidden sm:table-cell`}>{leave.type}</td>
                    <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.textSecondary}`}>{leave.from} – {leave.to}</td>
                    <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${tc.text} hidden sm:table-cell`}>{leave.days || 1}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3">
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium ${getLeaveStatusColor(leave.status)}`}>
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
  }

  // Render Payslips Tab
  const renderPayslips = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-transform duration-300`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Sick Leave</h4>
          <p className={`text-xl sm:text-2xl font-bold ${tc.text}`}>4 / 10</p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-transform duration-300`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Earned Leave</h4>
          <p className={`text-xl sm:text-2xl font-bold ${tc.text}`}>9 / 18</p>
          <p className={`text-xs ${tc.textMuted}`}>days remaining</p>
        </div>
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:scale-[1.02] transition-transform duration-300`}>
          <h4 className={`text-sm ${tc.textSecondary}`}>Total Earned</h4>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400">₹3,52,274</p>
          <p className={`text-xs ${tc.textMuted}`}>last 3 months</p>
        </div>
      </div>

      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h3 className={`font-semibold ${tc.text} mb-1 text-base sm:text-lg`}>Payslips</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Download your monthly payslip with ServEase branding</p>
          </div>
          <button
            type="button"
            onClick={() => downloadPayslip()}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 ${tc.btnBg} rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium flex items-center gap-2 hover:scale-105`}
          >
            <ArrowUpIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            Generate Current
          </button>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {payslips.map((payslip, index) => (
            <div key={index} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 ${tc.border} border rounded-2xl ${tc.bgCardHover} transition-all duration-300 hover:shadow-md hover:scale-[1.01] gap-3 sm:gap-0`}>
              <div>
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${tc.textMuted}`} />
                  <div>
                    <h4 className={`font-semibold ${tc.text} text-sm sm:text-base`}>{payslip.month}</h4>
                    <p className={`text-xs ${tc.textMuted}`}>Paid on {payslip.paidOn}</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4 mt-1 sm:mt-2 ml-9 sm:ml-11">
                  <span className={`text-xs sm:text-sm ${tc.textSecondary}`}>Gross: <span className={`font-medium ${tc.text}`}>{payslip.gross}</span></span>
                  <span className={`text-xs sm:text-sm ${tc.textSecondary}`}>Net: <span className="font-medium text-emerald-400">{payslip.net}</span></span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => downloadPayslip()}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 ${tc.btnBg} rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium hover:scale-105 self-start sm:self-center`}
              >
                <ArrowUpTrayIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Main render with sidebar navigation
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'my-team':
        return renderMyTeam();
      case 'project-teams':
        return renderProjectTeams();
      case 'assign-tasks':
        return renderAssignTasks();
      case 'tasks-board':
        return renderTasksBoard();
      case 'daily-tasks':
        return renderDailyTasks();
      case 'attendance':
        return renderAttendance();
      case 'leave-approvals':
        return renderLeaveApprovals();
      case 'performance':
        return renderPerformance();
      case 'reports':
        return renderReports();
      case 'queries':
        return renderQueries();
      case 'leave':
        return renderLeave();
      case 'payslips':
        return renderPayslips();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={`flex h-screen ${tc.bg} transition-colors duration-300`}>
      <Sidebar role="manager" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Platform Team Overview"
          subtitle="Led by Priya Nair - 14 engineers - 6 active projects"
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

export default ManagerDashboard;