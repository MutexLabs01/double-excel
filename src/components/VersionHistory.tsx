import React from 'react';
import { RotateCcw, Eye, Clock, GitCommit } from 'lucide-react';
import { Version } from '../types/project';
import { formatDate } from '../utils/helpers';

interface VersionHistoryProps {
  versions: Version[];
  currentVersion: string;
  onRestore: (versionId: string) => void;
  onShowDiff: (versionId: string) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersion,
  onRestore,
  onShowDiff
}) => {
  const sortedVersions = [...versions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="h-96 overflow-y-auto">
      <div className="p-4 space-y-3">
        {sortedVersions.map((version, index) => (
          <div
            key={version.id}
            className={`
              p-3 rounded-lg border transition-all duration-200
              ${version.id === currentVersion 
                ? 'border-black bg-black bg-opacity-10' 
                : 'border-gray-200 bg-white hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <GitCommit className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {version.name}
                  </h3>
                  {version.id === currentVersion && (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-black text-green-400 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatDate(version.timestamp)}
                  </span>
                </div>
                
                {version.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {version.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={() => onShowDiff(version.id)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-black bg-opacity-90 rounded hover:bg-black hover:bg-opacity-100 transition-colors"
              >
                <Eye className="h-3 w-3 mr-1" />
                View Changes
              </button>
              
              {version.id !== currentVersion && (
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to restore to "${version.name}"? This will replace your current data.`)) {
                      onRestore(version.id);
                    }
                  }}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
        
        {sortedVersions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <GitCommit className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No versions saved yet</p>
            <p className="text-xs">Create your first checkpoint to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionHistory;