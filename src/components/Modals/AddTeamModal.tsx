import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
  theme: string;
}

const AddTeamModal: React.FC<AddTeamModalProps> = ({ isOpen, onClose, onTeamCreated, theme }) => {
  const [teamName, setTeamName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [milestoneDeadline, setMilestoneDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tc = {
    bgModal: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    text: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    input: theme === 'dark' ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim() || !projectTitle.trim() || !milestoneDeadline) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/';
      const token = localStorage.getItem('servease_token');
      
      const response = await fetch(apiUrl + 'teams', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          teamName: teamName.trim(),
          projectTitle: projectTitle.trim(),
          projectSummary: projectSummary.trim() || undefined,
          milestoneDeadline: new Date(milestoneDeadline).toISOString(),
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create team');
      }

      const data = await response.json();
      console.log('Team created successfully:', data);

      // Reset form
      setTeamName('');
      setProjectTitle('');
      setProjectSummary('');
      setMilestoneDeadline('');
      
      // Notify parent and close
      onTeamCreated();
      onClose();
      
    } catch (error: any) {
      console.error('Error creating team:', error);
      alert(error.message || 'Failed to create team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`${tc.bgModal} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between p-6 ${tc.border} border-b`}>
          <h2 className={`text-2xl font-bold ${tc.text}`}>Create New Team</h2>
          <button
            onClick={onClose}
            className={`${tc.textSecondary} hover:${tc.text} transition-colors`}
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="teamName" className={`block text-sm font-medium ${tc.text} mb-2`}>
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., Alpha Team, Platform Team"
              className={`w-full px-4 py-2 ${tc.input} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              required
            />
          </div>

          <div>
            <label htmlFor="projectTitle" className={`block text-sm font-medium ${tc.text} mb-2`}>
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="projectTitle"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g., Employee Management System"
              className={`w-full px-4 py-2 ${tc.input} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              required
            />
          </div>

          <div>
            <label htmlFor="projectSummary" className={`block text-sm font-medium ${tc.text} mb-2`}>
              Project Summary
            </label>
            <textarea
              id="projectSummary"
              value={projectSummary}
              onChange={(e) => setProjectSummary(e.target.value)}
              placeholder="Brief description of the project"
              rows={3}
              className={`w-full px-4 py-2 ${tc.input} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none`}
            />
          </div>

          <div>
            <label htmlFor="milestoneDeadline" className={`block text-sm font-medium ${tc.text} mb-2`}>
              Milestone Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="milestoneDeadline"
              value={milestoneDeadline}
              onChange={(e) => setMilestoneDeadline(e.target.value)}
              className={`w-full px-4 py-2 ${tc.input} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 ${tc.input} border rounded-xl font-medium hover:bg-opacity-80 transition-all duration-300`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamModal;
