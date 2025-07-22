export interface CellData {
  value: string;
  formula: string | null;
}

export interface SpreadsheetData {
  [key: string]: CellData;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  title: string;
  xAxis: {
    label: string;
    data: string[];
  };
  yAxis: {
    label: string;
    data: number[];
  };
  sourceFile?: string;
  sourceColumns?: {
    x: string;
    y: string;
  };
}

export interface FileItem {
  id: string;
  name: string;
  type: 'spreadsheet' | 'chart' | 'financial_model';
  data: SpreadsheetData | ChartData | FinancialModel;
  parentFolder?: string;
  createdAt: number;
  modifiedAt: number;
}

export interface FolderItem {
  id: string;
  name: string;
  parentFolder?: string;
  createdAt: number;
}

export interface ProjectData {
  files: { [key: string]: FileItem };
  folders: { [key: string]: FolderItem };
  owner?: string; // user id or email of the creator
  sharedWith?: string[]; // array of user ids or emails with access
  [key: string]: any; // index signature for Liveblocks compatibility
}

export interface Version {
  id: string;
  name: string;
  timestamp: number;
  projectData: ProjectData;
  description?: string;
}

export interface FormulaError {
  message: string;
  cell: string;
}

// Import financial types
import { FinancialModel } from './financial';