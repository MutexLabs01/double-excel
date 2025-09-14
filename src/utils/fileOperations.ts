import { ProjectData, FileItem, FolderItem, SpreadsheetData } from '../types/project';
import { generateId } from './helpers';

/**
 * File Operations Utility
 * 
 * This module contains all file-related operations including creation, deletion,
 * renaming, and data management. These functions are designed to be easily
 * replaceable with backend API calls in the future.
 */

/**
 * Creates a new file in the project
 * @param name - The name of the file
 * @param type - The type of file (spreadsheet, chart, financial_model)
 * @param parentFolder - Optional parent folder ID
 * @returns The created file object
 */
export const createFile = (
  name: string, 
  type: 'spreadsheet' | 'chart' | 'financial_model', 
  parentFolder?: string
): FileItem => {
  const fileId = generateId();
  
  const baseFile: Omit<FileItem, 'data'> = {
    id: fileId,
    name,
    type,
    parentFolder,
    createdAt: Date.now(),
    modifiedAt: Date.now()
  };

  // Add type-specific data
  switch (type) {
    case 'spreadsheet':
      return {
        ...baseFile,
        data: {} as SpreadsheetData
      };
    case 'chart':
      return {
        ...baseFile,
        data: {
          type: 'bar',
          title: '',
          xAxis: { label: '', data: [] },
          yAxis: { label: '', data: [] },
          sourceFile: '',
          sourceColumns: { x: '', y: '' }
        }
      };
    case 'financial_model':
      return {
        ...baseFile,
        data: {}
      };
    default:
      return baseFile;
  }
};

/**
 * Creates a new folder in the project
 * @param name - The name of the folder
 * @param parentFolder - Optional parent folder ID
 * @returns The created folder object
 */
export const createFolder = (name: string, parentFolder?: string): FolderItem => {
  return {
    id: generateId(),
    name,
    parentFolder,
    createdAt: Date.now()
  };
};

/**
 * Updates file data
 * @param fileId - The ID of the file to update
 * @param data - The new data to set
 * @param projectData - Current project data
 * @returns Updated project data
 */
export const updateFileData = (
  fileId: string, 
  data: any, 
  projectData: ProjectData
): ProjectData => {
  if (!projectData.files[fileId]) {
    throw new Error(`File with ID ${fileId} not found`);
  }

  return {
    ...projectData,
    files: {
      ...projectData.files,
      [fileId]: {
        ...projectData.files[fileId],
        data,
        modifiedAt: Date.now()
      }
    }
  };
};

/**
 * Renames a file
 * @param fileId - The ID of the file to rename
 * @param newName - The new name for the file
 * @param projectData - Current project data
 * @returns Updated project data
 */
export const renameFile = (
  fileId: string, 
  newName: string, 
  projectData: ProjectData
): ProjectData => {
  if (!projectData.files[fileId]) {
    throw new Error(`File with ID ${fileId} not found`);
  }

  return {
    ...projectData,
    files: {
      ...projectData.files,
      [fileId]: {
        ...projectData.files[fileId],
        name: newName,
        modifiedAt: Date.now()
      }
    }
  };
};

/**
 * Deletes a file from the project
 * @param fileId - The ID of the file to delete
 * @param projectData - Current project data
 * @returns Updated project data
 */
export const deleteFile = (fileId: string, projectData: ProjectData): ProjectData => {
  if (!projectData.files[fileId]) {
    throw new Error(`File with ID ${fileId} not found`);
  }

  const newFiles = { ...projectData.files };
  delete newFiles[fileId];

  return {
    ...projectData,
    files: newFiles
  };
};

/**
 * Gets all files of a specific type
 * @param projectData - Current project data
 * @param type - The type of files to filter by
 * @returns Array of files of the specified type
 */
export const getFilesByType = (
  projectData: ProjectData, 
  type: 'spreadsheet' | 'chart' | 'financial_model'
): FileItem[] => {
  return Object.values(projectData.files).filter(file => file.type === type);
};

/**
 * Gets the active file data
 * @param fileId - The ID of the file
 * @param projectData - Current project data
 * @returns The file data or null if not found
 */
export const getActiveFileData = (
  fileId: string | null, 
  projectData: ProjectData
): FileItem | null => {
  if (!fileId || !projectData.files[fileId]) {
    return null;
  }
  return projectData.files[fileId];
};

/**
 * Adds a file to the project
 * @param file - The file to add
 * @param projectData - Current project data
 * @returns Updated project data
 */
export const addFileToProject = (
  file: FileItem, 
  projectData: ProjectData
): ProjectData => {
  return {
    ...projectData,
    files: {
      ...projectData.files,
      [file.id]: file
    }
  };
};

/**
 * Adds a folder to the project
 * @param folder - The folder to add
 * @param projectData - Current project data
 * @returns Updated project data
 */
export const addFolderToProject = (
  folder: FolderItem, 
  projectData: ProjectData
): ProjectData => {
  return {
    ...projectData,
    folders: {
      ...projectData.folders,
      [folder.id]: folder
    }
  };
};
