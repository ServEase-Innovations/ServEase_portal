// components/Dashboard/shared/InfoCard.tsx
import React from 'react';

export type InfoRow = {
  label: string;
  value: string;
  bold?: boolean;
  noBorder?: boolean;
  topPadding?: boolean;
  valueClass?: string;
  labelClass?: string;
};

interface InfoCardProps {
  title: string;
  subtitle?: string;
  rows: InfoRow[];
  tc: {
    bgCard: string;
    border: string;
    shadow: string;
    text: string;
    textSecondary: string;
  };
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, subtitle, rows, tc }) => (
  <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
    <h3 className={`font-semibold ${tc.text} mb-2 sm:mb-4 text-base sm:text-lg`}>{title}</h3>
    {subtitle && <p className={`text-sm ${tc.textSecondary} mb-3 sm:mb-4`}>{subtitle}</p>}
    <div className="space-y-2 sm:space-y-3 text-sm">
      {rows.map((row) => {
        const borderClass = row.noBorder ? '' : `pb-2 ${tc.border} border-b`;
        const paddingClass = row.topPadding ? 'pt-2' : '';
        
        return (
          <div 
            key={row.label} 
            className={`flex justify-between items-center ${borderClass} ${paddingClass}`}
          >
            <span className={row.labelClass || tc.textSecondary}>{row.label}</span>
            <span className={`${row.bold ? 'font-bold' : 'font-medium'} ${row.valueClass || tc.text}`}>
              {row.value}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);
