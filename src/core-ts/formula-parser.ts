/**
 * Formula Parser and Evaluator for Keste
 * Supports basic Excel-like formulas
 */

export interface CellReference {
  type: 'cell';
  col: number;
  row: number;
}

export interface CellRange {
  type: 'range';
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
}

export type FormulaToken =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'cell'; ref: CellReference }
  | { type: 'range'; ref: CellRange }
  | { type: 'function'; name: string; args: FormulaToken[][] }
  | { type: 'operator'; op: '+' | '-' | '*' | '/' | '^' | '&' }
  | { type: 'paren'; value: '(' | ')' };

// Type for evaluated formula values
export type FormulaValue = number | string | boolean | FormulaValue[];

// Type for function arguments after evaluation
export type FunctionArgs = FormulaValue[];

/**
 * Convert Excel column letter to number (A=0, B=1, Z=25, AA=26)
 */
export function colLetterToNumber(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 65 + 1);
  }
  return result - 1;
}

/**
 * Convert column number to Excel letter (0=A, 1=B, 25=Z, 26=AA)
 */
export function colNumberToLetter(col: number): string {
  let result = '';
  let num = col + 1;
  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}

/**
 * Parse cell reference like "A1" or "AB123"
 */
export function parseCellReference(ref: string): CellReference | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;

  const col = colLetterToNumber(match[1]);
  const row = parseInt(match[2], 10) - 1;

  return { type: 'cell', col, row };
}

/**
 * Parse cell range like "A1:B10"
 */
export function parseCellRange(ref: string): CellRange | null {
  const match = ref.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!match) return null;

  const startCol = colLetterToNumber(match[1]);
  const startRow = parseInt(match[2], 10) - 1;
  const endCol = colLetterToNumber(match[3]);
  const endRow = parseInt(match[4], 10) - 1;

  return {
    type: 'range',
    startCol,
    startRow,
    endCol,
    endRow
  };
}

/**
 * Tokenize formula string
 */
export function tokenizeFormula(formula: string): FormulaToken[] {
  // Remove leading = if present
  const expr = formula.startsWith('=') ? formula.slice(1) : formula;
  const tokens: FormulaToken[] = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Numbers
    if (/\d/.test(char) || (char === '.' && /\d/.test(expr[i + 1] || ''))) {
      let num = '';
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }

    // Strings
    if (char === '"') {
      let str = '';
      i++; // skip opening quote
      while (i < expr.length && expr[i] !== '"') {
        str += expr[i];
        i++;
      }
      i++; // skip closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // Cell references and functions
    if (/[A-Z]/.test(char)) {
      let name = '';
      while (i < expr.length && /[A-Z0-9:]/.test(expr[i])) {
        name += expr[i];
        i++;
      }

      // Check if it's a function call
      if (i < expr.length && expr[i] === '(') {
        // It's a function
        i++; // skip (
        const args: FormulaToken[][] = [[]];
        let depth = 1;
        let argIndex = 0;

        while (i < expr.length && depth > 0) {
          if (expr[i] === '(') {
            depth++;
          } else if (expr[i] === ')') {
            depth--;
            if (depth === 0) break;
          } else if (expr[i] === ',' && depth === 1) {
            argIndex++;
            args[argIndex] = [];
            i++;
            continue;
          }

          // Recursively tokenize argument
          const argTokens = tokenizeFormula(expr.slice(i, i + 1));
          if (argTokens.length > 0) {
            args[argIndex].push(argTokens[0]);
          }
          i++;
        }
        i++; // skip closing )

        tokens.push({ type: 'function', name, args });
        continue;
      }

      // Check if it's a range (contains :)
      if (name.includes(':')) {
        const range = parseCellRange(name);
        if (range) {
          tokens.push({ type: 'range', ref: range });
          continue;
        }
      }

      // Check if it's a cell reference
      const cellRef = parseCellReference(name);
      if (cellRef) {
        tokens.push({ type: 'cell', ref: cellRef });
        continue;
      }

      // Boolean literals
      if (name === 'TRUE') {
        tokens.push({ type: 'boolean', value: true });
        continue;
      }
      if (name === 'FALSE') {
        tokens.push({ type: 'boolean', value: false });
        continue;
      }
    }

    // Operators
    if ('+-*/^&'.includes(char)) {
      tokens.push({ type: 'operator', op: char as any });
      i++;
      continue;
    }

    // Parentheses
    if (char === '(' || char === ')') {
      tokens.push({ type: 'paren', value: char });
      i++;
      continue;
    }

    // Unknown character, skip
    i++;
  }

  return tokens;
}

