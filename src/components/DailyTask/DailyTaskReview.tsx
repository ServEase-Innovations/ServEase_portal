import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowPathIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PaperClipIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

import { useDailyTaskReview } from '../../hooks/useDailyTaskReview';
import { formatLocalDate } from '../../services/daily-task.service';
import { resolveApiAssetUrl } from '../../services/api';

import {
  DailyTask,
  DailyTaskStatus,
} from '../../types/daily-task';

interface DailyTaskReviewProps {
  theme: 'light' | 'dark';
}

const formatTime = (value: string): string => {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
};

const DailyTaskReview: React.FC<DailyTaskReviewProps> = ({
  theme,
}) => {
  const isDark = theme === 'dark';

  const card = isDark
    ? 'bg-[#101f38] border border-blue-900/50'
    : 'bg-white border border-gray-200 shadow-sm';

  const text = isDark
    ? 'text-white'
    : 'text-gray-900';

  const secondary = isDark
    ? 'text-blue-200/70'
    : 'text-gray-500';

  const input = isDark
    ? 'bg-[#0a1628] border border-blue-900/60 text-white'
    : 'bg-gray-50 border border-gray-200 text-gray-900';

  const {
    tasks: reviewTasks,
    isLoading,
    error,
    load,
    clearError,
  } = useDailyTaskReview();

  /*
   * Explicitly convert the hook result into DailyTask[].
   * This prevents the implicit "any" error.
   */
  const tasks = useMemo<DailyTask[]>(() => {
    if (!Array.isArray(reviewTasks)) {
      return [];
    }

    return reviewTasks as DailyTask[];
  }, [reviewTasks]);

  const [selectedDate, setSelectedDate] = useState<string>(
    formatLocalDate(new Date())
  );

  const [status, setStatus] =
    useState<DailyTaskStatus | ''>('');

  const [search, setSearch] = useState<string>('');

  const refresh = useCallback(async () => {
    return load({
      date: selectedDate,
      status: status || undefined,
    });
  }, [load, selectedDate, status]);

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, [refresh]);

  const filteredTasks = useMemo<DailyTask[]>(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tasks;
    }

    return tasks.filter((task: DailyTask) => {
      const employee = task.employee;

      const searchableValues: Array<
        string | null | undefined
      > = [
        employee?.fullName,
        employee?.username,
        employee?.emailAddress,
        employee?.assignedDepartment,
        task.employeeId,
      ];

      return searchableValues.some((value) =>
        value?.toLowerCase().includes(query)
      );
    });
  }, [search, tasks]);

  const completed = tasks.filter(
    (task: DailyTask) => task.status === 'Completed'
  ).length;

  const pending = tasks.filter(
    (task: DailyTask) => task.status === 'Pending'
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${text}`}>
            Daily Task Review
          </h2>

          <p className={`text-sm ${secondary}`}>
            Select a date to see who submitted work and when.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <label className="relative">
            <CalendarDaysIcon
              className={`
                absolute left-3 top-1/2
                -translate-y-1/2
                h-4 w-4
                ${secondary}
              `}
            />

            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
              className={`
                pl-9 pr-3 py-2.5
                rounded-xl
                outline-none
                focus:ring-2
                focus:ring-indigo-500/40
                text-sm
                ${input}
              `}
              aria-label="Daily task review date"
            />
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as DailyTaskStatus | ''
              )
            }
            className={`
              px-3 py-2.5
              rounded-xl
              outline-none
              focus:ring-2
              focus:ring-indigo-500/40
              text-sm
              ${input}
            `}
            aria-label="Filter daily tasks by status"
          >
            <option value="">
              All statuses
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>

          <button
            type="button"
            onClick={() => {
              void refresh().catch(() => undefined);
            }}
            disabled={isLoading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-indigo-600
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              hover:bg-indigo-700
              disabled:opacity-60
            "
          >
            <ArrowPathIcon
              className={`
                h-4 w-4
                ${isLoading ? 'animate-spin' : ''}
              `}
            />

            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          className="
            flex
            items-start
            justify-between
            gap-3
            rounded-xl
            border
            border-rose-500/30
            bg-rose-500/10
            p-3
            text-rose-400
          "
        >
          <span className="text-sm">
            {error}
          </span>

          <button
            type="button"
            onClick={clearError}
            aria-label="Dismiss error"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`${card} rounded-2xl p-4`}>
          <p className={`text-xs ${secondary}`}>
            Total submissions
          </p>

          <p className={`mt-1 text-2xl font-bold ${text}`}>
            {tasks.length}
          </p>
        </div>

        <div className={`${card} rounded-2xl p-4`}>
          <p className={`text-xs ${secondary}`}>
            Completed
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {completed}
          </p>
        </div>

        <div className={`${card} rounded-2xl p-4`}>
          <p className={`text-xs ${secondary}`}>
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-amber-400">
            {pending}
          </p>
        </div>
      </div>

      <div className={`${card} rounded-2xl p-4 sm:p-6`}>
        <div className="relative mb-4">
          <MagnifyingGlassIcon
            className={`
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              h-4 w-4
              ${secondary}
            `}
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search employee, email, department, or ID..."
            className={`
              w-full
              pl-9
              pr-3
              py-2.5
              rounded-xl
              outline-none
              focus:ring-2
              focus:ring-indigo-500/40
              text-sm
              ${input}
            `}
          />
        </div>

        {isLoading && tasks.length === 0 ? (
          <div
            className={`
              py-14
              text-center
              text-sm
              ${secondary}
            `}
          >
            Loading submissions for {selectedDate}...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-14 text-center">
            <DocumentTextIcon
              className={`
                mx-auto
                h-10 w-10
                ${secondary}
              `}
            />

            <p className={`mt-3 text-sm ${text}`}>
              No submissions found
            </p>

            <p className={`mt-1 text-xs ${secondary}`}>
              Try another date, status, or employee search.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task: DailyTask) => (
              <article
                key={task.dailyTaskSubmissionId}
                className={`
                  rounded-xl
                  border
                  p-4
                  ${
                    isDark
                      ? 'border-blue-900/50 bg-[#0a1628]'
                      : 'border-gray-200 bg-gray-50'
                  }
                `}
              >
                <div
                  className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-start
                    justify-between
                    gap-3
                  "
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="
                        h-10
                        w-10
                        flex-shrink-0
                        rounded-full
                        bg-indigo-500/15
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <UserIcon className="h-5 w-5 text-indigo-400" />
                    </div>

                    <div className="min-w-0">
                      <p className={`font-semibold ${text}`}>
                        {task.employee?.fullName ||
                          `Employee ${task.employeeId}`}
                      </p>

                      <p
                        className={`
                          text-xs
                          truncate
                          ${secondary}
                        `}
                      >
                        {task.employee?.assignedDepartment ||
                          'No department'}

                        {' · '}

                        {task.employee?.emailAddress ||
                          task.employeeId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`
                        rounded-full
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        ${
                          task.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }
                      `}
                    >
                      {task.status}
                    </span>

                    <span className={`text-xs ${secondary}`}>
                      {formatTime(task.submittedAt)}
                    </span>
                  </div>
                </div>

                <p
                  className={`
                    mt-4
                    whitespace-pre-wrap
                    text-sm
                    ${text}
                  `}
                >
                  {task.workDescription}
                </p>

                {task.newIdeas && (
                  <div
                    className={`
                      mt-3
                      rounded-lg
                      p-3
                      text-xs
                      ${
                        isDark
                          ? 'bg-amber-500/5 text-amber-100/80'
                          : 'bg-amber-50 text-amber-900'
                      }
                    `}
                  >
                    <span className="font-semibold">
                      Idea:{' '}
                    </span>

                    {task.newIdeas}
                  </div>
                )}

                {(task.jiraLinks.length > 0 ||
                  task.attachments.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.jiraLinks.map((link) => (
                      <a
                        key={link.dailyTaskJiraLinkId}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          inline-flex
                          max-w-full
                          items-center
                          gap-1.5
                          rounded-lg
                          bg-indigo-500/10
                          px-2.5
                          py-1.5
                          text-xs
                          text-indigo-400
                          hover:bg-indigo-500/20
                        "
                      >
                        <LinkIcon className="h-3.5 w-3.5" />

                        <span className="truncate">
                          {link.label || link.url}
                        </span>
                      </a>
                    ))}

                    {task.attachments.map((attachment) => (
                      <a
                        key={
                          attachment.dailyTaskAttachmentId
                        }
                        href={resolveApiAssetUrl(
                          attachment.fileUrl
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                          inline-flex
                          max-w-full
                          items-center
                          gap-1.5
                          rounded-lg
                          px-2.5
                          py-1.5
                          text-xs
                          ${
                            isDark
                              ? 'bg-white/5 text-blue-200 hover:bg-white/10'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }
                        `}
                      >
                        <PaperClipIcon className="h-3.5 w-3.5" />

                        <span className="truncate">
                          {attachment.fileName}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTaskReview;