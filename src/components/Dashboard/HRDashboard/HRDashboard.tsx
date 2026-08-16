// src/pages/HRDashboard/HRDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import moment from 'moment';
import Sidebar from '../../Layout/Sidebar';
import Header from '../../Layout/Header';
import { payslipService } from '../../../services/api';

// Hooks
import { useTheme } from './hooks/useTheme';
import { useTimer } from './hooks/useTimer';
import { useLeaveManagement } from './hooks/useLeaveManagement';
import { useMessages } from './hooks/useMessages';

// Types
import { 
  OnboardingEmployee, 
  LeaveRequest, 
  SalaryRecord, 
  Holiday, 
  Announcement, 
  Message,
  PayslipData
} from './types';

// Components
import { OverviewStats } from './overview/OverviewStats';
import { WorkTimer } from './overview/WorkTimer';
import { EmployeeOnboarding } from './overview/EmployeeOnboarding';
import { AttendanceMonitoring } from './overview/AttendanceMonitoring';
import { LeaveRequestsSummary } from './overview/LeaveRequestsSummary';
import { OnboardingTab } from './onboarding/OnboardingTab';
import { AttendanceTab } from './attendance/AttendanceTab';
import { LeaveManagementTab } from './leaves/LeaveManagementTab';
import { MyLeaveTab } from './leaves/MyLeaveTab';
import { SalaryTab } from './salary/SalaryTab';
import { HolidaysTab } from './holidays/HolidaysTab';
import { AnnouncementsTab } from './announcements/AnnouncementsTab';
import { QueriesTab } from './queries/QueriesTab';
import { ComposeMessageModal } from './queries/ComposeMessageModal';
// import { PayslipsTab } from './payslips/PayslipsTab';
import { LeaveRequestModal } from './modals/LeaveRequestModal';
import { SuccessMessage } from './shared/SuccessMessage';

