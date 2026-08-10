// components/tasks/DailyTasksTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  CheckIcon, PlusIcon, MinusCircleIcon, LinkIcon, DocumentTextIcon,
  ClipboardDocumentCheckIcon, LightBulbIcon, SparklesIcon,
  ChatBubbleLeftRightIcon, PhotoIcon, PaperAirplaneIcon, XCircleIcon,
  ArrowUpTrayIcon, TrashIcon
} from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';
import { dailyTaskService } from '../../../../services/api';
import toast from 'react-hot-toast';

interface DailyTasksTabProps {
  tc: ThemeClasses;
  token?: string | null;
  // For ManagerDashboard compatibility - these will override the internal state if provided
  taskStatus?: 'Pending' | 'Completed';
  setTaskStatus?: (status: 'Pending' | 'Completed') => void;
  jiraLinks?: JiraLink[];
  setJiraLinks?: (links: JiraLink[]) => void;
  taskDescription?: string;
  setTaskDescription?: (desc: string) => void;
  newIdea?: string;
  setNewIdea?: (idea: string) => void;
  stylingAdded?: boolean;
  setStylingAdded?: (styling: boolean) => void;
  additionalInfo?: string;
  setAdditionalInfo?: (info: string) => void;
  taskImagePreview?: string | null;
  setTaskImagePreview?: (preview: string | null) => void;
  setTaskImageFile?: (file: File | null) => void;
  taskHistory?: DailyTask[];
  addJiraLink?: () => void;
  removeJiraLink?: (index: number) => void;
  updateJiraLink?: (index: number, value: string) => void;
  handleTaskImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmitTask?: () => void;
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
  jiraLinks: JiraLink[];
  attachments: Attachment[];
  employee?: any;
}

