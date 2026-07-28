// src/pages/HRDashboard/components/announcements/AnnouncementsTab.tsx

import React from 'react';
import { MegaphoneIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Announcement, ThemeClasses } from '../types';

interface AnnouncementsTabProps {
  announcements: Announcement[];
  themeClasses: ThemeClasses;
  getStatusColor: (status: string) => string;
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({
  announcements,
  themeClasses,
  getStatusColor
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold ${themeClasses.text}`}>Announcements</h2>
          <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>Broadcast company-wide updates</p>
        </div>
        <button 
          type="button"
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 sm:gap-2"
          aria-label="Create new announcement"
        >
          <MegaphoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Create Announcement Form */}
        <div className={`lg:col-span-1 ${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow}`}>
          <h3 className={`font-semibold ${themeClasses.text} mb-3 sm:mb-4 text-base sm:text-lg`}>Create Announcement</h3>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className={`block text-xs sm:text-sm ${themeClasses.textSecondary} mb-1`}>Announcement title</label>
              <input
                type="text"
                placeholder="Enter title..."
                className={`w-full px-3 py-1.5 sm:py-2 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                aria-label="Announcement title"
              />
            </div>
            <div>
              <label className={`block text-xs sm:text-sm ${themeClasses.textSecondary} mb-1`}>Content</label>
              <textarea
                rows={4}
                placeholder="Share the details..."
                className={`w-full px-3 py-1.5 sm:py-2 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none`}
                aria-label="Announcement content"
              />
            </div>
            <div>
              <label className={`block text-xs sm:text-sm ${themeClasses.textSecondary} mb-1`}>Audience</label>
              <select 
                className={`w-full px-3 py-1.5 sm:py-2 ${themeClasses.input} rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                aria-label="Select audience for announcement"
              >
                <option>All</option>
                <option>Leadership</option>
                <option>Platform Team</option>
                <option>Product Team</option>
              </select>
            </div>
            <button 
              type="button"
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              aria-label="Publish announcement"
            >
              <MegaphoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              Publish
            </button>
          </div>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className={`${themeClasses.bgCard} p-4 sm:p-6 rounded-2xl ${themeClasses.border} ${themeClasses.shadow} ${themeClasses.bgCardHover} transition-all duration-300`}>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <h3 className={`font-semibold ${themeClasses.text} text-sm sm:text-base truncate`}>{announcement.title}</h3>
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-xs font-medium ${getStatusColor(announcement.status)} flex-shrink-0`}>
                      {announcement.status}
                    </span>
                    <span className={`text-[8px] sm:text-xs ${themeClasses.textMuted} flex-shrink-0`}>{announcement.id}</span>
                  </div>
                  <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>{announcement.content}</p>
                  <div className={`mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-[8px] sm:text-xs ${themeClasses.textMuted}`}>
                    <span>By: {announcement.author}</span>
                    <span>{announcement.date}</span>
                    <span className={`px-1.5 sm:px-2 py-0.5 ${themeClasses.bgTableHover} rounded-full`}>{announcement.audience}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button 
                    type="button"
                    className={`p-1 ${themeClasses.bgTableHover} rounded transition-colors`}
                    aria-label={`Edit announcement ${announcement.title}`}
                    title={`Edit announcement ${announcement.title}`}
                  >
                    <PencilIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${themeClasses.textMuted}`} aria-hidden="true" />
                  </button>
                  <button 
                    type="button"
                    className={`p-1 ${themeClasses.bgTableHover} rounded transition-colors`}
                    aria-label={`View announcement ${announcement.title}`}
                    title={`View announcement ${announcement.title}`}
                  >
                    <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};