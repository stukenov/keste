/**
 * Formula and Named Range types for Keste Phase 9
 * Formulas & References support
 */

export interface NamedRange {
  id: string;
  name: string;
  range: string; // e.g., "A1:B10" or "Sheet2!A1:B10"
  sheetId?: string; // If undefined, workbook-scoped
  comment?: string;
  createdAt: number;
}

export interface FormulaAuditInfo {
  cellRef: string;
  precedents: string[]; // Cells this formula depends on
  dependents: string[]; // Cells that depend on this cell
  hasError: boolean;
  errorType?: string;
}

export interface FormulaFunction {
  name: string;
  category: 'text' | 'date' | 'lookup' | 'statistical' | 'logical' | 'math' | 'financial' | 'info';
  description: string;
  syntax: string;
  example: string;
}

// Extended formula function library organized by category
export const FORMULA_FUNCTIONS: Record<string, FormulaFunction[]> = {
  text: [
    {
      name: 'CONCATENATE',
      category: 'text',
      description: 'Joins several text strings into one text string',
      syntax: 'CONCATENATE(text1, [text2], ...)',
      example: '=CONCATENATE("Hello", " ", "World")',
    },
    {
      name: 'TEXTJOIN',
      category: 'text',
      description: 'Joins text from multiple ranges with a delimiter',
      syntax: 'TEXTJOIN(delimiter, ignore_empty, text1, [text2], ...)',
      example: '=TEXTJOIN(", ", TRUE, A1:A5)',
    },
    {
      name: 'LEFT',
      category: 'text',
      description: 'Returns the first character(s) in a text string',
      syntax: 'LEFT(text, [num_chars])',
      example: '=LEFT("Excel", 2)',
    },
    {
      name: 'RIGHT',
      category: 'text',
      description: 'Returns the last character(s) in a text string',
      syntax: 'RIGHT(text, [num_chars])',
      example: '=RIGHT("Excel", 3)',
    },
    {
      name: 'MID',
      category: 'text',
      description: 'Returns characters from the middle of a text string',
      syntax: 'MID(text, start_num, num_chars)',
      example: '=MID("Excel", 2, 3)',
    },
    {
      name: 'TRIM',
      category: 'text',
      description: 'Removes extra spaces from text',
      syntax: 'TRIM(text)',
      example: '=TRIM("  Hello World  ")',
    },
    {
      name: 'UPPER',
      category: 'text',
      description: 'Converts text to uppercase',
      syntax: 'UPPER(text)',
      example: '=UPPER("hello")',
    },
    {
      name: 'LOWER',
      category: 'text',
      description: 'Converts text to lowercase',
      syntax: 'LOWER(text)',
      example: '=LOWER("HELLO")',
    },
  ],
  date: [
    {
      name: 'TODAY',
      category: 'date',
      description: 'Returns the current date',
      syntax: 'TODAY()',
      example: '=TODAY()',
    },
    {
      name: 'NOW',
      category: 'date',
      description: 'Returns the current date and time',
      syntax: 'NOW()',
      example: '=NOW()',
    },
    {
      name: 'DATE',
      category: 'date',
      description: 'Creates a date from year, month, and day',
      syntax: 'DATE(year, month, day)',
      example: '=DATE(2025, 1, 15)',
    },
    {
      name: 'YEAR',
      category: 'date',
      description: 'Returns the year from a date',
      syntax: 'YEAR(date)',
      example: '=YEAR(TODAY())',
    },
    {
      name: 'MONTH',
      category: 'date',
      description: 'Returns the month from a date',
      syntax: 'MONTH(date)',
      example: '=MONTH(TODAY())',
    },
    {
      name: 'DAY',
      category: 'date',
      description: 'Returns the day from a date',
      syntax: 'DAY(date)',
      example: '=DAY(TODAY())',
    },
  ],
  lookup: [
    {
      name: 'VLOOKUP',
      category: 'lookup',
      description: 'Looks up a value in a table by row',
      syntax: 'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
      example: '=VLOOKUP(A2, B2:D10, 3, FALSE)',
    },
    {
      name: 'HLOOKUP',
      category: 'lookup',
      description: 'Looks up a value in a table by column',
      syntax: 'HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])',
      example: '=HLOOKUP("Q1", A1:F5, 3, FALSE)',
    },
    {
      name: 'INDEX',
      category: 'lookup',
      description: 'Returns a value from a table based on row and column numbers',
      syntax: 'INDEX(array, row_num, [column_num])',
      example: '=INDEX(A1:C10, 5, 2)',
    },
    {
      name: 'MATCH',
      category: 'lookup',
      description: 'Returns the position of a value in a list',
      syntax: 'MATCH(lookup_value, lookup_array, [match_type])',
      example: '=MATCH("Apple", A1:A10, 0)',
    },
  ],
  statistical: [
    {
      name: 'AVERAGE',
      category: 'statistical',
      description: 'Returns the average of numbers',
      syntax: 'AVERAGE(number1, [number2], ...)',
      example: '=AVERAGE(A1:A10)',
    },
    {
      name: 'MEDIAN',
      category: 'statistical',
      description: 'Returns the median of numbers',
      syntax: 'MEDIAN(number1, [number2], ...)',
      example: '=MEDIAN(A1:A10)',
    },
    {
      name: 'STDEV',
      category: 'statistical',
      description: 'Calculates standard deviation',
      syntax: 'STDEV(number1, [number2], ...)',
      example: '=STDEV(A1:A10)',
    },
    {
      name: 'COUNTIF',
      category: 'statistical',
      description: 'Counts cells that meet a condition',
      syntax: 'COUNTIF(range, criteria)',
      example: '=COUNTIF(A1:A10, ">5")',
    },
    {
      name: 'SUMIF',
      category: 'statistical',
      description: 'Sums cells that meet a condition',
      syntax: 'SUMIF(range, criteria, [sum_range])',
      example: '=SUMIF(A1:A10, ">5", B1:B10)',
    },
    {
      name: 'AVERAGEIF',
      category: 'statistical',
      description: 'Averages cells that meet a condition',
      syntax: 'AVERAGEIF(range, criteria, [average_range])',
      example: '=AVERAGEIF(A1:A10, ">5", B1:B10)',
    },
  ],
  logical: [
    {
      name: 'AND',
      category: 'logical',
      description: 'Returns TRUE if all arguments are TRUE',
      syntax: 'AND(logical1, [logical2], ...)',
      example: '=AND(A1>5, B1<10)',
    },
    {
      name: 'OR',
      category: 'logical',
      description: 'Returns TRUE if any argument is TRUE',
      syntax: 'OR(logical1, [logical2], ...)',
      example: '=OR(A1>5, B1<10)',
    },
    {
      name: 'NOT',
      category: 'logical',
      description: 'Reverses the logical value',
      syntax: 'NOT(logical)',
      example: '=NOT(A1>5)',
    },
    {
      name: 'IFERROR',
      category: 'logical',
      description: 'Returns a value if formula evaluates to an error',
      syntax: 'IFERROR(value, value_if_error)',
      example: '=IFERROR(A1/B1, "Error")',
    },
    {
      name: 'IFS',
      category: 'logical',
      description: 'Checks multiple conditions',
      syntax: 'IFS(condition1, value1, [condition2, value2], ...)',
      example: '=IFS(A1>90, "A", A1>80, "B", A1>70, "C")',
    },
  ],
  math: [
    {
      name: 'MOD',
      category: 'math',
      description: 'Returns the remainder after division',
      syntax: 'MOD(number, divisor)',
      example: '=MOD(10, 3)',
    },
    {
      name: 'ROUND',
      category: 'math',
      description: 'Rounds a number to specified digits',
      syntax: 'ROUND(number, num_digits)',
      example: '=ROUND(3.14159, 2)',
    },
    {
      name: 'CEILING',
      category: 'math',
      description: 'Rounds up to nearest multiple',
      syntax: 'CEILING(number, significance)',
      example: '=CEILING(2.5, 1)',
    },
    {
      name: 'FLOOR',
      category: 'math',
      description: 'Rounds down to nearest multiple',
      syntax: 'FLOOR(number, significance)',
      example: '=FLOOR(2.5, 1)',
    },
    {
      name: 'RAND',
      category: 'math',
      description: 'Returns a random number between 0 and 1',
      syntax: 'RAND()',
      example: '=RAND()',
    },
    {
      name: 'RANDBETWEEN',
      category: 'math',
      description: 'Returns a random integer between two numbers',
      syntax: 'RANDBETWEEN(bottom, top)',
      example: '=RANDBETWEEN(1, 100)',
    },
  ],
};

export const ALL_FUNCTIONS = Object.values(FORMULA_FUNCTIONS).flat();

export function getFunctionsByCategory(category: string): FormulaFunction[] {
  return FORMULA_FUNCTIONS[category] || [];
}

export function searchFunctions(query: string): FormulaFunction[] {
  const lowerQuery = query.toLowerCase();
  return ALL_FUNCTIONS.filter(
    (fn) =>
      fn.name.toLowerCase().includes(lowerQuery) ||
      fn.description.toLowerCase().includes(lowerQuery)
  );
}
