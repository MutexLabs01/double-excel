import { ProjectData, FileItem, SpreadsheetData } from '../types/project';
import { generateId, spreadsheetDataToCSV } from './helpers';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';

/**
 * Project Management Utility
 * 
 * This module handles project-level operations including export, import,
 * and project data management. These functions are designed to be easily
 * replaceable with backend API calls.
 */

/**
 * Exports the entire project as a ZIP file
 * @param projectData - Current project data
 * @param projectName - Name of the project
 * @returns Promise that resolves when export is complete
 */
export const exportProject = async (
  projectData: ProjectData,
  projectName: string
): Promise<void> => {
  const zip = new JSZip();
  
  // Export all spreadsheet files as CSV
  Object.values(projectData.files).forEach((file: FileItem) => {
    if (file.type === 'spreadsheet') {
      const csv = spreadsheetDataToCSV(file.data as SpreadsheetData);
      zip.file(`${file.name || 'Sheet'}.csv`, csv);
    }
  });

  // Export charts as PNG images
  const chartNodes = document.querySelectorAll('.recharts-wrapper');
  let chartIndex = 0;
  
  for (const file of Object.values(projectData.files)) {
    if (file.type === 'chart') {
      const chartNode = chartNodes[chartIndex];
      if (chartNode) {
        try {
          const canvas = await html2canvas(chartNode as HTMLElement);
          const dataUrl = canvas.toDataURL('image/png');
          zip.file(`${file.name || 'Chart'}.png`, dataUrl.split(',')[1], { base64: true });
        } catch (error) {
          console.error(`Failed to export chart ${file.name}:`, error);
        }
      }
      chartIndex++;
    }
  }

  // Generate and download the ZIP file
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}-export.zip`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Imports data from a file and creates a new spreadsheet
 * @param data - The imported data as a 2D array
 * @param columns - Optional column headers
 * @param projectData - Current project data
 * @returns Object containing the new file ID and updated project data
 */
export const importDataToProject = (
  data: any[][],
  columns: string[] | undefined,
  projectData: ProjectData
): { fileId: string; updatedProjectData: ProjectData } => {
  // Convert data to spreadsheet format
  const spreadsheetData: SpreadsheetData = {};
  
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

  // Create new file
  const fileName = `Imported Data ${new Date().toLocaleString()}`;
  const fileId = generateId();
  const newFile: FileItem = {
    id: fileId,
    name: fileName,
    type: 'spreadsheet',
    data: spreadsheetData,
    createdAt: Date.now(),
    modifiedAt: Date.now()
  };

  // Add file to project
  const updatedProjectData = {
    ...projectData,
    files: {
      ...projectData.files,
      [fileId]: newFile
    }
  };

  return { fileId, updatedProjectData };
};

/**
 * Gets project statistics
 * @param projectData - Current project data
 * @returns Object containing project statistics
 */
export const getProjectStatistics = (projectData: ProjectData) => {
  const files = Object.values(projectData.files);
  const folders = Object.values(projectData.folders);
  
  const fileTypes = files.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSize = files.reduce((acc, file) => {
    return acc + JSON.stringify(file.data).length;
  }, 0);

  return {
    totalFiles: files.length,
    totalFolders: folders.length,
    fileTypes,
    totalSize,
    lastModified: files.length > 0 
      ? Math.max(...files.map(f => f.modifiedAt))
      : null
  };
};

/**
 * Validates project data integrity
 * @param projectData - Project data to validate
 * @returns Object containing validation results
 */
export const validateProjectData = (projectData: ProjectData) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for orphaned files (files with non-existent parent folders)
  Object.values(projectData.files).forEach(file => {
    if (file.parentFolder && !projectData.folders[file.parentFolder]) {
      errors.push(`File "${file.name}" references non-existent parent folder`);
    }
  });

  // Check for orphaned folders (folders with non-existent parent folders)
  Object.values(projectData.folders).forEach(folder => {
    if (folder.parentFolder && !projectData.folders[folder.parentFolder]) {
      errors.push(`Folder "${folder.name}" references non-existent parent folder`);
    }
  });

  // Check for duplicate file names in the same folder
  const fileNamesByFolder: Record<string, string[]> = {};
  Object.values(projectData.files).forEach(file => {
    const folderKey = file.parentFolder || 'root';
    if (!fileNamesByFolder[folderKey]) {
      fileNamesByFolder[folderKey] = [];
    }
    fileNamesByFolder[folderKey].push(file.name);
  });

  Object.entries(fileNamesByFolder).forEach(([folder, names]) => {
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      warnings.push(`Duplicate file names in ${folder}: ${duplicates.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Creates a backup of the project data
 * @param projectData - Project data to backup
 * @returns Backup data with metadata
 */
export const createProjectBackup = (projectData: ProjectData) => {
  return {
    timestamp: Date.now(),
    version: '1.0.0', // This could be dynamic based on your versioning scheme
    data: JSON.parse(JSON.stringify(projectData)), // Deep clone
    metadata: {
      totalFiles: Object.keys(projectData.files).length,
      totalFolders: Object.keys(projectData.folders).length
    }
  };
};
