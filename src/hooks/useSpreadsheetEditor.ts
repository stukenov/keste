import { useState, useCallback, useRef, useEffect } from 'react';
import type { WorkbookModel, CellData, CellStyle, BorderStyle } from '../core-ts/types';
import type { CellPosition, EditingState, CellEdit, UndoRedoState, Selection, NavigationDirection } from '../core-ts/editor-types';
import type { CellComment, Comment, Change } from '../core-ts/comment-types';
import { HyperFormula, SimpleCellAddress } from 'hyperformula';
import { formatNumber } from '../core-ts/number-formatter';

export function useSpreadsheetEditor(initialWorkbook: WorkbookModel) {
  const [workbook, setWorkbook] = useState<WorkbookModel>(initialWorkbook);
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    position: null,
    value: '',
    originalValue: '',
  });
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  
  // Extended setSelectedCell that can handle selection ranges
  const setSelectedCellWithSelection = useCallback((position: CellPosition, extendSelection: boolean = false) => {
    if (extendSelection && selectedCell) {
      // Extend selection from current selected cell to new position
      setSelection({
        start: selectedCell,
        end: position,
      });
      // Keep the original selected cell as anchor
    } else {
      // Single cell selection - clear range
      setSelectedCell(position);
      setSelection(null);
    }
  }, [selectedCell]);
  const [manualCalc, setManualCalc] = useState(false); // Manual calculation mode

  const undoRedoRef = useRef<UndoRedoState>({
    undoStack: [],
    redoStack: [],
    maxSize: 50, // Reduced from 100 for better memory usage
  });

  // ⚡ HyperFormula instance for professional formula evaluation
  const hfRef = useRef<HyperFormula | null>(null);
  
  // Initialize HyperFormula
  if (!hfRef.current) {
    hfRef.current = HyperFormula.buildEmpty({
      licenseKey: 'gpl-v3',
      useArrayArithmetic: true,
      useColumnIndex: true,
    });
    
    // Add sheet
    hfRef.current.addSheet('Sheet1');
  }

  // ✨ Optimized: Get raw cell value (for editing)
  // Using ref to avoid recreating on every workbook change
  const workbookRef = useRef(workbook);
  workbookRef.current = workbook;

  // 🔄 Helper: Sync entire sheet to HyperFormula
  const syncSheetToHyperFormula = useCallback(() => {
    const hf = hfRef.current;
    if (!hf) return;

    const currentSheet = workbookRef.current.sheets[0];
    if (!currentSheet) return;

    // Clear HyperFormula first
    const sheetId = hf.getSheetId('Sheet1');
    if (sheetId !== null && sheetId !== undefined) {
      try {
        hf.clearSheet(sheetId);
      } catch (e) {
        // Sheet might not exist yet
      }
    }

    // Sync all cells to HyperFormula
    hf.batch(() => {
      currentSheet.cells.forEach((cellData, key) => {
        const parts = key.split('-');
        if (parts.length !== 2) {
          console.warn(`Invalid cell key: ${key}`);
          return;
        }

        const [row, col] = parts.map(Number);

        // Validate row and col
        if (!isFinite(row) || !isFinite(col) || row < 1 || col < 1) {
          console.warn(`Invalid cell coordinates from key ${key}: row=${row}, col=${col}`);
          return;
        }
        
        // ⚡ Convert 1-based to 0-based indexing for HyperFormula
        // Our workbook: A1 = row:1, col:1 (1-based)
        // HyperFormula: A1 = row:0, col:0 (0-based)
        const hfRow = row - 1;
        const hfCol = col - 1;
        const address: SimpleCellAddress = { sheet: 0, col: hfCol, row: hfRow };
        
        if (cellData.formula) {
          hf.setCellContents(address, `=${cellData.formula}`);
        } else if (cellData.value !== null && cellData.value !== undefined) {
          hf.setCellContents(address, cellData.value);
        }
      });
    });
  }, []);

  // Initial sync on mount
  useEffect(() => {
    syncSheetToHyperFormula();
  }, []); // Run once on mount

  const getCellValue = useCallback((position: CellPosition): string => {
    const sheet = workbookRef.current.sheets.find(s => s.id === position.sheetId);
    if (!sheet) return '';

    const cellKey = `${position.row}-${position.col}`;
    const cell = sheet.cells.get(cellKey);

    if (!cell) return '';
    if (cell.formula) return `=${cell.formula}`;
    return cell.value?.toString() || '';
  }, []); // ✨ No dependencies - stable reference

  // ✨ Optimized: Get evaluated cell value (for display and formula calculations)
  const getCellDisplayValue = useCallback((position: CellPosition): string | number => {
    const sheet = workbookRef.current.sheets.find(s => s.id === position.sheetId);
    if (!sheet) return '';

    const cellKey = `${position.row}-${position.col}`;
    const cell = sheet.cells.get(cellKey);

    // DEBUG: Log for first few cells
    if (position.row <= 3 && position.col <= 3) {
      console.log(`getCellDisplayValue(${cellKey}):`, {
        cell,
        hasCell: !!cell,
        value: cell?.value,
        formula: cell?.formula,
        type: cell?.type
      });
    }

    if (!cell) return '';

    // If it's a formula, evaluate it using HyperFormula
    if (cell.formula) {
      try {
        // Sync all cells before formula evaluation
        syncSheetToHyperFormula();

        const hf = hfRef.current;
        if (!hf) return '#ERROR!';

        // Convert 1-based to 0-based indexing for HyperFormula
        const hfRow = position.row - 1;
        const hfCol = position.col - 1;
        const address: SimpleCellAddress = { sheet: 0, col: hfCol, row: hfRow };

        // Get calculated value from HyperFormula
        const result = hf.getCellValue(address);

        // Handle errors
        if (result === null || result === undefined) return '';
        if (typeof result === 'object' && result !== null && 'type' in result) {
          return `#${result.type}!`;
        }
        if (typeof result === 'boolean') return result ? 'TRUE' : 'FALSE';

        // Apply number format if present
        if (typeof result === 'number' && cell.styleId !== undefined) {
          const cellXf = workbookRef.current.cellXfs?.[cell.styleId];
          if (cellXf?.numFmtId !== undefined) {
            return formatNumber(result, cellXf.numFmtId, workbookRef.current);
          }
        }

        return result;
      } catch (error) {
        console.error('Formula evaluation error:', error);
        return '#ERROR!';
      }
    }

    // Apply number format for non-formula cells
    if (cell.styleId !== undefined) {
      const cellXf = workbookRef.current.cellXfs?.[cell.styleId];
      if (cellXf?.numFmtId !== undefined) {
        return formatNumber(cell.value, cellXf.numFmtId, workbookRef.current);
      }
    }

    return cell.value?.toString() || '';
  }, [syncSheetToHyperFormula]); // Need syncSheetToHyperFormula for formula evaluation

  // Set cell value
  const setCellValue = useCallback((position: CellPosition, value: string) => {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === position.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      const cellKey = `${position.row}-${position.col}`;
      const cells = new Map(sheet.cells);

      const oldValue = getCellValue(position);

      // Parse formula or value
      if (value.startsWith('=')) {
        // Formula
        const formula = value.substring(1);
        const cellData: CellData = {
          row: position.row,
          col: position.col,
          type: 'str',
          value: value,
          formula: formula,
        };
        cells.set(cellKey, cellData);
      } else if (value === '') {
        // Delete cell
        cells.delete(cellKey);
      } else {
        // Regular value
        const isNumber = !isNaN(Number(value));
        const cellData: CellData = {
          row: position.row,
          col: position.col,
          type: isNumber ? 'n' : 's',
          value: isNumber ? Number(value) : value,
        };
        cells.set(cellKey, cellData);
      }

      sheet.cells = cells;
      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      // Note: HyperFormula will be synced automatically before next formula evaluation

      // Add to undo stack
      const edit: CellEdit = {
        position,
        oldValue,
        newValue: value,
        timestamp: Date.now(),
      };

      undoRedoRef.current.undoStack.push(edit);
      if (undoRedoRef.current.undoStack.length > undoRedoRef.current.maxSize) {
        undoRedoRef.current.undoStack.shift();
      }
      undoRedoRef.current.redoStack = []; // Clear redo stack

      return newWorkbook;
    });
  }, [getCellValue]);

  // Start editing
  const startEditing = useCallback((position: CellPosition, initialValue?: string) => {
    const currentValue = getCellValue(position);
    const value = initialValue !== undefined ? initialValue : currentValue;
    setEditingState({
      isEditing: true,
      position,
      value,
      originalValue: currentValue, // Keep original for undo
    });
    setSelectedCell(position);
  }, [getCellValue]);

  // Stop editing
  const stopEditing = useCallback((save: boolean = true) => {
    if (!editingState.position) return;

    if (save && editingState.value !== editingState.originalValue) {
      setCellValue(editingState.position, editingState.value);
    }

    setEditingState({
      isEditing: false,
      position: null,
      value: '',
      originalValue: '',
    });
  }, [editingState, setCellValue]);

  // Update editing value
  const updateEditingValue = useCallback((value: string) => {
    setEditingState(prev => ({ ...prev, value }));
  }, []);

  // Navigate cells
  const navigateCell = useCallback((direction: NavigationDirection) => {
    if (!selectedCell) return;

    let newRow = selectedCell.row;
    let newCol = selectedCell.col;

    switch (direction) {
      case 'up':
        newRow = Math.max(1, newRow - 1);
        break;
      case 'down':
        newRow = newRow + 1;
        break;
      case 'left':
        newCol = Math.max(1, newCol - 1);
        break;
      case 'right':
        newCol = newCol + 1;
        break;
    }

    const newPosition: CellPosition = {
      row: newRow,
      col: newCol,
      sheetId: selectedCell.sheetId,
    };

    setSelectedCell(newPosition);

    if (editingState.isEditing) {
      stopEditing(true);
    }
  }, [selectedCell, editingState.isEditing, stopEditing]);

  // Undo
  const undo = useCallback(() => {
    const edit = undoRedoRef.current.undoStack.pop();
    if (!edit) return;

    setCellValue(edit.position, edit.oldValue);
    undoRedoRef.current.redoStack.push(edit);
  }, [setCellValue]);

  // Redo
  const redo = useCallback(() => {
    const edit = undoRedoRef.current.redoStack.pop();
    if (!edit) return;

    setCellValue(edit.position, edit.newValue);
    undoRedoRef.current.undoStack.push(edit);
  }, [setCellValue]);

  // Copy
  const copy = useCallback(() => {
    if (!selectedCell) return null;

    const value = getCellValue(selectedCell);
    return value;
  }, [selectedCell, getCellValue]);

  // Cut
  const cut = useCallback(() => {
    if (!selectedCell) return null;

    const value = getCellValue(selectedCell);
    setCellValue(selectedCell, '');
    return value;
  }, [selectedCell, getCellValue, setCellValue]);

  // Paste
  const paste = useCallback((value: string) => {
    if (!selectedCell) return;

    setCellValue(selectedCell, value);
  }, [selectedCell, setCellValue]);

  // Apply style to selected cell
  const applyCellStyle = useCallback((styleUpdates: Partial<CellStyle>) => {
    if (!selectedCell) return;

    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === selectedCell.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      const cellKey = `${selectedCell.row}-${selectedCell.col}`;
      const cells = new Map(sheet.cells);

      const existingCell = cells.get(cellKey) || {
        row: selectedCell.row,
        col: selectedCell.col,
        type: 's' as const,
        value: '',
      };

      const updatedCell: CellData = {
        ...existingCell,
        style: {
          ...existingCell.style,
          ...styleUpdates,
        },
      };

      cells.set(cellKey, updatedCell);
      sheet.cells = cells;
      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, [selectedCell]);

  // Get current cell style
  const getCellStyle = useCallback((): CellStyle => {
    if (!selectedCell) return {};

    const sheet = workbook.sheets.find(s => s.id === selectedCell.sheetId);
    if (!sheet) return {};

    const cellKey = `${selectedCell.row}-${selectedCell.col}`;
    const cell = sheet.cells.get(cellKey);

    return cell?.style || {};
  }, [selectedCell, workbook]);

  // Toggle bold
  const toggleBold = useCallback(() => {
    const currentStyle = getCellStyle();
    applyCellStyle({ fontBold: !currentStyle.fontBold });
  }, [getCellStyle, applyCellStyle]);

  // Toggle italic
  const toggleItalic = useCallback(() => {
    const currentStyle = getCellStyle();
    applyCellStyle({ fontItalic: !currentStyle.fontItalic });
  }, [getCellStyle, applyCellStyle]);

  // Toggle underline
  const toggleUnderline = useCallback(() => {
    const currentStyle = getCellStyle();
    applyCellStyle({ fontUnderline: !currentStyle.fontUnderline });
  }, [getCellStyle, applyCellStyle]);

  // Set alignment
  const setAlignment = useCallback((align: 'left' | 'center' | 'right') => {
    applyCellStyle({ horizontalAlign: align });
  }, [applyCellStyle]);

  // Set font color
  const setFontColor = useCallback((color: string) => {
    applyCellStyle({ fontColor: color });
  }, [applyCellStyle]);

  // Set background color
  const setBackgroundColor = useCallback((color: string) => {
    applyCellStyle({ backgroundColor: color });
  }, [applyCellStyle]);

  // Set number format
  const setNumberFormat = useCallback((format: string) => {
    applyCellStyle({ numberFormat: format });
  }, [applyCellStyle]);

  // Apply border to cell
  const applyBorder = useCallback((sides: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean }, borderStyle: BorderStyle) => {
    const updates: Partial<CellStyle> = {};

    if (sides.top) {
      updates.borderTop = borderStyle;
    }
    if (sides.right) {
      updates.borderRight = borderStyle;
    }
    if (sides.bottom) {
      updates.borderBottom = borderStyle;
    }
    if (sides.left) {
      updates.borderLeft = borderStyle;
    }

    applyCellStyle(updates);
  }, [applyCellStyle]);

  // Merge cells - works with selection range or manual range
  const mergeCells = useCallback((startRow?: number, startCol?: number, endRow?: number, endCol?: number) => {
    let mergeRange: { startRow: number; startCol: number; endRow: number; endCol: number } | null = null;

    // Use selection if available and no manual range provided
    if (!startRow && !startCol && !endRow && !endCol && selection) {
      mergeRange = {
        startRow: Math.min(selection.start.row, selection.end.row),
        startCol: Math.min(selection.start.col, selection.end.col),
        endRow: Math.max(selection.start.row, selection.end.row),
        endCol: Math.max(selection.start.col, selection.end.col),
      };
    } else if (startRow && startCol && endRow && endCol) {
      mergeRange = { startRow, startCol, endRow, endCol };
    }

    if (!mergeRange || !selectedCell) return;

    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === selectedCell.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };

      // Create merge range reference (e.g., "A1:B2")
      const colStartLetter = String.fromCharCode(64 + mergeRange!.startCol);
      const colEndLetter = String.fromCharCode(64 + mergeRange!.endCol);
      const mergeRef = `${colStartLetter}${mergeRange!.startRow}:${colEndLetter}${mergeRange!.endRow}`;

      // Add to merged ranges
      const mergedRanges = [...sheet.mergedRanges, { ref: mergeRef }];
      sheet.mergedRanges = mergedRanges;

      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, [selectedCell, selection]);

  // Unmerge cells
  const unmergeCells = useCallback((_row: number, _col: number) => {
    if (!selectedCell) return;

    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === selectedCell.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };

      // Find and remove merge range containing this cell
      const mergedRanges = sheet.mergedRanges.filter(_range => {
        // Parse range (e.g., "A1:B2")
        // const [start, end] = range.ref.split(':');
        // Simple check - could be improved
        return true; // For now, keep all ranges
      });

      sheet.mergedRanges = mergedRanges;

      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, [selectedCell]);

  // Insert row
  const insertRow = useCallback((rowIndex: number) => {
    if (!selectedCell) return;

    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === selectedCell.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      const cells = new Map(sheet.cells);

      // Shift all cells below the insert point down by 1
      const newCells = new Map<string, CellData>();
      cells.forEach((cell, key) => {
        if (cell.row >= rowIndex) {
          const newCell = { ...cell, row: cell.row + 1 };
          newCells.set(`${newCell.row}-${newCell.col}`, newCell);
        } else {
          newCells.set(key, cell);
        }
      });

      sheet.cells = newCells;
      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, [selectedCell]);

  // Delete row
  const deleteRow = useCallback((rowIndex: number) => {
    if (!selectedCell) return;

    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === selectedCell.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      const cells = new Map(sheet.cells);

      // Remove cells in the row and shift cells below up
      const newCells = new Map<string, CellData>();
      cells.forEach((cell, key) => {
        if (cell.row === rowIndex) {
          // Delete this cell
          return;
        } else if (cell.row > rowIndex) {
          const newCell = { ...cell, row: cell.row - 1 };
          newCells.set(`${newCell.row}-${newCell.col}`, newCell);
        } else {
          newCells.set(key, cell);
        }
      });

      sheet.cells = newCells;
      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, [selectedCell]);

  // Insert column
  const insertColumn = useCallback((colIndex: number) => {
    if (!selectedCell) return;

    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === selectedCell.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      const cells = new Map(sheet.cells);

      // Shift all cells to the right of the insert point
      const newCells = new Map<string, CellData>();
      cells.forEach((cell, key) => {
        if (cell.col >= colIndex) {
          const newCell = { ...cell, col: cell.col + 1 };
          newCells.set(`${newCell.row}-${newCell.col}`, newCell);
        } else {
          newCells.set(key, cell);
        }
      });

      sheet.cells = newCells;
      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, [selectedCell]);

  // Delete column
  const deleteColumn = useCallback((colIndex: number) => {
    if (!selectedCell) return;

    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === selectedCell.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      const cells = new Map(sheet.cells);

      // Remove cells in the column and shift cells to the left
      const newCells = new Map<string, CellData>();
      cells.forEach((cell, key) => {
        if (cell.col === colIndex) {
          // Delete this cell
          return;
        } else if (cell.col > colIndex) {
          const newCell = { ...cell, col: cell.col - 1 };
          newCells.set(`${newCell.row}-${newCell.col}`, newCell);
        } else {
          newCells.set(key, cell);
        }
      });

      sheet.cells = newCells;
      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, [selectedCell]);

  // Set row height
  const setRowHeight = useCallback((rowIndex: number, height: number) => {
    if (!selectedCell) return;

    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === selectedCell.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      const rowProps = new Map(sheet.rowProps);

      rowProps.set(rowIndex, {
        row: rowIndex,
        height,
        customHeight: true,
      });

      sheet.rowProps = rowProps;
      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, [selectedCell]);

  // Set column width
  const setColumnWidth = useCallback((colIndex: number, width: number) => {
    if (!selectedCell) return;

    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === selectedCell.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      const colProps = new Map(sheet.colProps);

      colProps.set(colIndex, {
        col: colIndex,
        width,
        customWidth: true,
      });

      sheet.colProps = colProps;
      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, [selectedCell]);

  // Hide/Show row
  const toggleRowHidden = useCallback((rowIndex: number) => {
    if (!selectedCell) return;

    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === selectedCell.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      const rowProps = new Map(sheet.rowProps);

      const currentProp = rowProps.get(rowIndex);
      rowProps.set(rowIndex, {
        row: rowIndex,
        ...currentProp,
        hidden: !(currentProp?.hidden || false),
      });

      sheet.rowProps = rowProps;
      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, [selectedCell]);

  // Hide/Show column
  const toggleColumnHidden = useCallback((colIndex: number) => {
    if (!selectedCell) return;

    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === selectedCell.sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      const colProps = new Map(sheet.colProps);

      const currentProp = colProps.get(colIndex);
      colProps.set(colIndex, {
        col: colIndex,
        ...currentProp,
        hidden: !(currentProp?.hidden || false),
      });

      sheet.colProps = colProps;
      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, [selectedCell]);

  // Add chart to sheet
  const addChart = useCallback((sheetId: string, chartConfig: any) => {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      sheet.charts = [...(sheet.charts || []), chartConfig];

      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, []);

  // Update chart
  const updateChart = useCallback((sheetId: string, chartId: string, updates: Partial<any>) => {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      sheet.charts = (sheet.charts || []).map(chart =>
        chart.id === chartId ? { ...chart, ...updates } : chart
      );

      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, []);

  // Delete chart
  const deleteChart = useCallback((sheetId: string, chartId: string) => {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const sheetIndex = newWorkbook.sheets.findIndex(s => s.id === sheetId);

      if (sheetIndex === -1) return prev;

      const sheet = { ...newWorkbook.sheets[sheetIndex] };
      sheet.charts = (sheet.charts || []).filter(chart => chart.id !== chartId);

      newWorkbook.sheets = [...newWorkbook.sheets];
      newWorkbook.sheets[sheetIndex] = sheet;

      return newWorkbook;
    });
  }, []);

  // Add named range
  const addNamedRange = useCallback((namedRange: any) => {
    setWorkbook(prev => ({
      ...prev,
      namedRanges: [...(prev.namedRanges || []), namedRange],
    }));
  }, []);

  // Update named range
  const updateNamedRange = useCallback((id: string, updates: Partial<any>) => {
    setWorkbook(prev => ({
      ...prev,
      namedRanges: (prev.namedRanges || []).map(nr =>
        nr.id === id ? { ...nr, ...updates } : nr
      ),
    }));
  }, []);

  // Delete named range
  const deleteNamedRange = useCallback((id: string) => {
    setWorkbook(prev => ({
      ...prev,
      namedRanges: (prev.namedRanges || []).filter(nr => nr.id !== id),
    }));
  }, []);

  // Toggle manual calculation mode
  const toggleManualCalc = useCallback(() => {
    setManualCalc(prev => !prev);
  }, []);

  // Force recalculation (when in manual mode)
  const recalculate = useCallback(() => {
    if (hfRef.current) {
      // Trigger full recalculation
      syncSheetToHyperFormula();
    }
  }, [syncSheetToHyperFormula]);

  // Optimize undo stack (remove old entries to save memory)
  const optimizeUndoStack = useCallback(() => {
    const stack = undoRedoRef.current.undoStack;
    if (stack.length > undoRedoRef.current.maxSize) {
      undoRedoRef.current.undoStack = stack.slice(-undoRedoRef.current.maxSize);
    }
  }, []);

  return {
    workbook,
    setWorkbook,
    editingState,
    selectedCell,
    setSelectedCell,
    setSelectedCellWithSelection,
    selection,
    setSelection,
    getCellValue,
    getCellDisplayValue,
    getCellStyle,
    setCellValue,
    applyCellStyle,
    startEditing,
    stopEditing,
    updateEditingValue,
    navigateCell,
    undo,
    redo,
    copy,
    cut,
    paste,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    setAlignment,
    setFontColor,
    setBackgroundColor,
    setNumberFormat,
    applyBorder,
    mergeCells,
    unmergeCells,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
    setRowHeight,
    setColumnWidth,
    toggleRowHidden,
    toggleColumnHidden,
    addChart,
    updateChart,
    deleteChart,
    addNamedRange,
    updateNamedRange,
    deleteNamedRange,
    manualCalc,
    toggleManualCalc,
    recalculate,
    optimizeUndoStack,
    canUndo: undoRedoRef.current.undoStack.length > 0,
    canRedo: undoRedoRef.current.redoStack.length > 0,

    // Phase 11: Comments
    addCellComment,
    addCommentToThread,
    editComment,
    deleteComment,
    resolveCellComment,
    unresolveCellComment,
    getCellComment,

    // Phase 11: Change Tracking
    toggleChangeTracking,
    addChange,
    acceptChange,
    rejectChange,
    acceptAllChanges,
    rejectAllChanges,
  };

  // ==================== Phase 11: Comments ====================

  function addCellComment(row: number, col: number, sheetId: string, author: string, content: string) {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const comments = newWorkbook.comments || [];

      const newComment: CellComment = {
        id: `comment-${Date.now()}`,
        row,
        col,
        sheetId,
        comments: [{
          id: `msg-${Date.now()}`,
          author,
          content,
          timestamp: Date.now(),
        }],
        resolved: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      newWorkbook.comments = [...comments, newComment];
      return newWorkbook;
    });
  }

  function addCommentToThread(cellCommentId: string, parentId: string, author: string, content: string) {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const comments = [...(newWorkbook.comments || [])];
      const cellCommentIndex = comments.findIndex(c => c.id === cellCommentId);

      if (cellCommentIndex === -1) return prev;

      const cellComment = { ...comments[cellCommentIndex] };
      const newComment: Comment = {
        id: `msg-${Date.now()}`,
        author,
        content,
        timestamp: Date.now(),
        parentId: parentId || undefined,
      };

      cellComment.comments = [...cellComment.comments, newComment];
      cellComment.updatedAt = Date.now();
      comments[cellCommentIndex] = cellComment;
      newWorkbook.comments = comments;

      return newWorkbook;
    });
  }

  function editComment(cellCommentId: string, commentId: string, newContent: string) {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const comments = [...(newWorkbook.comments || [])];
      const cellCommentIndex = comments.findIndex(c => c.id === cellCommentId);

      if (cellCommentIndex === -1) return prev;

      const cellComment = { ...comments[cellCommentIndex] };
      const commentIndex = cellComment.comments.findIndex((c: Comment) => c.id === commentId);

      if (commentIndex === -1) return prev;

      const comment = { ...cellComment.comments[commentIndex] };
      comment.content = newContent;
      comment.edited = true;
      comment.editedAt = Date.now();

      cellComment.comments = [...cellComment.comments];
      cellComment.comments[commentIndex] = comment;
      cellComment.updatedAt = Date.now();
      comments[cellCommentIndex] = cellComment;
      newWorkbook.comments = comments;

      return newWorkbook;
    });
  }

  function deleteComment(cellCommentId: string, commentId: string) {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const comments = [...(newWorkbook.comments || [])];
      const cellCommentIndex = comments.findIndex(c => c.id === cellCommentId);

      if (cellCommentIndex === -1) return prev;

      const cellComment = { ...comments[cellCommentIndex] };

      // Remove comment and all its replies
      const removeIds = new Set<string>();
      const findReplies = (parentId: string) => {
        removeIds.add(parentId);
        cellComment.comments.forEach((c: Comment) => {
          if (c.parentId === parentId) findReplies(c.id);
        });
      };
      findReplies(commentId);

      cellComment.comments = cellComment.comments.filter((c: Comment) => !removeIds.has(c.id));
      cellComment.updatedAt = Date.now();

      // If no comments left, remove the cell comment
      if (cellComment.comments.length === 0) {
        newWorkbook.comments = comments.filter(c => c.id !== cellCommentId);
      } else {
        comments[cellCommentIndex] = cellComment;
        newWorkbook.comments = comments;
      }

      return newWorkbook;
    });
  }

  function resolveCellComment(cellCommentId: string) {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const comments = [...(newWorkbook.comments || [])];
      const cellCommentIndex = comments.findIndex(c => c.id === cellCommentId);

      if (cellCommentIndex === -1) return prev;

      const cellComment = { ...comments[cellCommentIndex] };
      cellComment.resolved = true;
      cellComment.updatedAt = Date.now();
      comments[cellCommentIndex] = cellComment;
      newWorkbook.comments = comments;

      return newWorkbook;
    });
  }

  function unresolveCellComment(cellCommentId: string) {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const comments = [...(newWorkbook.comments || [])];
      const cellCommentIndex = comments.findIndex(c => c.id === cellCommentId);

      if (cellCommentIndex === -1) return prev;

      const cellComment = { ...comments[cellCommentIndex] };
      cellComment.resolved = false;
      cellComment.updatedAt = Date.now();
      comments[cellCommentIndex] = cellComment;
      newWorkbook.comments = comments;

      return newWorkbook;
    });
  }

  function getCellComment(row: number, col: number, sheetId: string): CellComment | null {
    return workbook.comments?.find(c => c.row === row && c.col === col && c.sheetId === sheetId) || null;
  }

  // ==================== Phase 11: Change Tracking ====================

  function toggleChangeTracking() {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const tracking = newWorkbook.changeTracking || {
        enabled: false,
        changes: [],
        currentUser: 'User',
      };

      newWorkbook.changeTracking = {
        ...tracking,
        enabled: !tracking.enabled,
      };

      return newWorkbook;
    });
  }

  function addChange(change: Omit<Change, 'id' | 'timestamp'>) {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const tracking = newWorkbook.changeTracking;

      if (!tracking || !tracking.enabled) return prev;

      const newChange: Change = {
        ...change,
        id: `change-${Date.now()}`,
        timestamp: Date.now(),
      };

      newWorkbook.changeTracking = {
        ...tracking,
        changes: [...tracking.changes, newChange],
      };

      return newWorkbook;
    });
  }

  function acceptChange(changeId: string) {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const tracking = newWorkbook.changeTracking;

      if (!tracking) return prev;

      const changes = [...tracking.changes];
      const changeIndex = changes.findIndex(c => c.id === changeId);

      if (changeIndex === -1) return prev;

      changes[changeIndex] = { ...changes[changeIndex], accepted: true };
      newWorkbook.changeTracking = { ...tracking, changes };

      return newWorkbook;
    });
  }

  function rejectChange(changeId: string) {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const tracking = newWorkbook.changeTracking;

      if (!tracking) return prev;

      const changes = [...tracking.changes];
      const changeIndex = changes.findIndex(c => c.id === changeId);

      if (changeIndex === -1) return prev;

      changes[changeIndex] = { ...changes[changeIndex], rejected: true };
      newWorkbook.changeTracking = { ...tracking, changes };

      return newWorkbook;
    });
  }

  function acceptAllChanges() {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const tracking = newWorkbook.changeTracking;

      if (!tracking) return prev;

      const changes = tracking.changes.map((c: Change) =>
        !c.accepted && !c.rejected ? { ...c, accepted: true } : c
      );

      newWorkbook.changeTracking = { ...tracking, changes };
      return newWorkbook;
    });
  }

  function rejectAllChanges() {
    setWorkbook(prev => {
      const newWorkbook = { ...prev };
      const tracking = newWorkbook.changeTracking;

      if (!tracking) return prev;

      const changes = tracking.changes.map((c: Change) =>
        !c.accepted && !c.rejected ? { ...c, rejected: true } : c
      );

      newWorkbook.changeTracking = { ...tracking, changes };
      return newWorkbook;
    });
  }
}
