// Header.tsx - Updated to integrate with EmployeeDashboard and Sidebar
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  GlobeAltIcon,
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon
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

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton, 
  onBack,
  theme = 'light',
  onThemeToggle,
  onMobileMenuToggle,
  isMobile = false
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ---- Employee search state ----
  const [searchResults, setSearchResults] = useState<EmployeeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against a slow, stale request overwriting a newer one's results
  const searchRequestIdRef = useRef(0);

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
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
              className={`p-1.5 sm:p-2 ${themeClasses.hover} rounded-lg transition-colors flex-shrink-0`}
              aria-label="Toggle menu"
            >
              <Bars3Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${themeClasses.icon}`} />
            </button>
          )}
          
          {showBackButton && (
            <button
              type="button"
              onClick={handleBack}
              className={`p-1.5 sm:p-2 ${themeClasses.hover} rounded-lg transition-colors flex items-center gap-1 sm:gap-2 ${themeClasses.textSecondary} flex-shrink-0`}
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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
              <Link to="/dashboard" className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-500 whitespace-nowrap">
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
          
          {/* Search Bar */}
          {!isProfilePage && !isSettingsPage && (
            <div ref={searchContainerRef} className="relative hidden sm:block">
              <div className={`flex items-center ${themeClasses.searchBg} rounded-xl px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 border ${themeClasses.searchBorder} transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 max-w-[80px] sm:max-w-[130px] md:max-w-[160px] lg:max-w-[200px]`}>
                <MagnifyingGlassIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${themeClasses.icon} flex-shrink-0`} />
                <input
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
                    className="flex-shrink-0 ml-1"
                    aria-label="Clear search"
                  >
                    <XMarkIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${themeClasses.icon}`} />
                  </button>
                ) : (
                  <kbd className={`hidden lg:block ml-1 sm:ml-1.5 md:ml-2 px-1.5 py-0.5 text-[10px] ${themeClasses.searchBg} rounded border ${themeClasses.searchBorder} ${themeClasses.textSecondary} flex-shrink-0`}>
                    ⌘K
                  </kbd>
                )}
              </div>

              {/* Search results dropdown */}
              {isSearchOpen && (
                <div
                  className={`absolute right-0 sm:left-0 mt-2 w-72 sm:w-80 ${themeClasses.dropdownBg} rounded-2xl shadow-2xl border ${themeClasses.dropdownBorder} py-1 z-50 overflow-hidden max-h-96 overflow-y-auto`}
                >
                  {isSearching && (
                    <div className={`px-4 py-4 text-sm ${themeClasses.textSecondary} flex items-center gap-2`}>
                      <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </div>
                  )}

                  {!isSearching && searchError && (
                    <div className="px-4 py-4 text-sm text-red-400">
                      {searchError}
                    </div>
                  )}

                  {!isSearching && !searchError && searchResults.length === 0 && (
                    <div className={`px-4 py-4 text-sm ${themeClasses.textSecondary}`}>
                      No employees found for &ldquo;{searchQuery.trim()}&rdquo;
                    </div>
                  )}

                  {!isSearching && !searchError && searchResults.map((emp) => (
                    <div
                      key={emp.employeeId}
                      className={clsx(
                        `flex items-center gap-3 px-4 py-2.5 sm:py-3 cursor-pointer transition-colors`,
                        themeClasses.dropdownHover
                      )}
                      onClick={() => {
                        // No dedicated employee-detail route exists yet in
                        // this app; for now selecting just closes the
                        // dropdown. Wire up navigation here once a route
                        // like /dashboard/employees/:id is added.
                        setIsSearchOpen(false);
                      }}
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
                        <p className={`text-xs ${themeClasses.textSecondary} truncate`}>
                          {emp.emailAddress}
                        </p>
                        <p className={`text-[11px] ${themeClasses.textMuted} truncate`}>
                          {emp.assignedDepartment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onThemeToggle}
            className={`p-1.5 sm:p-2 rounded-xl ${themeClasses.hover} transition-all duration-300 relative group flex-shrink-0`}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.icon} group-hover:scale-110 transition-transform`} />
            ) : (
              <MoonIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.icon} group-hover:scale-110 transition-transform`} />
            )}
          </button>

          {/* Weather - Hidden on smaller screens */}
          <div className={`hidden lg:flex items-center text-xs sm:text-sm ${themeClasses.textSecondary} flex-shrink-0 gap-1`}>
            <span className="font-medium">31°C</span>
            <span className="opacity-70">☀️</span>
          </div>

          {/* Notifications */}
          <button
            type="button"
            className={`p-1.5 sm:p-2 rounded-xl ${themeClasses.hover} transition-all duration-300 relative group flex-shrink-0`}
            aria-label="View notifications"
            title="View notifications"
          >
            <BellIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.icon} group-hover:scale-110 transition-transform`} />
            {notifications > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 ${themeClasses.badge} text-white text-[8px] sm:text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg`}>
                {notifications}
              </span>
            )}
          </button>

          {/* Messages - Hidden on extra small screens */}
          <button
            type="button"
            className={`hidden sm:flex p-1.5 sm:p-2 rounded-xl ${themeClasses.hover} transition-all duration-300 relative group flex-shrink-0`}
            aria-label="View messages"
            title="View messages"
          >
            <ChatBubbleLeftRightIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.icon} group-hover:scale-110 transition-transform`} />
          </button>

          {/* Time - Hidden on smaller screens */}
          <div className={`hidden xl:flex items-center text-xs sm:text-sm ${themeClasses.textSecondary} flex-shrink-0 gap-1`}>
            <span>15:59</span>
            <span className="opacity-30">|</span>
            <span>22-06-2026</span>
          </div>

          {/* User Menu with proper z-index */}
          {user && (
            <Menu as="div" className="relative flex-shrink-0">
              {({ open }) => (
                <>
                  <Menu.Button 
                    className={`flex items-center gap-0.5 sm:gap-1 md:gap-1.5 ${themeClasses.hover} rounded-xl px-1 sm:px-2 md:px-2.5 py-1 sm:py-1.5 md:py-2 transition-all duration-300 border ${themeClasses.searchBorder}`}
                    aria-label="User menu"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? 'User')}&background=6366f1&color=fff&size=40&bold=true`}
                        alt={user.name ?? 'User'}
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full ring-2 ring-indigo-500/30"
                      />
                      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-green-400 rounded-full ring-2 ring-white dark:ring-[#1a2744]"></span>
                    </div>
                    <div className="hidden sm:block text-left min-w-0">
                      <p className={`text-xs sm:text-sm font-semibold ${themeClasses.text} truncate max-w-[50px] sm:max-w-[80px] md:max-w-[100px] lg:max-w-[120px]`}>
                        {user.name}
                      </p>
                      <p className={`text-[10px] sm:text-xs ${themeClasses.textSecondary} capitalize truncate max-w-[50px] sm:max-w-[80px] md:max-w-[100px] lg:max-w-[120px]`}>
                        {user.role?.replace('-', ' ') || 'User'}
                      </p>
                    </div>
                    <ChevronDownIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${themeClasses.icon} flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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
                    <Menu.Items 
                      className={`absolute right-0 mt-2 w-56 sm:w-64 ${themeClasses.dropdownBg} rounded-2xl shadow-2xl border ${themeClasses.dropdownBorder} py-1 z-50 overflow-hidden`}
                      static={false}
                    >
                      <Menu.Item>
                        {({ active }) => (
                          <div className={clsx(
                            `px-4 py-3 sm:py-4 border-b ${themeClasses.divider}`,
                            active && themeClasses.dropdownHover
                          )}>
                            <p className={`text-sm font-semibold ${themeClasses.dropdownText} truncate`}>{user.name}</p>
                            <p className={`text-xs ${themeClasses.textSecondary} truncate`}>{user.email}</p>
                            <span className={`inline-block mt-1.5 px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-400 font-medium capitalize`}>
                              {user.role?.replace('-', ' ') || 'User'}
                            </span>
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/dashboard/profile"
                            className={clsx(
                              `flex items-center px-4 py-2.5 sm:py-3 text-sm ${themeClasses.dropdownText}`,
                              active && themeClasses.dropdownHover
                            )}
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
                            className={clsx(
                              `flex items-center px-4 py-2.5 sm:py-3 text-sm ${themeClasses.dropdownText}`,
                              active && themeClasses.dropdownHover
                            )}
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
                            className={clsx(
                              `flex items-center w-full px-4 py-2.5 sm:py-3 text-sm text-red-400 border-t ${themeClasses.divider}`,
                              active && 'bg-red-500/10'
                            )}
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
    </header>
  );
};

export default Header;