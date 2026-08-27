// src/components/Chat/chatTheme.ts
// Deliberately self-contained (doesn't import any single dashboard's theme
// file) so <ChatWindow /> can be dropped into Employee, Manager, HR, or
// SuperAdmin dashboards with just a `theme: 'light' | 'dark'` prop.
export const getChatTheme = (theme: 'light' | 'dark') => {
  if (theme === 'dark') {
    return {
      bgCard: 'bg-[#1a2744]',
      bgCardHover: 'hover:bg-[#243555]',
      border: 'border-white/10',
      shadow: 'shadow-xl shadow-black/20',
      text: 'text-white',
      textSecondary: 'text-blue-200/70',
      textMuted: 'text-blue-300/50',
      input: 'bg-[#0d1f3c] border-white/10 text-white placeholder:text-blue-300/40',
      messageSent: 'bg-indigo-500 text-white',
      messageReceived: 'bg-[#243555] text-white',
      panel: 'bg-[#0d1f3c]',
    };
  }
  return {
    bgCard: 'bg-white/80 backdrop-blur-sm',
    bgCardHover: 'hover:bg-gray-50/80',
    border: 'border-gray-200/50',
    shadow: 'shadow-lg shadow-indigo-500/5',
    text: 'text-gray-800',
    textSecondary: 'text-gray-500',
    textMuted: 'text-gray-400',
    input: 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
    messageSent: 'bg-indigo-500 text-white',
    messageReceived: 'bg-white text-gray-800',
    panel: 'bg-gray-50',
  };
};

export const getRoleBadgeClasses = (role: string, theme: 'light' | 'dark') => {
  const map: Record<string, { light: string; dark: string }> = {
    SuperAdmin: { light: 'bg-indigo-100 text-indigo-700', dark: 'bg-indigo-500/20 text-indigo-400' },
    Manager: { light: 'bg-purple-100 text-purple-700', dark: 'bg-purple-500/20 text-purple-400' },
    HR: { light: 'bg-pink-100 text-pink-700', dark: 'bg-pink-500/20 text-pink-400' },
    Developer: { light: 'bg-blue-100 text-blue-700', dark: 'bg-blue-500/20 text-blue-400' },
    Marketing: { light: 'bg-amber-100 text-amber-700', dark: 'bg-amber-500/20 text-amber-400' },
    CustomStaff: { light: 'bg-gray-100 text-gray-700', dark: 'bg-gray-500/20 text-gray-400' },
  };
  const entry = map[role] ?? map.CustomStaff;
  return theme === 'dark' ? entry.dark : entry.light;
};
