import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import EditableGridView from './EditableGridView';
import ExportBar from './ExportBar';
import SheetTabs from './SheetTabs';
import { FormulaBar } from './FormulaBar';
import { FindReplaceDialog } from './FindReplaceDialog';
import { DataValidationDialog } from './DataValidationDialog';
import { ConditionalFormattingDialog } from './ConditionalFormattingDialog';
import { ChartBuilder } from './ChartBuilder';
import { ChartRenderer } from './ChartRenderer';
import { FormulaLibrary } from './FormulaLibrary';
import { NameManager } from './NameManager';
import { PerformanceMonitor } from './PerformanceMonitor';
import { CommentPanel } from './CommentPanel';
import { ChangeTracker } from './ChangeTracker';
import { generateSqlDump } from '../core-ts/sql_dump';
import { createXlsxBlob } from '../core-ts/write_xlsx';
import { useToast } from './ui/use-toast';
import { useSpreadsheetEditor } from '../hooks/useSpreadsheetEditor';
import { useDataManagement } from '../hooks/useDataManagement';
import { useAutoSave } from '../hooks/useAutoSave';
import type { WorkbookModel } from '../core-ts/types';
import type { CellPosition, NavigationDirection } from '../core-ts/editor-types';
import type { ChartConfig } from '../core-ts/chart-types';

interface WorkbookViewerProps {
  workbook: WorkbookModel;
  onClose: () => void;
}

