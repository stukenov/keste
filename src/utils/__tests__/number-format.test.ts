import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  parseNumberFormat,
  formatDate,
  autoFormatCellValue,
  parseUserInput,
} from '../number-format';

describe('formatNumber', () => {
  it('formats numbers with default options', () => {
    expect(formatNumber(1234.5678)).toBe('1234.57');
  });

  it('formats numbers with custom decimals', () => {
    expect(formatNumber(1234.5678, { decimals: 0 })).toBe('1235');
    expect(formatNumber(1234.5678, { decimals: 1 })).toBe('1234.6');
    expect(formatNumber(1234.5678, { decimals: 3 })).toBe('1234.568');
  });

  it('formats numbers with thousands separator', () => {
    expect(formatNumber(1234.56, { thousands: true })).toBe('1,234.56');
    expect(formatNumber(1234567.89, { thousands: true })).toBe('1,234,567.89');
  });

  it('formats numbers with currency', () => {
    expect(formatNumber(1234.56, { currency: '$' })).toBe('$1234.56');
    expect(formatNumber(1234.56, { currency: '€', thousands: true })).toBe('€1,234.56');
  });

  it('formats percentages', () => {
    expect(formatNumber(0.1234, { percentage: true })).toBe('12.34%');
    expect(formatNumber(1, { percentage: true })).toBe('100.00%');
  });

  it('handles string input', () => {
    expect(formatNumber('1234.56')).toBe('1234.56');
    expect(formatNumber('invalid')).toBe('invalid');
  });

  it('handles edge cases', () => {
    expect(formatNumber(0)).toBe('0.00');
    expect(formatNumber(-1234.56, { thousands: true })).toBe('-1,234.56');
  });
});

describe('parseNumberFormat', () => {
  it('parses basic format codes', () => {
    const result = parseNumberFormat('0.00');
    expect(result.decimals).toBe(2);
    expect(result.thousands).toBeFalsy();
  });

  it('parses format with thousands separator', () => {
    expect(parseNumberFormat('#,##0.00')).toEqual({
      decimals: 2,
      thousands: true,
    });
  });

  it('parses currency format', () => {
    const result = parseNumberFormat('$#,##0.00');
    expect(result.currency).toBe('$');
    expect(result.thousands).toBe(true);
    expect(result.decimals).toBe(2);
  });

  it('parses percentage format', () => {
    const result = parseNumberFormat('0.00%');
    expect(result.decimals).toBe(2);
    expect(result.percentage).toBe(true);
  });

  it('handles format without decimals', () => {
    expect(parseNumberFormat('#,##0')).toEqual({
      decimals: 0,
      thousands: true,
    });
  });
});

describe('formatDate', () => {
  it('formats dates with default format', () => {
    const date = new Date('2025-10-04');
    expect(formatDate(date)).toBe('2025-10-04');
  });

  it('formats dates with custom format', () => {
    const date = new Date('2025-10-04 15:30:45');
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2025-10-04 15:30:45');
  });

  it('handles date from string', () => {
    expect(formatDate('2025-10-04')).toBe('2025-10-04');
  });

  it('handles invalid date', () => {
    expect(formatDate('invalid')).toBe('invalid');
  });
});

describe('autoFormatCellValue', () => {
  it('handles null and undefined', () => {
    expect(autoFormatCellValue(null)).toBe('');
    expect(autoFormatCellValue(undefined)).toBe('');
  });

  it('formats booleans', () => {
    expect(autoFormatCellValue(true)).toBe('TRUE');
    expect(autoFormatCellValue(false)).toBe('FALSE');
  });

  it('formats numbers', () => {
    expect(autoFormatCellValue(1234.5678)).toBe('1234.57');
  });

  it('formats strings', () => {
    expect(autoFormatCellValue('Hello')).toBe('Hello');
  });

  it('detects Excel date values', () => {
    // Excel serial date for 2024-12-31 is 45656
    const result = autoFormatCellValue(45657);
    expect(result).toMatch(/2024-12-\d{2}|2025-01-\d{2}/);
  });
});

describe('parseUserInput', () => {
  it('parses empty string', () => {
    expect(parseUserInput('')).toBe('');
    expect(parseUserInput('  ')).toBe('');
  });

  it('parses booleans', () => {
    expect(parseUserInput('TRUE')).toBe(true);
    expect(parseUserInput('true')).toBe(true);
    expect(parseUserInput('FALSE')).toBe(false);
    expect(parseUserInput('false')).toBe(false);
  });

  it('parses numbers', () => {
    expect(parseUserInput('1234')).toBe(1234);
    expect(parseUserInput('1234.56')).toBe(1234.56);
    expect(parseUserInput('-1234.56')).toBe(-1234.56);
  });

  it('parses percentages', () => {
    expect(parseUserInput('50%')).toBe(0.5);
    expect(parseUserInput('100%')).toBe(1);
  });

  it('parses currency', () => {
    expect(parseUserInput('$1234.56')).toBe(1234.56);
    expect(parseUserInput('€1234.56')).toBe(1234.56);
  });

  it('parses dates', () => {
    const result = parseUserInput('2025-10-04');
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(25569); // Valid Excel date
  });

  it('returns string for unrecognized input', () => {
    expect(parseUserInput('Hello')).toBe('Hello');
    expect(parseUserInput('Some text')).toBe('Some text');
  });
});

