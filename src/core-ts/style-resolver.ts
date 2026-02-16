/**
 * Style Resolver
 * Разрешает стили ячеек из styleId в полный CellStyle
 */

import type { WorkbookModel, CellData, CellStyle, BorderStyle } from './types';

/**
 * Конвертирует ARGB формат в hex (#RRGGBB)
 * Excel использует ARGB: AARRGGBB (8 символов)
 */
function argbToHex(argb: string | undefined): string {
  if (!argb) return '#000000';

  // ARGB format: AARRGGBB (8 hex digits)
  if (argb.length === 8) {
    // Отбросить альфа-канал (первые 2 символа)
    return '#' + argb.substring(2);
  }

  // RGB format: RRGGBB (6 hex digits)
  if (argb.length === 6) {
    return '#' + argb;
  }

  // Theme color (например, "1", "2") - пока возвращаем черный
  // TODO: Реализовать theme colors mapping
  return '#000000';
}

/**
 * Разрешает полный стиль ячейки из styleId
 *
 * @param cell - Ячейка с styleId
 * @param workbook - Модель workbook с fonts, fills, borders, cellXfs
 * @returns Полный CellStyle или undefined
 */
export function resolveCellStyle(
  cell: CellData,
  workbook: WorkbookModel
): CellStyle | undefined {
  // Если нет styleId, стиль не применяется
  if (cell.styleId === undefined) return undefined;

  // Если нет cellXfs, не можем разрешить стиль
  if (!workbook.cellXfs || workbook.cellXfs.length === 0) return undefined;

  // Получить CellXf по styleId
  const cellXf = workbook.cellXfs[cell.styleId];
  if (!cellXf) {
    console.warn(`CellXf not found for styleId ${cell.styleId}`);
    return undefined;
  }

  const style: CellStyle = {};

  // ===== FONT =====
  if (cellXf.fontId !== undefined && (cellXf.applyFont || cellXf.applyFont === undefined)) {
    const font = workbook.fonts?.[cellXf.fontId];
    if (font) {
      style.fontName = font.name;
      style.fontSize = font.size;
      style.fontBold = font.bold;
      style.fontItalic = font.italic;
      style.fontUnderline = font.underline;
      style.fontStrikethrough = font.strikethrough;
      style.fontColor = argbToHex(font.color);
    }
  }

  // ===== FILL =====
  if (cellXf.fillId !== undefined && (cellXf.applyFill || cellXf.applyFill === undefined)) {
    const fill = workbook.fills?.[cellXf.fillId];
    if (fill && fill.patternType === 'solid' && fill.fgColor) {
      style.backgroundColor = argbToHex(fill.fgColor);
    }
  }

  // ===== BORDER =====
  if (cellXf.borderId !== undefined && (cellXf.applyBorder || cellXf.applyBorder === undefined)) {
    const border = workbook.borders?.[cellXf.borderId];
    if (border) {
      if (border.top) {
        style.borderTop = {
          style: border.top.style as BorderStyle['style'],
          color: border.top.color ? argbToHex(border.top.color) : undefined,
        };
      }
      if (border.right) {
        style.borderRight = {
          style: border.right.style as BorderStyle['style'],
          color: border.right.color ? argbToHex(border.right.color) : undefined,
        };
      }
      if (border.bottom) {
        style.borderBottom = {
          style: border.bottom.style as BorderStyle['style'],
          color: border.bottom.color ? argbToHex(border.bottom.color) : undefined,
        };
      }
      if (border.left) {
        style.borderLeft = {
          style: border.left.style as BorderStyle['style'],
          color: border.left.color ? argbToHex(border.left.color) : undefined,
        };
      }
    }
  }

  // ===== ALIGNMENT =====
  if (cellXf.alignment && (cellXf.applyAlignment || cellXf.applyAlignment === undefined)) {
    style.horizontalAlign = cellXf.alignment.horizontal;
    style.verticalAlign = cellXf.alignment.vertical;
    style.wrapText = cellXf.alignment.wrapText;
    if (cellXf.alignment.textRotation !== undefined) {
      style.textRotation = cellXf.alignment.textRotation;
    }
    if (cellXf.alignment.indent !== undefined) {
      style.indent = cellXf.alignment.indent;
    }
  }

  // ===== NUMBER FORMAT =====
  if (cellXf.numFmtId !== undefined && (cellXf.applyNumberFormat || cellXf.applyNumberFormat === undefined)) {
    const numFmt = workbook.numFmts?.get(cellXf.numFmtId);
    if (numFmt) {
      style.numberFormat = numFmt;
    } else {
      // Встроенные форматы Excel (0-49)
      style.numberFormat = getBuiltInNumberFormat(cellXf.numFmtId);
    }
  }

  return style;
}

/**
 * Применяет разрешенный стиль к ячейке
 * Возвращает новую ячейку с полем style
 */
export function applyCellStyle(
  cell: CellData,
  workbook: WorkbookModel
): CellData {
  const style = resolveCellStyle(cell, workbook);
  if (style && Object.keys(style).length > 0) {
    return { ...cell, style };
  }
  return cell;
}

/**
 * Встроенные форматы чисел Excel (numFmtId 0-49)
 * https://docs.microsoft.com/en-us/dotnet/api/documentformat.openxml.spreadsheet.numberingformat
 */
function getBuiltInNumberFormat(numFmtId: number): string | undefined {
  const builtInFormats: Record<number, string> = {
    0: 'General',
    1: '0',
    2: '0.00',
    3: '#,##0',
    4: '#,##0.00',
    9: '0%',
    10: '0.00%',
    11: '0.00E+00',
    12: '# ?/?',
    13: '# ??/??',
    14: 'm/d/yyyy',
    15: 'd-mmm-yy',
    16: 'd-mmm',
    17: 'mmm-yy',
    18: 'h:mm AM/PM',
    19: 'h:mm:ss AM/PM',
    20: 'h:mm',
    21: 'h:mm:ss',
    22: 'm/d/yyyy h:mm',
    37: '#,##0 ;(#,##0)',
    38: '#,##0 ;[Red](#,##0)',
    39: '#,##0.00;(#,##0.00)',
    40: '#,##0.00;[Red](#,##0.00)',
    45: 'mm:ss',
    46: '[h]:mm:ss',
    47: 'mmss.0',
    48: '##0.0E+0',
    49: '@',
  };

  return builtInFormats[numFmtId];
}
