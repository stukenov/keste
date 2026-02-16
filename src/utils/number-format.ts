/**
 * Number formatting utilities for Keste
 * Supports basic Excel-like number formatting
 */

export interface NumberFormatOptions {
  decimals?: number;
  thousands?: boolean;
  currency?: string;
  percentage?: boolean;
}

/**
 * Format a number with specified options
 */
export function formatNumber(value: number | string, options: NumberFormatOptions = {}): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return String(value);
  }

  const {
    decimals = 2,
    thousands = false,
    currency,
    percentage = false,
  } = options;

  let result = num;

  // Handle percentage
  if (percentage) {
    result = result * 100;
  }

  // Format with decimals
  let formatted = result.toFixed(decimals);

  // Add thousands separator
  if (thousands) {
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formatted = parts.join('.');
  }

  // Add currency symbol
  if (currency) {
    formatted = `${currency}${formatted}`;
  }

  // Add percentage symbol
  if (percentage) {
    formatted = `${formatted}%`;
  }

  return formatted;
}

/**
 * Parse Excel-style number format code
 * Examples: "0.00", "#,##0.00", "$#,##0.00", "0.00%"
 */
export function parseNumberFormat(formatCode: string): NumberFormatOptions {
  const options: NumberFormatOptions = {};

  // Check for percentage
  if (formatCode.includes('%')) {
    options.percentage = true;
  }

  // Check for currency
  const currencyMatch = formatCode.match(/^([$€£¥])/);
  if (currencyMatch) {
    options.currency = currencyMatch[1];
  }

  // Check for thousands separator
  if (formatCode.includes(',')) {
    options.thousands = true;
  }

  // Count decimal places
  const decimalMatch = formatCode.match(/\.(\d+|#+)/);
  if (decimalMatch) {
    options.decimals = decimalMatch[1].length;
  } else {
    options.decimals = 0;
  }

  return options;
}

/**
 * Format a date value
 */
export function formatDate(value: Date | number | string, format: string = 'YYYY-MM-DD'): string {
  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) {
    return String(value);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Auto-detect and format cell value
 */
export function autoFormatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Boolean
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  // Number
  if (typeof value === 'number') {
    // Check if it's likely a date (Excel serial date)
    if (value > 25569 && value < 73050) {
      // Might be an Excel date
      const date = new Date((value - 25569) * 86400 * 1000);
      if (!isNaN(date.getTime())) {
        return formatDate(date);
      }
    }

    // Regular number
    return formatNumber(value, { decimals: 2 });
  }

  // String
  return String(value);
}

/**
 * Parse user input to appropriate cell value
 */
export function parseUserInput(input: string): string | number | boolean {
  // Empty string
  if (input.trim() === '') {
    return '';
  }

  // Boolean
  if (input.toUpperCase() === 'TRUE') {
    return true;
  }
  if (input.toUpperCase() === 'FALSE') {
    return false;
  }

  // Number
  const numMatch = input.match(/^-?\d+\.?\d*$/);
  if (numMatch) {
    return parseFloat(input);
  }

  // Percentage
  const percentMatch = input.match(/^(-?\d+\.?\d*)%$/);
  if (percentMatch) {
    return parseFloat(percentMatch[1]) / 100;
  }

  // Currency (remove currency symbol)
  const currencyMatch = input.match(/^[$€£¥](-?\d+\.?\d*)$/);
  if (currencyMatch) {
    return parseFloat(currencyMatch[1]);
  }

  // Date
  const dateMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    const date = new Date(input);
    if (!isNaN(date.getTime())) {
      // Convert to Excel serial date
      return (date.getTime() / 86400000) + 25569;
    }
  }

  // Default: string
  return input;
}
