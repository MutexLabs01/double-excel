import React from 'react';
import { FolderOpen } from 'lucide-react';

interface FileActionBarProps {
  projectName: string;
}

const FileActionBar: React.FC<FileActionBarProps> = ({ projectName }) => (
  <div className="p-4 border-b border-gray-200">
    <div className="flex items-center space-x-2">
      <FolderOpen className="h-6 w-6 text-blue-600" />
      <h1 className="text-lg font-bold text-gray-900">{projectName}</h1>
    </div>
  </div>
);

export default FileActionBar; 