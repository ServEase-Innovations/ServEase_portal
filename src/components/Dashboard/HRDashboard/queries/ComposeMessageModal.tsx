// src/pages/HRDashboard/components/queries/ComposeMessageModal.tsx

import React from 'react';
import { XCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Message, ThemeClasses } from '../types';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  newMessage: {
    receiver: string;
    subject: string;
    content: string;
    category: Message['category'];
  };
  setNewMessage: React.Dispatch<React.SetStateAction<any>>;
  themeClasses: ThemeClasses;
}

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
  isOpen,
  onClose,
  onSend,
  newMessage,
  setNewMessage,
  themeClasses
}) => {
  if (!isOpen) return null;

  return (
    <div className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className={`font-semibold ${themeClasses.text} text-base sm:text-lg`}>Compose New Message</h3>
        <button 
          type="button"
          onClick={onClose}
          className={`${themeClasses.textMuted} hover:${themeClasses.text}`}
          aria-label="Close compose window"
        >
          <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
        </button>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className={`block text-xs sm:text-sm ${themeClasses.textSecondary} mb-1`}>Recipient</label>
          <select 
            className={`w-full px-3 py-1.5 sm:py-2 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
            value={newMessage.receiver}
            onChange={(e) => setNewMessage({ ...newMessage, receiver: e.target.value })}
            aria-label="Select recipient"
          >
            <option value="">Select recipient</option>
            <option value="Aarav Mehta">Aarav Mehta (Super Admin)</option>
            <option value="Priya Nair">Priya Nair (Manager)</option>
            <option value="Vikram Shah">Vikram Shah (Manager)</option>
            <option value="Ishita Roy">Ishita Roy (Employee)</option>
            <option value="Karan Singh">Karan Singh (Employee)</option>
          </select>
        </div>
        <div>
          <label className={`block text-xs sm:text-sm ${themeClasses.textSecondary} mb-1`}>Category</label>
          <select 
            className={`w-full px-3 py-1.5 sm:py-2 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
            value={newMessage.category}
            onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value as Message['category'] })}
            aria-label="Select message category"
          >
            <option value="General">General</option>
            <option value="HR">HR</option>
            <option value="Payroll">Payroll</option>
            <option value="IT">IT</option>
            <option value="Leave">Leave</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className={`block text-xs sm:text-sm ${themeClasses.textSecondary} mb-1`}>Subject</label>
          <input
            type="text"
            placeholder="Enter subject..."
            className={`w-full px-3 py-1.5 sm:py-2 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
            value={newMessage.subject}
            onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
            aria-label="Message subject"
          />
        </div>
        <div>
          <label className={`block text-xs sm:text-sm ${themeClasses.textSecondary} mb-1`}>Message</label>
          <textarea
            rows={4}
            placeholder="Type your message here..."
            className={`w-full px-3 py-1.5 sm:py-2 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none`}
            value={newMessage.content}
            onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
            aria-label="Message content"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3">
          <button 
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto px-4 py-1.5 sm:py-2 ${themeClasses.border} ${themeClasses.textSecondary} rounded-xl text-xs sm:text-sm font-medium ${themeClasses.bgTableHover} transition-colors`}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onSend}
            className="w-full sm:w-auto px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};