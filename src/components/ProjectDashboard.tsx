import React from 'react';

interface ProjectDashboardProps {
  projects: { id: string; name: string }[];
  onCreateProject: (name: string) => void;
  onOpenProject: (id: string) => void;
  onShowModal: (type: 'project' | 'sheet' | 'chart' | 'rename' | 'checkpoint', onSubmit: (name: string) => void) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, onCreateProject, onOpenProject, onShowModal }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Project Dashboard</h1>
      <div className="mb-6">
        <button
          className="px-4 py-2 bg-black text-white rounded"
          onClick={() => onShowModal('project', onCreateProject)}
        >
          + New Project
        </button>
      </div>
      <div className="max-w-md mx-auto">
        <ul className="space-y-2">
          {projects.map(project => (
            <li key={project.id} className="flex items-center justify-between bg-white rounded shadow p-3">
              <span className="font-medium text-lg">{project.name}</span>
              <button
                className="ml-4 px-3 py-1 bg-green-600 text-white rounded"
                onClick={() => onOpenProject(project.id)}
              >
                Open
              </button>
            </li>
          ))}
          {projects.length === 0 && <li className="text-gray-500">No projects yet. Create one!</li>}
        </ul>
      </div>
    </div>
  </div>
);

export default ProjectDashboard; 