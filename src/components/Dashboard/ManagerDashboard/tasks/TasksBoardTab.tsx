// components/tasks/TasksBoardTab.tsx
import React from 'react';
import { ThemeClasses, Task } from '../types';
import StatusBadge from '../common/StatusBadge';

interface TasksBoardTabProps {
  tc: ThemeClasses;
  tasks: Task[];
}

const TasksBoardTab: React.FC<TasksBoardTabProps> = ({ tc, tasks }) => {
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Critical': tc.priorityCritical,
      'High': tc.priorityHigh,
      'Medium': tc.priorityMedium,
      'Low': tc.priorityLow
    };
    return colors[priority] || tc.priorityLow;
  };

  const statuses = ['Pending', 'In Progress', 'Completed', 'Blocked'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Tasks Board</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Across your team's projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map((status) => (
          <div key={status} className={`${tc.bgCard} rounded-2xl p-4 ${tc.border} ${tc.shadow}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${tc.text}`}>{status}</h3>
              <span className={`text-xs ${tc.textMuted} ${tc.bgTableHover} px-2 py-1 rounded-full`}>
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            <div className="space-y-3">
              {tasks.filter(task => task.status === status).map((task) => (
                <div key={task.id} className={`${tc.bgCard} p-4 rounded-xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-medium ${tc.text}`}>{task.title}</p>
                      <p className={`text-xs ${tc.textMuted} mt-1`}>{task.project}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {task.assignee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`text-xs ${tc.textSecondary}`}>{task.assignee}</span>
                    </div>
                    <span className={`text-xs ${tc.textMuted}`}>{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksBoardTab;