// ManagerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../Layout/Sidebar';
import Header from '../../Layout/Header';
import { useTheme } from './hooks/useTheme';
import OverviewTab from './overview/OverviewTab';
import MyTeamTab from './team/MyTeamTab';
import ProjectTeamsTab from './team/ProjectTeamsTab';
import AssignTasksTab from './tasks/AssignTasksTab';
import TasksBoardTab from './tasks/TasksBoardTab';
import DailyTasksTab from './tasks/DailyTasksTab';
import AttendanceTab from './attendance/AttendanceTab';
import LeaveApprovalsTab from './leave/LeaveApprovalsTab';
import PerformanceTab from './performance/PerformanceTab';
import ReportsTab from './reports/ReportsTab';
import QueriesTab from './messages/QueriesTab';
import LeaveTab from './leave/LeaveTab';
import PayslipsTab from './payslips/PayslipsTab';
import { 
  TeamMember, Task, LeaveRequest, ProjectTeam, Message, 
  WorkSession, TaskHistory, PerformanceData 
} from './types';
import moment from 'moment';

const ManagerDashboard = () => {
  const location = useLocation();
  const { theme, toggleTheme, getThemeClasses } = useTheme();
  const tc = getThemeClasses();

  // State declarations (all original state)
  const [searchQuery, setSearchQuery] = useState('');
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
  
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    type: 'Sick' as 'Sick' | 'Casual' | 'Earned' | 'Other',
    fromDate: '',
    toDate: '',
    reason: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

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

  // Data (all original data)
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

  const tasks: Task[] = [
    { id: 'SE-T-2041', title: 'Migrate auth flow to OAuth 2.1', assignee: 'Ishita Roy', priority: 'Medium', status: 'Pending', dueDate: '2026-06-15', project: 'Atlas Core' },
    { id: 'SE-T-2042', title: 'Design tokens audit', assignee: 'Ananya Iyer', priority: 'Medium', status: 'Pending', dueDate: '2026-06-08', project: 'Atlas Core' },
    { id: 'SE-T-2043', title: 'Build payroll PDF service', assignee: 'Karan Singh', priority: 'Critical', status: 'In Progress', dueDate: '2026-06-05', project: 'Orion HR' },
    { id: 'SE-T-2044', title: 'Add CI smoke tests', assignee: 'Sneha Pillai', priority: 'Medium', status: 'Completed', dueDate: '2026-05-30', project: 'Atlas Core' },
    { id: 'SE-T-2045', title: 'Resolve K8s pod restart loop', assignee: 'Devansh Kapoor', priority: 'Critical', status: 'Blocked', dueDate: '2026-06-04', project: 'Infra' },
    { id: 'SE-T-2046', title: 'Quarterly OKR planning', assignee: 'Vikram Shah', priority: 'High', status: 'In Progress', dueDate: '2026-06-12', project: 'Leadership' }
  ];

  const leaveRequests: LeaveRequest[] = [
    { id: 'LV-001', employee: 'Ishita Roy', type: 'Casual', period: '2026-06-12', fromDate: '2026-06-12', toDate: '2026-06-12', reason: 'Personal errand', status: 'Pending', submittedAt: '2026-06-10T10:00:00Z' },
    { id: 'LV-002', employee: 'Karan Singh', type: 'Sick', period: '2026-06-04 - 2026-06-05', fromDate: '2026-06-04', toDate: '2026-06-05', reason: 'Flu recovery', status: 'Pending', submittedAt: '2026-06-03T08:30:00Z' }
  ];

  const projectTeams: ProjectTeam[] = [
    { id: 'PT-ATLAS', name: 'Atlas Auth Migration', members: 4, project: 'Atlas Core', lead: 'Priya Nair', created: '2026-05-20' },
    { id: 'PT-ORION', name: 'Orion HR Implementation', members: 3, project: 'Orion HR', lead: 'Priya Nair', created: '2026-06-01' },
    { id: 'PT-INFRA', name: 'Infrastructure Optimization', members: 3, project: 'Infra', lead: 'Priya Nair', created: '2026-06-10' }
  ];

  const performanceData: PerformanceData[] = [
    { name: 'Priya Nair', role: 'Engineering Manager', kpi: 85, sla: 90, prs: 4, rating: 3.4, done: '6/6' },
    { name: 'Ishita Roy', role: 'Frontend Engineer', kpi: 86, sla: 88, prs: 5, rating: 3.8, done: '6/7' },
    { name: 'Karan Singh', role: 'Backend Engineer', kpi: 87, sla: 88, prs: 6, rating: 4.2, done: '6/8' },
    { name: 'Rohan Verma', role: 'Senior Software Engineer', kpi: 88, sla: 87, prs: 4, rating: 4.6, done: '6/6' }
  ];

  const payslips = [
    { month: 'May 2026', paidOn: '2026-05-31', gross: '₹1,45,390', net: '₹1,18,849' },
    { month: 'April 2026', paidOn: '2026-04-30', gross: '₹1,42,500', net: '₹1,16,535' },
    { month: 'March 2026', paidOn: '2026-03-31', gross: '₹1,42,500', net: '₹1,16,535' },
  ];

  // All original functions
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

  // Message Functions
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

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  const replyToMessage = (msg: Message) => {
    setNewMessage({ 
      receiver: msg.sender, 
      subject: `Re: ${msg.subject}`,
      content: '',
      category: msg.category
    });
    setShowCompose(true);
  };

  // Enhanced Payslip Functions
  const generatePayslipData = (employeeName?: string, month?: string, year?: string) => {
    const baseSalary = 145390;
    const hra = Math.round(baseSalary * 0.4);
    const special = Math.round(baseSalary * 0.3);
    const bonus = Math.round(baseSalary * 0.1);
    const pf = Math.round(baseSalary * 0.12);
    const tds = Math.round(baseSalary * 0.08);
    const pt = 200;

    // Determine pay period
    let payPeriod = 'May 2026';
    let paymentDate = '2026-05-31';
    
    if (month && year) {
      // Use provided month and year
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = parseInt(month) - 1;
      payPeriod = `${monthNames[monthIndex]} ${year}`;
      
      // Generate payment date (last day of month)
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      paymentDate = `${year}-${month}-${lastDay}`;
    } else {
      // Use current month
      const now = moment();
      payPeriod = now.format('MMMM YYYY');
      paymentDate = now.format('YYYY-MM-DD');
    }

    return {
      employeeId: 'SE-118',
      name: employeeName || 'Karan Singh',
      designation: 'Backend Engineer',
      email: 'karan.singh@serveasein.com',
      payPeriod: payPeriod,
      paymentDate: paymentDate,
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

  const downloadPayslip = (month?: string, year?: string) => {
    // If month and year are provided, use them
    let targetMonth = month;
    let targetYear = year;
    
    if (!targetMonth || !targetYear) {
      // Generate current month's payslip
      const now = moment();
      targetMonth = now.format('MM');
      targetYear = now.format('YYYY');
    }

    const data = generatePayslipData('Karan Singh', targetMonth, targetYear);
    
    const totalEarnings = Object.values(data.earnings).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(data.deductions).reduce((a, b) => a + b, 0);
    const netPayable = totalEarnings - totalDeductions;

    // Generate month name for display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[parseInt(targetMonth) - 1];
    const displayPeriod = `${monthName} ${targetYear}`;

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
            <div><span class="label">Pay Period</span><div class="value">${displayPeriod}</div></div>
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
            <strong>© ${targetYear} ServEase Innovation Private Limited</strong> • All rights reserved
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${data.employeeId}_${displayPeriod.replace(' ', '_')}.pdf`;
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

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            tc={tc}
            showSuccessMessage={showSuccessMessage}
            successMessage={successMessage}
            isClockedIn={isClockedIn}
            isClockedOut={isClockedOut}
            workStatus={workStatus}
            workHours={workHours}
            workMinutes={workMinutes}
            workSeconds={workSeconds}
            totalHoursToday={totalHoursToday}
            attendanceLoading={attendanceLoading}
            startTime={startTime}
            showLeaveModal={showLeaveModal}
            setShowLeaveModal={setShowLeaveModal}
            leaveRequest={leaveRequest}
            setLeaveRequest={setLeaveRequest}
            handleStartWork={handleStartWork}
            handleStopWork={handleStopWork}
            handleSubmitLeave={handleSubmitLeave}
            handleLeaveImageUpload={handleLeaveImageUpload}
          />
        );
      case 'my-team':
        return <MyTeamTab tc={tc} teamMembers={teamMembers} />;
      case 'project-teams':
        return <ProjectTeamsTab tc={tc} projectTeams={projectTeams} />;
      case 'assign-tasks':
        return <AssignTasksTab tc={tc} tasks={tasks} teamMembers={teamMembers} />;
      case 'tasks-board':
        return <TasksBoardTab tc={tc} tasks={tasks} />;
      case 'daily-tasks':
        return (
          <DailyTasksTab
            tc={tc}
            showTaskSuccess={showTaskSuccess}
            taskStatus={taskStatus}
            setTaskStatus={setTaskStatus}
            jiraLinks={jiraLinks}
            setJiraLinks={setJiraLinks}
            taskDescription={taskDescription}
            setTaskDescription={setTaskDescription}
            newIdea={newIdea}
            setNewIdea={setNewIdea}
            stylingAdded={stylingAdded}
            setStylingAdded={setStylingAdded}
            additionalInfo={additionalInfo}
            setAdditionalInfo={setAdditionalInfo}
            taskImagePreview={taskImagePreview}
            setTaskImagePreview={setTaskImagePreview}
            setTaskImageFile={setTaskImageFile}
            taskHistory={taskHistory}
            addJiraLink={addJiraLink}
            removeJiraLink={removeJiraLink}
            updateJiraLink={updateJiraLink}
            handleTaskImageUpload={handleTaskImageUpload}
            handleSubmitTask={handleSubmitTask}
          />
        );
      case 'attendance':
        return <AttendanceTab tc={tc} teamMembers={teamMembers} />;
      case 'leave-approvals':
        return <LeaveApprovalsTab tc={tc} leaveRequests={leaveRequests} />;
      case 'performance':
        return <PerformanceTab tc={tc} performanceData={performanceData} />;
      case 'reports':
        return <ReportsTab tc={tc} />;
      case 'queries':
        return (
          <QueriesTab
            tc={tc}
            messages={messages}
            filteredMessages={filteredMessages}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            showCompose={showCompose}
            setShowCompose={setShowCompose}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            markAsRead={markAsRead}
            deleteMessage={deleteMessage}
            replyToMessage={replyToMessage}
          />
        );
      case 'leave':
        return (
          <LeaveTab
            tc={tc}
            leaveHistory={leaveHistory}
            leaveRequests={leaveRequests}
            setShowLeaveModal={setShowLeaveModal}
          />
        );
      case 'payslips':
        return (
          <PayslipsTab
            tc={tc}
            downloadPayslip={downloadPayslip}
            payslips={payslips}
          />
        );
      default:
        return (
          <OverviewTab
            tc={tc}
            showSuccessMessage={showSuccessMessage}
            successMessage={successMessage}
            isClockedIn={isClockedIn}
            isClockedOut={isClockedOut}
            workStatus={workStatus}
            workHours={workHours}
            workMinutes={workMinutes}
            workSeconds={workSeconds}
            totalHoursToday={totalHoursToday}
            attendanceLoading={attendanceLoading}
            startTime={startTime}
            showLeaveModal={showLeaveModal}
            setShowLeaveModal={setShowLeaveModal}
            leaveRequest={leaveRequest}
            setLeaveRequest={setLeaveRequest}
            handleStartWork={handleStartWork}
            handleStopWork={handleStopWork}
            handleSubmitLeave={handleSubmitLeave}
            handleLeaveImageUpload={handleLeaveImageUpload}
          />
        );
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