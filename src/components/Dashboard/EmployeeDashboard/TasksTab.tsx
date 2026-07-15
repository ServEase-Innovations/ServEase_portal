import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  LinkIcon,
  LightBulbIcon,
  MinusCircleIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useDailyTasks } from '../../../hooks/useDailyTasks';
import { resolveApiAssetUrl } from '../../../services/api';
import {
  DailyTask,
  DailyTaskAttachment,
  DailyTaskJiraLink,
  DailyTaskPayload,
  DailyTaskStatus,
} from '../../../types/daily-task';
import { getThemeClasses } from './themeUtils';

interface TasksTabProps {
  theme: 'light' | 'dark';
  attendance?: unknown;
}

const extractJiraLabel = (url: string): string | undefined => {
  try {
    const pathParts = new URL(url).pathname.split('/').filter(Boolean);
    return pathParts[pathParts.length - 1]?.slice(0, 100);
  } catch {
    return undefined;
  }
};

const formatSubmittedAt = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const TasksTab: React.FC<TasksTabProps> = ({ theme }) => {
  const tc = getThemeClasses(theme);
  const dailyTaskHook = useDailyTasks(3);

  const myTasks: DailyTask[] = Array.isArray(dailyTaskHook.myTasks)
    ? (dailyTaskHook.myTasks as DailyTask[])
    : [];

  const todayTask: DailyTask | null = dailyTaskHook.todayTask
    ? (dailyTaskHook.todayTask as DailyTask)
    : null;

  const {
    isLoadingMine,
    isSaving,
    deletingAttachmentId,
    error,
    refresh,
    save,
    removeAttachment,
    clearError,
  } = dailyTaskHook;

  const [taskStatus, setTaskStatus] =
    useState<DailyTaskStatus>('Pending');
  const [jiraLinks, setJiraLinks] = useState<string[]>(['']);
  const [taskDescription, setTaskDescription] = useState('');
  const [newIdea, setNewIdea] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    if (!todayTask) return;
    setTaskStatus(todayTask.status);
    setTaskDescription(todayTask.workDescription);
    setNewIdea(todayTask.newIdeas || '');
    setJiraLinks(
      todayTask.jiraLinks.length
        ? todayTask.jiraLinks.map(
            (link: DailyTaskJiraLink) => link.url
          )
        : ['']
    );
  }, [todayTask?.dailyTaskSubmissionId]);

  const completedCount = useMemo(
    () =>
      myTasks.filter(
        (task: DailyTask) => task.status === 'Completed'
      ).length,
    [myTasks]
  );

  const addJiraLink = () => {
    if (jiraLinks.length < 10) setJiraLinks((links) => [...links, '']);
  };

  const removeJiraLink = (index: number) => {
    setJiraLinks((links) => {
      const next = links.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [''];
    });
  };

  const updateJiraLink = (index: number, value: string) => {
    setJiraLinks((links) =>
      links.map((link, itemIndex) => (itemIndex === index ? value : link))
    );
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 10) {
      toast.error('You can upload a maximum of 10 files');
    }
    setSelectedFiles(files.slice(0, 10));
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((files) =>
      files.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const handleSubmitTask = async () => {
    clearError();

    const workDescription = taskDescription.trim();
    if (!workDescription) {
      toast.error('Task description is required');
      return;
    }

    const filteredLinks: string[] = jiraLinks
      .map((link: string) => link.trim())
      .filter((link: string) => Boolean(link));

    const invalidLink = filteredLinks.find((link: string) => {
      try {
        new URL(link);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidLink) {
      toast.error(`Invalid URL: ${invalidLink}`);
      return;
    }

    const payload: DailyTaskPayload = {
      workDescription,
      status: taskStatus,
      newIdeas: newIdea.trim() || undefined,
      jiraLinks: filteredLinks.map((url) => ({
        url,
        label: extractJiraLabel(url),
      })),
    };

    try {
      const wasUpdate = Boolean(todayTask);
      await save(payload, selectedFiles);
      setSelectedFiles([]);
      setFileInputKey((key) => key + 1);
      toast.success(
        wasUpdate
          ? "Today's daily task was updated"
          : 'Daily task submitted successfully'
      );
    } catch (requestError) {
      const message =
        typeof requestError === 'string'
          ? requestError
          : 'Failed to save the daily task';
      toast.error(message);
      await refresh().catch(() => undefined);
    }
  };

  const handleDeleteAttachment = async (
    taskId: string,
    attachmentId: string
  ) => {
    try {
      await removeAttachment(taskId, attachmentId);
      toast.success('Attachment deleted');
    } catch (requestError) {
      toast.error(
        typeof requestError === 'string'
          ? requestError
          : 'Failed to delete the attachment'
      );
    }
  };

  const getStatusColor = (status: DailyTaskStatus) =>
    status === 'Completed' ? tc.statusActive : tc.statusInactive;

  const renderTask = (task: DailyTask) => (
    <div
      key={task.dailyTaskSubmissionId}
      className={`p-3 sm:p-4 rounded-xl ${tc.taskCard} ${tc.border} border ${tc.taskCardHover} transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-indigo-400">
            TASK-{task.dailyTaskSubmissionId}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              task.status
            )}`}
          >
            {task.status}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${tc.textMuted} bg-gray-500/10`}
          >
            {task.submissionDate}
          </span>
        </div>
        <span className={`text-xs ${tc.textMuted}`}>
          {formatSubmittedAt(task.submittedAt)}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <p className={`text-sm ${tc.text} whitespace-pre-wrap`}>
          {task.workDescription}
        </p>

        {task.newIdeas && (
          <div className="flex items-start gap-2 text-xs">
            <LightBulbIcon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span className={tc.textSecondary}>{task.newIdeas}</span>
          </div>
        )}

        {task.jiraLinks.length > 0 && (
          <div className="space-y-1">
            {task.jiraLinks.map((link: DailyTaskJiraLink) => (
              <div
                key={link.dailyTaskJiraLinkId}
                className="flex items-center gap-2 text-xs"
              >
                <LinkIcon className={`w-4 h-4 ${tc.textMuted} flex-shrink-0`} />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 truncate"
                >
                  {link.label || link.url}
                </a>
              </div>
            ))}
          </div>
        )}

        {task.attachments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {task.attachments.map((attachment: DailyTaskAttachment) => (
              <div
                key={attachment.dailyTaskAttachmentId}
                className={`flex items-center gap-2 rounded-lg border ${tc.border} p-2`}
              >
                {attachment.mimeType.startsWith('image/') ? (
                  <img
                    src={resolveApiAssetUrl(attachment.fileUrl)}
                    alt={attachment.fileName}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <PaperClipIcon className={`h-5 w-5 ${tc.textMuted}`} />
                )}
                <a
                  href={resolveApiAssetUrl(attachment.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-xs text-indigo-400">
                    {attachment.fileName}
                  </p>
                  <p className={`text-[10px] ${tc.textMuted}`}>
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </a>
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteAttachment(
                      task.dailyTaskSubmissionId,
                      attachment.dailyTaskAttachmentId
                    )
                  }
                  disabled={
                    deletingAttachmentId === attachment.dailyTaskAttachmentId
                  }
                  className="p-1 text-rose-400 hover:bg-rose-500/10 rounded disabled:opacity-50"
                  aria-label={`Delete ${attachment.fileName}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-start justify-between gap-3">
          <span className="text-sm">{error}</span>
          <button
            type="button"
            onClick={clearError}
            aria-label="Dismiss error"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <p className={`text-xs ${tc.textMuted}`}>Last 3 days</p>
          <p className={`text-2xl font-bold ${tc.text}`}>{myTasks.length}</p>
        </div>
        <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <p className={`text-xs ${tc.textMuted}`}>Completed</p>
          <p className="text-2xl font-bold text-emerald-400">
            {completedCount}
          </p>
        </div>
      </div>

      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className={`font-semibold ${tc.text} text-lg`}>
              {todayTask ? "Update Today's Work" : "Today's Work Submission"}
            </h3>
            <p className={`text-sm ${tc.textSecondary}`}>
              One submission per day. You can update today's entry at any time.
            </p>
          </div>
          {todayTask && (
            <span className="self-start px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Submitted
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
              Task Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              placeholder="Describe the work you completed today..."
              rows={4}
              maxLength={20000}
              className={`w-full px-4 py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none text-sm`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <ClipboardDocumentCheckIcon className="w-4 h-4 text-indigo-400" />
              Task Status
            </label>
            <div className="flex gap-3">
              {(['Pending', 'Completed'] as DailyTaskStatus[]).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setTaskStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    taskStatus === status
                      ? `${tc.statusActiveBtn} shadow-lg shadow-indigo-500/20`
                      : tc.statusInactiveBtn
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm font-medium ${tc.text} flex items-center gap-2`}>
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                Jira Ticket URLs
              </label>
              <span className={`text-xs ${tc.textMuted}`}>
                  {jiraLinks.filter((link: string) => link.trim()).length} / 10
              </span>
            </div>
            <div className="space-y-2">
              {jiraLinks.map((link: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(event) => updateJiraLink(index, event.target.value)}
                    placeholder="https://jira.example.com/browse/PORTAL-123"
                    className={`flex-1 px-4 py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => removeJiraLink(index)}
                    className={`p-2 rounded-lg ${tc.textMuted} hover:text-rose-400 hover:bg-rose-500/10`}
                    aria-label={`Remove Jira link ${index + 1}`}
                  >
                    <MinusCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            {jiraLinks.length < 10 && (
              <button
                type="button"
                onClick={addJiraLink}
                className={`mt-2 text-xs ${tc.textSecondary} hover:text-indigo-400 flex items-center gap-1`}
              >
                <PlusIcon className="h-4 w-4" /> Add another Jira link
              </button>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <LightBulbIcon className="w-4 h-4 text-amber-400" />
              New Ideas / Improvements
            </label>
            <textarea
              value={newIdea}
              onChange={(event) => setNewIdea(event.target.value)}
              placeholder="Share an idea or improvement (optional)..."
              rows={2}
              maxLength={10000}
              className={`w-full px-4 py-2.5 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none text-sm`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${tc.text} mb-2 flex items-center gap-2`}>
              <PaperClipIcon className="w-4 h-4 text-pink-400" />
              Attachments
            </label>
            <label className={`inline-flex px-4 py-2.5 ${tc.btnBg} rounded-xl text-sm font-medium cursor-pointer hover:scale-[1.02] transition-all items-center gap-2`}>
              <ArrowUpTrayIcon className="w-4 h-4" />
              Choose files
              <input
                key={fileInputKey}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.zip,.rar"
                onChange={handleFileSelection}
                className="hidden"
              />
            </label>
            <p className={`text-xs ${tc.textMuted} mt-1`}>
              Up to 10 images, videos, documents, or archives.
            </p>
            {selectedFiles.length > 0 && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}`}
                    className={`flex items-center gap-2 border ${tc.border} rounded-lg p-2`}
                  >
                    <PaperClipIcon className={`h-4 w-4 ${tc.textMuted}`} />
                    <span className={`text-xs ${tc.text} truncate flex-1`}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="text-rose-400"
                      aria-label={`Remove ${file.name}`}
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmitTask}
            disabled={isSaving || !taskDescription.trim()}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : todayTask ? (
              <CheckIcon className="w-5 h-5" />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
            {isSaving
              ? 'Saving...'
              : todayTask
                ? "Update Today's Task"
                : 'Submit Daily Task Update'}
          </button>
        </div>
      </div>

      <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-semibold ${tc.text} text-lg`}>Task History</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Last 3 calendar days</p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isLoadingMine}
            className={`p-2 rounded-lg ${tc.btnBg} disabled:opacity-50`}
            aria-label="Refresh daily tasks"
          >
            <ArrowPathIcon
              className={`h-5 w-5 ${isLoadingMine ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {isLoadingMine && myTasks.length === 0 ? (
          <div className={`py-10 text-center text-sm ${tc.textMuted}`}>
            Loading daily tasks...
          </div>
        ) : myTasks.length === 0 ? (
          <div className={`py-10 text-center text-sm ${tc.textMuted}`}>
            No daily task submissions found for the last 3 days.
          </div>
        ) : (
          <div className="space-y-3">{myTasks.slice(0, 3).map(renderTask)}</div>
        )}
      </div>
    </div>
  );
};

export default TasksTab;
