// components/performance/PerformanceTab.tsx
import React from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ThemeClasses, PerformanceData } from '../types';

interface PerformanceTabProps {
  tc: ThemeClasses;
  performanceData: PerformanceData[];
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ tc, performanceData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${tc.text}`}>Performance Tracking</h2>
        <p className={`text-sm ${tc.textSecondary}`}>Goal completion, KPIs and ratings for your team</p>
      </div>

      <div className="space-y-4">
        {performanceData.map((member) => (
          <div key={member.name} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className={`font-semibold ${tc.text}`}>{member.name}</p>
                  <p className={`text-sm ${tc.textSecondary}`}>{member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-center">
                  <p className={`text-sm ${tc.textSecondary}`}>KPI</p>
                  <p className={`font-semibold ${tc.text}`}>{member.kpi}</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm ${tc.textSecondary}`}>SLA</p>
                  <p className={`font-semibold ${tc.text}`}>{member.sla}%</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm ${tc.textSecondary}`}>PRs/wk</p>
                  <p className={`font-semibold ${tc.text}`}>{member.prs}</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm ${tc.textSecondary}`}>Rating</p>
                  <p className="font-semibold text-indigo-400">{member.rating}★</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm ${tc.textSecondary}`}>Goals</p>
                  <p className="font-semibold text-emerald-400">{member.done}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <h3 className={`font-semibold ${tc.text} mb-4`}>Productivity Trend</h3>
        <p className={`text-sm ${tc.textSecondary} mb-6`}>Team score over 6 months</p>
        <div className="h-64">
          <div className="flex items-end justify-between gap-4 h-full">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [65, 72, 80, 78, 85, 89];
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t transition-all duration-500 hover:from-indigo-600" 
                      style={{ height: `${heights[i]}px`, minHeight: '20px' }}
                    />
                    <span className={`text-xs ${tc.textMuted}`}>{month}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`mt-4 flex items-center justify-between text-sm ${tc.textSecondary}`}>
          <span>↑ 4% vs last month</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-500 rounded"></span> KPI</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-300 rounded"></span> SLA</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-100 rounded"></span> PRs/wk</span>
          </div>
        </div>
      </div>

      <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className={`font-semibold ${tc.text}`}>Submit to Super Admin</h3>
            <p className={`text-sm ${tc.textSecondary}`}>Weekly team report</p>
          </div>
          <button 
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            aria-label="Submit weekly team report to Super Admin"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            Send Report
          </button>
        </div>
        <p className={`text-xs ${tc.textMuted} mt-2`}>Last sent - 5 days ago to Aarav Mehta</p>
      </div>
    </div>
  );
};

export default PerformanceTab;