const DailyTasksTab: React.FC<DailyTasksTabProps> = ({ 
  tc, 
  token,
  // ManagerDashboard props (optional)
  taskStatus: externalTaskStatus,
  setTaskStatus: externalSetTaskStatus,
  jiraLinks: externalJiraLinks,
  setJiraLinks: externalSetJiraLinks,
  taskDescription: externalTaskDescription,
  setTaskDescription: externalSetTaskDescription,
  newIdea: externalNewIdea,
  setNewIdea: externalSetNewIdea,
  stylingAdded: externalStylingAdded,
  setStylingAdded: externalSetStylingAdded,
  additionalInfo: externalAdditionalInfo,
  setAdditionalInfo: externalSetAdditionalInfo,
  taskImagePreview: externalTaskImagePreview,
  setTaskImagePreview: externalSetTaskImagePreview,
  setTaskImageFile: externalSetTaskImageFile,
  taskHistory: externalTaskHistory,
  addJiraLink: externalAddJiraLink,
  removeJiraLink: externalRemoveJiraLink,
  updateJiraLink: externalUpdateJiraLink,
  handleTaskImageUpload: externalHandleTaskImageUpload,
  handleSubmitTask: externalHandleSubmitTask,
}) => {
  // Use external props if provided (for ManagerDashboard), otherwise use internal state
  const isUsingExternalProps = !!externalTaskStatus !== undefined;
  
  // Internal state (used when not using external props)
  const [internalTaskStatus, setInternalTaskStatus] = useState<'Pending' | 'Completed'>('Pending');
  const [internalJiraLinks, setInternalJiraLinks] = useState<JiraLink[]>([{ url: '' }]);
  const [internalWorkDescription, setInternalWorkDescription] = useState('');
  const [internalNewIdeas, setInternalNewIdeas] = useState('');
  const [internalAdditionalInfo, setInternalAdditionalInfo] = useState('');
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [internalFilePreviews, setInternalFilePreviews] = useState<string[]>([]);
  const [internalTaskImagePreview, setInternalTaskImagePreview] = useState<string | null>(null);
  
  // UI state
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  
  // History state (internal)
  const [internalTaskHistory, setInternalTaskHistory] = useState<DailyTask[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Determine which state to use
  const taskStatus = isUsingExternalProps ? externalTaskStatus! : internalTaskStatus;
  const setTaskStatus = isUsingExternalProps ? externalSetTaskStatus! : setInternalTaskStatus;
  const jiraLinks = isUsingExternalProps ? externalJiraLinks! : internalJiraLinks;
  const setJiraLinks = isUsingExternalProps ? externalSetJiraLinks! : setInternalJiraLinks;
  const workDescription = isUsingExternalProps ? externalTaskDescription! : internalWorkDescription;
  const setWorkDescription = isUsingExternalProps ? externalSetTaskDescription! : setInternalWorkDescription;
  const newIdeas = isUsingExternalProps ? externalNewIdea! : internalNewIdeas;
  const setNewIdeas = isUsingExternalProps ? externalSetNewIdea! : setInternalNewIdeas;
  const additionalInfo = isUsingExternalProps ? externalAdditionalInfo! : internalAdditionalInfo;
  const setAdditionalInfo = isUsingExternalProps ? externalSetAdditionalInfo! : setInternalAdditionalInfo;
  const taskImagePreview = isUsingExternalProps ? externalTaskImagePreview! : internalTaskImagePreview;
  const setTaskImagePreview = isUsingExternalProps ? externalSetTaskImagePreview! : setInternalTaskImagePreview;
  const taskHistory = isUsingExternalProps ? externalTaskHistory! : internalTaskHistory;

  // Fetch daily tasks for the current user (internal API integration)
  const fetchMyTasks = async (date?: string) => {
    // Don't fetch if using external props (ManagerDashboard)
    if (isUsingExternalProps) return;
    
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    setFetchingHistory(true);
    try {
      const params: any = {};
      if (date) {
        params.date = date;
      }
      
      const response = await dailyTaskService.getMyTasks(params);
      console.log('Fetched tasks:', response);
      
      if (response && response.dailyTasks) {
        setInternalTaskHistory(response.dailyTasks);
      } else {
        setInternalTaskHistory([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      toast.error(error.message || 'Failed to fetch task history');
    } finally {
      setFetchingHistory(false);
    }
  };

  // Load tasks on mount and when date changes (internal only)
  useEffect(() => {
    if (!isUsingExternalProps && token) {
      fetchMyTasks(selectedDate);
    }
  }, [token, selectedDate, isUsingExternalProps]);

  // Jira Links handlers (internal)
  const internalAddJiraLink = () => {
    if (jiraLinks.length < 25) {
      setJiraLinks([...jiraLinks, { url: '' }]);
    }
  };

  const internalRemoveJiraLink = (index: number) => {
    if (jiraLinks.length > 1) {
      const newLinks = jiraLinks.filter((_, i) => i !== index);
      setJiraLinks(newLinks);
    }
  };

  const internalUpdateJiraLink = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...jiraLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setJiraLinks(newLinks);
  };

  // File handlers (internal)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const newFiles = Array.from(fileList);
      
      // Check file limit
      if (internalFiles.length + newFiles.length > 10) {
        toast.error('Maximum 10 files allowed');
        return;
      }
      
      setInternalFiles([...internalFiles, ...newFiles]);
      
      // Create previews for new files
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setInternalFilePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = internalFiles.filter((_, i) => i !== index);
    const newPreviews = internalFilePreviews.filter((_, i) => i !== index);
    setInternalFiles(newFiles);
    setInternalFilePreviews(newPreviews);
  };

  // Delete attachment handler (internal)
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

  // Submit task handler (internal)
  const internalHandleSubmitTask = async () => {
    // Validate required fields
    const filteredLinks = jiraLinks.filter(link => link.url.trim() !== '');
    
    if (!workDescription.trim()) {
      toast.error('Please provide a task description');
      return;
    }

    // Validate Jira URLs
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
      // Step 1: Create the daily task
      const taskData = {
        workDescription: workDescription.trim(),
        status: taskStatus,
        newIdeas: newIdeas.trim() || undefined,
        jiraLinks: filteredLinks.map(link => ({
          label: link.label?.trim() || undefined,
          url: link.url.trim()
        }))
      };

      console.log('Creating task with data:', taskData);
      const createResponse = await dailyTaskService.create(taskData);
      console.log('Task created:', createResponse);

      if (!createResponse || !createResponse.dailyTask) {
        throw new Error('Failed to create task');
      }

      const taskId = createResponse.dailyTask.dailyTaskSubmissionId;

      // Step 2: Upload attachments if any
      if (internalFiles.length > 0) {
        const formData = new FormData();
        internalFiles.forEach(file => {
          formData.append('files', file);
        });

        console.log('Uploading attachments for task:', taskId);
        await dailyTaskService.uploadAttachments(taskId, formData);
      }

      // Success!
      setShowSuccess(true);
      toast.success('Task submitted successfully!');
      
      // Reset form
      setWorkDescription('');
      setNewIdeas('');
      setAdditionalInfo('');
      setJiraLinks([{ url: '' }]);
      setInternalFiles([]);
      setInternalFilePreviews([]);
      setTaskStatus('Pending');
      
      // Refresh task history
      await fetchMyTasks(selectedDate);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error submitting task:', error);
      toast.error(error.message || 'Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  // Use external handlers if provided, otherwise use internal ones
  const addJiraLinkHandler = externalAddJiraLink || internalAddJiraLink;
  const removeJiraLinkHandler = externalRemoveJiraLink || internalRemoveJiraLink;
  const updateJiraLinkHandler = externalUpdateJiraLink || internalUpdateJiraLink;
  const handleTaskImageUploadHandler = externalHandleTaskImageUpload || handleFileUpload;
  const handleSubmitTaskHandler = externalHandleSubmitTask || internalHandleSubmitTask;

  // Helper functions
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return tc.statusActive;
      case 'Pending': return tc.statusInactive;
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getFileIcon = (fileType: string) => {
    switch(fileType) {
      case 'Image': return '🖼️';
      case 'Video': return '🎬';
      case 'PDF': return '📄';
      case 'Archive': return '📦';
      default: return '📎';
    }
  };

  // Determine if we should show loading based on context
  const isLoading = isUsingExternalProps ? false : fetchingHistory;
  const currentTaskHistory = isUsingExternalProps ? taskHistory : internalTaskHistory;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Success Notification */}
      {showSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 sm:p-4 rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Task submitted successfully!</span>
        </div>
      )}

      {/* Submit Task Form */}
      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-1 sm:mb-2 text-base sm:text-lg`}>Today's Work Submission</h3>
        <p className={`text-sm ${tc.textSecondary} mb-4 sm:mb-6`}>Submit your daily work report with Jira links and attachments</p>
        
        <div className="space-y-4">
          {/* Jira Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${tc.text} flex items-center gap-2`}>
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                Jira Ticket URLs
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${tc.textMuted}`}>
                  {jiraLinks.filter(link => link.url.trim() !== '').length} / 25
                </span>
                {jiraLinks.length < 25 && (
                  <button
                    type="button"
                    onClick={addJiraLinkHandler}
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
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={link.label || ''}
                      onChange={(e) => updateJiraLinkHandler(index, 'label', e.target.value)}
                      placeholder="Label (optional)"
                      className={`col-span-1 px-3 py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateJiraLinkHandler(index, 'url', e.target.value)}
                      placeholder="https://company.atlassian.net/browse/..."
                      className={`col-span-3 px-3 py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
                    />
                  </div>
                  {jiraLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeJiraLinkHandler(index)}
                      className={`p-1.5 rounded-lg ${tc.textMuted} hover:text-rose-400 transition-colors hover:bg-rose-500/10`}
                      aria-label={`Remove Jira link ${index + 1}`}
                      title="Remove this Jira link"
                    >
                      <MinusCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className={`mt-1.5 text-[10px] sm:text-xs ${tc.textMuted}`}>
              Add up to 25 Jira tickets with optional labels
            </div>
          </div>

          {/* Work Description */}
          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
              Work Description *
            </label>
            <textarea
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Describe what tasks you completed today..."
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none resize-none transition-all text-sm`}
            />
          </div>

          {/* Task Status */}
          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <ClipboardDocumentCheckIcon className="w-4 h-4 text-indigo-400" />
              Task Status
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {(['Pending', 'Completed'] as const).map((status) => (
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

          {/* New Ideas */}
          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <LightBulbIcon className="w-4 h-4 text-amber-400" />
              New Ideas / Improvements
            </label>
            <input
              type="text"
              value={newIdeas}
              onChange={(e) => setNewIdeas(e.target.value)}
              placeholder="Share any new ideas or improvements you came up with..."
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
            />
          </div>

          {/* Additional Information */}
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

          {/* File Uploads - Only show for internal usage */}
          {!isUsingExternalProps && (
            <div>
              <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
                <PhotoIcon className="w-4 h-4 text-pink-400" />
                Attachments (Images, PDFs, Documents, etc.)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className={`px-3 sm:px-4 py-2 sm:py-2.5 ${tc.btnBg} rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-all hover:scale-105 flex items-center gap-2`}>
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  Upload Files
                  <input
                    type="file"
                    accept="*/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className={`text-[10px] sm:text-xs ${tc.textMuted}`}>
                  Max 10 files, up to 100MB each
                </span>
              </div>
              
              {/* File previews */}
              {internalFilePreviews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {internalFilePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border ${tc.border} bg-gray-800/30">
                        {internalFiles[index]?.type?.startsWith('image/') ? (
                          <img src={preview} alt={`File ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            {internalFiles[index]?.type?.includes('pdf') ? '📄' : 
                             internalFiles[index]?.type?.includes('video') ? '🎬' : '📎'}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 p-0.5 bg-rose-500 rounded-full hover:bg-rose-600 transition-colors"
                      >
                        <XCircleIcon className="w-5 h-5 text-white" />
                      </button>
                      <div className="text-[10px] ${tc.textMuted} mt-1 truncate max-w-[80px]">
                        {internalFiles[index]?.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button 
            type="button"
            onClick={handleSubmitTaskHandler}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <PaperAirplaneIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${!loading ? 'group-hover:translate-x-1 transition-transform' : ''}`} />
            {loading ? 'Submitting...' : 'Submit Daily Task'}
          </button>
        </div>
      </div>

      {/* Task History */}
      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <div>
            <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>Task History</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Your submitted daily tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`px-2 py-1 ${tc.input} rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none`}
            />
            <button
              onClick={() => fetchMyTasks(selectedDate)}
              className={`p-1.5 rounded-lg ${tc.btnBg} transition-all hover:scale-105`}
              title="Refresh tasks"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
            <p className={`mt-2 text-sm ${tc.textSecondary}`}>Loading tasks...</p>
          </div>
        ) : currentTaskHistory.length === 0 ? (
          <div className={`text-center py-8 ${tc.textSecondary}`}>
            <p>No tasks submitted for this date</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {currentTaskHistory.map((task) => (
              <div key={task.dailyTaskSubmissionId} className={`p-3 sm:p-4 rounded-xl ${tc.taskCard} ${tc.border} border ${tc.taskCardHover} transition-all duration-300`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium text-indigo-400`}>
                      #{task.dailyTaskSubmissionId.slice(0, 8)}
                    </span>
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    {task.jiraLinks && task.jiraLinks.length > 0 && (
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${tc.textMuted} bg-gray-500/10`}>
                        {task.jiraLinks.length} link{task.jiraLinks.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {task.attachments && task.attachments.length > 0 && (
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium bg-blue-500/20 text-blue-400`}>
                        {task.attachments.length} file{task.attachments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] sm:text-xs ${tc.textMuted}`}>
                    {formatDate(task.submittedAt)}
                  </span>
                </div>
                
                <div className="mt-2 space-y-1.5">
                  {/* Jira Links */}
                  {task.jiraLinks && task.jiraLinks.length > 0 && (
                    <div className="space-y-0.5">
                      {task.jiraLinks.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <LinkIcon className={`w-3.5 h-3.5 ${tc.textMuted} flex-shrink-0`} />
                          {link.label && (
                            <span className={`${tc.textSecondary} font-medium`}>[{link.label}]</span>
                          )}
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-400 hover:text-indigo-300 truncate"
                          >
                            {link.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Work Description */}
                  <p className={`text-xs sm:text-sm ${tc.text}`}>{task.workDescription}</p>
                  
                  {/* New Ideas */}
                  {task.newIdeas && (
                    <div className="flex items-start gap-2 text-xs">
                      <LightBulbIcon className={`w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5`} />
                      <span className={`${tc.textSecondary}`}>{task.newIdeas}</span>
                    </div>
                  )}
                  
                  {/* Attachments */}
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {task.attachments.map((attachment) => (
                        <div key={attachment.dailyTaskAttachmentId} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-700/20 border ${tc.border}">
                          <span className="text-sm">{getFileIcon(attachment.fileType)}</span>
                          <a 
                            href={attachment.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 truncate max-w-[100px]"
                          >
                            {attachment.fileName}
                          </a>
                          <span className={`text-[9px] ${tc.textMuted}`}>
                            ({(attachment.fileSize / 1024).toFixed(1)} KB)
                          </span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTasksTab;