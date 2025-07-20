import React, { useMemo } from 'react';
import DetailedDiffViewer from './DetailedDiffViewer';
import { ProjectData, Version } from '../types/project';
import { generateDetailedDiff } from '../utils/diff';

interface DiffPanelProps {
  projectData: ProjectData;
  versions: Version[];
  compareVersion: string;
  onClose: () => void;
}

const DiffPanel: React.FC<DiffPanelProps> = ({ projectData, versions, compareVersion, onClose }) => {
  const compareData = useMemo(() => 
    versions.find(v => v.id === compareVersion)?.projectData || { files: {}, folders: {} }
  , [versions, compareVersion]);
  
  const compareVersionName = versions.find(v => v.id === compareVersion)?.name || '';
  
  const diffs = useMemo(() => {
    return generateDetailedDiff(projectData, compareData);
  }, [projectData, compareData]);

  return (
    <div className="w-96 bg-white border-l border-gray-200">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Detailed Changes</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>
      <DetailedDiffViewer
        diffs={diffs}
        compareVersionName={compareVersionName}
      />
    </div>
  );
};

export default DiffPanel; 