/**
 * Phase 11: Collaboration - Comment Types
 *
 * Data structures for cell comments, threads, and change tracking
 */

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  edited?: boolean;
  editedAt?: number;
  parentId?: string; // For threaded replies
}

export interface CellComment {
  id: string;
  row: number;
  col: number;
  sheetId: string;
  comments: Comment[];
  resolved: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Change {
  id: string;
  type: 'cell-value' | 'cell-style' | 'insert-row' | 'delete-row' | 'insert-column' | 'delete-column' | 'other';
  author: string;
  timestamp: number;
  sheetId: string;
  location?: {
    row?: number;
    col?: number;
    range?: string;
  };
  oldValue?: any;
  newValue?: any;
  description: string;
  accepted?: boolean;
  rejected?: boolean;
}

export interface ChangeTrackingState {
  enabled: boolean;
  changes: Change[];
  currentUser: string;
}

export interface CommentFilter {
  showResolved?: boolean;
  author?: string;
  sheetId?: string;
  dateFrom?: number;
  dateTo?: number;
}

export interface ChangeFilter {
  type?: Change['type'][];
  author?: string;
  sheetId?: string;
  dateFrom?: number;
  dateTo?: number;
  status?: 'pending' | 'accepted' | 'rejected';
}
