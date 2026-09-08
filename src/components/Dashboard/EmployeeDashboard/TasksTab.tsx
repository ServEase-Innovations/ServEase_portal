// tabs/TasksTab.tsx
import React, { useState, useEffect } from 'react';
import { getThemeClasses } from './themeUtils';
import {
  LinkIcon,
  CheckIcon,
  PlusIcon,
  MinusCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  PaperAirplaneIcon,
  XCircleIcon,
  TrashIcon,
  CodeBracketIcon,
  MegaphoneIcon,
  HashtagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  PaintBrushIcon,
  BuildingOffice2Icon,
  Squares2X2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  InboxIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../../context/AuthContext';
import { dailyTaskService } from '../../../services/api';
import toast from 'react-hot-toast';

interface TasksTabProps {
  theme: 'light' | 'dark';
  attendance: any;
}

interface JiraLink {
  label?: string;
  url: string;
}

interface Attachment {
  dailyTaskAttachmentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedAtEpoch: string;
}

interface DailyTask {
  dailyTaskSubmissionId: string;
  employeeId: string;
  workDescription: string;
  status: 'Pending' | 'Completed';
  newIdeas: string | null;
  submissionDate: string;
  submissionDateEpoch: string;
  submittedAt: string;
  submittedAtEpoch: string;
  updatedAt: string;
  updatedAtEpoch: string;
  jiraLinks: Array<{
    dailyTaskJiraLinkId: string;
    label: string | null;
    url: string;
    createdAt: string;
    createdAtEpoch: string;
  }>;
  attachments: Attachment[];
  employee?: any;
}

// ---------------------------------------------------------------------------
// ROLE CONFIGURATION
// Each role has its own accent color (for quick visual scanning across the
// form and history list) and its own set of relevant "what did you do
// today" fields. These compile into the workDescription sent to the
// existing API, so no backend changes are required.
// ---------------------------------------------------------------------------

type RoleKey =
  | 'developer'
  | 'marketing'
  | 'social_media'
  | 'hr'
  | 'sales'
  | 'customer_service'
  | 'design'
  | 'operations'
  | 'general';

interface RoleField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
  placeholder?: string;
}

interface RoleAccent {
  dot: string;      // small solid dot / icon background
  soft: string;      // soft tinted background
  text: string;      // accent text color
  ring: string;       // selection ring color
  border: string;     // accent border color
  gradient: string;   // gradient for header badges
}

interface RoleConfig {
  label: string;
  icon: React.ElementType;
  description: string;
  fields: RoleField[];
  accent: RoleAccent;
}

