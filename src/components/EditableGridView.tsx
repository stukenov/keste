import { useMemo, useState, useEffect, useCallback } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import { Table } from 'lucide-react';
import type { SheetModel, WorkbookModel } from '../core-ts/types';
import type { CellPosition, EditingState, NavigationDirection } from '../core-ts/editor-types';
import { resolveCellStyle } from '../core-ts/style-resolver';
import { shouldHideCell, getMergedCellSize } from '../core-ts/merge-utils';
import { cn } from '@/lib/utils';

interface EditableGridViewProps {
  sheet: SheetModel;
  workbook: WorkbookModel; // НОВОЕ: для разрешения стилей
  editingState: EditingState;
  selectedCell: CellPosition | null;
  selection: { start: CellPosition; end: CellPosition } | null;
  onCellClick: (position: CellPosition, isShiftKey?: boolean) => void;
  onCellDoubleClick: (position: CellPosition) => void;
  onEditingValueChange: (value: string) => void;
  onStopEditing: (save: boolean) => void;
  onNavigate: (direction: NavigationDirection) => void;
  getCellValue: (position: CellPosition) => string;
  getCellDisplayValue: (position: CellPosition) => string | number;
  // ⚡ Context menu handlers removed for performance - use keyboard shortcuts
}

export function EditableGridView({
  sheet,
  workbook, // НОВОЕ
  editingState,
  selectedCell,
  selection,
  onCellClick,
  onCellDoubleClick,
  onEditingValueChange,
  onStopEditing,
  onNavigate,
  getCellValue,
  getCellDisplayValue,
}: EditableGridViewProps) {
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('grid-container');
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if editing
      if (editingState.isEditing) return;

      // Arrow keys navigation
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigate('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigate('down');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate('right');
      } else if (e.key === 'Enter') {
        // Start editing on Enter
        if (selectedCell) {
          onCellDoubleClick(selectedCell);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingState.isEditing, selectedCell, onNavigate, onCellDoubleClick]);

  const { maxRow, maxCol } = useMemo(() => {
    let maxRow = 0;
    let maxCol = 0;

    for (const [, cell] of sheet.cells) {
      maxRow = Math.max(maxRow, cell.row);
      maxCol = Math.max(maxCol, cell.col);
    }

    maxRow = Math.max(maxRow, 100);
    maxCol = Math.max(maxCol, 26);

    return { maxRow, maxCol };
  }, [sheet]);

  const colNumToLetter = (num: number): string => {
    let result = '';
    let n = num;
    while (n > 0) {
      const rem = (n - 1) % 26;
      result = String.fromCharCode(65 + rem) + result;
      n = Math.floor((n - 1) / 26);
    }
    return result;
  };

  // ⚡ ULTRA-OPTIMIZED Cell renderer - NO ContextMenu, minimal deps
  const Cell = useCallback(({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    // Header cells
    if (rowIndex === 0 && columnIndex === 0) {
      return (
        <div
          style={style}
          className="border-r border-b bg-muted/50 flex items-center justify-center sticky top-0 left-0 z-20"
        >
          <Table className="h-3 w-3 text-muted-foreground" />
        </div>
      );
    }

    if (rowIndex === 0) {
      return (
        <div
          style={style}
          className="border-r border-b bg-muted/50 flex items-center justify-center font-semibold text-xs text-muted-foreground sticky top-0 z-10"
        >
          {colNumToLetter(columnIndex)}
        </div>
      );
    }

    if (columnIndex === 0) {
      return (
        <div
          style={style}
          className="border-r border-b bg-muted/50 flex items-center justify-center font-semibold text-xs text-muted-foreground sticky left-0 z-10"
        >
          {rowIndex}
        </div>
      );
    }

    // Data cells
    const position: CellPosition = {
      row: rowIndex,
      col: columnIndex,
      sheetId: sheet.id,
    };

    const isSelected =
      selectedCell?.row === rowIndex &&
      selectedCell?.col === columnIndex &&
      selectedCell?.sheetId === sheet.id;

    // Check if cell is in selection range
    const isInSelection = selection && (
      rowIndex >= Math.min(selection.start.row, selection.end.row) &&
      rowIndex <= Math.max(selection.start.row, selection.end.row) &&
      columnIndex >= Math.min(selection.start.col, selection.end.col) &&
      columnIndex <= Math.max(selection.start.col, selection.end.col) &&
      selection.start.sheetId === sheet.id
    );

    const isEditing =
      editingState.isEditing &&
      editingState.position?.row === rowIndex &&
      editingState.position?.col === columnIndex &&
      editingState.position?.sheetId === sheet.id;

    // ===== MERGED CELLS LOGIC =====
    // Проверяем, нужно ли скрыть эту ячейку (она в merged range, но не master)
    if (shouldHideCell(rowIndex, columnIndex, sheet.mergedRanges)) {
      return null; // Не рендерить эту ячейку
    }

    // Проверяем, является ли эта ячейка master в merged range
    const mergedSize = getMergedCellSize(rowIndex, columnIndex, sheet.mergedRanges);

    const rawValue = getCellValue(position);
    const displayValue = isEditing ? editingState.value : getCellDisplayValue(position);
    const hasFormula = rawValue.startsWith('=');

    // Get cell data for styling
    const cellKey = `${position.row}-${position.col}`;
    const cellData = sheet.cells.get(cellKey);

    // DEBUG: Log first few cells
    if (rowIndex <= 2 && columnIndex <= 2) {
      console.log(`Cell ${cellKey}: rawValue="${rawValue}", displayValue="${displayValue}", cellData:`, cellData);
    }

    // НОВОЕ: Разрешаем стиль через style-resolver
    const cellStyle = cellData
      ? cellData.style || resolveCellStyle(cellData, workbook)
      : undefined;

    // Build custom style object with borders
    const customStyle: React.CSSProperties = {
      ...style,
      fontFamily: cellStyle?.fontName,
      fontSize: cellStyle?.fontSize ? `${cellStyle.fontSize}px` : undefined,
      fontWeight: cellStyle?.fontBold ? 'bold' : undefined,
      fontStyle: cellStyle?.fontItalic ? 'italic' : undefined,
      textDecoration: cellStyle?.fontUnderline ? 'underline' : undefined,
      color: cellStyle?.fontColor,
      backgroundColor: cellStyle?.backgroundColor,
      textAlign: (cellStyle?.horizontalAlign && ['left', 'center', 'right', 'justify'].includes(cellStyle.horizontalAlign))
        ? cellStyle.horizontalAlign as React.CSSProperties['textAlign']
        : undefined,
      whiteSpace: cellStyle?.wrapText ? 'normal' : 'nowrap',
      display: cellStyle?.verticalAlign ? 'flex' : undefined,
      alignItems: cellStyle?.verticalAlign === 'top' ? 'flex-start'
        : cellStyle?.verticalAlign === 'bottom' ? 'flex-end'
        : (cellStyle && (cellStyle.verticalAlign === 'center' || cellStyle.verticalAlign === 'justify' || cellStyle.verticalAlign === 'distributed')) ? 'center'
        : undefined,
    };

    // ===== APPLY MERGED CELL SIZE =====
    if (mergedSize) {
      // Растянуть ячейку на несколько строк/колонок
      customStyle.gridColumn = `span ${mergedSize.colSpan}`;
      customStyle.gridRow = `span ${mergedSize.rowSpan}`;
      customStyle.zIndex = 10; // Поверх других ячеек

      // react-window использует абсолютное позиционирование и фиксированную ширину/высоту
      // Поэтому для merged cells необходимо вручную скорректировать размеры
      const baseWidth = typeof style.width === 'number'
        ? style.width
        : parseFloat(String(style.width));
      const baseHeight = typeof style.height === 'number'
        ? style.height
        : parseFloat(String(style.height));

      if (!Number.isNaN(baseWidth)) {
        customStyle.width = baseWidth * mergedSize.colSpan;
      }

      if (!Number.isNaN(baseHeight)) {
        customStyle.height = baseHeight * mergedSize.rowSpan;
      }
    }

    // Apply borders if present
    if (cellStyle?.borderTop) {
      const borderWidth = cellStyle.borderTop.style === 'medium' ? '2px'
        : cellStyle.borderTop.style === 'thick' ? '3px'
        : '1px';
      const borderStyle = cellStyle.borderTop.style === 'dashed' ? 'dashed'
        : cellStyle.borderTop.style === 'dotted' ? 'dotted'
        : cellStyle.borderTop.style === 'double' ? 'double'
        : 'solid';
      customStyle.borderTop = `${borderWidth} ${borderStyle} ${cellStyle.borderTop.color || '#000000'}`;
    }
    if (cellStyle?.borderRight) {
      const borderWidth = cellStyle.borderRight.style === 'medium' ? '2px'
        : cellStyle.borderRight.style === 'thick' ? '3px'
        : '1px';
      const borderStyle = cellStyle.borderRight.style === 'dashed' ? 'dashed'
        : cellStyle.borderRight.style === 'dotted' ? 'dotted'
        : cellStyle.borderRight.style === 'double' ? 'double'
        : 'solid';
      customStyle.borderRight = `${borderWidth} ${borderStyle} ${cellStyle.borderRight.color || '#000000'}`;
    }
    if (cellStyle?.borderBottom) {
      const borderWidth = cellStyle.borderBottom.style === 'medium' ? '2px'
        : cellStyle.borderBottom.style === 'thick' ? '3px'
        : '1px';
      const borderStyle = cellStyle.borderBottom.style === 'dashed' ? 'dashed'
        : cellStyle.borderBottom.style === 'dotted' ? 'dotted'
        : cellStyle.borderBottom.style === 'double' ? 'double'
        : 'solid';
      customStyle.borderBottom = `${borderWidth} ${borderStyle} ${cellStyle.borderBottom.color || '#000000'}`;
    }
    if (cellStyle?.borderLeft) {
      const borderWidth = cellStyle.borderLeft.style === 'medium' ? '2px'
        : cellStyle.borderLeft.style === 'thick' ? '3px'
        : '1px';
      const borderStyle = cellStyle.borderLeft.style === 'dashed' ? 'dashed'
        : cellStyle.borderLeft.style === 'dotted' ? 'dotted'
        : cellStyle.borderLeft.style === 'double' ? 'double'
        : 'solid';
      customStyle.borderLeft = `${borderWidth} ${borderStyle} ${cellStyle.borderLeft.color || '#000000'}`;
    }

    if (isEditing) {
      return (
        <div
          style={customStyle}
          className="border-2 border-primary bg-background z-30 relative"
        >
          <input
            autoFocus
            type="text"
            value={displayValue}
            onChange={(e) => onEditingValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onStopEditing(true);
                onNavigate('down');
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onStopEditing(false);
              } else if (e.key === 'Tab') {
                e.preventDefault();
                onStopEditing(true);
                onNavigate(e.shiftKey ? 'left' : 'right');
              }
            }}
            onBlur={() => onStopEditing(true)}
            className="w-full h-full px-2 py-1 text-sm outline-none bg-transparent"
          />
        </div>
      );
    }

    // ⚡ NO ContextMenu - use global keyboard shortcuts instead!
    return (
      <div
        style={customStyle}
        onClick={(e) => {
          if (e.detail !== 2) onCellClick(position, e.shiftKey);
        }}
        onMouseDown={(e) => {
          if (e.button === 0 && !e.shiftKey) { // Left click without shift
            setIsDragging(true);
            onCellClick(position, false);
          }
        }}
        onMouseEnter={() => {
          if (isDragging) {
            onCellClick(position, true); // Extend selection while dragging
          }
        }}
        onMouseUp={() => {
          setIsDragging(false);
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCellDoubleClick(position);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onCellClick(position, false); // Select on right-click
          // Context menu can be added globally if needed
        }}
        className={cn(
          // ⚡ INSTANT response - no transitions, no context menu overhead
          "border-r border-b px-2 py-1 text-sm overflow-hidden text-ellipsis whitespace-nowrap cursor-cell select-none",
          isSelected
            ? "bg-primary/10 border-2 border-primary -m-[1px] z-20 ring-2 ring-primary/20"
            : isInSelection
            ? "bg-primary/5 border-primary/50"
            : "hover:bg-accent/30",
          hasFormula && "text-primary font-mono text-xs"
        )}
        title={String(displayValue)}
      >
        {displayValue}
      </div>
    );
  }, [sheet.id, selectedCell, selection, editingState, getCellValue, getCellDisplayValue, onCellClick, onCellDoubleClick, onEditingValueChange, onStopEditing, onNavigate, isDragging]);

  // Stop dragging when mouse up anywhere
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div id="grid-container" className="h-full bg-background">
      <Grid
        columnCount={maxCol + 1}
        columnWidth={120}
        height={dimensions.height}
        rowCount={maxRow + 1}
        rowHeight={32}
        width={dimensions.width}
        className="font-sans focus:outline-none"
      >
        {Cell}
      </Grid>
    </div>
  );
}

export default EditableGridView;
