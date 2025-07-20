import React from 'react';
import Spreadsheet from './Spreadsheet';
import ChartEditor from './ChartEditor';
import FinancialModeling from './FinancialModeling';
import { SpreadsheetData } from '../types/spreadsheet';
import { ProjectData, FileItem } from '../types/project';
import { Plus, FolderOpen } from 'lucide-react';

interface MainContentProps {
  activeFileData: FileItem | null;
  updateFileData: (fileId: string, data: any) => void;
  getAllSpreadsheetFiles: () => FileItem[];
  projectData: ProjectData;
  createNewFile: (name: string, type: 'spreadsheet' | 'chart' | 'financial_model') => void;
  showDiff: boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  activeFileData,
  updateFileData,
  getAllSpreadsheetFiles,
  projectData,
  createNewFile,
  showDiff
}) => (
  <div className="flex-1">
    {activeFileData ? (
      <div className="h-full bg-white">
        {activeFileData.type === 'spreadsheet' ? (
          <Spreadsheet
            data={activeFileData.data as SpreadsheetData}
            onDataUpdate={(data) => updateFileData(activeFileData.id, data)}
            readonly={showDiff}
          />
        ) : activeFileData.type === 'chart' ? (
          <ChartEditor
            chartData={activeFileData.data as any}
            onDataUpdate={(data) => updateFileData(activeFileData.id, data)}
            spreadsheetFiles={getAllSpreadsheetFiles()}
            projectData={projectData}
          />
        ) : activeFileData.type === 'financial_model' ? (
          <FinancialModeling
            onSave={(model) => updateFileData(activeFileData.id, model)}
            onLoad={(model) => updateFileData(activeFileData.id, model)}
          />
        ) : null}
      </div>
    ) : (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No file selected</h3>
          <p className="text-gray-500 mb-4">Create a new spreadsheet or chart to get started</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                const name = prompt('Enter file name:');
                if (name) createNewFile(name, 'spreadsheet');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Spreadsheet
            </button>
            <button
              onClick={() => {
                const name = prompt('Enter chart name:');
                if (name) createNewFile(name, 'chart');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Chart
            </button>
            <button
              onClick={() => {
                const name = prompt('Enter model name:');
                if (name) createNewFile(name, 'financial_model');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Financial Model
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default MainContent; 