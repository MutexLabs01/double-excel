import React, { useState, useMemo } from 'react'; 
import { 
  FileSpreadsheet, 
  BarChart3, 
  Folder, 
  FolderOpen, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Plus,
  Search,
  X
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
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter and sort files based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return projectData;
    }

    const query = searchQuery.toLowerCase().trim();
    const filteredFiles: { [key: string]: FileItem } = {};
    const filteredFolders: { [key: string]: FolderItem } = {};

    // Filter files that match the search query
    Object.entries(projectData.files).forEach(([id, file]) => {
      if (file.name?.toLowerCase().includes(query)) {
        filteredFiles[id] = file;
        
        // Include parent folders of matching files
        let currentFolderId = file.parentFolder;
        while (currentFolderId && projectData.folders[currentFolderId]) {
          if (!filteredFolders[currentFolderId]) {
            filteredFolders[currentFolderId] = projectData.folders[currentFolderId];
          }
          currentFolderId = projectData.folders[currentFolderId].parentFolder;
        }
      }
    });

    // Also include folders that match the search query
    Object.entries(projectData.folders).forEach(([id, folder]) => {
      if (folder.name.toLowerCase().includes(query)) {
        filteredFolders[id] = folder;
        
        // Include parent folders
        let currentFolderId = folder.parentFolder;
        while (currentFolderId && projectData.folders[currentFolderId]) {
          if (!filteredFolders[currentFolderId]) {
            filteredFolders[currentFolderId] = projectData.folders[currentFolderId];
          }
          currentFolderId = projectData.folders[currentFolderId].parentFolder;
        }
      }
    });

    return {
      files: filteredFiles,
      folders: filteredFolders
    };
  }, [projectData, searchQuery]);

  // Auto-expand folders when searching
  React.useEffect(() => {
    if (searchQuery.trim()) {
      const allFolderIds = Object.keys(filteredData.folders);
      setExpandedFolders(new Set(allFolderIds));
    }
  }, [searchQuery, filteredData.folders]);

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
    onFileRename(fileId, file.name);
    closeContextMenu();
  };

  const handleDelete = (fileId: string) => {
    const file = projectData.files[fileId];
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onFileDelete(fileId);
    }
    closeContextMenu();
  };

  const clearSearch = () => {
    setSearchQuery('');
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
    const childFolders = Object.values(filteredData.folders).filter(f => f.parentFolder === folder.id);
    const childFiles = Object.values(filteredData.files).filter(f => f.parentFolder === folder.id);

    // Highlight search matches
    const highlightMatch = (text: string) => {
      if (!searchQuery.trim()) return text;
      
      const query = searchQuery.toLowerCase();
      const index = text.toLowerCase().indexOf(query);
      
      if (index === -1) return text;
      
      return (
        <>
          {text.substring(0, index)}
          <span className="bg-yellow-200 text-yellow-900 px-1 rounded">
            {text.substring(index, index + query.length)}
          </span>
          {text.substring(index + query.length)}
        </>
      );
    };

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
          <span className="flex-1 truncate text-gray-900">
            {highlightMatch(folder.name)}
          </span>
        </div>

        {isExpanded && (
          <div>
            {childFolders
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(childFolder => renderFolder(childFolder, level + 1))
            }
            {childFiles
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(file => renderFile(file, level + 1))
            }
          </div>
        )}
      </div>
    );
  };

  const renderFile = (file: FileItem, level: number = 0) => {
    const isActive = activeFile === file.id;

    // Highlight search matches
    const highlightMatch = (text: string) => {
      if (!searchQuery.trim()) return text;
      
      const query = searchQuery.toLowerCase();
      const index = text.toLowerCase().indexOf(query);
      
      if (index === -1) return text;
      
      return (
        <>
          {text.substring(0, index)}
          <span className="bg-yellow-200 text-yellow-900 px-1 rounded">
            {text.substring(index, index + query.length)}
          </span>
          {text.substring(index + query.length)}
        </>
      );
    };

    return (
      <div
        key={file.id}
        className={`group flex items-center space-x-2 px-3 py-2 text-sm cursor-pointer rounded-md ${
          isActive ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onFileSelect(file.id)}
        onContextMenu={(e) => handleContextMenu(e, file.id)}
      >
        {renderFileIcon(file.type)}
        <span className="flex-1 truncate">
          {highlightMatch(file.name)}
        </span>
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

  // Get root level items from filtered data
  const rootFolders = Object.values(filteredData.folders)
    .filter(f => !f.parentFolder)
    .sort((a, b) => a.name.localeCompare(b.name));
  const rootFiles = Object.values(filteredData.files || {})
      .filter(f => f && !f.parentFolder && f.name) // only keep files with a name
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const hasContent = Object.keys(projectData.files).length > 0 || Object.keys(projectData.folders).length > 0;
  const hasFilteredContent = Object.keys(filteredData.files).length > 0 || Object.keys(filteredData.folders).length > 0;

  return (
    <div className="w-48 md:w-64 lg:w-72 overflow-y-auto p-2 flex flex-col">
      {/* Search Bar */}
      {hasContent && (
        <div className="mb-4 px-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-fit pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {searchQuery && (
            <div className="text-xs text-gray-500 mt-1 px-1">
              {Object.keys(filteredData.files).length + Object.keys(filteredData.folders).length} results
            </div>
          )}
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 space-y-1">
        {rootFolders.map(folder => renderFolder(folder))}
        {rootFiles.map(file => renderFile(file))}
      </div>

      {/* Empty States */}
      {!hasContent && (
        <div className="text-center py-8 text-gray-500">
          <Folder className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No files yet</p>
          <p className="text-xs">Create your first file to get started</p>
        </div>
      )}

      {hasContent && !hasFilteredContent && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No results found</p>
          <p className="text-xs">Try a different search term</p>
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