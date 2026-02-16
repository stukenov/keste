import { Save, Download, FileSpreadsheet, Home, Loader2, Undo, Redo, Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Palette, Search, Shield, Combine, ArrowDownToLine, ArrowRightToLine, Trash2, BarChart3, Code2, BookmarkPlus, Eye, Activity, Calculator, Clock, MessageSquare, History } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import KeyboardShortcutsDialog from './KeyboardShortcutsDialog';
import { BorderPicker, type BorderSides } from './BorderPicker';
import { NumberFormatPicker } from './NumberFormatPicker';
import type { BorderStyle } from '../core-ts/style-types';

interface ExportBarProps {
  onExportSqlite: () => void;
  onExportSql: () => void;
  onClose: () => void;
  exporting: boolean;
  progress: number;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onBackgroundColor?: (color: string) => void;
  onFontColor?: (color: string) => void;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  currentAlign?: 'left' | 'center' | 'right';
  onFindReplace?: () => void;
  onDataValidation?: () => void;
  onConditionalFormatting?: () => void;
  onApplyBorder?: (sides: BorderSides, style: BorderStyle) => void;
  onApplyNumberFormat?: (format: string) => void;
  currentNumberFormat?: string;
  onMergeCells?: () => void;
  onInsertRow?: () => void;
  onDeleteRow?: () => void;
  onInsertColumn?: () => void;
  onDeleteColumn?: () => void;
  onCreateChart?: () => void;
  onFormulaLibrary?: () => void;
  onNameManager?: () => void;
  onToggleShowFormulas?: () => void;
  showFormulas?: boolean;
  onPerformanceMonitor?: () => void;
  onToggleManualCalc?: () => void;
  manualCalc?: boolean;
  onRecalculate?: () => void;
  autoSaveStatus?: { enabled: boolean; lastSave: number | null; isSaving: boolean };
  onComments?: () => void;
  onChangeTracking?: () => void;
  commentsCount?: number;
  changesCount?: number;
}

