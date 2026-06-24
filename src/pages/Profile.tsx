// Profile.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
  MapPinIcon,
  AcademicCapIcon,
  TrophyIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  employeeId: string;
  joiningDate: string;
  location: string;
  bio: string;
  skills: string[];
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || 'Sanya Kapoor',
    email: user?.email || 'sanya.kapoor@servease.com',
    phone: '+91 98765 43210',
    role: user?.role || 'Super Admin',
    department: 'People & Culture',
    employeeId: 'SE-003',
    joiningDate: '2021-06-15',
    location: 'Gurugram, India',
    bio: 'HR professional with 8+ years of experience in talent management, employee engagement, and organizational development.',
    skills: ['Talent Acquisition', 'Employee Relations', 'Performance Management', 'HR Analytics', 'Leadership Development']
  });

  const [editableData, setEditableData] = useState<ProfileData>(profileData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    setEditableData(profileData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableData(profileData);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProfileData(editableData);
    setIsEditing(false);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChange = (field: keyof ProfileData, value: string | string[]) => {
    setEditableData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      const newSkill = e.currentTarget.value.trim();
      if (!editableData.skills.includes(newSkill)) {
        setEditableData(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill]
        }));
      }
      e.currentTarget.value = '';
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setEditableData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGradient = () => {
    const gradients = [
      'from-indigo-500 via-purple-500 to-pink-500',
      'from-blue-500 via-cyan-500 to-teal-500',
      'from-green-500 via-emerald-500 to-teal-500',
      'from-orange-500 via-amber-500 to-yellow-500',
      'from-red-500 via-pink-500 to-rose-500'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Animated Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-100/10 to-purple-100/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative max-w-6xl mx-auto p-6">
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Profile</h1>
            <p className="text-sm text-gray-500">Manage your personal information</p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="group px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 flex items-center gap-2 hover:scale-105"
              >
                <PencilSquareIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center gap-2"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 hover:scale-105"
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
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3 animate-fadeIn">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-medium">Profile updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Card - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className={`w-28 h-28 bg-gradient-to-br ${getGradient()} rounded-full flex items-center justify-center text-white text-3xl font-bold relative shadow-lg`}>
                    {getInitials(profileData.name)}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-110">
                      <CameraIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-800">{profileData.name}</h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full mt-1">
                  <SparklesIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <p className="text-sm font-medium text-indigo-600">{profileData.role}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">{profileData.employeeId}</p>
                <div className="mt-6 pt-6 border-t border-gray-100 w-full space-y-3">
                  <div className="flex items-center justify-between text-sm group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <span className="text-gray-500 flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                      Department
                    </span>
                    <span className="font-medium text-gray-700">{profileData.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <span className="text-gray-500 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      Joined
                    </span>
                    <span className="font-medium text-gray-700">{profileData.joiningDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <span className="text-gray-500 flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      Location
                    </span>
                    <span className="font-medium text-gray-700">{profileData.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details - Right Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                  <UserIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5 font-medium">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-xl border border-gray-100">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 font-medium">{profileData.name}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5 font-medium">Email Address</label>
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-indigo-50/20 rounded-xl border border-gray-200">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profileData.email}</span>
                    <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">(Cannot be changed)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5 font-medium">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editableData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-xl border border-gray-100">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{profileData.phone}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5 font-medium">Role</label>
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50/30 rounded-xl border border-indigo-100">
                    <BriefcaseIcon className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-700 font-medium">{profileData.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                  <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">About Me</h3>
              </div>
              {isEditing ? (
                <textarea
                  value={editableData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Write something about yourself..."
                />
              ) : (
                <div className="relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                  <p className="text-sm text-gray-600 leading-relaxed pl-4">{profileData.bio}</p>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <TrophyIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Skills & Expertise</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {isEditing ? (
                  <>
                    {editableData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-sm font-medium group hover:shadow-md transition-all duration-300"
                      >
                        {skill}
                        <button
                          onClick={() => handleSkillRemove(skill)}
                          className="ml-1 text-indigo-400 hover:text-red-500 transition-colors"
                        >
                          <XCircleIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Add skill and press Enter..."
                      onKeyDown={handleSkillAdd}
                      className="px-4 py-1.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px] transition-all duration-300"
                    />
                  </>
                ) : (
                  profileData.skills.map((skill, index) => (
                    <span
                      key={skill}
                      className="px-4 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-sm font-medium hover:shadow-md hover:scale-105 transition-all duration-300 animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>
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

export default Profile;