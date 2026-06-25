// Settings.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  LanguageIcon,
  PaintBrushIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  MoonIcon,
  SunIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  SparklesIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
    taskUpdates: boolean;
    leaveApprovals: boolean;
    announcements: boolean;
    weeklyReports: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'appearance' | 'security' | 'preferences'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      slack: false,
      taskUpdates: true,
      leaveApprovals: true,
      announcements: true,
      weeklyReports: false,
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      compactMode: false,
    },
    preferences: {
      language: 'English (EN)',
      timezone: 'IST (UTC+5:30)',
      dateFormat: 'DD-MM-YYYY',
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
    },
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleNotificationToggle = (key: keyof SettingsData['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handlePasswordChange = () => {
    if (newPassword && newPassword === confirmPassword) {
      // Password change logic here
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon, color: 'from-indigo-500 to-purple-500' },
    { id: 'notifications', label: 'Notifications', icon: BellIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon, color: 'from-red-500 to-pink-500' },
    { id: 'preferences', label: 'Preferences', icon: LanguageIcon, color: 'from-orange-500 to-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Animated Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-100/10 to-purple-100/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative max-w-5xl mx-auto p-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Settings</h1>
            <p className="text-sm text-gray-500">Manage your account preferences and settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 hover:scale-105"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3 animate-fadeIn">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-medium">Settings saved successfully!</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
          {/* Tabs */}
          <div className="border-b border-gray-100 px-6 bg-gradient-to-r from-gray-50 to-indigo-50/20">
            <nav className="flex space-x-6 overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`
                      flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap
                      ${isActive 
                        ? `border-indigo-600 text-indigo-600` 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className={`p-1 rounded-lg ${isActive ? `bg-gradient-to-r ${tab.color}` : ''}`}>
                      <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    {tab.label}
                    {isActive && (
                      <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Cog6ToothIcon className="w-5 h-5 text-indigo-500" />
                    General Settings
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: UserIcon, title: 'Profile Information', desc: 'Update your personal details', color: 'from-indigo-500 to-purple-500' },
                      { icon: GlobeAltIcon, title: 'Language & Region', desc: 'English (India) • IST', color: 'from-blue-500 to-cyan-500' },
                      { icon: ClockIcon, title: 'Time Zone', desc: 'IST (UTC+5:30)', color: 'from-green-500 to-emerald-500' },
                    ].map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 bg-gradient-to-r ${item.color} rounded-lg text-white`}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="animate-fadeIn">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BellIcon className="w-5 h-5 text-blue-500" />
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'email', title: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'push', title: 'Push Notifications', desc: 'Browser push notifications' },
                    { key: 'taskUpdates', title: 'Task Updates', desc: 'Notifications for task assignments and updates' },
                    { key: 'leaveApprovals', title: 'Leave Approvals', desc: 'Notifications for pending leave requests' },
                    { key: 'announcements', title: 'Announcements', desc: 'Company-wide announcements' },
                  ].map((item) => {
                    const isEnabled = settings.notifications[item.key as keyof SettingsData['notifications']];
                    return (
                      <div 
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 group"
                      >
                        <div>
                          <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle(item.key as keyof SettingsData['notifications'])}
                          title={`${isEnabled ? 'Disable' : 'Enable'} ${item.title}`}
                          aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${item.title}`}
                          className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                            isEnabled ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${
                              isEnabled ? 'translate-x-7' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="animate-fadeIn">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PaintBrushIcon className="w-5 h-5 text-green-500" />
                  Appearance
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'light', icon: SunIcon, label: 'Light', color: 'from-yellow-400 to-orange-400' },
                        { id: 'dark', icon: MoonIcon, label: 'Dark', color: 'from-indigo-600 to-purple-600' },
                        { id: 'system', icon: DevicePhoneMobileIcon, label: 'System', color: 'from-gray-500 to-gray-700' },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSettings(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, theme: theme.id as 'light' | 'dark' | 'system' }
                          }))}
                          className={`p-4 border-2 rounded-xl text-center transition-all duration-300 hover:scale-105 ${
                            settings.appearance.theme === theme.id
                              ? `border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg shadow-indigo-500/10`
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <div className={`p-2 bg-gradient-to-r ${theme.color} rounded-lg text-white inline-block`}>
                            <theme.icon className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-medium mt-2">{theme.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">Font Size</label>
                    <div className="flex gap-3">
                      {[
                        { id: 'small', label: 'Small', size: 'text-sm' },
                        { id: 'medium', label: 'Medium', size: 'text-base' },
                        { id: 'large', label: 'Large', size: 'text-lg' },
                      ].map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setSettings(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, fontSize: size.id as 'small' | 'medium' | 'large' }
                          }))}
                          className={`flex-1 px-4 py-2 border-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                            settings.appearance.fontSize === size.id
                              ? 'border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg shadow-indigo-500/10'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <span className={size.size}>{size.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md hover:border-green-200 transition-all duration-300">
                    <div>
                      <p className="font-medium text-gray-800">Compact Mode</p>
                      <p className="text-sm text-gray-500">Reduce spacing and padding</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        appearance: { ...prev.appearance, compactMode: !prev.appearance.compactMode }
                      }))}
                      title="Toggle compact mode"
                      aria-label="Toggle compact mode"
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                        settings.appearance.compactMode ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${
                          settings.appearance.compactMode ? 'translate-x-7' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-red-500" />
                  Security
                </h3>
                
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md hover:border-red-200 transition-all duration-300">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <KeyIcon className="w-4 h-4 text-red-500" />
                    Change Password
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1 font-medium">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 pr-10"
                        />
                        <button
                          title={showPassword ? 'Hide password' : 'Show password'}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1 font-medium">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1 font-medium">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
                    >
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md hover:border-red-200 transition-all duration-300">
                  <div>
                    <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, twoFactorAuth: !prev.security.twoFactorAuth }
                    }))}
                    title="Toggle two-factor authentication"
                    aria-label="Toggle two-factor authentication"
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                      settings.security.twoFactorAuth ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/25' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${
                        settings.security.twoFactorAuth ? 'translate-x-7' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md hover:border-red-200 transition-all duration-300">
                  <div>
                    <p className="font-medium text-gray-800">Session Timeout</p>
                    <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                  </div>
                  <select
                    title="Session timeout"
                    aria-label="Session timeout"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                    }))}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gradient-to-r from-gray-50 to-white"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="animate-fadeIn">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <LanguageIcon className="w-5 h-5 text-orange-500" />
                  Preferences
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Language', key: 'language', options: ['English (EN)', 'Hindi (HI)', 'Spanish (ES)', 'French (FR)'] },
                    { label: 'Time Zone', key: 'timezone', options: ['IST (UTC+5:30)', 'EST (UTC-5:00)', 'PST (UTC-8:00)', 'GMT (UTC+0:00)'] },
                    { label: 'Date Format', key: 'dateFormat', options: ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'] },
                  ].map((field) => (
                    <div key={field.key} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-300">
                      <label htmlFor={`${field.key}-select`} className="block text-sm text-gray-600 mb-1.5 font-medium">{field.label}</label>
                      <select
                        id={`${field.key}-select`}
                        value={settings.preferences[field.key as keyof SettingsData['preferences']]}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, [field.key]: e.target.value }
                        }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white"
                      >
                        {field.options.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 hover:shadow-lg hover:border-red-300 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">Danger Zone</h3>
              <p className="text-sm text-red-600">Permanently delete your account and all associated data</p>
            </div>
            <button className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Settings;