const ROLES: Record<RoleKey, RoleConfig> = {
  developer: {
    label: 'Developer',
    icon: CodeBracketIcon,
    description: 'Code, tickets, bugs & reviews',
    accent: {
      dot: 'bg-indigo-500', soft: 'bg-indigo-500/10', text: 'text-indigo-400',
      ring: 'ring-indigo-500', border: 'border-indigo-500', gradient: 'from-indigo-500 to-violet-500'
    },
    fields: [
      { key: 'ticketsWorked', label: 'Tickets / stories worked on', type: 'text', placeholder: 'e.g. PROJ-101, PROJ-104' },
      { key: 'prsMerged', label: 'Pull requests merged', type: 'number', placeholder: 'e.g. 3' },
      { key: 'bugsFixed', label: 'Bugs fixed', type: 'number', placeholder: 'e.g. 2' },
      { key: 'codeReviewLinks', label: 'Code review links', type: 'text', placeholder: 'PR links you reviewed' }
    ]
  },
  marketing: {
    label: 'Marketing',
    icon: MegaphoneIcon,
    description: 'Campaigns, content & leads',
    accent: {
      dot: 'bg-fuchsia-500', soft: 'bg-fuchsia-500/10', text: 'text-fuchsia-400',
      ring: 'ring-fuchsia-500', border: 'border-fuchsia-500', gradient: 'from-fuchsia-500 to-pink-500'
    },
    fields: [
      { key: 'campaignsWorked', label: 'Campaigns worked on', type: 'text', placeholder: 'e.g. Diwali Sale, Product Launch' },
      { key: 'contentPublished', label: 'Content pieces published', type: 'number', placeholder: 'e.g. 2' },
      { key: 'channelsUsed', label: 'Channels used', type: 'text', placeholder: 'Email, SEO, Ads, Blog...' },
      { key: 'leadsGenerated', label: 'Leads generated', type: 'number', placeholder: 'e.g. 15' },
      { key: 'adSpend', label: 'Ad spend / budget utilized', type: 'text', placeholder: 'e.g. ₹5,000 on Meta Ads' }
    ]
  },
  social_media: {
    label: 'Social Media',
    icon: HashtagIcon,
    description: 'Posts, engagement & scheduling',
    accent: {
      dot: 'bg-sky-500', soft: 'bg-sky-500/10', text: 'text-sky-400',
      ring: 'ring-sky-500', border: 'border-sky-500', gradient: 'from-sky-500 to-cyan-500'
    },
    fields: [
      { key: 'platforms', label: 'Platforms posted on', type: 'text', placeholder: 'Instagram, X, LinkedIn, Facebook...' },
      { key: 'postsPublished', label: 'Posts / reels published', type: 'number', placeholder: 'e.g. 4' },
      { key: 'postLinks', label: 'Links to published content', type: 'text', placeholder: 'Paste post URLs' },
      { key: 'engagementMetrics', label: 'Engagement (likes, shares, reach)', type: 'text', placeholder: 'e.g. 1.2K reach, 340 likes' },
      { key: 'scheduledPosts', label: 'Posts scheduled for upcoming days', type: 'number', placeholder: 'e.g. 3' }
    ]
  },
  hr: {
    label: 'HR',
    icon: UserGroupIcon,
    description: 'Hiring, onboarding & employee support',
    accent: {
      dot: 'bg-violet-500', soft: 'bg-violet-500/10', text: 'text-violet-400',
      ring: 'ring-violet-500', border: 'border-violet-500', gradient: 'from-violet-500 to-purple-500'
    },
    fields: [
      { key: 'interviewsConducted', label: 'Interviews conducted', type: 'number', placeholder: 'e.g. 3' },
      { key: 'candidatesScreened', label: 'Candidates screened', type: 'number', placeholder: 'e.g. 8' },
      { key: 'onboardingOffboarding', label: 'Onboarding / offboarding handled', type: 'text', placeholder: 'e.g. Onboarded 1 new hire' },
      { key: 'employeeQueries', label: 'Employee queries resolved', type: 'number', placeholder: 'e.g. 5' },
      { key: 'policiesUpdated', label: 'Policies / documents updated', type: 'text', placeholder: 'e.g. Leave policy revision' }
    ]
  },
  sales: {
    label: 'Sales',
    icon: CurrencyDollarIcon,
    description: 'Leads, deals & revenue',
    accent: {
      dot: 'bg-emerald-500', soft: 'bg-emerald-500/10', text: 'text-emerald-400',
      ring: 'ring-emerald-500', border: 'border-emerald-500', gradient: 'from-emerald-500 to-teal-500'
    },
    fields: [
      { key: 'leadsContacted', label: 'Leads contacted', type: 'number', placeholder: 'e.g. 20' },
      { key: 'dealsClosed', label: 'Deals closed', type: 'number', placeholder: 'e.g. 1' },
      { key: 'meetingsDemos', label: 'Meetings / demos conducted', type: 'number', placeholder: 'e.g. 4' },
      { key: 'revenueGenerated', label: 'Revenue generated', type: 'text', placeholder: 'e.g. ₹40,000' },
      { key: 'followUps', label: 'Follow-ups scheduled', type: 'text', placeholder: 'e.g. 3 clients, tomorrow' }
    ]
  },
  customer_service: {
    label: 'Customer Service',
    icon: PhoneIcon,
    description: 'Tickets, calls & satisfaction',
    accent: {
      dot: 'bg-amber-500', soft: 'bg-amber-500/10', text: 'text-amber-400',
      ring: 'ring-amber-500', border: 'border-amber-500', gradient: 'from-amber-500 to-orange-500'
    },
    fields: [
      { key: 'ticketsResolved', label: 'Tickets resolved', type: 'number', placeholder: 'e.g. 12' },
      { key: 'ticketsPending', label: 'Tickets pending', type: 'number', placeholder: 'e.g. 3' },
      { key: 'callsChatsHandled', label: 'Calls / chats handled', type: 'number', placeholder: 'e.g. 25' },
      { key: 'escalations', label: 'Escalations raised', type: 'text', placeholder: 'e.g. 1 billing issue escalated' },
      { key: 'csat', label: 'Customer feedback / CSAT notes', type: 'text', placeholder: 'e.g. Mostly positive feedback' }
    ]
  },
  design: {
    label: 'Design',
    icon: PaintBrushIcon,
    description: 'Designs, revisions & deliverables',
    accent: {
      dot: 'bg-rose-500', soft: 'bg-rose-500/10', text: 'text-rose-400',
      ring: 'ring-rose-500', border: 'border-rose-500', gradient: 'from-rose-500 to-pink-500'
    },
    fields: [
      { key: 'designsCompleted', label: 'Designs completed', type: 'number', placeholder: 'e.g. 2' },
      { key: 'revisions', label: 'Revisions done', type: 'number', placeholder: 'e.g. 4' },
      { key: 'toolsUsed', label: 'Tools used', type: 'text', placeholder: 'Figma, Photoshop...' },
      { key: 'deliverableLinks', label: 'Deliverable links', type: 'text', placeholder: 'Figma / drive links' }
    ]
  },
  operations: {
    label: 'Operations / Finance',
    icon: BuildingOffice2Icon,
    description: 'Reports, invoices & coordination',
    accent: {
      dot: 'bg-slate-500', soft: 'bg-slate-500/10', text: 'text-slate-400',
      ring: 'ring-slate-500', border: 'border-slate-500', gradient: 'from-slate-500 to-gray-500'
    },
    fields: [
      { key: 'reportsGenerated', label: 'Reports generated', type: 'text', placeholder: 'e.g. Weekly expense report' },
      { key: 'invoicesProcessed', label: 'Invoices processed', type: 'number', placeholder: 'e.g. 6' },
      { key: 'reconciliations', label: 'Reconciliations done', type: 'text', placeholder: 'e.g. Bank statement for August' },
      { key: 'vendorCoordination', label: 'Vendor coordination', type: 'text', placeholder: 'e.g. Followed up with 2 vendors' }
    ]
  },
  general: {
    label: 'Other / General',
    icon: Squares2X2Icon,
    description: "Doesn't fit the above? Use this",
    accent: {
      dot: 'bg-gray-500', soft: 'bg-gray-500/10', text: 'text-gray-400',
      ring: 'ring-gray-500', border: 'border-gray-500', gradient: 'from-gray-500 to-slate-500'
    },
    fields: []
  }
};

