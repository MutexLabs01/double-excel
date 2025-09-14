import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import { ProjectData, Version, FileItem, SpreadsheetData } from './types/project';
import { generateId } from './utils/helpers';
import { SignedIn, SignedOut, SignIn, useUser } from '@clerk/clerk-react';
import Modal from './components/Modal';
import Dashboard from './components/Dashboard';
import HeaderBar from './components/HeaderBar';
import FileActionBar from './components/FileActionBar';
import MainContent from './components/MainContent';
import HistoryPanel from './components/HistoryPanel';
import DiffPanel from './components/DiffPanel';
import MLPanel from './components/MLPanel';
import ImportModal from './components/ImportModal';
import EDAPage from './pages/EDAPage';
import MLPage from './pages/MLPage';
import HistoryPage from './pages/HistoryPage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjectData } from './hooks/useProjectData';
import { useNavigation } from './hooks/useNavigation';

function App() {
  const { user } = useUser();
  
  // Project management state
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showProjectDashboard, setShowProjectDashboard] = useState(false);
  
  // Modal state
  const [modal, setModal] = useState<null | { 
    type: 'project' | 'sheet' | 'chart' | 'financial_model' | 'rename' | 'checkpoint', 
    onSubmit: (name: string, extra?: string) => void, 
    initial?: string, 
    extraLabel?: string 
  }>(null);
  const [modalInput, setModalInput] = useState('');
  const [modalExtra, setModalExtra] = useState('');
  const [shareLink, setShareLink] = useState<string | null>(null);
  
  // UI state
  const [showHistory, setShowHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [compareVersion, setCompareVersion] = useState<string>('');
  const [showML, setShowML] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Custom hooks
  const projectData = useProjectData(currentProjectId);
  const navigation = useNavigation();

  // Helper to get user-specific key
  const getUserKey = (key: string) => {
    return user ? `${user.id}:${key}` : key;
  };

  // Load projects from localStorage on mount or when user changes
  useEffect(() => {
    if (!user) return;
    const savedProjects = localStorage.getItem(getUserKey('projects'));
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      setProjects([]);
    }
  }, [user]);

  // Save projects to localStorage when changed
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(getUserKey('projects'), JSON.stringify(projects));
  }, [projects, user]);

  // When a project is selected, hide dashboard
  useEffect(() => {
    if (currentProjectId) {
      setShowProjectDashboard(false);
    }
  }, [currentProjectId]);

  // Project management functions
  const createCheckpoint = useCallback(() => {
    setModal({
      type: 'checkpoint',
      onSubmit: (name, description) => {
        projectData.createCheckpoint(name, description);
      },
      initial: `Checkpoint ${projectData.versions.length + 1}`,
      extraLabel: 'Description (optional)'
    });
  }, [projectData]);

  const showDiffView = useCallback((versionId: string) => {
    setCompareVersion(versionId);
    setShowDiff(true);
  }, []);

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (projectData.unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [projectData.unsavedChanges]);

  // Add project creation logic
  const createNewProject = useCallback((name: string) => {
    if (!user) return;
    const id = generateId();
    setProjects(prev => [...prev, { id, name }]);
    setCurrentProjectId(id);
    setVersions([]);
    setCurrentVersion('');
    setActiveFile(null);
    setUnsavedChanges(false);
  }, [user]);

  // Add a function to share the project
  const shareProject = useCallback(() => {
    if (!user || !currentProjectId) return;
    // Share functionality can be implemented later
  }, [user, currentProjectId]);

  // On mount, check if URL is /projects/:id and set currentProjectId
  useEffect(() => {
    const match = window.location.pathname.match(/^\/projects\/(.+)$/);
    if (match) {
      setCurrentProjectId(match[1]);
      setShowProjectDashboard(false);
    }
  }, []);
  // When a project is opened, update the URL
  const handleOpenProject = useCallback((id: string) => {
    setCurrentProjectId(id);
    setShowProjectDashboard(false);
    window.history.pushState({}, '', `/projects/${id}`);
  }, []);

  const handleShare = useCallback(() => {
    if (!currentProjectId) return;
    const email = prompt('Enter email to share this project with:');
    if (email) {
      shareProject();
      setShareLink(window.location.origin + '/projects/' + currentProjectId);
    }
  }, [currentProjectId, shareProject]);

  // UI handlers
  const handleShowML = useCallback(() => {
    setShowML(true);
  }, []);

  const handleCloseML = useCallback(() => {
    setShowML(false);
  }, []);

  const handleShowImportModal = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const handleCloseImportModal = useCallback(() => {
    setShowImportModal(false);
  }, []);

  // In the dashboard UI, show project list and create button
  return (
    <>
      <SignedIn>
        {showProjectDashboard || !currentProjectId ? (
          <Dashboard
            projects={projects}
            currentProjectId={currentProjectId}
            projectData={{ files: {}, folders: {} }}
            onCreateProject={createNewProject}
            onOpenProject={handleOpenProject}
            onShowModal={(type, onSubmit) => setModal({ type, onSubmit })}
            onExportFile={(filename) => {
              console.log(`Exporting file: ${filename}`);
            }}
          />
        ) : (
          <LocalProjectRoom
            currentProjectId={currentProjectId}
            projects={projects}
            setShowProjectDashboard={setShowProjectDashboard}
            createCheckpoint={createCheckpoint}
            showDiffView={showDiffView}
            compareVersion={compareVersion}
            shareLink={shareLink || undefined}
            handleShare={handleShare}
            setModal={setModal}
            handleShowML={handleShowML}
            handleCloseML={handleCloseML}
            showML={showML}
            showImportModal={showImportModal}
            handleShowImportModal={handleShowImportModal}
            handleCloseImportModal={handleCloseImportModal}
            projectData={projectData}
            navigation={navigation}
          />
        )}
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setModalInput(''); setModalExtra(''); }}
        title={
          modal?.type === 'project' ? 'Create Project'
          : modal?.type === 'sheet' ? 'Create Sheet'
          : modal?.type === 'chart' ? 'Create Chart'
          : modal?.type === 'financial_model' ? 'Create Financial Model'
          : modal?.type === 'rename' ? 'Rename File'
          : modal?.type === 'checkpoint' ? 'Create Checkpoint'
          : ''
        }
        actions={[
          <button
            key="cancel"
            className="px-4 py-2 rounded bg-gray-200 text-gray-700"
            onClick={() => { setModal(null); setModalInput(''); setModalExtra(''); }}
          >Cancel</button>,
          <button
            key="create"
            className="px-4 py-2 rounded bg-green-600 text-white"
            disabled={!modalInput.trim()}
            onClick={() => {
              if (modal && modalInput.trim()) {
                modal.onSubmit(modalInput.trim(), modalExtra);
                setModal(null); setModalInput(''); setModalExtra('');
              }
            }}
          >{modal?.type === 'rename' ? 'Rename' : 'Create'}</button>
        ]}
      >
        <input
          autoFocus
          className="w-full border rounded px-3 py-2 text-sm mb-2"
          placeholder={modal?.type === 'rename' ? 'Enter new name...' : 'Enter name...'}
          value={modalInput}
          onChange={e => setModalInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && modal && modalInput.trim()) {
              modal.onSubmit(modalInput.trim(), modalExtra);
              setModal(null); setModalInput(''); setModalExtra('');
            }
          }}
        />
        {modal?.extraLabel && (
          <input
            className="w-full border rounded px-3 py-2 text-sm mt-2"
            placeholder={modal.extraLabel}
            value={modalExtra}
            onChange={e => setModalExtra(e.target.value)}
          />
        )}
      </Modal>
    </>
  );
}

