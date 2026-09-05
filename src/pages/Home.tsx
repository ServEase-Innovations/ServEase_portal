// src/pages/Home.tsx - Updated with responsive design, mobile-friendly login popup,
// and a theme-aware "jelly" cursor-tracking interaction layer.
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginPanel from './LoginPanel';
import { 
  SunIcon, 
  MoonIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  SparklesIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UsersIcon,
  BuildingOffice2Icon,
  CpuChipIcon,
  CreditCardIcon,
  ChartPieIcon,
  FolderIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const mainContentRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cursor-tracking "jelly" glow. Runs entirely off React state (direct DOM
  // writes via rAF) so mouse movement never triggers a re-render. Skipped
  // for touch devices and when the user prefers reduced motion.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (prefersReducedMotion || !supportsFineHover) return;

    // Determine glow size based on viewport width
    let glowSize: number;
    if (window.innerWidth < 640) {
      glowSize = 180;
    } else if (window.innerWidth < 1024) {
      glowSize = 240;
    } else {
      glowSize = 320;
    }

    const target = { x: -glowSize, y: -glowSize };
    const current = { x: -glowSize, y: -glowSize };
    let prevX = current.x;
    let prevY = current.y;
    let rafId: number;
    let hasMoved = false;

    const handleMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      hasMoved = true;
    };
    window.addEventListener('mousemove', handleMove, { passive: true });

    const animate = () => {
      // Elastic follow: the blob lags behind the real cursor and springs
      // toward it, which combined with the velocity-based stretch below
      // is what reads as "jelly" rather than a rigid dot. A slightly
      // looser follow factor exaggerates the trailing wobble.
      current.x += (target.x - current.x) * 0.1;
      current.y += (target.y - current.y) * 0.1;

      const dx = current.x - prevX;
      const dy = current.y - prevY;
      const speed = Math.min(Math.hypot(dx, dy), 50);
      const stretch = 1 + speed * 0.026;
      const squish = 1 - speed * 0.015;
      prevX = current.x;
      prevY = current.y;

      if (cursorGlowRef.current && hasMoved) {
        cursorGlowRef.current.style.opacity = '1';
        cursorGlowRef.current.style.transform =
          `translate3d(${current.x - glowSize / 2}px, ${current.y - glowSize / 2}px, 0) scale(${stretch}, ${squish})`;
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const openLogin = () => {
    setIsLoginOpen(true);
    if (isMobile) {
      document.body.style.overflow = 'hidden';
    }
    if (mainContentRef.current) {
      const scrollY = window.scrollY;
      mainContentRef.current.dataset.scrollY = String(scrollY);
    }
  };

  const closeLogin = () => {
    setIsLoginOpen(false);
    if (isMobile) {
      document.body.style.overflow = 'unset';
    }
    if (mainContentRef.current && mainContentRef.current.dataset.scrollY) {
      const scrollY = parseInt(mainContentRef.current.dataset.scrollY);
      window.scrollTo(0, scrollY);
    }
  };

  const features = [
    {
      icon: CalendarIcon,
      title: 'Smart Attendance',
      description: 'Calendar view, work-from-home, half-day and leave tracking with real-time work hour analytics.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Task & Jira Sync',
      description: 'Submit daily updates, link Jira tickets and keep managers in the loop without status meetings.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: DocumentTextIcon,
      title: 'Payroll & Payslips',
      description: 'Auto-generated branded payslips, salary breakdowns, bonus and deduction workflows.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: SparklesIcon,
      title: 'Performance Insights',
      description: 'Productivity scores, attendance trends, team contribution and appraisal recommendations.',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      icon: UsersIcon,
      title: 'Team Collaboration',
      description: 'Org-wide teams, project assignments and clear ownership across every initiative.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Role-based Access',
      description: 'Super Admin, Manager and Employee workflows with granular permissions out of the box.',
      gradient: 'from-red-500 to-rose-500'
    }
  ];

  const stats = [
    { value: '12K+', label: 'EMPLOYEES MANAGED', icon: UsersIcon },
    { value: '99.98%', label: 'PLATFORM UPTIME', icon: CpuChipIcon },
    { value: '4.9/5', label: 'EMPLOYEE CSAT', icon: ChartPieIcon },
    { value: '47', label: 'ENTERPRISE CLIENTS', icon: BuildingOffice2Icon }
  ];

  const whyFeatures = [
    { icon: UsersIcon, title: 'ORG-WIDE', subtitle: 'Multi-team', gradient: 'from-blue-500 to-cyan-500' },
    { icon: ShieldCheckIcon, title: 'SECURITY', subtitle: 'RBAC + 2FA ready', gradient: 'from-purple-500 to-pink-500' },
    { icon: ChartBarIcon, title: 'ANALYTICS', subtitle: 'Live KPIs', gradient: 'from-green-500 to-emerald-500' },
    { icon: CreditCardIcon, title: 'PAYROLL', subtitle: 'Auto payslips', gradient: 'from-orange-500 to-amber-500' }
  ];

  const navItems = ['Features', 'Why ServEase', 'Numbers'];

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-b from-sky-100 via-blue-100/60 to-indigo-100/40'
    }`}>
      {/* Global jelly-hover interaction styles. Kept in one place rather than
          scattered inline animations so the bounce curve stays consistent
          everywhere it's used. */}
      <style>{`
        @keyframes jellyPop {
          0%   { transform: scale(1, 1); }
          30%  { transform: scale(1.12, 0.9); }
          50%  { transform: scale(0.94, 1.08); }
          70%  { transform: scale(1.04, 0.97); }
          100% { transform: scale(1, 1); }
        }
        .jelly-hover { transition: transform 0.2s ease; }
        .jelly-hover:hover,
        .jelly-hover:focus-visible {
          animation: jellyPop 0.55s cubic-bezier(0.36, 1.7, 0.3, 1);
        }
        .group:hover .jelly-child {
          animation: jellyPop 0.55s cubic-bezier(0.36, 1.7, 0.3, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .jelly-hover:hover, .jelly-hover:focus-visible, .group:hover .jelly-child {
            animation: none;
          }
        }
      `}</style>

      {/* Cursor-tracking jelly glow - color/blend tuned per theme, ignored
          entirely on touch devices and reduced-motion setups (see effect
          above). Sits behind all content (z-0) so it never blocks clicks
          or dims text. */}
      <div
        ref={cursorGlowRef}
        className="fixed top-0 left-0 z-0 w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] lg:w-[320px] lg:h-[320px] rounded-full pointer-events-none will-change-transform opacity-0 transition-opacity duration-500"
        style={{
          background: isDarkMode
            ? 'radial-gradient(circle, rgba(147,158,255,0.65) 0%, rgba(129,140,248,0.38) 28%, rgba(99,102,241,0.16) 52%, transparent 78%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.45) 0%, rgba(99,102,241,0.28) 28%, rgba(56,189,248,0.12) 52%, transparent 78%)',
          mixBlendMode: isDarkMode ? 'screen' : 'multiply',
        }}
      />

      {/* Animated Background - Made responsive */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 rounded-full blur-3xl animate-pulse ${
          isDarkMode 
            ? 'bg-blue-500/10' 
            : 'bg-gradient-to-br from-blue-300/50 to-indigo-300/40'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
          isDarkMode 
            ? 'bg-purple-500/10' 
            : 'bg-gradient-to-br from-purple-300/40 to-pink-300/30'
        }`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] rounded-full blur-3xl animate-pulse delay-2000 ${
          isDarkMode 
            ? 'bg-indigo-500/5' 
            : 'bg-gradient-to-br from-indigo-200/30 to-purple-200/30'
        }`} />
      </div>

      {/* Navigation Bar - Mobile Responsive */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? `${isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-sky-100/50'}` 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center -ml-1 sm:-ml-2">
            <div className="jelly-hover w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mr-2 sm:mr-3 shadow-lg shadow-blue-500/25 cursor-pointer overflow-hidden bg-white/80">
              <img
                src="/logo.png"
                alt="ServEase logo"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <h1 className="leading-none tracking-[-0.04em]">
                <span
                  className={`block text-[0.72rem] sm:text-[0.9rem] font-black uppercase tracking-[0.12em] bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 ${
                    isDarkMode
                      ? 'from-white via-blue-100 to-blue-300'
                      : 'from-[#0a1744] via-[#152d68] to-blue-700'
                  }`}
                >
                  ServEase Innovations
                </span>
                <span
                  className={`mt-0.5 block text-[0.78rem] sm:text-[1rem] font-semibold tracking-[0.16em] bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 ${
                    isDarkMode
                      ? 'from-blue-200 via-sky-200 to-white'
                      : 'from-[#1d4ed8] via-[#2563eb] to-[#0f172a]'
                  }`}
                >
                  Employee Portal
                </span>
              </h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item, index) => (
              <a 
                key={index}
                href={`#${item.toLowerCase().replace(' ', '')}`}
                className={`jelly-hover inline-block text-sm font-medium transition-all duration-300 relative group ${
                  isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <span>{item}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={toggleTheme}
              className={`jelly-hover p-1.5 sm:p-2 rounded-full transition-all duration-300 active:scale-95 ${
                isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'
              }`}
            >
              {isDarkMode ? (
                <SunIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 transition-transform duration-300 hover:rotate-90" />
              ) : (
                <MoonIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 transition-transform duration-300 hover:rotate-90" />
              )}
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`jelly-hover md:hidden p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>

            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="jelly-hover relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 inline-flex items-center group overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  <span className="hidden sm:inline">Open Portal</span>
                  <span className="sm:hidden">Portal</span>
                  <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-all duration-300" />
                </span>
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
              </button>
            ) : (
              <button
                onClick={openLogin}
                className="jelly-hover relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 inline-flex items-center group overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  <span className="hidden sm:inline">Open Portal</span>
                  <span className="sm:hidden">Login</span>
                  <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-all duration-300" />
                </span>
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className={`px-4 py-3 space-y-2 border-t ${
            isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/90 backdrop-blur-xl border-sky-100/50'
          }`}>
            {navItems.map((item, index) => (
              <a
                key={index}
                href={`#${item.toLowerCase().replace(' ', '')}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium transition-all duration-300 ${
                  isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content with Split Layout */}
      <div className="pt-20 sm:pt-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className={`flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 transition-all duration-700 ease-in-out ${
            isLoginOpen && !isMobile ? 'lg:gap-6' : ''
          }`}>
            {/* Left Content - Main Page Content */}
            <div 
              ref={mainContentRef}
              className={`flex-1 transition-all duration-700 ease-in-out ${
                isLoginOpen && !isMobile ? 'lg:max-w-[55%]' : 'lg:max-w-full'
              }`}
            >
              {/* Hero Section - Mobile Responsive */}
              <section className="py-4 sm:py-6 md:py-8">
                <div className="text-center max-w-5xl mx-auto">
                  <div className={`jelly-hover inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 border backdrop-blur-sm transition-all duration-300 cursor-default ${
                    isDarkMode 
                      ? 'bg-blue-900/20 border-blue-800 hover:bg-blue-900/30' 
                      : 'bg-white/70 border-sky-200/50 shadow-sm shadow-sky-200/20 hover:bg-white/90 hover:shadow-lg'
                  }`}>
                    <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 animate-pulse" />
                    <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      People, performance & payroll — unified
                    </span>
                  </div>
                  <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Your Complete Workforce Platform{' '}
                    <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Built for Modern Teams
                    </span>
                  </h1>
                  <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} mb-6 sm:mb-10 max-w-3xl mx-auto leading-relaxed transition-all duration-300 px-2`}>
                    Transform how your team works with an all-in-one platform for attendance, task management, 
                    payroll, and real-time collaboration. Designed for enterprises, loved by employees.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
                    <button
                      onClick={openLogin}
                      className="jelly-hover relative group bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 inline-flex items-center overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative flex items-center">
                        Try Demo Portal - No Signup
                        <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 group-hover:translate-x-1 transition-all duration-300" />
                      </span>
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                    </button>
                    <a 
                      href="#features"
                      className={`jelly-hover relative group border-2 px-5 sm:px-8 py-3 sm:py-4 rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 overflow-hidden inline-block ${
                        isDarkMode 
                          ? 'border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500' 
                          : 'border-sky-200 text-blue-600 hover:bg-sky-50/50 hover:border-sky-300'
                      }`}
                    >
                      <span className="relative">Explore Features</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </div>

                  {/* Trust indicators */}
                  <div className={`flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span>Free Demo Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                      <span>Enterprise Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-purple-500" />
                      <span>12K+ Users</span>
                    </div>
                  </div>

                  {/* Feature Tags - Mobile Responsive */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 max-w-2xl mx-auto">
                    {[
                      { icon: CheckCircleIcon, label: 'No setup required' },
                      { icon: UserGroupIcon, label: 'Role-based access' },
                      { icon: SunIcon, label: 'Dark & light mode' },
                      { icon: ChartBarIcon, label: 'Mobile responsive' }
                    ].map((feature, idx) => (
                      <div 
                        key={idx} 
                        className={`jelly-hover flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm border backdrop-blur-sm transition-all duration-300 hover:shadow-lg cursor-default text-xs sm:text-sm ${
                          isDarkMode 
                            ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600' 
                            : 'bg-white/80 border-sky-200/50 text-gray-600 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                        }`}
                      >
                        <feature.icon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                        <span className="font-medium">{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Cards - Mobile Responsive */}
                <div className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto">
                  {[
                    { label: 'TODAY', value: "Rohan's workspace", icon: CalendarIcon, gradient: 'from-blue-500 to-cyan-500' },
                    { label: 'HOURS', value: '6.4h', icon: ClockIcon, gradient: 'from-purple-500 to-pink-500' },
                    { label: 'TASKS', value: '12', icon: ChartBarIcon, gradient: 'from-green-500 to-emerald-500' },
                    { label: 'STREAK', value: '23d', icon: CheckCircleIcon, gradient: 'from-orange-500 to-amber-500' }
                  ].map((stat, index) => (
                    <div 
                      key={index} 
                      className={`group p-3 sm:p-4 md:p-6 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer ${
                        isDarkMode 
                          ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800 hover:border-slate-600' 
                          : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
                            {stat.label}
                          </p>
                          <p className={`text-sm sm:text-base md:text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'} mt-0.5 sm:mt-1`}>
                            {stat.value}
                          </p>
                        </div>
                        <div className={`jelly-child p-2 sm:p-3 bg-gradient-to-r ${stat.gradient} rounded-xl text-white shadow-lg`}>
                          <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Section - Mobile Responsive */}
                <div className="mt-8 sm:mt-12 max-w-2xl mx-auto">
                  <div className={`p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${
                    isDarkMode 
                      ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800' 
                      : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                      <div>
                        <h3 className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Today's progress</h3>
                        <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>80% complete</p>
                      </div>
                      <div className="jelly-hover w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base sm:text-lg md:text-xl shadow-lg shadow-blue-500/25 cursor-default">
                        80%
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        { task: 'OAuth 2.1 migration', status: 'In Progress', color: 'blue' },
                        { task: 'Payroll PDF service', status: 'Review', color: 'yellow' },
                        { task: 'Payroll PDF service', status: 'Done', color: 'green' }
                      ].map((item, index) => (
                        <div 
                          key={index} 
                          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer gap-2 sm:gap-0 ${
                            isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-sky-50/50 hover:bg-sky-50'
                          }`}
                        >
                          <span className={`text-sm sm:text-base font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.task}</span>
                          <span className={`jelly-hover text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full transition-all duration-300 ${
                            item.color === 'blue' 
                              ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50' 
                              : item.color === 'yellow' 
                              ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' 
                              : 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                      isDarkMode 
                        ? 'bg-green-900/20 border-green-800 hover:bg-green-900/30' 
                        : 'bg-green-50/80 border-green-200/50 backdrop-blur-sm hover:bg-green-50'
                    }`}>
                      <span className={`text-sm sm:text-base font-medium transition-colors duration-300 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>May payslip ready</span>
                      <span className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>₹1,02,450</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features Section - Mobile Responsive */}
              <section id="features" className={`py-8 sm:py-12 md:py-16 transition-all duration-500 ${
                isDarkMode ? 'bg-slate-800/50' : 'bg-gradient-to-b from-sky-100/30 via-blue-50/40 to-transparent'
              }`}>
                <div className="container mx-auto">
                  <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
                    <div className={`jelly-hover inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 border backdrop-blur-sm transition-all duration-300 cursor-default ${
                      isDarkMode 
                        ? 'bg-purple-900/20 border-purple-800 hover:bg-purple-900/30' 
                        : 'bg-white/70 border-purple-200/50 shadow-sm shadow-purple-200/20 hover:bg-white/90 hover:shadow-lg'
                    }`}>
                      <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                      <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Platform</span>
                    </div>
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Everything Your Team Needs, All in One Place
                    </h2>
                    <p className={`text-base sm:text-lg transition-all duration-300 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} px-2`}>
                      From attendance tracking to payroll automation, we've got you covered with features 
                      that make work easier for everyone.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((feature, index) => (
                      <div 
                        key={index}
                        className={`group p-4 sm:p-6 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer ${
                          isDarkMode 
                            ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800 hover:border-slate-600' 
                            : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                        }`}
                      >
                        <div className={`jelly-child p-2 sm:p-3 bg-gradient-to-r ${feature.gradient} rounded-xl text-white w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center mb-3 sm:mb-4 shadow-lg`}>
                          <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                        </div>
                        <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
                          {feature.title}
                        </h3>
                        <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-600 group-hover:text-gray-700'}`}>
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Why ServEase Section - Mobile Responsive */}
              <section id="why" className={`py-8 sm:py-12 md:py-16 transition-all duration-500 ${
                isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-b from-sky-100/20 via-blue-50/30 to-transparent'
              }`}>
                <div className="container mx-auto">
                  <div className="text-center max-w-4xl mx-auto">
                    <div className={`jelly-hover inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 border backdrop-blur-sm transition-all duration-300 cursor-default ${
                      isDarkMode 
                        ? 'bg-indigo-900/20 border-indigo-800 hover:bg-indigo-900/30' 
                        : 'bg-white/70 border-indigo-200/50 shadow-sm shadow-indigo-200/20 hover:bg-white/90 hover:shadow-lg'
                    }`}>
                      <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                      <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Why ServEase</span>
                    </div>
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Why Leading Companies Choose ServEase
                    </h2>
                    <p className={`text-base sm:text-lg ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed transition-all duration-300 px-2`}>
                      Built with enterprise-grade security and designed for modern workforces. 
                      Experience the difference that thoughtful design makes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    <div className={`p-4 sm:p-6 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      isDarkMode 
                        ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800' 
                        : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                    }`}>
                      <ul className="space-y-3 sm:space-y-4">
                        {[
                          'Premium UI with glassmorphism, animations and micro-interactions',
                          'Battle-tested role hierarchy — Super Admin, Manager, Employee',
                          'Built-in payroll PDF generator with company branding',
                          'Dark & light modes, responsive on every device'
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 sm:gap-3 group cursor-pointer transition-all duration-300 hover:translate-x-2">
                            <CheckCircleIcon className="jelly-child w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className={`text-sm sm:text-base transition-colors duration-300 ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {whyFeatures.map((item, index) => (
                        <div 
                          key={index}
                          className={`group p-3 sm:p-4 md:p-6 rounded-2xl shadow-lg border text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer ${
                            isDarkMode 
                              ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800 hover:border-slate-600' 
                              : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                          }`}
                        >
                          <div className={`jelly-child p-2 sm:p-3 bg-gradient-to-r ${item.gradient} rounded-xl text-white w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                            <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h4 className={`text-xs sm:text-sm md:text-base font-bold transition-colors duration-300 ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
                            {item.title}
                          </h4>
                          <p className={`text-[10px] sm:text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
                            {item.subtitle}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Numbers Section - Mobile Responsive */}
              <section id="numbers" className={`py-8 sm:py-12 md:py-16 transition-all duration-500 ${
                isDarkMode ? 'bg-slate-800/50' : 'bg-gradient-to-b from-sky-100/20 via-indigo-50/30 to-transparent'
              }`}>
                <div className="container mx-auto">
                  <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
                    <div className={`jelly-hover inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 border backdrop-blur-sm transition-all duration-300 cursor-default ${
                      isDarkMode 
                        ? 'bg-green-900/20 border-green-800 hover:bg-green-900/30' 
                        : 'bg-white/70 border-green-200/50 shadow-sm shadow-green-200/20 hover:bg-white/90 hover:shadow-lg'
                    }`}>
                      <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Numbers</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
                    {stats.map((stat, index) => (
                      <div 
                        key={index}
                        className={`group p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border backdrop-blur-xl text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer ${
                          isDarkMode 
                            ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800 hover:border-slate-600' 
                            : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                        }`}
                      >
                        <div className="flex justify-center mb-2 sm:mb-4">
                          <div className="jelly-child p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white">
                            <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          </div>
                        </div>
                        <p className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2 transition-all duration-300 group-hover:scale-105`}>
                          {stat.value}
                        </p>
                        <p className={`text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CTA Section - Mobile Responsive */}
                  <div className="mt-8 sm:mt-12 md:mt-16 max-w-3xl mx-auto">
                    <div className={`p-6 sm:p-8 md:p-10 rounded-3xl shadow-xl border backdrop-blur-xl text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-slate-600 hover:from-slate-800 hover:to-slate-700' 
                        : 'bg-gradient-to-br from-sky-100/60 via-blue-50/80 to-indigo-50/60 border-sky-200/50 shadow-sky-200/20 hover:bg-gradient-to-br hover:from-sky-100 hover:via-blue-50 hover:to-indigo-50'
                    }`}>
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-full blur-3xl" />
                      
                      <div className="relative z-10">
                        <div className={`jelly-hover inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border backdrop-blur-sm ${
                          isDarkMode 
                            ? 'bg-blue-900/20 border-blue-800' 
                            : 'bg-white/70 border-blue-200/50'
                        }`}>
                          <SparklesIcon className="w-4 h-4 text-blue-500 animate-pulse" />
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            Ready to transform your workplace?
                          </span>
                        </div>
                        
                        <h3 className={`text-2xl sm:text-3xl font-bold mb-3 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          Experience the Future of Work Management
                        </h3>
                        <p className={`text-sm sm:text-base transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} mb-6 max-w-2xl mx-auto`}>
                          Join thousands of companies already using ServEase to streamline their operations.
                          Try our interactive demo - no signup, no credit card required.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                          <button
                            onClick={openLogin}
                            className="jelly-hover relative group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 overflow-hidden w-full sm:w-auto justify-center"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <span className="relative flex items-center">
                              Launch Demo Portal
                              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-all duration-300" />
                            </span>
                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                          </button>
                          <a
                            href="#features"
                            className={`jelly-hover inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 w-full sm:w-auto justify-center ${
                              isDarkMode 
                                ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' 
                                : 'bg-white/80 text-gray-700 hover:bg-white'
                            }`}
                          >
                            Learn More
                          </a>
                        </div>
                        
                        {/* Trust badges */}
                        <div className="mt-6 pt-6 border-t border-gray-300/20">
                          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Instant Access</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Bank-Grade Security</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UsersIcon className="w-4 h-4 text-purple-500" />
                              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Trusted by 47 Companies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer - Mobile Responsive */}
              <footer className={`py-6 sm:py-8 md:py-10 border-t transition-all duration-500 ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white/60 backdrop-blur-sm border-sky-200/50'
              }`}>
                <div className="container mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <div className="flex items-center group cursor-pointer">
                      <div className="jelly-child w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-sm sm:text-base font-bold transition-colors duration-300 ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
                          ServEase
                        </p>
                        <p className={`text-[8px] sm:text-[10px] transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          INNOVATION PVT LTD
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-600 hover:text-gray-800'}`}>
                        © 2026 ServEase Innovation Private Limited. All rights reserved.
                      </p>
                      <p className={`text-[10px] sm:text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-500 hover:text-slate-400' : 'text-gray-400 hover:text-gray-600'} mt-1`}>
                        Tower B, Cyber Hub, Gurugram, Haryana 122002, India
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`jelly-hover flex items-center gap-1 text-[10px] sm:text-xs transition-all duration-300 ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'}`}>
                        <GlobeAltIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>ENG</span>
                        <span className="mx-0.5 sm:mx-1">|</span>
                        <span>IN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>

            {/* Login Panel - Desktop side panel, Mobile popup */}
            <LoginPanel 
              isOpen={isLoginOpen}
              onClose={closeLogin}
              isDarkMode={isDarkMode}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>

      {/* Weather & Search Bar - Bottom Right - Mobile Responsive */}
      <div className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg border backdrop-blur-xl z-40 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800' 
          : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-lg'
      }`}>
        <div className="flex items-center gap-1 sm:gap-2 group cursor-pointer">
          <SunIcon className="jelly-child w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
          <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-700 group-hover:text-blue-600'}`}>
            31°C
          </span>
          <span className={`text-[10px] sm:text-xs transition-colors duration-300 hidden xs:inline ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
            Partly sunny
          </span>
        </div>
        <div className={`w-px h-4 sm:h-6 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
        <div className="flex items-center gap-1 sm:gap-2 group cursor-pointer">
          <MagnifyingGlassIcon className="jelly-child w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <span className={`text-[10px] sm:text-sm transition-colors duration-300 hidden xs:inline ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
            Search
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;