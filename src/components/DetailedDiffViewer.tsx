import React, { useState } from 'react';
import { Plus, Minus, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import { DetailedDiff, SpreadsheetDiff, RowDiff, CellDiff } from '../utils/diff';

interface DetailedDiffViewerProps {
  diffs: DetailedDiff[];
  compareVersionName: string;
}

const DetailedDiffViewer: React.FC<DetailedDiffViewerProps> = ({
  diffs,
  compareVersionName
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleFileExpansion = (fileId: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId);
    } else {
      newExpanded.add(fileId);
    }
    setExpandedFiles(newExpanded);
  };

  const getChangeIcon = (type: 'added' | 'removed' | 'modified') => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'modified':
        return <Edit className="h-4 w-4 text-blue-600" />;
    }
  };

  const getChangeColor = (type: 'added' | 'removed' | 'modified') => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200';
      case 'removed':
        return 'bg-red-50 border-red-200';
      case 'modified':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getCellBackground = (cellType: CellDiff['type']) => {
    switch (cellType) {
      case 'added':
        return 'bg-green-100';
      case 'removed':
        return 'bg-red-100';
      case 'modified':
        return 'bg-yellow-100';
      default:
        return '';
    }
  };

  const getRowBackground = (rowType: RowDiff['type']) => {
    switch (rowType) {
      case 'added':
        return 'bg-green-50';
      case 'removed':
        return 'bg-red-50';
      case 'modified':
        return 'bg-yellow-50';
      default:
        return '';
    }
  };

  const getColumnLabel = (colIndex: number): string => {
    return String.fromCharCode(65 + colIndex); // A, B, C, etc.
  };

  const renderSpreadsheetDiff = (diff: SpreadsheetDiff) => {
    const maxCols = Math.max(...diff.rows.map(row => 
      Math.max(...row.cells.map(cell => cell.col + 1))
    ), 0);

    return (
      <div className="mt-3">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Spreadsheet Changes:
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          {/* Header row with column labels */}
          <div className="bg-gray-100 border-b">
            <div className="flex">
              <div className="w-16 bg-gray-200 border-r px-2 py-1 text-xs font-medium text-gray-600">
                Row
              </div>
              {Array.from({ length: maxCols }, (_, i) => (
                <div key={i} className="flex-1 px-2 py-1 text-xs font-medium text-gray-600 border-r border-gray-200">
                  {getColumnLabel(i)}
                </div>
              ))}
            </div>
          </div>

          {/* Data rows */}
          <div className="max-h-96 overflow-y-auto">
            {diff.rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`border-b ${getRowBackground(row.type)}`}
              >
                <div className="flex">
                  {/* Row number */}
                  <div className="w-16 bg-gray-50 border-r px-2 py-1 text-xs font-medium text-gray-600 flex items-center justify-center">
                    {row.rowNumber + 1}
                  </div>
                  
                  {/* Cells */}
                  {Array.from({ length: maxCols }, (_, colIndex) => {
                    const cell = row.cells.find(c => c.col === colIndex);
                    const cellType = cell?.type || 'unchanged';
                    const value = cell?.newValue || cell?.oldValue || '';
                    
                    return (
                      <div
                        key={colIndex}
                        className={`flex-1 px-2 py-1 text-xs border-r border-gray-200 ${getCellBackground(cellType)}`}
                      >
                        {cellType === 'removed' ? (
                          <div className="text-red-700 line-through">
                            {cell?.oldValue || ''}
                          </div>
                        ) : cellType === 'added' ? (
                          <div className="text-green-700 font-medium">
                            {cell?.newValue || ''}
                          </div>
                        ) : cellType === 'modified' ? (
                          <div>
                            <div className="text-red-700 line-through text-xs">
                              {cell?.oldValue || ''}
                            </div>
                            <div className="text-green-700 font-medium">
                              {cell?.newValue || ''}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-700">
                            {value}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-3 text-xs text-gray-600">
          <div className="flex space-x-4">
            <span className="flex items-center">
              <Plus className="h-3 w-3 text-green-600 mr-1" />
              {diff.addedRows.length} rows added
            </span>
            <span className="flex items-center">
              <Minus className="h-3 w-3 text-red-600 mr-1" />
              {diff.removedRows.length} rows removed
            </span>
            <span className="flex items-center">
              <Edit className="h-3 w-3 text-blue-600 mr-1" />
              {diff.modifiedRows.length} rows modified
            </span>
          </div>
        </div>
      </div>
    );
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getChangeIcon(diff.type)}
                    <span className="font-medium text-sm">{diff.fileName}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-60">
                      {diff.type}
                    </span>
                    {diff.changes > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200">
                        {diff.changes} change{diff.changes !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  {diff.spreadsheetDiff && (
                    <button
                      onClick={() => toggleFileExpansion(diff.fileId)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedFiles.has(diff.fileId) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>

                {diff.type === 'removed' && (
                  <div className="bg-red-100 p-2 rounded mt-2">
                    <div className="text-red-800 font-medium">File was removed</div>
                  </div>
                )}

                {diff.type === 'added' && (
                  <div className="bg-green-100 p-2 rounded mt-2">
                    <div className="text-green-800 font-medium">File was added</div>
                  </div>
                )}

                {diff.type === 'modified' && diff.spreadsheetDiff && expandedFiles.has(diff.fileId) && (
                  renderSpreadsheetDiff(diff.spreadsheetDiff)
                )}

                {diff.type === 'modified' && !diff.spreadsheetDiff && (
                  <div className="bg-blue-100 p-2 rounded mt-2">
                    <div className="text-blue-800 font-medium">File was modified (non-spreadsheet)</div>
                  </div>
                )}
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

export default DetailedDiffViewer; 