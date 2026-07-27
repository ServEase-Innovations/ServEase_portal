// components/reports/ReportsTab.tsx
import React from 'react';
import { ChartBarIcon, UsersIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';

interface ReportsTabProps {
  tc: ThemeClasses;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ tc }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${tc.text}`}>Reports</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Team analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChartBarIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className={`font-semibold ${tc.text}`}>Weekly Report</h3>
              <p className={`text-xs ${tc.textSecondary}`}>Team performance summary</p>
            </div>
          </div>
          <p className={`text-sm ${tc.textSecondary}`}>Platform team delivered 18/22 sprint points. OAuth migration on-track. Need DevOps support for K8s pod restart loop.</p>
          <button 
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            aria-label="View weekly report"
          >
            View Report →
          </button>
        </div>

        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UsersIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className={`font-semibold ${tc.text}`}>Attendance Report</h3>
              <p className={`text-xs ${tc.textSecondary}`}>Monthly attendance summary</p>
            </div>
          </div>
          <p className={`text-sm ${tc.textSecondary}`}>92% attendance rate this month. 4% increase from last week.</p>
          <button 
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            aria-label="View attendance report"
          >
            View Report →
          </button>
        </div>

        <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardDocumentCheckIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className={`font-semibold ${tc.text}`}>Task Report</h3>
              <p className={`text-xs ${tc.textSecondary}`}>Task completion overview</p>
            </div>
          </div>
          <p className={`text-sm ${tc.textSecondary}`}>5 open tasks, 3 blocked. Critical tasks in progress.</p>
          <button 
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            aria-label="View task report"
          >
            View Report →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;