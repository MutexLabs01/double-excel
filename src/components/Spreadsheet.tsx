import React, { useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { SpreadsheetData, CellData } from '../types/project';
import { evaluateFormula } from '../utils/formulas';
import { getColumnName } from '../utils/helpers';

interface SpreadsheetProps {
  data: SpreadsheetData;
  onDataUpdate: (data: SpreadsheetData) => void;
  readonly?: boolean;
}

const Spreadsheet: React.FC<SpreadsheetProps> = ({ data, onDataUpdate, readonly = false }) => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const updateCell = useCallback((row: number, col: number, cellData: CellData) => {
    const newData = {
      ...data,
      [`${row}-${col}`]: cellData
    };
    onDataUpdate(newData);
  }, [data, onDataUpdate]);

  const rows = 25;
  const cols = 10;

  const getCellValue = useCallback((row: number, col: number): string => {
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
  }, [data]);

  const getCellData = useCallback((row: number, col: number): CellData => {
    return data[`${row}-${col}`] || { value: '', formula: null };
  }, [data]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (readonly) return;
    
    const cellKey = `${row}-${col}`;
    setSelectedCell(cellKey);
    setEditingCell(null);
  }, [readonly]);

  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    if (readonly) return;
    
    const cellKey = `${row}-${col}`;
    const cellData = getCellData(row, col);
    
    setEditingCell(cellKey);
    setEditValue(cellData.formula || cellData.value || '');
  }, [readonly, getCellData]);

  const handleCellEdit = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleCellSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (editingCell) {
        const [row, col] = editingCell.split('-').map(Number);
        const isFormula = editValue.startsWith('=');
        
        const cellData: CellData = {
          value: isFormula ? '' : editValue,
          formula: isFormula ? editValue : null
        };
        
        updateCell(row, col, cellData);
        setEditingCell(null);
        setEditValue('');
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  }, [editingCell, editValue, updateCell]);

  const handleCellBlur = useCallback(() => {
    if (editingCell) {
      const [row, col] = editingCell.split('-').map(Number);
      const isFormula = editValue.startsWith('=');
      
      const cellData: CellData = {
        value: isFormula ? '' : editValue,
        formula: isFormula ? editValue : null
      };
      
      updateCell(row, col, cellData);
      setEditingCell(null);
      setEditValue('');
    }
  }, [editingCell, editValue, updateCell]);

  // Calculate column widths based on content
  const MIN_COL_WIDTH = 80;
  const MAX_COL_WIDTH = 400;
  const colWidths = useMemo(() => {
    const widths: number[] = Array(cols).fill(MIN_COL_WIDTH);
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const value = getCellValue(row, col);
        // Estimate width: 8px per char + padding
        const estWidth = Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, value.length * 8 + 24));
        if (estWidth > widths[col]) widths[col] = estWidth;
      }
    }
    return widths;
  }, [data, cols, rows, getCellValue]);

  const renderCell = useCallback((row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const cellData = getCellData(row, col);
    const cellValue = getCellValue(row, col);
    const isSelected = selectedCell === cellKey;
    const isEditing = editingCell === cellKey;
    const isFormula = cellData.formula !== null;

    return (
      <div
        key={cellKey}
        className={`
          border border-gray-200 h-8 flex items-center px-2 text-sm cursor-pointer
          bg-white hover:bg-gray-50
          ${isFormula ? 'font-medium text-green-700' : 'text-gray-900'}
          ${readonly ? 'cursor-not-allowed' : ''}
        `}
        style={{ minWidth: colWidths[col], maxWidth: colWidths[col], width: colWidths[col] }}
        onClick={() => handleCellClick(row, col)}
        onDoubleClick={() => handleCellDoubleClick(row, col)}
      >
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={handleCellEdit}
            onKeyDown={handleCellSubmit}
            onBlur={handleCellBlur}
            className="w-full h-full outline-none bg-transparent"
            autoFocus
          />
        ) : (
          <span className="truncate">{cellValue}</span>
        )}
      </div>
    );
  }, [selectedCell, editingCell, editValue, getCellData, getCellValue, handleCellClick, handleCellDoubleClick, handleCellEdit, handleCellSubmit, handleCellBlur, readonly, colWidths]);

  const formulaBarValue = useMemo(() => {
    if (!selectedCell) return '';
    const [row, col] = selectedCell.split('-').map(Number);
    const cellData = getCellData(row, col);
    return cellData.formula || cellData.value || '';
  }, [selectedCell, getCellData]);

  return (
    <div className="flex flex-col h-full">
      {/* Formula Bar */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 w-16">
            {selectedCell ? `${getColumnName(parseInt(selectedCell.split('-')[1]))}${parseInt(selectedCell.split('-')[0]) + 1}` : ''}
          </span>
          <div className="flex-1 bg-white border rounded px-3 py-1">
            <input
              type="text"
              value={formulaBarValue}
              onChange={(e) => {
                if (selectedCell && !readonly) {
                  const [row, col] = selectedCell.split('-').map(Number);
                  const isFormula = e.target.value.startsWith('=');
                  const cellData: CellData = {
                    value: isFormula ? '' : e.target.value,
                    formula: isFormula ? e.target.value : null
                  };
                  updateCell(row, col, cellData);
                }
              }}
              className="w-full outline-none text-sm"
              placeholder="Enter value or formula (=SUM(A1:A5))"
              disabled={readonly}
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          {/* Column Headers */}
          <div className="flex sticky top-0 bg-gray-100 z-10">
            <div className="w-12 h-8 border border-gray-300 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              #
            </div>
            {Array.from({ length: cols }, (_, col) => (
              <div
                key={col}
                className="min-w-20 h-8 border border-gray-300 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                style={{ minWidth: colWidths[col], maxWidth: colWidths[col], width: colWidths[col] }}
              >
                {getColumnName(col)}
              </div>
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className="flex">
              {/* Row Number */}
              <div className="w-12 h-8 border border-gray-300 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {row + 1}
              </div>
              
              {/* Cells */}
              {Array.from({ length: cols }, (_, col) => renderCell(row, col))}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Quick Start:</strong> Click cell to select, double-click to edit, or use formula bar</p>
          <p><strong>Formulas:</strong> Start with = (e.g., =SUM(A1:A5), =A1+B1, =AVERAGE(B1:B10))</p>
          <p><strong>Supported Functions:</strong> SUM, AVERAGE, COUNT, MIN, MAX, IF</p>
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;