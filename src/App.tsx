import React, { useState, useEffect, useCallback } from 'react';
import { Save, History, RotateCcw, Download, Upload, GitBranch, Plus, FolderOpen } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Spreadsheet from './components/Spreadsheet';
import ChartEditor from './components/ChartEditor';
import VersionHistory from './components/VersionHistory';
import DiffViewer from './components/DiffViewer';
import { ProjectData, Version, FileItem, SpreadsheetData } from './types/project';
import { generateId, formatDate } from './utils/helpers';

function App() {
  const [projectData, setProjectData] = useState<ProjectData>({
    files: {},
    folders: {}
  });
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [compareVersion, setCompareVersion] = useState<string>('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

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

  const createNewFile = useCallback((name: string, type: 'spreadsheet' | 'chart', parentFolder?: string) => {
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
    const name = prompt('Enter checkpoint name:') || `Checkpoint ${versions.length + 1}`;
    const description = prompt('Enter description (optional):') || '';
    
    const newVersion: Version = {
      id: generateId(),
      name,
      timestamp: Date.now(),
      projectData: JSON.parse(JSON.stringify(projectData)),
      description
    };

    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    setCurrentVersion(newVersion.id);
    setUnsavedChanges(false);
    
    localStorage.setItem('project-versions', JSON.stringify(updatedVersions));
    localStorage.setItem('current-version', newVersion.id);
    saveProjectData();
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

  const exportProject = useCallback(() => {
    const exportData = {
      projectData,
      versions,
      currentVersion,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [projectData, versions, currentVersion]);

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <FolderOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">Double Excel</h1>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const name = prompt('Enter file name:');
                if (name) createNewFile(name, 'spreadsheet');
              }}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Sheet
            </button>
            
            <button
              onClick={() => {
                const name = prompt('Enter chart name:');
                if (name) createNewFile(name, 'chart');
              }}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Chart
            </button>
          </div>
        </div>

        <Sidebar
          projectData={projectData}
          activeFile={activeFile}
          onFileSelect={setActiveFile}
          onFileDelete={deleteFile}
          onFileRename={renameFile}
          onCreateFolder={createNewFolder}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {activeFileData?.name || 'No file selected'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {activeFileData?.type === 'spreadsheet' ? 'Spreadsheet' : 'Chart'} • {getCurrentVersionName()}
                    {unsavedChanges && <span className="text-amber-600 ml-2">• Unsaved changes</span>}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={createCheckpoint}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Checkpoint
                </button>
                
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </button>
                
                <button
                  onClick={exportProject}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </button>
                
                <label className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importProject}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 flex">
          <div className={`flex-1 ${showHistory || showDiff ? 'lg:w-2/3' : 'w-full'}`}>
            {activeFileData ? (
              <div className="h-full bg-white">
                {activeFileData.type === 'spreadsheet' ? (
                  <Spreadsheet
                    data={activeFileData.data as SpreadsheetData}
                    onDataUpdate={(data) => updateFileData(activeFileData.id, data)}
                    readonly={showDiff}
                  />
                ) : (
                  <ChartEditor
                    chartData={activeFileData.data}
                    onDataUpdate={(data) => updateFileData(activeFileData.id, data)}
                    spreadsheetFiles={getAllSpreadsheetFiles()}
                    projectData={projectData}
                  />
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-white">
                <div className="text-center">
                  <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No file selected</h3>
                  <p className="text-gray-500 mb-4">Create a new spreadsheet or chart to get started</p>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        const name = prompt('Enter file name:');
                        if (name) createNewFile(name, 'spreadsheet');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Spreadsheet
                    </button>
                    <button
                      onClick={() => {
                        const name = prompt('Enter chart name:');
                        if (name) createNewFile(name, 'chart');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Chart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="w-80 bg-white border-l border-gray-200">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              <VersionHistory
                versions={versions}
                currentVersion={currentVersion}
                onRestore={restoreVersion}
                onShowDiff={showDiffView}
              />
            </div>
          )}

          {/* Diff Viewer */}
          {showDiff && (
            <div className="w-80 bg-white border-l border-gray-200">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Changes</h2>
                  <button
                    onClick={() => setShowDiff(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              <DiffViewer
                currentData={projectData}
                compareData={versions.find(v => v.id === compareVersion)?.projectData || { files: {}, folders: {} }}
                compareVersionName={versions.find(v => v.id === compareVersion)?.name || ''}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;