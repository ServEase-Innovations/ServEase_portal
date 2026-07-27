// components/messages/QueriesTab.tsx
import React from 'react';
import { 
  InboxIcon, PaperAirplaneIcon, TrashIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { ThemeClasses, Message } from '../types';
import ComposeMessage from './ComposeMessage';

interface QueriesTabProps {
  tc: ThemeClasses;
  messages: Message[];
  filteredMessages: Message[];
  selectedFilter: 'all' | 'unread' | 'read';
  setSelectedFilter: (filter: 'all' | 'unread' | 'read') => void;
  selectedCategory: Message['category'] | 'all';
  setSelectedCategory: (category: Message['category'] | 'all') => void;
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
  markAsRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  replyToMessage: (msg: Message) => void;
}

const QueriesTab: React.FC<QueriesTabProps> = ({
  tc,
  messages,
  filteredMessages,
  selectedFilter,
  setSelectedFilter,
  selectedCategory,
  setSelectedCategory,
  showCompose,
  setShowCompose,
  newMessage,
  setNewMessage,
  handleSendMessage,
  markAsRead,
  deleteMessage,
  replyToMessage,
}) => {
  const getSenderRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Employee': 'bg-blue-500/20 text-blue-400',
      'Manager': 'bg-purple-500/20 text-purple-400',
      'HR': 'bg-pink-500/20 text-pink-400',
      'Super Admin': 'bg-indigo-500/20 text-indigo-400'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'General': 'bg-gray-500/20 text-gray-400',
      'HR': 'bg-pink-500/20 text-pink-400',
      'Payroll': 'bg-green-500/20 text-green-400',
      'IT': 'bg-blue-500/20 text-blue-400',
      'Leave': 'bg-yellow-500/20 text-yellow-400',
      'Other': 'bg-purple-500/20 text-purple-400'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Queries & Messages</h2>
          <p className={`text-sm ${tc.textSecondary}`}>View and respond to messages from employees, managers, and HR</p>
        </div>
        <button 
          onClick={() => setShowCompose(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          aria-label="Compose new message"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          Compose Message
        </button>
      </div>

      <ComposeMessage
        tc={tc}
        showCompose={showCompose}
        setShowCompose={setShowCompose}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      />

      <div className={`${tc.bgCard} p-4 rounded-2xl ${tc.border} ${tc.shadow} flex items-center justify-between flex-wrap gap-4`}>
        <div className="flex items-center gap-4">
          <div>
            <label className={`text-xs ${tc.textSecondary} block mb-1`}>Status</label>
            <select 
              className={`px-3 py-1.5 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'unread' | 'read')}
              aria-label="Filter messages by read status"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div>
            <label className={`text-xs ${tc.textSecondary} block mb-1`}>Category</label>
            <select 
              className={`px-3 py-1.5 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Message['category'] | 'all')}
              aria-label="Filter messages by category"
            >
              <option value="all">All Categories</option>
              <option value="General">General</option>
              <option value="HR">HR</option>
              <option value="Payroll">Payroll</option>
              <option value="IT">IT</option>
              <option value="Leave">Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className={`text-sm ${tc.textSecondary}`}>
          {filteredMessages.filter(m => !m.read).length} unread • {filteredMessages.length} total
        </div>
      </div>

      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className={`${tc.bgCard} p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
            <InboxIcon className={`w-12 h-12 ${tc.textMuted} mx-auto mb-3`} />
            <p className={tc.textSecondary}>No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${tc.bgCard} p-5 rounded-2xl ${tc.border} ${tc.shadow} ${!msg.read ? 'border-indigo-500/30 bg-indigo-500/5' : ''} hover:${tc.bgCardHover} transition-all cursor-pointer`}
              onClick={() => markAsRead(msg.id)}
              role="button"
              tabIndex={0}
              aria-label={`Message: ${msg.subject} from ${msg.sender}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  markAsRead(msg.id);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSenderRoleColor(msg.senderRole)}`}>
                      {msg.senderRole}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(msg.category)}`}>
                      {msg.category}
                    </span>
                    {!msg.read && (
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-medium animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                  <h3 className={`font-semibold ${tc.text}`}>{msg.subject}</h3>
                  <p className={`text-sm ${tc.textSecondary} mt-1`}>{msg.content}</p>
                  <div className={`mt-3 flex items-center gap-4 text-xs ${tc.textMuted}`}>
                    <span><strong className={tc.textSecondary}>From:</strong> {msg.sender}</span>
                    <span><strong className={tc.textSecondary}>To:</strong> {msg.receiver} ({msg.receiverRole})</span>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button 
                    className={`p-1.5 text-indigo-400 ${tc.bgTableHover} rounded-xl transition-colors`}
                    onClick={(e) => {
                      e.stopPropagation();
                      replyToMessage(msg);
                    }}
                    aria-label={`Reply to ${msg.sender} about ${msg.subject}`}
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                  <button 
                    className={`p-1.5 ${tc.textMuted} ${tc.bgTableHover} rounded-xl transition-colors hover:text-rose-400`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(msg.id);
                    }}
                    aria-label={`Delete message: ${msg.subject}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QueriesTab;