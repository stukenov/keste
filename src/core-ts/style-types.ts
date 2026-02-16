/**
 * Cell styling types for Keste
 * Supports Excel-like formatting
 */

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
  backgroundPattern?: 'solid' | 'none' | 'gray125';

  // Border
  borderTop?: BorderStyle;
  borderRight?: BorderStyle;
  borderBottom?: BorderStyle;
  borderLeft?: BorderStyle;

  // Alignment
  horizontalAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  wrapText?: boolean;

  // Number format
  numberFormat?: string;
}

export interface BorderStyle {
  style?: 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted' | 'double';
  color?: string;
}

export interface Font {
  id: number;
  name: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string;
}

export interface Fill {
  id: number;
  patternType: 'solid' | 'none' | 'gray125';
  fgColor?: string;
  bgColor?: string;
}

export interface Border {
  id: number;
  top?: BorderStyle;
  right?: BorderStyle;
  bottom?: BorderStyle;
  left?: BorderStyle;
  diagonal?: BorderStyle;
}

export interface NumberFormat {
  id: number;
  formatCode: string;
}

export interface CellStyleDefinition {
  fontId: number;
  fillId: number;
  borderId: number;
  numFmtId: number;
  applyFont?: boolean;
  applyFill?: boolean;
  applyBorder?: boolean;
  applyNumberFormat?: boolean;
  applyAlignment?: boolean;
  alignment?: {
    horizontal?: 'left' | 'center' | 'right' | 'justify';
    vertical?: 'top' | 'middle' | 'bottom';
    wrapText?: boolean;
  };
}

export interface StyleSheet {
  fonts: Font[];
  fills: Fill[];
  borders: Border[];
  numberFormats: NumberFormat[];
  cellStyles: CellStyleDefinition[];
}

/**
 * Default styles
 */
export const DEFAULT_FONT: Font = {
  id: 0,
  name: 'Calibri',
  size: 11,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  color: '#000000'
};

export const DEFAULT_FILL: Fill = {
  id: 0,
  patternType: 'none'
};

export const DEFAULT_BORDER: Border = {
  id: 0
};

export const DEFAULT_CELL_STYLE: CellStyleDefinition = {
  fontId: 0,
  fillId: 0,
  borderId: 0,
  numFmtId: 0
};

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Merge two cell styles
 */
export function mergeStyles(base: CellStyle, override: Partial<CellStyle>): CellStyle {
  return {
    ...base,
    ...override
  };
}

/**
 * Apply style to CSS object
 */
export function styleToCss(style: CellStyle): React.CSSProperties {
  const css: React.CSSProperties = {};

  // Font
  if (style.fontName) css.fontFamily = style.fontName;
  if (style.fontSize) css.fontSize = `${style.fontSize}px`;
  if (style.fontBold) css.fontWeight = 'bold';
  if (style.fontItalic) css.fontStyle = 'italic';
  if (style.fontColor) css.color = style.fontColor;

  // Text decoration
  const decorations: string[] = [];
  if (style.fontUnderline) decorations.push('underline');
  if (style.fontStrikethrough) decorations.push('line-through');
  if (decorations.length > 0) css.textDecoration = decorations.join(' ');

  // Background
  if (style.backgroundColor) css.backgroundColor = style.backgroundColor;

  // Alignment
  if (style.horizontalAlign) css.textAlign = style.horizontalAlign;
  if (style.verticalAlign) {
    css.display = 'flex';
    css.alignItems = style.verticalAlign === 'top' ? 'flex-start'
      : style.verticalAlign === 'bottom' ? 'flex-end'
      : 'center';
  }
  if (style.wrapText) {
    css.whiteSpace = 'normal';
    css.wordWrap = 'break-word';
  }

  // Borders
  if (style.borderTop) {
    css.borderTop = `${style.borderTop.style || 'solid'} 1px ${style.borderTop.color || '#000'}`;
  }
  if (style.borderRight) {
    css.borderRight = `${style.borderRight.style || 'solid'} 1px ${style.borderRight.color || '#000'}`;
  }
  if (style.borderBottom) {
    css.borderBottom = `${style.borderBottom.style || 'solid'} 1px ${style.borderBottom.color || '#000'}`;
  }
  if (style.borderLeft) {
    css.borderLeft = `${style.borderLeft.style || 'solid'} 1px ${style.borderLeft.color || '#000'}`;
  }

  return css;
}
