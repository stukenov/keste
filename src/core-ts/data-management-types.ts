// Data Management Types for Phase 6

export type SortOrder = 'asc' | 'desc' | null;

export interface ColumnSort {
  col: number;
  order: SortOrder;
  priority: number; // for multi-column sort
}

export interface FilterCondition {
  type: 'value' | 'condition' | 'color';
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
  value?: string | number;
  values?: Set<string>; // for checkbox filtering
  color?: string;
}

export interface ColumnFilter {
  col: number;
  condition: FilterCondition;
}

export interface FindReplaceOptions {
  findText: string;
  replaceText: string;
  matchCase: boolean;
  matchWholeWord: boolean;
  searchFormulas: boolean;
  useRegex: boolean;
}

export interface FindResult {
  row: number;
  col: number;
  sheetId: string;
  value: string;
}

export type ValidationRule =
  | { type: 'list'; values: string[] }
  | { type: 'number'; min?: number; max?: number }
  | { type: 'date'; min?: Date; max?: Date }
  | { type: 'textLength'; min?: number; max?: number }
  | { type: 'custom'; formula: string };

export interface CellValidation {
  row: number;
  col: number;
  rule: ValidationRule;
  inputMessage?: string;
  errorMessage?: string;
  errorStyle?: 'stop' | 'warning' | 'information';
}

export type ConditionalFormattingRule =
  | { type: 'cellValue'; operator: 'greaterThan' | 'lessThan' | 'between' | 'equals'; value: number | string; value2?: number | string; format: ConditionalFormat }
  | { type: 'topBottom'; rank: number; isTop: boolean; format: ConditionalFormat }
  | { type: 'dataBar'; color: string; minValue?: number; maxValue?: number }
  | { type: 'colorScale'; colors: string[]; minValue?: number; maxValue?: number }
  | { type: 'iconSet'; iconSetType: 'arrows' | 'ratings' | 'indicators' }
  | { type: 'customFormula'; formula: string; format: ConditionalFormat };

export interface ConditionalFormat {
  backgroundColor?: string;
  fontColor?: string;
  fontBold?: boolean;
  fontItalic?: boolean;
}

export interface ConditionalFormattingRuleEntry {
  range: string; // e.g., "A1:B10"
  rule: ConditionalFormattingRule;
  priority: number;
  stopIfTrue?: boolean;
}

export interface DataManagementState {
  sorts: ColumnSort[];
  filters: ColumnFilter[];
  validations: CellValidation[];
  conditionalFormats: ConditionalFormattingRuleEntry[];
}
