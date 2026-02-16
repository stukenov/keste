/**
 * Утилиты для работы с объединенными ячейками (merged cells)
 */

import type { MergedRange } from './types';

/**
 * Парсит range строку вида "A1:B3" в координаты
 */
export function parseRange(ref: string): {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
} | null {
  const match = ref.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!match) return null;

  const startCol = columnLetterToNumber(match[1]);
  const startRow = parseInt(match[2]);
  const endCol = columnLetterToNumber(match[3]);
  const endRow = parseInt(match[4]);

  return { startRow, startCol, endRow, endCol };
}

/**
 * Конвертирует букву колонки в номер (A=1, B=2, ..., Z=26, AA=27)
 */
function columnLetterToNumber(letters: string): number {
  let result = 0;
  for (let i = 0; i < letters.length; i++) {
    result = result * 26 + (letters.charCodeAt(i) - 64);
  }
  return result;
}

/**
 * Проверяет, находится ли ячейка в объединенном диапазоне
 */
export function isCellInMergedRange(
  row: number,
  col: number,
  mergedRanges: MergedRange[]
): MergedRange | null {
  for (const range of mergedRanges) {
    const parsed = parseRange(range.ref);
    if (!parsed) continue;

    if (
      row >= parsed.startRow &&
      row <= parsed.endRow &&
      col >= parsed.startCol &&
      col <= parsed.endCol
    ) {
      return range;
    }
  }
  return null;
}

/**
 * Проверяет, является ли ячейка "главной" (верхней левой) в merged range
 */
export function isMasterCell(
  row: number,
  col: number,
  mergedRanges: MergedRange[]
): boolean {
  for (const range of mergedRanges) {
    const parsed = parseRange(range.ref);
    if (!parsed) continue;

    if (row === parsed.startRow && col === parsed.startCol) {
      return true;
    }
  }
  return false;
}

/**
 * Возвращает размеры merged range для ячейки (если она является master cell)
 */
export function getMergedCellSize(
  row: number,
  col: number,
  mergedRanges: MergedRange[]
): { rowSpan: number; colSpan: number } | null {
  for (const range of mergedRanges) {
    const parsed = parseRange(range.ref);
    if (!parsed) continue;

    if (row === parsed.startRow && col === parsed.startCol) {
      return {
        rowSpan: parsed.endRow - parsed.startRow + 1,
        colSpan: parsed.endCol - parsed.startCol + 1,
      };
    }
  }
  return null;
}

/**
 * Проверяет, нужно ли скрывать ячейку (она не master, но в merged range)
 */
export function shouldHideCell(
  row: number,
  col: number,
  mergedRanges: MergedRange[]
): boolean {
  const inRange = isCellInMergedRange(row, col, mergedRanges);
  if (!inRange) return false;

  const isMaster = isMasterCell(row, col, mergedRanges);
  return !isMaster; // Скрыть, если в range, но не master
}

/**
 * Находит master cell для данной ячейки (если она в merged range)
 */
export function findMasterCell(
  row: number,
  col: number,
  mergedRanges: MergedRange[]
): { row: number; col: number } | null {
  for (const range of mergedRanges) {
    const parsed = parseRange(range.ref);
    if (!parsed) continue;

    if (
      row >= parsed.startRow &&
      row <= parsed.endRow &&
      col >= parsed.startCol &&
      col <= parsed.endCol
    ) {
      return { row: parsed.startRow, col: parsed.startCol };
    }
  }
  return null;
}
