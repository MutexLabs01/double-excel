import { Version, ProjectData } from '../types/project';
import { generateId } from './helpers';

/**
 * Version Control Utility
 * 
 * This module handles all version control operations including creating checkpoints,
 * restoring versions, and managing version history. These functions are designed
 * to be easily replaceable with backend API calls.
 */

/**
 * Creates a new version/checkpoint
 * @param name - The name of the version
 * @param description - Optional description
 * @param projectData - Current project data
 * @returns The created version object
 */
export const createVersion = (
  name: string,
  description: string = '',
  projectData: ProjectData
): Version => {
  return {
    id: generateId(),
    name,
    timestamp: Date.now(),
    projectData: JSON.parse(JSON.stringify(projectData)), // Deep clone
    description
  };
};

/**
 * Adds a version to the versions array
 * @param version - The version to add
 * @param versions - Current versions array
 * @returns Updated versions array
 */
export const addVersion = (version: Version, versions: Version[]): Version[] => {
  return [...versions, version];
};

/**
 * Restores a specific version
 * @param versionId - The ID of the version to restore
 * @param versions - Current versions array
 * @returns The project data from the specified version
 */
export const restoreVersion = (
  versionId: string,
  versions: Version[]
): ProjectData => {
  const version = versions.find(v => v.id === versionId);
  if (!version) {
    throw new Error(`Version with ID ${versionId} not found`);
  }
  return version.projectData;
};

/**
 * Gets a version by ID
 * @param versionId - The ID of the version
 * @param versions - Current versions array
 * @returns The version object or null if not found
 */
export const getVersionById = (
  versionId: string,
  versions: Version[]
): Version | null => {
  return versions.find(v => v.id === versionId) || null;
};

/**
 * Gets the current version name
 * @param versionId - The current version ID
 * @param versions - Current versions array
 * @returns The version name or 'Unknown Version'
 */
export const getCurrentVersionName = (
  versionId: string,
  versions: Version[]
): string => {
  const version = getVersionById(versionId, versions);
  return version?.name || 'Unknown Version';
};

/**
 * Compares two versions and returns the differences
 * @param version1 - First version to compare
 * @param version2 - Second version to compare
 * @returns Object containing the differences
 */
export const compareVersions = (
  version1: Version,
  version2: Version
): {
  addedFiles: string[];
  removedFiles: string[];
  modifiedFiles: string[];
  addedFolders: string[];
  removedFolders: string[];
} => {
  const files1 = Object.keys(version1.projectData.files);
  const files2 = Object.keys(version2.projectData.files);
  const folders1 = Object.keys(version1.projectData.folders);
  const folders2 = Object.keys(version2.projectData.folders);

  return {
    addedFiles: files2.filter(id => !files1.includes(id)),
    removedFiles: files1.filter(id => !files2.includes(id)),
    modifiedFiles: files1.filter(id => 
      files2.includes(id) && 
      JSON.stringify(version1.projectData.files[id]) !== 
      JSON.stringify(version2.projectData.files[id])
    ),
    addedFolders: folders2.filter(id => !folders1.includes(id)),
    removedFolders: folders1.filter(id => !folders2.includes(id))
  };
};

/**
 * Sorts versions by timestamp (newest first)
 * @param versions - Array of versions to sort
 * @returns Sorted array of versions
 */
export const sortVersionsByDate = (versions: Version[]): Version[] => {
  return [...versions].sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Filters versions by criteria
 * @param versions - Array of versions to filter
 * @param criteria - Filter criteria
 * @returns Filtered array of versions
 */
export const filterVersions = (
  versions: Version[],
  criteria: {
    recent?: boolean; // Last 7 days
    important?: boolean; // Contains 'checkpoint', 'milestone', or 'release'
    searchTerm?: string; // Search in name or description
  }
): Version[] => {
  let filtered = [...versions];

  if (criteria.recent) {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(v => v.timestamp > sevenDaysAgo);
  }

  if (criteria.important) {
    filtered = filtered.filter(v => 
      v.name.toLowerCase().includes('checkpoint') ||
      v.name.toLowerCase().includes('milestone') ||
      v.name.toLowerCase().includes('release')
    );
  }

  if (criteria.searchTerm) {
    const searchLower = criteria.searchTerm.toLowerCase();
    filtered = filtered.filter(v => 
      v.name.toLowerCase().includes(searchLower) ||
      (v.description && v.description.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
};
