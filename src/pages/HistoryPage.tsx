import React, { useState } from 'react';
import { ArrowLeft, Clock, RotateCcw, Eye, Calendar } from 'lucide-react';
import { Version } from '../types/project';

interface HistoryPageProps {
  versions: Version[];
  currentVersion: string;
  onRestore: (versionId: string) => void;
  onShowDiff: (versionId: string) => void;
  onBack: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({
  versions,
  currentVersion,
  onRestore,
  onShowDiff,
  onBack
}) => {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'recent' | 'important'>('all');

  const getCurrentVersionName = () => {
    const version = versions.find(v => v.id === currentVersion);
    return version?.name || 'Unknown Version';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredVersions = versions.filter(version => {
    switch (filter) {
      case 'recent':
        return Date.now() - version.timestamp < 7 * 24 * 60 * 60 * 1000; // Last 7 days
      case 'important':
        return version.name.toLowerCase().includes('checkpoint') || 
               version.name.toLowerCase().includes('milestone') ||
               version.name.toLowerCase().includes('release');
      default:
        return true;
    }
  });

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => 
      prev.includes(versionId) 
        ? prev.filter(id => id !== versionId)
        : [...prev, versionId]
    );
  };

  const handleBulkRestore = () => {
    if (selectedVersions.length === 1) {
      onRestore(selectedVersions[0]);
      setSelectedVersions([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Project
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Version History</h1>
                <p className="text-sm text-gray-500">Manage and restore previous versions of your project</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                Current: <span className="font-medium text-gray-900">{getCurrentVersionName()}</span>
              </div>
              {selectedVersions.length > 0 && (
                <button
                  onClick={handleBulkRestore}
                  disabled={selectedVersions.length !== 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Restore Selected
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Versions' },
              { key: 'recent', label: 'Recent' },
              { key: 'important', label: 'Important' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  filter === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            {filteredVersions.length} of {versions.length} versions
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredVersions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No versions found</h3>
              <p className="text-gray-500">No versions match your current filter criteria.</p>
            </div>
          ) : (
            filteredVersions
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((version, index) => {
                const isCurrent = version.id === currentVersion;
                const isSelected = selectedVersions.includes(version.id);
                
                return (
                  <div
                    key={version.id}
                    className={`bg-white rounded-lg shadow border transition-all duration-200 ${
                      isCurrent ? 'ring-2 ring-blue-500 border-blue-200' : 'hover:shadow-md'
                    } ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleVersionSelection(version.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {version.name}
                              </h3>
                              {isCurrent && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Current
                                </span>
                              )}
                              {index === 0 && !isCurrent && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Latest
                                </span>
                              )}
                            </div>
                            {version.description && (
                              <p className="text-sm text-gray-600 mb-3">{version.description}</p>
                            )}
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(version.timestamp)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{getRelativeTime(version.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onShowDiff(version.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Compare
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => onRestore(version.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restore
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Timeline View Toggle */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Timeline View</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              Switch to Timeline
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Visualize your project's evolution over time with an interactive timeline.
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
