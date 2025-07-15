export interface CellData {
  value: string;
  formula: string | null;
}

export interface SpreadsheetData {
  [key: string]: CellData;
}

export interface Version {
  id: string;
  name: string;
  timestamp: number;
  data: SpreadsheetData;
  description?: string;
}

export interface FormulaError {
  message: string;
  cell: string;
}