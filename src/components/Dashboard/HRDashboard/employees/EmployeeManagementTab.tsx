// src/components/Dashboard/HRDashboard/employees/EmployeeManagementTab.tsx

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  UserGroupIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Employee {
  employeeId: number;
  username: string;
  fullName: string;
  emailAddress: string;
  assignedRole: string;
  assignedDepartment: string;
  managerId: number | null;
  teamId: number | null;
  managerName?: string;
}

interface Manager {
  employeeId: number;
  username: string;
  fullName: string;
  assignedRole: string;
  assignedDepartment: string;
}

interface EmployeeManagementTabProps {
  themeClasses: any;
}

const EmployeeManagementTab: React.FC<EmployeeManagementTabProps> = ({ themeClasses: tc }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [assigningManager, setAssigningManager] = useState<number | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);

  const API_BASE_URL = 'http://localhost:4000';

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/employees`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      
      // Fetch manager names for employees who have managers
      const employeesWithManagers = await Promise.all(
        data.employees.map(async (emp: Employee) => {
          if (emp.managerId) {
            try {
              const managerResponse = await fetch(`${API_BASE_URL}/employees/${emp.managerId}`, {
                credentials: 'include',
              });
              if (managerResponse.ok) {
                const managerData = await managerResponse.json();
                return { ...emp, managerName: managerData.employee.fullName };
              }
            } catch (error) {
              console.error('Error fetching manager:', error);
            }
          }
          return emp;
        })
      );

      setEmployees(employeesWithManagers);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast.error(error.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Fetch potential managers (employees with Manager, SuperAdmin roles or CEO)
  const fetchManagers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch managers');
      }

      const data = await response.json();
      
      // Filter employees who can be managers
      const managerList = data.employees.filter((emp: Employee) => 
        emp.assignedRole === 'Manager' || 
        emp.assignedRole === 'SuperAdmin' || 
        emp.assignedRole === 'CEO' ||
        emp.assignedRole === 'HR'
      );

      setManagers(managerList);
    } catch (error: any) {
      console.error('Error fetching managers:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchManagers();
  }, []);

  // Assign manager to employee
  const handleAssignManager = async (employeeId: number, managerId: number | null) => {
    try {
      setAssigningManager(employeeId);

      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          managerId: managerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign manager');
      }

      const data = await response.json();
      toast.success(managerId ? 'Manager assigned successfully' : 'Manager removed successfully');
      
      // Refresh employees list
      await fetchEmployees();
      setSelectedManagerId(null);
    } catch (error: any) {
      console.error('Error assigning manager:', error);
      toast.error(error.message || 'Failed to assign manager');
    } finally {
      setAssigningManager(null);
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.emailAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'All' || emp.assignedDepartment === selectedDepartment;
    const matchesRole = selectedRole === 'All' || emp.assignedRole === selectedRole;

    return matchesSearch && matchesDepartment && matchesRole;
  });

  // Get unique departments and roles
  const departments = ['All', ...new Set(employees.map(emp => emp.assignedDepartment).filter(Boolean))];
  const roles = ['All', ...new Set(employees.map(emp => emp.assignedRole).filter(Boolean))];

  // Get statistics
  const totalEmployees = employees.length;
  const employeesWithManagers = employees.filter(emp => emp.managerId).length;
  const employeesWithoutManagers = totalEmployees - employeesWithManagers;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-400" />
          <span className={tc.textSecondary}>Loading employees...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${tc.text}`}>Employee Management</h2>
          <p className={`text-sm ${tc.textSecondary} mt-1`}>
            Manage employee hierarchy and assign managers
          </p>
        </div>
        <button
          onClick={fetchEmployees}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-all"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${tc.bgCard} p-4 rounded-xl ${tc.border}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className={`text-sm ${tc.textSecondary}`}>Total Employees</p>
              <p className={`text-2xl font-bold ${tc.text}`}>{totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className={`${tc.bgCard} p-4 rounded-xl ${tc.border}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className={`text-sm ${tc.textSecondary}`}>With Managers</p>
              <p className={`text-2xl font-bold ${tc.text}`}>{employeesWithManagers}</p>
            </div>
          </div>
        </div>

        <div className={`${tc.bgCard} p-4 rounded-xl ${tc.border}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <BriefcaseIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className={`text-sm ${tc.textSecondary}`}>Without Managers</p>
              <p className={`text-2xl font-bold ${tc.text}`}>{employeesWithoutManagers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${tc.bgCard} p-4 rounded-xl ${tc.border} space-y-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${tc.textSecondary}`} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${tc.bgInput} ${tc.border} rounded-lg ${tc.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className={`px-4 py-2 ${tc.bgInput} ${tc.border} rounded-lg ${tc.text} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={`px-4 py-2 ${tc.bgInput} ${tc.border} rounded-lg ${tc.text} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
          >
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className={`${tc.bgCard} rounded-xl ${tc.border} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={tc.bgCardHover}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${tc.textSecondary} uppercase tracking-wider`}>
                  Employee
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${tc.textSecondary} uppercase tracking-wider`}>
                  Role
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${tc.textSecondary} uppercase tracking-wider`}>
                  Department
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${tc.textSecondary} uppercase tracking-wider`}>
                  Current Manager
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold ${tc.textSecondary} uppercase tracking-wider`}>
                  Assign Manager
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredEmployees.map((employee) => (
                <tr key={employee.employeeId} className={`${tc.bgCard} hover:${tc.bgCardHover} transition-colors`}>
                  <td className="px-6 py-4">
                    <div>
                      <p className={`font-medium ${tc.text}`}>{employee.fullName}</p>
                      <p className={`text-sm ${tc.textSecondary}`}>{employee.username}</p>
                      <p className={`text-xs ${tc.textSecondary}`}>{employee.emailAddress}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm">
                      {employee.assignedRole}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${tc.text}`}>{employee.assignedDepartment}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {employee.managerName ? (
                      <span className={`text-sm ${tc.text}`}>{employee.managerName}</span>
                    ) : (
                      <span className={`text-sm ${tc.textSecondary} italic`}>No manager</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedManagerId === employee.employeeId ? selectedManagerId : (employee.managerId || '')}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
                          setSelectedManagerId(employee.employeeId);
                          handleAssignManager(employee.employeeId, value);
                        }}
                        disabled={assigningManager === employee.employeeId}
                        className={`px-3 py-1.5 ${tc.bgInput} ${tc.border} rounded-lg ${tc.text} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50`}
                      >
                        <option value="">No Manager</option>
                        {managers
                          .filter(m => m.employeeId !== employee.employeeId) // Don't allow self-assignment
                          .map((manager) => (
                            <option key={manager.employeeId} value={manager.employeeId}>
                              {manager.fullName} ({manager.assignedRole})
                            </option>
                          ))}
                      </select>
                      {assigningManager === employee.employeeId && (
                        <ArrowPathIcon className="w-4 h-4 animate-spin text-blue-400" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className={`w-12 h-12 mx-auto ${tc.textSecondary} mb-3`} />
              <p className={`text-lg ${tc.text} mb-1`}>No employees found</p>
              <p className={`text-sm ${tc.textSecondary}`}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagementTab;