function LocalProjectRoom({
  currentProjectId,
  projects,
  setShowProjectDashboard,
  createCheckpoint,
  showDiffView,
  compareVersion,
  shareLink,
  handleShare,
  setModal,
  handleShowML,
  handleCloseML,
  showML,
  showImportModal,
  handleShowImportModal,
  handleCloseImportModal,
  projectData,
  navigation
}: {
  currentProjectId: string;
  projects: {id: string, name: string}[];
  setShowProjectDashboard: (b: boolean) => void;
  createCheckpoint: () => void;
  showDiffView: (id: string) => void;
  compareVersion: string;
  shareLink: string | undefined;
  handleShare: () => void;
  setModal: any;
  handleShowML: () => void;
  handleCloseML: () => void;
  showML: boolean;
  showImportModal: boolean;
  handleShowImportModal: () => void;
  handleCloseImportModal: () => void;
  projectData: ReturnType<typeof useProjectData>;
  navigation: ReturnType<typeof useNavigation>;
}) {
  const activeFileData = projectData.getActiveFileData();

  // Import data handler
  const handleImportData = useCallback(async (data: any[][], columns?: string[]) => {
    projectData.importData(data, columns);
    handleCloseImportModal();
  }, [projectData, handleCloseImportModal]);

  // Handle page navigation
  if (navigation.currentPage === 'eda') {
    return (
      <EDAPage
        projectData={projectData.projectData}
        onBack={navigation.navigateToMain}
      />
    );
  }

  if (navigation.currentPage === 'ml') {
    return (
      <MLPage
        projectData={projectData.projectData}
        onBack={navigation.navigateToMain}
      />
    );
  }

  if (navigation.currentPage === 'history') {
    return (
      <HistoryPage
        versions={projectData.versions}
        currentVersion={projectData.currentVersion}
        onRestore={projectData.restoreVersion}
        onShowDiff={showDiffView}
        onBack={navigation.navigateToMain}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${navigation.sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        <div className="flex items-center justify-between p-2 border-b">
          {!navigation.sidebarCollapsed && (
            <FileActionBar
              projectName={projects.find(p => p.id === currentProjectId)?.name || 'Double Excel'}
            />
          )}
          <button
            onClick={navigation.toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title={navigation.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {navigation.sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        {!navigation.sidebarCollapsed && (
          <Sidebar
            projectData={projectData.projectData}
            activeFile={projectData.activeFile}
            onFileSelect={projectData.selectFile}
            onFileDelete={projectData.deleteFile}
            onFileRename={(fileId, currentName) => setModal({ type: 'rename', onSubmit: (name: string) => projectData.renameFile(fileId, name), initial: currentName })}
            onCreateFolder={projectData.createNewFolder}
          />
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <HeaderBar
          fileName={activeFileData?.name || ''}
          fileType={activeFileData?.type === 'spreadsheet' ? 'Spreadsheet' : 'Chart'}
          versionName={projectData.getCurrentVersionName()}
          unsavedChanges={projectData.unsavedChanges}
          onBack={() => setShowProjectDashboard(true)}
          onSave={createCheckpoint}
          onShowHistory={navigation.navigateToHistory}
          onExport={() => projectData.exportProject(projects.find(p => p.id === currentProjectId)?.name || 'project')}
          onImport={handleShowImportModal}
          onShare={handleShare}
          shareLink={shareLink || undefined}
          onShowML={navigation.navigateToML}
          onCreateSheet={(name: string) => projectData.createNewFile(name, 'spreadsheet')}
          onCreateChart={(name: string) => projectData.createNewFile(name, 'chart')}
          onCreateFinancialModel={(name: string) => projectData.createNewFile(name, 'financial_model')}
          onNavigateToEDA={navigation.navigateToEDA}
        />
        <main className="flex-1 flex">
          <div className="flex-1">
            <MainContent
              activeFileData={activeFileData}
              updateFileData={projectData.updateFile}
              getAllSpreadsheetFiles={projectData.getAllSpreadsheetFiles}
              projectData={projectData.projectData}
              createNewFile={projectData.createNewFile}
              showDiff={false}
            />
          </div>
        </main>
      </div>
      
      {/* ML Panel */}
      {showML && (
        <MLPanel
          projectData={projectData.projectData}
          onClose={handleCloseML}
        />
      )}
      
      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={handleCloseImportModal}
        onImport={handleImportData}
      />
    </div>
  );
}


export default App;