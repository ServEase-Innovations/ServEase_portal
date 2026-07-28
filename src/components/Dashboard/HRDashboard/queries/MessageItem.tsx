// src/pages/HRDashboard/components/queries/MessageItem.tsx

import React from 'react';
import { PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Message, ThemeClasses } from '../types';

interface MessageItemProps {
  message: Message;
  themeClasses: ThemeClasses;
  onReply: (message: Message) => void;
  onDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  getSenderRoleColor: (role: string) => string;
  getCategoryColor: (category: string) => string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  themeClasses,
  onReply,
  onDelete,
  onMarkAsRead,
  getSenderRoleColor,
  getCategoryColor
}) => {
  return (
    <div 
      className={`${themeClasses.bgCard} p-4 sm:p-5 rounded-2xl ${themeClasses.border} ${themeClasses.shadow} ${!message.read ? 'border-indigo-500/30 bg-indigo-500/5' : ''} ${themeClasses.bgCardHover} transition-all cursor-pointer`}
      onClick={() => onMarkAsRead(message.id)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onMarkAsRead(message.id)}
      aria-label={`Message from ${message.sender}: ${message.subject}`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getSenderRoleColor(message.senderRole)}`}>
              {message.senderRole}
            </span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getCategoryColor(message.category)}`}>
              {message.category}
            </span>
            {!message.read && (
              <span className="px-1.5 sm:px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[8px] sm:text-xs font-medium animate-pulse">
                New
              </span>
            )}
          </div>
          <h3 className={`font-semibold ${themeClasses.text} text-sm sm:text-base truncate`}>{message.subject}</h3>
          <p className={`text-xs sm:text-sm ${themeClasses.textSecondary} mt-0.5 sm:mt-1 line-clamp-2`}>{message.content}</p>
          <div className={`mt-1.5 sm:mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs ${themeClasses.textMuted}`}>
            <span><strong className={themeClasses.textSecondary}>From:</strong> {message.sender}</span>
            <span className="hidden sm:inline"><strong className={themeClasses.textSecondary}>To:</strong> {message.receiver}</span>
            <span>{message.timestamp}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button 
            type="button"
            className={`p-1.5 text-indigo-400 ${themeClasses.bgTableHover} rounded-xl transition-colors`}
            onClick={(e) => {
              e.stopPropagation();
              onReply(message);
            }}
            aria-label={`Reply to ${message.sender}`}
            title={`Reply to ${message.sender}`}
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          </button>
          <button 
            type="button"
            className={`p-1.5 ${themeClasses.textMuted} ${themeClasses.bgTableHover} rounded-xl transition-colors hover:text-rose-400`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(message.id);
            }}
            aria-label={`Delete message from ${message.sender}`}
            title={`Delete message from ${message.sender}`}
          >
            <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};