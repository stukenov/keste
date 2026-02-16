/**
 * Number formatter for Excel number formats
 * Supports Excel built-in formats (0-49) and custom formats
 */

import type { WorkbookModel } from './types';

/**
 * Built-in Excel number formats (0-49)
 */
const BUILTIN_FORMATS: Record<number, string> = {
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
  14: 'mm-dd-yy',
  15: 'd-mmm-yy',
  16: 'd-mmm',
  17: 'mmm-yy',
  18: 'h:mm AM/PM',
  19: 'h:mm:ss AM/PM',
  20: 'h:mm',
  21: 'h:mm:ss',
  22: 'm/d/yy h:mm',
  37: '#,##0 ;(#,##0)',
  38: '#,##0 ;[Red](#,##0)',
  39: '#,##0.00;(#,##0.00)',
  40: '#,##0.00;[Red](#,##0.00)',
  45: 'mm:ss',
  46: '[h]:mm:ss',
  47: 'mmss.0',
  48: '##0.0E+0',
  49: '@', // Text format
};

/**
 * Format a number value according to Excel number format
 */
export function formatNumber(
  value: number | string | boolean | null,
  numFmtId: number | undefined,
  workbook: WorkbookModel
): string {
  // No format specified or General format
  if (numFmtId === undefined || numFmtId === 0) {
    return String(value ?? '');
  }

  // Get format code
  let formatCode: string | undefined;

  // Check built-in formats first
  if (BUILTIN_FORMATS[numFmtId]) {
    formatCode = BUILTIN_FORMATS[numFmtId];
  } else {
    // Check custom formats in workbook
    formatCode = workbook.numFmts?.get(numFmtId);
  }

  if (!formatCode || formatCode === 'General') {
    return String(value ?? '');
  }

  // Text format
  if (formatCode === '@') {
    return String(value ?? '');
  }

  // Convert value to number if needed
  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  if (!isFinite(numValue)) {
    return String(value ?? '');
  }

  // Apply format
  return applyFormat(numValue, formatCode);
}

/**
 * Apply Excel format code to a number
 * This is a simplified implementation - full Excel format syntax is very complex
 */
function applyFormat(value: number, formatCode: string): string {
  // Remove color codes like [Red], [Blue], etc.
  let format = formatCode.replace(/\[[^\]]+\]/g, '');

  // Handle percentage formats
  if (format.includes('%')) {
    const percentValue = value * 100;
    const decimals = (format.match(/0/g) || []).length - 1;
    return percentValue.toFixed(Math.max(0, decimals)) + '%';
  }

  // Handle scientific notation
  if (format.toUpperCase().includes('E+')) {
    return value.toExponential(2);
  }

  // Handle currency/accounting formats with thousands separator
  if (format.includes('#,##0')) {
    const hasDecimals = format.includes('.');
    const decimals = hasDecimals ? (format.split('.')[1].match(/0/g) || []).length : 0;

    // Handle negative values in parentheses
    const isNegative = value < 0;
    const absValue = Math.abs(value);

    const formatted = absValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    if (isNegative && (format.includes('(') || format.includes(')'))) {
      return `(${formatted})`;
    }

    return isNegative ? `-${formatted}` : formatted;
  }

  // Handle simple decimal formats
  if (format.match(/^0+(\.0+)?$/)) {
    const decimals = format.includes('.') ? format.split('.')[1].length : 0;
    return value.toFixed(decimals);
  }

  // Handle date formats (simplified - Excel uses date serial numbers)
  if (format.includes('mm') || format.includes('dd') || format.includes('yy')) {
    // Excel date serial number (days since 1900-01-01)
    // This is a simplified implementation
    const date = excelSerialToDate(value);
    return formatDate(date, format);
  }

  // Handle time formats
  if (format.includes('h:mm') || format.includes('[h]')) {
    const date = excelSerialToDate(value);
    return formatTime(date, format);
  }

  // Fallback: just return the number as string
  return String(value);
}

/**
 * Convert Excel serial number to JavaScript Date
 * Excel serial number: days since 1900-01-01 (with 1900 leap year bug)
 */
function excelSerialToDate(serial: number): Date {
  // Excel incorrectly treats 1900 as a leap year
  const daysOffset = serial > 59 ? 1 : 0;
  const msPerDay = 24 * 60 * 60 * 1000;
  const excelEpoch = new Date(1899, 11, 30).getTime(); // 1899-12-30

  return new Date(excelEpoch + (serial - daysOffset) * msPerDay);
}

/**
 * Format date according to Excel format code
 */
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let result = format;

  // Year
  if (result.includes('yyyy')) {
    result = result.replace('yyyy', String(year));
  } else if (result.includes('yy')) {
    result = result.replace('yy', String(year).slice(-2));
  }

  // Month
  if (result.includes('mmm')) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    result = result.replace('mmm', monthNames[month - 1]);
  } else if (result.includes('mm')) {
    result = result.replace('mm', String(month).padStart(2, '0'));
  } else if (result.includes('m')) {
    result = result.replace('m', String(month));
  }

  // Day
  if (result.includes('dd')) {
    result = result.replace('dd', String(day).padStart(2, '0'));
  } else if (result.includes('d')) {
    result = result.replace('d', String(day));
  }

  return result;
}

/**
 * Format time according to Excel format code
 */
function formatTime(date: Date, format: string): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  let result = format;

  // 12-hour format with AM/PM
  if (result.includes('AM/PM') || result.includes('am/pm')) {
    const isPM = hours >= 12;
    const hours12 = hours % 12 || 12;
    result = result.replace(/h+/i, String(hours12));
    result = result.replace(/AM\/PM|am\/pm/i, isPM ? 'PM' : 'AM');
  } else if (result.includes('[h]')) {
    // Elapsed hours
    const totalHours = Math.floor(date.getTime() / (1000 * 60 * 60));
    result = result.replace('[h]', String(totalHours));
  } else {
    // 24-hour format
    result = result.replace(/h+/i, String(hours).padStart(2, '0'));
  }

  // Minutes
  result = result.replace(/mm/, String(minutes).padStart(2, '0'));

  // Seconds
  if (result.includes('ss')) {
    result = result.replace('ss', String(seconds).padStart(2, '0'));
  }

  return result;
}

/**
 * Get format code for a numFmtId
 */
export function getFormatCode(numFmtId: number | undefined, workbook: WorkbookModel): string | undefined {
  if (numFmtId === undefined) return undefined;

  // Check built-in formats
  if (BUILTIN_FORMATS[numFmtId]) {
    return BUILTIN_FORMATS[numFmtId];
  }

  // Check custom formats
  return workbook.numFmts?.get(numFmtId);
}
