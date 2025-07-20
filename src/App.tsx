import React, { useState, useEffect, useCallback } from 'react';
import { Save, History, RotateCcw, Download, Upload, GitBranch, Plus, FolderOpen } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Spreadsheet from './components/Spreadsheet';
import ChartEditor from './components/ChartEditor';
import VersionHistory from './components/VersionHistory';
import DiffViewer from './components/DiffViewer';
import { ProjectData, Version, FileItem, SpreadsheetData } from './types/project';
import { generateId, formatDate, spreadsheetDataToCSV } from './utils/helpers';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { SignedIn, SignedOut, SignIn, SignUp, UserButton, useUser } from '@clerk/clerk-react';
import Modal from './components/Modal';
import Dashboard from './components/Dashboard';
import HeaderBar from './components/HeaderBar';
import FileActionBar from './components/FileActionBar';
import MainContent from './components/MainContent';
import HistoryPanel from './components/HistoryPanel';
import DiffPanel from './components/DiffPanel';
import FinancialModeling from './components/FinancialModeling';

function App() {
  const { user } = useUser();
  const [projectData, setProjectData] = useState<ProjectData>({
    files: {},
    folders: {}
  });

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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProjectData = localStorage.getItem('project-data');
    const savedVersions = localStorage.getItem('project-versions');
    const savedCurrentVersion = localStorage.getItem('current-version');
    const savedActiveFile = localStorage.getItem('active-file');

    if (savedProjectData) {
      setProjectData(JSON.parse(savedProjectData));
    }
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
    const projectDataStr = localStorage.getItem(getUserKey(`project-data-${currentProjectId}`));
    const versionsStr = localStorage.getItem(getUserKey(`project-versions-${currentProjectId}`));
    const currentVersionStr = localStorage.getItem(getUserKey(`current-version-${currentProjectId}`));
    const activeFileStr = localStorage.getItem(getUserKey(`active-file-${currentProjectId}`));
    if (projectDataStr) setProjectData(JSON.parse(projectDataStr));
    if (versionsStr) setVersions(JSON.parse(versionsStr));
    if (currentVersionStr) setCurrentVersion(currentVersionStr);
    if (activeFileStr) setActiveFile(activeFileStr);
    setShowProjectDashboard(false);
  }, [currentProjectId, user]);

  // Save project data to localStorage with project id
  const saveProjectDataForCurrent = useCallback(() => {
    if (!user || !currentProjectId) return;
    localStorage.setItem(getUserKey(`project-data-${currentProjectId}`), JSON.stringify(projectData));
    localStorage.setItem(getUserKey(`project-versions-${currentProjectId}`), JSON.stringify(versions));
    localStorage.setItem(getUserKey(`current-version-${currentProjectId}`), currentVersion);
    localStorage.setItem(getUserKey(`active-file-${currentProjectId}`), activeFile || '');
  }, [user, currentProjectId, projectData, versions, currentVersion, activeFile]);

  // Call saveProjectDataForCurrent when relevant data changes
  useEffect(() => {
    saveProjectDataForCurrent();
  }, [saveProjectDataForCurrent]);

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

  const saveProjectData = useCallback(() => {
    localStorage.setItem('project-data', JSON.stringify(projectData));
  }, [projectData]);

  const createNewFile = useCallback((name: string, type: 'spreadsheet' | 'chart' | 'financial_model', parentFolder?: string) => {
    const fileId = generateId();
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

    setProjectData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [fileId]: newFile
      }
    }));

    setActiveFile(fileId);
    setUnsavedChanges(true);
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
    setUnsavedChanges(true);
  }, []);

  const updateFileData = useCallback((fileId: string, data: any) => {
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
    setUnsavedChanges(true);
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
    setUnsavedChanges(true);
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
    setUnsavedChanges(true);
  }, []);

  const createCheckpoint = useCallback(() => {
    setModal({
      type: 'checkpoint',
      onSubmit: (name, description) => {
        const newVersion: Version = {
          id: generateId(),
          name,
          timestamp: Date.now(),
          projectData: JSON.parse(JSON.stringify(projectData)),
          description: description || ''
        };
        const updatedVersions = [...versions, newVersion];
        setVersions(updatedVersions);
        setCurrentVersion(newVersion.id);
        setUnsavedChanges(false);
        localStorage.setItem('project-versions', JSON.stringify(updatedVersions));
        localStorage.setItem('current-version', newVersion.id);
        saveProjectData();
      },
      initial: `Checkpoint ${versions.length + 1}`,
      extraLabel: 'Description (optional)'
    });
  }, [projectData, versions, saveProjectData]);

  const restoreVersion = useCallback((versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setProjectData(version.projectData);
      setCurrentVersion(versionId);
      setUnsavedChanges(false);
      setShowHistory(false);
      localStorage.setItem('project-data', JSON.stringify(version.projectData));
      localStorage.setItem('current-version', versionId);
    }
  }, [versions]);

  const exportProject = useCallback(async () => {
    const zip = new JSZip();
    // Export all spreadsheets as CSV
    Object.values(projectData.files).forEach(file => {
      if (file.type === 'spreadsheet') {
        const csv = spreadsheetDataToCSV(file.data as SpreadsheetData);
        zip.file(`${file.name || 'Sheet'}.csv`, csv);
      }
    });
    // Export all charts as images
    const chartNodes = document.querySelectorAll('.recharts-wrapper');
    let chartIndex = 0;
    for (const file of Object.values(projectData.files)) {
      if (file.type === 'chart') {
        const chartNode = chartNodes[chartIndex];
        if (chartNode) {
          // Use html2canvas to render chart as image
          // Wait for chart to be visible
          const canvas = await html2canvas(chartNode as HTMLElement);
          const dataUrl = canvas.toDataURL('image/png');
          zip.file(`${file.name || 'Chart'}.png`, dataUrl.split(',')[1], {base64: true});
        }
        chartIndex++;
      }
    }
    // Generate zip and download
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projects.find(p => p.id === currentProjectId)?.name || 'project'}-export.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [projectData, projects, currentProjectId]);

  // CSV import logic
  const importCSV = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Parse CSV to SpreadsheetData
        const rows = text.split(/\r?\n/).map(row => row.split(','));
        const data: any = {};
        for (let r = 0; r < rows.length; r++) {
          for (let c = 0; c < rows[r].length; c++) {
            const value = rows[r][c].replace(/^"|"$/g, '').replace(/""/g, '"');
            data[`${r}-${c}`] = { value, formula: null };
          }
        }
        const name = file.name.replace(/\.csv$/, '');
        createNewFile(name, 'spreadsheet');
        // Wait for file to be created and set as active
        setTimeout(() => {
          if (activeFile) updateFileData(activeFile, data);
        }, 100);
      };
      reader.readAsText(file);
    }
  }, [createNewFile, updateFileData, activeFile]);

  const importProject = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          if (importedData.projectData && importedData.versions) {
            setProjectData(importedData.projectData);
            setVersions(importedData.versions);
            setCurrentVersion(importedData.currentVersion);
            setUnsavedChanges(false);
            
            localStorage.setItem('project-data', JSON.stringify(importedData.projectData));
            localStorage.setItem('project-versions', JSON.stringify(importedData.versions));
            localStorage.setItem('current-version', importedData.currentVersion);
          }
        } catch (error) {
          alert('Error importing file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const getCurrentVersionName = useCallback(() => {
    const version = versions.find(v => v.id === currentVersion);
    return version?.name || 'Unknown Version';
  }, [versions, currentVersion]);

  const showDiffView = useCallback((versionId: string) => {
    setCompareVersion(versionId);
    setShowDiff(true);
  }, []);

  const getActiveFileData = useCallback(() => {
    if (!activeFile || !projectData.files[activeFile]) return null;
    return projectData.files[activeFile];
  }, [activeFile, projectData.files]);

  const getAllSpreadsheetFiles = useCallback(() => {
    return Object.values(projectData.files).filter(file => file.type === 'spreadsheet');
  }, [projectData.files]);

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

  const activeFileData = getActiveFileData();

  // Add project creation logic
  const createNewProject = (name: string) => {
    if (!user) return;
    const id = generateId();
    setProjects(prev => [...prev, { id, name }]);
    setCurrentProjectId(id);
    // Reset project data for new project
    setProjectData({ files: {}, folders: {} });
    setVersions([]);
    setCurrentVersion('');
    setActiveFile(null);
    setUnsavedChanges(false);
  };

  // In the dashboard UI, show project list and create button
  return (
    <>
      <SignedIn>
        {showProjectDashboard ? (
          <Dashboard
            projects={projects}
            currentProjectId={currentProjectId}
            projectData={projectData}
            onCreateProject={createNewProject}
            onOpenProject={setCurrentProjectId}
            onShowModal={(type, onSubmit) => setModal({ type, onSubmit })}
            onExportFile={(filename) => {
              // Handle file export - you can implement this based on your export logic
              console.log(`Exporting file: ${filename}`);
            }}
          />
        ) : (
          <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
              <FileActionBar
                projectName={projects.find(p => p.id === currentProjectId)?.name || 'Double Excel'}
                onNewSheet={() => setModal({ type: 'sheet', onSubmit: (name) => createNewFile(name, 'spreadsheet') })}
                onNewChart={() => setModal({ type: 'chart', onSubmit: (name) => createNewFile(name, 'chart') })}
                onNewFinancialModel={() => setModal({ type: 'financial_model', onSubmit: (name) => createNewFile(name, 'financial_model') })}
              />
              <Sidebar
                projectData={projectData}
                activeFile={activeFile}
                onFileSelect={setActiveFile}
                onFileDelete={deleteFile}
                onFileRename={(fileId, currentName) => setModal({ type: 'rename', onSubmit: (name) => renameFile(fileId, name), initial: currentName })}
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
                onImport={importCSV}
                showHistory={showHistory}
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
                    onRestore={restoreVersion}
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
          </div>
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


export default App;