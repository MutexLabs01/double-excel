import React, { useState, useCallback, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import { SpreadsheetData, CellData } from '../types/project';
import { evaluateFormula } from '../utils/formulas';
import { getColumnName } from '../utils/helpers';

interface SpreadsheetProps {
  data: SpreadsheetData;
  onDataUpdate: (data: SpreadsheetData) => void;
  readonly?: boolean;
}

interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right';
}

// Remove this interface as it's not needed

const Spreadsheet: React.FC<SpreadsheetProps> = ({ data, onDataUpdate, readonly = false }) => {
  const [selectedCell, setSelectedCell] = useState<string | null>('0-0');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [selectionStart, setSelectionStart] = useState<{row: number, col: number}>({ row: 0, col: 0 });
  const [selectionEnd, setSelectionEnd] = useState<{row: number, col: number}>({ row: 0, col: 0 });
  const [formats, setFormats] = useState<{ [key: string]: CellFormat }>({});
  const [showColorPicker, setShowColorPicker] = useState<'bg' | 'text' | null>(null);
  
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const selectedCellRef = useRef<HTMLDivElement>(null);

  const rows = 50;
  const cols = 26;

  const updateCell = useCallback((row: number, col: number, cellData: CellData) => {
    const newData = {
      ...data,
      [`${row}-${col}`]: cellData
    };
    onDataUpdate(newData);
  }, [data, onDataUpdate]);

  const updateHeader = useCallback((col: number, header: string) => {
    const newHeaders = [...(data.headers || [])];
    newHeaders[col] = header;
    const newData = {
      ...data,
      headers: newHeaders
    };
    onDataUpdate(newData);
  }, [data, onDataUpdate]);

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

  const getCellFormat = useCallback((row: number, col: number): CellFormat => {
    return formats[`${row}-${col}`] || {};
  }, [formats]);

  const getColumnName = useCallback((col: number): string => {
    // Use custom header if available, otherwise fall back to A, B, C format
    if (data.headers && data.headers[col]) {
      return data.headers[col];
    }
    return String.fromCharCode(65 + col);
  }, [data.headers]);

  const updateCellFormat = useCallback((row: number, col: number, format: Partial<CellFormat>) => {
    const cellKey = `${row}-${col}`;
    const currentFormat = formats[cellKey] || {};
    const newFormat = { ...currentFormat, ...format };
    
    if (Object.keys(newFormat).length === 0) {
      const newFormats = { ...formats };
      delete newFormats[cellKey];
      setFormats(newFormats);
    } else {
      setFormats({ ...formats, [cellKey]: newFormat });
    }
  }, [formats]);

  const updateSelectionFormat = useCallback((format: Partial<CellFormat>) => {
    const [startRow, startCol] = [selectionStart.row, selectionStart.col];
    const [endRow, endCol] = [selectionEnd.row, selectionEnd.col];
    
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        updateCellFormat(row, col, format);
      }
    }
  }, [selectionStart, selectionEnd, updateCellFormat]);

  const isValidCell = useCallback((row: number, col: number): boolean => {
    return row >= 0 && row < rows && col >= 0 && col < cols;
  }, [rows, cols]);

  const moveSelection = useCallback((direction: 'up' | 'down' | 'left' | 'right', shiftKey = false) => {
    if (!selectedCell) return;
    
    const [currentRow, currentCol] = selectedCell.split('-').map(Number);
    let newRow = currentRow;
    let newCol = currentCol;
    
    switch (direction) {
      case 'up':
        newRow = Math.max(0, currentRow - 1);
        break;
      case 'down':
        newRow = Math.min(rows - 1, currentRow + 1);
        break;
      case 'left':
        newCol = Math.max(0, currentCol - 1);
        break;
      case 'right':
        newCol = Math.min(cols - 1, currentCol + 1);
        break;
    }
    
    const newCellKey = `${newRow}-${newCol}`;
    setSelectedCell(newCellKey);
    
    // Stop editing when moving with arrow keys
    setEditingCell(null);
    setEditValue('');
    
    if (shiftKey) {
      setSelectionEnd({ row: newRow, col: newCol });
    } else {
      setSelectionStart({ row: newRow, col: newCol });
      setSelectionEnd({ row: newRow, col: newCol });
    }
    
    // Scroll into view
    setTimeout(() => {
      selectedCellRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }, 0);
  }, [selectedCell, rows, cols]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (readonly) return;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        moveSelection('up', e.shiftKey);
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveSelection('down', e.shiftKey);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        moveSelection('left', e.shiftKey);
        break;
      case 'ArrowRight':
        e.preventDefault();
        moveSelection('right', e.shiftKey);
        break;
      case 'Enter':
        e.preventDefault();
        if (editingCell) {
          // Move to next row when editing
          moveSelection('down');
        } else {
          // Start editing current cell
          const [row, col] = selectedCell!.split('-').map(Number);
          const cellData = getCellData(row, col);
          setEditingCell(selectedCell);
          setEditValue(cellData.formula || cellData.value || '');
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          moveSelection('left');
        } else {
          moveSelection('right');
        }
        break;
      case 'F2':
        e.preventDefault();
        if (selectedCell) {
          const [row, col] = selectedCell.split('-').map(Number);
          const cellData = getCellData(row, col);
          setEditingCell(selectedCell);
          setEditValue(cellData.formula || cellData.value || '');
        }
        break;
      case 'Delete':
        e.preventDefault();
        if (selectedCell && !editingCell) {
          const [row, col] = selectedCell.split('-').map(Number);
          updateCell(row, col, { value: '', formula: null });
        }
        break;
    }
  }, [readonly, moveSelection, editingCell, selectedCell, getCellData, updateCell]);

  const handleCellClick = useCallback((row: number, col: number, shiftKey = false) => {
    if (readonly) return;
    
    const cellKey = `${row}-${col}`;
    setSelectedCell(cellKey);
    
    if (shiftKey) {
      setSelectionEnd({ row, col });
    } else {
      setSelectionStart({ row, col });
      setSelectionEnd({ row, col });
      
      // Start editing immediately when clicking on a cell
      const cellData = getCellData(row, col);
      setEditingCell(cellKey);
      setEditValue(cellData.formula || cellData.value || '');
    }
  }, [readonly, getCellData]);

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
        
        // Move to next row
        moveSelection('down');
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
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
        
        // Move to next/previous column
        if (e.shiftKey) {
          moveSelection('left');
        } else {
          moveSelection('right');
        }
      }
    }
  }, [editingCell, editValue, updateCell, moveSelection]);

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
  const MAX_COL_WIDTH = 200;
  const colWidths = useMemo(() => {
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
  }, [data, cols, rows, getCellValue]);

  const isCellSelected = useCallback((row: number, col: number): boolean => {
    if (!selectedCell) return false;
    
    const [startRow, startCol] = [selectionStart.row, selectionStart.col];
    const [endRow, endCol] = [selectionEnd.row, selectionEnd.col];
    
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  }, [selectedCell, selectionStart, selectionEnd]);

  const isCellActive = useCallback((row: number, col: number): boolean => {
    return selectedCell === `${row}-${col}`;
  }, [selectedCell]);

  const getCommonFormat = useCallback((): CellFormat => {
    if (!selectedCell) return {};
    
    const [startRow, startCol] = [selectionStart.row, selectionStart.col];
    const [endRow, endCol] = [selectionEnd.row, selectionEnd.col];
    
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    const formats: CellFormat[] = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        formats.push(getCellFormat(row, col));
      }
    }
    
    if (formats.length === 0) return {};
    
    // Return common format properties
    const commonFormat: CellFormat = {};
    const firstFormat = formats[0];
    
    if (formats.every(f => f.bold === firstFormat.bold)) commonFormat.bold = firstFormat.bold;
    if (formats.every(f => f.italic === firstFormat.italic)) commonFormat.italic = firstFormat.italic;
    if (formats.every(f => f.underline === firstFormat.underline)) commonFormat.underline = firstFormat.underline;
    if (formats.every(f => f.backgroundColor === firstFormat.backgroundColor)) commonFormat.backgroundColor = firstFormat.backgroundColor;
    if (formats.every(f => f.textColor === firstFormat.textColor)) commonFormat.textColor = firstFormat.textColor;
    if (formats.every(f => f.fontSize === firstFormat.fontSize)) commonFormat.fontSize = firstFormat.fontSize;
    if (formats.every(f => f.alignment === firstFormat.alignment)) commonFormat.alignment = firstFormat.alignment;
    
    return commonFormat;
  }, [selectedCell, selectionStart, selectionEnd, getCellFormat]);

  const renderCell = useCallback((row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const cellData = getCellData(row, col);
    const cellValue = getCellValue(row, col);
    const cellFormat = getCellFormat(row, col);
    const isSelected = isCellSelected(row, col);
    const isActive = isCellActive(row, col);
    const isEditing = editingCell === cellKey;
    const isFormula = cellData.formula !== null;

    const cellStyle: React.CSSProperties = {
      minWidth: colWidths[col],
      maxWidth: colWidths[col],
      width: colWidths[col],
      backgroundColor: cellFormat.backgroundColor || 'transparent',
      color: cellFormat.textColor || (isFormula ? '#059669' : '#111827'),
      fontSize: cellFormat.fontSize ? `${cellFormat.fontSize}px` : '14px',
      fontWeight: cellFormat.bold ? 'bold' : 'normal',
      fontStyle: cellFormat.italic ? 'italic' : 'normal',
      textDecoration: cellFormat.underline ? 'underline' : 'none',
      textAlign: cellFormat.alignment || 'left',
    };

    return (
      <div
        key={cellKey}
        ref={isActive ? selectedCellRef : null}
        className={`
          border border-gray-200 h-8 flex items-center px-2 text-sm cursor-pointer
          ${isActive ? 'bg-blue-100 border-blue-400' : isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
          ${isFormula ? 'font-medium' : ''}
          ${readonly ? 'cursor-not-allowed' : ''}
          transition-colors duration-150
        `}
        style={cellStyle}
        onClick={(e) => handleCellClick(row, col, e.shiftKey)}
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
            style={{
              color: cellFormat.textColor || (isFormula ? '#059669' : '#111827'),
              fontSize: cellFormat.fontSize ? `${cellFormat.fontSize}px` : '14px',
              fontWeight: cellFormat.bold ? 'bold' : 'normal',
              fontStyle: cellFormat.italic ? 'italic' : 'normal',
              textDecoration: cellFormat.underline ? 'underline' : 'none',
              textAlign: cellFormat.alignment || 'left',
            }}
            autoFocus
          />
        ) : (
          <span className="truncate">{cellValue}</span>
        )}
      </div>
    );
  }, [selectedCell, editingCell, editValue, getCellData, getCellValue, getCellFormat, handleCellClick, handleCellDoubleClick, handleCellEdit, handleCellSubmit, handleCellBlur, readonly, colWidths, isCellSelected, isCellActive]);

  const formulaBarValue = useMemo(() => {
    if (!selectedCell) return '';
    const [row, col] = selectedCell.split('-').map(Number);
    const cellData = getCellData(row, col);
    return cellData.formula || cellData.value || '';
  }, [selectedCell, getCellData]);

  const commonFormat = getCommonFormat();

  // Focus management
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target === document.body || spreadsheetRef.current?.contains(e.target as Node)) {
        handleKeyDown(e as any);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleKeyDown]);

  const colorOptions = [
    '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#374151', '#1f2937', '#111827',
    '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
    '#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e',
    '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534',
    '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985',
    '#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7c3aed', '#6b21a8',
  ];

  return (
    <div 
      ref={spreadsheetRef}
      className="flex flex-col h-full"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Formatting Toolbar */}
      <div className="p-3 border-b bg-gray-50 flex items-center space-x-4">
        {/* Font Controls */}
        <div className="flex items-center space-x-2">
          <select 
            className="px-2 py-1 text-sm border rounded bg-white"
            value={commonFormat.fontSize || 14}
            onChange={(e) => updateSelectionFormat({ fontSize: parseInt(e.target.value) })}
          >
            <option value={10}>10</option>
            <option value={12}>12</option>
            <option value={14}>14</option>
            <option value={16}>16</option>
            <option value={18}>18</option>
            <option value={20}>20</option>
            <option value={24}>24</option>
          </select>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => updateSelectionFormat({ bold: !commonFormat.bold })}
            className={`p-1 rounded ${commonFormat.bold ? 'bg-blue-200' : 'bg-white'} hover:bg-blue-100 border`}
            title="Bold"
          >
            <strong className="text-sm">B</strong>
          </button>
          <button
            onClick={() => updateSelectionFormat({ italic: !commonFormat.italic })}
            className={`p-1 rounded ${commonFormat.italic ? 'bg-blue-200' : 'bg-white'} hover:bg-blue-100 border`}
            title="Italic"
          >
            <em className="text-sm">I</em>
          </button>
          <button
            onClick={() => updateSelectionFormat({ underline: !commonFormat.underline })}
            className={`p-1 rounded ${commonFormat.underline ? 'bg-blue-200' : 'bg-white'} hover:bg-blue-100 border`}
            title="Underline"
          >
            <u className="text-sm">U</u>
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => updateSelectionFormat({ alignment: 'left' })}
            className={`p-1 rounded ${commonFormat.alignment === 'left' ? 'bg-blue-200' : 'bg-white'} hover:bg-blue-100 border`}
            title="Align Left"
          >
            <span className="text-sm">⫷</span>
          </button>
          <button
            onClick={() => updateSelectionFormat({ alignment: 'center' })}
            className={`p-1 rounded ${commonFormat.alignment === 'center' ? 'bg-blue-200' : 'bg-white'} hover:bg-blue-100 border`}
            title="Align Center"
          >
            <span className="text-sm">⫸</span>
          </button>
          <button
            onClick={() => updateSelectionFormat({ alignment: 'right' })}
            className={`p-1 rounded ${commonFormat.alignment === 'right' ? 'bg-blue-200' : 'bg-white'} hover:bg-blue-100 border`}
            title="Align Right"
          >
            <span className="text-sm">⫹</span>
          </button>
        </div>

        {/* Color Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
              className="p-1 rounded bg-white hover:bg-blue-100 border flex items-center space-x-1"
              title="Text Color"
            >
              <span className="text-sm">A</span>
              <div 
                className="w-3 h-3 rounded border"
                style={{ backgroundColor: commonFormat.textColor || '#000000' }}
              />
            </button>
            {showColorPicker === 'text' && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-2 z-50">
                <div className="grid grid-cols-9 gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        updateSelectionFormat({ textColor: color });
                        setShowColorPicker(null);
                      }}
                      className="w-4 h-4 rounded border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
              className="p-1 rounded bg-white hover:bg-blue-100 border flex items-center space-x-1"
              title="Background Color"
            >
              <span className="text-sm">Fill</span>
              <div 
                className="w-3 h-3 rounded border"
                style={{ backgroundColor: commonFormat.backgroundColor || '#ffffff' }}
              />
            </button>
            {showColorPicker === 'bg' && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-2 z-50">
                <div className="grid grid-cols-9 gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        updateSelectionFormat({ backgroundColor: color });
                        setShowColorPicker(null);
                      }}
                      className="w-4 h-4 rounded border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clear Formatting */}
        <button
          onClick={() => updateSelectionFormat({})}
          className="px-2 py-1 text-sm bg-white hover:bg-red-100 border rounded"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>

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
                <input
                  type="text"
                  value={data.headers?.[col] || ''}
                  onChange={(e) => updateHeader(col, e.target.value)}
                  placeholder={String.fromCharCode(65 + col)}
                  className="w-full h-full text-center bg-transparent border-none outline-none text-xs font-medium text-gray-600 placeholder-gray-400"
                  style={{ minWidth: colWidths[col] - 8 }}
                />
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
          <p><strong>Navigation:</strong> Arrow keys to move, Shift+Arrow for selection, Tab to move right</p>
          <p><strong>Editing:</strong> Click cell to edit immediately, Enter to confirm, Escape to cancel</p>
          <p><strong>Formatting:</strong> Use toolbar for bold, italic, colors, alignment, and font size</p>
          <p><strong>Formulas:</strong> Start with = (e.g., =SUM(A1:A5), =A1+B1, =AVERAGE(B1:B10))</p>
          <p><strong>Supported Functions:</strong> SUM, AVERAGE, COUNT, MIN, MAX, IF</p>
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;