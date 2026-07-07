// HRDashboard.tsx - Complete with responsive design for all devices
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import { 
  UsersIcon, 
  UserPlusIcon, 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon,
  BanknotesIcon,
  CalendarIcon,
  MegaphoneIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PaperAirplaneIcon,
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
  ChartBarIcon,
  ChartPieIcon,
  SunIcon,
  MoonIcon,
  LockClosedIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Role } from '../../types';
import OnboardNewHireModal from '../../pages/CreateAccountPage';

// Types
interface OnboardingEmployee {
  id: string;
  name: string;
  role: string;
  startDate: string;
  progress: number;
  department: string;
}

interface LeaveRequest {
  id: string;
  employee: string;
  type: 'Casual' | 'Sick' | 'Earned' | 'Comp-Off' | 'Maternity';
  period: string;
  duration: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  department: string;
}

interface SalaryRecord {
  id: string;
  employee: string;
  team: string;
  present: number;
  leaves: number;
  lop: number;
  baseSalary: string;
  payable: string;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'National' | 'Regional' | 'Optional';
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  status: 'Live' | 'Draft';
  audience: string;
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

const HRDashboard = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Modal state
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const { createAccount } = useAuth();

  // Queries state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'MSG-001',
      sender: 'Aarav Mehta',
      senderRole: 'Super Admin',
      receiver: 'Sanya Kapoor',
      receiverRole: 'HR',
      subject: 'Q3 Hiring Approval',
      content: 'Your Q3 hiring plan for 15 positions has been approved. Please proceed with onboarding.',
      timestamp: '2026-06-24 10:30',
      read: false,
      category: 'HR'
    },
    {
      id: 'MSG-002',
      sender: 'Priya Nair',
      senderRole: 'Manager',
      receiver: 'Sanya Kapoor',
      receiverRole: 'HR',
      subject: 'New Hire Request - Platform Team',
      content: 'We need 3 new backend engineers. Please start the hiring process.',
      timestamp: '2026-06-23 16:45',
      read: false,
      category: 'HR'
    },
    {
      id: 'MSG-003',
      sender: 'Ishita Roy',
      senderRole: 'Employee',
      receiver: 'Sanya Kapoor',
      receiverRole: 'HR',
      subject: 'Maternity Leave Query',
      content: 'I would like to understand the maternity leave policy and documentation needed.',
      timestamp: '2026-06-23 14:20',
      read: true,
      category: 'Leave'
    },
    {
      id: 'MSG-004',
      sender: 'Vikram Shah',
      senderRole: 'Manager',
      receiver: 'Sanya Kapoor',
      receiverRole: 'HR',
      subject: 'Performance Review Schedule',
      content: 'Need to schedule Q2 performance reviews for Product team. Please share availability.',
      timestamp: '2026-06-22 11:15',
      read: true,
      category: 'General'
    },
    {
      id: 'MSG-005',
      sender: 'Karan Singh',
      senderRole: 'Employee',
      receiver: 'Sanya Kapoor',
      receiverRole: 'HR',
      subject: 'Salary Slip Query',
      content: 'I have a query about my salary slip for May 2026. Please review.',
      timestamp: '2026-06-21 09:00',
      read: false,
      category: 'Payroll'
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

  // Determine which tab is active based on route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/overview') return 'overview';
    if (path === '/dashboard/onboarding') return 'onboarding';
    if (path === '/dashboard/attendance') return 'attendance';
    if (path === '/dashboard/leaves') return 'leaves';
    if (path === '/dashboard/salary') return 'salary';
    if (path === '/dashboard/holidays') return 'holidays';
    if (path === '/dashboard/announcements') return 'announcements';
    if (path === '/dashboard/queries') return 'queries';
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

  // Handle responsive resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

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
        statusPending: 'bg-yellow-500/20 text-yellow-400',
        statusApproved: 'bg-green-500/20 text-green-400',
        statusRejected: 'bg-red-500/20 text-red-400',
        statusLive: 'bg-green-500/20 text-green-400',
        statusDraft: 'bg-gray-500/20 text-gray-400',
        statusNational: 'bg-blue-500/20 text-blue-400',
        statusRegional: 'bg-purple-500/20 text-purple-400',
        statusOptional: 'bg-gray-500/20 text-gray-400',
        leaveCasual: 'bg-blue-500/20 text-blue-400',
        leaveSick: 'bg-red-500/20 text-red-400',
        leaveEarned: 'bg-green-500/20 text-green-400',
        leaveCompOff: 'bg-purple-500/20 text-purple-400',
        leaveMaternity: 'bg-pink-500/20 text-pink-400',
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
      statusPending: 'bg-yellow-100 text-yellow-700',
      statusApproved: 'bg-green-100 text-green-700',
      statusRejected: 'bg-red-100 text-red-700',
      statusLive: 'bg-green-100 text-green-700',
      statusDraft: 'bg-gray-100 text-gray-700',
      statusNational: 'bg-blue-100 text-blue-700',
      statusRegional: 'bg-purple-100 text-purple-700',
      statusOptional: 'bg-gray-100 text-gray-700',
      leaveCasual: 'bg-blue-100 text-blue-700',
      leaveSick: 'bg-red-100 text-red-700',
      leaveEarned: 'bg-green-100 text-green-700',
      leaveCompOff: 'bg-purple-100 text-purple-700',
      leaveMaternity: 'bg-pink-100 text-pink-700',
    };
  };

  const tc = getThemeClasses();

  // Stats data
  const stats = [
    { label: 'Headcount', value: '1,240', icon: UsersIcon, subtitle: 'Across 6 departments', change: '+12 this month' },
    { label: 'Onboarding', value: '4', icon: UserPlusIcon, subtitle: 'Joining this month', change: '2 in progress' },
    { label: 'Pending Leaves', value: '3', icon: ClipboardDocumentCheckIcon, subtitle: 'Need your review', change: '2 urgent' },
    { label: 'On Leave Today', value: '9', icon: UserGroupIcon, subtitle: 'Across teams', change: '4% of workforce' }
  ];

  // Onboarding data
  const [onboardingList, setOnboardingList] = useState<OnboardingEmployee[]>([
    { id: 'ONB-001', name: 'Tanvi Bhatia', role: 'Frontend Engineer - Platform', startDate: '2026-06-10', progress: 70, department: 'Platform' },
    { id: 'ONB-002', name: 'Rahul Khanna', role: 'Data Analyst - Product', startDate: '2026-06-15', progress: 40, department: 'Product' },
    { id: 'ONB-003', name: 'Naina Sethi', role: 'Product Designer - Design', startDate: '2026-06-17', progress: 90, department: 'Design' },
    { id: 'ONB-004', name: 'Aditya Rao', role: 'SRE Engineer - DevOps', startDate: '2026-07-01', progress: 15, department: 'DevOps' }
  ]);

  // Leave requests data
  const leaveRequests: LeaveRequest[] = [
    { id: 'LV-001', employee: 'Ishita Roy', type: 'Casual', period: '2026-06-12 - 2026-06-12', duration: '1d', reason: 'Personal errand', status: 'Pending', department: 'Platform' },
    { id: 'LV-002', employee: 'Karan Singh', type: 'Sick', period: '2026-06-04 - 2026-06-05', duration: '2d', reason: 'Flu recovery', status: 'Pending', department: 'Platform' },
    { id: 'LV-003', employee: 'Meera Joshi', type: 'Earned', period: '2026-06-22 - 2026-06-26', duration: '5d', reason: 'Family vacation', status: 'Pending', department: 'Product' },
    { id: 'LV-004', employee: 'Sneha Pillai', type: 'Comp-Off', period: '2026-06-09 - 2026-06-09', duration: '1d', reason: 'Weekend release support', status: 'Approved', department: 'QA' },
    { id: 'LV-005', employee: 'Ananya Iyer', type: 'Maternity', period: '2026-07-01 - 2026-12-31', duration: '184d', reason: 'Statutory maternity leave', status: 'Approved', department: 'Design' }
  ];

  // Salary data
  const salaryRecords: SalaryRecord[] = [
    { id: 'SL-001', employee: 'Aarav Mehta', team: 'Leadership', present: 18, leaves: 0, lop: 1, baseSalary: '₹2,85,000', payable: '₹2,72,045' },
    { id: 'SL-002', employee: 'Priya Nair', team: 'Platform', present: 21, leaves: 1, lop: 0, baseSalary: '₹1,95,000', payable: '₹1,95,000' },
    { id: 'SL-003', employee: 'Vikram Shah', team: 'Product', present: 20, leaves: 2, lop: 0, baseSalary: '₹1,75,000', payable: '₹1,75,000' },
    { id: 'SL-004', employee: 'Ishita Roy', team: 'Platform', present: 19, leaves: 0, lop: 0, baseSalary: '₹95,000', payable: '₹95,000' },
    { id: 'SL-005', employee: 'Karan Singh', team: 'Platform', present: 18, leaves: 1, lop: 0, baseSalary: '₹1,02,000', payable: '₹1,02,000' },
    { id: 'SL-006', employee: 'Ananya Iyer', team: 'Design', present: 21, leaves: 2, lop: 1, baseSalary: '₹88,000', payable: '₹84,000' },
    { id: 'SL-007', employee: 'Rohan Verma', team: 'Platform', present: 20, leaves: 0, lop: 0, baseSalary: '₹1,24,000', payable: '₹1,24,000' },
    { id: 'SL-008', employee: 'Sneha Pillai', team: 'QA', present: 19, leaves: 1, lop: 0, baseSalary: '₹1,10,000', payable: '₹1,10,000' },
    { id: 'SL-009', employee: 'Devansh Kapoor', team: 'DevOps', present: 18, leaves: 2, lop: 0, baseSalary: '₹1,18,000', payable: '₹1,18,000' },
    { id: 'SL-010', employee: 'Meera Joshi', team: 'Product', present: 21, leaves: 0, lop: 0, baseSalary: '₹78,000', payable: '₹78,000' }
  ];

  // Holidays data
  const holidays: Holiday[] = [
    { id: 'HL-001', name: 'Republic Day', date: '2026-01-26', type: 'National' },
    { id: 'HL-002', name: 'Independence Day', date: '2026-08-15', type: 'National' },
    { id: 'HL-003', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'National' },
    { id: 'HL-004', name: 'Christmas', date: '2026-12-25', type: 'National' },
    { id: 'HL-005', name: 'Diwali', date: '2026-11-09', type: 'National' },
    { id: 'HL-006', name: 'Holi', date: '2026-03-06', type: 'National' },
    { id: 'HL-007', name: 'Ram Navami', date: '2026-04-14', type: 'National' }
  ];

  // Announcements data
  const announcements: Announcement[] = [
    { 
      id: 'AN-118', 
      title: 'Q2 Town Hall - 18 Jun', 
      content: 'Join us at 4 PM IST for the quarterly town hall covering OKRs, finance and new launches.',
      author: 'Aarav Mehta',
      date: '2026-06-01',
      status: 'Live',
      audience: 'All'
    },
    { 
      id: 'AN-117', 
      title: 'Hybrid policy refresh', 
      content: 'Effective 1 July, all teams move to a 3-days-in-office cadence (Tue/Wed/Thu).',
      author: 'Sanya Kapoor',
      date: '2026-05-28',
      status: 'Live',
      audience: 'All'
    },
    { 
      id: 'AN-116', 
      title: 'Wellness reimbursement', 
      content: 'Up to ₹15,000/year now claimable against gym, therapy and nutrition expenses.',
      author: 'Sanya Kapoor',
      date: '2026-05-22',
      status: 'Live',
      audience: 'All'
    }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': tc.statusActive,
      'Pending': tc.statusPending,
      'Approved': tc.statusApproved,
      'Rejected': tc.statusRejected,
      'Live': tc.statusLive,
      'Draft': tc.statusDraft,
      'National': tc.statusNational,
      'Regional': tc.statusRegional,
      'Optional': tc.statusOptional
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Casual': tc.leaveCasual,
      'Sick': tc.leaveSick,
      'Earned': tc.leaveEarned,
      'Comp-Off': tc.leaveCompOff,
      'Maternity': tc.leaveMaternity
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
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

  const handleSendMessage = () => {
    if (!newMessage.receiver || !newMessage.subject || !newMessage.content) {
      toast.error('Please fill in all fields');
      return;
    }

    const message: Message = {
      id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
      sender: 'Sanya Kapoor',
      senderRole: 'HR',
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
    toast.success('Message sent successfully');
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

  // Handle successful onboarding
  const handleOnboardSuccess = () => {
    // You can add additional logic here if needed
  };

  // Render Overview Tab
  const renderOverview = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} ${tc.bgCardHover} transition-all duration-300 group cursor-pointer hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] sm:text-sm ${tc.textSecondary} truncate`}>{stat.label}</p>
                <p className={`text-base sm:text-2xl font-bold ${tc.text} truncate`}>{stat.value}</p>
                <p className={`text-[8px] sm:text-xs ${tc.textMuted} truncate`}>{stat.subtitle}</p>
                <p className="text-[8px] sm:text-xs text-emerald-400 mt-0.5 sm:mt-1">{stat.change}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-xl bg-indigo-500/10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-2`}>
                <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 text-indigo-400`} aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Employee Onboarding */}
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
            <div>
              <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>Employee Onboarding</h3>
              <p className={`text-sm ${tc.textSecondary}`}>Pipeline of new joiners</p>
            </div>
            <button className={`text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors`}>View all →</button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {onboardingList.map((employee) => (
              <div key={employee.id} className={`${tc.border} border-b last:border-0 pb-3 last:pb-0 ${tc.bgTableHover} p-2 rounded-xl transition-colors`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <p className={`font-medium ${tc.text} text-sm sm:text-base truncate`}>{employee.name}</p>
                      <span className={`text-[10px] sm:text-xs ${tc.textMuted}`}>{employee.id}</span>
                    </div>
                    <p className={`text-xs sm:text-sm ${tc.textSecondary} truncate`}>{employee.role}</p>
                    <p className={`text-[10px] sm:text-xs ${tc.textMuted}`}>Start date - {employee.startDate}</p>
                  </div>
                  <span className={`text-sm font-semibold text-indigo-400 flex-shrink-0`}>{employee.progress}%</span>
                </div>
                <div className="w-full bg-gray-200/20 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      employee.progress >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                      employee.progress >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                    }`} 
                    style={{ width: `${employee.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button 
            type="button"
            onClick={() => setShowOnboardModal(true)}
            className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2 sm:py-2.5 rounded-xl text-sm sm:text-base hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            aria-label="Onboard new hire"
          >
            <UserPlusIcon className="w-4 h-4" aria-hidden="true" />
            Onboard new hire
          </button>
        </div>

        {/* Attendance Monitoring */}
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-1 sm:mb-2 text-base sm:text-lg`}>Attendance Monitoring</h3>
          <p className={`${tc.textSecondary} text-sm mb-3 sm:mb-4`}>Live presence across departments today</p>
          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
            {['Platform', 'Design', 'Product', 'DevOps', 'Marketing', 'Sales'].map((dept, i) => {
              const percentages = [92, 88, 95, 85, 78, 90];
              return (
                <div key={i} className={`flex items-center justify-between ${tc.bgTableHover} p-1 rounded-xl transition-colors gap-2`}>
                  <span className={`text-xs sm:text-sm font-medium ${tc.text} w-16 sm:w-24 flex-shrink-0 truncate`}>{dept}</span>
                  <div className="flex-1 mx-2 sm:mx-4 min-w-[40px]">
                    <div className="w-full bg-gray-200/20 rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <div 
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                          percentages[i] >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                          percentages[i] >= 80 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                        }`} 
                        style={{ width: `${percentages[i]}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold w-10 sm:w-12 text-right ${tc.text} flex-shrink-0`}>{percentages[i]}%</span>
                </div>
              );
            })}
          </div>
          <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 ${tc.border} border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0`}>
            <span className={`text-[10px] sm:text-xs ${tc.textMuted}`}>22 working days this month</span>
            <button className={`text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors`}>View details →</button>
          </div>
        </div>
      </div>

      {/* Leave Requests Summary */}
      <div className={`mt-4 sm:mt-6 ${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
          <div>
            <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>Pending Leave Requests</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Awaiting your review</p>
          </div>
          <span className="px-2 sm:px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs sm:text-sm font-medium">
            {leaveRequests.filter(l => l.status === 'Pending').length} pending
          </span>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px] sm:min-w-0">
            <thead>
              <tr className={`text-left text-[10px] sm:text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3">Request</th>
                <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3">Type</th>
                <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3 hidden sm:table-cell">Period</th>
                <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3 hidden md:table-cell">Reason</th>
                <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3">Status</th>
                <th className="pb-2 sm:pb-3 font-medium px-2 sm:px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.filter(l => l.status === 'Pending').map((request) => (
                <tr key={request.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="py-2 sm:py-3 px-2 sm:px-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-[8px] sm:text-xs font-bold flex-shrink-0">
                        {request.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`font-medium ${tc.text} text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none`}>{request.employee}</span>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getLeaveTypeColor(request.type)} whitespace-nowrap`}>
                      {request.type}
                    </span>
                  </td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-sm ${tc.textSecondary} hidden sm:table-cell`}>{request.period}</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-sm ${tc.textSecondary} max-w-xs truncate hidden md:table-cell`}>{request.reason}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(request.status)} whitespace-nowrap`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button 
                        type="button"
                        className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-[8px] sm:text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                        aria-label={`Approve leave request for ${request.employee}`}
                        title={`Approve leave request for ${request.employee}`}
                      >
                        <CheckCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                      <button 
                        type="button"
                        className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-rose-500/20 text-rose-400 rounded-xl text-[8px] sm:text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                        aria-label={`Reject leave request for ${request.employee}`}
                        title={`Reject leave request for ${request.employee}`}
                      >
                        <XCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
                        <span className="hidden sm:inline">Reject</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // Render Onboarding Tab
  const renderOnboarding = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Employee Onboarding</h2>
          <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>Pipeline of new joiners and their onboarding stage</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowOnboardModal(true)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 sm:gap-2"
          aria-label="Onboard new hire"
        >
          <UserPlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          Onboard New Hire
        </button>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px] sm:min-w-0">
            <thead>
              <tr className={`text-left text-[10px] sm:text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Employee</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Role</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden md:table-cell">Start Date</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden lg:table-cell">Department</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Progress</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Status</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {onboardingList.map((employee) => (
                <tr key={employee.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-sm shadow-lg shadow-indigo-500/25 flex-shrink-0">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium ${tc.text} text-xs sm:text-sm truncate`}>{employee.name}</p>
                        <p className={`text-[8px] sm:text-xs ${tc.textMuted} truncate`}>{employee.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${tc.text} hidden sm:table-cell truncate max-w-[100px]`}>{employee.role}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${tc.textSecondary} hidden md:table-cell`}>{employee.startDate}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 hidden lg:table-cell">
                    <span className={`px-1.5 sm:px-2 py-0.5 ${tc.bgTableHover} ${tc.textSecondary} rounded-full text-[8px] sm:text-xs`}>{employee.department}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-16 sm:w-32 bg-gray-200/20 rounded-full h-1.5 sm:h-2">
                        <div 
                          className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                            employee.progress >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                            employee.progress >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                          }`} 
                          style={{ width: `${employee.progress}%` }}
                        />
                      </div>
                      <span className={`text-[10px] sm:text-sm font-semibold text-indigo-400`}>{employee.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${
                      employee.progress >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 
                      employee.progress >= 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {employee.progress >= 70 ? 'On Track' : employee.progress >= 40 ? 'In Progress' : 'Just Started'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <button 
                      type="button"
                      className="text-indigo-400 hover:text-indigo-300 text-xs sm:text-sm font-medium transition-colors"
                      aria-label={`View onboarding details for ${employee.name}`}
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

  // Render Attendance Tab
  const renderAttendance = () => (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Attendance Monitoring</h2>
        <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>Live presence across departments today</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
          const percentages = [92, 95, 89, 93, 88, 41, 12];
          return (
            <div key={i} className={`${tc.bgCard} p-2 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
              <p className={`text-[8px] sm:text-sm font-medium ${tc.textSecondary}`}>{day}</p>
              <p className={`text-sm sm:text-2xl font-bold ${
                percentages[i] >= 85 ? 'text-emerald-400' : 
                percentages[i] >= 70 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {percentages[i]}%
              </p>
              <div className="w-full bg-gray-200/20 rounded-full h-1 sm:h-1.5 mt-1 sm:mt-2">
                <div 
                  className={`h-1 sm:h-1.5 rounded-full ${
                    percentages[i] >= 85 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                    percentages[i] >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                  }`} 
                  style={{ width: `${percentages[i]}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-3 sm:mb-4 text-base sm:text-lg`}>Department-wise Attendance</h3>
        <div className="space-y-2 sm:space-y-4">
          {['Platform', 'Design', 'Product', 'DevOps', 'Marketing', 'Sales', 'HR', 'Finance'].map((dept, i) => {
            const percentages = [92, 88, 95, 85, 78, 90, 96, 89];
            return (
              <div key={i} className={`flex items-center justify-between ${tc.bgTableHover} p-1.5 sm:p-2 rounded-xl transition-colors gap-2`}>
                <span className={`text-[10px] sm:text-sm font-medium ${tc.text} w-14 sm:w-24 flex-shrink-0 truncate`}>{dept}</span>
                <div className="flex-1 mx-2 sm:mx-4 min-w-[30px]">
                  <div className="w-full bg-gray-200/20 rounded-full h-1.5 sm:h-2.5 overflow-hidden">
                    <div 
                      className={`h-1.5 sm:h-2.5 rounded-full transition-all duration-500 ${
                        percentages[i] >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                        percentages[i] >= 80 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                      }`} 
                      style={{ width: `${percentages[i]}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 w-16 sm:w-32 justify-end flex-shrink-0">
                  <span className={`text-[10px] sm:text-sm font-semibold w-8 sm:w-12 text-right ${tc.text}`}>{percentages[i]}%</span>
                  <span className={`text-[8px] sm:text-xs ${tc.textMuted} hidden sm:inline`}>{Math.round(percentages[i] * 0.15)} present</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render Leave Management Tab
  const renderLeaveManagement = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Leave Requests</h2>
          <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>Approve or reject employee leave requests</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="px-2 sm:px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] sm:text-sm font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full"></span>
            {leaveRequests.filter(l => l.status === 'Pending').length} pending
          </span>
          <div className="relative">
            <MagnifyingGlassIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${tc.textMuted} absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2`} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search..."
              className={`pl-7 sm:pl-9 pr-3 sm:pr-4 py-1 sm:py-2 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all w-24 sm:w-40`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search leave requests"
            />
          </div>
        </div>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[800px] sm:min-w-0">
            <thead>
              <tr className={`text-left text-[10px] sm:text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Request</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Type</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Period</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden md:table-cell">Duration</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden lg:table-cell">Reason</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden xl:table-cell">Department</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Status</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <tr key={request.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-[8px] sm:text-xs font-bold flex-shrink-0">
                        {request.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium ${tc.text} text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none`}>{request.employee}</p>
                        <p className={`text-[8px] sm:text-xs ${tc.textMuted} hidden sm:block`}>{request.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getLeaveTypeColor(request.type)} whitespace-nowrap`}>
                      {request.type}
                    </span>
                  </td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${tc.textSecondary} hidden sm:table-cell`}>{request.period}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${tc.textSecondary} hidden md:table-cell`}>{request.duration}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${tc.textSecondary} max-w-xs truncate hidden lg:table-cell`}>{request.reason}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${tc.textSecondary} hidden xl:table-cell`}>{request.department}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(request.status)} whitespace-nowrap`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    {request.status === 'Pending' ? (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button 
                          type="button"
                          className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-[8px] sm:text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                          aria-label={`Approve leave request for ${request.employee}`}
                          title={`Approve leave request for ${request.employee}`}
                        >
                          <CheckCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
                          <span className="hidden sm:inline">Approve</span>
                        </button>
                        <button 
                          type="button"
                          className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-rose-500/20 text-rose-400 rounded-xl text-[8px] sm:text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                          aria-label={`Reject leave request for ${request.employee}`}
                          title={`Reject leave request for ${request.employee}`}
                        >
                          <XCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[8px] sm:text-xs ${tc.textMuted}`}>Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Salary Tab
  const renderSalary = () => (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Salary & Attendance Report</h2>
        <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>Monthly attendance-linked payable summary - Jun 2026</p>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px] sm:min-w-0">
            <thead>
              <tr className={`text-left text-[10px] sm:text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Employee</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Team</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-center">Present</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-center hidden sm:table-cell">Leaves</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-center hidden md:table-cell">LOP</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right hidden lg:table-cell">Base Salary</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right">Payable</th>
              </tr>
            </thead>
            <tbody>
              {salaryRecords.map((record) => (
                <tr key={record.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-[8px] sm:text-xs shadow-lg shadow-indigo-500/25 flex-shrink-0">
                        {record.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`font-medium ${tc.text} text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none`}>{record.employee}</span>
                    </div>
                  </td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${tc.textSecondary} hidden sm:table-cell`}>{record.team}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-center text-emerald-400 font-semibold`}>{record.present}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-center text-amber-400 hidden sm:table-cell`}>{record.leaves}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-center text-rose-400 hidden md:table-cell`}>{record.lop}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-right ${tc.textSecondary} hidden lg:table-cell`}>{record.baseSalary}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-right font-semibold text-indigo-400`}>{record.payable}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className={`${tc.tableHeader} ${tc.border} border-t`}>
              <tr>
                <td colSpan={6} className={`px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-sm font-semibold ${tc.text} text-right hidden lg:table-cell`}>Total Payable:</td>
                <td className={`px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-sm font-bold text-indigo-400 text-right`}>₹14,53,045</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Holidays Tab
  const renderHolidays = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Holiday Calendar</h2>
          <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>Manage national, regional and optional holidays for FY26</p>
        </div>
        <button 
          type="button"
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 sm:gap-2"
          aria-label="Add new holiday"
        >
          <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          Add Holiday
        </button>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[500px] sm:min-w-0">
            <thead>
              <tr className={`text-left text-[10px] sm:text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Date</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Holiday Name</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Type</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Status</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${tc.textSecondary}`}>{holiday.date}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 font-medium ${tc.text} text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none`}>{holiday.name}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(holiday.type)} whitespace-nowrap`}>
                      {holiday.type}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                    <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] sm:text-xs">Active</span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button 
                        type="button"
                        className={`p-1 ${tc.bgTableHover} rounded transition-colors`}
                        aria-label={`Edit holiday ${holiday.name}`}
                        title={`Edit holiday ${holiday.name}`}
                      >
                        <PencilIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${tc.textMuted}`} aria-hidden="true" />
                      </button>
                      <button 
                        type="button"
                        className={`p-1 ${tc.bgTableHover} rounded transition-colors`}
                        aria-label={`Delete holiday ${holiday.name}`}
                        title={`Delete holiday ${holiday.name}`}
                      >
                        <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-500/10 p-3 sm:p-4 rounded-2xl border border-blue-500/20">
          <h4 className="font-semibold text-blue-400 text-sm sm:text-base">National Holidays</h4>
          <p className="text-xl sm:text-2xl font-bold text-blue-400">{holidays.filter(h => h.type === 'National').length}</p>
          <p className="text-[10px] sm:text-xs text-blue-400/70">Official holidays</p>
        </div>
        <div className="bg-purple-500/10 p-3 sm:p-4 rounded-2xl border border-purple-500/20">
          <h4 className="font-semibold text-purple-400 text-sm sm:text-base">Regional Holidays</h4>
          <p className="text-xl sm:text-2xl font-bold text-purple-400">{holidays.filter(h => h.type === 'Regional').length}</p>
          <p className="text-[10px] sm:text-xs text-purple-400/70">State-specific</p>
        </div>
        <div className="bg-gray-500/10 p-3 sm:p-4 rounded-2xl border border-gray-500/20">
          <h4 className="font-semibold text-gray-400 text-sm sm:text-base">Optional Holidays</h4>
          <p className="text-xl sm:text-2xl font-bold text-gray-400">{holidays.filter(h => h.type === 'Optional').length}</p>
          <p className="text-[10px] sm:text-xs text-gray-400/70">Employee choice</p>
        </div>
      </div>
    </div>
  );

  // Render Announcements Tab
  const renderAnnouncements = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Announcements</h2>
          <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>Broadcast company-wide updates</p>
        </div>
        <button 
          type="button"
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 sm:gap-2"
          aria-label="Create new announcement"
        >
          <MegaphoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Create Announcement Form */}
        <div className={`lg:col-span-1 ${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-3 sm:mb-4 text-base sm:text-lg`}>Create Announcement</h3>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className={`block text-xs sm:text-sm ${tc.textSecondary} mb-1`}>Announcement title</label>
              <input
                type="text"
                placeholder="Enter title..."
                className={`w-full px-3 py-1.5 sm:py-2 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                aria-label="Announcement title"
              />
            </div>
            <div>
              <label className={`block text-xs sm:text-sm ${tc.textSecondary} mb-1`}>Content</label>
              <textarea
                rows={4}
                placeholder="Share the details..."
                className={`w-full px-3 py-1.5 sm:py-2 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none`}
                aria-label="Announcement content"
              />
            </div>
            <div>
              <label className={`block text-xs sm:text-sm ${tc.textSecondary} mb-1`}>Audience</label>
              <select 
                className={`w-full px-3 py-1.5 sm:py-2 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                aria-label="Select audience for announcement"
              >
                <option>All</option>
                <option>Leadership</option>
                <option>Platform Team</option>
                <option>Product Team</option>
              </select>
            </div>
            <button 
              type="button"
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              aria-label="Publish announcement"
            >
              <MegaphoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              Publish
            </button>
          </div>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} ${tc.bgCardHover} transition-all duration-300`}>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <h3 className={`font-semibold ${tc.text} text-sm sm:text-base truncate`}>{announcement.title}</h3>
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(announcement.status)} flex-shrink-0`}>
                      {announcement.status}
                    </span>
                    <span className={`text-[8px] sm:text-xs ${tc.textMuted} flex-shrink-0`}>{announcement.id}</span>
                  </div>
                  <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>{announcement.content}</p>
                  <div className={`mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-[8px] sm:text-xs ${tc.textMuted}`}>
                    <span>By: {announcement.author}</span>
                    <span>{announcement.date}</span>
                    <span className={`px-1.5 sm:px-2 py-0.5 ${tc.bgTableHover} rounded-full`}>{announcement.audience}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button 
                    type="button"
                    className={`p-1 ${tc.bgTableHover} rounded transition-colors`}
                    aria-label={`Edit announcement ${announcement.title}`}
                    title={`Edit announcement ${announcement.title}`}
                  >
                    <PencilIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${tc.textMuted}`} aria-hidden="true" />
                  </button>
                  <button 
                    type="button"
                    className={`p-1 ${tc.bgTableHover} rounded transition-colors`}
                    aria-label={`View announcement ${announcement.title}`}
                    title={`View announcement ${announcement.title}`}
                  >
                    <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Queries Tab
  const renderQueries = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Queries & Messages</h2>
          <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>View and respond to messages from employees, managers, and super admin</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowCompose(true)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 sm:gap-2"
          aria-label="Compose new message"
        >
          <PaperAirplaneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          Compose Message
        </button>
      </div>

      {/* Compose Message Modal */}
      {showCompose && (
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>Compose New Message</h3>
            <button 
              type="button"
              onClick={() => setShowCompose(false)}
              className={`${tc.textMuted} hover:${tc.text}`}
              aria-label="Close compose window"
            >
              <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className={`block text-xs sm:text-sm ${tc.textSecondary} mb-1`}>Recipient</label>
              <select 
                className={`w-full px-3 py-1.5 sm:py-2 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                value={newMessage.receiver}
                onChange={(e) => setNewMessage({ ...newMessage, receiver: e.target.value })}
                aria-label="Select recipient"
              >
                <option value="">Select recipient</option>
                <option value="Aarav Mehta">Aarav Mehta (Super Admin)</option>
                <option value="Priya Nair">Priya Nair (Manager)</option>
                <option value="Vikram Shah">Vikram Shah (Manager)</option>
                <option value="Ishita Roy">Ishita Roy (Employee)</option>
                <option value="Karan Singh">Karan Singh (Employee)</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs sm:text-sm ${tc.textSecondary} mb-1`}>Category</label>
              <select 
                className={`w-full px-3 py-1.5 sm:py-2 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
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
              <label className={`block text-xs sm:text-sm ${tc.textSecondary} mb-1`}>Subject</label>
              <input
                type="text"
                placeholder="Enter subject..."
                className={`w-full px-3 py-1.5 sm:py-2 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                aria-label="Message subject"
              />
            </div>
            <div>
              <label className={`block text-xs sm:text-sm ${tc.textSecondary} mb-1`}>Message</label>
              <textarea
                rows={4}
                placeholder="Type your message here..."
                className={`w-full px-3 py-1.5 sm:py-2 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none`}
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                aria-label="Message content"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3">
              <button 
                type="button"
                onClick={() => setShowCompose(false)}
                className={`w-full sm:w-auto px-4 py-1.5 sm:py-2 ${tc.border} ${tc.textSecondary} rounded-xl text-xs sm:text-sm font-medium ${tc.bgTableHover} transition-colors`}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSendMessage}
                className="w-full sm:w-auto px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4`}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none min-w-[100px]">
            <label className={`text-[10px] sm:text-xs ${tc.textSecondary} block mb-0.5 sm:mb-1`}>Status</label>
            <select 
              className={`w-full px-2 sm:px-3 py-1 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'unread' | 'read')}
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div className="flex-1 sm:flex-none min-w-[100px]">
            <label className={`text-[10px] sm:text-xs ${tc.textSecondary} block mb-0.5 sm:mb-1`}>Category</label>
            <select 
              className={`w-full px-2 sm:px-3 py-1 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
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
        <div className={`text-[10px] sm:text-sm ${tc.textSecondary} flex-shrink-0`}>
          {filteredMessages.filter(m => !m.read).length} unread • {filteredMessages.length} total
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-2 sm:space-y-3">
        {filteredMessages.length === 0 ? (
          <div className={`${tc.bgCard} p-8 sm:p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
            <InboxIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${tc.textMuted} mx-auto mb-3`} aria-hidden="true" />
            <p className={tc.textSecondary}>No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${tc.bgCard} p-4 sm:p-5 rounded-2xl ${tc.border} ${tc.shadow} ${!msg.read ? 'border-indigo-500/30 bg-indigo-500/5' : ''} ${tc.bgCardHover} transition-all cursor-pointer`}
              onClick={() => markAsRead(msg.id)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && markAsRead(msg.id)}
              aria-label={`Message from ${msg.sender}: ${msg.subject}`}
            >
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getSenderRoleColor(msg.senderRole)}`}>
                      {msg.senderRole}
                    </span>
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getCategoryColor(msg.category)}`}>
                      {msg.category}
                    </span>
                    {!msg.read && (
                      <span className="px-1.5 sm:px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[8px] sm:text-xs font-medium animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                  <h3 className={`font-semibold ${tc.text} text-sm sm:text-base truncate`}>{msg.subject}</h3>
                  <p className={`text-xs sm:text-sm ${tc.textSecondary} mt-0.5 sm:mt-1 line-clamp-2`}>{msg.content}</p>
                  <div className={`mt-1.5 sm:mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs ${tc.textMuted}`}>
                    <span><strong className={tc.textSecondary}>From:</strong> {msg.sender}</span>
                    <span className="hidden sm:inline"><strong className={tc.textSecondary}>To:</strong> {msg.receiver}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
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
                    title={`Reply to ${msg.sender}`}
                  >
                    <PaperAirplaneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
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
                    title={`Delete message from ${msg.sender}`}
                  >
                    <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Main render with sidebar navigation
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'onboarding':
        return renderOnboarding();
      case 'attendance':
        return renderAttendance();
      case 'leaves':
        return renderLeaveManagement();
      case 'salary':
        return renderSalary();
      case 'holidays':
        return renderHolidays();
      case 'announcements':
        return renderAnnouncements();
      case 'queries':
        return renderQueries();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={`flex h-screen ${tc.bg} transition-colors duration-300 overflow-hidden`}>
      {/* Desktop Sidebar */}
      <Sidebar 
        role="hr-partner" 
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Mobile Sidebar */}
      <Sidebar 
        role="hr-partner"
        isMobile={true}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header 
          title="People Operations"
          subtitle="Sanya Kapoor - HR Business Partner"
          theme={theme}
          onThemeToggle={toggleTheme}
          onMobileMenuToggle={toggleMobileSidebar}
          isMobile={isMobile}
        />
        <div className={`flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 ${tc.scrollbar} scrollbar-thin`}>
          {renderContent()}
        </div>
      </div>

      {/* Onboard New Hire Modal */}
      <OnboardNewHireModal 
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        onSuccess={handleOnboardSuccess}
        theme={theme}
      />
    </div>
  );
};

export default HRDashboard;