function WorkbookViewer({ workbook: initialWorkbook, onClose }: WorkbookViewerProps) {
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [dataValidationOpen, setDataValidationOpen] = useState(false);
  const [conditionalFormattingOpen, setConditionalFormattingOpen] = useState(false);
  const [chartBuilderOpen, setChartBuilderOpen] = useState(false);
  const [formulaLibraryOpen, setFormulaLibraryOpen] = useState(false);
  const [nameManagerOpen, setNameManagerOpen] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [perfMonitorOpen, setPerfMonitorOpen] = useState(false);
  const [commentPanelOpen, setCommentPanelOpen] = useState(false);
  const [changeTrackerOpen, setChangeTrackerOpen] = useState(false);
  const [savePath, setSavePath] = useState<string | null>(null);
  const [autoSavePath, setAutoSavePath] = useState<string | null>(null);
  const { toast } = useToast();

  // Use spreadsheet editor hook
  const {
    workbook,
    editingState,
    selectedCell,
    setSelectedCell,
    setSelectedCellWithSelection,
    selection,
    getCellValue,
    getCellDisplayValue,
    getCellStyle,
    setCellValue,
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
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
    addChart,
    deleteChart,
    addNamedRange,
    updateNamedRange,
    deleteNamedRange,
    manualCalc,
    toggleManualCalc,
    recalculate,
    canUndo,
    canRedo,
    addCellComment,
    addCommentToThread,
    editComment,
    deleteComment,
    resolveCellComment,
    unresolveCellComment,
    toggleChangeTracking,
    acceptChange,
    rejectChange,
    acceptAllChanges,
    rejectAllChanges,
  } = useSpreadsheetEditor(initialWorkbook);

  // Safety check for empty sheets array
  const currentSheet = workbook.sheets && workbook.sheets.length > 0
    ? workbook.sheets[Math.min(selectedSheetIndex, workbook.sheets.length - 1)]
    : undefined;

  // Initialize data management hook
  const dataManagement = useDataManagement(currentSheet?.id || '');

  const resolveSavePath = useCallback(
    async (auto: boolean) => {
      if (!auto && savePath) {
        return savePath;
      }

      if (auto) {
        if (savePath) {
          return savePath;
        }

        if (autoSavePath) {
          return autoSavePath;
        }

        const generatedPath = await invoke<string>('get_auto_save_path');
        setAutoSavePath(generatedPath);
        return generatedPath;
      }

      const chosenPath = await invoke<string>('choose_save_file', {
        defaultName: 'spreadsheet.kst',
      });
      setSavePath(chosenPath);
      return chosenPath;
    },
    [autoSavePath, savePath]
  );

  const performSave = useCallback(
    async (isAuto: boolean) => {
      const showProgress = !isAuto;

      if (showProgress) {
        setExporting(true);
        setProgress(10);
      }

      try {
        if (showProgress) {
          setProgress(30);
        }

        let sqlDump = '';
        for await (const chunk of generateSqlDump(workbook)) {
          sqlDump += chunk;
        }

        if (showProgress) {
          setProgress(50);
        }

        const targetPath = await resolveSavePath(isAuto);

        if (showProgress) {
          setProgress(70);
        }

        const result = await invoke<{ bytes_written: number }>('save_sqlite', {
          request: {
            sql_dump: sqlDump,
            out_path: targetPath,
          },
        });

        if (!isAuto) {
          setProgress(100);
          toast({
            title: "Saved successfully!",
            description: `Keste file saved: ${(result.bytes_written / 1024).toFixed(2)} KB`,
          });
        }
      } catch (err) {
        if (isAuto) {
          throw err;
        }

        toast({
          variant: "destructive",
          title: "Save failed",
          description: String(err),
        });
      } finally {
        if (showProgress) {
          setExporting(false);
          setProgress(0);
        }
      }
    },
    [resolveSavePath, toast, workbook]
  );

  // Phase 10: Auto-save hook
  const autoSave = useAutoSave({
    enabled: true,
    interval: 30000, // 30 seconds
    onSave: async () => {
      await performSave(true);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Auto-save failed",
        description: error.message,
      });
    },
  });

  const handleCellClick = (position: CellPosition, extendSelection: boolean = false) => {
    // If clicking on the same cell that is already selected, don't stop editing
    if (editingState.isEditing &&
        editingState.position?.row === position.row &&
        editingState.position?.col === position.col &&
        editingState.position?.sheetId === position.sheetId) {
      return;
    }

    setSelectedCellWithSelection(position, extendSelection);
    if (editingState.isEditing) {
      stopEditing(true);
    }
    autoSave.markDirty(); // Mark as dirty on cell changes
  };

  const handleCellDoubleClick = (position: CellPosition) => {
    startEditing(position);
  };

  const handleNavigate = (direction: NavigationDirection) => {
    navigateCell(direction);
  };

  // Copy/Paste handlers
  const handleCopy = async () => {
    const value = copy();
    if (value !== null) {
      try {
        await navigator.clipboard.writeText(value);
        toast({
          title: "Copied",
          description: "Cell value copied to clipboard",
        });
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleCut = async () => {
    const value = cut();
    if (value !== null) {
      try {
        await navigator.clipboard.writeText(value);
        toast({
          title: "Cut",
          description: "Cell value cut to clipboard",
        });
      } catch (err) {
        console.error('Failed to cut:', err);
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      paste(text);
      toast({
        title: "Pasted",
        description: "Value pasted from clipboard",
      });
      autoSave.markDirty();
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    if (canUndo) {
      undo();
      toast({
        title: "Undone",
        description: "Last change undone",
      });
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redo();
      toast({
        title: "Redone",
        description: "Last change redone",
      });
    }
  };

  // Keyboard shortcuts - FIXED: useEffect instead of useState!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⚡ Auto-start editing on text/number input (Excel-like behavior)
      if (
        selectedCell &&
        !editingState.isEditing &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        e.key.length === 1 && // Single character (not Enter, Escape, etc.)
        !e.key.match(/^F\d+$/) // Not F1-F12
      ) {
        e.preventDefault();
        // Start editing with the typed character
        startEditing(selectedCell, e.key);
        return;
      }

      // Delete key clears cell
      if (e.key === 'Delete' && selectedCell && !editingState.isEditing) {
        e.preventDefault();
        setCellValue(selectedCell, '');
        return;
      }

      // Backspace starts editing with empty value
      if (e.key === 'Backspace' && selectedCell && !editingState.isEditing) {
        e.preventDefault();
        startEditing(selectedCell, '');
        return;
      }

      // Ctrl/Cmd + F for Find
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setFindReplaceOpen(true);
      }
      // Ctrl/Cmd + H for Replace
      else if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setFindReplaceOpen(true);
      }
      // Ctrl/Cmd + Z for undo
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl/Cmd + C for copy
      else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (!editingState.isEditing) {
          e.preventDefault();
          handleCopy();
        }
      }
      // Ctrl/Cmd + X for cut
      else if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        if (!editingState.isEditing) {
          e.preventDefault();
          handleCut();
        }
      }
      // Ctrl/Cmd + V for paste
      else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (!editingState.isEditing) {
          e.preventDefault();
          handlePaste();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, editingState, startEditing, setCellValue, handleUndo, handleRedo, handleCopy, handleCut, handlePaste]);

  const handleSaveKst = async () => {
    await performSave(false);
  };

  const handleExportExcel = async () => {
    setExporting(true);
    setProgress(10);

    try {
      // Generate XLSX blob
      setProgress(30);
      const blob = await createXlsxBlob(workbook);
      setProgress(70);

      // Choose save location
      const outPath = await invoke<string>('choose_save_file', {
        defaultName: 'workbook.xlsx',
      });

      if (!outPath) {
        setExporting(false);
        setProgress(0);
        return;
      }

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outPath.split(/[/\\]/).pop() || 'export.xlsx';
      a.click();
      URL.revokeObjectURL(url);

      setProgress(100);

      toast({
        title: "Export successful!",
        description: `Excel file exported: ${(blob.size / 1024).toFixed(2)} KB`,
      });
    } catch (err) {
      console.error('Export error:', err);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: String(err),
      });
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  // Helper to get cell reference (A1, B2, etc.)
  const getCellRef = (row: number, col: number) => {
    const colLetter = String.fromCharCode(65 + ((col - 1) % 26));
    return `${colLetter}${row}`;
  };

  const currentCellRef = selectedCell ? getCellRef(selectedCell.row, selectedCell.col) : '';
  const currentCellValue = selectedCell ? getCellValue(selectedCell) : '';
  const currentCellStyle = getCellStyle();
  
  // Calculate selection info
  const selectionInfo = selection ? {
    rowCount: Math.abs(selection.end.row - selection.start.row) + 1,
    colCount: Math.abs(selection.end.col - selection.start.col) + 1,
    cellCount: (Math.abs(selection.end.row - selection.start.row) + 1) * 
               (Math.abs(selection.end.col - selection.start.col) + 1),
  } : null;

  // Phase 7 handlers
  const handleMergeCells = () => {
    if (!selectedCell) return;
    
    // Use selection range if available, otherwise merge 2x2 cells around selected cell
    if (selection) {
      mergeCells(); // Will use selection automatically
      const cellCount = (Math.abs(selection.end.row - selection.start.row) + 1) * 
                        (Math.abs(selection.end.col - selection.start.col) + 1);
      toast({
        title: "Cells Merged",
        description: `Merged ${cellCount} cells`,
      });
    } else {
      mergeCells(selectedCell.row, selectedCell.col, selectedCell.row + 1, selectedCell.col + 1);
      toast({
        title: "Cells Merged",
        description: "Merged 2x2 cells",
      });
    }
  };

  const handleInsertRow = () => {
    if (!selectedCell) return;
    insertRow(selectedCell.row);
    toast({
      title: "Row Inserted",
      description: `Row inserted at position ${selectedCell.row}`,
    });
  };

  const handleDeleteRow = () => {
    if (!selectedCell) return;
    deleteRow(selectedCell.row);
    toast({
      title: "Row Deleted",
      description: `Row ${selectedCell.row} deleted`,
    });
  };

  const handleInsertColumn = () => {
    if (!selectedCell) return;
    insertColumn(selectedCell.col);
    toast({
      title: "Column Inserted",
      description: `Column inserted at position ${selectedCell.col}`,
    });
  };

  const handleDeleteColumn = () => {
    if (!selectedCell) return;
    deleteColumn(selectedCell.col);
    toast({
      title: "Column Deleted",
      description: `Column ${selectedCell.col} deleted`,
    });
  };

  // Phase 8: Chart handlers
  const handleCreateChart = (config: ChartConfig) => {
    if (!currentSheet) return;
    addChart(currentSheet.id, config);
    toast({
      title: "Chart Created",
      description: `${config.type} chart created successfully`,
    });
  };

  const handleDeleteChart = (chartId: string) => {
    if (!currentSheet) return;
    deleteChart(currentSheet.id, chartId);
    toast({
      title: "Chart Deleted",
      description: "Chart removed from sheet",
    });
  };

  // Phase 9: Named Range handlers
  const handleCreateNamedRange = (range: Omit<any, 'id' | 'createdAt'>) => {
    const newRange = {
      ...range,
      id: `range-${Date.now()}`,
      createdAt: Date.now(),
    };
    addNamedRange(newRange);
    toast({
      title: "Named Range Created",
      description: `"${range.name}" created successfully`,
    });
  };

  const handleInsertFormula = (formula: string) => {
    if (selectedCell && editingState.isEditing) {
      updateEditingValue(formula);
    } else if (selectedCell) {
      startEditing(selectedCell, formula);
    }
  };

  // Phase 10: Performance and calculation handlers
  const handleRecalculate = () => {
    recalculate();
    toast({
      title: "Recalculation Complete",
      description: "All formulas have been recalculated",
    });
  };

  const handleToggleManualCalc = () => {
    toggleManualCalc();
    toast({
      title: manualCalc ? "Automatic Calculation" : "Manual Calculation",
      description: manualCalc
        ? "Formulas will calculate automatically"
        : "Formulas will only calculate when you click Recalculate",
    });
  };

  // Phase 11: Change tracking handlers
  const handleNavigateToChange = (change: any) => {
    if (change.location?.row && change.location?.col) {
      setSelectedCell({
        row: change.location.row,
        col: change.location.col,
        sheetId: change.sheetId,
      });
    }
    toast({
      title: "Navigated to Change",
      description: change.description,
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Excel-like Ribbon */}
      <ExportBar
        onExportSqlite={handleSaveKst}
        onExportSql={handleExportExcel}
        onClose={onClose}
        exporting={exporting}
        progress={progress}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onBold={toggleBold}
        onItalic={toggleItalic}
        onUnderline={toggleUnderline}
        onAlignLeft={() => setAlignment('left' as const)}
        onAlignCenter={() => setAlignment('center' as const)}
        onAlignRight={() => setAlignment('right' as const)}
        onFontColor={setFontColor}
        onBackgroundColor={setBackgroundColor}
        isBold={currentCellStyle.fontBold}
        isItalic={currentCellStyle.fontItalic}
        isUnderline={currentCellStyle.fontUnderline}
        currentAlign={(currentCellStyle.horizontalAlign && ['left', 'center', 'right'].includes(currentCellStyle.horizontalAlign))
          ? (currentCellStyle.horizontalAlign as 'left' | 'center' | 'right')
          : 'left'}
        onFindReplace={() => setFindReplaceOpen(true)}
        onDataValidation={() => setDataValidationOpen(true)}
        onConditionalFormatting={() => setConditionalFormattingOpen(true)}
        onApplyBorder={applyBorder}
        onApplyNumberFormat={setNumberFormat}
        currentNumberFormat={currentCellStyle.numberFormat || 'General'}
        onMergeCells={handleMergeCells}
        onInsertRow={handleInsertRow}
        onDeleteRow={handleDeleteRow}
        onInsertColumn={handleInsertColumn}
        onDeleteColumn={handleDeleteColumn}
        onCreateChart={() => setChartBuilderOpen(true)}
        onFormulaLibrary={() => setFormulaLibraryOpen(true)}
        onNameManager={() => setNameManagerOpen(true)}
        onToggleShowFormulas={() => setShowFormulas(!showFormulas)}
        showFormulas={showFormulas}
        onPerformanceMonitor={() => setPerfMonitorOpen(true)}
        onToggleManualCalc={handleToggleManualCalc}
        manualCalc={manualCalc}
        onRecalculate={handleRecalculate}
        autoSaveStatus={{
          enabled: true,
          lastSave: autoSave.lastSaveTime,
          isSaving: autoSave.isSaving,
        }}
        onComments={() => setCommentPanelOpen(true)}
        onChangeTracking={() => setChangeTrackerOpen(true)}
        commentsCount={workbook.comments?.filter((c: any) => !c.resolved).length || 0}
        changesCount={
          workbook.changeTracking?.changes.filter((c: any) => !c.accepted && !c.rejected).length || 0
        }
      />

      {/* Formula Bar - Excel position */}
      <div className="flex items-center gap-2 border-b bg-background px-2 py-1">
        <FormulaBar
          cellReference={currentCellRef}
          value={editingState.isEditing ? editingState.value : currentCellValue}
          isEditing={editingState.isEditing}
          onChange={updateEditingValue}
          onFocus={() => {
            if (selectedCell) {
              startEditing(selectedCell);
            }
          }}
        />
        {selectionInfo && selectionInfo.cellCount > 1 && (
          <div className="text-xs text-muted-foreground whitespace-nowrap px-2 py-1 bg-accent/50 rounded">
            {selectionInfo.rowCount}R × {selectionInfo.colCount}C ({selectionInfo.cellCount} cells)
          </div>
        )}
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={selectedSheetIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {currentSheet && (
            <EditableGridView
              sheet={currentSheet}
              workbook={workbook}
              editingState={editingState}
              selectedCell={selectedCell}
              selection={selection}
              onCellClick={handleCellClick}
              onCellDoubleClick={handleCellDoubleClick}
              onEditingValueChange={updateEditingValue}
              onStopEditing={stopEditing}
              onNavigate={handleNavigate}
              getCellValue={getCellValue}
              getCellDisplayValue={getCellDisplayValue}
            />
          )}
        </motion.div>
      </div>

      {/* Sheet Tabs - Excel position at bottom */}
      <SheetTabs
        sheets={workbook.sheets}
        selectedIndex={selectedSheetIndex}
        onSelectSheet={setSelectedSheetIndex}
      />

      {/* Phase 6 Dialogs */}
      <FindReplaceDialog
        open={findReplaceOpen}
        onOpenChange={setFindReplaceOpen}
        onFind={(options) => currentSheet ? dataManagement.find(currentSheet, options) : []}
        onReplace={(result, options) => {
          if (!currentSheet) return;
          const cell = currentSheet.cells.get(`${result.row}-${result.col}`);
          if (cell) {
            const newValue = dataManagement.replace(cell, options);
            setCellValue({ row: result.row, col: result.col, sheetId: currentSheet.id }, newValue);
          }
        }}
        onReplaceAll={(options) => {
          if (!currentSheet) return;
          const results = dataManagement.find(currentSheet, options);
          results.forEach((result) => {
            const cell = currentSheet.cells.get(`${result.row}-${result.col}`);
            if (cell) {
              const newValue = dataManagement.replace(cell, options);
              setCellValue({ row: result.row, col: result.col, sheetId: currentSheet.id }, newValue);
            }
          });
          toast({
            title: "Replace All Complete",
            description: `Replaced ${results.length} occurrences`,
          });
        }}
        onNavigateToResult={(result) => {
          setSelectedCell({ row: result.row, col: result.col, sheetId: result.sheetId });
        }}
      />

      {selectedCell && (
        <DataValidationDialog
          open={dataValidationOpen}
          onOpenChange={setDataValidationOpen}
          row={selectedCell.row}
          col={selectedCell.col}
          currentValidation={dataManagement.getValidation(selectedCell.row, selectedCell.col)}
          onApply={(validation) => {
            if (validation) {
              dataManagement.setValidation(validation);
              toast({
                title: "Data Validation Applied",
                description: `Validation rule applied to cell`,
              });
            } else {
              dataManagement.removeValidation(selectedCell.row, selectedCell.col);
              toast({
                title: "Data Validation Removed",
                description: `Validation rule removed from cell`,
              });
            }
          }}
        />
      )}

      <ConditionalFormattingDialog
        open={conditionalFormattingOpen}
        onOpenChange={setConditionalFormattingOpen}
        onApply={(rule) => {
          dataManagement.addConditionalFormat(rule);
          toast({
            title: "Conditional Formatting Applied",
            description: `Formatting rule applied`,
          });
        }}
      />

      {/* Phase 8: Chart Builder Dialog */}
      <ChartBuilder
        open={chartBuilderOpen}
        onOpenChange={setChartBuilderOpen}
        onCreateChart={handleCreateChart}
        currentSheetId={currentSheet?.id || ''}
      />

      {/* Phase 8: Render Charts */}
      {currentSheet?.charts && currentSheet.charts.length > 0 && (
        <div className="absolute bottom-20 right-4 space-y-4 max-w-2xl">
          {currentSheet.charts.map((chart) => (
            <div key={chart.id} className="relative">
              <button
                onClick={() => handleDeleteChart(chart.id)}
                className="absolute top-2 right-2 z-10 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                title="Delete chart"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <ChartRenderer config={chart} sheet={currentSheet} />
            </div>
          ))}
        </div>
      )}

      {/* Phase 9: Formula Library Dialog */}
      <FormulaLibrary
        open={formulaLibraryOpen}
        onOpenChange={setFormulaLibraryOpen}
        onInsertFormula={handleInsertFormula}
      />

      {/* Phase 9: Name Manager Dialog */}
      <NameManager
        open={nameManagerOpen}
        onOpenChange={setNameManagerOpen}
        namedRanges={workbook.namedRanges || []}
        sheets={workbook.sheets.map(s => ({ id: s.id, name: s.name }))}
        onCreateRange={handleCreateNamedRange}
        onUpdateRange={updateNamedRange}
        onDeleteRange={deleteNamedRange}
        onNavigateToRange={(range) => {
          toast({
            title: "Navigate to Range",
            description: `Navigating to ${range.name}: ${range.range}`,
          });
        }}
      />

      {/* Phase 10: Performance Monitor Dialog */}
      <PerformanceMonitor
        open={perfMonitorOpen}
        onOpenChange={setPerfMonitorOpen}
      />

      {/* Phase 11: Comment Panel */}
      <CommentPanel
        open={commentPanelOpen}
        onOpenChange={setCommentPanelOpen}
        comments={workbook.comments || []}
        currentUser="Current User"
        sheets={workbook.sheets.map(s => ({ id: s.id, name: s.name }))}
        onAddComment={(cellComment, parentId, content) => {
          if (parentId) {
            addCommentToThread(cellComment.id, parentId, 'Current User', content);
          } else {
            addCellComment(cellComment.row, cellComment.col, cellComment.sheetId, 'Current User', content);
          }
        }}
        onEditComment={(cellComment, commentId, newContent) =>
          editComment(cellComment.id, commentId, newContent)
        }
        onDeleteComment={(cellComment, commentId) =>
          deleteComment(cellComment.id, commentId)
        }
        onResolveComment={resolveCellComment}
        onUnresolveComment={unresolveCellComment}
        onNavigateToCell={(sheetId, row, col) => {
          const sheetIndex = workbook.sheets.findIndex(s => s.id === sheetId);
          if (sheetIndex !== -1) {
            setSelectedSheetIndex(sheetIndex);
            setSelectedCell({ row, col, sheetId });
          }
        }}
      />

      {/* Phase 11: Change Tracker */}
      <ChangeTracker
        open={changeTrackerOpen}
        onOpenChange={setChangeTrackerOpen}
        trackingState={
          workbook.changeTracking || {
            enabled: false,
            changes: [],
            currentUser: 'Current User',
          }
        }
        sheets={workbook.sheets.map(s => ({ id: s.id, name: s.name }))}
        onToggleTracking={toggleChangeTracking}
        onAcceptChange={acceptChange}
        onRejectChange={rejectChange}
        onAcceptAllChanges={acceptAllChanges}
        onRejectAllChanges={rejectAllChanges}
        onNavigateToChange={handleNavigateToChange}
      />
    </div>
  );
}

export default WorkbookViewer;