/**
 * Get cell value from sheet data
 */
export type CellGetter = (row: number, col: number) => string | number | boolean | null;

/**
 * Evaluate a single token
 */
function evaluateToken(token: FormulaToken, getCellValue: CellGetter): number | string | boolean {
  switch (token.type) {
    case 'number':
      return token.value;
    case 'string':
      return token.value;
    case 'boolean':
      return token.value;
    case 'cell':
      const cellValue = getCellValue(token.ref.row, token.ref.col);
      if (cellValue === null || cellValue === undefined) return 0;
      if (typeof cellValue === 'number') return cellValue;
      if (typeof cellValue === 'boolean') return cellValue;
      if (typeof cellValue === 'string') {
        const num = parseFloat(cellValue);
        return isNaN(num) ? cellValue : num;
      }
      return cellValue;
    default:
      return 0;
  }
}

/**
 * Evaluate a range and return array of values
 */
function evaluateRange(range: CellRange, getCellValue: CellGetter): (number | string | boolean)[] {
  const values: (number | string | boolean)[] = [];

  for (let row = range.startRow; row <= range.endRow; row++) {
    for (let col = range.startCol; col <= range.endCol; col++) {
      const value = getCellValue(row, col);
      if (value !== null && value !== undefined) {
        values.push(value);
      }
    }
  }

  return values;
}

// Helper to flatten and extract numbers from FormulaValue
function extractNumbers(value: FormulaValue): number[] {
  if (typeof value === 'number') {
    return [value];
  }
  if (typeof value === 'string') {
    // ⚡ Convert string numbers to actual numbers
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return [num];
    }
    return []; // Ignore non-numeric strings
  }
  if (Array.isArray(value)) {
    return value.flatMap(extractNumbers);
  }
  return [];
}

/**
 * Built-in Excel functions
 */
const FUNCTIONS: Record<string, (args: FunctionArgs, getCellValue: CellGetter) => FormulaValue> = {
  SUM: (args, _getCellValue) => {
    const numbers = args.flatMap(extractNumbers);
    return numbers.reduce((acc, val) => acc + val, 0);
  },

  AVERAGE: (args, _getCellValue) => {
    const numbers = args.flatMap(extractNumbers);
    return numbers.length > 0 ? numbers.reduce((acc, val) => acc + val, 0) / numbers.length : 0;
  },

  COUNT: (args) => {
    const numbers = args.flatMap(extractNumbers);
    return numbers.length;
  },

  MIN: (args) => {
    const numbers = args.flatMap(extractNumbers);
    return numbers.length > 0 ? Math.min(...numbers) : 0;
  },

  MAX: (args) => {
    const numbers = args.flatMap(extractNumbers);
    return numbers.length > 0 ? Math.max(...numbers) : 0;
  },

  IF: (args) => {
    const condition = args[0];
    const trueValue = args[1] !== undefined ? args[1] : true;
    const falseValue = args[2] !== undefined ? args[2] : false;
    return condition ? trueValue : falseValue;
  },

  CONCAT: (args) => {
    return args.map(arg => Array.isArray(arg) ? arg.join('') : String(arg)).join('');
  },

  UPPER: (args) => {
    const str = Array.isArray(args[0]) ? args[0][0] : args[0];
    return String(str).toUpperCase();
  },

  LOWER: (args) => {
    const str = Array.isArray(args[0]) ? args[0][0] : args[0];
    return String(str).toLowerCase();
  },

  LEN: (args) => {
    const str = Array.isArray(args[0]) ? args[0][0] : args[0];
    return String(str).length;
  },

  ROUND: (args) => {
    const num = typeof args[0] === 'number' ? args[0] : 0;
    const digits = typeof args[1] === 'number' ? args[1] : 0;
    return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
  },

  ABS: (args) => {
    const num = typeof args[0] === 'number' ? args[0] : 0;
    return Math.abs(num);
  },

  SQRT: (args) => {
    const num = typeof args[0] === 'number' ? args[0] : 0;
    return Math.sqrt(num);
  },

  POWER: (args) => {
    const base = typeof args[0] === 'number' ? args[0] : 0;
    const exp = typeof args[1] === 'number' ? args[1] : 0;
    return Math.pow(base, exp);
  }
};

