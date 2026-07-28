// src/pages/HRDashboard/components/salary/SalaryTab.tsx

import React from 'react';
import { SalaryRecord, ThemeClasses } from '../types';

interface SalaryTabProps {
  salaryRecords: SalaryRecord[];
  themeClasses: ThemeClasses;
}

export const SalaryTab: React.FC<SalaryTabProps> = ({ salaryRecords, themeClasses }) => {
  const totalPayable = salaryRecords.reduce((sum, record) => {
    const payableNum = parseInt(record.payable.replace(/[^0-9]/g, ''));
    return sum + payableNum;
  }, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>Salary & Attendance Report</h2>
        <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>Monthly attendance-linked payable summary - Jun 2026</p>
      </div>

      <div className={`${themeClasses.bgCard} rounded-2xl ${themeClasses.border} ${themeClasses.shadow} overflow-hidden`}>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px] sm:min-w-0">
            <thead>
              <tr className={`text-left text-[10px] sm:text-xs ${themeClasses.tableHeader} ${themeClasses.border} border-b`}>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Employee</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium hidden sm:table-cell">Team</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-center">Present</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-center hidden sm:table-cell">Leaves</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-center hidden md:table-cell">LOP</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right hidden lg:table-cell">Base Salary</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right">Payable</th>
              </tr>
            </thead>
            <tbody>
              {salaryRecords.map((record) => (
                <tr key={record.id} className={`${themeClasses.border} border-b last:border-0 ${themeClasses.bgTableHover} transition-colors`}>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-[8px] sm:text-xs shadow-lg shadow-indigo-500/25 flex-shrink-0">
                        {record.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`font-medium ${themeClasses.text} text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none`}>{record.employee}</span>
                    </div>
                  </td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm ${themeClasses.textSecondary} hidden sm:table-cell`}>{record.team}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-center text-emerald-400 font-semibold`}>{record.present}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-center text-amber-400 hidden sm:table-cell`}>{record.leaves}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-center text-rose-400 hidden md:table-cell`}>{record.lop}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-right ${themeClasses.textSecondary} hidden lg:table-cell`}>{record.baseSalary}</td>
                  <td className={`px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-right font-semibold text-indigo-400`}>{record.payable}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className={`${themeClasses.tableHeader} ${themeClasses.border} border-t`}>
              <tr>
                <td colSpan={6} className={`px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-sm font-semibold ${themeClasses.text} text-right hidden lg:table-cell`}>Total Payable:</td>
                <td className={`px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-sm font-bold text-indigo-400 text-right`}>₹{totalPayable.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};