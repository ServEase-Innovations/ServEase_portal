// components/team/ProjectTeamsTab.tsx
import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ThemeClasses, ProjectTeam } from '../types';

interface ProjectTeamsTabProps {
  tc: ThemeClasses;
  projectTeams: ProjectTeam[];
}

const ProjectTeamsTab: React.FC<ProjectTeamsTabProps> = ({ tc, projectTeams }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${tc.text}`}>Project Teams</h2>
          <p className={`text-sm ${tc.textSecondary}`}>Assemble employees from the directory into project squads you lead</p>
        </div>
        <button 
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          aria-label="Create new project team"
        >
          <PlusIcon className="w-4 h-4" />
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectTeams.map((team) => (
          <div key={team.id} className={`${tc.bgCard} p-6 rounded-2xl ${tc.border} ${tc.shadow} hover:${tc.bgCardHover} transition-all duration-300 group cursor-pointer`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                {team.name.charAt(0)}
              </div>
              <span className={`text-xs ${tc.textMuted}`}>{team.created}</span>
            </div>
            <h3 className={`font-semibold ${tc.text}`}>{team.name}</h3>
            <p className={`text-sm ${tc.textSecondary}`}>{team.members} members</p>
            <p className={`text-xs ${tc.textMuted} mt-1`}>Project - {team.project}</p>
            <div className={`mt-3 pt-3 ${tc.border} border-t flex items-center justify-between`}>
              <p className={`text-xs ${tc.textSecondary}`}>Lead - {team.lead}</p>
              <button 
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                aria-label={`Manage ${team.name} team`}
              >
                Manage →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTeamsTab;