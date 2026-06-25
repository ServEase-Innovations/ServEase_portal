import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import {
  UsersIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ViewColumnsIcon,
  QueueListIcon,
  CalendarIcon,
  MegaphoneIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BanknotesIcon,
  ChartPieIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  HomeIcon,
  BuildingOffice2Icon,
  UserIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  InboxIcon,
  UsersIcon as UsersIconSolid,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

// Types
interface Employee {
  id: string;
  name: string;
  role: string;
  team: string;
  salary: string;
  status: 'Active' | 'On Leave' | 'Suspended';
  email: string;
  designation: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  budget: string;
  employees: number;
}

interface Team {
  id: string;
  name: string;
  manager: string;
  members: number;
  projects: number;
}

interface ProjectTeam {
  id: string;
  name: string;
  project: string;
  manager: string;
  members: number;
  created: string;
}

interface Task {
  id: string;
  title: string;
  project: string;
  assignee: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  due: string;
}

interface LeaveRequest {
  id: string;
  employee: string;
  type: 'Casual' | 'Sick' | 'Earned' | 'Comp-Off' | 'Maternity';
  period: string;
  duration: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
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

interface ActivityLog {
  id: string;
  when: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
}

interface PayrollRecord {
  id: string;
  employee: string;
  employeeId: string;
  role: string;
  basic: number;
  allowances: number;
  deductions: number;
  bonus: number;
  net: string;
  appraisal: number;
}

interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  team: string;
  designation: string;
  totalDays: number;
  presentDays: number;
  leaveDays: number;
  wfhDays: number;
  workingHours: number;
  pendingLeave: number;
  weeklyData: {
    week: string;
    present: number;
    leave: number;
    wfh: number;
    hours: number;
  }[];
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

const SuperAdminDashboard = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [attendanceView, setAttendanceView] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedMonth, setSelectedMonth] = useState('June 2026');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Queries state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'MSG-001',
      sender: 'Priya Nair',
      senderRole: 'Manager',
      receiver: 'Super Admin',
      receiverRole: 'Super Admin',
      subject: 'Budget approval for Q3 hiring',
      content: 'We need approval for 3 new backend positions in Platform team. Total budget required: ₹45L. Please review and approve.',
      timestamp: '2026-06-24 10:30',
      read: false,
      category: 'HR'
    },
    {
      id: 'MSG-002',
      sender: 'Vikram Shah',
      senderRole: 'Manager',
      receiver: 'Super Admin',
      receiverRole: 'Super Admin',
      subject: 'Product roadmap review',
      content: 'Requesting a quick review of Q3 product roadmap. Need sign-off on new feature prioritization.',
      timestamp: '2026-06-23 16:45',
      read: false,
      category: 'General'
    },
    {
      id: 'MSG-003',
      sender: 'Sanya Kapoor',
      senderRole: 'HR',
      receiver: 'Super Admin',
      receiverRole: 'Super Admin',
      subject: 'New hire onboarding - June batch',
      content: '15 new hires joining on July 1st. Need IT setup and access provisioning completed by June 28th.',
      timestamp: '2026-06-23 14:20',
      read: true,
      category: 'HR'
    },
    {
      id: 'MSG-004',
      sender: 'Ishita Roy',
      senderRole: 'Employee',
      receiver: 'Super Admin',
      receiverRole: 'Super Admin',
      subject: 'Request for work-from-home extension',
      content: 'I request to extend my WFH arrangement by 2 more weeks due to personal commitments. My team manager has approved.',
      timestamp: '2026-06-22 09:15',
      read: true,
      category: 'Leave'
    },
    {
      id: 'MSG-005',
      sender: 'Ananya Iyer',
      senderRole: 'Employee',
      receiver: 'Super Admin',
      receiverRole: 'Super Admin',
      subject: 'Design tool license renewal',
      content: 'Figma enterprise license expiring next month. Need approval for renewal of 5 seats. Cost: ₹1.2L/year.',
      timestamp: '2026-06-21 11:00',
      read: false,
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

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/overview') return 'overview';
    if (path === '/dashboard/employees') return 'employees';
    if (path === '/dashboard/departments') return 'departments';
    if (path === '/dashboard/teams') return 'teams';
    if (path === '/dashboard/project-teams') return 'project-teams';
    if (path === '/dashboard/tasks') return 'tasks';
    if (path === '/dashboard/attendance') return 'attendance';
    if (path === '/dashboard/leave-approvals') return 'leave-approvals';
    if (path === '/dashboard/holidays') return 'holidays';
    if (path === '/dashboard/announcements') return 'announcements';
    if (path === '/dashboard/activity-logs') return 'activity-logs';
    if (path === '/dashboard/performance') return 'performance';
    if (path === '/dashboard/payroll') return 'payroll';
    if (path === '/dashboard/analytics') return 'analytics';
    if (path === '/dashboard/queries') return 'queries';
    return 'overview';
  };

  const activeTab = getActiveTab();

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
    };
  };

  const tc = getThemeClasses();

  // Stats data
  const stats = [
    { label: 'Total Employees', value: '1,240', icon: UsersIcon, subtitle: '+12 this month', color: 'blue' },
    { label: 'Teams', value: '5', icon: BriefcaseIcon, subtitle: '6 projects active', color: 'green' },
    { label: 'Open Tasks', value: '228', icon: ClipboardDocumentCheckIcon, subtitle: '91% on-track', color: 'purple' },
    { label: 'Payroll (MTD)', value: '₹4.8Cr', icon: BanknotesIcon, subtitle: 'Cycle closes 30 Jun', color: 'orange' }
  ];

  // Employees data
  const employees: Employee[] = [
    { id: 'SE-001', name: 'Aarav Mehta', role: 'Super Admin', team: 'Leadership', salary: '₹2,85,000', status: 'Active', email: 'aarav@servease.com', designation: 'Super Admin' },
    { id: 'SE-042', name: 'Priya Nair', role: 'Manager', team: 'Platform', salary: '₹1,95,000', status: 'Active', email: 'priya@servease.com', designation: 'Engineering Manager' },
    { id: 'SE-058', name: 'Vikram Shah', role: 'Manager', team: 'Product', salary: '₹1,75,000', status: 'Active', email: 'vikram@servease.com', designation: 'Product Manager' },
    { id: 'SE-101', name: 'Ishita Roy', role: 'Employee', team: 'Platform', salary: '₹95,000', status: 'Active', email: 'ishita@servease.com', designation: 'Frontend Engineer' },
    { id: 'SE-118', name: 'Karan Singh', role: 'Employee', team: 'Platform', salary: '₹1,02,000', status: 'Active', email: 'karan@servease.com', designation: 'Backend Engineer' },
    { id: 'SE-152', name: 'Ananya Iyer', role: 'Employee', team: 'Design', salary: '₹88,000', status: 'On Leave', email: 'ananya@servease.com', designation: 'Product Designer' },
    { id: 'SE-187', name: 'Rohan Verma', role: 'Employee', team: 'Platform', salary: '₹1,24,000', status: 'Active', email: 'rohan@servease.com', designation: 'Senior Software Engineer' },
    { id: 'SE-204', name: 'Sneha Pillai', role: 'Employee', team: 'QA', salary: '₹1,10,000', status: 'Active', email: 'sneha@servease.com', designation: 'QA Lead' },
    { id: 'SE-219', name: 'Devansh Kapoor', role: 'Employee', team: 'DevOps', salary: '₹1,18,000', status: 'Suspended', email: 'devansh@servease.com', designation: 'DevOps Engineer' },
    { id: 'SE-232', name: 'Meera Joshi', role: 'Employee', team: 'Product', salary: '₹78,000', status: 'Active', email: 'meera@servease.com', designation: 'Product Analyst' }
  ];

  // Attendance Data
  const attendanceRecords: AttendanceRecord[] = [
    {
      employeeId: 'SE-001',
      employeeName: 'Aarav Mehta',
      team: 'Leadership',
      designation: 'Super Admin',
      totalDays: 22,
      presentDays: 20,
      leaveDays: 2,
      wfhDays: 5,
      workingHours: 172,
      pendingLeave: 1,
      weeklyData: [
        { week: 'Week 1', present: 4, leave: 1, wfh: 1, hours: 36 },
        { week: 'Week 2', present: 5, leave: 0, wfh: 2, hours: 44 },
        { week: 'Week 3', present: 4, leave: 1, wfh: 1, hours: 38 },
        { week: 'Week 4', present: 5, leave: 0, wfh: 1, hours: 42 },
        { week: 'Week 5', present: 2, leave: 0, wfh: 0, hours: 12 }
      ]
    },
    {
      employeeId: 'SE-042',
      employeeName: 'Priya Nair',
      team: 'Platform',
      designation: 'Engineering Manager',
      totalDays: 22,
      presentDays: 18,
      leaveDays: 4,
      wfhDays: 6,
      workingHours: 158,
      pendingLeave: 2,
      weeklyData: [
        { week: 'Week 1', present: 3, leave: 2, wfh: 1, hours: 28 },
        { week: 'Week 2', present: 4, leave: 0, wfh: 2, hours: 40 },
        { week: 'Week 3', present: 4, leave: 1, wfh: 1, hours: 36 },
        { week: 'Week 4', present: 5, leave: 0, wfh: 1, hours: 44 },
        { week: 'Week 5', present: 2, leave: 1, wfh: 1, hours: 10 }
      ]
    },
    {
      employeeId: 'SE-058',
      employeeName: 'Vikram Shah',
      team: 'Product',
      designation: 'Product Manager',
      totalDays: 22,
      presentDays: 19,
      leaveDays: 3,
      wfhDays: 4,
      workingHours: 165,
      pendingLeave: 0,
      weeklyData: [
        { week: 'Week 1', present: 4, leave: 0, wfh: 1, hours: 40 },
        { week: 'Week 2', present: 5, leave: 0, wfh: 1, hours: 42 },
        { week: 'Week 3', present: 4, leave: 1, wfh: 1, hours: 36 },
        { week: 'Week 4', present: 4, leave: 1, wfh: 1, hours: 36 },
        { week: 'Week 5', present: 2, leave: 1, wfh: 0, hours: 11 }
      ]
    },
    {
      employeeId: 'SE-101',
      employeeName: 'Ishita Roy',
      team: 'Platform',
      designation: 'Frontend Engineer',
      totalDays: 22,
      presentDays: 21,
      leaveDays: 1,
      wfhDays: 8,
      workingHours: 180,
      pendingLeave: 3,
      weeklyData: [
        { week: 'Week 1', present: 5, leave: 0, wfh: 2, hours: 44 },
        { week: 'Week 2', present: 4, leave: 1, wfh: 2, hours: 38 },
        { week: 'Week 3', present: 5, leave: 0, wfh: 2, hours: 44 },
        { week: 'Week 4', present: 5, leave: 0, wfh: 1, hours: 44 },
        { week: 'Week 5', present: 2, leave: 0, wfh: 1, hours: 10 }
      ]
    },
    {
      employeeId: 'SE-118',
      employeeName: 'Karan Singh',
      team: 'Platform',
      designation: 'Backend Engineer',
      totalDays: 22,
      presentDays: 17,
      leaveDays: 5,
      wfhDays: 3,
      workingHours: 152,
      pendingLeave: 2,
      weeklyData: [
        { week: 'Week 1', present: 3, leave: 2, wfh: 1, hours: 26 },
        { week: 'Week 2', present: 4, leave: 0, wfh: 0, hours: 40 },
        { week: 'Week 3', present: 3, leave: 2, wfh: 1, hours: 30 },
        { week: 'Week 4', present: 5, leave: 0, wfh: 1, hours: 44 },
        { week: 'Week 5', present: 2, leave: 1, wfh: 0, hours: 12 }
      ]
    },
    {
      employeeId: 'SE-152',
      employeeName: 'Ananya Iyer',
      team: 'Design',
      designation: 'Product Designer',
      totalDays: 22,
      presentDays: 20,
      leaveDays: 2,
      wfhDays: 7,
      workingHours: 170,
      pendingLeave: 4,
      weeklyData: [
        { week: 'Week 1', present: 4, leave: 1, wfh: 2, hours: 34 },
        { week: 'Week 2', present: 5, leave: 0, wfh: 2, hours: 42 },
        { week: 'Week 3', present: 5, leave: 0, wfh: 2, hours: 44 },
        { week: 'Week 4', present: 4, leave: 1, wfh: 1, hours: 38 },
        { week: 'Week 5', present: 2, leave: 0, wfh: 0, hours: 12 }
      ]
    },
    {
      employeeId: 'SE-187',
      employeeName: 'Rohan Verma',
      team: 'Platform',
      designation: 'Senior Software Engineer',
      totalDays: 22,
      presentDays: 22,
      leaveDays: 0,
      wfhDays: 6,
      workingHours: 190,
      pendingLeave: 0,
      weeklyData: [
        { week: 'Week 1', present: 5, leave: 0, wfh: 2, hours: 46 },
        { week: 'Week 2', present: 5, leave: 0, wfh: 1, hours: 44 },
        { week: 'Week 3', present: 5, leave: 0, wfh: 2, hours: 46 },
        { week: 'Week 4', present: 5, leave: 0, wfh: 1, hours: 44 },
        { week: 'Week 5', present: 2, leave: 0, wfh: 0, hours: 10 }
      ]
    },
    {
      employeeId: 'SE-204',
      employeeName: 'Sneha Pillai',
      team: 'QA',
      designation: 'QA Lead',
      totalDays: 22,
      presentDays: 19,
      leaveDays: 3,
      wfhDays: 5,
      workingHours: 162,
      pendingLeave: 1,
      weeklyData: [
        { week: 'Week 1', present: 4, leave: 1, wfh: 1, hours: 36 },
        { week: 'Week 2', present: 5, leave: 0, wfh: 1, hours: 42 },
        { week: 'Week 3', present: 4, leave: 1, wfh: 2, hours: 34 },
        { week: 'Week 4', present: 4, leave: 1, wfh: 1, hours: 38 },
        { week: 'Week 5', present: 2, leave: 0, wfh: 0, hours: 12 }
      ]
    },
    {
      employeeId: 'SE-219',
      employeeName: 'Devansh Kapoor',
      team: 'DevOps',
      designation: 'DevOps Engineer',
      totalDays: 22,
      presentDays: 15,
      leaveDays: 7,
      wfhDays: 2,
      workingHours: 140,
      pendingLeave: 5,
      weeklyData: [
        { week: 'Week 1', present: 3, leave: 2, wfh: 0, hours: 28 },
        { week: 'Week 2', present: 3, leave: 2, wfh: 1, hours: 26 },
        { week: 'Week 3', present: 4, leave: 1, wfh: 1, hours: 34 },
        { week: 'Week 4', present: 3, leave: 2, wfh: 0, hours: 30 },
        { week: 'Week 5', present: 2, leave: 0, wfh: 0, hours: 22 }
      ]
    },
    {
      employeeId: 'SE-232',
      employeeName: 'Meera Joshi',
      team: 'Product',
      designation: 'Product Analyst',
      totalDays: 22,
      presentDays: 20,
      leaveDays: 2,
      wfhDays: 9,
      workingHours: 168,
      pendingLeave: 2,
      weeklyData: [
        { week: 'Week 1', present: 4, leave: 1, wfh: 2, hours: 34 },
        { week: 'Week 2', present: 5, leave: 0, wfh: 2, hours: 42 },
        { week: 'Week 3', present: 5, leave: 0, wfh: 2, hours: 44 },
        { week: 'Week 4', present: 4, leave: 1, wfh: 2, hours: 36 },
        { week: 'Week 5', present: 2, leave: 0, wfh: 1, hours: 12 }
      ]
    }
  ];

  // Departments data
  const departments: Department[] = [
    { id: 'D-ENG', name: 'Engineering', code: 'D-ENG', head: 'Priya Nair', budget: '₹2.4 Cr', employees: 45 },
    { id: 'D-QA', name: 'Quality Assurance', code: 'D-QA', head: 'Sneha Pillai', budget: '₹61 L', employees: 12 },
    { id: 'D-PRD', name: 'Product', code: 'D-PRD', head: 'Vikram Shah', budget: '₹95 L', employees: 18 },
    { id: 'D-OPS', name: 'DevOps & SRE', code: 'D-OPS', head: 'Devansh Kapoor', budget: '₹48 L', employees: 8 },
    { id: 'D-DSG', name: 'Design', code: 'D-DSG', head: 'Ananya Iyer', budget: '₹52 L', employees: 10 },
    { id: 'D-HR', name: 'People & Culture', code: 'D-HR', head: 'Sanya Kapoor', budget: '₹38 L', employees: 6 }
  ];

  // Teams data
  const teams: Team[] = [
    { id: 'T-001', name: 'Platform', manager: 'Priya Nair', members: 14, projects: 6 },
    { id: 'T-002', name: 'Product', manager: 'Vikram Shah', members: 8, projects: 4 },
    { id: 'T-003', name: 'Design', manager: 'Ananya Iyer', members: 5, projects: 3 },
    { id: 'T-004', name: 'QA', manager: 'Sneha Pillai', members: 7, projects: 5 },
    { id: 'T-005', name: 'DevOps', manager: 'Devansh Kapoor', members: 4, projects: 2 }
  ];

  // Project Teams data
  const projectTeams: ProjectTeam[] = [
    { id: 'PT-ATLAS', name: 'Atlas Auth Migration', project: 'Atlas Core', manager: 'Priya Nair', members: 4, created: '2026-05-20' },
    { id: 'PT-ORION', name: 'Orion HR Launch', project: 'Orion HR', manager: 'Vikram Shah', members: 3, created: '2026-05-12' },
    { id: 'PT-INFRA', name: 'Infrastructure Optimization', project: 'Infra', manager: 'Devansh Kapoor', members: 3, created: '2026-06-10' }
  ];

  // Tasks data
  const tasks: Task[] = [
    { id: 'SE-T-2041', title: 'Migrate auth flow to OAuth 2.1', project: 'Atlas Core', assignee: 'Rohan Verma', priority: 'High', status: 'In Progress', due: '2026-06-08' },
    { id: 'SE-T-2042', title: 'Design tokens audit', project: 'Atlas Core', assignee: 'Ananya Iyer', priority: 'Medium', status: 'Pending', due: '2026-06-10' },
    { id: 'SE-T-2043', title: 'Build payroll PDF service', project: 'Orion HR', assignee: 'Karan Singh', priority: 'Critical', status: 'In Progress', due: '2026-06-05' },
    { id: 'SE-T-2044', title: 'Add CI smoke tests', project: 'Atlas Core', assignee: 'Sneha Pillai', priority: 'Medium', status: 'Completed', due: '2026-05-30' },
    { id: 'SE-T-2045', title: 'Resolve K8s pod restart loop', project: 'Infra', assignee: 'Devansh Kapoor', priority: 'Critical', status: 'Blocked', due: '2026-06-04' },
    { id: 'SE-T-2046', title: 'Quarterly OKR planning', project: 'Leadership', assignee: 'Vikram Shah', priority: 'High', status: 'In Progress', due: '2026-06-12' }
  ];

  // Leave requests
  const leaveRequests: LeaveRequest[] = [
    { id: 'LR-3201', employee: 'Ishita Roy', type: 'Casual', period: '2026-06-12 - 2026-06-12', duration: '1d', reason: 'Personal errand', status: 'Pending' },
    { id: 'LR-3202', employee: 'Karan Singh', type: 'Sick', period: '2026-06-04 - 2026-06-05', duration: '2d', reason: 'Flu recovery', status: 'Pending' },
    { id: 'LR-3203', employee: 'Meera Joshi', type: 'Earned', period: '2026-06-22 - 2026-06-26', duration: '5d', reason: 'Family vacation', status: 'Pending' },
    { id: 'LR-3204', employee: 'Sneha Pillai', type: 'Comp-Off', period: '2026-06-09 - 2026-06-09', duration: '1d', reason: 'Weekend release support', status: 'Approved' },
    { id: 'LR-3205', employee: 'Ananya Iyer', type: 'Maternity', period: '2026-07-01 - 2026-12-31', duration: '184d', reason: 'Statutory maternity leave', status: 'Approved' }
  ];

  // Holidays
  const holidays: Holiday[] = [
    { id: 'HL-001', name: 'Republic Day', date: '2026-01-26', type: 'National' },
    { id: 'HL-002', name: 'Holi', date: '2026-03-06', type: 'National' },
    { id: 'HL-003', name: 'Ambedkar Jayanti', date: '2026-04-14', type: 'Regional' },
    { id: 'HL-004', name: 'Independence Day', date: '2026-08-15', type: 'National' },
    { id: 'HL-005', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'National' },
    { id: 'HL-006', name: 'Diwali', date: '2026-11-09', type: 'National' },
    { id: 'HL-007', name: 'Christmas', date: '2026-12-25', type: 'National' }
  ];

  // Announcements
  const announcements: Announcement[] = [
    { id: 'AN-118', title: 'Q2 Town Hall - 18 Jun', content: 'Join us at 4 PM IST for the quarterly town hall covering OKRs, finance and new launches.', author: 'Aarav Mehta', date: '2026-06-01', status: 'Live', audience: 'All' },
    { id: 'AN-117', title: 'Hybrid policy refresh', content: 'Effective 1 July, all teams move to a 3-days-in-office cadence (Tue/Wed/Thu).', author: 'Sanya Kapoor', date: '2026-05-28', status: 'Live', audience: 'All' },
    { id: 'AN-116', title: 'Wellness reimbursement', content: 'Up to ₹15,000/year now claimable against gym, therapy and nutrition expenses.', author: 'Sanya Kapoor', date: '2026-05-22', status: 'Live', audience: 'All' }
  ];

  // Activity Logs
  const activityLogs: ActivityLog[] = [
    { id: 'AL-001', when: '2026-06-03 10:42', actor: 'Aarav Mehta', action: 'Updated payroll', target: 'SE-187 · Rohan Verma', ip: '10.0.2.18' },
    { id: 'AL-002', when: '2026-06-03 09:55', actor: 'Sanya Kapoor', action: 'Approved leave request', target: 'LR-3204 · Sneha Pillai', ip: '10.0.2.41' },
    { id: 'AL-003', when: '2026-06-02 17:12', actor: 'Priya Nair', action: 'Reassigned task', target: 'SE-T-2041 → Rohan', ip: '10.0.3.07' },
    { id: 'AL-004', when: '2026-06-02 14:30', actor: 'Vikram Shah', action: 'Created project team', target: 'PT-ORION', ip: '10.0.3.22' },
    { id: 'AL-005', when: '2026-06-01 11:05', actor: 'Sanya Kapoor', action: 'Published announcement', target: 'AN-118', ip: '10.0.2.41' },
    { id: 'AL-006', when: '2026-05-31 18:20', actor: 'Aarav Mehta', action: 'Suspended employee', target: 'SE-219 · Devansh Kapoor', ip: '10.0.2.18' }
  ];

  // Payroll data
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    { id: 'SE-001', employee: 'Aarav Mehta', employeeId: 'SE-001', role: 'Super Admin', basic: 142500, allowances: 114000, deductions: 51300, bonus: 0, net: '₹2,05,200', appraisal: 10 },
    { id: 'SE-042', employee: 'Priya Nair', employeeId: 'SE-042', role: 'Manager', basic: 97500, allowances: 78000, deductions: 35100, bonus: 0, net: '₹1,40,400', appraisal: 10 },
    { id: 'SE-058', employee: 'Vikram Shah', employeeId: 'SE-058', role: 'Manager', basic: 87500, allowances: 70000, deductions: 31500, bonus: 0, net: '₹1,26,000', appraisal: 10 },
    { id: 'SE-101', employee: 'Ishita Roy', employeeId: 'SE-101', role: 'Employee', basic: 47500, allowances: 38000, deductions: 17100, bonus: 0, net: '₹68,400', appraisal: 10 },
    { id: 'SE-118', employee: 'Karan Singh', employeeId: 'SE-118', role: 'Employee', basic: 51000, allowances: 40800, deductions: 18360, bonus: 0, net: '₹73,440', appraisal: 10 },
    { id: 'SE-152', employee: 'Ananya Iyer', employeeId: 'SE-152', role: 'Employee', basic: 44000, allowances: 35200, deductions: 15840, bonus: 0, net: '₹63,360', appraisal: 10 },
    { id: 'SE-187', employee: 'Rohan Verma', employeeId: 'SE-187', role: 'Employee', basic: 62000, allowances: 49600, deductions: 22320, bonus: 0, net: '₹89,280', appraisal: 10 },
    { id: 'SE-204', employee: 'Sneha Pillai', employeeId: 'SE-204', role: 'Employee', basic: 55000, allowances: 44000, deductions: 19800, bonus: 0, net: '₹79,200', appraisal: 10 }
  ]);

  // Performance data
  const performanceData = [
    { name: 'Vikram Shah', role: 'Product Manager', department: 'Product', score: 70, status: 'Good' },
    { name: 'Ananya Iyer', role: 'Product Designer', department: 'Design', score: 84, status: 'Excellent' },
    { name: 'Ishita Roy', role: 'Frontend Engineer', department: 'Platform', score: 83, status: 'Excellent' },
    { name: 'Rohan Verma', role: 'Senior Software Engineer', department: 'Platform', score: 72, status: 'Good' },
    { name: 'Karan Singh', role: 'Backend Engineer', department: 'Platform', score: 71, status: 'Good' },
    { name: 'Sneha Pillai', role: 'QA Lead', department: 'QA', score: 85, status: 'Excellent' }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'Active': 'bg-green-500/20 text-green-400',
      'On Leave': 'bg-yellow-500/20 text-yellow-400',
      'Suspended': 'bg-red-500/20 text-red-400',
      'Pending': 'bg-yellow-500/20 text-yellow-400',
      'Approved': 'bg-green-500/20 text-green-400',
      'Rejected': 'bg-red-500/20 text-red-400',
      'In Progress': 'bg-blue-500/20 text-blue-400',
      'Completed': 'bg-green-500/20 text-green-400',
      'Blocked': 'bg-red-500/20 text-red-400',
      'Live': 'bg-green-500/20 text-green-400',
      'Draft': 'bg-gray-500/20 text-gray-400',
      'National': 'bg-blue-500/20 text-blue-400',
      'Regional': 'bg-purple-500/20 text-purple-400',
      'Optional': 'bg-gray-500/20 text-gray-400'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'Critical': 'bg-red-500/20 text-red-400',
      'High': 'bg-orange-500/20 text-orange-400',
      'Medium': 'bg-blue-500/20 text-blue-400',
      'Low': 'bg-gray-500/20 text-gray-400'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      'Casual': 'bg-blue-500/20 text-blue-400',
      'Sick': 'bg-red-500/20 text-red-400',
      'Earned': 'bg-green-500/20 text-green-400',
      'Comp-Off': 'bg-purple-500/20 text-purple-400',
      'Maternity': 'bg-pink-500/20 text-pink-400'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
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

  const handleAppraisalChange = (id: string, change: number) => {
    setPayrollRecords(prev =>
      prev.map(record =>
        record.id === id
          ? { ...record, appraisal: Math.max(0, Math.min(100, record.appraisal + change)) }
          : record
      )
    );
  };

  const handleDownloadPayslip = (employeeId: string, employeeName: string) => {
    const record = payrollRecords.find(r => r.id === employeeId);
    if (!record) return;
    // Payslip generation code here
    alert(`Downloading payslip for ${employeeName}`);
  };

  const handleSendMessage = () => {
    if (!newMessage.receiver || !newMessage.subject || !newMessage.content) {
      alert('Please fill in all fields');
      return;
    }

    const receiverName = employees.find(e => e.id === newMessage.receiver)?.name || newMessage.receiver;
    const receiverRole = employees.find(e => e.id === newMessage.receiver)?.role || 'Employee';

    const message: Message = {
      id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
      sender: 'Aarav Mehta',
      senderRole: 'Super Admin',
      receiver: receiverName,
      receiverRole: receiverRole,
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${tc.textSecondary}`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${tc.text}`}>{stat.value}</p>
                <p className={`text-xs ${tc.textMuted}`}>{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-xl bg-indigo-500/10 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 text-indigo-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className={`lg:col-span-2 ${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-4`}>Attendance — last 7 days</h3>
          <p className={`text-sm ${tc.textSecondary} mb-4`}>Company-wide presence vs leave</p>
          <div className="h-48 flex items-end justify-between gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const present = [92, 95, 89, 93, 88, 41, 12];
              const leave = [8, 5, 11, 7, 12, 59, 88];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all duration-500 hover:opacity-80" 
                      style={{ height: `${present[i]}px`, minHeight: '10px' }}
                    />
                    <div 
                      className="w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-b transition-all duration-500 hover:opacity-80" 
                      style={{ height: `${leave[i] * 0.6}px`, minHeight: '5px' }}
                    />
                  </div>
                  <span className={`text-xs ${tc.textMuted} mt-2`}>{day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs">
            <span className={`flex items-center gap-1 ${tc.textSecondary}`}><span className="w-3 h-3 bg-emerald-500 rounded"></span> Present</span>
            <span className={`flex items-center gap-1 ${tc.textSecondary}`}><span className="w-3 h-3 bg-rose-500 rounded"></span> Leave</span>
          </div>
        </div>

        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-4`}>Payroll Breakdown</h3>
          <div className="space-y-4">
            <div>
              <p className={`text-sm ${tc.textSecondary}`}>Payroll (MTD)</p>
              <p className={`text-2xl font-bold ${tc.text}`}>₹4.8Cr</p>
              <p className={`text-xs ${tc.textMuted}`}>Cycle closes 30 Jun</p>
            </div>
            <div className={`pt-4 ${tc.border} border-t`}>
              <p className={`text-sm ${tc.textSecondary}`}>Average cost per employee</p>
              <p className={`text-lg font-semibold ${tc.text}`}>₹3,87,000</p>
            </div>
            <div className={`pt-4 ${tc.border} border-t`}>
              <p className={`text-sm ${tc.textSecondary}`}>Payroll distribution</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={tc.textSecondary}>Basic</span>
                  <span className={`font-medium ${tc.text}`}>50%</span>
                </div>
                <div className="w-full bg-gray-200/20 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full" style={{ width: '50%' }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={tc.textSecondary}>HRA</span>
                  <span className={`font-medium ${tc.text}`}>25%</span>
                </div>
                <div className="w-full bg-gray-200/20 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-1.5 rounded-full" style={{ width: '25%' }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={tc.textSecondary}>Special</span>
                  <span className={`font-medium ${tc.text}`}>15%</span>
                </div>
                <div className="w-full bg-gray-200/20 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-1.5 rounded-full" style={{ width: '15%' }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={tc.textSecondary}>Bonus</span>
                  <span className={`font-medium ${tc.text}`}>10%</span>
                </div>
                <div className="w-full bg-gray-200/20 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-4`}>Teams & Projects</h3>
          <p className={`text-sm ${tc.textSecondary} mb-4`}>Productivity across squads</p>
          <div className="space-y-3">
            {teams.map((team) => (
              <div key={team.id} className={`flex items-center justify-between p-3 ${tc.bgTableHover} rounded-xl transition-colors ${tc.border} border-b last:border-0`}>
                <div>
                  <p className={`font-medium ${tc.text}`}>{team.name}</p>
                  <p className={`text-xs ${tc.textSecondary}`}>Manager: {team.manager}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tc.text}`}>{team.members} members</p>
                  <p className={`text-xs ${tc.textSecondary}`}>{team.projects} projects</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-4`}>Recent Activity</h3>
          <div className="space-y-3">
            {activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} className={`flex items-start gap-3 p-2 ${tc.bgTableHover} rounded-xl transition-colors`}>
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${tc.text}`}>{log.action}</p>
                  <p className={`text-xs ${tc.textSecondary}`}>{log.actor} • {log.target}</p>
                  <p className={`text-xs ${tc.textMuted}`}>{log.when}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // Render Employees Tab
  const renderEmployees = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Employee Management</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Create, search, suspend or activate users</p>
        </div>
        <button 
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center gap-2"
          aria-label="Add new employee"
          title="Add new employee"
        >
          <UserPlusIcon className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className={`p-4 ${tc.border} border-b`}>
          <div className="relative">
            <MagnifyingGlassIcon className={`w-4 h-4 ${tc.textMuted} absolute left-3 top-1/2 transform -translate-y-1/2`} />
            <input
              type="text"
              placeholder="Search by name, ID, team, designation..."
              className={`w-full pl-9 pr-4 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search employees"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b ${tc.tableHeader}`}>
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Team</th>
                <th className="px-6 py-3 font-medium">Salary</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className={`font-medium ${tc.text}`}>{emp.name}</p>
                        <p className={`text-xs ${tc.textSecondary}`}>{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{emp.id}</td>
                  <td className={`px-6 py-4 text-sm ${tc.text}`}>{emp.designation}</td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{emp.team}</td>
                  <td className={`px-6 py-4 text-sm ${tc.text}`}>{emp.salary}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        aria-label={`Edit ${emp.name}`} 
                        title={`Edit ${emp.name}`} 
                        className={`p-1 ${tc.bgTableHover} rounded transition-colors`}
                      >
                        <PencilIcon className={`w-4 h-4 ${tc.textMuted}`} />
                      </button>
                      <button 
                        className={`p-1 ${tc.bgTableHover} rounded transition-colors ${emp.status === 'Suspended' ? 'text-emerald-400' : 'text-rose-400'}`}
                        aria-label={emp.status === 'Suspended' ? `Activate ${emp.name}` : `Suspend ${emp.name}`}
                        title={emp.status === 'Suspended' ? `Activate ${emp.name}` : `Suspend ${emp.name}`}
                      >
                        {emp.status === 'Suspended' ? 'Activate' : 'Suspend'}
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

  // Render Departments Tab
  const renderDepartments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Departments</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Create and govern company departments</p>
        </div>
        <button 
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          aria-label="Add new department"
          title="Add new department"
        >
          <PlusIcon className="w-4 h-4" />
          Add Department
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`font-semibold ${tc.text}`}>{dept.name}</h3>
                <p className={`text-xs ${tc.textMuted}`}>{dept.code}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BuildingOfficeIcon className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="space-y-2">
              <p className={`text-sm ${tc.textSecondary}`}>Head: <span className={`font-medium ${tc.text}`}>{dept.head}</span></p>
              <p className={`text-sm ${tc.textSecondary}`}>Budget: <span className={`font-medium ${tc.text}`}>{dept.budget}</span></p>
              <p className={`text-sm ${tc.textSecondary}`}>Employees: <span className={`font-medium ${tc.text}`}>{dept.employees}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Teams Tab
  const renderTeams = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Teams</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Manage company teams and squads</p>
        </div>
        <button 
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          aria-label="Create new team"
          title="Create new team"
        >
          <UserGroupIcon className="w-4 h-4" />
          Create Team
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                {team.name.charAt(0)}
              </div>
              <span className={`text-xs ${tc.textMuted}`}>{team.id}</span>
            </div>
            <h3 className={`font-semibold ${tc.text}`}>{team.name}</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Manager: {team.manager}</p>
            <div className={`mt-3 pt-3 ${tc.border} border-t flex items-center justify-between`}>
              <div>
                <p className={`text-sm font-medium ${tc.text}`}>{team.members} Members</p>
                <p className={`text-xs ${tc.textMuted}`}>{team.projects} Projects</p>
              </div>
              <button 
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                aria-label={`Manage ${team.name} team`}
                title={`Manage ${team.name} team`}
              >
                Manage →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Project Teams Tab
  const renderProjectTeams = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Project Teams</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Spin up cross-functional squads, assign a manager and pick members from the directory</p>
        </div>
        <button 
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          onClick={() => setShowCreateTeam(true)}
          aria-label="Create new project team"
          title="Create new project team"
        >
          <PlusIcon className="w-4 h-4" />
          Create Team
        </button>
      </div>
      {showCreateTeam && (
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <h3 className={`font-semibold ${tc.text} mb-4`}>Create Project Team</h3>
          <p className={`text-sm ${tc.textSecondary} mb-4`}>Pick a project name and select employees from the directory</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm ${tc.textSecondary} mb-1`}>Team Name</label>
              <input
                type="text"
                placeholder="e.g. Orion Web Revamp"
                className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                aria-label="Team name"
              />
            </div>
            <div>
              <label htmlFor="assign-manager" className={`block text-sm ${tc.textSecondary} mb-1`}>Assign Manager</label>
              <select
                id="assign-manager"
                className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                aria-label="Assign manager"
                title="Select manager"
              >
                <option>Select manager</option>
                {employees.filter(e => e.role === 'Manager' || e.role === 'Super Admin').map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className={`block text-sm ${tc.textSecondary} mb-1`}>Members</label>
            <div className={`${tc.border} rounded-xl p-3`}>
              <input
                type="text"
                placeholder="Search employees..."
                className={`w-full px-3 py-1.5 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all mb-2`}
                aria-label="Search employees to add"
              />
              <div className="space-y-1">
                {employees.slice(3, 7).map(emp => (
                  <div key={emp.id} className={`flex items-center gap-2 p-2 ${tc.bgTableHover} rounded-xl`}>
                    <input type="checkbox" className="rounded border-gray-300 dark:border-white/10" aria-label={`Select ${emp.name}`} />
                    <span className={`text-sm ${tc.text}`}>{emp.name}</span>
                    <span className={`text-xs ${tc.textMuted}`}>• {emp.team}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-3">
            <button 
              className={`px-4 py-2 ${tc.border} ${tc.textSecondary} rounded-xl text-sm font-medium ${tc.bgTableHover} transition-colors`}
              onClick={() => setShowCreateTeam(false)}
              aria-label="Cancel creating team"
              title="Cancel creating team"
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25"
              aria-label="Create project team"
              title="Create project team"
            >
              Create Team
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectTeams.map((team) => (
          <div key={team.id} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                {team.name.charAt(0)}
              </div>
              <span className={`text-xs ${tc.textMuted}`}>{team.created}</span>
            </div>
            <h3 className={`font-semibold ${tc.text}`}>{team.name}</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Project - {team.project}</p>
            <div className={`mt-2 space-y-1 text-sm ${tc.textSecondary}`}>
              <p>Assigned Manager: <span className={`font-medium ${tc.text}`}>{team.manager}</span></p>
              <p>{team.members} members</p>
            </div>
            <div className={`mt-3 pt-3 ${tc.border} border-t flex items-center justify-between`}>
              <span className={`text-xs ${tc.textMuted}`}>{team.id}</span>
              <button 
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                aria-label={`Manage ${team.name}`}
                title={`Manage ${team.name}`}
              >
                Manage →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Tasks Tab
  const renderTasks = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${tc.text}`}>Task Monitoring</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Across all teams - Jira-synced</p>
      </div>
      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">Assignee</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-6 py-4">
                    <div>
                      <p className={`font-medium ${tc.text}`}>{task.title}</p>
                      <p className={`text-xs ${tc.textMuted}`}>{task.id}</p>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{task.project}</td>
                  <td className={`px-6 py-4 text-sm ${tc.text}`}>{task.assignee}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{task.due}</td>
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
        <h2 className={`text-xl font-bold ${tc.text}`}>Attendance Sheet</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Track employee attendance, working hours, leave balances and WFH days</p>
      </div>
      <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow} flex items-center justify-between flex-wrap gap-4`}>
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="attendance-view" className={`text-xs ${tc.textSecondary} block mb-1`}>View</label>
            <select 
              id="attendance-view"
              className={`px-3 py-1.5 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={attendanceView}
              onChange={(e) => setAttendanceView(e.target.value as 'weekly' | 'monthly')}
              aria-label="Select attendance view"
              title="Select attendance view"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label htmlFor="attendance-period" className={`text-xs ${tc.textSecondary} block mb-1`}>Period</label>
            <select 
              id="attendance-period"
              className={`px-3 py-1.5 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Select attendance period"
              title="Select attendance period"
            >
              <option value="June 2026">June 2026</option>
              <option value="May 2026">May 2026</option>
              <option value="April 2026">April 2026</option>
            </select>
          </div>
          <div>
            <label htmlFor="attendance-team" className={`text-xs ${tc.textSecondary} block mb-1`}>Team</label>
            <select
              id="attendance-team"
              className={`px-3 py-1.5 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              aria-label="Filter attendance by team"
              title="Filter attendance by team"
            >
              <option value="all">All Teams</option>
              <option value="platform">Platform</option>
              <option value="product">Product</option>
              <option value="design">Design</option>
              <option value="qa">QA</option>
              <option value="devops">DevOps</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className={`px-3 py-1.5 text-sm ${tc.textSecondary} ${tc.border} rounded-xl ${tc.bgTableHover} transition-colors flex items-center gap-1`}
            aria-label="Export attendance data"
            title="Export attendance data"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export
          </button>
          <button 
            className={`px-3 py-1.5 text-sm ${tc.textSecondary} ${tc.border} rounded-xl ${tc.bgTableHover} transition-colors flex items-center gap-1`}
            aria-label="Print attendance report"
            title="Print attendance report"
          >
            <PrinterIcon className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs ${tc.textSecondary}`}>Total Attendance</p>
              <p className={`text-xl font-bold ${tc.text}`}>92%</p>
              <p className="text-xs text-emerald-400">↑ 5% from last month</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>
        <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs ${tc.textSecondary}`}>Total Leave Days</p>
              <p className={`text-xl font-bold ${tc.text}`}>24</p>
              <p className="text-xs text-rose-400">↑ 3 from last month</p>
            </div>
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-rose-400" />
            </div>
          </div>
        </div>
        <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs ${tc.textSecondary}`}>WFH Days</p>
              <p className={`text-xl font-bold ${tc.text}`}>55</p>
              <p className="text-xs text-blue-400">↑ 8 from last month</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
        <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs ${tc.textSecondary}`}>Pending Leave Requests</p>
              <p className={`text-xl font-bold ${tc.text}`}>18</p>
              <p className="text-xs text-amber-400">Requires approval</p>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>
      </div>
      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium">Total Days</th>
                <th className="px-4 py-3 font-medium">Present</th>
                <th className="px-4 py-3 font-medium">Leave</th>
                <th className="px-4 py-3 font-medium">WFH</th>
                <th className="px-4 py-3 font-medium">Working Hours</th>
                <th className="px-4 py-3 font-medium">Pending Leave</th>
                <th className="px-4 py-3 font-medium">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => {
                const attendancePercentage = Math.round((record.presentDays / record.totalDays) * 100);
                return (
                  <tr key={record.employeeId} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors cursor-pointer`} onClick={() => setSelectedEmployee(record.employeeName)}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {record.employeeName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className={`font-medium ${tc.text} text-sm`}>{record.employeeName}</p>
                          <p className={`text-xs ${tc.textSecondary}`}>{record.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-sm ${tc.textSecondary}`}>{record.team}</td>
                    <td className={`px-4 py-4 text-sm ${tc.text} font-medium`}>{record.totalDays}</td>
                    <td className={`px-4 py-4 text-sm text-emerald-400 font-medium`}>{record.presentDays}</td>
                    <td className={`px-4 py-4 text-sm text-rose-400 font-medium`}>{record.leaveDays}</td>
                    <td className={`px-4 py-4 text-sm text-blue-400 font-medium`}>{record.wfhDays}</td>
                    <td className={`px-4 py-4 text-sm ${tc.text} font-medium`}>{record.workingHours}h</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.pendingLeave > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {record.pendingLeave} days
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${attendancePercentage >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : attendancePercentage >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`}
                            style={{ width: `${attendancePercentage}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${tc.text}`}>{attendancePercentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {selectedEmployee && (
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${tc.text}`}>Weekly Breakdown - {selectedEmployee}</h3>
            <button 
              onClick={() => setSelectedEmployee(null)}
              className={`text-sm ${tc.textSecondary} hover:${tc.text}`}
              aria-label="Close weekly breakdown"
              title="Close weekly breakdown"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {attendanceRecords
              .find(r => r.employeeName === selectedEmployee)
              ?.weeklyData.map((week, i) => (
                <div key={i} className={`${tc.border} rounded-xl p-4`}>
                  <p className={`text-sm font-medium ${tc.text} mb-2`}>{week.week}</p>
                  <div className={`space-y-1 text-sm ${tc.textSecondary}`}>
                    <p><span className="text-emerald-400 font-medium">{week.present}</span> Present</p>
                    <p><span className="text-rose-400 font-medium">{week.leave}</span> Leave</p>
                    <p><span className="text-blue-400 font-medium">{week.wfh}</span> WFH</p>
                    <p className={`font-medium ${tc.text}`}>{week.hours}h worked</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Leave Approvals Tab
  const renderLeaveApprovals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Leave Requests</h2>
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
                <th className="px-6 py-3 font-medium">Duration</th>
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
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.type)}`}>
                      {request.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{request.period}</td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{request.duration}</td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary} max-w-xs truncate`}>{request.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {request.status === 'Pending' ? (
                      <div className="flex items-center gap-2">
                        <button 
                          className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                          aria-label={`Approve ${request.employee}'s leave request`}
                          title={`Approve ${request.employee}'s leave request`}
                        >
                          <CheckCircleIcon className="w-3 h-3" />
                          Approve
                        </button>
                        <button 
                          className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-xl text-xs font-medium hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                          aria-label={`Reject ${request.employee}'s leave request`}
                          title={`Reject ${request.employee}'s leave request`}
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

  // Render Holidays Tab
  const renderHolidays = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Holiday Calendar</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Manage national, regional and optional holidays for FY26</p>
        </div>
        <button 
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          aria-label="Add new holiday"
          title="Add new holiday"
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
        </div>
        <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
          <h4 className="font-semibold text-purple-400">Regional Holidays</h4>
          <p className="text-2xl font-bold text-purple-400">{holidays.filter(h => h.type === 'Regional').length}</p>
        </div>
        <div className="bg-gray-500/10 p-4 rounded-2xl border border-gray-500/20">
          <h4 className="font-semibold text-gray-400">Optional Holidays</h4>
          <p className="text-2xl font-bold text-gray-400">{holidays.filter(h => h.type === 'Optional').length}</p>
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
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          aria-label="Create new announcement"
          title="Create new announcement"
        >
          <MegaphoneIcon className="w-4 h-4" />
          New Announcement
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <label htmlFor="announcement-audience" className={`block text-sm ${tc.textSecondary} mb-1`}>Audience</label>
              <select
                id="announcement-audience"
                className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                aria-label="Select announcement audience"
                title="Select announcement audience"
              >
                <option>All</option>
              </select>
            </div>
            <button 
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2.5 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              aria-label="Publish announcement"
              title="Publish announcement"
            >
              <MegaphoneIcon className="w-4 h-4" />
              Publish
            </button>
          </div>
        </div>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Activity Logs Tab
  const renderActivityLogs = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${tc.text}`}>Employee Activity Logs</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Audit trail of platform actions</p>
      </div>
      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-6 py-3 font-medium">When</th>
                <th className="px-6 py-3 font-medium">Actor</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Target</th>
                <th className="px-6 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{log.when}</td>
                  <td className={`px-6 py-4 font-medium ${tc.text}`}>{log.actor}</td>
                  <td className={`px-6 py-4 text-sm ${tc.text}`}>{log.action}</td>
                  <td className={`px-6 py-4 text-sm ${tc.textSecondary}`}>{log.target}</td>
                  <td className={`px-6 py-4 text-sm ${tc.textMuted} font-mono`}>{log.ip}</td>
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
        <h2 className={`text-xl font-bold ${tc.text}`}>Performance Management</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Recommend appraisals, promotions or issue warnings</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceData.map((person) => (
          <div key={person.name} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                {person.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${tc.text}`}>{person.name}</p>
                <p className={`text-xs ${tc.textSecondary}`}>{person.department} · {person.role}</p>
              </div>
              <span className={`text-2xl font-bold ${person.score >= 80 ? 'text-emerald-400' : person.score >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>{person.score}</span>
            </div>
            <div className="flex gap-2">
              <button 
                className="flex-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                aria-label={`Appraise ${person.name}`}
                title={`Appraise ${person.name}`}
              >
                Appraise
              </button>
              <button 
                className="flex-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-500/30 transition-colors"
                aria-label={`Promote ${person.name}`}
                title={`Promote ${person.name}`}
              >
                Promote
              </button>
              <button 
                className="flex-1 px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-xl text-xs font-medium hover:bg-rose-500/30 transition-colors"
                aria-label={`Issue warning to ${person.name}`}
                title={`Issue warning to ${person.name}`}
              >
                Warn
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Payroll Tab
  const renderPayroll = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${tc.text}`}>Payroll Management</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Edit salary components, run appraisals and generate payslips</p>
      </div>
      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs ${tc.tableHeader} ${tc.border} border-b`}>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Basic (₹)</th>
                <th className="px-4 py-3 font-medium">Allowances (₹)</th>
                <th className="px-4 py-3 font-medium">Deductions (₹)</th>
                <th className="px-4 py-3 font-medium">Bonus (₹)</th>
                <th className="px-4 py-3 font-medium">Net</th>
                <th className="px-4 py-3 font-medium">Appraisal</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.map((record) => (
                <tr key={record.id} className={`${tc.border} border-b last:border-0 ${tc.bgTableHover} transition-colors`}>
                  <td className="px-4 py-4">
                    <div>
                      <p className={`font-medium ${tc.text}`}>{record.employee}</p>
                      <p className={`text-xs ${tc.textSecondary}`}>{record.employeeId} - {record.role}</p>
                    </div>
                  </td>
                  <td className={`px-4 py-4 text-sm ${tc.text}`}>₹{record.basic.toLocaleString()}</td>
                  <td className={`px-4 py-4 text-sm ${tc.text}`}>₹{record.allowances.toLocaleString()}</td>
                  <td className={`px-4 py-4 text-sm ${tc.text}`}>₹{record.deductions.toLocaleString()}</td>
                  <td className={`px-4 py-4 text-sm ${tc.text}`}>₹{record.bonus.toLocaleString()}</td>
                  <td className={`px-4 py-4 text-sm font-semibold text-indigo-400`}>{record.net}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleAppraisalChange(record.id, -5)}
                        className={`p-1 ${tc.bgTableHover} rounded transition-colors`}
                        aria-label={`Decrease ${record.employee}'s appraisal by 5%`}
                        title={`Decrease ${record.employee}'s appraisal by 5%`}
                      >
                        <ArrowDownIcon className="w-4 h-4 text-rose-400" />
                      </button>
                      <span className={`text-sm font-semibold ${tc.text} w-10 text-center`}>{record.appraisal}%</span>
                      <button 
                        onClick={() => handleAppraisalChange(record.id, 5)}
                        className={`p-1 ${tc.bgTableHover} rounded transition-colors`}
                        aria-label={`Increase ${record.employee}'s appraisal by 5%`}
                        title={`Increase ${record.employee}'s appraisal by 5%`}
                      >
                        <ArrowUpIcon className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button 
                      onClick={() => handleDownloadPayslip(record.id, record.employee)}
                      className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-medium hover:bg-indigo-500/30 transition-colors flex items-center gap-1"
                      aria-label={`Download payslip for ${record.employee}`}
                      title={`Download payslip for ${record.employee}`}
                    >
                      <DocumentArrowDownIcon className="w-3 h-3" />
                      Payslip
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

  // Render Analytics Tab
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${tc.text}`}>Analytics</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Enterprise reports, exportable in one click.</p>
      </div>
      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <p className={`text-sm ${tc.textSecondary} mb-6`}>
          Performance, attendance, leave, team and payroll reports — generate PDF or CSV for compliance, board meetings and quarterly reviews.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Performance', 'Attendance', 'Leave', 'Payroll'].map((report) => (
            <div key={report} className={`${tc.bgCardHover} p-6 ${tc.border} rounded-2xl hover:${tc.shadow} transition-all duration-300 hover:border-indigo-500/30 cursor-pointer group`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ChartBarIcon className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex gap-1">
                  <button 
                    className={`p-1 ${tc.bgTableHover} rounded text-xs ${tc.textSecondary}`}
                    aria-label={`Download ${report} report as PDF`}
                    title={`Download ${report} report as PDF`}
                  >
                    PDF
                  </button>
                  <button 
                    className={`p-1 ${tc.bgTableHover} rounded text-xs ${tc.textSecondary}`}
                    aria-label={`Download ${report} report as CSV`}
                    title={`Download ${report} report as CSV`}
                  >
                    CSV
                  </button>
                </div>
              </div>
              <h3 className={`font-semibold ${tc.text}`}>{report}</h3>
              <p className={`text-xs ${tc.textMuted} mt-1`}>Generate {report.toLowerCase()} report</p>
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
          <p className={`text-sm ${tc.textSecondary}`}>View and respond to messages from employees, managers, and HR</p>
        </div>
        <button 
          onClick={() => setShowCompose(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center gap-2"
          aria-label="Compose new message"
          title="Compose new message"
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
              aria-label="Close compose modal"
              title="Close compose modal"
              className={`${tc.textMuted} hover:${tc.text}`}
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
                title="Select message recipient"
              >
                <option value="">Select recipient</option>
                {employees.filter(e => e.id !== 'SE-001').map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
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
                title="Select message category"
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
                title="Cancel composing message"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendMessage}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                aria-label="Send message"
                title="Send message"
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
              title="Filter messages by read status"
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
              title="Filter messages by category"
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
                    aria-label="Reply to message"
                    title="Reply to message"
                    className={`p-1.5 text-indigo-400 ${tc.bgTableHover} rounded-xl transition-colors`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewMessage({ 
                        receiver: employees.find(e => e.name === msg.sender)?.id || '', 
                        subject: `Re: ${msg.subject}`,
                        content: '',
                        category: msg.category
                      });
                      setShowCompose(true);
                    }}
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                  <button 
                    aria-label="Delete message"
                    title="Delete message"
                    className={`p-1.5 ${tc.textMuted} ${tc.bgTableHover} rounded-xl transition-colors hover:text-rose-400`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this message?')) {
                        setMessages(messages.filter(m => m.id !== msg.id));
                      }
                    }}
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

  // Main render function - SINGLE declaration
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'employees': return renderEmployees();
      case 'departments': return renderDepartments();
      case 'teams': return renderTeams();
      case 'project-teams': return renderProjectTeams();
      case 'tasks': return renderTasks();
      case 'attendance': return renderAttendance();
      case 'leave-approvals': return renderLeaveApprovals();
      case 'holidays': return renderHolidays();
      case 'announcements': return renderAnnouncements();
      case 'activity-logs': return renderActivityLogs();
      case 'performance': return renderPerformance();
      case 'payroll': return renderPayroll();
      case 'analytics': return renderAnalytics();
      case 'queries': return renderQueries();
      default: return renderOverview();
    }
  };

  return (
    <div className={`flex h-screen ${tc.bg} transition-colors duration-300`}>
      <Sidebar role="super-admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Command Centre"
          subtitle="ServEase Innovation Private Limited - live operational view"
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

export default SuperAdminDashboard;