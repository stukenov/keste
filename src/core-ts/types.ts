export interface WorkbookModel {
  id: string;
  sheets: SheetModel[];
  sharedStrings: string[];
  numFmts: Map<number, string>;
  styles: CellXfsStyle[];
  definedNames: DefinedName[];
  namedRanges?: any[]; // NamedRange[] - will be imported from formula-types
  comments?: any[]; // CellComment[] - will be imported from comment-types
  changeTracking?: any; // ChangeTrackingState - will be imported from comment-types

  // ===== НОВОЕ: Полная поддержка стилей =====
  fonts?: Font[];
  fills?: Fill[];
  borders?: Border[];
  cellXfs?: CellXf[];
}

export interface SheetModel {
  id: string;
  name: string;
  sheetId: number;
  cells: Map<string, CellData>;
  mergedRanges: MergedRange[];
  rowProps: Map<number, RowProp>;
  colProps: Map<number, ColProp>;
  sheetView?: SheetView;
  charts?: any[]; // ChartConfig[] - will be imported from chart-types
}

export interface CellData {
  row: number;
  col: number;
  type: 'n' | 's' | 'b' | 'd' | 'str' | 'e' | 'inlineStr';
  value: string | number | boolean | null;
  formula?: string;
  styleId?: number;
  style?: CellStyle;
}

export interface BorderStyle {
  style?: 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted' | 'double' | 'hair' | 'mediumDashed' | 'dashDot' | 'mediumDashDot' | 'dashDotDot' | 'mediumDashDotDot' | 'slantDashDot';
  color?: string;
}

export interface CellStyle {
  // Font
  fontName?: string;
  fontSize?: number;
  fontBold?: boolean;
  fontItalic?: boolean;
  fontUnderline?: boolean;
  fontStrikethrough?: boolean;
  fontColor?: string;

  // Fill
  backgroundColor?: string;

  // Alignment
  horizontalAlign?: 'left' | 'center' | 'right' | 'justify' | 'distributed' | 'fill' | 'centerContinuous';
  verticalAlign?: 'top' | 'center' | 'bottom' | 'justify' | 'distributed';
  wrapText?: boolean;
  textRotation?: number;
  indent?: number;

  // Border
  borderTop?: BorderStyle;
  borderRight?: BorderStyle;
  borderBottom?: BorderStyle;
  borderLeft?: BorderStyle;

  // Number format
  numberFormat?: string;
}

export interface CellXfsStyle {
  numFmtId?: number;
  fontId?: number;
  fillId?: number;
  borderId?: number;
  xfId?: number;
}

export interface MergedRange {
  ref: string; // e.g., "A1:B2"
}

export interface RowProp {
  row: number;
  height?: number;
  hidden?: boolean;
  customHeight?: boolean;
}

export interface ColProp {
  col: number;
  width?: number;
  hidden?: boolean;
  customWidth?: boolean;
}

export interface DefinedName {
  name: string;
  ref: string;
  localSheetId?: number;
}

export interface SheetView {
  pane?: {
    xSplit?: number;
    ySplit?: number;
    topLeftCell?: string;
    state?: string;
  };
}

export interface CellView {
  row: number;
  col: number;
  value: string;
  formula?: string;
  style?: CellXfsStyle;
}

// ===== НОВЫЕ ИНТЕРФЕЙСЫ ДЛЯ ПОЛНОЙ ПОДДЕРЖКИ СТИЛЕЙ =====

/**
 * Font definition from xl/styles.xml <fonts>
 */
export interface Font {
  id: number;
  name: string;           // "Calibri", "Arial"
  size: number;           // 11, 14, 16
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string;          // ARGB format: "FF000000"
}

/**
 * Fill definition from xl/styles.xml <fills>
 */
export interface Fill {
  id: number;
  patternType: 'none' | 'solid' | 'gray125' | 'lightGray' | 'darkGray' | 'mediumGray' |
               'lightDown' | 'lightUp' | 'lightGrid' | 'lightTrellis' | 'lightHorizontal' |
               'lightVertical';
  fgColor?: string;       // Foreground color (ARGB)
  bgColor?: string;       // Background color (ARGB)
}

/**
 * Border edge (single side)
 */
export interface BorderEdge {
  style: 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted' | 'double' | 'hair' |
         'mediumDashed' | 'dashDot' | 'mediumDashDot' | 'dashDotDot' |
         'mediumDashDotDot' | 'slantDashDot';
  color?: string;         // ARGB format
}

/**
 * Border definition from xl/styles.xml <borders>
 */
export interface Border {
  id: number;
  top?: BorderEdge;
  right?: BorderEdge;
  bottom?: BorderEdge;
  left?: BorderEdge;
  diagonal?: BorderEdge;
  diagonalUp?: boolean;
  diagonalDown?: boolean;
}

/**
 * Alignment settings
 */
export interface Alignment {
  horizontal?: 'left' | 'center' | 'right' | 'justify' | 'distributed' | 'fill' | 'centerContinuous';
  vertical?: 'top' | 'center' | 'bottom' | 'justify' | 'distributed';
  wrapText?: boolean;
  textRotation?: number;
  indent?: number;
  shrinkToFit?: boolean;
  readingOrder?: number;
}

/**
 * Cell format from xl/styles.xml <cellXfs>
 * Расширенная версия CellXfsStyle с полной информацией
 */
export interface CellXf {
  id: number;
  numFmtId?: number;
  fontId?: number;
  fillId?: number;
  borderId?: number;
  xfId?: number;
  applyFont?: boolean;
  applyFill?: boolean;
  applyBorder?: boolean;
  applyAlignment?: boolean;
  applyNumberFormat?: boolean;
  applyProtection?: boolean;
  alignment?: Alignment;
}
