import { SpreadsheetData, CellData } from '../types/project';
import { evaluateFormula } from './formulas';

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right';
}

// Cell Operations
export const getCellValue = (data: SpreadsheetData, row: number, col: number): string => {
  const cell = data[`${row}-${col}`];
  if (!cell) return '';
  
  if (cell.formula) {
    try {
      const result = evaluateFormula(cell.formula, data);
      return result.toString();
    } catch (error) {
      return '#ERROR';
    }
  }
  
  return cell.value || '';
};

export const getCellData = (data: SpreadsheetData, row: number, col: number): CellData => {
  return data[`${row}-${col}`] || { value: '', formula: null };
};

export const getCellFormat = (formats: { [key: string]: CellFormat }, row: number, col: number): CellFormat => {
  return formats[`${row}-${col}`] || {};
};

export const getColumnName = (data: SpreadsheetData, col: number): string => {
  // Use custom header if available, otherwise fall back to A, B, C format
  if ((data as any).headers && (data as any).headers[col]) {
    return (data as any).headers[col] as string;
  }
  return String.fromCharCode(65 + col);
};

// Formula Operations
export const getCellReference = (data: SpreadsheetData, row: number, col: number): string => {
  const colName = getColumnName(data, col);
  return `${colName}${row + 1}`;
};

export const parseCellReference = (cellRef: string): {row: number, col: number} => {
  const match = cellRef.match(/([A-Z]+)(\d+)/);
  if (!match) throw new Error(`Invalid cell reference: ${cellRef}`);
  
  const [, col, row] = match;
  const colIndex = col.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;
  const rowIndex = parseInt(row) - 1;
  
  return { row: rowIndex, col: colIndex };
};

export const adjustFormula = (
  formula: string, 
  sourceRow: number, 
  sourceCol: number, 
  targetRow: number, 
  targetCol: number,
  data: SpreadsheetData,
  rows: number,
  cols: number
): string => {
  if (!formula.startsWith('=')) return formula;
  
  const rowOffset = targetRow - sourceRow;
  const colOffset = targetCol - sourceCol;
  
  return formula.replace(/[A-Z]+\d+/g, (cellRef) => {
    try {
      const { row, col } = parseCellReference(cellRef);
      const newRow = row + rowOffset;
      const newCol = col + colOffset;
      
      // Only adjust if the new position is valid
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        return getCellReference(data, newRow, newCol);
      }
      return cellRef; // Keep original if out of bounds
    } catch (error) {
      return cellRef; // Keep original if parsing fails
    }
  });
};

// Selection Operations
export const isCellSelected = (
  row: number, 
  col: number, 
  selectedCell: string | null,
  selectionStart: {row: number, col: number},
  selectionEnd: {row: number, col: number}
): boolean => {
  if (!selectedCell) return false;
  
  const [startRow, startCol] = [selectionStart.row, selectionStart.col];
  const [endRow, endCol] = [selectionEnd.row, selectionEnd.col];
  
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);
  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);
  
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
};

export const isCellActive = (row: number, col: number, selectedCell: string | null): boolean => {
  return selectedCell === `${row}-${col}`;
};

// Formatting Operations
export const getCommonFormat = (
  selectedCell: string | null,
  selectionStart: {row: number, col: number},
  selectionEnd: {row: number, col: number},
  formats: { [key: string]: CellFormat },
  getCellFormat: (row: number, col: number) => CellFormat
): CellFormat => {
  if (!selectedCell) return {};
  
  const [startRow, startCol] = [selectionStart.row, selectionStart.col];
  const [endRow, endCol] = [selectionEnd.row, selectionEnd.col];
  
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);
  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);
  
  const formatList: CellFormat[] = [];
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      formatList.push(getCellFormat(row, col));
    }
  }
  
  if (formatList.length === 0) return {};
  
  // Return common format properties
  const commonFormat: CellFormat = {};
  const firstFormat = formatList[0];
  
  if (formatList.every(f => f.bold === firstFormat.bold)) commonFormat.bold = firstFormat.bold;
  if (formatList.every(f => f.italic === firstFormat.italic)) commonFormat.italic = firstFormat.italic;
  if (formatList.every(f => f.underline === firstFormat.underline)) commonFormat.underline = firstFormat.underline;
  if (formatList.every(f => f.backgroundColor === firstFormat.backgroundColor)) commonFormat.backgroundColor = firstFormat.backgroundColor;
  if (formatList.every(f => f.textColor === firstFormat.textColor)) commonFormat.textColor = firstFormat.textColor;
  if (formatList.every(f => f.fontSize === firstFormat.fontSize)) commonFormat.fontSize = firstFormat.fontSize;
  if (formatList.every(f => f.alignment === firstFormat.alignment)) commonFormat.alignment = firstFormat.alignment;
  
  return commonFormat;
};

// Column width calculation
export const calculateColumnWidths = (
  data: SpreadsheetData,
  cols: number,
  rows: number,
  getCellValue: (row: number, col: number) => string
): number[] => {
  const MIN_COL_WIDTH = 80;
  const MAX_COL_WIDTH = 200;
  const widths: number[] = Array(cols).fill(MIN_COL_WIDTH);
  
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < Math.min(rows, 100); row++) { // Limit calculation for performance
      const value = getCellValue(row, col);
      // Estimate width: 8px per char + padding
      const estWidth = Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, value.length * 8 + 24));
      if (estWidth > widths[col]) widths[col] = estWidth;
    }
  }
  return widths;
};
