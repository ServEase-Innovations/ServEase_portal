// src/components/Modals/AddDepartmentModal.tsx
import React, { useState } from 'react';
import { XMarkIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isDarkMode: boolean;
}

const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isDarkMode,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    budget: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Department name and code are required');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';
      const token = localStorage.getItem('servease_token');

      const response = await fetch(apiUrl + 'departments', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim() || undefined,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create department');
      }

      const data = await response.json();
      toast.success('Department created successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating department:', error);
      toast.error(error.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const tc = isDarkMode
    ? {
        bg: 'bg-gray-800',
        text: 'text-white',
        textSecondary: 'text-gray-400',
        border: 'border-gray-700',
        input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
        label: 'text-gray-300',
      }
    : {
        bg: 'bg-white',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        border: 'border-gray-200',
        input: 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400',
        label: 'text-gray-700',
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`${tc.bg} rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${tc.border}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${tc.text}`}>Add New Department</h2>
              <p className={`text-sm ${tc.textSecondary}`}>Create a new department for your organization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${tc.textSecondary}`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Department Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${tc.label}`}>
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Engineering, Human Resources"
              required
              disabled={loading}
              className={`w-full px-4 py-2.5 rounded-xl border ${tc.input} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
            />
          </div>

          {/* Department Code */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${tc.label}`}>
              Department Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., ENG, HR, MKT"
              required
              disabled={loading}
              className={`w-full px-4 py-2.5 rounded-xl border ${tc.input} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase`}
              maxLength={10}
            />
            <p className={`text-xs ${tc.textSecondary} mt-1`}>
              Short code will be automatically converted to uppercase
            </p>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${tc.label}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the department's purpose"
              disabled={loading}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl border ${tc.input} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none`}
            />
          </div>

          {/* Budget */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${tc.label}`}>
              Annual Budget (₹)
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g., 5000000"
              disabled={loading}
              min="0"
              step="1000"
              className={`w-full px-4 py-2.5 rounded-xl border ${tc.input} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
            />
            <p className={`text-xs ${tc.textSecondary} mt-1`}>
              Optional: Enter the department's annual budget in rupees
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl border ${tc.border} ${tc.text} hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 shadow-lg shadow-indigo-500/25"
            >
              {loading ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;
