// utils/themeUtils.ts
export const getThemeClasses = (theme: 'light' | 'dark') => {
  if (theme === 'dark') {
    return {
      // Base
      bg: 'bg-[#0a1628]',
      scrollbar: 'scrollbar-thumb-white/10 scrollbar-track-transparent',
      
      // Cards
      bgCard: 'bg-[#1a2744]',
      bgCardHover: 'hover:bg-[#243555]',
      border: 'border-white/10',
      shadow: 'shadow-xl shadow-black/20',
      
      // Text
      text: 'text-white',
      textSecondary: 'text-blue-200/70',
      textMuted: 'text-blue-300/50',
      
      // Inputs
      input: 'bg-[#0d1f3c] border-white/10 text-white placeholder:text-blue-300/40',
      
      // Tables
      tableHeader: 'bg-[#0d1f3c] text-blue-300/60',
      bgTableHover: 'hover:bg-[#243555]',
      
      // Badges
      badge: 'bg-indigo-500/20 text-indigo-400',
      
      // Timer
      timerBg: 'bg-[#0d1f3c]',
      timerText: 'text-blue-200',
      
      // Status
      statusActive: 'bg-emerald-500/20 text-emerald-400',
      statusInactive: 'bg-rose-500/20 text-rose-400',
      statusApproved: 'bg-emerald-500/20 text-emerald-400',
      statusPending: 'bg-amber-500/20 text-amber-400',
      statusRejected: 'bg-rose-500/20 text-rose-400',
      statusOnline: 'bg-emerald-500/20 text-emerald-400',
      statusOffline: 'bg-gray-500/20 text-gray-400',
      statusAway: 'bg-amber-500/20 text-amber-400',
      statusBusy: 'bg-rose-500/20 text-rose-400',
      
      // Chat
      bgChat: 'bg-[#0d1f3c]',
      messageSent: 'bg-indigo-500 text-white',
      messageReceived: 'bg-[#243555] text-white',
      
      // Buttons
      btnBg: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30',
      bgGray: 'bg-[#0d1f3c]',
      statusActiveBtn: 'bg-indigo-600 text-white',
      statusInactiveBtn: 'bg-[#0d1f3c] text-blue-200/70',
      
      // Senders
      senderEmployee: 'bg-blue-500/20 text-blue-400',
      senderManager: 'bg-purple-500/20 text-purple-400',
      senderHR: 'bg-pink-500/20 text-pink-400',
      senderSuperAdmin: 'bg-indigo-500/20 text-indigo-400',
      
      // Categories
      categoryGeneral: 'bg-gray-500/20 text-gray-400',
      categoryHR: 'bg-pink-500/20 text-pink-400',
      categoryPayroll: 'bg-green-500/20 text-green-400',
      categoryIT: 'bg-blue-500/20 text-blue-400',
      categoryLeave: 'bg-yellow-500/20 text-yellow-400',
      categoryOther: 'bg-purple-500/20 text-purple-400',
      
      // Tasks
      taskCard: 'bg-[#0d1f3c]',
      taskCardHover: 'hover:bg-[#1a2744]',
      
      // Images
      imagePreviewBg: 'bg-[#0d1f3c]',
      
      // Payslip Specific Classes
      payslipCard: 'bg-[#1a2744]',
      payslipCardHover: 'hover:bg-[#243555]',
      payslipCurrent: 'ring-2 ring-emerald-500/50',
      payslipHighlight: 'bg-emerald-500/5',
      
      // Filter Dropdowns
      filterActive: 'text-indigo-400 border-indigo-500/30',
      filterHighlight: 'bg-indigo-500/5',
      
      // Stats Cards
      statCard: 'bg-[#1a2744]',
      statCardHover: 'hover:bg-[#243555]',
      statIconBg: 'bg-indigo-500/10',
      
      // Status Badge Colors
      statusGenerated: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      statusProcessing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      statusPendingPayslip: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      
      // Priority Colors (for future use)
      priorityCritical: 'text-red-400 bg-red-500/20',
      priorityHigh: 'text-orange-400 bg-orange-500/20',
      priorityMedium: 'text-blue-400 bg-blue-500/20',
      priorityLow: 'text-gray-400 bg-gray-500/20',
      
      // Gradient Backgrounds
      gradientPrimary: 'bg-gradient-to-br from-[#0a1628] via-[#1a2744] to-[#0d1f3c]',
      gradientCard: 'bg-gradient-to-br from-[#1a2744] to-[#0d1f3c]',
      gradientEmerald: 'from-emerald-500 to-emerald-600',
      gradientIndigo: 'from-indigo-500 to-indigo-600',
      gradientPurple: 'from-purple-500 to-purple-600',
      
      // Hover Effects
      hoverScale: 'hover:scale-[1.02]',
      hoverShadow: 'hover:shadow-xl',
      hoverGlow: 'hover:shadow-emerald-500/40',
      
      // Animations
      animatePulse: 'animate-pulse',
      animateFadeIn: 'animate-fadeIn',
      animateSlideDown: 'animate-slideDown',
      
      // Misc
      glassEffect: 'backdrop-blur-sm',
      borderGlow: 'border-emerald-500/30',
      ringGlow: 'ring-2 ring-emerald-500/50',
    };
  }
  
  // Light theme
  return {
    // Base
    bg: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50/30',
    scrollbar: 'scrollbar-thumb-gray-200 scrollbar-track-transparent',
    
    // Cards
    bgCard: 'bg-white/80 backdrop-blur-sm',
    bgCardHover: 'hover:bg-gray-50/80',
    border: 'border-gray-200/50',
    shadow: 'shadow-lg shadow-indigo-500/5',
    
    // Text
    text: 'text-gray-800',
    textSecondary: 'text-gray-500',
    textMuted: 'text-gray-400',
    
    // Inputs
    input: 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
    
    // Tables
    tableHeader: 'bg-gray-50 text-gray-500',
    bgTableHover: 'hover:bg-gray-50',
    
    // Badges
    badge: 'bg-indigo-100 text-indigo-700',
    
    // Timer
    timerBg: 'bg-gray-50',
    timerText: 'text-gray-700',
    
    // Status
    statusActive: 'bg-green-100 text-green-700',
    statusInactive: 'bg-red-100 text-red-700',
    statusApproved: 'bg-green-100 text-green-700',
    statusPending: 'bg-yellow-100 text-yellow-700',
    statusRejected: 'bg-red-100 text-red-700',
    statusOnline: 'bg-green-100 text-green-700',
    statusOffline: 'bg-gray-100 text-gray-600',
    statusAway: 'bg-yellow-100 text-yellow-700',
    statusBusy: 'bg-red-100 text-red-700',
    
    // Chat
    bgChat: 'bg-gray-50',
    messageSent: 'bg-indigo-500 text-white',
    messageReceived: 'bg-white text-gray-800',
    
    // Buttons
    btnBg: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    bgGray: 'bg-gray-50',
    statusActiveBtn: 'bg-indigo-600 text-white',
    statusInactiveBtn: 'bg-gray-100 text-gray-600',
    
    // Senders
    senderEmployee: 'bg-blue-100 text-blue-700',
    senderManager: 'bg-purple-100 text-purple-700',
    senderHR: 'bg-pink-100 text-pink-700',
    senderSuperAdmin: 'bg-indigo-100 text-indigo-700',
    
    // Categories
    categoryGeneral: 'bg-gray-100 text-gray-700',
    categoryHR: 'bg-pink-100 text-pink-700',
    categoryPayroll: 'bg-green-100 text-green-700',
    categoryIT: 'bg-blue-100 text-blue-700',
    categoryLeave: 'bg-yellow-100 text-yellow-700',
    categoryOther: 'bg-purple-100 text-purple-700',
    
    // Tasks
    taskCard: 'bg-white',
    taskCardHover: 'hover:bg-gray-50',
    
    // Images
    imagePreviewBg: 'bg-gray-100',
    
    // Payslip Specific Classes
    payslipCard: 'bg-white/80 backdrop-blur-sm',
    payslipCardHover: 'hover:bg-gray-50/80',
    payslipCurrent: 'ring-2 ring-emerald-500/50',
    payslipHighlight: 'bg-emerald-500/5',
    
    // Filter Dropdowns
    filterActive: 'text-indigo-600 border-indigo-500/30',
    filterHighlight: 'bg-indigo-50/50',
    
    // Stats Cards
    statCard: 'bg-white/80 backdrop-blur-sm',
    statCardHover: 'hover:bg-gray-50/80',
    statIconBg: 'bg-indigo-100/50',
    
    // Status Badge Colors
    statusGenerated: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    statusProcessing: 'bg-amber-100 text-amber-700 border-amber-200',
    statusPendingPayslip: 'bg-blue-100 text-blue-700 border-blue-200',
    
    // Priority Colors (for future use)
    priorityCritical: 'text-red-600 bg-red-50',
    priorityHigh: 'text-orange-600 bg-orange-50',
    priorityMedium: 'text-blue-600 bg-blue-50',
    priorityLow: 'text-gray-600 bg-gray-50',
    
    // Gradient Backgrounds
    gradientPrimary: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50/50',
    gradientCard: 'bg-gradient-to-br from-white to-indigo-50/30',
    gradientEmerald: 'from-emerald-500 to-emerald-600',
    gradientIndigo: 'from-indigo-500 to-indigo-600',
    gradientPurple: 'from-purple-500 to-purple-600',
    
    // Hover Effects
    hoverScale: 'hover:scale-[1.02]',
    hoverShadow: 'hover:shadow-xl',
    hoverGlow: 'hover:shadow-emerald-500/25',
    
    // Animations
    animatePulse: 'animate-pulse',
    animateFadeIn: 'animate-fadeIn',
    animateSlideDown: 'animate-slideDown',
    
    // Misc
    glassEffect: 'backdrop-blur-sm',
    borderGlow: 'border-emerald-500/30',
    ringGlow: 'ring-2 ring-emerald-500/50',
  };
};