/**
 * Simple expression evaluator (handles operators)
 */
function evaluateExpression(tokens: FormulaToken[], getCellValue: CellGetter): number | string | boolean {
  if (tokens.length === 0) return 0;
  if (tokens.length === 1) {
    const token = tokens[0];
    if (token.type === 'function') {
      return evaluateFunction(token, getCellValue);
    }
    return evaluateToken(token, getCellValue);
  }

  // Handle operators with precedence
  // For simplicity, just handle left-to-right for now
  let result: FormulaValue | null = null;
  let currentOp: string | null = null;

  for (const token of tokens) {
    if (token.type === 'operator') {
      currentOp = token.op;
      continue;
    }

    const value = token.type === 'function'
      ? evaluateFunction(token, getCellValue)
      : evaluateToken(token, getCellValue);

    if (result === null) {
      result = value;
      continue;
    }

    if (currentOp) {
      if (typeof result === 'number' && typeof value === 'number') {
        switch (currentOp) {
          case '+': result = result + value; break;
          case '-': result = result - value; break;
          case '*': result = result * value; break;
          case '/': result = value !== 0 ? result / value : 0; break;
          case '^': result = Math.pow(result, value); break;
        }
      } else if (currentOp === '&') {
        result = String(result) + String(value);
      }
      currentOp = null;
    }
  }

  // Ensure we return a valid type (handle null case)
  if (result === null) return 0;
  if (Array.isArray(result)) return result[0] !== undefined ? (result[0] as number | string | boolean) : 0;
  return result as number | string | boolean;
}

/**
 * Evaluate a function token
 */
function evaluateFunction(token: FormulaToken & { type: 'function' }, getCellValue: CellGetter): number | string | boolean {
  const funcName = token.name.toUpperCase();
  const func = FUNCTIONS[funcName];

  if (!func) {
    console.warn(`Unknown function: ${funcName}`);
    return 0;
  }

  // Evaluate each argument
  const evaluatedArgs = token.args.map(argTokens => {
    if (argTokens.length === 0) return 0;

    // Check if it's a range
    const firstToken = argTokens[0];
    if (firstToken.type === 'range') {
      return evaluateRange(firstToken.ref, getCellValue);
    }

    // Otherwise evaluate as expression
    return evaluateExpression(argTokens, getCellValue);
  });

  const result = func(evaluatedArgs, getCellValue);
  // Functions return simple values; if somehow an array, take first element
  if (Array.isArray(result)) {
    return result[0] !== undefined ? (result[0] as string | number | boolean) : 0;
  }
  return result as string | number | boolean;
}

/**
 * Main formula evaluator
 */
export function evaluateFormula(
  formula: string,
  getCellValue: CellGetter
): number | string | boolean | null {
  try {
    // Empty or non-formula
    if (!formula || !formula.startsWith('=')) {
      return formula;
    }

    const tokens = tokenizeFormula(formula);
    if (tokens.length === 0) return null;

    return evaluateExpression(tokens, getCellValue);
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return '#ERROR!';
  }
}