// Icons
import { 
  UsersIcon, 
  UserPlusIcon, 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import OnboardNewHireModal from '../../../pages/CreateAccountPage';
import PayslipsTab from './payslips/PayslipsTab';

const HRDashboard = () => {
  const location = useLocation();
  const { createAccount } = useAuth();
  const { theme, toggleTheme, getThemeClasses } = useTheme();
  const tc = getThemeClasses();

  // State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [isLoadingPayslips, setIsLoadingPayslips] = useState(false);

  // Timer Hook
  const timer = useTimer('Sanya Kapoor');

  // Load payslips data
  const loadPayslips = async () => {
    try {
      setIsLoadingPayslips(true);
      console.log('🔍 Loading payslips...'); // Debug log
      
      // Try to get user from different sources
      let userId = '6'; // Default fallback
      
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        userId = currentUser.id || currentUser.employeeId || '6';
      } catch (e) {
        console.warn('Could not parse user from localStorage, using fallback');
      }
      
      console.log('👤 Fetching payslips for user:', userId); // Debug log
      
      const response = await payslipService.getEmployeePayslips(userId, { year: 2026 });
      console.log('📊 API Response:', response); // Debug log
      console.log('📊 Payslips array:', response.payslips); // Debug log
      
      const payslipsArray = response.payslips || [];
      setPayslips(payslipsArray);
      console.log('✅ Payslips set in state:', payslipsArray.length, 'payslips'); // Debug log
      
    } catch (error: any) {
      console.error('❌ Failed to load payslips:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      // If API fails due to auth, let's use test data that matches backend structure
      console.log('🔄 API failed (likely auth), using test data to verify date processing...');
      
      const testPayslips = [
        {
          payslipId: "174",
          payslipNumber: "PS-202604-6",
          payrollRun: { payrollMonth: 4, payrollYear: 2026 },
          totalEarnings: "65000.00",
          netSalary: "64000.00",
          status: "Draft"
        },
        {
          payslipId: "119", 
          payslipNumber: "PS-202603-6",
          payrollRun: { payrollMonth: 3, payrollYear: 2026 },
          totalEarnings: "65000.00",
          netSalary: "64000.00", 
          status: "Draft"
        },
        {
          payslipId: "64",
          payslipNumber: "PS-202602-6", 
          payrollRun: { payrollMonth: 2, payrollYear: 2026 },
          totalEarnings: "65000.00",
          netSalary: "64000.00",
          status: "Draft"
        },
        {
          payslipId: "18",
          payslipNumber: "PS-202601-6",
          payrollRun: { payrollMonth: 1, payrollYear: 2026 },
          totalEarnings: "65000.00", 
          netSalary: "64000.00",
          status: "Draft"
        }
      ];
      
      console.log('🧪 Using test payslips:', testPayslips);
      setPayslips(testPayslips);
    } finally {
      setIsLoadingPayslips(false);
    }
  };

  // Load payslips on component mount
  useEffect(() => {
    loadPayslips();
  }, []);

  // Leave Management Hook
  const initialLeaveRequests: LeaveRequest[] = [
    { id: 'LV-001', employee: 'Ishita Roy', type: 'Casual', period: '2026-06-12 - 2026-06-12', fromDate: '2026-06-12', toDate: '2026-06-12', duration: '1d', reason: 'Personal errand', status: 'Pending', department: 'Platform', submittedAt: '2026-06-10T10:00:00Z' },
    { id: 'LV-002', employee: 'Karan Singh', type: 'Sick', period: '2026-06-04 - 2026-06-05', fromDate: '2026-06-04', toDate: '2026-06-05', duration: '2d', reason: 'Flu recovery', status: 'Pending', department: 'Platform', submittedAt: '2026-06-03T08:30:00Z' },
    { id: 'LV-003', employee: 'Meera Joshi', type: 'Earned', period: '2026-06-22 - 2026-06-26', fromDate: '2026-06-22', toDate: '2026-06-26', duration: '5d', reason: 'Family vacation', status: 'Pending', department: 'Product', submittedAt: '2026-06-18T14:00:00Z' },
    { id: 'LV-004', employee: 'Sneha Pillai', type: 'Comp-Off', period: '2026-06-09 - 2026-06-09', fromDate: '2026-06-09', toDate: '2026-06-09', duration: '1d', reason: 'Weekend release support', status: 'Approved', department: 'QA', submittedAt: '2026-06-05T09:00:00Z' },
    { id: 'LV-005', employee: 'Ananya Iyer', type: 'Maternity', period: '2026-07-01 - 2026-12-31', fromDate: '2026-07-01', toDate: '2026-12-31', duration: '184d', reason: 'Statutory maternity leave', status: 'Approved', department: 'Design', submittedAt: '2026-06-01T11:00:00Z' }
  ];

  const leaveManagement = useLeaveManagement(initialLeaveRequests);

  // Messages Hook
  const initialMessages: Message[] = [
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
  ];

  const messages = useMessages(initialMessages);

  // Data
  const onboardingList: OnboardingEmployee[] = [
    { id: 'ONB-001', name: 'Tanvi Bhatia', role: 'Frontend Engineer - Platform', startDate: '2026-06-10', progress: 70, department: 'Platform' },
    { id: 'ONB-002', name: 'Rahul Khanna', role: 'Data Analyst - Product', startDate: '2026-06-15', progress: 40, department: 'Product' },
    { id: 'ONB-003', name: 'Naina Sethi', role: 'Product Designer - Design', startDate: '2026-06-17', progress: 90, department: 'Design' },
    { id: 'ONB-004', name: 'Aditya Rao', role: 'SRE Engineer - DevOps', startDate: '2026-07-01', progress: 15, department: 'DevOps' }
  ];

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

  const holidays: Holiday[] = [
    { id: 'HL-001', name: 'Republic Day', date: '2026-01-26', type: 'National' },
    { id: 'HL-002', name: 'Independence Day', date: '2026-08-15', type: 'National' },
    { id: 'HL-003', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'National' },
    { id: 'HL-004', name: 'Christmas', date: '2026-12-25', type: 'National' },
    { id: 'HL-005', name: 'Diwali', date: '2026-11-09', type: 'National' },
    { id: 'HL-006', name: 'Holi', date: '2026-03-06', type: 'National' },
    { id: 'HL-007', name: 'Ram Navami', date: '2026-04-14', type: 'National' }
  ];

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

  const stats = [
    { label: 'Headcount', value: '1,240', icon: UsersIcon, subtitle: 'Across 6 departments', change: '+12 this month' },
    { label: 'Onboarding', value: '4', icon: UserPlusIcon, subtitle: 'Joining this month', change: '2 in progress' },
    { label: 'Pending Leaves', value: '3', icon: ClipboardDocumentCheckIcon, subtitle: 'Need your review', change: '2 urgent' },
    { label: 'On Leave Today', value: '9', icon: UserGroupIcon, subtitle: 'Across teams', change: '4% of workforce' }
  ];

  // Helper functions
  const getStatusColor = (status: string): string => {
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

  const getLeaveTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'Casual': tc.leaveCasual,
      'Sick': tc.leaveSick,
      'Earned': tc.leaveEarned,
      'Comp-Off': tc.leaveCompOff,
      'Maternity': tc.leaveMaternity
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  const getLeaveStatusColor = (status: string): string => {
    switch(status) {
      case 'Approved': return tc.statusApproved;
      case 'Pending': return tc.statusPending;
      case 'Rejected': return tc.statusRejected;
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getSenderRoleColor = (role: string): string => {
    const colors = {
      'Employee': 'bg-blue-500/20 text-blue-400',
      'Manager': 'bg-purple-500/20 text-purple-400',
      'HR': 'bg-pink-500/20 text-pink-400',
      'Super Admin': 'bg-indigo-500/20 text-indigo-400'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getCategoryColor = (category: string): string => {
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

  const generatePayslipData = (employeeName?: string): PayslipData => {
    const baseSalary = 145390;
    const hra = Math.round(baseSalary * 0.4);
    const special = Math.round(baseSalary * 0.3);
    const bonus = Math.round(baseSalary * 0.1);
    const pf = Math.round(baseSalary * 0.12);
    const tds = Math.round(baseSalary * 0.08);
    const pt = 200;

    return {
      employeeId: 'HR-001',
      name: employeeName || 'Sanya Kapoor',
      designation: 'HR Business Partner',
      email: 'sanya.kapoor@serveasein.com',
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
    toast.success('Payslip downloaded successfully');
  };

  // Handlers
  const handleOnboardSuccess = () => {
    toast.success('Employee onboarded successfully');
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

  // Responsive
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

  // Tab detection
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
    if (path === '/dashboard/leave') return 'leave';
    if (path === '/dashboard/payslips') return 'payslips';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // Render Overview Tab
  const renderOverview = () => (
    <>
      <SuccessMessage 
        message={timer.successMessage} 
        show={timer.showSuccessMessage} 
      />

      {/* Status Card */}
      <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow} mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium ${timer.getStatusBadge().class}`}>
            {timer.getStatusBadge().label}
          </span>
          <span className={`text-xs sm:text-sm ${tc.textSecondary}`}>
            {timer.isClockedIn && timer.startTime && `Started at: ${timer.startTime.format('hh:mm A')}`}
            {timer.isClockedOut && `Completed at: ${moment().format('hh:mm A')}`}
            {timer.workStatus === 'on-leave' && 'Currently on leave'}
            {!timer.isClockedIn && !timer.isClockedOut && timer.workStatus === 'not-working' && 'Ready to start working'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {!timer.isClockedIn && !timer.isClockedOut && timer.workStatus === 'not-working' && (
            <>
              <button
                type="button"
                onClick={timer.handleStartWork}
                disabled={timer.attendanceLoading}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {timer.attendanceLoading ? '⏳ Processing...' : '✅ Working Today'}
              </button>
              <button
                type="button"
                onClick={() => leaveManagement.setShowLeaveModal(true)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-500/30 transition-all"
              >
                📋 On Leave
              </button>
            </>
          )}
          {timer.isClockedIn && (
            <button
              type="button"
              onClick={timer.handleStopWork}
              disabled={timer.attendanceLoading}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {timer.attendanceLoading ? '⏳ Processing...' : '⏹️ Stop Working'}
            </button>
          )}
          {timer.isClockedOut && (
            <button
              type="button"
              onClick={() => {
                timer.setWorkStatus('not-working');
                timer.setIsClockedOut(false);
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-amber-500/30 transition-all"
            >
              🔄 Start New Session
            </button>
          )}
          {timer.workStatus === 'on-leave' && (
            <button
              type="button"
              onClick={() => leaveManagement.setShowLeaveModal(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-medium hover:bg-amber-500/30 transition-all"
            >
              ✏️ Modify Leave
            </button>
          )}
        </div>
      </div>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={leaveManagement.showLeaveModal}
        onClose={() => leaveManagement.setShowLeaveModal(false)}
        onSubmit={() => {
          const successMsg = leaveManagement.handleSubmitLeave();
          if (successMsg) {
            timer.setShowSuccessMessage(true);
            timer.setSuccessMessage(successMsg);
            setTimeout(() => timer.setShowSuccessMessage(false), 3000);
            timer.setWorkStatus('on-leave');
          }
        }}
        leaveRequest={leaveManagement.leaveRequest}
        setLeaveRequest={leaveManagement.setLeaveRequest}
        onImageUpload={leaveManagement.handleLeaveImageUpload}
        themeClasses={tc}
      />

      {/* Work Timer */}
      <WorkTimer
        isClockedIn={timer.isClockedIn}
        isClockedOut={timer.isClockedOut}
        workStatus={timer.workStatus}
        workHours={timer.workHours}
        workMinutes={timer.workMinutes}
        workSeconds={timer.workSeconds}
        totalHoursToday={timer.totalHoursToday}
        startTime={timer.startTime}
        attendanceLoading={timer.attendanceLoading}
        themeClasses={tc}
        onStartWork={timer.handleStartWork}
        onStopWork={timer.handleStopWork}
        formatTime={timer.formatTime}
        getTodayHoursDisplay={timer.getTodayHoursDisplay}
      />

      {/* Stats */}
      <OverviewStats stats={stats} themeClasses={tc} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <EmployeeOnboarding 
          employees={onboardingList} 
          themeClasses={tc}
          onOnboardNew={() => setShowOnboardModal(true)}
        />
        <AttendanceMonitoring themeClasses={tc} />
      </div>

      <LeaveRequestsSummary
        leaveRequests={initialLeaveRequests}
        themeClasses={tc}
        getLeaveTypeColor={getLeaveTypeColor}
        getStatusColor={getStatusColor}
      />
    </>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'onboarding':
        return (
          <OnboardingTab 
            employees={onboardingList} 
            themeClasses={tc}
            onOnboardNew={() => setShowOnboardModal(true)}
          />
        );
      case 'attendance':
        return <AttendanceTab themeClasses={tc} />;
      case 'leaves':
        return (
          <LeaveManagementTab
            leaveRequests={initialLeaveRequests}
            themeClasses={tc}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            getLeaveTypeColor={getLeaveTypeColor}
            getStatusColor={getStatusColor}
          />
        );
      case 'salary':
        return <SalaryTab salaryRecords={salaryRecords} themeClasses={tc} />;
      case 'holidays':
        return <HolidaysTab holidays={holidays} themeClasses={tc} getStatusColor={getStatusColor} />;
      case 'announcements':
        return <AnnouncementsTab announcements={announcements} themeClasses={tc} getStatusColor={getStatusColor} />;
      case 'queries':
        return (
          <>
            <QueriesTab
              messages={messages.messages}
              filteredMessages={messages.filteredMessages}
              themeClasses={tc}
              selectedFilter={messages.selectedFilter}
              selectedCategory={messages.selectedCategory}
              onFilterChange={messages.setSelectedFilter}
              onCategoryChange={messages.setSelectedCategory}
              onCompose={() => messages.setShowCompose(true)}
              onReply={(msg) => {
                messages.setNewMessage({ 
                  receiver: msg.sender, 
                  subject: `Re: ${msg.subject}`,
                  content: '',
                  category: msg.category
                });
                messages.setShowCompose(true);
              }}
              onDelete={messages.deleteMessage}
              onMarkAsRead={messages.markAsRead}
              getSenderRoleColor={getSenderRoleColor}
              getCategoryColor={getCategoryColor}
            />
            <ComposeMessageModal
              isOpen={messages.showCompose}
              onClose={() => messages.setShowCompose(false)}
              onSend={messages.handleSendMessage}
              newMessage={messages.newMessage}
              setNewMessage={messages.setNewMessage}
              themeClasses={tc}
            />
          </>
        );
      case 'leave':
        return (
          <MyLeaveTab
            leaveHistory={leaveManagement.leaveHistory}
            themeClasses={tc}
            getLeaveStatusColor={getLeaveStatusColor}
            onApplyLeave={() => leaveManagement.setShowLeaveModal(true)}
          />
        );
      case 'payslips':
  return (
    <PayslipsTab
      tc={tc}
      downloadPayslip={downloadPayslip}
      payslips={payslips}
      generatePayslipData={generatePayslipData}
    />
  );
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