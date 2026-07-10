// tabs/TasksTab.tsx
import React, { useState } from 'react';
import { getThemeClasses } from './themeUtils';
import {
  LinkIcon,
  CheckIcon,
  PlusIcon,
  MinusCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  LightBulbIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  PaperAirplaneIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface TasksTabProps {
  theme: 'light' | 'dark';
  attendance: any;
}

interface TaskHistory {
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

const TasksTab: React.FC<TasksTabProps> = ({ theme, attendance }) => {
  const tc = getThemeClasses(theme);
  const [taskStatus, setTaskStatus] = useState<'In Progress' | 'Completed' | 'Pending'>('In Progress');
  const [jiraLinks, setJiraLinks] = useState<string[]>(['']);
  const [taskDescription, setTaskDescription] = useState('');
  const [newIdea, setNewIdea] = useState('');
  const [stylingAdded, setStylingAdded] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
      imageUrl: imagePreview,
      submittedAt: new Date().toLocaleString(),
      date: new Date().toISOString().split('T')[0]
    };

    setTaskHistory([newTask, ...taskHistory]);
    setJiraLinks(['']);
    setTaskDescription('');
    setNewIdea('');
    setStylingAdded(false);
    setAdditionalInfo('');
    setImageFile(null);
    setImagePreview(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return tc.statusActive;
      case 'In Progress': return tc.statusPending;
      case 'Pending': return tc.statusInactive;
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {showSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 sm:p-4 rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Task submitted successfully!</span>
        </div>
      )}

      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-1 sm:mb-2 text-base sm:text-lg`}>Today's Work Submission</h3>
        <p className={`text-sm ${tc.textSecondary} mb-4 sm:mb-6`}>Submit your daily standup, achievements & blockers</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${tc.text} flex items-center gap-2`}>
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                Jira Ticket URLs
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${tc.textMuted}`}>
                  {jiraLinks.filter(link => link.trim() !== '').length} / 10
                </span>
                {jiraLinks.length < 10 && (
                  <button
                    type="button"
                    onClick={addJiraLink}
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
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updateJiraLink(index, e.target.value)}
                      placeholder={`https://jira.serveasein.com/browse/ATL-1284`}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm pr-8`}
                    />
                    {link && link.trim() !== '' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckIcon className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}
                  </div>
                  {jiraLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeJiraLink(index)}
                      className={`p-1.5 rounded-lg ${tc.textMuted} hover:text-rose-400 transition-colors hover:bg-rose-500/10`}
                      aria-label={`Remove Jira link ${index + 1}`}
                      title="Remove this Jira link"
                    >
                      <MinusCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                  {index === jiraLinks.length - 1 && jiraLinks.length < 10 && (
                    <button
                      type="button"
                      onClick={addJiraLink}
                      className={`p-1.5 rounded-lg ${tc.btnBg} transition-all hover:scale-110`}
                      aria-label="Add another Jira link"
                      title="Add another Jira link"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className={`mt-1.5 text-[10px] sm:text-xs ${tc.textMuted} flex items-center gap-2`}>
              <span>Add up to 10 Jira tickets</span>
              {jiraLinks.filter(link => link.trim() !== '').length === 10 && (
                <span className="text-amber-400">• Maximum limit reached</span>
              )}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
              Task Description
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe what tasks you completed today..."
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none resize-none transition-all text-sm`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <ClipboardDocumentCheckIcon className="w-4 h-4 text-indigo-400" />
              Task Status
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {(['In Progress', 'Completed', 'Pending'] as const).map((status) => (
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

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <LightBulbIcon className="w-4 h-4 text-amber-400" />
              New Ideas / Improvements
            </label>
            <input
              type="text"
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="Share any new ideas or improvements you came up with..."
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <SparklesIcon className="w-4 h-4 text-purple-400" />
              Styling / UI Improvements
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStylingAdded(!stylingAdded)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  stylingAdded
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : tc.statusInactiveBtn + ' hover:bg-gray-200'
                }`}
              >
                {stylingAdded ? '✅ Styling Added' : '➕ Add Styling'}
              </button>
              <span className={`text-xs ${tc.textMuted}`}>
                {stylingAdded ? 'New styling/UI improvements have been added' : 'No styling changes made'}
              </span>
            </div>
          </div>

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

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <PhotoIcon className="w-4 h-4 text-pink-400" />
              Screenshot / Image Upload
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className={`px-3 sm:px-4 py-2 sm:py-2.5 ${tc.btnBg} rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-all hover:scale-105 flex items-center gap-2`}>
                <ArrowUpTrayIcon className="w-4 h-4" />
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="flex items-center gap-2">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border ${tc.border}">
                    <img src={imagePreview} alt="Task preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    title="Remove uploaded image"
                    aria-label="Remove uploaded image"
                    className={`p-1 rounded-lg ${tc.textMuted} hover:text-rose-400 transition-colors`}
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <p className={`text-[10px] sm:text-xs ${tc.textMuted} mt-1`}>
              Upload a screenshot of your work (optional)
            </p>
          </div>

          <button 
            type="button"
            onClick={handleSubmitTask}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group"
          >
            <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            Submit Daily Task Update
          </button>
        </div>
      </div>

      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <div>
            <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>Task History</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Last 3 days of task submissions</p>
          </div>
          <span className={`text-xs ${tc.textMuted}`}>Showing latest 3 entries</span>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {taskHistory.slice(0, 3).map((task) => (
            <div key={task.id} className={`p-3 sm:p-4 rounded-xl ${tc.taskCard} ${tc.border} border ${tc.taskCardHover} transition-all duration-300`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium text-indigo-400`}>{task.id}</span>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  {task.stylingAdded && (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium bg-purple-500/20 text-purple-400">
                      🎨 Styled
                    </span>
                  )}
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${tc.textMuted} bg-gray-500/10`}>
                    {task.jiraLinks.length} link{task.jiraLinks.length > 1 ? 's' : ''}
                  </span>
                </div>
                <span className={`text-[10px] sm:text-xs ${tc.textMuted}`}>{task.submittedAt}</span>
              </div>
              
              <div className="mt-2 space-y-1.5">
                <div className="space-y-1">
                  {task.jiraLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <LinkIcon className={`w-3.5 h-3.5 ${tc.textMuted} flex-shrink-0`} />
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 truncate">
                        {link}
                      </a>
                    </div>
                  ))}
                </div>
                <p className={`text-xs sm:text-sm ${tc.text}`}>{task.taskDescription}</p>
                {task.newIdea && (
                  <div className="flex items-start gap-2 text-xs">
                    <LightBulbIcon className={`w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5`} />
                    <span className={`${tc.textSecondary}`}>{task.newIdea}</span>
                  </div>
                )}
                {task.imageUrl && (
                  <div className="mt-1.5">
                    <img src={task.imageUrl} alt="Task screenshot" className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover border ${tc.border}" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksTab;