import React from 'react';
import DiffViewer from './DiffViewer';
import { ProjectData, Version } from '../types/project';

interface DiffPanelProps {
  projectData: ProjectData;
  versions: Version[];
  compareVersion: string;
  onClose: () => void;
}

const DiffPanel: React.FC<DiffPanelProps> = ({ projectData, versions, compareVersion, onClose }) => {
  const compareData = versions.find(v => v.id === compareVersion)?.projectData || { files: {}, folders: {} };
  const compareVersionName = versions.find(v => v.id === compareVersion)?.name || '';
  return (
    <div className="w-80 bg-white border-l border-gray-200">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Changes</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>
      <DiffViewer
        currentData={projectData}
        compareData={compareData}
        compareVersionName={compareVersionName}
      />
    </div>
  );
};

export default DiffPanel; 