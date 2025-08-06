import React from 'react';
import { Plus, FolderOpen } from 'lucide-react';

interface FileActionBarProps {
  projectName: string;
  onNewSheet: () => void;
  onNewChart: () => void;
  onNewFinancialModel: () => void;
}

const FileActionBar: React.FC<FileActionBarProps> = ({ projectName, onNewSheet, onNewChart, onNewFinancialModel }) => (
  <div className="p-4 border-b border-gray-700">
    <div className="flex items-center space-x-2 mb-4">
      <FolderOpen className="h-6 w-6 text-green-400" />
      <h1 className="text-lg font-bold text-white">{projectName}</h1>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={onNewSheet}
        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
      >
        <Plus className="h-4 w-4 mr-1" />
        Sheet
      </button>
      <button
        onClick={onNewChart}
        className="inline-flex items-center justify-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <Plus className="h-4 w-4 mr-1" />
        Chart
      </button>
      <button
        onClick={onNewFinancialModel}
        className="inline-flex items-center justify-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <Plus className="h-4 w-4 mr-1" />
        Model
      </button>
    </div>
  </div>
);

export default FileActionBar; 