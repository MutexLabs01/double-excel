import { useState, useCallback, useEffect } from 'react';
import { ProjectData, FileItem, FolderItem, Version } from '../types/project';
import { 
  createFile, 
  createFolder, 
  updateFileData, 
  renameFile, 
  deleteFile, 
  getFilesByType,
  getActiveFileData,
  addFileToProject,
  addFolderToProject
} from '../utils/fileOperations';
import { 
  createVersion, 
  addVersion, 
  restoreVersion, 
  getCurrentVersionName 
} from '../utils/versionControl';
import { exportProject, importDataToProject } from '../utils/projectManagement';

/**
 * Custom hook for managing project data
 * 
 * This hook encapsulates all project data management logic and provides
 * a clean interface for components to interact with project data.
 * The functions are designed to be easily replaceable with backend API calls.
 */
export const useProjectData = (currentProjectId: string | null) => {
  const [projectData, setProjectData] = useState<ProjectData>({ files: {}, folders: {} });
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Load project data from localStorage
  useEffect(() => {
    if (!currentProjectId) return;

    const savedProjectData = localStorage.getItem(`project-data-${currentProjectId}`);
    const savedVersions = localStorage.getItem(`project-versions-${currentProjectId}`);
    const savedCurrentVersion = localStorage.getItem(`current-version-${currentProjectId}`);
    const savedActiveFile = localStorage.getItem(`active-file-${currentProjectId}`);

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
  }, [currentProjectId]);

  // Save project data to localStorage
  useEffect(() => {
    if (!currentProjectId) return;

    localStorage.setItem(`project-data-${currentProjectId}`, JSON.stringify(projectData));
  }, [projectData, currentProjectId]);

  useEffect(() => {
    if (!currentProjectId) return;

    localStorage.setItem(`project-versions-${currentProjectId}`, JSON.stringify(versions));
  }, [versions, currentProjectId]);

  useEffect(() => {
    if (!currentProjectId) return;

    localStorage.setItem(`current-version-${currentProjectId}`, currentVersion);
  }, [currentVersion, currentProjectId]);

  useEffect(() => {
    if (!currentProjectId) return;

    localStorage.setItem(`active-file-${currentProjectId}`, activeFile || '');
  }, [activeFile, currentProjectId]);

  // File operations
  const createNewFile = useCallback((
    name: string, 
    type: 'spreadsheet' | 'chart' | 'financial_model', 
    parentFolder?: string
  ): string => {
    const newFile = createFile(name, type, parentFolder);
    setProjectData(prev => addFileToProject(newFile, prev));
    setUnsavedChanges(true);
    return newFile.id;
  }, []);

  const createNewFolder = useCallback((name: string, parentFolder?: string): string => {
    const newFolder = createFolder(name, parentFolder);
    setProjectData(prev => addFolderToProject(newFolder, prev));
    setUnsavedChanges(true);
    return newFolder.id;
  }, []);

  const updateFile = useCallback((fileId: string, data: any) => {
    setProjectData(prev => updateFileData(fileId, data, prev));
    setUnsavedChanges(true);
  }, []);

  const renameFileById = useCallback((fileId: string, newName: string) => {
    setProjectData(prev => renameFile(fileId, newName, prev));
    setUnsavedChanges(true);
  }, []);

  const deleteFileById = useCallback((fileId: string) => {
    setProjectData(prev => deleteFile(fileId, prev));
    if (activeFile === fileId) {
      setActiveFile(null);
    }
    setUnsavedChanges(true);
  }, [activeFile]);

  const selectFile = useCallback((fileId: string | null) => {
    setActiveFile(fileId);
  }, []);

  // Version control operations
  const createCheckpoint = useCallback((name: string, description: string = '') => {
    const newVersion = createVersion(name, description, projectData);
    setVersions(prev => addVersion(newVersion, prev));
    setCurrentVersion(newVersion.id);
    setUnsavedChanges(false);
  }, [projectData]);

  const restoreVersionById = useCallback((versionId: string) => {
    const restoredData = restoreVersion(versionId, versions);
    setProjectData(restoredData);
    setCurrentVersion(versionId);
    setUnsavedChanges(false);
  }, [versions]);

  const getCurrentVersionNameById = useCallback(() => {
    return getCurrentVersionName(currentVersion, versions);
  }, [currentVersion, versions]);

  // Project operations
  const exportProjectData = useCallback(async (projectName: string) => {
    await exportProject(projectData, projectName);
  }, [projectData]);

  const importData = useCallback((data: any[][], columns?: string[]) => {
    const { fileId, updatedProjectData } = importDataToProject(data, columns, projectData);
    setProjectData(updatedProjectData);
    setActiveFile(fileId);
    setUnsavedChanges(true);
  }, [projectData]);

  // Utility functions
  const getAllSpreadsheetFiles = useCallback((): FileItem[] => {
    return getFilesByType(projectData, 'spreadsheet');
  }, [projectData]);

  const getActiveFileDataById = useCallback((): FileItem | null => {
    return getActiveFileData(activeFile, projectData);
  }, [activeFile, projectData]);

  return {
    // State
    projectData,
    activeFile,
    versions,
    currentVersion,
    unsavedChanges,
    
    // File operations
    createNewFile,
    createNewFolder,
    updateFile,
    renameFile: renameFileById,
    deleteFile: deleteFileById,
    selectFile,
    
    // Version control
    createCheckpoint,
    restoreVersion: restoreVersionById,
    getCurrentVersionName: getCurrentVersionNameById,
    
    // Project operations
    exportProject: exportProjectData,
    importData,
    
    // Utility functions
    getAllSpreadsheetFiles,
    getActiveFileData: getActiveFileDataById,
    
    // State setters (for external control)
    setUnsavedChanges
  };
};
