// tabs/QueriesTab.tsx
import React, { useState } from 'react';
import { getThemeClasses } from './themeUtils';
import {
  PaperAirplaneIcon,
  XCircleIcon,
  InboxIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface QueriesTabProps {
  theme: 'light' | 'dark';
  attendance: any;
}

interface Message {
  id: string;
  sender: string;
  senderRole: 'Employee' | 'Manager' | 'HR' | 'Super Admin';
  receiver: string;
  receiverRole: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  category: 'General' | 'HR' | 'Payroll' | 'IT' | 'Leave' | 'Other';
}

const QueriesTab: React.FC<QueriesTabProps> = ({ theme, attendance }) => {
  const tc = getThemeClasses(theme);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'MSG-001',
      sender: 'Priya Nair',
      senderRole: 'Manager',
      receiver: 'Rohan Verma',
      receiverRole: 'Employee',
      subject: 'Task Update - OAuth Migration',
      content: 'Great progress on the OAuth migration! Please create a PR for review by EOD.',
      timestamp: '2026-06-24 10:30',
      read: false,
      category: 'IT'
    },
    {
      id: 'MSG-002',
      sender: 'Aarav Mehta',
      senderRole: 'Super Admin',
      receiver: 'Rohan Verma',
      receiverRole: 'Employee',
      subject: 'Q3 Performance Goals',
      content: 'Please review and confirm your Q3 performance goals by end of this week.',
      timestamp: '2026-06-23 16:45',
      read: false,
      category: 'General'
    },
    {
      id: 'MSG-003',
      sender: 'Sanya Kapoor',
      senderRole: 'HR',
      receiver: 'Rohan Verma',
      receiverRole: 'Employee',
      subject: 'Health Insurance Renewal',
      content: 'Annual health insurance renewal documents are ready for your review.',
      timestamp: '2026-06-23 14:20',
      read: true,
      category: 'HR'
    },
    {
      id: 'MSG-004',
      sender: 'Ishita Roy',
      senderRole: 'Employee',
      receiver: 'Rohan Verma',
      receiverRole: 'Employee',
      subject: 'Code Review Request',
      content: 'Can you please review my PR for the auth flow changes?',
      timestamp: '2026-06-22 11:15',
      read: true,
      category: 'IT'
    }
  ]);

  const [newMessage, setNewMessage] = useState({
    receiver: '',
    subject: '',
    content: '',
    category: 'General' as Message['category']
  });
  const [showCompose, setShowCompose] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Message['category'] | 'all'>('all');

  const getSenderRoleColor = (role: string) => {
    const colors = {
      'Employee': tc.senderEmployee,
      'Manager': tc.senderManager,
      'HR': tc.senderHR,
      'Super Admin': tc.senderSuperAdmin
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'General': tc.categoryGeneral,
      'HR': tc.categoryHR,
      'Payroll': tc.categoryPayroll,
      'IT': tc.categoryIT,
      'Leave': tc.categoryLeave,
      'Other': tc.categoryOther
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const handleSendMessage = () => {
    if (!newMessage.receiver || !newMessage.subject || !newMessage.content) {
      alert('Please fill in all fields');
      return;
    }

    const message: Message = {
      id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
      sender: 'Rohan Verma',
      senderRole: 'Employee',
      receiver: newMessage.receiver,
      receiverRole: 'Employee',
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: new Date().toLocaleString(),
      read: false,
      category: newMessage.category
    };

    setMessages([message, ...messages]);
    setNewMessage({ receiver: '', subject: '', content: '', category: 'General' });
    setShowCompose(false);
  };

  const markAsRead = (id: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, read: true } : msg
      )
    );
  };

  const filteredMessages = messages.filter(msg => {
    const readFilter = selectedFilter === 'all' ? true : selectedFilter === 'unread' ? !msg.read : msg.read;
    const categoryFilter = selectedCategory === 'all' || msg.category === selectedCategory;
    return readFilter && categoryFilter;
  });

  const recipients = [
    { name: 'Priya Nair', role: 'Manager' },
    { name: 'Aarav Mehta', role: 'Super Admin' },
    { name: 'Sanya Kapoor', role: 'HR' },
    { name: 'Ishita Roy', role: 'Employee' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${tc.text}`}>Queries & Messages</h2>
          <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>View and respond to messages from your team and management</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowCompose(true)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 sm:gap-2"
        >
          <PaperAirplaneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Compose Message
        </button>
      </div>

      {showCompose && (
        <div className={`${tc.bgCard} p-4 sm:p-6 rounded-2xl ${tc.border} ${tc.shadow}`}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className={`font-semibold ${tc.text} text-base sm:text-lg`}>Compose New Message</h3>
            <button 
              type="button"
              onClick={() => setShowCompose(false)}
              className={`${tc.textMuted} hover:${tc.text}`}
              aria-label="Close compose message"
            >
              <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="message-recipient" className={`block text-xs sm:text-sm ${tc.textSecondary} mb-1`}>Recipient</label>
              <select
                id="message-recipient"
                className={`w-full px-3 py-1.5 sm:py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                value={newMessage.receiver}
                onChange={(e) => setNewMessage({ ...newMessage, receiver: e.target.value })}
              >
                <option value="">Select recipient</option>
                {recipients.map((r) => (
                  <option key={r.name} value={r.name}>{r.name} ({r.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="message-category" className={`block text-xs sm:text-sm ${tc.textSecondary} mb-1`}>Category</label>
              <select
                id="message-category"
                className={`w-full px-3 py-1.5 sm:py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                value={newMessage.category}
                onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value as Message['category'] })}
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
              <label className={`block text-xs sm:text-sm ${tc.textSecondary} mb-1`}>Subject</label>
              <input
                type="text"
                placeholder="Enter subject..."
                className={`w-full px-3 py-1.5 sm:py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              />
            </div>
            <div>
              <label className={`block text-xs sm:text-sm ${tc.textSecondary} mb-1`}>Message</label>
              <textarea
                rows={3}
                placeholder="Type your message here..."
                className={`w-full px-3 py-1.5 sm:py-2 ${tc.input} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none`}
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3">
              <button 
                type="button"
                onClick={() => setShowCompose(false)}
                className={`w-full sm:w-auto px-4 py-1.5 sm:py-2 ${tc.border} ${tc.textSecondary} rounded-xl text-sm font-medium ${tc.bgTableHover} transition-colors`}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSendMessage}
                className="w-full sm:w-auto px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                <PaperAirplaneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${tc.bgCard} p-3 sm:p-4 rounded-2xl ${tc.border} ${tc.shadow} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4`}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none min-w-[120px]">
            <label htmlFor="status-filter" className={`text-[10px] sm:text-xs ${tc.textSecondary} block mb-0.5 sm:mb-1`}>Status</label>
            <select
              id="status-filter"
              className={`w-full px-2 sm:px-3 py-1 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'unread' | 'read')}
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div className="flex-1 sm:flex-none min-w-[120px]">
            <label htmlFor="category-filter" className={`text-[10px] sm:text-xs ${tc.textSecondary} block mb-0.5 sm:mb-1`}>Category</label>
            <select
              id="category-filter"
              className={`w-full px-2 sm:px-3 py-1 ${tc.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Message['category'] | 'all')}
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
        <div className={`text-[10px] sm:text-sm ${tc.textSecondary} flex-shrink-0`}>
          {filteredMessages.filter(m => !m.read).length} unread • {filteredMessages.length} total
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {filteredMessages.length === 0 ? (
          <div className={`${tc.bgCard} p-8 sm:p-12 rounded-2xl ${tc.border} ${tc.shadow} text-center`}>
            <InboxIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${tc.textMuted} mx-auto mb-3`} />
            <p className={tc.textSecondary}>No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${tc.bgCard} p-4 sm:p-5 rounded-2xl ${tc.border} ${tc.shadow} ${!msg.read ? 'border-indigo-500/30 bg-indigo-500/5' : ''} ${tc.bgCardHover} transition-all cursor-pointer`}
              onClick={() => markAsRead(msg.id)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && markAsRead(msg.id)}
            >
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getSenderRoleColor(msg.senderRole)}`}>
                      {msg.senderRole}
                    </span>
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getCategoryColor(msg.category)}`}>
                      {msg.category}
                    </span>
                    {!msg.read && (
                      <span className="px-1.5 sm:px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[8px] sm:text-xs font-medium animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                  <h3 className={`font-semibold ${tc.text} text-sm sm:text-base truncate`}>{msg.subject}</h3>
                  <p className={`text-xs sm:text-sm ${tc.textSecondary} mt-0.5 sm:mt-1 line-clamp-2`}>{msg.content}</p>
                  <div className={`mt-1.5 sm:mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs ${tc.textMuted}`}>
                    <span><strong className={tc.textSecondary}>From:</strong> {msg.sender}</span>
                    <span className="hidden sm:inline"><strong className={tc.textSecondary}>To:</strong> {msg.receiver}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button 
                    type="button"
                    className={`p-1.5 text-indigo-400 ${tc.bgTableHover} rounded-xl transition-colors`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewMessage({ 
                        receiver: msg.sender, 
                        subject: `Re: ${msg.subject}`,
                        content: '',
                        category: msg.category
                      });
                      setShowCompose(true);
                    }}
                    aria-label={`Reply to ${msg.sender}`}
                    title={`Reply to ${msg.sender}`}
                  >
                    <PaperAirplaneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button 
                    type="button"
                    className={`p-1.5 ${tc.textMuted} ${tc.bgTableHover} rounded-xl transition-colors hover:text-rose-400`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this message?')) {
                        setMessages(messages.filter(m => m.id !== msg.id));
                      }
                    }}
                    aria-label={`Delete message ${msg.id}`}
                    title={`Delete message ${msg.id}`}
                  >
                    <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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