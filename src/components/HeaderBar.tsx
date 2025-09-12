import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Save, History, Download, Upload, Brain, Share2} from 'lucide-react';

interface HeaderBarProps {
  projectName: string;
  fileName: string;
  fileType: string;
  versionName: string;
  unsavedChanges: boolean;
  onBack: () => void;
  onSave: () => void;
  onShowHistory: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showHistory: boolean;
  onShare?: () => void;
  shareLink?: string;
  onShowML?: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  projectName,
  fileName,
  fileType,
  versionName,
  unsavedChanges,
  onBack,
  onSave,
  onShowHistory,
  onExport,
  onImport,
  showHistory,
  onShare,
  shareLink,
  onShowML
}) => (
  <header className="bg-white shadow-sm border-b">
    <div className="px-6">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-4"
          >
            ← Back to Home
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{fileName || 'No file selected'}</h2>
            <p className="text-sm text-gray-500">
              {fileType} • {versionName}
              {unsavedChanges && <span className="text-amber-600 ml-2">• Unsaved changes</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2.5">
          
          {onShowML && (
            <button
              onClick={onShowML}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <Brain className="h-4 w-4 mr-1" />
              ML
            </button>
          )}
          <button
            onClick={onSave}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Save className="h-4 w-4" />
            {/* Save Checkpoint */}
          </button>
          <button
            onClick={onShowHistory}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <History className="h-4 w-4" />
            {/* History */}
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <Download className="h-4 w-4 " />
            {/* Export */}
          </button>
          <label className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer">
            <Upload className="h-4 w-4 " />
            {/* Import */}
            <input
              type="file"
              accept=".csv"
              onChange={onImport}
              className="hidden"
            />
          </label>
          {onShare && (
            <button
              onClick={onShare}
              className="inline-flex items-center px-3 py-2 border border-blue-500 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Share2 className="2 h-4 w-4" />
              {/* Share */}
            </button>
          )}
          <UserButton />
        </div>
      </div>
      {shareLink && (
        <div className="mt-2 text-blue-700 text-sm">
          Share this link: <a href={shareLink} className="underline" target="_blank" rel="noopener noreferrer">{shareLink}</a>
        </div>
      )}
    </div>
  </header>
);

export default HeaderBar; 