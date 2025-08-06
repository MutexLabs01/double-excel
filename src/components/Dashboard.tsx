import React from 'react';
import NewsPanel from './NewsPanel';
import Terminal from './Terminal';
import TypewriterEffect from './TypewriterEffect';

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
  <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-950 to-gray-900">
    {/* Sidebar: Project List */}
    <aside className="w-80 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-600 flex flex-col p-6 shadow-2xl">
      <h2 className="text-xl font-bold mb-6 text-white drop-shadow-lg">Your Projects</h2>
      
      {/* New Project Button at Top */}
      <button
        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg text-lg font-semibold shadow-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 transform hover:scale-105 mb-4"
        onClick={() => onShowModal('project', onCreateProject)}
      >
        + New Project
      </button>
      
      <ul className="space-y-3 flex-1 overflow-y-auto">
        {projects.map(project => (
          <li key={project.id}>
            <button
              className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-750 hover:from-gray-700 hover:to-gray-650 transition-all duration-200 font-medium text-gray-200 shadow-md border border-gray-600 hover:border-gray-500 hover:shadow-lg transform hover:scale-102"
              onClick={() => onOpenProject(project.id)}
            >
              {project.name}
            </button>
          </li>
        ))}
        {projects.length === 0 && <li className="text-gray-400 text-center py-4">No projects yet. Create one!</li>}
      </ul>
    </aside>
    
    {/* Main Content */}
    <main className="flex-1 mt-3 flex flex-col items-center pt-0 bg-gradient-to-br from-gray-900 to-black">
      <div className="text-5xl mt-3 mb-12 text-white font-extrabold">
        <TypewriterEffect 
          text="DOUBLE EXCEL" 
          speed={120} 
          delay={800}
          className="text-white"
          repeat={true}
          repeatDelay={5000}
        />
      </div>
      <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl border border-gray-700" style={{ height: '65vh', margin: '2rem', padding: '1.5rem' }}>
        <div className="h-full rounded-xl overflow-hidden shadow-inner">
          <Terminal
            projects={projects}
            currentProjectId={currentProjectId}
            projectData={projectData}
            onOpenProject={onOpenProject}
            onExportFile={onExportFile}
          />
        </div>
      </div>
    </main>
    
    {/* News Panel */}
    <aside className="w-96 bg-gradient-to-b from-gray-800 to-gray-900 p-6 overflow-y-auto border-l border-gray-600 shadow-2xl">
      <NewsPanel />
    </aside>
  </div>
);

export default Dashboard; 