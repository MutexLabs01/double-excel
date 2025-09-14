import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { SpreadsheetData, CellData } from '../types/project';
import { 
  CellFormat,
  getCellValue as getCellValueHelper,
  getCellData as getCellDataHelper,
  getCellFormat as getCellFormatHelper,
  getColumnName as getColumnNameHelper,
  adjustFormula as adjustFormulaHelper,
  isCellSelected as isCellSelectedHelper,
  isCellActive as isCellActiveHelper,
  getCommonFormat as getCommonFormatHelper,
  calculateColumnWidths
} from '../utils/spreadsheetHelpers';

interface SpreadsheetProps {
  data: SpreadsheetData;
  onDataUpdate: (data: SpreadsheetData) => void;
  readonly?: boolean;
}

const Spreadsheet: React.FC<SpreadsheetProps> = ({ data, onDataUpdate, readonly = false }) => {
  const [selectedCell, setSelectedCell] = useState<string | null>('0-0');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [selectionStart, setSelectionStart] = useState<{row: number, col: number}>({ row: 0, col: 0 });
  const [selectionEnd, setSelectionEnd] = useState<{row: number, col: number}>({ row: 0, col: 0 });
  const [formats, setFormats] = useState<{ [key: string]: CellFormat }>({});
  const [showColorPicker, setShowColorPicker] = useState<'bg' | 'text' | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{row: number, col: number} | null>(null);
  const [isDraggingFormula, setIsDraggingFormula] = useState<boolean>(false);
  
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
    const newHeaders = [...((data as any).headers || [])];
    newHeaders[col] = header;
    const newData: any = {
      ...data,
      headers: newHeaders
    };
    onDataUpdate(newData);
  }, [data, onDataUpdate]);

  const getCellValue = useCallback((row: number, col: number): string => {
    return getCellValueHelper(data, row, col);
  }, [data]);

  const getCellData = useCallback((row: number, col: number): CellData => {
    return getCellDataHelper(data, row, col);
  }, [data]);

  const getCellFormat = useCallback((row: number, col: number): CellFormat => {
    return getCellFormatHelper(formats, row, col);
  }, [formats]);

  const getColumnName = useCallback((col: number): string => {
    return getColumnNameHelper(data, col);
  }, [data]);


  // Adjust formula cell references based on drag offset
  const adjustFormula = useCallback((formula: string, sourceRow: number, sourceCol: number, targetRow: number, targetCol: number): string => {
    return adjustFormulaHelper(formula, sourceRow, sourceCol, targetRow, targetCol, data, rows, cols);
  }, [data, rows, cols]);

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


  const moveSelection = useCallback((direction: 'up' | 'down' | 'left' | 'right', shiftKey = false) => {
    if (!selectedCell) return;
    
    // Save current editing value before moving
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
  }, [selectedCell, editingCell, editValue, updateCell, rows, cols]);

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
          
          // Focus the input after a brief delay to ensure it's rendered
          setTimeout(() => {
            const input = document.querySelector(`[data-cell-input="${selectedCell}"]`) as HTMLInputElement;
            if (input) {
              input.focus();
              input.select(); // Select all text for easy replacement
            }
          }, 0);
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
          
          // Focus the input after a brief delay to ensure it's rendered
          setTimeout(() => {
            const input = document.querySelector(`[data-cell-input="${selectedCell}"]`) as HTMLInputElement;
            if (input) {
              input.focus();
              input.select(); // Select all text for easy replacement
            }
          }, 0);
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
    if (readonly || isDragging) return;
    
    const cellKey = `${row}-${col}`;
    setSelectedCell(cellKey);
    
    if (shiftKey) {
      setSelectionEnd({ row, col });
    } else {
      setSelectionStart({ row, col });
      setSelectionEnd({ row, col });
    }
  }, [readonly, isDragging]);

  const handleMouseDown = useCallback((row: number, col: number, e: React.MouseEvent) => {
    if (readonly) return;
    
    e.preventDefault();
    const cellKey = `${row}-${col}`;
    setSelectedCell(cellKey);
    setSelectionStart({ row, col });
    setSelectionEnd({ row, col });
    setDragStart({ row, col });
    setIsDragging(true);
    
    // Start editing immediately on mouse down for better UX
    const cellData = getCellData(row, col);
    setEditingCell(cellKey);
    setEditValue(cellData.formula || cellData.value || '');
    
    // Focus the input after a brief delay to ensure it's rendered
    setTimeout(() => {
      const input = document.querySelector(`[data-cell-input="${cellKey}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select(); // Select all text for easy replacement
      }
    }, 0);
    
    // Check if this is a formula cell for dragging
    if (cellData.formula) {
      setIsDraggingFormula(true);
    }
    
    // Add global mouse up listener to handle drag end
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStart(null);
        setIsDraggingFormula(false);
      }
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
  }, [readonly, getCellData]);

  // Calculate column widths based on content
  const colWidths = useMemo(() => {
    return calculateColumnWidths(data, cols, rows, getCellValue);
  }, [data, cols, rows, getCellValue]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    e.preventDefault();
    
    // Get the cell under the mouse
    const rect = spreadsheetRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate which cell the mouse is over
    let currentCol = 0;
    let currentRow = 0;
    
    // Find column - start from row number column width
    let colX = 48; // Width of row number column
    for (let col = 0; col < cols; col++) {
      const colWidth = colWidths[col] || 80; // fallback width
      if (x >= colX && x < colX + colWidth) {
        currentCol = col;
        break;
      }
      colX += colWidth;
    }
    
    // Find row - start from header row height
    let rowY = 32; // Height of header row
    for (let row = 0; row < rows; row++) {
      const rowHeight = 32; // 32px row height
      if (y >= rowY && y < rowY + rowHeight) {
        currentRow = row;
        break;
      }
      rowY += rowHeight;
    }
    
    // Clamp to valid range
    currentRow = Math.max(0, Math.min(rows - 1, currentRow));
    currentCol = Math.max(0, Math.min(cols - 1, currentCol));
    
    // Update selection end point - this will create rectangular selection
    setSelectionEnd({ row: currentRow, col: currentCol });
    // Keep the selected cell as the current cell under mouse
    setSelectedCell(`${currentRow}-${currentCol}`);
  }, [isDragging, dragStart, cols, rows, colWidths]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    e.preventDefault();
    
    // If we were dragging a formula, copy it to all selected cells
    if (isDraggingFormula && dragStart) {
      const sourceCellData = getCellData(dragStart.row, dragStart.col);
      if (sourceCellData.formula) {
        const [startRow, startCol] = [selectionStart.row, selectionStart.col];
        const [endRow, endCol] = [selectionEnd.row, selectionEnd.col];
        
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        
        // Copy formula to all cells in selection
        for (let row = minRow; row <= maxRow; row++) {
          for (let col = minCol; col <= maxCol; col++) {
            if (row !== dragStart.row || col !== dragStart.col) {
              const adjustedFormula = adjustFormula(
                sourceCellData.formula!,
                dragStart.row,
                dragStart.col,
                row,
                col
              );
              
              const cellData: CellData = {
                value: '',
                formula: adjustedFormula
              };
              updateCell(row, col, cellData);
            }
          }
        }
      }
    }
    
    setIsDragging(false);
    setDragStart(null);
    setIsDraggingFormula(false);
  }, [isDragging, dragStart, isDraggingFormula, selectionStart, selectionEnd, getCellData, adjustFormula, updateCell]);


  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    if (readonly) return;
    
    const cellKey = `${row}-${col}`;
    const cellData = getCellData(row, col);
    
    setEditingCell(cellKey);
    setEditValue(cellData.formula || cellData.value || '');
    
    // Focus the input after a brief delay to ensure it's rendered
    setTimeout(() => {
      const input = document.querySelector(`[data-cell-input="${cellKey}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select(); // Select all text for easy replacement
      }
    }, 0);
  }, [readonly, getCellData]);

  const handleCellEdit = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleCellSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
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
        
        // Move to next row
        moveSelection('down');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
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

  const isCellSelected = useCallback((row: number, col: number): boolean => {
    return isCellSelectedHelper(row, col, selectedCell, selectionStart, selectionEnd);
  }, [selectedCell, selectionStart, selectionEnd]);

  const isCellActive = useCallback((row: number, col: number): boolean => {
    return isCellActiveHelper(row, col, selectedCell);
  }, [selectedCell]);

  const getCommonFormat = useCallback((): CellFormat => {
    return getCommonFormatHelper(selectedCell, selectionStart, selectionEnd, formats, getCellFormat);
  }, [selectedCell, selectionStart, selectionEnd, formats, getCellFormat]);

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
      position: 'relative',
    };

    // Determine border style for Excel-like appearance
    let borderClass = 'border border-gray-200';
    if (isActive) {
      borderClass = 'border-2 border-blue-500';
    } else if (isSelected) {
      borderClass = 'border-2 border-blue-400';
    }

    return (
      <div
        key={cellKey}
        ref={isActive ? selectedCellRef : null}
        className={`
          ${borderClass} h-8 flex items-center px-2 text-sm cursor-pointer
          ${isActive ? 'bg-blue-100' : isSelected ? 'bg-blue-200' : 'hover:bg-gray-50'}
          ${isFormula ? 'font-medium' : ''}
          ${readonly ? 'cursor-not-allowed' : ''}
          ${isDragging ? 'select-none' : ''}
          transition-colors duration-150
        `}
        style={cellStyle}
        onMouseDown={(e) => handleMouseDown(row, col, e)}
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
            data-cell-input={cellKey}
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
        
        {/* Drag handle for formula cells */}
        {isActive && isFormula && !isEditing && (
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 cursor-se-resize opacity-70 hover:opacity-100" />
        )}
      </div>
    );
  }, [selectedCell, editingCell, editValue, getCellData, getCellValue, getCellFormat, handleCellClick, handleCellDoubleClick, handleCellEdit, handleCellSubmit, handleCellBlur, readonly, colWidths, isCellSelected, isCellActive, dragStart, isDragging, handleMouseDown, handleMouseMove, handleMouseUp]);

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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
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
                  value={((data as any).headers?.[col] as string) || ''}
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
          <p><strong>Selection:</strong> Click and drag to select multiple cells, Shift+Click for range selection</p>
          <p><strong>Editing:</strong> Click cell to edit immediately, Enter to confirm, Escape to cancel</p>
          <p><strong>Formula Dragging:</strong> Drag from a cell with formula to copy it to other cells with relative references</p>
          <p><strong>Formatting:</strong> Use toolbar for bold, italic, colors, alignment, and font size</p>
          <p><strong>Formulas:</strong> Start with = (e.g., =SUM(A1:A5), =A1+B1, =AVERAGE(B1:B10))</p>
          <p><strong>Supported Functions:</strong> SUM, AVERAGE, COUNT, MIN, MAX, IF</p>
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;