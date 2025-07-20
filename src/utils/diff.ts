import { SpreadsheetData } from '../types/project';

export interface CellDiff {
  row: number;
  col: number;
  oldValue: string;
  newValue: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
}

export interface RowDiff {
  rowNumber: number;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  cells: CellDiff[];
}

export interface SpreadsheetDiff {
  fileName: string;
  rows: RowDiff[];
  addedRows: number[];
  removedRows: number[];
  modifiedRows: number[];
}

export interface DetailedDiff {
  fileId: string;
  fileName: string;
  type: 'added' | 'removed' | 'modified';
  spreadsheetDiff?: SpreadsheetDiff;
  changes: number;
}

// Convert spreadsheet data to 2D array for easier comparison
const spreadsheetToArray = (data: SpreadsheetData): string[][] => {
  const maxRow = 1000; // Reasonable limit
  const maxCol = 26; // A-Z columns
  
  const array: string[][] = [];
  
  for (let row = 0; row < maxRow; row++) {
    const rowData: string[] = [];
    for (let col = 0; col < maxCol; col++) {
      const cellKey = `${row}-${col}`;
      const cell = data[cellKey];
      if (cell) {
        rowData.push(cell.value || '');
      } else {
        rowData.push('');
      }
    }
    array.push(rowData);
  }
  
  return array;
};

// Find the actual bounds of data (non-empty rows and columns)
const findDataBounds = (array: string[][]): { maxRow: number; maxCol: number } => {
  let maxRow = 0;
  let maxCol = 0;
  
  for (let row = 0; row < array.length; row++) {
    for (let col = 0; col < array[row].length; col++) {
      if (array[row][col] && array[row][col].trim() !== '') {
        maxRow = Math.max(maxRow, row + 1);
        maxCol = Math.max(maxCol, col + 1);
      }
    }
  }
  
  return { maxRow, maxCol };
};

// Compare two spreadsheet datasets and return detailed diff
export const compareSpreadsheets = (
  oldData: SpreadsheetData,
  newData: SpreadsheetData,
  fileName: string
): SpreadsheetDiff => {
  const oldArray = spreadsheetToArray(oldData);
  const newArray = spreadsheetToArray(newData);
  
  const oldBounds = findDataBounds(oldArray);
  const newBounds = findDataBounds(newArray);
  
  const maxRows = Math.max(oldBounds.maxRow, newBounds.maxRow);
  const maxCols = Math.max(oldBounds.maxCol, newBounds.maxCol);
  
  const rows: RowDiff[] = [];
  const addedRows: number[] = [];
  const removedRows: number[] = [];
  const modifiedRows: number[] = [];
  
  for (let row = 0; row < maxRows; row++) {
    const oldRow = row < oldArray.length ? oldArray[row] : [];
    const newRow = row < newArray.length ? newArray[row] : [];
    
    const cells: CellDiff[] = [];
    let hasChanges = false;
    let hasOldData = false;
    let hasNewData = false;
    
    for (let col = 0; col < maxCols; col++) {
      const oldValue = oldRow[col] || '';
      const newValue = newRow[col] || '';
      
      if (oldValue.trim() !== '' || newValue.trim() !== '') {
        hasOldData = hasOldData || oldValue.trim() !== '';
        hasNewData = hasNewData || newValue.trim() !== '';
        
        if (oldValue !== newValue) {
          hasChanges = true;
          cells.push({
            row,
            col,
            oldValue,
            newValue,
            type: oldValue === '' ? 'added' : newValue === '' ? 'removed' : 'modified'
          });
        } else {
          cells.push({
            row,
            col,
            oldValue,
            newValue,
            type: 'unchanged'
          });
        }
      }
    }
    
    if (hasChanges) {
      modifiedRows.push(row);
      rows.push({
        rowNumber: row,
        type: 'modified',
        cells
      });
    } else if (hasOldData && !hasNewData) {
      removedRows.push(row);
      rows.push({
        rowNumber: row,
        type: 'removed',
        cells: cells.filter(cell => cell.type === 'removed')
      });
    } else if (!hasOldData && hasNewData) {
      addedRows.push(row);
      rows.push({
        rowNumber: row,
        type: 'added',
        cells: cells.filter(cell => cell.type === 'added')
      });
    } else if (hasOldData || hasNewData) {
      rows.push({
        rowNumber: row,
        type: 'unchanged',
        cells
      });
    }
  }
  
  return {
    fileName,
    rows,
    addedRows,
    removedRows,
    modifiedRows
  };
};

// Generate detailed diff for all files
export const generateDetailedDiff = (
  currentData: { files: Record<string, any>; folders: Record<string, any> },
  compareData: { files: Record<string, any>; folders: Record<string, any> }
): DetailedDiff[] => {
  const changes: DetailedDiff[] = [];
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
      const currentDataStr = JSON.stringify(currentFile.data);
      const compareDataStr = JSON.stringify(compareFile.data);
      
      if (currentDataStr !== compareDataStr || currentFile.name !== compareFile.name) {
        let spreadsheetDiff: SpreadsheetDiff | undefined;
        
        if (currentFile.type === 'spreadsheet' && compareFile.type === 'spreadsheet') {
          spreadsheetDiff = compareSpreadsheets(
            compareFile.data,
            currentFile.data,
            currentFile.name
          );
        }
        
        changes.push({
          fileId,
          fileName: currentFile.name,
          type: 'modified',
          spreadsheetDiff,
          changes: spreadsheetDiff ? 
            spreadsheetDiff.addedRows.length + 
            spreadsheetDiff.removedRows.length + 
            spreadsheetDiff.modifiedRows.length : 1
        });
      }
    }
  });

  return changes.sort((a, b) => a.fileName.localeCompare(b.fileName));
}; 