// src/pages/HRDashboard/components/queries/QueriesTab.tsx

import React from 'react';
import { PaperAirplaneIcon, InboxIcon } from '@heroicons/react/24/outline';
import { Message, ThemeClasses } from '../types';
import { MessageItem } from './MessageItem';

interface QueriesTabProps {
  messages: Message[];
  filteredMessages: Message[];
  themeClasses: ThemeClasses;
  selectedFilter: 'all' | 'unread' | 'read';
  selectedCategory: Message['category'] | 'all';
  onFilterChange: (filter: 'all' | 'unread' | 'read') => void;
  onCategoryChange: (category: Message['category'] | 'all') => void;
  onCompose: () => void;
  onReply: (message: Message) => void;
  onDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  getSenderRoleColor: (role: string) => string;
  getCategoryColor: (category: string) => string;
}

export const QueriesTab: React.FC<QueriesTabProps> = ({
  messages,
  filteredMessages,
  themeClasses,
  selectedFilter,
  selectedCategory,
  onFilterChange,
  onCategoryChange,
  onCompose,
  onReply,
  onDelete,
  onMarkAsRead,
  getSenderRoleColor,
  getCategoryColor
}) => {
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>Queries & Messages</h2>
          <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>View and respond to messages from employees, managers, and super admin</p>
        </div>
        <button 
          type="button"
          onClick={onCompose}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 sm:gap-2"
          aria-label="Compose new message"
        >
          <PaperAirplaneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          Compose Message
        </button>
      </div>

      {/* Filters */}
      <div className={`${themeClasses.bgCard} p-3 sm:p-4 rounded-2xl ${themeClasses.border} ${themeClasses.shadow} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4`}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none min-w-[100px]">
            <label className={`text-[10px] sm:text-xs ${themeClasses.textSecondary} block mb-0.5 sm:mb-1`}>Status</label>
            <select 
              className={`w-full px-2 sm:px-3 py-1 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={selectedFilter}
              onChange={(e) => onFilterChange(e.target.value as 'all' | 'unread' | 'read')}
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div className="flex-1 sm:flex-none min-w-[100px]">
            <label className={`text-[10px] sm:text-xs ${themeClasses.textSecondary} block mb-0.5 sm:mb-1`}>Category</label>
            <select 
              className={`w-full px-2 sm:px-3 py-1 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as Message['category'] | 'all')}
              aria-label="Filter by category"
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
        <div className={`text-[10px] sm:text-sm ${themeClasses.textSecondary} flex-shrink-0`}>
          {unreadCount} unread • {messages.length} total
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-2 sm:space-y-3">
        {filteredMessages.length === 0 ? (
          <div className={`${themeClasses.bgCard} p-8 sm:p-12 rounded-2xl ${themeClasses.border} ${themeClasses.shadow} text-center`}>
            <InboxIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${themeClasses.textMuted} mx-auto mb-3`} aria-hidden="true" />
            <p className={themeClasses.textSecondary}>No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              themeClasses={themeClasses}
              onReply={onReply}
              onDelete={onDelete}
              onMarkAsRead={onMarkAsRead}
              getSenderRoleColor={getSenderRoleColor}
              getCategoryColor={getCategoryColor}
            />
          ))
        )}
      </div>
    </div>
  );
};