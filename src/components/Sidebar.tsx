import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  BarChart3, 
  Folder, 
  FolderOpen, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Plus 
} from 'lucide-react';
import { ProjectData, FileItem, FolderItem } from '../types/project';

interface SidebarProps {
  projectData: ProjectData;
  activeFile: string | null;
  onFileSelect: (fileId: string) => void;
  onFileDelete: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
  onCreateFolder: (name: string, parentFolder?: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  projectData,
  activeFile,
  onFileSelect,
  onFileDelete,
  onFileRename,
  onCreateFolder
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, fileId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleRename = (fileId: string) => {
    const file = projectData.files[fileId];
    const newName = prompt('Enter new name:', file.name);
    if (newName && newName !== file.name) {
      onFileRename(fileId, newName);
    }
    closeContextMenu();
  };

  const handleDelete = (fileId: string) => {
    const file = projectData.files[fileId];
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onFileDelete(fileId);
    }
    closeContextMenu();
  };

  const renderFileIcon = (type: string) => {
    switch (type) {
      case 'spreadsheet':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'chart':
        return <BarChart3 className="h-4 w-4 text-green-600" />;
      default:
        return <FileSpreadsheet className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderFolder = (folder: FolderItem, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const childFolders = Object.values(projectData.folders).filter(f => f.parentFolder === folder.id);
    const childFiles = Object.values(projectData.files).filter(f => f.parentFolder === folder.id);

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center space-x-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => toggleFolder(folder.id)}
        >
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-green-600" />
          ) : (
            <Folder className="h-4 w-4 text-green-600" />
          )}
          <span className="flex-1 truncate text-gray-900">{folder.name}</span>
        </div>

        {isExpanded && (
          <div>
            {childFolders.map(childFolder => renderFolder(childFolder, level + 1))}
            {childFiles.map(file => renderFile(file, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderFile = (file: FileItem, level: number = 0) => {
    const isActive = activeFile === file.id;

    return (
      <div
        key={file.id}
        className={`flex items-center space-x-2 px-3 py-2 text-sm cursor-pointer rounded-md ${
          isActive ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onFileSelect(file.id)}
        onContextMenu={(e) => handleContextMenu(e, file.id)}
      >
        {renderFileIcon(file.type)}
        <span className="flex-1 truncate">{file.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleContextMenu(e, file.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
        >
          <MoreVertical className="h-3 w-3" />
        </button>
      </div>
    );
  };

  // Get root level items
  const rootFolders = Object.values(projectData.folders).filter(f => !f.parentFolder);
  const rootFiles = Object.values(projectData.files).filter(f => !f.parentFolder);

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="space-y-1">
        {rootFolders.map(folder => renderFolder(folder))}
        {rootFiles.map(file => renderFile(file))}
      </div>

      {Object.keys(projectData.files).length === 0 && Object.keys(projectData.folders).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Folder className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No files yet</p>
          <p className="text-xs">Create your first file to get started</p>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={closeContextMenu}
          />
          <div
            className="fixed z-20 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-32"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => handleRename(contextMenu.fileId)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-black flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Rename</span>
            </button>
            <button
              onClick={() => handleDelete(contextMenu.fileId)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;