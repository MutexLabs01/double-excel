import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import { ProjectData, Version, FileItem, SpreadsheetData } from './types/project';
import { generateId, spreadsheetDataToCSV } from './utils/helpers';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
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

function App() {
  const { user } = useUser();
  // Use Liveblocks storage for projectData
  // const liveblocksProjectData = useStorage<ProjectData>('projectData');
  // const projectData = liveblocksProjectData || { files: {}, folders: {} };

  // Mutation to update projectData in Liveblocks
  // const updateProjectData = useMutation(({ storage }, updater: (prev: ProjectData) => ProjectData) => {
  //   const prev = storage.get('projectData');
  //   storage.set('projectData', updater(prev || { files: {}, folders: {} }));
  // }, []);

  // Helper to get user-specific key
  const getUserKey = (key: string) => {
    return user ? `${user.id}:${key}` : key;
  };


  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [compareVersion, setCompareVersion] = useState<string>('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  // Add state for dashboard/project view
  const [showProjectDashboard, setShowProjectDashboard] = useState(false);
  // Add project management state
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  // Add modal state
  const [modal, setModal] = useState<null | { type: 'project' | 'sheet' | 'chart' | 'financial_model' | 'rename' | 'checkpoint', onSubmit: (name: string, extra?: string) => void, initial?: string, extraLabel?: string }> (null);
  const [modalInput, setModalInput] = useState('');
  const [modalExtra, setModalExtra] = useState('');
  const [shareLink, setShareLink] = useState<string | null>(null);
  
  // Add ML state
  const [showML, setShowML] = useState(false);
  
  // Add import modal state
  const [showImportModal, setShowImportModal] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedVersions = localStorage.getItem('project-versions');
    const savedCurrentVersion = localStorage.getItem('current-version');
    const savedActiveFile = localStorage.getItem('active-file');

    if (savedVersions) {
      setVersions(JSON.parse(savedVersions));
    }
    if (savedCurrentVersion) {
      setCurrentVersion(savedCurrentVersion);
    }
    if (savedActiveFile) {
      setActiveFile(savedActiveFile);
    }

    // Create initial version if none exists
    if (!savedVersions || JSON.parse(savedVersions).length === 0) {
      createInitialVersion();
    }
  }, []);

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

  // When a project is selected, load its data
  useEffect(() => {
    if (!user || !currentProjectId) return;
    const versionsStr = localStorage.getItem(getUserKey(`project-versions-${currentProjectId}`));
    const currentVersionStr = localStorage.getItem(getUserKey(`current-version-${currentProjectId}`));
    const activeFileStr = localStorage.getItem(getUserKey(`active-file-${currentProjectId}`));
    if (versionsStr) setVersions(JSON.parse(versionsStr));
    if (currentVersionStr) setCurrentVersion(currentVersionStr);
    if (activeFileStr) setActiveFile(activeFileStr);
    setShowProjectDashboard(false);
  }, [currentProjectId, user]);

  // Call saveProjectDataForCurrent when relevant data changes
  // useEffect(() => {
  //   saveProjectDataForCurrent();
  // }, [saveProjectDataForCurrent]);

  const createInitialVersion = useCallback(() => {
    const initialVersion: Version = {
      id: generateId(),
      name: 'Initial Project',
      timestamp: Date.now(),
      projectData: { files: {}, folders: {} },
      description: 'Initial empty project'
    };
    setVersions([initialVersion]);
    setCurrentVersion(initialVersion.id);
    localStorage.setItem('project-versions', JSON.stringify([initialVersion]));
    localStorage.setItem('current-version', initialVersion.id);
  }, []);

  // const saveProjectData = useCallback(() => {
  //   localStorage.setItem('project-data', JSON.stringify(projectData));
  // }, [projectData]);

  // These functions are now handled in LocalProjectRoom

  const createCheckpoint = useCallback(() => {
    setModal({
      type: 'checkpoint',
      onSubmit: (name, description) => {
        const newVersion: Version = {
          id: generateId(),
          name,
          timestamp: Date.now(),
          projectData: JSON.parse(JSON.stringify({ files: {}, folders: {} })),
          description: description || ''
        };
        const updatedVersions = [...versions, newVersion];
        setVersions(updatedVersions);
        setCurrentVersion(newVersion.id);
        setUnsavedChanges(false);
        localStorage.setItem('project-versions', JSON.stringify(updatedVersions));
        localStorage.setItem('current-version', newVersion.id);
      },
      initial: `Checkpoint ${versions.length + 1}`,
      extraLabel: 'Description (optional)'
    });
  }, [versions, setVersions, setCurrentVersion, setUnsavedChanges]);

  const restoreVersion = useCallback((versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      // updateProjectData(version.projectData);
      setCurrentVersion(versionId);
      setUnsavedChanges(false);
      setShowHistory(false);
      localStorage.setItem('project-data', JSON.stringify(version.projectData));
      localStorage.setItem('current-version', versionId);
    }
  }, [versions, setCurrentVersion, setUnsavedChanges, setShowHistory]);

  const getCurrentVersionName = useCallback(() => {
    const version = versions.find(v => v.id === currentVersion);
    return version?.name || 'Unknown Version';
  }, [versions, currentVersion]);

  const showDiffView = useCallback((versionId: string) => {
    setCompareVersion(versionId);
    setShowDiff(true);
  }, []);

  useEffect(() => {
    if (activeFile) {
      localStorage.setItem('active-file', activeFile);
    }
  }, [activeFile]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

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
            getCurrentVersionName={getCurrentVersionName}
            unsavedChanges={unsavedChanges}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            showDiff={showDiff}
            setShowDiff={setShowDiff}
            versions={versions}
            currentVersion={currentVersion}
            restoreVersion={restoreVersion}
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
  getCurrentVersionName,
  unsavedChanges,
  showHistory,
  setShowHistory,
  showDiff,
  setShowDiff,
  versions,
  currentVersion,
  restoreVersion: mainRestoreVersion,
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
  handleCloseImportModal
}: {
  currentProjectId: string;
  projects: {id: string, name: string}[];
  setShowProjectDashboard: (b: boolean) => void;
  createCheckpoint: () => void;
  getCurrentVersionName: () => string;
  unsavedChanges: boolean;
  showHistory: boolean;
  setShowHistory: (b: boolean) => void;
  showDiff: boolean;
  setShowDiff: (b: boolean) => void;
  versions: any[];
  currentVersion: string;
  restoreVersion: (id: string) => void;
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
}) {
  // Local state for project data
  const [projectData, setProjectData] = useState<ProjectData>({ files: {}, folders: {} });
  const [activeFile, setActiveFile] = useState<string | null>(null);
  
  // Helper function to get active file data
  const getActiveFileData = (activeFile: string | null) => {
    if (!activeFile || !projectData.files[activeFile]) return null;
    return projectData.files[activeFile];
  };
  
  const activeFileData = getActiveFileData(activeFile);

  // File operations
  const updateFileData = useCallback((fileId: string, data: any) => {
    console.log('updateFileData called with:', { fileId, data });
    setProjectData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [fileId]: {
          ...prev.files[fileId],
          data,
          modifiedAt: Date.now()
        }
      }
    }));
    console.log('File data updated successfully');
  }, []);

  const createNewFile = useCallback((name: string, type: 'spreadsheet' | 'chart' | 'financial_model', parentFolder?: string) => {
    const fileId = generateId();
    console.log('createNewFile called with:', { name, type, parentFolder, fileId });
    const newFile: FileItem = {
      id: fileId,
      name,
      type,
      data: type === 'spreadsheet' ? {} : {
        type: 'bar',
        title: '',
        xAxis: { label: '', data: [] },
        yAxis: { label: '', data: [] },
        sourceFile: '',
        sourceColumns: { x: '', y: '' }
      },
      parentFolder,
      createdAt: Date.now(),
      modifiedAt: Date.now()
    };
    console.log('Creating new file object:', newFile);
    setProjectData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [fileId]: newFile
      }
    }));
    return fileId;
  }, []);

  const createNewFolder = useCallback((name: string, parentFolder?: string) => {
    const folderId = generateId();
    setProjectData(prev => ({
      ...prev,
      folders: {
        ...prev.folders,
        [folderId]: {
          id: folderId,
          name,
          parentFolder,
          createdAt: Date.now()
        }
      }
    }));
  }, []);

  const deleteFile = useCallback((fileId: string) => {
    setProjectData(prev => {
      const newFiles = { ...prev.files };
      delete newFiles[fileId];
      return {
        ...prev,
        files: newFiles
      };
    });
    if (activeFile === fileId) {
      setActiveFile(null);
    }
  }, [activeFile]);

  const renameFile = useCallback((fileId: string, newName: string) => {
    setProjectData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [fileId]: {
          ...prev.files[fileId],
          name: newName,
          modifiedAt: Date.now()
        }
      }
    }));
  }, []);

  // Spreadsheet utilities
  const getAllSpreadsheetFiles = useCallback((): FileItem[] => {
    return Object.values(projectData.files).filter(file => file.type === 'spreadsheet') as FileItem[];
  }, [projectData.files]);

  // Export project logic
  const exportProject = useCallback(async () => {
    const zip = new JSZip();
    Object.values(projectData.files).forEach((file: any) => {
      if (file.type === 'spreadsheet') {
        const csv = spreadsheetDataToCSV(file.data as SpreadsheetData);
        zip.file(`${file.name || 'Sheet'}.csv`, csv);
      }
    });
    const chartNodes = document.querySelectorAll('.recharts-wrapper');
    let chartIndex = 0;
    for (const file of Object.values(projectData.files)) {
      if ((file as any).type === 'chart') {
        const chartNode = chartNodes[chartIndex];
        if (chartNode) {
          const canvas = await html2canvas(chartNode as HTMLElement);
          const dataUrl = canvas.toDataURL('image/png');
          zip.file(`${(file as any).name || 'Chart'}.png`, dataUrl.split(',')[1], {base64: true});
        }
        chartIndex++;
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projects.find(p => p.id === currentProjectId)?.name || 'project'}-export.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [projectData, projects, currentProjectId]);

  // Import data handler
  const handleImportData = useCallback(async (data: any[][], columns?: string[]) => {
    console.log('handleImportData called with:', { data, columns });
    
    try {
      // Convert data to spreadsheet format
      const spreadsheetData: any = {};
      
      // Add headers if provided
      if (columns && columns.length > 0) {
        for (let c = 0; c < columns.length; c++) {
          spreadsheetData[`0-${c}`] = { value: columns[c], formula: null };
        }
      }
      
      // Add data rows
      const startRow = columns ? 1 : 0;
      for (let r = 0; r < data.length; r++) {
        for (let c = 0; c < data[r].length; c++) {
          const value = data[r][c]?.toString() || '';
          spreadsheetData[`${r + startRow}-${c}`] = { value, formula: null };
        }
      }
      
      console.log('Converted spreadsheet data:', spreadsheetData);
      
      // Create new file and set data
      const fileName = `Imported Data ${new Date().toLocaleString()}`;
      console.log('Creating file with name:', fileName);
      const newFileId = createNewFile(fileName, 'spreadsheet');
      console.log('Created new file with ID:', newFileId);
      
      if (!newFileId) {
        console.error('Failed to create new file');
        return;
      }
      
      // Update the file data immediately
      console.log('Updating file data for:', newFileId);
      updateFileData(newFileId, spreadsheetData);
      
      // Set as active file after data is updated
      setActiveFile(newFileId);
      console.log('Set active file to:', newFileId);
      
      handleCloseImportModal();
    } catch (error) {
      console.error('Error in handleImportData:', error);
    }
  }, [createNewFile, updateFileData, handleCloseImportModal]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <FileActionBar
          projectName={projects.find(p => p.id === currentProjectId)?.name || 'Double Excel'}
          onNewSheet={() => setModal({ type: 'sheet', onSubmit: (name: string) => createNewFile(name, 'spreadsheet') })}
          onNewChart={() => setModal({ type: 'chart', onSubmit: (name: string) => createNewFile(name, 'chart') })}
          onNewFinancialModel={() => setModal({ type: 'financial_model', onSubmit: (name: string) => createNewFile(name, 'financial_model') })}
        />
        <Sidebar
          projectData={projectData}
          activeFile={activeFile}
          onFileSelect={setActiveFile}
          onFileDelete={deleteFile}
          onFileRename={(fileId, currentName) => setModal({ type: 'rename', onSubmit: (name: string) => renameFile(fileId, name), initial: currentName })}
          onCreateFolder={createNewFolder}
        />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <HeaderBar
          projectName={projects.find(p => p.id === currentProjectId)?.name || 'Double Excel'}
          fileName={activeFileData?.name || ''}
          fileType={activeFileData?.type === 'spreadsheet' ? 'Spreadsheet' : 'Chart'}
          versionName={getCurrentVersionName()}
          unsavedChanges={unsavedChanges}
          onBack={() => setShowProjectDashboard(true)}
          onSave={createCheckpoint}
          onShowHistory={() => setShowHistory(!showHistory)}
          onExport={exportProject}
          onImport={handleShowImportModal}
          showHistory={showHistory}
          onShare={handleShare}
          shareLink={shareLink || undefined}
          onShowML={handleShowML}
        />
        <main className="flex-1 flex">
          <div className={`flex-1 ${showHistory || showDiff ? 'lg:w-2/3' : 'w-full'}`}>
            <MainContent
              activeFileData={activeFileData}
              updateFileData={updateFileData}
              getAllSpreadsheetFiles={getAllSpreadsheetFiles}
              projectData={projectData}
              createNewFile={createNewFile}
              showDiff={showDiff}
            />
          </div>
          {showHistory && (
            <HistoryPanel
              versions={versions}
              currentVersion={currentVersion}
              onRestore={mainRestoreVersion}
              onShowDiff={showDiffView}
              onClose={() => setShowHistory(false)}
            />
          )}
          {showDiff && (
            <DiffPanel
              projectData={projectData}
              versions={versions}
              compareVersion={compareVersion}
              onClose={() => setShowDiff(false)}
            />
          )}
        </main>
      </div>
      
      {/* ML Panel */}
      {showML && (
        <MLPanel
          projectData={projectData}
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