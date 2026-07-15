import React, { useState } from 'react';
import DailyTaskReview from './DailyTaskReview';
import TasksTab from '../Dashboard/EmployeeDashboard/TasksTab';

interface DailyTaskWorkspaceProps {
  theme: 'light' | 'dark';
}

const DailyTaskWorkspace: React.FC<DailyTaskWorkspaceProps> = ({ theme }) => {
  const [view, setView] = useState<'review' | 'mine'>('review');
  const isDark = theme === 'dark';

  return (
    <div className="space-y-5">
      <div
        className={`inline-flex rounded-xl p-1 ${
          isDark ? 'bg-white/5' : 'bg-gray-100'
        }`}
      >
        {(
          [
            ['review', 'Review Submissions'],
            ['mine', 'My Submission'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              view === value
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark
                  ? 'text-blue-200/70 hover:text-white'
                  : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'review' ? (
        <DailyTaskReview theme={theme} />
      ) : (
        <TasksTab theme={theme} />
      )}
    </div>
  );
};

export default DailyTaskWorkspace;
