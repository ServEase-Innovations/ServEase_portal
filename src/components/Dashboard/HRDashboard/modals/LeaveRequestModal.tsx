// src/pages/HRDashboard/components/modals/LeaveRequestModal.tsx

import React from 'react';
import { XCircleIcon, PaperAirplaneIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { ThemeClasses } from '../types';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  leaveRequest: {
    type: 'Sick' | 'Casual' | 'Earned' | 'Other';
    fromDate: string;
    toDate: string;
    reason: string;
    imageFile: File | null;
    imagePreview: string | null;
  };
  setLeaveRequest: React.Dispatch<React.SetStateAction<any>>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  themeClasses: ThemeClasses;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  leaveRequest,
  setLeaveRequest,
  onImageUpload,
  themeClasses
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`${themeClasses.bgCard} rounded-2xl ${themeClasses.border} ${themeClasses.shadow} max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>Apply for Leave</h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg ${themeClasses.textMuted} hover:${themeClasses.text} transition-colors`}
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text} mb-1.5`}>Leave Type</label>
            <select
              value={leaveRequest.type}
              onChange={(e) => setLeaveRequest({ ...leaveRequest, type: e.target.value as any })}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${themeClasses.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
            >
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Earned">Earned Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text} mb-1.5`}>From Date</label>
              <input
                type="date"
                value={leaveRequest.fromDate}
                onChange={(e) => setLeaveRequest({ ...leaveRequest, fromDate: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${themeClasses.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text} mb-1.5`}>To Date</label>
              <input
                type="date"
                value={leaveRequest.toDate}
                onChange={(e) => setLeaveRequest({ ...leaveRequest, toDate: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${themeClasses.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeClasses.text} mb-1.5`}>Reason</label>
            <textarea
              value={leaveRequest.reason}
              onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
              placeholder="Please provide a reason for your leave..."
              rows={3}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 ${themeClasses.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none resize-none transition-all text-sm`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeClasses.text} mb-1.5`}>Supporting Document (Optional)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className={`px-3 sm:px-4 py-2 sm:py-2.5 ${themeClasses.btnBg} rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-all hover:scale-105 flex items-center gap-2`}>
                <ArrowUpTrayIcon className="w-4 h-4" />
                Upload Document
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={onImageUpload}
                  className="hidden"
                />
              </label>
              {leaveRequest.imagePreview && (
                <div className="flex items-center gap-2">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border ${themeClasses.border}">
                    <img src={leaveRequest.imagePreview} alt="Leave document" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLeaveRequest({ ...leaveRequest, imageFile: null, imagePreview: null });
                    }}
                    className={`p-1 rounded-lg ${themeClasses.textMuted} hover:text-rose-400 transition-colors`}
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <p className={`text-[10px] sm:text-xs ${themeClasses.textMuted} mt-1`}>
              Upload medical certificate, or any supporting document (optional)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`w-full sm:w-auto px-4 py-2 ${themeClasses.border} ${themeClasses.textSecondary} rounded-xl text-sm font-medium ${themeClasses.bgTableHover} transition-colors`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              Submit Leave Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};