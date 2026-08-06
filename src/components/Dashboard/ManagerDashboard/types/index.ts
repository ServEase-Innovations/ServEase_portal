// types/index.ts
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Working';
  joined: string;
  initials: string;
}

export interface GeneratePayslipData {
  employeeId: string;
  date: string;
  month: number;
  year: number;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  dueDate: string;
  project: string;
}

export interface LeaveRequest {
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

export interface ProjectTeam {
  id: string;
  name: string;
  members: number;
  project: string;
  lead: string;
  created: string;
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

export interface TaskHistory {
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

export interface PerformanceData {
  name: string;
  role: string;
  kpi: number;
  sla: number;
  prs: number;
  rating: number;
  done: string;
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
  statusWorking: string;
  statusLeave: string;
  statusPending: string;
  statusProgress: string;
  statusCompleted: string;
  statusBlocked: string;
  statusApproved: string;
  statusRejected: string;
  statusInactive: string;
  priorityCritical: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  timerBg: string;
  btnBg: string;
  statusActiveBtn: string;
  statusInactiveBtn: string;
  taskCard: string;
  taskCardHover: string;
}
