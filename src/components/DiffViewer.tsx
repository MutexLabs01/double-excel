import React, { useMemo } from 'react';
import { Plus, Minus, Edit } from 'lucide-react';
import { ProjectData } from '../types/project';

interface DiffViewerProps {
  currentData: ProjectData;
  compareData: ProjectData;
  compareVersionName: string;
}

interface FileDiff {
  fileId: string;
  fileName: string;
  type: 'added' | 'removed' | 'modified';
  changes: number;
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  currentData,
  compareData,
  compareVersionName
}) => {
  const diffs = useMemo(() => {
    const changes: FileDiff[] = [];
    const allFiles = new Set([...Object.keys(currentData.files), ...Object.keys(compareData.files)]);

    allFiles.forEach(fileId => {
      const currentFile = currentData.files[fileId];
      const compareFile = compareData.files[fileId];
      
      if (!currentFile && compareFile) {
        // File was removed
        changes.push({
          fileId,
          fileName: compareFile.name,
          type: 'removed',
          changes: 1
        });
      } else if (currentFile && !compareFile) {
        // File was added
        changes.push({
          fileId,
          fileName: currentFile.name,
          type: 'added',
          changes: 1
        });
      } else if (currentFile && compareFile) {
        // File was potentially modified
        const currentData = JSON.stringify(currentFile.data);
        const compareData = JSON.stringify(compareFile.data);
        
        if (currentData !== compareData || currentFile.name !== compareFile.name) {
          changes.push({
            fileId,
            fileName: currentFile.name,
            type: 'modified',
            changes: 1
          });
        }
      }
    });

    return changes.sort((a, b) => a.fileName.localeCompare(b.fileName));
  }, [currentData, compareData]);

  const getChangeIcon = (type: FileDiff['type']) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-black" />;
      case 'modified':
        return <Edit className="h-4 w-4 text-green-800" />;
    }
  };

  const getChangeColor = (type: FileDiff['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200';
      case 'removed':
        return 'bg-black border-black';
      case 'modified':
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className="h-96 overflow-y-auto">
      <div className="p-4">
        <div className="text-sm text-gray-600 mb-4">
          Comparing current version with <strong>{compareVersionName}</strong>
        </div>

        {diffs.length > 0 ? (
          <div className="space-y-3">
            {diffs.map((diff, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getChangeColor(diff.type)}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {getChangeIcon(diff.type)}
                  <span className="font-medium text-sm">{diff.fileName}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-60">
                    {diff.type}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {diff.type === 'removed' && (
                    <div className="bg-black p-2 rounded">
                      <div className="text-white font-medium">File was removed</div>
                    </div>
                  )}

                  {diff.type === 'added' && (
                    <div className="bg-green-100 p-2 rounded">
                      <div className="text-green-800 font-medium">File was added</div>
                    </div>
                  )}

                  {diff.type === 'modified' && (
                    <div className="bg-green-100 p-2 rounded">
                      <div className="text-green-800 font-medium">File was modified</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Edit className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No changes detected</p>
            <p className="text-xs">This version is identical to the current project</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffViewer;