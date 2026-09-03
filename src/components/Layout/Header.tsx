// Header.tsx - Updated to integrate with EmployeeDashboard and Sidebar
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { employeeSearchService } from '../../services/api';
import { EmployeeSearchResult } from '../../types';
import {
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  onMobileMenuToggle?: () => void;
  isMobile?: boolean;
}

// Friendly labels for the backend role enum, shown in the search dropdown badge
const ROLE_LABELS: Record<string, string> = {
  SuperAdmin: 'Super Admin',
  HR: 'HR',
  Manager: 'Manager',
  Developer: 'Developer',
  Marketing: 'Marketing',
  CustomStaff: 'Custom Staff',
};

const SEARCH_DEBOUNCE_MS = 300;

// Placeholder notification feed until a real notifications endpoint exists.
// Swap this for a live fetch (e.g. notificationService.list()) when the
// backend supports it - the dropdown UI below is already wired for it.
interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  unread: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Leave request approved',
    detail: 'Your leave for 12–14 Sept was approved by HR.',
    time: '12m ago',
    type: 'success',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Timesheet reminder',
    detail: "You haven't submitted last week's timesheet yet.",
    time: '1h ago',
    type: 'warning',
    unread: true,
  },
  {
    id: 'n3',
    title: 'New policy document',
    detail: 'The updated WFH policy is now available.',
    time: 'Yesterday',
    type: 'info',
    unread: true,
  },
];

const MOCK_MESSAGES = [
  { id: 'm1', from: 'Priya Sharma', preview: 'Can you review the onboarding doc?', time: '9m' },
  { id: 'm2', from: 'Dev Team', preview: 'Deploy went out clean ✅', time: '48m' },
];