function ExportBar({
  onExportSqlite,
  onExportSql,
  onClose,
  exporting,
  progress,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onBold,
  onItalic,
  onUnderline,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onBackgroundColor,
  onFontColor,
  isBold = false,
  isItalic = false,
  isUnderline = false,
  currentAlign = 'left',
  onFindReplace,
  onDataValidation,
  onConditionalFormatting,
  onApplyBorder,
  onApplyNumberFormat,
  currentNumberFormat = 'General',
  onMergeCells,
  onInsertRow,
  onDeleteRow,
  onInsertColumn,
  onDeleteColumn,
  onCreateChart,
  onFormulaLibrary,
  onNameManager,
  onToggleShowFormulas,
  showFormulas = false,
  onPerformanceMonitor,
  onToggleManualCalc,
  manualCalc = false,
  onRecalculate,
  autoSaveStatus,
  onComments,
  onChangeTracking,
  commentsCount = 0,
  changesCount = 0,
}: ExportBarProps) {
  return (
    <TooltipProvider delayDuration={300}>
    <div className="border-b bg-card shadow-sm">
      {/* Excel-like Ribbon Header */}
      <div className="px-3 py-1 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-1 rounded">
              <FileSpreadsheet className="h-3.5 w-3.5 text-white" />
            </div>
            <h1 className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Keste
            </h1>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Button variant="ghost" size="sm" className="h-7 px-3 text-xs" onClick={onClose}>
              <Home className="h-3 w-3 mr-1" />
              Home
            </Button>
            <KeyboardShortcutsDialog />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onExportSqlite}
                disabled={exporting}
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-xs"
              >
                {exporting ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save as .kst file (Ctrl+S)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onExportSql}
                disabled={exporting}
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export to Excel .xlsx</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Excel-like Ribbon Toolbar */}
      <div className="px-3 py-2 flex items-center gap-4">
        {/* Clipboard Group */}
        <div className="flex items-center gap-1">
          {onUndo && onRedo && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="h-7 w-7"
              >
                <Undo className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="h-7 w-7"
              >
                <Redo className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Font Group */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isBold ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={onBold}
                disabled={!onBold}
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Bold</div>
                <div className="text-xs opacity-70">Ctrl+B</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isItalic ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={onItalic}
                disabled={!onItalic}
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Italic</div>
                <div className="text-xs opacity-70">Ctrl+I</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isUnderline ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={onUnderline}
                disabled={!onUnderline}
              >
                <Underline className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Underline</div>
                <div className="text-xs opacity-70">Ctrl+U</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Color Group */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <input
              type="color"
              className="absolute opacity-0 w-7 h-7 cursor-pointer"
              onChange={(e) => onFontColor?.(e.target.value)}
              disabled={!onFontColor}
              title="Font Color"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!onFontColor}>
              <Type className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="relative">
            <input
              type="color"
              className="absolute opacity-0 w-7 h-7 cursor-pointer"
              onChange={(e) => onBackgroundColor?.(e.target.value)}
              disabled={!onBackgroundColor}
              title="Background Color"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!onBackgroundColor}>
              <Palette className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Alignment Group */}
        <div className="flex items-center gap-1">
          <Button
            variant={currentAlign === 'left' ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={onAlignLeft}
            disabled={!onAlignLeft}
            title="Align Left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={currentAlign === 'center' ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={onAlignCenter}
            disabled={!onAlignCenter}
            title="Align Center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={currentAlign === 'right' ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={onAlignRight}
            disabled={!onAlignRight}
            title="Align Right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Phase 7: Borders & Number Format */}
        <div className="flex items-center gap-1">
          <BorderPicker
            onApplyBorder={(sides, style) => onApplyBorder?.(sides, style)}
            disabled={!onApplyBorder}
          />

          <NumberFormatPicker
            currentFormat={currentNumberFormat}
            onApplyFormat={(format) => onApplyNumberFormat?.(format)}
            disabled={!onApplyNumberFormat}
          />
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Phase 7: Merge/Unmerge */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMergeCells}
                disabled={!onMergeCells}
              >
                <Combine className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Merge Cells</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Phase 7: Row/Column Operations */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onInsertRow}
                disabled={!onInsertRow}
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Insert Row</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onInsertColumn}
                disabled={!onInsertColumn}
              >
                <ArrowRightToLine className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Insert Column</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onDeleteRow}
                disabled={!onDeleteRow}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Delete Row</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onDeleteColumn}
                disabled={!onDeleteColumn}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Delete Column</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Data Tools Group */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onFindReplace}
                disabled={!onFindReplace}
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Find & Replace</div>
                <div className="text-xs opacity-70">Ctrl+F</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onDataValidation}
                disabled={!onDataValidation}
              >
                <Shield className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Data Validation</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onConditionalFormatting}
                disabled={!onConditionalFormatting}
              >
                <Palette className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Conditional Formatting</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Phase 8: Chart Tools */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onCreateChart}
                disabled={!onCreateChart}
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Insert Chart</div>
                <div className="text-xs opacity-70">Create visualization</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Phase 9: Formula Tools */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onFormulaLibrary}
                disabled={!onFormulaLibrary}
              >
                <Code2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Formula Library</div>
                <div className="text-xs opacity-70">Browse functions</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onNameManager}
                disabled={!onNameManager}
              >
                <BookmarkPlus className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Name Manager</div>
                <div className="text-xs opacity-70">Manage named ranges</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showFormulas ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={onToggleShowFormulas}
                disabled={!onToggleShowFormulas}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Show Formulas</div>
                <div className="text-xs opacity-70">Toggle formula view</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Phase 10: Performance Tools */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onPerformanceMonitor}
                disabled={!onPerformanceMonitor}
              >
                <Activity className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Performance Monitor</div>
                <div className="text-xs opacity-70">View metrics</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={manualCalc ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={onToggleManualCalc}
                disabled={!onToggleManualCalc}
              >
                <Calculator className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Manual Calculation</div>
                <div className="text-xs opacity-70">{manualCalc ? 'ON' : 'OFF'}</div>
              </div>
            </TooltipContent>
          </Tooltip>

          {manualCalc && onRecalculate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={onRecalculate}
                >
                  Recalculate Now
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-semibold">Recalculate Formulas</div>
                  <div className="text-xs opacity-70">F9</div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {autoSaveStatus && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {autoSaveStatus.isSaving ? (
                    <span>Saving...</span>
                  ) : autoSaveStatus.lastSave ? (
                    <span>Saved {Math.round((Date.now() - autoSaveStatus.lastSave) / 1000)}s ago</span>
                  ) : (
                    <span>Auto-save</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-semibold">Auto-Save</div>
                  <div className="text-xs opacity-70">
                    {autoSaveStatus.enabled ? 'Enabled (30s)' : 'Disabled'}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Phase 11: Collaboration Tools */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 relative"
                onClick={onComments}
                disabled={!onComments}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {commentsCount && commentsCount > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {commentsCount > 9 ? '9+' : commentsCount}
                  </span>
                ) : null}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Comments</div>
                <div className="text-xs opacity-70">
                  {commentsCount || 0} comment{commentsCount !== 1 ? 's' : ''}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 relative"
                onClick={onChangeTracking}
                disabled={!onChangeTracking}
              >
                <History className="h-3.5 w-3.5" />
                {changesCount && changesCount > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {changesCount > 9 ? '9+' : changesCount}
                  </span>
                ) : null}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Change Tracking</div>
                <div className="text-xs opacity-70">
                  {changesCount || 0} pending change{changesCount !== 1 ? 's' : ''}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Progress */}
        {exporting && progress > 0 && (
          <>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Progress value={progress} className="w-32 h-2" />
              <span className="text-xs text-muted-foreground font-medium">{progress}%</span>
            </div>
          </>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
}

export default ExportBar;
