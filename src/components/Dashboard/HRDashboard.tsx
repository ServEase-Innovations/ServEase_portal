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
  MoonIcon
} from '@heroicons/react/24/outline';

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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
  const onboardingList: OnboardingEmployee[] = [
    { id: 'ONB-001', name: 'Tanvi Bhatia', role: 'Frontend Engineer - Platform', startDate: '2026-06-10', progress: 70, department: 'Platform' },
    { id: 'ONB-002', name: 'Rahul Khanna', role: 'Data Analyst - Product', startDate: '2026-06-15', progress: 40, department: 'Product' },
    { id: 'ONB-003', name: 'Naina Sethi', role: 'Product Designer - Design', startDate: '2026-06-17', progress: 90, department: 'Design' },
    { id: 'ONB-004', name: 'Aditya Rao', role: 'SRE Engineer - DevOps', startDate: '2026-07-01', progress: 15, department: 'DevOps' }
  ];

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
      alert('Please fill in all fields');
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

  // Render Overview Tab
  const renderOverview = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${tc.textSecondary}`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${tc.text}`}>{stat.value}</p>
                <p className={`text-xs ${tc.textMuted}`}>{stat.subtitle}</p>
                <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-xl bg-indigo-500/10 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 text-indigo-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Onboarding */}
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className={`font-semibold ${tc.text}`}>Employee Onboarding</h3>
              <p className={`text-sm ${tc.textSecondary}`}>Pipeline of new joiners</p>
            </div>
            <button className={`text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors`}>View all →</button>
          </div>
          <div className="space-y-4">
            {onboardingList.map((employee) => (
              <div key={employee.id} className={`${tc.border} border-b last:border-0 pb-3 last:pb-0 ${tc.bgTableHover} p-2 rounded-xl transition-colors`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${tc.text}`}>{employee.name}</p>
                      <span className={`text-xs ${tc.textMuted}`}>{employee.id}</span>
                    </div>
                    <p className={`text-sm ${tc.textSecondary}`}>{employee.role}</p>
                    <p className={`text-xs ${tc.textMuted}`}>Start date - {employee.startDate}</p>
                  </div>
                  <span className={`text-sm font-semibold text-indigo-400`}>{employee.progress}%</span>
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
            className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2.5 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            <UserPlusIcon className="w-4 h-4" />
            Onboard new hire
          </button>
        </div>

        {/* Attendance Monitoring */}
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-2`}>Attendance Monitoring</h3>
          <p className={`${tc.textSecondary} text-sm mb-4`}>Live presence across departments today</p>
          <div className="mt-4 space-y-3">
            {['Platform', 'Design', 'Product', 'DevOps', 'Marketing', 'Sales'].map((dept, i) => {
              const percentages = [92, 88, 95, 85, 78, 90];
              return (
                <div key={i} className={`flex items-center justify-between ${tc.bgTableHover} p-1 rounded-xl transition-colors`}>
                  <span className={`text-sm font-medium ${tc.text} w-24`}>{dept}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200/20 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percentages[i] >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                          percentages[i] >= 80 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                        }`} 
                        style={{ width: `${percentages[i]}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${tc.text}`}>{percentages[i]}%</span>
                </div>
              );
            })}
          </div>
          <div className={`mt-4 pt-4 ${tc.border} border-t flex justify-between items-center`}>
            <span className={`text-xs ${tc.textMuted}`}>22 working days this month</span>
            <button className={`text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors`}>View details →</button>
          </div>
        </div>
      </div>

      {/* Leave Requests Summary */}
      <div className={`mt-6 ${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className={`font-semibold ${tc.text}`}>Pending Leave Requests</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Awaiting your review</p>
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
            {leaveRequests.filter(l => l.status === 'Pending').length} pending
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="pb-3 font-medium">Request</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Period</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.filter(l => l.status === 'Pending').map((request) => (
                <tr key={request.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {request.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`font-medium ${tc.text}`}>{request.employee}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.type)}`}>
                      {request.type}
                    </span>
                  </td>
                  <td className={`py-3 text-sm ${tc.textSecondary}`}>{request.period} <span className={`text-xs ${tc.textMuted}`}>({request.duration})</span></td>
                  <td className={`py-3 text-sm ${tc.textSecondary} max-w-xs truncate`}>{request.reason}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                      >
                        <CheckCircleIcon className="w-3 h-3" />
                        Approve
                      </button>
                      <button 
                        type="button"
                        className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-xl text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-1"
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
    </>
  );

  // Render Onboarding Tab
  const renderOnboarding = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Employee Onboarding</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Pipeline of new joiners and their onboarding stage</p>
        </div>
        <button 
          type="button"
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
        >
          <UserPlusIcon className="w-4 h-4" />
          Onboard New Hire
        </button>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Start Date</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Progress</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {onboardingList.map((employee) => (
                <tr key={employee.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className={`font-medium ${tc.text}`}>{employee.name}</p>
                        <p className={`text-xs ${tc.textMuted}`}>{employee.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.text}`}>{employee.role}</td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{employee.startDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 ${tc.bgTableHover} ${tc.textSecondary} rounded-full text-xs`}>{employee.department}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200/20 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            employee.progress >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                            employee.progress >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                          }`} 
                          style={{ width: `${employee.progress}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold text-indigo-400`}>{employee.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.progress >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 
                      employee.progress >= 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {employee.progress >= 70 ? 'On Track' : employee.progress >= 40 ? 'In Progress' : 'Just Started'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      type="button"
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
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
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${tc.text}`}>Attendance Monitoring</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Live presence across departments today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
          const percentages = [92, 95, 89, 93, 88, 41, 12];
          return (
            <div key={i} className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
              <p className={`text-sm font-medium ${tc.textSecondary}`}>{day}</p>
              <p className={`text-2xl font-bold ${
                percentages[i] >= 85 ? 'text-emerald-400' : 
                percentages[i] >= 70 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {percentages[i]}%
              </p>
              <div className="w-full bg-gray-200/20 rounded-full h-1.5 mt-2">
                <div 
                  className={`h-1.5 rounded-full ${
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

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-4`}>Department-wise Attendance</h3>
        <div className="space-y-4">
          {['Platform', 'Design', 'Product', 'DevOps', 'Marketing', 'Sales', 'HR', 'Finance'].map((dept, i) => {
            const percentages = [92, 88, 95, 85, 78, 90, 96, 89];
            return (
              <div key={i} className={`flex items-center justify-between ${tc.bgTableHover} p-2 rounded-xl transition-colors`}>
                <span className={`text-sm font-medium ${tc.text} w-24`}>{dept}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200/20 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        percentages[i] >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
                        percentages[i] >= 80 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'
                      }`} 
                      style={{ width: `${percentages[i]}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 w-32 justify-end">
                  <span className={`text-sm font-semibold w-12 text-right ${tc.text}`}>{percentages[i]}%</span>
                  <span className={`text-xs ${tc.textMuted}`}>{Math.round(percentages[i] * 0.15)} present</span>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Leave Requests</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Approve or reject employee leave requests</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
            {leaveRequests.filter(l => l.status === 'Pending').length} pending
          </span>
          <div className="relative">
            <MagnifyingGlassIcon className={`w-4 h-4 ${tc.textMuted} absolute left-3 top-1/2 transform -translate-y-1/2`} />
            <input
              type="text"
              placeholder="Search requests..."
              className={`pl-9 pr-4 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search leave requests"
            />
          </div>
        </div>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-6 py-3 font-medium">Request</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Period</th>
                <th className="px-6 py-3 font-medium">Duration</th>
                <th className="px-6 py-3 font-medium">Reason</th>
                <th className="px-6 py-3 font-medium">Department</th>
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
                      <div>
                        <p className={`font-medium ${tc.text}`}>{request.employee}</p>
                        <p className={`text-xs ${tc.textMuted}`}>{request.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.type)}`}>
                      {request.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{request.period}</td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{request.duration}</td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary} max-w-xs truncate`}>{request.reason}</td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{request.department}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {request.status === 'Pending' ? (
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                          aria-label={`Approve leave request for ${request.employee}`}
                        >
                          <CheckCircleIcon className="w-3 h-3" />
                          Approve
                        </button>
                        <button 
                          type="button"
                          className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-xl text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                          aria-label={`Reject leave request for ${request.employee}`}
                        >
                          <XCircleIcon className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs ${tc.textMuted}`}>Reviewed</span>
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
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${tc.text}`}>Salary & Attendance Report</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Monthly attendance-linked payable summary - Jun 2026</p>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Team</th>
                <th className="px-6 py-3 font-medium text-center">Present</th>
                <th className="px-6 py-3 font-medium text-center">Leaves</th>
                <th className="px-6 py-3 font-medium text-center">LOP</th>
                <th className="px-6 py-3 font-medium text-right">Base Salary</th>
                <th className="px-6 py-3 font-medium text-right">Payable</th>
              </tr>
            </thead>
            <tbody>
              {salaryRecords.map((record) => (
                <tr key={record.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/25">
                        {record.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`font-medium ${tc.text}`}>{record.employee}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{record.team}</td>
                  <td className={`px-6 py-4 text-sm text-center text-emerald-400 font-semibold`}>{record.present}</td>
                  <td className={`px-6 py-4 text-sm text-center text-amber-400`}>{record.leaves}</td>
                  <td className={`px-6 py-4 text-sm text-center text-rose-400`}>{record.lop}</td>
                  <td className={`px-6 py-4 text-sm text-right ${tc.textSecondary}`}>{record.baseSalary}</td>
                  <td className={`px-6 py-4 text-sm text-right font-semibold text-indigo-400`}>{record.payable}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className={`${tc.tableHeader} ${tc.border} border-t`}>
              <tr>
                <td colSpan={6} className={`px-6 py-3 text-sm font-semibold ${tc.text} text-right`}>Total Payable:</td>
                <td className={`px-6 py-3 text-sm font-bold text-indigo-400 text-right`}>₹14,53,045</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Holidays Tab
  const renderHolidays = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Holiday Calendar</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Manage national, regional and optional holidays for FY26</p>
        </div>
        <button 
          type="button"
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Holiday
        </button>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Holiday Name</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{holiday.date}</td>
                  <td className={`px-6 py-4 font-medium ${tc.text}`}>{holiday.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(holiday.type)}`}>
                      {holiday.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        className={`p-1 ${tc.bgTableHover} rounded transition-colors`}
                        aria-label={`Edit holiday ${holiday.name}`}
                      >
                        <PencilIcon className={`w-4 h-4 ${tc.textMuted}`} />
                      </button>
                      <button 
                        type="button"
                        className={`p-1 ${tc.bgTableHover} rounded transition-colors`}
                        aria-label={`Delete holiday ${holiday.name}`}
                      >
                        <TrashIcon className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
          <h4 className="font-semibold text-blue-400">National Holidays</h4>
          <p className="text-2xl font-bold text-blue-400">{holidays.filter(h => h.type === 'National').length}</p>
          <p className="text-xs text-blue-400/70">Official holidays</p>
        </div>
        <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
          <h4 className="font-semibold text-purple-400">Regional Holidays</h4>
          <p className="text-2xl font-bold text-purple-400">{holidays.filter(h => h.type === 'Regional').length}</p>
          <p className="text-xs text-purple-400/70">State-specific</p>
        </div>
        <div className="bg-gray-500/10 p-4 rounded-2xl border border-gray-500/20">
          <h4 className="font-semibold text-gray-400">Optional Holidays</h4>
          <p className="text-2xl font-bold text-gray-400">{holidays.filter(h => h.type === 'Optional').length}</p>
          <p className="text-xs text-gray-400/70">Employee choice</p>
        </div>
      </div>
    </div>
  );

  // Render Announcements Tab
  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Announcements</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Broadcast company-wide updates</p>
        </div>
        <button 
          type="button"
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
        >
          <MegaphoneIcon className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Announcement Form */}
        <div className={`lg:col-span-1 ${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-4`}>Create Announcement</h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm ${tc.textSecondary} mb-1`}>Announcement title</label>
              <input
                type="text"
                placeholder="Enter title..."
                className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                aria-label="Announcement title"
              />
            </div>
            <div>
              <label className={`block text-sm ${tc.textSecondary} mb-1`}>Content</label>
              <textarea
                rows={4}
                placeholder="Share the details..."
                className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none`}
                aria-label="Announcement content"
              />
            </div>
            <div>
              <label className={`block text-sm ${tc.textSecondary} mb-1`}>Audience</label>
              <select 
                className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
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
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2.5 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <MegaphoneIcon className="w-4 h-4" />
              Publish
            </button>
          </div>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-2 space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-semibold ${tc.text}`}>{announcement.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                      {announcement.status}
                    </span>
                    <span className={`text-xs ${tc.textMuted}`}>{announcement.id}</span>
                  </div>
                  <p className={`text-sm ${tc.textSecondary}`}>{announcement.content}</p>
                  <div className={`mt-3 flex items-center gap-4 text-xs ${tc.textMuted}`}>
                    <span>By: {announcement.author}</span>
                    <span>{announcement.date}</span>
                    <span className={`px-2 py-0.5 ${tc.bgTableHover} rounded-full`}>{announcement.audience}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button 
                    type="button"
                    className={`p-1 ${tc.bgTableHover} rounded transition-colors`}
                    aria-label={`Edit announcement ${announcement.title}`}
                  >
                    <PencilIcon className={`w-4 h-4 ${tc.textMuted}`} />
                  </button>
                  <button 
                    type="button"
                    className={`p-1 ${tc.bgTableHover} rounded transition-colors`}
                    aria-label={`View announcement ${announcement.title}`}
                  >
                    <EyeIcon className="w-4 h-4 text-indigo-400" />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Queries & Messages</h2>
          <p className={`text-sm ${tc.textSecondary}`}>View and respond to messages from employees, managers, and super admin</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowCompose(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
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
                <option value="Aarav Mehta">Aarav Mehta (Super Admin)</option>
                <option value="Priya Nair">Priya Nair (Manager)</option>
                <option value="Vikram Shah">Vikram Shah (Manager)</option>
                <option value="Ishita Roy">Ishita Roy (Employee)</option>
                <option value="Karan Singh">Karan Singh (Employee)</option>
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
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSendMessage}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
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
    <div className={`flex h-screen ${tc.bg} transition-colors duration-300`}>
      <Sidebar role="hr-partner" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="People Operations"
          subtitle="Sanya Kapoor - HR Business Partner"
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

export default HRDashboard;