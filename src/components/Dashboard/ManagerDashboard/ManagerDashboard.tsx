// ManagerDashboard.tsx - Fully updated with Generate Payslip integration
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../Layout/Sidebar';
import Header from '../../Layout/Header';
import { useTheme } from './hooks/useTheme';
import { useAttendance } from '../../../hooks/useAttendance';
import { useAttendanceHandlers } from '../../../hooks/useAttendanceHandlers';
import { useLeaveHandlers } from '../../../hooks/useLeaveHandlers';
import { useAttendanceTimer } from '../../../hooks/useAttendanceTimer';
import { useLeave } from '../../../hooks/useLeave';
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
import LeaveModal from './leave/LeaveModal';
import PayslipsTab from './payslips/PayslipsTab';
import GeneratePayslip from './payslips/GeneratePayslipModal';
import { 
  TeamMember, Task, LeaveRequest, ProjectTeam, Message, 
  TaskHistory, PerformanceData 
} from './types';
import moment from 'moment';
import { useAuth } from '../../../context/AuthContext';

const ManagerDashboard = () => {
  const location = useLocation();
  const { theme, toggleTheme, getThemeClasses } = useTheme();
  const tc = getThemeClasses();
  const { token, user } = useAuth();
  
  // Get attendance hook for API integration
  const attendance = useAttendance();
  
  console.log('🔷 ManagerDashboard rendered');
  console.log('Attendance from hook:', attendance);
  console.log('isClockedIn:', attendance.isClockedIn);
  console.log('isClockedOut:', attendance.isClockedOut);

  // Mobile sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // State declarations (all original state)
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use attendance hook values instead of local state
  const {
    todayAttendance,
    isLoading: attendanceLoading,
    clockIn,
    clockOut,
    resumeWork,
    isClockedIn,
    isClockedOut,
    totalHoursToday,
  } = attendance;
  
  // Use shared timer logic
  const {
    workHours,
    workMinutes,
    workSeconds,
    startTime,
    workStatus,
    setWorkStatus,
    previousSessionsHours, // Get previous sessions hours
  } = useAttendanceTimer({
    isClockedIn,
    isClockedOut,
    todayAttendance
  });
  
  // Get leave hook for API integration
  const { submitLeaveRequest, isLoading: isSubmittingLeave } = useLeave();
  
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

  // Check for mobile screen
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
    if (path === '/dashboard/generate-payslip') return 'generate-payslip';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // Load saved leave history
  useEffect(() => {
    const savedLeaves = localStorage.getItem('managerLeaveHistory');
    if (savedLeaves) {
      try {
        setLeaveHistory(JSON.parse(savedLeaves));
      } catch (e) {
        console.error('Error loading leave history:', e);
      }
    }
  }, []);

  // Use shared attendance handlers
  const {
    handleStartWork,
    handleStopWork,
    handleResumeWork,
    showSuccessMessage,
    successMessage,
    showSuccess
  } = useAttendanceHandlers({
    clockIn,
    clockOut,
    resumeWork,
    totalHoursToday
  });

  // Use shared leave handlers
  const { handleLeaveImageUpload: handleLeaveImageUploadUtil, validateLeaveRequest } = useLeaveHandlers();

  const handleLeaveImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleLeaveImageUploadUtil(e, leaveRequest, setLeaveRequest);
  };

  const handleSubmitLeave = async () => {
    const validation = validateLeaveRequest(leaveRequest);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Additional validation for reason length (backend requires min 5 chars)
    if (leaveRequest.reason.trim().length < 5) {
      alert('Reason must be at least 5 characters long');
      return;
    }

    try {
      // Map old leave type format to new LeaveType enum
      let leaveType: 'Privilege' | 'Casual' | 'Sick' | 'Paternity';
      switch (leaveRequest.type) {
        case 'Earned':
          leaveType = 'Privilege'; // Map 'Earned' to 'Privilege'
          break;
        case 'Sick':
          leaveType = 'Sick';
          break;
        case 'Casual':
          leaveType = 'Casual';
          break;
        case 'Other':
          leaveType = 'Casual'; // Map 'Other' to 'Casual' as default
          break;
        default:
          leaveType = 'Casual';
      }

      // Submit leave request to API
      await submitLeaveRequest({
        leaveType,
        fromDate: leaveRequest.fromDate,
        toDate: leaveRequest.toDate,
        reason: leaveRequest.reason.trim(),
        attachmentUrl: leaveRequest.imagePreview || undefined,
      });

      // Success - update UI state
      const fromDate = moment(leaveRequest.fromDate);
      const toDate = moment(leaveRequest.toDate);
      
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
      
      showSuccess(`Leave request submitted for ${fromDate.format('MMM D')} - ${toDate.format('MMM D, YYYY')}`);
    } catch (error: any) {
      alert(error.message || 'Failed to submit leave request. Please try again.');
    }
  };

  // Task Functions
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

  // Enhanced Payslip Functions - keep generatePayslipData but remove downloadPayslip
  const generatePayslipData = (employeeName?: string, month?: string, year?: string) => {
    const baseSalary = 145390;
    const hra = Math.round(baseSalary * 0.4);
    const special = Math.round(baseSalary * 0.3);
    const bonus = Math.round(baseSalary * 0.1);
    const pf = Math.round(baseSalary * 0.12);
    const tds = Math.round(baseSalary * 0.08);
    const pt = 200;

    let payPeriod = 'May 2026';
    let paymentDate = '2026-05-31';
    
    if (month && year) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = parseInt(month) - 1;
      payPeriod = `${monthNames[monthIndex]} ${year}`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      paymentDate = `${year}-${month}-${lastDay}`;
    } else {
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

  const filteredMessages = messages.filter(msg => {
    const readFilter = selectedFilter === 'all' ? true : selectedFilter === 'unread' ? !msg.read : msg.read;
    const categoryFilter = selectedCategory === 'all' || msg.category === selectedCategory;
    return readFilter && categoryFilter;
  });

  // Determine header title and subtitle based on active tab
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'generate-payslip':
        return 'Generate Payslip';
      case 'payslips':
        return 'Payslips';
      default:
        return 'Platform Team Overview';
    }
  };

  const getHeaderSubtitle = () => {
    switch (activeTab) {
      case 'generate-payslip':
        return 'Generate payslip for an employee for a specific period';
      case 'payslips':
        return 'View and download your payslips';
      default:
        return 'Led by Priya Nair - 14 engineers - 6 active projects';
    }
  };

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
            handleResumeWork={handleResumeWork}
            handleSubmitLeave={handleSubmitLeave}
            handleLeaveImageUpload={handleLeaveImageUpload}
            attendanceRecords={attendance.attendanceRecords}
            todayAttendance={todayAttendance}
            previousSessionsHours={previousSessionsHours}
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
            token={token}
            taskStatus={taskStatus as 'Pending' | 'Completed'}
            setTaskStatus={(status: 'Pending' | 'Completed') => setTaskStatus(status)}
            jiraLinks={jiraLinks.map(url => ({ url }))}
            setJiraLinks={(links) => setJiraLinks(links.map(l => l.url))}
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
            taskHistory={taskHistory.map(task => ({
              dailyTaskSubmissionId: task.id,
              employeeId: 'SE-187',
              workDescription: task.taskDescription,
              status: task.status as 'Pending' | 'Completed',
              newIdeas: task.newIdea || null,
              submissionDate: task.date,
              submissionDateEpoch: Date.now().toString(),
              submittedAt: task.submittedAt,
              submittedAtEpoch: Date.now().toString(),
              updatedAt: task.submittedAt,
              updatedAtEpoch: Date.now().toString(),
              jiraLinks: task.jiraLinks.map(url => ({ url })),
              attachments: [],
            }))}
            addJiraLink={() => {
              if (jiraLinks.length < 10) {
                setJiraLinks([...jiraLinks, '']);
              }
            }}
            removeJiraLink={(index: number) => {
              if (jiraLinks.length > 1) {
                const newLinks = jiraLinks.filter((_, i) => i !== index);
                setJiraLinks(newLinks);
              }
            }}
            updateJiraLink={(index: number, value: string) => {
              const newLinks = [...jiraLinks];
              newLinks[index] = value;
              setJiraLinks(newLinks);
            }}
            handleTaskImageUpload={handleTaskImageUpload}
            handleSubmitTask={handleSubmitTask}
          />
        );
      case 'attendance':
        return <AttendanceTab tc={tc} teamMembers={teamMembers} />;
      case 'leave-approvals':
        return <LeaveApprovalsTab tc={tc} />;
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
            userRole="manager"
            employeeId={user?.id}
          />
        );
      case 'generate-payslip':
        return (
          <GeneratePayslip
            tc={tc}
            userRole="manager"
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
            handleResumeWork={handleResumeWork}
            handleSubmitLeave={handleSubmitLeave}
            handleLeaveImageUpload={handleLeaveImageUpload}
          />
        );
    }
  };

  // Toggle sidebar functions
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className={`flex h-screen ${tc.bg} transition-colors duration-300 overflow-hidden`}>
      {/* Desktop Sidebar */}
      <Sidebar 
        role="manager" 
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Mobile Sidebar */}
      <Sidebar 
        role="manager"
        isMobile={true}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header 
          title={getHeaderTitle()}
          subtitle={getHeaderSubtitle()}
          theme={theme}
          onThemeToggle={toggleTheme}
          onMobileMenuToggle={toggleMobileSidebar}
          isMobile={isMobile}
        />
        <div className={`flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 ${tc.scrollbar} scrollbar-thin`}>
          {renderContent()}
        </div>
      </div>

      {/* Global Leave Modal - Available on all tabs */}
      <LeaveModal
        showLeaveModal={showLeaveModal}
        setShowLeaveModal={setShowLeaveModal}
        leaveRequest={leaveRequest}
        setLeaveRequest={setLeaveRequest}
        handleSubmitLeave={handleSubmitLeave}
        handleLeaveImageUpload={handleLeaveImageUpload}
        tc={tc}
        isSubmitting={isSubmittingLeave}
      />
    </div>
  );
};

export default ManagerDashboard;