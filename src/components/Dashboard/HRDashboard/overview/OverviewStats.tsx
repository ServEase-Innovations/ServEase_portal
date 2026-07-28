// src/pages/HRDashboard/components/overview/OverviewStats.tsx

import React from 'react';
import { ThemeClasses } from '../types';

interface StatItem {
  label: string;
  value: string;
  icon: React.ElementType;
  subtitle: string;
  change: string;
}

interface OverviewStatsProps {
  stats: StatItem[];
  themeClasses: ThemeClasses;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ stats, themeClasses }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <div key={index} className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow} ${themeClasses.bgCardHover} transition-all duration-300 group cursor-pointer hover:scale-[1.02]`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-[10px] sm:text-sm ${themeClasses.textSecondary} truncate`}>{stat.label}</p>
              <p className={`text-base sm:text-2xl font-bold ${themeClasses.text} truncate`}>{stat.value}</p>
              <p className={`text-[8px] sm:text-xs ${themeClasses.textMuted} truncate`}>{stat.subtitle}</p>
              <p className="text-[8px] sm:text-xs text-emerald-400 mt-0.5 sm:mt-1">{stat.change}</p>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl bg-indigo-500/10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-2`}>
              <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 text-indigo-400`} aria-hidden="true" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};