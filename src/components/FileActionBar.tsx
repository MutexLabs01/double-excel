import React from 'react';
import { Plus, FolderOpen } from 'lucide-react';

interface FileActionBarProps {
  projectName: string;
  onNewSheet: () => void;
  onNewChart: () => void;
}

const FileActionBar: React.FC<FileActionBarProps> = ({ projectName, onNewSheet, onNewChart }) => (
  <div className="p-4 border-b border-gray-200">
    <div className="flex items-center space-x-2 mb-4">
      <FolderOpen className="h-6 w-6 text-blue-600" />
      <h1 className="text-lg font-bold text-gray-900">{projectName}</h1>
    </div>
    <div className="flex space-x-2">
      <button
        onClick={onNewSheet}
        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-green-700 transition-colors"
      >
        <Plus className="h-4 w-4 mr-1" />
        New Sheet
      </button>
      <button
        onClick={onNewChart}
        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <Plus className="h-4 w-4 mr-1" />
        New Chart
      </button>
    </div>
  </div>
);

export default FileActionBar; 