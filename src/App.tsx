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
import MLPanel from './components/MLPanel';
import { RoomProvider, useStorage, useMutation } from '@liveblocks/react';
import { LiveObject } from '@liveblocks/client';

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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProjectData = localStorage.getItem('project-data');
    const savedVersions = localStorage.getItem('project-versions');
    const savedCurrentVersion = localStorage.getItem('current-version');
    const savedActiveFile = localStorage.getItem('active-file');

    // if (savedProjectData) {
    //   updateProjectData(JSON.parse(savedProjectData));
    // }
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
    // if (projectDataStr) updateProjectData(JSON.parse(projectDataStr));
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

    // updateProjectData(prev => ({
    //   ...prev,
    //   files: {
    //     ...prev.files,
    //     [fileId]: newFile
    //   }
    // }));

    setActiveFile(fileId);
    setUnsavedChanges(true);
    return fileId;
  }, []);

  const createNewFolder = useCallback((name: string, parentFolder?: string) => {
    const folderId = generateId();
    // updateProjectData(prev => ({
    //   ...prev,
    //   folders: {
    //     ...prev.folders,
    //     [folderId]: {
    //       id: folderId,
    //       name,
    //       parentFolder,
    //       createdAt: Date.now()
    //     }
    //   }
    // }));
    setUnsavedChanges(true);
  }, []);

  const updateFileData = useCallback((fileId: string, data: any) => {
    // updateProjectData(prev => ({
    //   ...prev,
    //   files: {
    //     ...prev.files,
    //     [fileId]: {
    //       ...prev.files[fileId],
    //       data,
    //       modifiedAt: Date.now()
    //     }
    //   }
    // }));
    setUnsavedChanges(true);
  }, []);

  const deleteFile = useCallback((fileId: string) => {
    // updateProjectData(prev => {
    //   const newFiles = { ...prev.files };
    //   delete newFiles[fileId];
    //   return {
    //     ...prev,
    //     files: newFiles
    //   };
    // });
    
    if (activeFile === fileId) {
      setActiveFile(null);
    }
    setUnsavedChanges(true);
  }, [activeFile]);

  const renameFile = useCallback((fileId: string, newName: string) => {
    // updateProjectData(prev => ({
    //   ...prev,
    //   files: {
    //     ...prev.files,
    //     [fileId]: {
    //       ...prev.files[fileId],
    //       name: newName,
    //       modifiedAt: Date.now()
    //     }
    //   }
    // }));
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

  const exportProject = useCallback(async () => {
    const zip = new JSZip();
    // Export all spreadsheets as CSV
    Object.values({ files: {}, folders: {} }).forEach(file => {
      if (file.type === 'spreadsheet') {
        const csv = spreadsheetDataToCSV(file.data as SpreadsheetData);
        zip.file(`${file.name || 'Sheet'}.csv`, csv);
      }
    });
    // Export all charts as images
    const chartNodes = document.querySelectorAll('.recharts-wrapper');
    let chartIndex = 0;
    for (const file of Object.values({ files: {}, folders: {} })) {
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
  }, [projects, currentProjectId]);

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
            // updateProjectData(importedData.projectData);
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
    if (!activeFile || !({ files: {}, folders: {} })[activeFile]) return null;
    return ({ files: {}, folders: {} })[activeFile];
  }, [activeFile]);

  const getAllSpreadsheetFiles = useCallback(() => {
    return Object.values({ files: {}, folders: {} }).filter(file => file.type === 'spreadsheet');
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

  const activeFileData = getActiveFileData();

  // Add project creation logic
  const createNewProject = useCallback((name: string) => {
    if (!user) return;
    const id = generateId();
    setProjects(prev => [...prev, { id, name }]);
    setCurrentProjectId(id);
    // Use primaryEmailAddress if available, otherwise fallback to user.id
    const ownerId = user.primaryEmailAddress?.emailAddress || user.id;
    // updateProjectData({ files: {}, folders: {}, owner: ownerId, sharedWith: [] });
    setVersions([]);
    setCurrentVersion('');
    setActiveFile(null);
    setUnsavedChanges(false);
  }, [user]);

  // Add a function to share the project
  const shareProject = useCallback((email: string) => {
    if (!user || !currentProjectId) return;
    // updateProjectData(prev => {
    //   const sharedWith = prev.sharedWith ? [...prev.sharedWith] : [];
    //   if (!sharedWith.includes(email)) {
    //     sharedWith.push(email);
    //   }
    //   return { ...prev, sharedWith };
    // });
  }, [user, currentProjectId]);

  // Add a function to check if user has access
  const userHasAccess = useCallback(() => {
    if (!user || !currentProjectId) return false;
    const userIdOrEmail = user.primaryEmailAddress?.emailAddress || user.id;
    // if (projectData.owner === userIdOrEmail) return true;
    // if (projectData.sharedWith && projectData.sharedWith.includes(userIdOrEmail)) return true;
    return false;
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
      shareProject(email);
      setShareLink(window.location.origin + '/projects/' + currentProjectId);
    }
  }, [currentProjectId, shareProject]);

  const handleShowML = useCallback(() => {
    setShowML(true);
  }, []);

  const handleCloseML = useCallback(() => {
    setShowML(false);
  }, []);

  // In the dashboard UI, show project list and create button
  return (
    <>
      <SignedIn>
        {showProjectDashboard || !currentProjectId ? (
          <>
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
          /></>
        ) : (
          <RoomProvider
            id={currentProjectId}
            initialStorage={{ project: new LiveObject({ files: {}, folders: {} }) }}
          >
            <ProjectRoom
              currentProjectId={currentProjectId}
              user={user}
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
              setCompareVersion={setCompareVersion}
              shareLink={shareLink || undefined}
              handleShare={handleShare}
              setModal={setModal}
              setModalInput={setModalInput}
              setModalExtra={setModalExtra}
              handleShowML={handleShowML}
              handleCloseML={handleCloseML}
              showML={showML}
            />
          </RoomProvider>
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

function ProjectRoom({
  currentProjectId,
  user,
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
  setCompareVersion,
  shareLink,
  handleShare,
  setModal,
  setModalInput,
  setModalExtra,
  handleShowML,
  handleCloseML,
  showML
}: {
  currentProjectId: string;
  user: any;
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
  setCompareVersion: (id: string) => void;
  shareLink: string | undefined;
  handleShare: () => void;
  setModal: any;
  setModalInput: any;
  setModalExtra: any;
  handleShowML: () => void;
  handleCloseML: () => void;
  showML: boolean;
}) {
  // Liveblocks storage for project data
  const liveblocksProject = useStorage((root: any) => root["project"]);
  const setLiveblocksProject = useMutation(({ storage }, newProjectData: ProjectData) => {
    storage.set("project", new LiveObject(newProjectData));
  }, []);

  // Only allow mutations if storage is loaded
  const canMutate = !!liveblocksProject;

  // All project data reads/writes go through Liveblocks
  const effectiveProjectData = liveblocksProject || { files: {}, folders: {} };

  // Compute activeFile state locally for this room
  const [activeFile, setActiveFile] = useState<string | null>(null);
  
  // Helper function to get active file data
  const getActiveFileData = (activeFile: string | null) => {
    if (!activeFile || !effectiveProjectData.files[activeFile]) return null;
    return effectiveProjectData.files[activeFile];
  };
  
  const activeFileData = getActiveFileData(activeFile);

  // Create a local restoreVersion function that works with Liveblocks
  const localRestoreVersion = useCallback((versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version && canMutate) {
      // Update Liveblocks storage with the restored version data
      setLiveblocksProject(version.projectData);
      
      // Handle activeFile state - if current activeFile doesn't exist in restored data, set to first available file
      const restoredFiles = Object.values(version.projectData.files);
      if (restoredFiles.length > 0) {
        if (!activeFile || !version.projectData.files[activeFile]) {
          // Set activeFile to the first available file in the restored version
          const firstFile = restoredFiles[0] as any;
          setActiveFile(firstFile.id);
        }
        // If activeFile exists in restored data, keep it
      } else {
        // No files in restored version, clear activeFile
        setActiveFile(null);
      }
      
      // Also call the main restoreVersion to update localStorage and other state
      mainRestoreVersion(versionId);
    }
  }, [versions, canMutate, setLiveblocksProject, mainRestoreVersion, activeFile, setActiveFile]);

  // File operations with guards
  const wrappedUpdateFileData = (fileId: any, data: any) => {
    if (!canMutate) return;
    setLiveblocksProject({
      ...effectiveProjectData,
      files: {
        ...effectiveProjectData.files,
        [fileId]: {
          ...effectiveProjectData.files[fileId],
          data,
          modifiedAt: Date.now()
        }
      }
    });
  };
  const wrappedCreateNewFile = (name: any, type: any, parentFolder?: any) => {
    if (!canMutate) return;
    const fileId = generateId();
    const newFile = {
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
    setLiveblocksProject({
      ...effectiveProjectData,
      files: {
        ...effectiveProjectData.files,
        [fileId]: newFile
      }
    });
    return fileId;
  };
  const wrappedCreateNewFolder = (name: any, parentFolder?: any) => {
    if (!canMutate) return;
    const folderId = generateId();
    setLiveblocksProject({
      ...effectiveProjectData,
      folders: {
        ...effectiveProjectData.folders,
        [folderId]: {
          id: folderId,
          name,
          parentFolder,
          createdAt: Date.now()
        }
      }
    });
  };
  const wrappedDeleteFile = (fileId: any) => {
    if (!canMutate) return;
    const newFiles = { ...effectiveProjectData.files };
    delete newFiles[fileId];
    setLiveblocksProject({
      ...effectiveProjectData,
      files: newFiles
    });
  };
  const wrappedRenameFile = (fileId: any, newName: any) => {
    if (!canMutate) return;
    setLiveblocksProject({
      ...effectiveProjectData,
      files: {
        ...effectiveProjectData.files,
        [fileId]: {
          ...effectiveProjectData.files[fileId],
          name: newName,
          modifiedAt: Date.now()
        }
      }
    });
  };

  // Spreadsheet utilities
  const getAllSpreadsheetFiles = (): FileItem[] => {
    return Object.values(effectiveProjectData.files).filter((file: any) => file.type === 'spreadsheet') as FileItem[];
  };

  // Export project logic
  const exportProject = useCallback(async () => {
    if (!canMutate) return;
    const zip = new JSZip();
    Object.values(effectiveProjectData.files).forEach((file: any) => {
      if (file.type === 'spreadsheet') {
        const csv = spreadsheetDataToCSV(file.data as SpreadsheetData);
        zip.file(`${file.name || 'Sheet'}.csv`, csv);
      }
    });
    const chartNodes = document.querySelectorAll('.recharts-wrapper');
    let chartIndex = 0;
    for (const file of Object.values(effectiveProjectData.files)) {
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
  }, [effectiveProjectData, projects, currentProjectId, canMutate]);

  // CSV import logic
  const importCSV = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canMutate) return;
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split(/\r?\n/).map(row => row.split(','));
        const data: any = {};
        for (let r = 0; r < rows.length; r++) {
          for (let c = 0; c < rows[r].length; c++) {
            const value = rows[r][c].replace(/^"|"$/g, '').replace(/""/g, '"');
            data[`${r}-${c}`] = { value, formula: null };
          }
        }
        const name = file.name.replace(/\.csv$/, '');
        const newFileId = wrappedCreateNewFile(name, 'spreadsheet');
        setTimeout(() => {
          wrappedUpdateFileData(newFileId, data);
        }, 100);
      };
      reader.readAsText(file);
    }
  }, [wrappedCreateNewFile, wrappedUpdateFileData, canMutate]);

  // Show loading spinner/message if storage is not loaded
  if (!canMutate) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500 text-lg">Loading project data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <FileActionBar
          projectName={projects.find(p => p.id === currentProjectId)?.name || 'Double Excel'}
          onNewSheet={() => setModal({ type: 'sheet', onSubmit: (name: string) => wrappedCreateNewFile(name, 'spreadsheet') })}
          onNewChart={() => setModal({ type: 'chart', onSubmit: (name: string) => wrappedCreateNewFile(name, 'chart') })}
          onNewFinancialModel={() => setModal({ type: 'financial_model', onSubmit: (name: string) => wrappedCreateNewFile(name, 'financial_model') })}
        />
        <Sidebar
          projectData={effectiveProjectData}
          activeFile={activeFile}
          onFileSelect={setActiveFile}
          onFileDelete={wrappedDeleteFile}
          onFileRename={(fileId, currentName) => setModal({ type: 'rename', onSubmit: (name: string) => wrappedRenameFile(fileId, name), initial: currentName })}
          onCreateFolder={wrappedCreateNewFolder}
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
          onShare={handleShare}
          shareLink={shareLink || undefined}
          onShowML={handleShowML}
        />
        <main className="flex-1 flex">
          <div className={`flex-1 ${showHistory || showDiff ? 'lg:w-2/3' : 'w-full'}`}>
            <MainContent
              activeFileData={activeFileData}
              updateFileData={wrappedUpdateFileData}
              getAllSpreadsheetFiles={getAllSpreadsheetFiles}
              projectData={effectiveProjectData}
              createNewFile={wrappedCreateNewFile}
              showDiff={showDiff}
            />
          </div>
          {showHistory && (
            <HistoryPanel
              versions={versions}
              currentVersion={currentVersion}
              onRestore={localRestoreVersion}
              onShowDiff={showDiffView}
              onClose={() => setShowHistory(false)}
            />
          )}
          {showDiff && (
            <DiffPanel
              projectData={effectiveProjectData}
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
          projectData={effectiveProjectData}
          onClose={handleCloseML}
        />
      )}
    </div>
  );
}


export default App;