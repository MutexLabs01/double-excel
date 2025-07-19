import React from 'react';
import NewsPanel from './NewsPanel';

interface ProjectDashboardProps {
  projects: { id: string; name: string }[];
  onCreateProject: (name: string) => void;
  onOpenProject: (id: string) => void;
  onShowModal: (type: 'project' | 'sheet' | 'chart' | 'rename' | 'checkpoint', onSubmit: (name: string) => void) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, onCreateProject, onOpenProject, onShowModal }) => (
  <div className="min-h-screen flex bg-gray-50">
    {/* Sidebar: Project List */}
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Your Projects</h2>
      <ul className="space-y-2 flex-1 overflow-y-auto">
        {projects.map(project => (
          <li key={project.id}>
            <button
              className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 hover:bg-green-100 transition-colors font-medium text-gray-800 shadow-sm"
              onClick={() => onOpenProject(project.id)}
            >
              {project.name}
            </button>
          </li>
        ))}
        {projects.length === 0 && <li className="text-gray-500">No projects yet. Create one!</li>}
      </ul>
    </aside>
    
    {/* Main Content */}
    <main className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-6">Project Dashboard</h1>
        <p className="text-gray-600 mb-8">Create and manage your spreadsheet projects with ease.</p>
        <button
          className="px-6 py-3 bg-black text-white rounded-lg text-lg font-semibold shadow hover:bg-green-700 transition-colors"
          onClick={() => onShowModal('project', onCreateProject)}
        >
          + New Project
        </button>
      </div>
    </main>
    
    {/* News Panel */}
    <aside className="w-96 bg-gray-50 p-6 overflow-y-auto">
      <NewsPanel />
    </aside>
  </div>
);

export default ProjectDashboard; 