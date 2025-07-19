import React from 'react';
import NewsPanel from './NewsPanel';
import Terminal from './Terminal';

interface DashboardProps {
  projects: { id: string; name: string }[];
  currentProjectId: string | null;
  projectData: any;
  onCreateProject: (name: string) => void;
  onOpenProject: (id: string) => void;
  onShowModal: (type: 'project' | 'sheet' | 'chart' | 'rename' | 'checkpoint', onSubmit: (name: string) => void) => void;
  onExportFile?: (filename: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  currentProjectId, 
  projectData, 
  onCreateProject, 
  onOpenProject, 
  onShowModal,
  onExportFile 
}) => (
  <div className="min-h-screen flex bg-gray-50">
    {/* Sidebar: Project List */}
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Your Projects</h2>
      
      {/* New Project Button at Top */}
      <button
        className="w-full px-4 py-3 bg-black text-white rounded-lg text-lg font-semibold shadow hover:bg-green-700 transition-colors mb-4"
        onClick={() => onShowModal('project', onCreateProject)}
      >
        + New Project
      </button>
      
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
    <main className="flex-1 mt-3 flex flex-col items-center pt-0">
      <h1 className="text-3xl mt-3 mb-12 font-semibold typewriter">DOUBLE-EXCEL</h1>
      <div className="w-full max-w-3xl" style={{ height: '60vh', margin: '2rem' }}>
        <Terminal
          projects={projects}
          currentProjectId={currentProjectId}
          projectData={projectData}
          onOpenProject={onOpenProject}
          onExportFile={onExportFile}
        />
      </div>
    </main>
    
    {/* News Panel */}
    <aside className="w-96 bg-gray-50 p-6 overflow-y-auto">
      <NewsPanel />
    </aside>
  </div>
);

export default Dashboard; 