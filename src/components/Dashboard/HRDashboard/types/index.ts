// src/pages/HRDashboard/types/index.ts

export interface OnboardingEmployee {
  id: string;
  name: string;
  role: string;
  startDate: string;
  progress: number;
  department: string;
}

export interface LeaveRequest {
  id: string;
  employee: string;
  type: 'Casual' | 'Sick' | 'Earned' | 'Comp-Off' | 'Maternity';
  period: string;
  fromDate: string;
  toDate: string;
  duration: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  department: string;
  imageUrl?: string | null;
  submittedAt: string;
}

export interface SalaryRecord {
  id: string;
  employee: string;
  team: string;
  present: number;
  leaves: number;
  lop: number;
  baseSalary: string;
  payable: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'National' | 'Regional' | 'Optional';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  status: 'Live' | 'Draft';
  audience: string;
}

export interface Message {
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

export interface WorkSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  status: 'working' | 'on-leave' | 'not-working';
  employeeName: string;
}

export interface PayslipData {
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

export interface ThemeClasses {
  bg: string;
  bgCard: string;
  bgCardHover: string;
  bgInput: string;
  bgTable: string;
  bgTableHover: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  shadow: string;
  gradient: string;
  cardGradient: string;
  statBg: string;
  input: string;
  tableHeader: string;
  badge: string;
  scrollbar: string;
  statusActive: string;
  statusPending: string;
  statusApproved: string;
  statusRejected: string;
  statusLive: string;
  statusDraft: string;
  statusNational: string;
  statusRegional: string;
  statusOptional: string;
  leaveCasual: string;
  leaveSick: string;
  leaveEarned: string;
  leaveCompOff: string;
  leaveMaternity: string;
  timerBg: string;
  btnBg: string;
}