const NOTIFICATION_ICON: Record<NotificationItem['type'], typeof CheckCircleIcon> = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  info: ClockIcon,
};

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton,
  onBack,
  theme = 'light',
  onThemeToggle,
  onMobileMenuToggle,
  isMobile = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationItems, setNotificationItems] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notificationItems.filter((n) => n.unread).length;

  // ---- Employee search state ----
  const [searchResults, setSearchResults] = useState<EmployeeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against a slow, stale request overwriting a newer one's results
  const searchRequestIdRef = useRef(0);

  // ---- Live clock, replaces the previously hardcoded time/date ----
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(tick);
  }, []);
  const timeLabel = useMemo(
    () => now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [now]
  );
  const dateLabel = useMemo(
    () =>
      now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    [now]
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const isProfilePage = location.pathname.includes('/profile');
  const isSettingsPage = location.pathname.includes('/settings');
  const showSearch = !isProfilePage && !isSettingsPage;

  // Debounced employee search - fires on every keystroke, only actually
  // calls the API SEARCH_DEBOUNCE_MS after the user stops typing. Backend
  // (pg_trgm) supports single-letter queries, so we search from 1 char up.
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      setIsSearchOpen(false);
      return;
    }

    setIsSearchOpen(true);
    setIsSearching(true);
    setSearchError(null);

    debounceRef.current = setTimeout(async () => {
      const requestId = ++searchRequestIdRef.current;
      try {
        const response = await employeeSearchService.search(trimmed);
        // Ignore this result if a newer search has since been kicked off
        if (requestId !== searchRequestIdRef.current) return;
        setSearchResults(response.employees || []);
      } catch (err) {
        if (requestId !== searchRequestIdRef.current) return;
        console.error('Employee search failed:', err);
        setSearchResults([]);
        setSearchError('Search failed. Please try again.');
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  // Close the dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // ⌘K / Ctrl+K jumps straight into the search box - the kbd hint in the
  // search bar now actually does something.
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (!isShortcut) return;
      event.preventDefault();
      if (isMobile) {
        setIsMobileSearchOpen(true);
        requestAnimationFrame(() => mobileSearchInputRef.current?.focus());
      } else {
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [isMobile]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setIsSearchOpen(false);
  }, []);

  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setIsSearchOpen(true);
    }
  };

  const markAllNotificationsRead = () => {
    setNotificationItems((items) => items.map((item) => ({ ...item, unread: false })));
  };

  // Handler for clicking on a search result
  const handleSearchResultClick = useCallback((employee: EmployeeSearchResult) => {
    // No dedicated employee-detail route exists yet in this app; for now selecting just closes the dropdown.
    // Wire up navigation here once a route like /dashboard/employees/:id is added.
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
  }, []);

  // Handler for keyboard events on search results
  const handleSearchResultKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, employee: EmployeeSearchResult) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSearchResultClick(employee);
    }
  }, [handleSearchResultClick]);

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        header: 'bg-gradient-to-r from-[#0a1628] via-[#1a2744] to-[#0d1f3c] border-b border-white/10',
        text: 'text-white',
        textSecondary: 'text-blue-200/70',
        textMuted: 'text-blue-300/50',
        icon: 'text-blue-300/70',
        searchBg: 'bg-white/10',
        searchBorder: 'border-white/10',
        searchText: 'text-white',
        searchPlaceholder: 'text-blue-300/50',
        hover: 'hover:bg-white/10',
        menuBg: 'bg-[#1a2744]',
        menuBorder: 'border-white/10',
        dropdownBg: 'bg-[#1a2744]',
        dropdownBorder: 'border-white/10',
        dropdownText: 'text-white',
        dropdownHover: 'hover:bg-white/10',
        divider: 'border-white/10',
        badge: 'bg-indigo-500',
      };
    }
    return {
      header: 'bg-white/80 backdrop-blur-sm border-b border-gray-200/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      textMuted: 'text-gray-400',
      icon: 'text-gray-400',
      searchBg: 'bg-gray-50',
      searchBorder: 'border-gray-100',
      searchText: 'text-gray-800',
      searchPlaceholder: 'text-gray-400',
      hover: 'hover:bg-gray-100',
      menuBg: 'bg-white',
      menuBorder: 'border-gray-100',
      dropdownBg: 'bg-white',
      dropdownBorder: 'border-gray-100',
      dropdownText: 'text-gray-700',
      dropdownHover: 'hover:bg-gray-50',
      divider: 'border-gray-100',
      badge: 'bg-indigo-600',
    };
  };

  const themeClasses = getThemeClasses();

  const notificationTone: Record<NotificationItem['type'], string> = {
    success: 'text-emerald-500 bg-emerald-500/10',
    warning: 'text-amber-500 bg-amber-500/10',
    info: 'text-indigo-500 bg-indigo-500/10',
  };

  return (
    <header className={`${themeClasses.header} px-3 sm:px-4 md:px-6 py-2 sm:py-3 transition-colors duration-300 relative z-20`}>
      <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-3">
        {/* Left Section - Mobile Menu Toggle & Title/Subtitle */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-1 min-w-0">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className={`p-1.5 sm:p-2 ${themeClasses.hover} rounded-lg transition-all duration-200 active:scale-90 flex-shrink-0`}
              aria-label="Toggle menu"
            >
              <Bars3Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${themeClasses.icon}`} />
            </button>
          )}

          {showBackButton && (
            <button
              type="button"
              onClick={handleBack}
              className={`p-1.5 sm:p-2 ${themeClasses.hover} rounded-lg transition-all duration-200 active:scale-90 flex items-center gap-1 sm:gap-2 ${themeClasses.textSecondary} flex-shrink-0 group`}
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
          )}

          {title ? (
            <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-1">
              <h1 className={`text-sm sm:text-base md:text-lg lg:text-xl font-bold ${themeClasses.text} truncate`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`text-xs sm:text-sm ${themeClasses.textSecondary} hidden md:block truncate max-w-[150px] lg:max-w-[250px]`}>
                  {subtitle}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <Link
                to="/dashboard"
                className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-500 whitespace-nowrap transition-opacity hover:opacity-80"
              >
                ServEase
              </Link>
              <span className={`text-xs sm:text-sm ${themeClasses.textSecondary} hidden lg:block whitespace-nowrap`}>
                INNOVATION PVT LTD
              </span>
            </div>
          )}
        </div>

        {/* Right Section - Actions - Using flex-wrap for better responsiveness */}
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 flex-shrink-0 flex-wrap justify-end">

          {/* Search Bar - desktop/tablet */}
          {showSearch && (
            <div ref={searchContainerRef} className="relative hidden sm:block">
              <div
                className={`flex items-center ${themeClasses.searchBg} rounded-xl px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 border ${themeClasses.searchBorder} transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/40 max-w-[80px] sm:max-w-[130px] md:max-w-[160px] lg:max-w-[200px] focus-within:max-w-[110px] focus-within:sm:max-w-[170px] focus-within:md:max-w-[210px] focus-within:lg:max-w-[260px]`}
              >
                <MagnifyingGlassIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${themeClasses.icon} flex-shrink-0`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search people..."
                  className={`bg-transparent outline-none text-xs sm:text-sm w-12 sm:w-20 md:w-24 lg:w-32 ml-1 sm:ml-1.5 md:ml-2 ${themeClasses.searchText} placeholder:${themeClasses.searchPlaceholder} min-w-[40px]`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  aria-label="Search employees"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="flex-shrink-0 ml-1 rounded-full transition-transform duration-150 hover:scale-110 active:scale-90"
                    aria-label="Clear search"
                  >
                    <XMarkIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${themeClasses.icon}`} />
                  </button>
                ) : (
                  <kbd
                    className={`hidden lg:block ml-1 sm:ml-1.5 md:ml-2 px-1.5 py-0.5 text-[10px] ${themeClasses.searchBg} rounded border ${themeClasses.searchBorder} ${themeClasses.textSecondary} flex-shrink-0`}
                  >
                    ⌘K
                  </kbd>
                )}
              </div>

              {/* Search results dropdown */}
              <Transition
                show={isSearchOpen}
                enter="transition duration-150 ease-out"
                enterFrom="opacity-0 -translate-y-1 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="transition duration-100 ease-in"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 -translate-y-1 scale-95"
              >
                <div
                  className={`absolute right-0 sm:left-0 mt-2 w-72 sm:w-80 ${themeClasses.dropdownBg} rounded-2xl shadow-2xl border ${themeClasses.dropdownBorder} py-1 z-50 overflow-hidden max-h-96 overflow-y-auto origin-top`}
                  role="listbox"
                  aria-label="Search results"
                >
                  {isSearching && (
                    <div className={`px-4 py-4 text-sm ${themeClasses.textSecondary} flex items-center gap-2`}>
                      <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                      Searching...
                    </div>
                  )}

                  {!isSearching && searchError && (
                    <div className="px-4 py-4 text-sm text-red-400" role="alert">
                      {searchError}
                    </div>
                  )}

                  {!isSearching && !searchError && searchResults.length === 0 && searchQuery.trim() && (
                    <div className={`px-4 py-4 text-sm ${themeClasses.textSecondary}`}>
                      No employees found for &ldquo;{searchQuery.trim()}&rdquo;
                    </div>
                  )}

                  {!isSearching &&
                    !searchError &&
                    searchResults.map((emp) => (
                      <div
                        key={emp.employeeId}
                        role="option"
                        tabIndex={0}
                        aria-selected="false"
                        className={clsx(
                          'flex items-center gap-3 px-4 py-2.5 sm:py-3 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                          themeClasses.dropdownHover
                        )}
                        onClick={() => handleSearchResultClick(emp)}
                        onKeyDown={(e) => handleSearchResultKeyDown(e, emp)}
                      >
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}&background=6366f1&color=fff&size=40&bold=true`}
                          alt={emp.fullName}
                          className="w-9 h-9 rounded-full ring-2 ring-indigo-500/30 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold ${themeClasses.dropdownText} truncate`}>
                              {emp.fullName}
                            </p>
                            <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-500/20 text-indigo-400 font-medium">
                              {ROLE_LABELS[emp.assignedRole] || emp.assignedRole}
                            </span>
                            {!emp.isActive && (
                              <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] rounded-full bg-gray-500/20 text-gray-400 font-medium">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${themeClasses.textSecondary} truncate`}>{emp.emailAddress}</p>
                          <p className={`text-[11px] ${themeClasses.textMuted} truncate`}>{emp.assignedDepartment}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </Transition>
            </div>
          )}

          {/* Search toggle - phone-width only, opens the overlay bar below the header */}
          {showSearch && (
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen((v) => !v);
                requestAnimationFrame(() => mobileSearchInputRef.current?.focus());
              }}
              className={`sm:hidden p-1.5 rounded-xl ${themeClasses.hover} transition-all duration-200 active:scale-90 flex-shrink-0`}
              aria-label="Search employees"
            >
              <MagnifyingGlassIcon className={`w-4 h-4 ${themeClasses.icon}`} />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onThemeToggle}
            className={`p-1.5 sm:p-2 rounded-xl ${themeClasses.hover} transition-all duration-300 active:scale-90 relative group flex-shrink-0 overflow-hidden`}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <span
              className={`inline-block transition-transform duration-500 ${theme === 'dark' ? 'rotate-0' : 'rotate-180'} group-hover:scale-110`}
            >
              {theme === 'dark' ? (
                <SunIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.icon}`} />
              ) : (
                <MoonIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.icon}`} />
              )}
            </span>
          </button>

          {/* Weather - Hidden on smaller screens */}
          <div className={`hidden lg:flex items-center text-xs sm:text-sm ${themeClasses.textSecondary} flex-shrink-0 gap-1`}>
            <span className="font-medium">31°C</span>
            <span className="opacity-70">☀️</span>
          </div>

          {/* Notifications */}
          <Menu as="div" className="relative flex-shrink-0">
            <Menu.Button
              className={`p-1.5 sm:p-2 rounded-xl ${themeClasses.hover} transition-all duration-200 active:scale-90 relative group`}
              aria-label="View notifications"
              title="View notifications"
            >
              <BellIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.icon} group-hover:scale-110 transition-transform`} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex">
                  <span className={`absolute inline-flex h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full ${themeClasses.badge} opacity-75 animate-ping`} />
                  <span
                    className={`relative inline-flex w-3.5 h-3.5 sm:w-4 sm:h-4 ${themeClasses.badge} text-white text-[8px] sm:text-[10px] rounded-full items-center justify-center font-bold shadow-lg`}
                  >
                    {unreadCount}
                  </span>
                </span>
              )}
            </Menu.Button>
            <Transition
              enter="transition duration-150 ease-out"
              enterFrom="opacity-0 -translate-y-1 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="transition duration-100 ease-in"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 -translate-y-1 scale-95"
            >
              <Menu.Items
                className={`absolute right-0 mt-2 w-72 sm:w-80 ${themeClasses.dropdownBg} rounded-2xl shadow-2xl border ${themeClasses.dropdownBorder} py-1 z-50 overflow-hidden origin-top-right`}
              >
                <div className={`flex items-center justify-between px-4 py-3 border-b ${themeClasses.divider}`}>
                  <p className={`text-sm font-semibold ${themeClasses.dropdownText}`}>Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notificationItems.map((item) => {
                    const Icon = NOTIFICATION_ICON[item.type];
                    return (
                      <Menu.Item key={item.id}>
                        {({ active }) => (
                          <div
                            className={clsx(
                              'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                              active && themeClasses.dropdownHover
                            )}
                          >
                            <span className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${notificationTone[item.type]}`}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className={`text-sm font-medium ${themeClasses.dropdownText} truncate`}>{item.title}</p>
                                {item.unread && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                              </div>
                              <p className={`text-xs ${themeClasses.textSecondary} truncate`}>{item.detail}</p>
                              <p className={`text-[11px] ${themeClasses.textMuted} mt-0.5`}>{item.time}</p>
                            </div>
                          </div>
                        )}
                      </Menu.Item>
                    );
                  })}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Messages - Hidden on extra small screens */}
          <Menu as="div" className="relative flex-shrink-0 hidden sm:block">
            <Menu.Button
              className={`p-1.5 sm:p-2 rounded-xl ${themeClasses.hover} transition-all duration-200 active:scale-90 relative group`}
              aria-label="View messages"
              title="View messages"
            >
              <ChatBubbleLeftRightIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.icon} group-hover:scale-110 transition-transform`} />
              {MOCK_MESSAGES.length > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 ${themeClasses.badge} text-white text-[8px] sm:text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg`}>
                  {MOCK_MESSAGES.length}
                </span>
              )}
            </Menu.Button>
            <Transition
              enter="transition duration-150 ease-out"
              enterFrom="opacity-0 -translate-y-1 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="transition duration-100 ease-in"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 -translate-y-1 scale-95"
            >
              <Menu.Items
                className={`absolute right-0 mt-2 w-72 sm:w-80 ${themeClasses.dropdownBg} rounded-2xl shadow-2xl border ${themeClasses.dropdownBorder} py-1 z-50 overflow-hidden origin-top-right`}
              >
                <div className={`px-4 py-3 border-b ${themeClasses.divider}`}>
                  <p className={`text-sm font-semibold ${themeClasses.dropdownText}`}>Messages</p>
                </div>
                {MOCK_MESSAGES.map((msg) => (
                  <Menu.Item key={msg.id}>
                    {({ active }) => (
                      <div
                        className={clsx(
                          'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                          active && themeClasses.dropdownHover
                        )}
                      >
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.from)}&background=6366f1&color=fff&size=36&bold=true`}
                          alt={msg.from}
                          className="w-8 h-8 rounded-full ring-2 ring-indigo-500/30 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-medium ${themeClasses.dropdownText} truncate`}>{msg.from}</p>
                            <span className={`text-[11px] ${themeClasses.textMuted} flex-shrink-0`}>{msg.time}</span>
                          </div>
                          <p className={`text-xs ${themeClasses.textSecondary} truncate`}>{msg.preview}</p>
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Time - Hidden on smaller screens, now a live clock */}
          <div className={`hidden xl:flex items-center text-xs sm:text-sm ${themeClasses.textSecondary} flex-shrink-0 gap-1 tabular-nums`}>
            <span>{timeLabel}</span>
            <span className="opacity-30">|</span>
            <span>{dateLabel}</span>
          </div>

          {/* User Menu with proper z-index */}
          {user && (
            <Menu as="div" className="relative flex-shrink-0">
              {({ open }) => (
                <>
                  <Menu.Button
                    className={`flex items-center gap-0.5 sm:gap-1 md:gap-1.5 ${themeClasses.hover} rounded-xl px-1 sm:px-2 md:px-2.5 py-1 sm:py-1.5 md:py-2 transition-all duration-200 active:scale-95 border ${themeClasses.searchBorder}`}
                    aria-label="User menu"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? 'User')}&background=6366f1&color=fff&size=40&bold=true`}
                        alt={user.name ?? 'User'}
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full ring-2 ring-indigo-500/30"
                      />
                      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-green-400 rounded-full ring-2 ring-white dark:ring-[#1a2744]">
                        <span className="block w-full h-full rounded-full bg-green-400 animate-ping opacity-75" />
                      </span>
                    </div>
                    <div className="hidden sm:block text-left min-w-0">
                      <p className={`text-xs sm:text-sm font-semibold ${themeClasses.text} truncate max-w-[50px] sm:max-w-[80px] md:max-w-[100px] lg:max-w-[120px]`}>
                        {user.name}
                      </p>
                      <p className={`text-[10px] sm:text-xs ${themeClasses.textSecondary} capitalize truncate max-w-[50px] sm:max-w-[80px] md:max-w-[100px] lg:max-w-[120px]`}>
                        {user.role?.replace('-', ' ') || 'User'}
                      </p>
                    </div>
                    <ChevronDownIcon
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${themeClasses.icon} flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    />
                  </Menu.Button>

                  <Transition
                    show={open}
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-in"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Menu.Items className={`absolute right-0 mt-2 w-56 sm:w-64 ${themeClasses.dropdownBg} rounded-2xl shadow-2xl border ${themeClasses.dropdownBorder} py-1 z-50 overflow-hidden`} static={false}>
                      <Menu.Item>
                        {({ active }) => (
                          <div className={clsx(`px-4 py-3 sm:py-4 border-b ${themeClasses.divider}`, active && themeClasses.dropdownHover)}>
                            <p className={`text-sm font-semibold ${themeClasses.dropdownText} truncate`}>{user.name}</p>
                            <p className={`text-xs ${themeClasses.textSecondary} truncate`}>{user.email}</p>
                            <span className="inline-block mt-1.5 px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-400 font-medium capitalize">
                              {user.role?.replace('-', ' ') || 'User'}
                            </span>
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/dashboard/profile"
                            className={clsx(`flex items-center px-4 py-2.5 sm:py-3 text-sm ${themeClasses.dropdownText}`, active && themeClasses.dropdownHover)}
                          >
                            <UserIcon className="w-4 h-4 mr-3 opacity-60 flex-shrink-0" />
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/dashboard/settings"
                            className={clsx(`flex items-center px-4 py-2.5 sm:py-3 text-sm ${themeClasses.dropdownText}`, active && themeClasses.dropdownHover)}
                          >
                            <Cog6ToothIcon className="w-4 h-4 mr-3 opacity-60 flex-shrink-0" />
                            Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={handleLogout}
                            className={clsx(`flex items-center w-full px-4 py-2.5 sm:py-3 text-sm text-red-400 border-t ${themeClasses.divider}`, active && 'bg-red-500/10')}
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </>
              )}
            </Menu>
          )}
        </div>
      </div>

      {/* Mobile search overlay - covers the gap left by hiding the search bar below `sm` */}
      <Transition
        show={isMobileSearchOpen && showSearch}
        enter="transition duration-150 ease-out"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-100 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-2"
      >
        <div className="sm:hidden mt-2">
          <div className={`flex items-center ${themeClasses.searchBg} rounded-xl px-3 py-2 border ${themeClasses.searchBorder} focus-within:ring-2 focus-within:ring-indigo-500/50`}>
            <MagnifyingGlassIcon className={`w-4 h-4 ${themeClasses.icon} flex-shrink-0`} />
            <input
              ref={mobileSearchInputRef}
              type="text"
              placeholder="Search people..."
              className={`bg-transparent outline-none text-sm flex-1 ml-2 ${themeClasses.searchText} placeholder:${themeClasses.searchPlaceholder}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search employees"
            />
            <button
              type="button"
              onClick={() => {
                clearSearch();
                setIsMobileSearchOpen(false);
              }}
              className="flex-shrink-0 ml-1"
              aria-label="Close search"
            >
              <XMarkIcon className={`w-4 h-4 ${themeClasses.icon}`} />
            </button>
          </div>

          {searchQuery.trim() && (
            <div 
              className={`mt-2 ${themeClasses.dropdownBg} rounded-2xl shadow-2xl border ${themeClasses.dropdownBorder} py-1 overflow-hidden max-h-80 overflow-y-auto`}
              role="listbox"
              aria-label="Search results"
            >
              {isSearching && (
                <div className={`px-4 py-4 text-sm ${themeClasses.textSecondary} flex items-center gap-2`}>
                  <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  Searching...
                </div>
              )}
              {!isSearching && searchError && (
                <div className="px-4 py-4 text-sm text-red-400" role="alert">
                  {searchError}
                </div>
              )}
              {!isSearching && !searchError && searchResults.length === 0 && searchQuery.trim() && (
                <div className={`px-4 py-4 text-sm ${themeClasses.textSecondary}`}>
                  No employees found for &ldquo;{searchQuery.trim()}&rdquo;
                </div>
              )}
              {!isSearching &&
                !searchError &&
                searchResults.map((emp) => (
                  <div
                    key={emp.employeeId}
                    role="option"
                    tabIndex={0}
                    aria-selected="false"
                    className={clsx(
                      'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                      themeClasses.dropdownHover
                    )}
                    onClick={() => handleSearchResultClick(emp)}
                    onKeyDown={(e) => handleSearchResultKeyDown(e, emp)}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}&background=6366f1&color=fff&size=40&bold=true`}
                      alt={emp.fullName}
                      className="w-9 h-9 rounded-full ring-2 ring-indigo-500/30 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${themeClasses.dropdownText} truncate`}>{emp.fullName}</p>
                        <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-500/20 text-indigo-400 font-medium">
                          {ROLE_LABELS[emp.assignedRole] || emp.assignedRole}
                        </span>
                      </div>
                      <p className={`text-xs ${themeClasses.textSecondary} truncate`}>{emp.emailAddress}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Transition>
    </header>
  );
};

export default Header;