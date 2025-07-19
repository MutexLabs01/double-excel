import React from 'react';
import VersionHistory from './VersionHistory';

interface HistoryPanelProps {
  versions: any[];
  currentVersion: string;
  onRestore: (versionId: string) => void;
  onShowDiff: (versionId: string) => void;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ versions, currentVersion, onRestore, onShowDiff, onClose }) => (
  <div className="w-80 bg-white border-l border-gray-200">
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
    <VersionHistory
      versions={versions}
      currentVersion={currentVersion}
      onRestore={onRestore}
      onShowDiff={onShowDiff}
    />
  </div>
);

export default HistoryPanel; 