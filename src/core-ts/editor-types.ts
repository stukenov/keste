// Editor state and editing types

export interface CellPosition {
  row: number;
  col: number;
  sheetId: string;
}

export interface EditingState {
  isEditing: boolean;
  position: CellPosition | null;
  value: string;
  originalValue: string;
}

export interface Selection {
  start: CellPosition;
  end: CellPosition;
}

export interface CellEdit {
  position: CellPosition;
  oldValue: string;
  newValue: string;
  timestamp: number;
}

export interface UndoRedoState {
  undoStack: CellEdit[];
  redoStack: CellEdit[];
  maxSize: number;
}

export type NavigationDirection = 'up' | 'down' | 'left' | 'right';

export interface ClipboardData {
  cells: Map<string, string>;
  selection: Selection;
}
