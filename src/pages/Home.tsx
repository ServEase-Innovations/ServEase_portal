// src/pages/Home.tsx - Updated with hover animations
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
  MapPinIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const openLogin = () => {
    setIsLoginOpen(true);
    if (mainContentRef.current) {
      const scrollY = window.scrollY;
      mainContentRef.current.dataset.scrollY = String(scrollY);
    }
  };

  const closeLogin = () => {
    setIsLoginOpen(false);
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

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-b from-sky-100 via-blue-100/60 to-indigo-100/40'
    }`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDarkMode 
            ? 'bg-blue-500/10' 
            : 'bg-gradient-to-br from-blue-300/50 to-indigo-300/40'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
          isDarkMode 
            ? 'bg-purple-500/10' 
            : 'bg-gradient-to-br from-purple-300/40 to-pink-300/30'
        }`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse delay-2000 ${
          isDarkMode 
            ? 'bg-indigo-500/5' 
            : 'bg-gradient-to-br from-indigo-200/30 to-purple-200/30'
        }`} />
        <div className={`absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500 ${
          isDarkMode 
            ? 'bg-cyan-500/5' 
            : 'bg-gradient-to-br from-cyan-300/30 to-blue-300/30'
        }`} />
        <div className={`absolute bottom-20 right-10 w-72 h-72 rounded-full blur-3xl animate-pulse delay-1500 ${
          isDarkMode 
            ? 'bg-blue-500/5' 
            : 'bg-gradient-to-br from-blue-300/30 to-sky-300/40'
        }`} />
      </div>

      {/* Navigation Bar */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? `${isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-sky-100/50'}` 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/25 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>ServEase</h1>
              <p className={`text-[10px] transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} tracking-wide`}>INNOVATION PVT LTD</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'Why ServEase', 'Numbers'].map((item, index) => (
              <a 
                key={index}
                href={`#${item.toLowerCase().replace(' ', '')}`}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <span>{item}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'
              }`}
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-yellow-400 transition-transform duration-300 hover:rotate-90" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600 transition-transform duration-300 hover:rotate-90" />
              )}
            </button>
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 inline-flex items-center group overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  Open Portal
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                </span>
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
              </button>
            ) : (
              <button
                onClick={openLogin}
                className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 inline-flex items-center group overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  Open Portal
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                </span>
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with Split Layout */}
      <div className="pt-24 relative">
        <div className="container mx-auto px-6">
          <div className={`flex flex-col lg:flex-row gap-8 transition-all duration-700 ease-in-out ${
            isLoginOpen ? 'lg:gap-6' : ''
          }`}>
            {/* Left Content - Main Page Content */}
            <div 
              ref={mainContentRef}
              className={`flex-1 transition-all duration-700 ease-in-out ${
                isLoginOpen ? 'lg:max-w-[55%]' : 'lg:max-w-full'
              }`}
            >
              {/* Hero Section */}
              <section className="py-8">
                <div className="text-center max-w-5xl mx-auto">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                    isDarkMode 
                      ? 'bg-blue-900/20 border-blue-800 hover:bg-blue-900/30' 
                      : 'bg-white/70 border-sky-200/50 shadow-sm shadow-sky-200/20 hover:bg-white/90 hover:shadow-lg'
                  }`}>
                    <SparklesIcon className="w-4 h-4 text-blue-500 animate-pulse" />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      People, performance & payroll — unified
                    </span>
                  </div>
                  <h1 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    People, performance & payroll —{' '}
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                      beautifully unified.
                    </span>
                  </h1>
                  <p className={`text-lg md:text-xl ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} mb-10 max-w-3xl mx-auto leading-relaxed transition-all duration-300`}>
                    The ServEase portal brings attendance, tasks, leaves, performance and payroll into one premium workspace —
                    engineered for Super Admins, Managers and Employees alike.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={openLogin}
                      className="relative group bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 inline-flex items-center overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative flex items-center">
                        Try the demo portal
                        <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                      </span>
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                    </button>
                    <a 
                      href="#features"
                      className={`relative group border-2 px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 overflow-hidden ${
                        isDarkMode 
                          ? 'border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500' 
                          : 'border-sky-200 text-blue-600 hover:bg-sky-50/50 hover:border-sky-300'
                      }`}
                    >
                      <span className="relative">Explore features</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap justify-center gap-3 mt-8 max-w-2xl mx-auto">
                    {[
                      { icon: CheckCircleIcon, label: 'No setup required' },
                      { icon: UserGroupIcon, label: 'Role-based access' },
                      { icon: SunIcon, label: 'Dark & light mode' },
                      { icon: ChartBarIcon, label: 'Mobile responsive' }
                    ].map((feature, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-default ${
                          isDarkMode 
                            ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600' 
                            : 'bg-white/80 border-sky-200/50 text-gray-600 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                        }`}
                      >
                        <feature.icon className="w-4 h-4 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                        <span className="text-sm font-medium">{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  {[
                    { label: 'TODAY', value: "Rohan's workspace", icon: CalendarIcon, gradient: 'from-blue-500 to-cyan-500' },
                    { label: 'HOURS', value: '6.4h', icon: ClockIcon, gradient: 'from-purple-500 to-pink-500' },
                    { label: 'TASKS', value: '12', icon: ChartBarIcon, gradient: 'from-green-500 to-emerald-500' },
                    { label: 'STREAK', value: '23d', icon: CheckCircleIcon, gradient: 'from-orange-500 to-amber-500' }
                  ].map((stat, index) => (
                    <div 
                      key={index} 
                      className={`p-6 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer ${
                        isDarkMode 
                          ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800 hover:border-slate-600' 
                          : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
                            {stat.label}
                          </p>
                          <p className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'} mt-1`}>
                            {stat.value}
                          </p>
                        </div>
                        <div className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Section */}
                <div className="mt-12 max-w-2xl mx-auto">
                  <div className={`p-8 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${
                    isDarkMode 
                      ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800' 
                      : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                  }`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Today's progress</h3>
                        <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>80% complete</p>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-110 hover:rotate-6">
                        80%
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { task: 'OAuth 2.1 migration', status: 'In Progress', color: 'blue' },
                        { task: 'Payroll PDF service', status: 'Review', color: 'yellow' },
                        { task: 'Payroll PDF service', status: 'Done', color: 'green' }
                      ].map((item, index) => (
                        <div 
                          key={index} 
                          className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                            isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-sky-50/50 hover:bg-sky-50'
                          }`}
                        >
                          <span className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.task}</span>
                          <span className={`text-sm font-semibold px-3 py-1 rounded-full transition-all duration-300 hover:scale-105 ${
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
                    <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                      isDarkMode 
                        ? 'bg-green-900/20 border-green-800 hover:bg-green-900/30' 
                        : 'bg-green-50/80 border-green-200/50 backdrop-blur-sm hover:bg-green-50'
                    }`}>
                      <span className={`font-medium transition-colors duration-300 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>May payslip ready</span>
                      <span className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>₹1,02,450</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section id="features" className={`py-16 transition-all duration-500 ${
                isDarkMode ? 'bg-slate-800/50' : 'bg-gradient-to-b from-sky-100/30 via-blue-50/40 to-transparent'
              }`}>
                <div className="container mx-auto">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-purple-900/20 border-purple-800 hover:bg-purple-900/30' 
                        : 'bg-white/70 border-purple-200/50 shadow-sm shadow-purple-200/20 hover:bg-white/90 hover:shadow-lg'
                    }`}>
                      <SparklesIcon className="w-4 h-4 text-purple-500" />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Platform</span>
                    </div>
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Every workflow your workforce needs.
                    </h2>
                    <p className={`text-lg transition-all duration-300 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      One portal for daily standups, attendance, leaves, payroll and analytics — without the friction.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                      <div 
                        key={index}
                        className={`p-6 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer ${
                          isDarkMode 
                            ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800 hover:border-slate-600' 
                            : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                        }`}
                      >
                        <div className={`p-3 bg-gradient-to-r ${feature.gradient} rounded-xl text-white w-14 h-14 flex items-center justify-center mb-4 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                          <feature.icon className="w-7 h-7" />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
                          {feature.title}
                        </h3>
                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-600 group-hover:text-gray-700'}`}>
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Why ServEase Section */}
              <section id="why" className={`py-16 transition-all duration-500 ${
                isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-b from-sky-100/20 via-blue-50/30 to-transparent'
              }`}>
                <div className="container mx-auto">
                  <div className="text-center max-w-4xl mx-auto">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-indigo-900/20 border-indigo-800 hover:bg-indigo-900/30' 
                        : 'bg-white/70 border-indigo-200/50 shadow-sm shadow-indigo-200/20 hover:bg-white/90 hover:shadow-lg'
                    }`}>
                      <SparklesIcon className="w-4 h-4 text-indigo-500" />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Why ServEase</span>
                    </div>
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      An enterprise portal that actually feels modern.
                    </h2>
                    <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} mb-12 max-w-2xl mx-auto leading-relaxed transition-all duration-300`}>
                      Designed for organisations that care about speed, clarity and craft.
                      From the boardroom to the engineering pod, every screen is built to delight.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className={`p-6 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      isDarkMode 
                        ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800' 
                        : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                    }`}>
                      <ul className="space-y-4">
                        {[
                          'Premium UI with glassmorphism, animations and micro-interactions',
                          'Battle-tested role hierarchy — Super Admin, Manager, Employee',
                          'Built-in payroll PDF generator with company branding',
                          'Dark & light modes, responsive on every device'
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 group cursor-pointer transition-all duration-300 hover:translate-x-2">
                            <CheckCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                            <span className={`transition-colors duration-300 ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {whyFeatures.map((item, index) => (
                        <div 
                          key={index}
                          className={`p-6 rounded-2xl shadow-lg border text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer ${
                            isDarkMode 
                              ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800 hover:border-slate-600' 
                              : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                          }`}
                        >
                          <div className={`p-3 bg-gradient-to-r ${item.gradient} rounded-xl text-white w-12 h-12 flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <h4 className={`font-bold transition-colors duration-300 ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
                            {item.title}
                          </h4>
                          <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
                            {item.subtitle}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Numbers Section */}
              <section id="numbers" className={`py-16 transition-all duration-500 ${
                isDarkMode ? 'bg-slate-800/50' : 'bg-gradient-to-b from-sky-100/20 via-indigo-50/30 to-transparent'
              }`}>
                <div className="container mx-auto">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-green-900/20 border-green-800 hover:bg-green-900/30' 
                        : 'bg-white/70 border-green-200/50 shadow-sm shadow-green-200/20 hover:bg-white/90 hover:shadow-lg'
                    }`}>
                      <ChartBarIcon className="w-4 h-4 text-green-500" />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Numbers</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {stats.map((stat, index) => (
                      <div 
                        key={index}
                        className={`p-8 rounded-2xl shadow-lg border backdrop-blur-xl text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer ${
                          isDarkMode 
                            ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800 hover:border-slate-600' 
                            : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-sky-200/40'
                        }`}
                      >
                        <div className="flex justify-center mb-4">
                          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                            <stat.icon className="w-6 h-6" />
                          </div>
                        </div>
                        <p className={`text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 transition-all duration-300 group-hover:scale-105`}>
                          {stat.value}
                        </p>
                        <p className={`text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CTA Section */}
                  <div className="mt-16 max-w-3xl mx-auto">
                    <div className={`p-10 rounded-3xl shadow-xl border backdrop-blur-xl text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-slate-600 hover:from-slate-800 hover:to-slate-700' 
                        : 'bg-gradient-to-br from-sky-100/60 via-blue-50/80 to-indigo-50/60 border-sky-200/50 shadow-sky-200/20 hover:bg-gradient-to-br hover:from-sky-100 hover:via-blue-50 hover:to-indigo-50'
                    }`}>
                      <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Step into your employee portal.
                      </h3>
                      <p className={`transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} mb-6`}>
                        Try the live demo — no signup needed.
                      </p>
                      <button
                        onClick={openLogin}
                        className="relative group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-medium transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="relative flex items-center">
                          Open Demo Portal
                          <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                        </span>
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className={`py-10 border-t transition-all duration-500 ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white/60 backdrop-blur-sm border-sky-200/50'
              }`}>
                <div className="container mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center group cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mr-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-sm font-bold transition-colors duration-300 ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
                          ServEase
                        </p>
                        <p className={`text-[10px] transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          INNOVATION PVT LTD
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-600 hover:text-gray-800'}`}>
                        © 2026 ServEase Innovation Private Limited. All rights reserved.
                      </p>
                      <p className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-500 hover:text-slate-400' : 'text-gray-400 hover:text-gray-600'} mt-1`}>
                        Tower B, Cyber Hub, Gurugram, Haryana 122002, India
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 text-xs transition-all duration-300 hover:scale-105 ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'}`}>
                        <GlobeAltIcon className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                        <span>ENG</span>
                        <span className="mx-1">|</span>
                        <span>IN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>

            {/* Login Panel Component */}
            <LoginPanel 
              isOpen={isLoginOpen}
              onClose={closeLogin}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Weather & Search Bar - Bottom Right */}
      <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border backdrop-blur-xl z-40 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-800' 
          : 'bg-white/90 border-sky-200/50 shadow-sky-200/20 hover:bg-white hover:shadow-lg'
      }`}>
        <div className="flex items-center gap-2 group cursor-pointer">
          <SunIcon className="w-4 h-4 text-yellow-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          <span className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-700 group-hover:text-blue-600'}`}>
            31°C
          </span>
          <span className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
            Partly sunny
          </span>
        </div>
        <div className={`w-px h-6 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
        <div className="flex items-center gap-2 group cursor-pointer">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:scale-110" />
          <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
            Search
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;