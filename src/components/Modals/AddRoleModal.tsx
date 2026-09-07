import React, { useState, useEffect } from 'react';
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: any | null;
}

const privilegeCategories = [
  {
    name: 'Employee Management',
    privileges: [
      { key: 'canViewEmployees', label: 'View Employees' },
      { key: 'canCreateEmployees', label: 'Create Employees' },
      { key: 'canEditEmployees', label: 'Edit Employees' },
      { key: 'canDeleteEmployees', label: 'Delete Employees' },
    ]
  },
  {
    name: 'Department Management',
    privileges: [
      { key: 'canViewDepartments', label: 'View Departments' },
      { key: 'canCreateDepartments', label: 'Create Departments' },
      { key: 'canEditDepartments', label: 'Edit Departments' },
      { key: 'canDeleteDepartments', label: 'Delete Departments' },
    ]
  },
  {
    name: 'Team Management',
    privileges: [
      { key: 'canViewTeams', label: 'View Teams' },
      { key: 'canCreateTeams', label: 'Create Teams' },
      { key: 'canEditTeams', label: 'Edit Teams' },
      { key: 'canDeleteTeams', label: 'Delete Teams' },
    ]
  },
  {
    name: 'Role Management',
    privileges: [
      { key: 'canViewRoles', label: 'View Roles' },
      { key: 'canCreateRoles', label: 'Create Roles' },
      { key: 'canEditRoles', label: 'Edit Roles' },
    ]
  },
  {
    name: 'Attendance & Leave',
    privileges: [
      { key: 'canViewAllAttendance', label: 'View All Attendance' },
      { key: 'canEditAttendance', label: 'Edit Attendance' },
      { key: 'canApproveLeave', label: 'Approve Leave' },
      { key: 'canViewLeaveRequests', label: 'View Leave Requests' },
    ]
  },
  {
    name: 'Payroll',
    privileges: [
      { key: 'canViewPayroll', label: 'View Payroll' },
      { key: 'canGeneratePayslips', label: 'Generate Payslips' },
      { key: 'canApprovePayslips', label: 'Approve Payslips' },
    ]
  },
  {
    name: 'Reports & Analytics',
    privileges: [
      { key: 'canViewReports', label: 'View Reports' },
      { key: 'canExportData', label: 'Export Data' },
    ]
  },
  {
    name: 'System Settings',
    privileges: [
      { key: 'canManageSettings', label: 'Manage Settings' },
    ]
  },
];

const AddRoleModal: React.FC<AddRoleModalProps> = ({ isOpen, onClose, onSuccess, role }) => {
  const [formData, setFormData] = useState({
    roleName: '',
    displayName: '',
    description: '',
    isActive: true,
    privileges: {} as Record<string, boolean>
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      // Edit mode - populate form with existing role data
      setFormData({
        roleName: role.roleName || '',
        displayName: role.displayName || '',
        description: role.description || '',
        isActive: role.isActive !== false,
        privileges: role.privileges || {}
      });
    } else {
      // Create mode - reset form with all privileges unchecked
      const emptyPrivileges: Record<string, boolean> = {};
      privilegeCategories.forEach(category => {
        category.privileges.forEach(priv => {
          emptyPrivileges[priv.key] = false;
        });
      });
      
      setFormData({
        roleName: '',
        displayName: '',
        description: '',
        isActive: true,
        privileges: emptyPrivileges
      });
    }
    setError(null);
  }, [role, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrivilegeToggle = (key: string) => {
    setFormData(prev => ({
      ...prev,
      privileges: {
        ...prev.privileges,
        [key]: !prev.privileges[key]
      }
    }));
  };

  const handleSelectAllInCategory = (category: typeof privilegeCategories[0]) => {
    const allChecked = category.privileges.every(priv => formData.privileges[priv.key]);
    const updates: Record<string, boolean> = {};
    category.privileges.forEach(priv => {
      updates[priv.key] = !allChecked;
    });
    
    setFormData(prev => ({
      ...prev,
      privileges: {
        ...prev.privileges,
        ...updates
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roleName.trim() || !formData.displayName.trim()) {
      setError('Role name and display name are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';
      const token = localStorage.getItem('servease_token');
      
      const url = role 
        ? `${apiUrl}roles/${role.roleId}` 
        : `${apiUrl}roles`;
      
      const method = role ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${role ? 'update' : 'create'} role`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving role:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const checkedCount = Object.values(formData.privileges).filter(v => v === true).length;
  const totalCount = Object.keys(formData.privileges).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {role ? 'Edit Role' : 'Create New Role'}
              </h2>
              <p className="text-sm text-slate-400">
                {role ? 'Update role details and permissions' : 'Define a new role with custom privileges'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Role Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="roleName"
                    value={formData.roleName}
                    onChange={handleInputChange}
                    placeholder="e.g., TeamLead"
                    disabled={role?.isSystemRole || loading}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Used internally (camelCase recommended)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Display Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="e.g., Team Lead"
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Shown to users</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the purpose and responsibilities of this role..."
                  rows={3}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:opacity-50"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  disabled={loading}
                  className="w-4 h-4 text-indigo-500 bg-slate-800 border-slate-700 rounded focus:ring-indigo-500 focus:ring-2 disabled:opacity-50"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-300">
                  Active Role
                </label>
              </div>
            </div>

            {/* Privileges */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Privileges & Permissions
                </h3>
                <span className="text-sm text-slate-400">
                  {checkedCount} / {totalCount} selected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {privilegeCategories.map((category) => {
                  const categoryChecked = category.privileges.filter(p => formData.privileges[p.key]).length;
                  const categoryTotal = category.privileges.length;
                  const allChecked = categoryChecked === categoryTotal;

                  return (
                    <div key={category.name} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">{category.name}</h4>
                        <button
                          type="button"
                          onClick={() => handleSelectAllInCategory(category)}
                          disabled={loading}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors disabled:opacity-50"
                        >
                          {allChecked ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {category.privileges.map((priv) => (
                          <label key={priv.key} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={formData.privileges[priv.key] || false}
                              onChange={() => handlePrivilegeToggle(priv.key)}
                              disabled={loading}
                              className="w-4 h-4 text-indigo-500 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2 disabled:opacity-50"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                              {priv.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700/50 bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 bg-slate-700/50 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {role ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-4 h-4" />
                  {role ? 'Update Role' : 'Create Role'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoleModal;
