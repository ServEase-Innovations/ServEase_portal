// components/tasks/AssignTasksTab.tsx
import React from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ThemeClasses, Task, TeamMember } from '../types';
import StatusBadge from '../common/StatusBadge';

interface AssignTasksTabProps {
  tc: ThemeClasses;
  tasks: Task[];
  teamMembers: TeamMember[];
}

const AssignTasksTab: React.FC<AssignTasksTabProps> = ({ tc, tasks, teamMembers }) => {
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Critical': tc.priorityCritical,
      'High': tc.priorityHigh,
      'Medium': tc.priorityMedium,
      'Low': tc.priorityLow
    };
    return colors[priority] || tc.priorityLow;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Assign Tasks</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Create and route tasks to your team members</p>
        </div>
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-4`}>Create New Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm ${tc.textSecondary} mb-1`}>Task title</label>
            <input
              type="text"
              placeholder="Enter task title..."
              className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              aria-label="Task title"
            />
          </div>
          <div>
            <label className={`block text-sm ${tc.textSecondary} mb-1`}>Assignee</label>
            <select 
              className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              aria-label="Select assignee for task"
            >
              <option value="">Select team member</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm ${tc.textSecondary} mb-1`}>Priority</label>
            <select 
              className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              aria-label="Select task priority"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm ${tc.textSecondary} mb-1`}>Due Date</label>
            <input
              type="date"
              className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              aria-label="Task due date"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            aria-label="Assign task to team member"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            Assign Task
          </button>
        </div>
      </div>

      <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden`}>
        <div className={`px-6 py-4 ${tc.border} border-b`}>
          <h3 className={`font-semibold ${tc.text}`}>Recent Tasks</h3>
        </div>
        <div className={`divide-y ${tc.border}`}>
          {tasks.map((task) => (
            <div key={task.id} className={`px-6 py-4 ${tc.bgTableHover} transition-colors`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className={`font-medium ${tc.text}`}>{task.title}</p>
                    <span className={`text-xs ${tc.textMuted}`}>{task.id}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className={`text-sm ${tc.textSecondary}`}>{task.assignee}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <StatusBadge status={task.status} tc={tc} />
                    <span className={`text-xs ${tc.textMuted}`}>{task.dueDate}</span>
                  </div>
                </div>
                <button 
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                  aria-label={`Edit task ${task.title}`}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignTasksTab;