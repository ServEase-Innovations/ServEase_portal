// src/pages/HRDashboard/hooks/useTheme.ts

import { useState, useEffect } from 'react';
import { ThemeClasses } from '../types';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getThemeClasses = (): ThemeClasses => {
    if (theme === 'dark') {
      return {
        bg: 'bg-[#0a1628]',
        bgCard: 'bg-[#1a2744]',
        bgCardHover: 'hover:bg-[#243555]',
        bgInput: 'bg-[#0d1f3c]',
        bgTable: 'bg-[#1a2744]',
        bgTableHover: 'hover:bg-[#243555]',
        border: 'border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        shadow: 'shadow-xl shadow-black/20',
        gradient: 'bg-gradient-to-br from-[#0a1628] via-[#1a2744] to-[#0d1f3c]',
        cardGradient: 'bg-gradient-to-br from-[#1a2744] to-[#0d1f3c]',
        statBg: 'bg-[#0d1f3c]',
        input: 'bg-[#0d1f3c] border-white/10 text-white placeholder:text-blue-300/40',
        tableHeader: 'bg-[#0d1f3c] text-blue-300/60',
        badge: 'bg-indigo-500/20 text-indigo-400',
        scrollbar: 'scrollbar-thumb-white/10 scrollbar-track-transparent',
        statusActive: 'bg-green-500/20 text-green-400',
        statusPending: 'bg-yellow-500/20 text-yellow-400',
        statusApproved: 'bg-green-500/20 text-green-400',
        statusRejected: 'bg-red-500/20 text-red-400',
        statusLive: 'bg-green-500/20 text-green-400',
        statusDraft: 'bg-gray-500/20 text-gray-400',
        statusNational: 'bg-blue-500/20 text-blue-400',
        statusRegional: 'bg-purple-500/20 text-purple-400',
        statusOptional: 'bg-gray-500/20 text-gray-400',
        leaveCasual: 'bg-blue-500/20 text-blue-400',
        leaveSick: 'bg-red-500/20 text-red-400',
        leaveEarned: 'bg-green-500/20 text-green-400',
        leaveCompOff: 'bg-purple-500/20 text-purple-400',
        leaveMaternity: 'bg-pink-500/20 text-pink-400',
        timerBg: 'bg-[#0d1f3c]',
        btnBg: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50/30',
      bgCard: 'bg-white/80 backdrop-blur-sm',
      bgCardHover: 'hover:bg-gray-50/80',
      bgInput: 'bg-gray-50',
      bgTable: 'bg-white',
      bgTableHover: 'hover:bg-gray-50',
      border: 'border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      shadow: 'shadow-lg shadow-indigo-500/5',
      gradient: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50/50',
      cardGradient: 'bg-gradient-to-br from-white to-indigo-50/30',
      statBg: 'bg-white',
      input: 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
      tableHeader: 'bg-gray-50 text-gray-500',
      badge: 'bg-indigo-100 text-indigo-700',
      scrollbar: 'scrollbar-thumb-gray-200 scrollbar-track-transparent',
      statusActive: 'bg-green-100 text-green-700',
      statusPending: 'bg-yellow-100 text-yellow-700',
      statusApproved: 'bg-green-100 text-green-700',
      statusRejected: 'bg-red-100 text-red-700',
      statusLive: 'bg-green-100 text-green-700',
      statusDraft: 'bg-gray-100 text-gray-700',
      statusNational: 'bg-blue-100 text-blue-700',
      statusRegional: 'bg-purple-100 text-purple-700',
      statusOptional: 'bg-gray-100 text-gray-700',
      leaveCasual: 'bg-blue-100 text-blue-700',
      leaveSick: 'bg-red-100 text-red-700',
      leaveEarned: 'bg-green-100 text-green-700',
      leaveCompOff: 'bg-purple-100 text-purple-700',
      leaveMaternity: 'bg-pink-100 text-pink-700',
      timerBg: 'bg-gray-50',
      btnBg: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    };
  };

  return { theme, toggleTheme, getThemeClasses };
};