// components/messages/ComposeMessage.tsx
import React from 'react';
import { XCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ThemeClasses, Message } from '../types';

interface ComposeMessageProps {
  tc: ThemeClasses;
  showCompose: boolean;
  setShowCompose: (show: boolean) => void;
  newMessage: {
    receiver: string;
    subject: string;
    content: string;
    category: Message['category'];
  };
  setNewMessage: (message: any) => void;
  handleSendMessage: () => void;
}

const ComposeMessage: React.FC<ComposeMessageProps> = ({
  tc,
  showCompose,
  setShowCompose,
  newMessage,
  setNewMessage,
  handleSendMessage,
}) => {
  if (!showCompose) return null;

  return (
    <div className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${tc.text}`}>Compose New Message</h3>
        <button 
          onClick={() => setShowCompose(false)}
          className={`${tc.textMuted} hover:${tc.text}`}
          aria-label="Close compose message"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className={`block text-sm ${tc.textSecondary} mb-1`}>Recipient</label>
          <select 
            className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
            value={newMessage.receiver}
            onChange={(e) => setNewMessage({ ...newMessage, receiver: e.target.value })}
            aria-label="Select message recipient"
          >
            <option value="">Select recipient</option>
            <option value="Aarav Mehta">Aarav Mehta (Super Admin)</option>
            <option value="Sanya Kapoor">Sanya Kapoor (HR)</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm ${tc.textSecondary} mb-1`}>Category</label>
          <select 
            className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
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
          <label className={`block text-sm ${tc.textSecondary} mb-1`}>Subject</label>
          <input
            type="text"
            placeholder="Enter subject..."
            className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
            value={newMessage.subject}
            onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
            aria-label="Message subject"
          />
        </div>
        <div>
          <label className={`block text-sm ${tc.textSecondary} mb-1`}>Message</label>
          <textarea
            rows={4}
            placeholder="Type your message here..."
            className={`w-full px-3 py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none`}
            value={newMessage.content}
            onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
            aria-label="Message content"
          />
        </div>
        <div className="flex items-center justify-end gap-3">
          <button 
            onClick={() => setShowCompose(false)}
            className={`px-4 py-2 ${tc.border} ${tc.textSecondary} rounded-xl text-sm font-medium ${tc.bgTableHover} transition-colors`}
            aria-label="Cancel composing message"
          >
            Cancel
          </button>
          <button 
            onClick={handleSendMessage}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposeMessage;