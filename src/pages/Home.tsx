// Home.tsx - Enhanced with deeper sky blue gradient
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
      {/* Animated Background - Enhanced for light mode */}
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
        {/* Additional blue gradient blobs */}
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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? `${isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-sky-100/50'}` 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>ServEase</h1>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} tracking-wide`}>INNOVATION PVT LTD</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className={`text-sm font-medium transition-colors ${
              isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'
            }`}>Features</a>
            <a href="#why" className={`text-sm font-medium transition-colors ${
              isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'
            }`}>Why ServEase</a>
            <a href="#numbers" className={`text-sm font-medium transition-colors ${
              isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'
            }`}>Numbers</a>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'
              }`}
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-yellow-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {user ? (
              <Link 
                to="/dashboard" 
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 inline-flex items-center group"
              >
                Open Portal
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 inline-flex items-center group"
              >
                Open Portal
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 relative">
          <div className="text-center max-w-5xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border backdrop-blur-sm ${
              isDarkMode 
                ? 'bg-blue-900/20 border-blue-800' 
                : 'bg-white/70 border-sky-200/50 shadow-sm shadow-sky-200/20'
            }`}>
              <SparklesIcon className="w-4 h-4 text-blue-500" />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                People, performance & payroll — unified
              </span>
            </div>
            <h1 className={`text-5xl md:text-6xl font-bold mb-6 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              People, performance & payroll —{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                beautifully unified.
              </span>
            </h1>
            <p className={`text-xl md:text-2xl ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} mb-10 max-w-3xl mx-auto leading-relaxed`}>
              The ServEase portal brings attendance, tasks, leaves, performance and payroll into one premium workspace —
              engineered for Super Admins, Managers and Employees alike.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/login" 
                className="group bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 inline-flex items-center"
              >
                Try the demo portal
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features"
                className={`border-2 px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-800' 
                    : 'border-sky-200 text-blue-600 hover:bg-sky-50/50 hover:border-sky-300'
                }`}
              >
                Explore features
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
                <div key={idx} className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border backdrop-blur-sm transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700 text-slate-300' 
                    : 'bg-white/80 border-sky-200/50 text-gray-600 shadow-sky-200/20'
                }`}>
                  <feature.icon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards - Today's Workspace */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'TODAY', value: "Rohan's workspace", icon: CalendarIcon, gradient: 'from-blue-500 to-cyan-500' },
              { label: 'HOURS', value: '6.4h', icon: ClockIcon, gradient: 'from-purple-500 to-pink-500' },
              { label: 'TASKS', value: '12', icon: ChartBarIcon, gradient: 'from-green-500 to-emerald-500' },
              { label: 'STREAK', value: '23d', icon: CheckCircleIcon, gradient: 'from-orange-500 to-amber-500' }
            ].map((stat, index) => (
              <div key={index} className={`p-6 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${
                isDarkMode 
                  ? 'bg-slate-800/90 border-slate-700' 
                  : 'bg-white/90 border-sky-200/50 shadow-sky-200/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{stat.label}</p>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mt-1`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-xl text-white shadow-lg`}>
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
                ? 'bg-slate-800/90 border-slate-700' 
                : 'bg-white/90 border-sky-200/50 shadow-sky-200/20'
            }`}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Today's progress</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>80% complete</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25">
                  80%
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { task: 'OAuth 2.1 migration', status: 'In Progress', color: 'blue' },
                  { task: 'Payroll PDF service', status: 'Review', color: 'yellow' },
                  { task: 'Payroll PDF service', status: 'Done', color: 'green' }
                ].map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                    isDarkMode ? 'bg-slate-700/50' : 'bg-sky-50/50'
                  }`}>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.task}</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      item.color === 'blue' 
                        ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' 
                        : item.color === 'yellow' 
                        ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' 
                        : 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-green-900/20 border-green-800' 
                  : 'bg-green-50/80 border-green-200/50 backdrop-blur-sm'
              }`}>
                <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>May payslip ready</span>
                <span className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>₹1,02,450</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={`py-20 transition-all duration-500 ${
          isDarkMode ? 'bg-slate-800/50' : 'bg-gradient-to-b from-sky-100/30 via-blue-50/40 to-transparent'
        }`}>
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-purple-900/20 border-purple-800' 
                  : 'bg-white/70 border-purple-200/50 shadow-sm shadow-purple-200/20'
              }`}>
                <SparklesIcon className="w-4 h-4 text-purple-500" />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Platform</span>
              </div>
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Every workflow your workforce needs.
              </h2>
              <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                One portal for daily standups, attendance, leaves, payroll and analytics — without the friction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`p-8 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group ${
                    isDarkMode 
                      ? 'bg-slate-800/90 border-slate-700' 
                      : 'bg-white/90 border-sky-200/50 shadow-sky-200/20'
                  }`}
                >
                  <div className={`p-3 bg-gradient-to-r ${feature.gradient} rounded-xl text-white w-14 h-14 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{feature.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why ServEase Section */}
        <section id="why" className={`py-20 transition-all duration-500 ${
          isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-b from-sky-100/20 via-blue-50/30 to-transparent'
        }`}>
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-indigo-900/20 border-indigo-800' 
                  : 'bg-white/70 border-indigo-200/50 shadow-sm shadow-indigo-200/20'
              }`}>
                <SparklesIcon className="w-4 h-4 text-indigo-500" />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Why ServEase</span>
              </div>
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                An enterprise portal that actually feels modern.
              </h2>
              <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} mb-12 max-w-2xl mx-auto leading-relaxed`}>
                Designed for organisations that care about speed, clarity and craft.
                From the boardroom to the engineering pod, every screen is built to delight.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className={`p-6 rounded-2xl shadow-lg border backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                isDarkMode 
                  ? 'bg-slate-800/90 border-slate-700' 
                  : 'bg-white/90 border-sky-200/50 shadow-sky-200/20'
              }`}>
                <ul className="space-y-4">
                  {[
                    'Premium UI with glassmorphism, animations and micro-interactions',
                    'Battle-tested role hierarchy — Super Admin, Manager, Employee',
                    'Built-in payroll PDF generator with company branding',
                    'Dark & light modes, responsive on every device'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {whyFeatures.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-6 rounded-2xl shadow-lg border text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      isDarkMode 
                        ? 'bg-slate-800/90 border-slate-700' 
                        : 'bg-white/90 border-sky-200/50 shadow-sky-200/20'
                    }`}
                  >
                    <div className={`p-3 bg-gradient-to-r ${item.gradient} rounded-xl text-white w-12 h-12 flex items-center justify-center mx-auto mb-3`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.title}</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{item.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Numbers Section */}
        <section id="numbers" className={`py-20 transition-all duration-500 ${
          isDarkMode ? 'bg-slate-800/50' : 'bg-gradient-to-b from-sky-100/20 via-indigo-50/30 to-transparent'
        }`}>
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-green-900/20 border-green-800' 
                  : 'bg-white/70 border-green-200/50 shadow-sm shadow-green-200/20'
              }`}>
                <ChartBarIcon className="w-4 h-4 text-green-500" />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Numbers</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className={`p-8 rounded-2xl shadow-lg border backdrop-blur-xl text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    isDarkMode 
                      ? 'bg-slate-800/90 border-slate-700' 
                      : 'bg-white/90 border-sky-200/50 shadow-sky-200/20'
                  }`}
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white">
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className={`text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </p>
                  <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-16 max-w-3xl mx-auto">
              <div className={`p-12 rounded-3xl shadow-xl border backdrop-blur-xl text-center transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-slate-600' 
                  : 'bg-gradient-to-br from-sky-100/60 via-blue-50/80 to-indigo-50/60 border-sky-200/50 shadow-sky-200/20'
              }`}>
                <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Step into your employee portal.
                </h3>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'} mb-6`}>
                  Try the live demo — no signup needed.
                </p>
                <Link 
                  to="/login" 
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-medium transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105"
                >
                  Open Demo Portal
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 border-t transition-all duration-500 ${
          isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white/60 backdrop-blur-sm border-sky-200/50'
        }`}>
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>ServEase</p>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>INNOVATION PVT LTD</p>
                </div>
              </div>
              <div className="text-center">
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  © 2026 ServEase Innovation Private Limited. All rights reserved.
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'} mt-1`}>
                  Tower B, Cyber Hub, Gurugram, Haryana 122002, India
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  <GlobeAltIcon className="w-4 h-4" />
                  <span>ENG</span>
                  <span className="mx-1">|</span>
                  <span>IN</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Weather & Search Bar - Bottom Right */}
      <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border backdrop-blur-xl z-40 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-800/90 border-slate-700' 
          : 'bg-white/90 border-sky-200/50 shadow-sky-200/20'
      }`}>
        <div className="flex items-center gap-2">
          <SunIcon className="w-4 h-4 text-yellow-500" />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>31°C</span>
          <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Partly sunny</span>
        </div>
        <div className="w-px h-6 bg-gray-300 dark:bg-slate-600"></div>
        <div className="flex items-center gap-2">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
          <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Search</span>
        </div>
      </div>
    </div>
  );
};

export default Home;