const ROLE_ORDER: RoleKey[] = [
  'developer',
  'marketing',
  'social_media',
  'hr',
  'sales',
  'customer_service',
  'design',
  'operations',
  'general'
];

// Returns the browser's LOCAL calendar date as YYYY-MM-DD
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Pull the "Role: X" line (added by buildFinalDescription) back out of a
// stored workDescription so history cards can show a colored role badge
// instead of repeating it inline in the text.
const extractRoleFromDescription = (workDescription: string): { roleLabel: string | null; body: string } => {
  const match = workDescription.match(/^Role:\s*(.+?)\n\n([\s\S]*)$/);
  if (match) {
    return { roleLabel: match[1].trim(), body: match[2] };
  }
  return { roleLabel: null, body: workDescription };
};

const getRoleAccentByLabel = (label: string | null): RoleAccent | null => {
  if (!label) return null;
  const found = ROLE_ORDER.find(key => ROLES[key].label === label);
  return found ? ROLES[found].accent : null;
};

const TasksTab: React.FC<TasksTabProps> = ({ theme, attendance }) => {
  const tc = getThemeClasses(theme);
  const { user, token, isAuthenticated } = useAuth();

  const [role, setRole] = useState<RoleKey | ''>('');
  const [roleDetails, setRoleDetails] = useState<Record<string, string>>({});

  const [taskStatus, setTaskStatus] = useState<'Pending' | 'Completed'>('Pending');
  const [jiraLinks, setJiraLinks] = useState<JiraLink[]>([{ url: '' }]);
  const [showJiraLinks, setShowJiraLinks] = useState(false);
  const [workDescription, setWorkDescription] = useState('');
  const [newIdeas, setNewIdeas] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [taskHistory, setTaskHistory] = useState<DailyTask[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Completed' | ''>('');

  const fetchMyTasks = async (date?: string) => {
    if (!isAuthenticated) {
      console.error('User not authenticated');
      toast.error('Please login to view your tasks');
      return;
    }

    setFetchingHistory(true);
    try {
      const params: any = {};
      if (date && date.trim() !== '') params.date = date;
      if (statusFilter) params.status = statusFilter;

      const response = await dailyTaskService.getMyTasks(params);
      setTaskHistory(response && response.dailyTasks ? response.dailyTasks : []);
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(error.message || 'Failed to fetch task history');
      }
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyTasks(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedDate, statusFilter]);

  const handleSelectRole = (key: RoleKey) => {
    setRole(key);
    setRoleDetails({});
  };

  const updateRoleDetail = (key: string, value: string) => {
    setRoleDetails(prev => ({ ...prev, [key]: value }));
  };

  const addJiraLink = () => {
    if (jiraLinks.length < 25) setJiraLinks([...jiraLinks, { url: '' }]);
  };

  const removeJiraLink = (index: number) => {
    if (jiraLinks.length > 1) setJiraLinks(jiraLinks.filter((_, i) => i !== index));
  };

  const updateJiraLink = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...jiraLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setJiraLinks(newLinks);
  };

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    setFiles(prev => [...prev, ...incoming]);
    incoming.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setFilePreviews(filePreviews.filter((_, i) => i !== index));
  };

  const buildFinalDescription = () => {
    const roleConfig = role ? ROLES[role] : null;
    const parts: string[] = [];

    if (roleConfig) parts.push(`Role: ${roleConfig.label}`);
    parts.push(workDescription.trim());

    if (roleConfig) {
      const detailLines = roleConfig.fields
        .filter(f => roleDetails[f.key]?.trim())
        .map(f => `- ${f.label}: ${roleDetails[f.key].trim()}`);
      if (detailLines.length > 0) parts.push(`Role Details:\n${detailLines.join('\n')}`);
    }

    if (additionalInfo.trim()) parts.push(`Additional Info:\n${additionalInfo.trim()}`);

    return parts.join('\n\n');
  };

  const handleSubmitTask = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit a task');
      return;
    }
    if (!role) {
      toast.error('Please select your role first');
      return;
    }
    if (!workDescription.trim()) {
      toast.error('Please provide a task description');
      return;
    }

    const filteredLinks = jiraLinks.filter(link => link.url.trim() !== '');
    for (const link of filteredLinks) {
      try {
        new URL(link.url);
      } catch {
        toast.error(`Invalid URL: ${link.url}`);
        return;
      }
    }

    setLoading(true);
    try {
      const taskData = {
        workDescription: buildFinalDescription(),
        status: taskStatus,
        newIdeas: newIdeas.trim() || undefined,
        jiraLinks: filteredLinks.map(link => ({
          label: link.label?.trim() || undefined,
          url: link.url.trim()
        }))
      };

      const createResponse = await dailyTaskService.create(taskData);
      if (!createResponse || !createResponse.dailyTask) throw new Error('Failed to create task');

      const taskId = createResponse.dailyTask.dailyTaskSubmissionId;
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        await dailyTaskService.uploadAttachments(taskId, formData);
      }

      setShowSuccess(true);
      toast.success('Task submitted successfully!');

      setWorkDescription('');
      setNewIdeas('');
      setAdditionalInfo('');
      setJiraLinks([{ url: '' }]);
      setShowJiraLinks(false);
      setFiles([]);
      setFilePreviews([]);
      setTaskStatus('Pending');
      setRoleDetails({});

      await fetchMyTasks(selectedDate);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error submitting task:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(error.message || 'Failed to submit task');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttachment = async (taskId: string, attachmentId: string) => {
    if (!confirm('Delete this attachment?')) return;
    try {
      await dailyTaskService.deleteAttachment(taskId, attachmentId);
      toast.success('Attachment deleted');
      await fetchMyTasks(selectedDate);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete attachment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return tc.statusActive;
      case 'Pending': return tc.statusInactive;
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        const epochTime = parseInt(dateStr);
        if (!isNaN(epochTime)) return new Date(epochTime).toLocaleString();
        return 'Invalid Date';
      }
      return date.toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'Image': return '🖼️';
      case 'Video': return '🎬';
      case 'PDF': return '📄';
      case 'Archive': return '📦';
      default: return '📎';
    }
  };

  const selectedRoleConfig = role ? ROLES[role] : null;
  const filledLinksCount = jiraLinks.filter(l => l.url.trim() !== '').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Success banner */}
      {showSuccess && (
        <div className="relative overflow-hidden bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 sm:p-4 rounded-xl flex items-center gap-2.5 animate-fadeIn">
          <CheckCircleSolid className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Task submitted successfully! It now appears in your history below.</span>
        </div>
      )}

      {/* Submission card */}
      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        {/* Header strip */}
        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${tc.border} flex items-center gap-3`}>
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${
            selectedRoleConfig ? selectedRoleConfig.accent.gradient : 'from-indigo-500 to-violet-500'
          } shadow-md flex-shrink-0`}>
            <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${tc.text} text-base sm:text-lg leading-tight`}>Today's Work Submission</h3>
            <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>
              {selectedRoleConfig ? `Reporting as ${selectedRoleConfig.label}` : 'Select your role to get started'}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Role Selector */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold ${tc.btnBg} ${tc.text}`}>1</span>
              <label className={`text-sm font-medium ${tc.text}`}>Choose your role</label>
              <span className={`text-xs ${tc.textMuted}`}>required</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
              {ROLE_ORDER.map((key) => {
                const cfg = ROLES[key];
                const Icon = cfg.icon;
                const isSelected = role === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleSelectRole(key)}
                    className={`group relative flex flex-col items-center justify-center gap-1.5 px-2 py-3 sm:py-3.5 rounded-xl text-center transition-all duration-200 border ${
                      isSelected
                        ? `${cfg.accent.border} ${cfg.accent.soft} shadow-md`
                        : `${tc.border} hover:border-current hover:shadow-sm`
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected ? `bg-gradient-to-br ${cfg.accent.gradient}` : `${tc.btnBg}`
                    }`}>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : tc.textMuted}`} />
                    </div>
                    <span className={`text-[10.5px] sm:text-xs font-medium leading-tight ${isSelected ? cfg.accent.text : tc.text}`}>
                      {cfg.label}
                    </span>
                    {isSelected && (
                      <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full ${cfg.accent.dot} flex items-center justify-center shadow-sm`}>
                        <CheckIcon className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedRoleConfig && (
              <p className={`mt-2 text-xs ${tc.textMuted} flex items-center gap-1.5`}>
                <selectedRoleConfig.icon className={`w-3.5 h-3.5 ${selectedRoleConfig.accent.text}`} />
                {selectedRoleConfig.description}
              </p>
            )}
          </div>

          {/* Role-specific fields */}
          {selectedRoleConfig && selectedRoleConfig.fields.length > 0 && (
            <div className={`rounded-xl border ${selectedRoleConfig.accent.border}/30 ${selectedRoleConfig.accent.soft} p-3 sm:p-4 space-y-3 animate-fadeIn`}>
              <div className="flex items-center gap-2">
                <selectedRoleConfig.icon className={`w-4 h-4 ${selectedRoleConfig.accent.text}`} />
                <span className={`text-sm font-medium ${tc.text}`}>{selectedRoleConfig.label} details</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tc.btnBg} ${tc.textMuted}`}>optional</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedRoleConfig.fields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label className={`block text-xs font-medium ${tc.textSecondary} mb-1`}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={roleDetails[field.key] || ''}
                        onChange={(e) => updateRoleDetail(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={2}
                        className={`w-full px-3 py-2 ${tc.input} rounded-lg focus:ring-2 ${selectedRoleConfig.accent.ring}/40 focus:border-transparent outline-none resize-none transition-all text-sm`}
                      />
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={roleDetails[field.key] || ''}
                        onChange={(e) => updateRoleDetail(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-3 py-2 ${tc.input} rounded-lg focus:ring-2 ${selectedRoleConfig.accent.ring}/40 focus:border-transparent outline-none transition-all text-sm`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold ${tc.btnBg} ${tc.text}`}>2</span>
              <label className={`text-sm font-medium ${tc.text} flex items-center gap-1.5`}>
                <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
                Work description
              </label>
              <span className={`text-xs ${tc.textMuted}`}>required</span>
            </div>
            <textarea
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Describe what you worked on today..."
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent outline-none resize-none transition-all text-sm`}
            />
          </div>

          {/* Task Status */}
          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-1.5`}>
              <ClipboardDocumentCheckIcon className="w-4 h-4 text-indigo-400" />
              Task status
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {(['Pending', 'Completed'] as const).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setTaskStatus(status)}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    taskStatus === status
                      ? tc.statusActiveBtn + ' shadow-md shadow-indigo-500/20'
                      : tc.statusInactiveBtn + ' hover:opacity-80'
                  }`}
                >
                  {status === 'Completed' && taskStatus === status && <CheckIcon className="w-3.5 h-3.5" />}
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* New Ideas */}
          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-1.5`}>
              <LightBulbIcon className="w-4 h-4 text-amber-400" />
              New ideas / improvements
            </label>
            <input
              type="text"
              value={newIdeas}
              onChange={(e) => setNewIdeas(e.target.value)}
              placeholder="Share any new ideas or improvements..."
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-transparent outline-none transition-all text-sm`}
            />
          </div>

          {/* Additional Information */}
          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-1.5`}>
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-400" />
              Additional information
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any additional notes, blockers, or comments..."
              rows={2}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-transparent outline-none resize-none transition-all text-sm`}
            />
          </div>

          {/* Reference Links — optional, collapsed accordion */}
          <div className={`rounded-xl border ${tc.border} overflow-hidden`}>
            <button
              type="button"
              onClick={() => setShowJiraLinks(!showJiraLinks)}
              className={`flex items-center justify-between w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium transition-all ${tc.text} hover:opacity-80`}
            >
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                Reference links
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tc.btnBg} ${tc.textMuted} font-normal`}>optional</span>
                {filledLinksCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-medium">
                    {filledLinksCount} added
                  </span>
                )}
              </span>
              {showJiraLinks ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>

            {showJiraLinks && (
              <div className={`px-3 sm:px-4 pb-3 sm:pb-4 pt-1 space-y-2 border-t ${tc.border} animate-fadeIn`}>
                <div className="flex items-center justify-between pt-2">
                  <span className={`text-[10px] sm:text-xs ${tc.textMuted}`}>
                    Jira tickets, docs, design links — anything relevant
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${tc.textMuted}`}>{filledLinksCount} / 25</span>
                    {jiraLinks.length < 25 && (
                      <button
                        type="button"
                        onClick={addJiraLink}
                        className={`p-1 rounded-lg ${tc.btnBg} transition-all hover:scale-110`}
                        aria-label="Add another link"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {jiraLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={link.label || ''}
                        onChange={(e) => updateJiraLink(index, 'label', e.target.value)}
                        placeholder="Label (optional)"
                        className={`col-span-1 px-3 py-2 ${tc.input} rounded-lg focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent outline-none transition-all text-sm`}
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateJiraLink(index, 'url', e.target.value)}
                        placeholder="https://... any link"
                        className={`col-span-3 px-3 py-2 ${tc.input} rounded-lg focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent outline-none transition-all text-sm`}
                      />
                    </div>
                    {jiraLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeJiraLink(index)}
                        className={`p-1.5 rounded-lg ${tc.textMuted} hover:text-rose-400 transition-colors hover:bg-rose-500/10`}
                        aria-label="Remove link"
                      >
                        <MinusCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Uploads — drag & drop dropzone */}
          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-1.5`}>
              <PhotoIcon className="w-4 h-4 text-pink-400" />
              Attachments
            </label>
            <label
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-1.5 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : `${tc.border} hover:border-indigo-400/60 hover:bg-indigo-500/5`
              }`}
            >
              <ArrowUpTrayIcon className={`w-6 h-6 ${isDragging ? 'text-indigo-400' : tc.textMuted}`} />
              <span className={`text-xs sm:text-sm font-medium ${tc.text}`}>
                Drop files here or <span className="text-indigo-400">browse</span>
              </span>
              <span className={`text-[10px] sm:text-xs ${tc.textMuted}`}>Max 10 files, up to 100MB each</span>
              <input type="file" accept="*/*" multiple onChange={handleFileUpload} className="hidden" />
            </label>

            {filePreviews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {filePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className={`w-20 h-20 rounded-lg overflow-hidden border ${tc.border} bg-gray-800/30`}>
                      {files[index]?.type?.startsWith('image/') ? (
                        <img src={preview} alt={`File ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {files[index]?.type?.includes('pdf') ? '📄' :
                           files[index]?.type?.includes('video') ? '🎬' : '📎'}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 rounded-full hover:bg-rose-600 transition-colors shadow-sm"
                    >
                      <XCircleIcon className="w-4 h-4 text-white" />
                    </button>
                    <div className={`text-[10px] ${tc.textMuted} mt-1 truncate max-w-[80px]`}>
                      {files[index]?.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmitTask}
            disabled={loading || !isAuthenticated}
            className={`w-full bg-gradient-to-r ${
              selectedRoleConfig ? selectedRoleConfig.accent.gradient : 'from-indigo-500 to-indigo-600'
            } text-white py-2.5 sm:py-3.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group ${
              loading || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5'
            }`}
          >
            <PaperAirplaneIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${!loading && isAuthenticated ? 'group-hover:translate-x-1 transition-transform' : ''}`} />
            {loading ? 'Submitting...' : !isAuthenticated ? 'Please Login' : !role ? 'Select Your Role Above' : 'Submit Daily Task'}
          </button>
        </div>
      </div>

      {/* Task History */}
      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${tc.border} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
          <div>
            <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>Task History</h3>
            <p className={`text-sm ${tc.textSecondary}`}>
              {selectedDate ? `Tasks for ${selectedDate}` : 'All submissions'}
              {taskHistory.length > 0 && ` · ${taskHistory.length} ${taskHistory.length === 1 ? 'entry' : 'entries'}`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'Pending' | 'Completed' | '')}
              className={`px-2.5 py-1.5 ${tc.input} rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent outline-none`}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>

            <div className="flex items-center gap-1">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`px-2.5 py-1.5 ${tc.input} rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent outline-none`}
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className={`p-1.5 rounded-lg ${tc.btnBg} transition-all hover:scale-105 text-xs`}
                  title="Clear date filter (show all history)"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => fetchMyTasks(selectedDate)}
              className={`p-1.5 rounded-lg ${tc.btnBg} transition-all hover:scale-105 hover:rotate-45 duration-300`}
              title="Refresh tasks"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {fetchingHistory ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
              <p className={`mt-3 text-sm ${tc.textSecondary}`}>Loading tasks...</p>
            </div>
          ) : !isAuthenticated ? (
            <div className={`text-center py-10 ${tc.textSecondary}`}>
              <InboxIcon className={`w-10 h-10 mx-auto mb-2 ${tc.textMuted}`} />
              <p>Please login to view your tasks</p>
            </div>
          ) : taskHistory.length === 0 ? (
            <div className={`text-center py-10 ${tc.textSecondary}`}>
              <InboxIcon className={`w-10 h-10 mx-auto mb-2 ${tc.textMuted}`} />
              <p>No tasks found</p>
              <p className="text-xs mt-1">{selectedDate ? `for ${selectedDate}` : 'Submit your first task above'}</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {taskHistory.map((task) => {
                const { roleLabel, body } = extractRoleFromDescription(task.workDescription);
                const accent = getRoleAccentByLabel(roleLabel);
                return (
                  <div
                    key={task.dailyTaskSubmissionId}
                    className={`relative p-3 sm:p-4 pl-4 sm:pl-5 rounded-xl ${tc.taskCard} ${tc.border} border ${tc.taskCardHover} transition-all duration-300`}
                  >
                    <span className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${accent ? accent.dot : 'bg-gray-400'}`} />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {roleLabel && (
                          <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${accent ? accent.soft : 'bg-gray-500/10'} ${accent ? accent.text : tc.textMuted}`}>
                            {roleLabel}
                          </span>
                        )}
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${tc.textMuted} bg-gray-500/10`}>
                          {task.submissionDate}
                        </span>
                        {task.jiraLinks.length > 0 && (
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${tc.textMuted} bg-gray-500/10 flex items-center gap-1`}>
                            <LinkIcon className="w-2.5 h-2.5" />
                            {task.jiraLinks.length}
                          </span>
                        )}
                        {task.attachments.length > 0 && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium bg-blue-500/15 text-blue-400 flex items-center gap-1">
                            <PhotoIcon className="w-2.5 h-2.5" />
                            {task.attachments.length}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] sm:text-xs ${tc.textMuted}`}>
                        {formatDate(task.submittedAt)}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {task.jiraLinks.length > 0 && (
                        <div className="space-y-0.5">
                          {task.jiraLinks.map((link, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <LinkIcon className={`w-3.5 h-3.5 ${tc.textMuted} flex-shrink-0`} />
                              {link.label && <span className={`${tc.textSecondary} font-medium`}>[{link.label}]</span>}
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 truncate">
                                {link.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className={`text-xs sm:text-sm ${tc.text} whitespace-pre-line leading-relaxed`}>{body}</p>

                      {task.newIdeas && (
                        <div className="flex items-start gap-2 text-xs">
                          <LightBulbIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span className={`${tc.textSecondary}`}>{task.newIdeas}</span>
                        </div>
                      )}

                      {task.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {task.attachments.map((attachment) => (
                            <div key={attachment.dailyTaskAttachmentId} className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-700/20 border ${tc.border}`}>
                              <span className="text-sm">{getFileIcon(attachment.fileType)}</span>
                              <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 truncate max-w-[100px]">
                                {attachment.fileName}
                              </a>
                              <span className={`text-[9px] ${tc.textMuted}`}>({(attachment.fileSize / 1024).toFixed(1)} KB)</span>
                              <button
                                onClick={() => handleDeleteAttachment(task.dailyTaskSubmissionId, attachment.dailyTaskAttachmentId)}
                                className="p-0.5 hover:text-rose-400 transition-colors"
                                title="Delete attachment"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksTab;
