// components/common/StatsCard.tsx
import React from 'react';
import { ThemeClasses } from '../types';

interface StatsCardProps {
  stat: {
    label: string;
    value: string;
    icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
    subtitle: string;
  };
  tc: ThemeClasses;
  isClockedIn?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ stat, tc, isClockedIn = false }) => {
  return (
    <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow} ${tc.bgCardHover} transition-all duration-300 group cursor-pointer hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] sm:text-sm ${tc.textSecondary} truncate`}>{stat.label}</p>
          <p className={`text-base sm:text-2xl font-bold ${tc.text} ${stat.label === "Today's Hours" && isClockedIn ? 'text-emerald-400' : ''} truncate`}>{stat.value}</p>
          <p className={`text-[8px] sm:text-xs ${tc.textMuted} truncate`}>{stat.subtitle}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-xl bg-indigo-500/10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-2`}>
          <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-400" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;