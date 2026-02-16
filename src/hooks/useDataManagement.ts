import { useState, useCallback } from 'react';
import type { SheetModel, CellData } from '../core-ts/types';
import type {
  CellValidation,
  ConditionalFormattingRuleEntry,
  DataManagementState,
  SortOrder,
  FilterCondition,
  FindReplaceOptions,
  FindResult,
} from '../core-ts/data-management-types';

export function useDataManagement(_sheetId: string) {
  const [state, setState] = useState<DataManagementState>({
    sorts: [],
    filters: [],
    validations: [],
    conditionalFormats: [],
  });

  // Sorting
  const setSortForColumn = useCallback((col: number, order: SortOrder) => {
    setState(prev => {
      const newSorts = prev.sorts.filter(s => s.col !== col);
      if (order) {
        newSorts.push({ col, order, priority: newSorts.length });
      }
      return { ...prev, sorts: newSorts };
    });
  }, []);

  const addMultiColumnSort = useCallback((col: number, order: SortOrder) => {
    setState(prev => {
      const existingIndex = prev.sorts.findIndex(s => s.col === col);
      let newSorts = [...prev.sorts];

      if (existingIndex >= 0) {
        if (order) {
          newSorts[existingIndex] = { ...newSorts[existingIndex], order };
        } else {
          newSorts.splice(existingIndex, 1);
          // Reorder priorities
          newSorts = newSorts.map((s, idx) => ({ ...s, priority: idx }));
        }
      } else if (order) {
        newSorts.push({ col, order, priority: newSorts.length });
      }

      return { ...prev, sorts: newSorts };
    });
  }, []);

  const clearSorts = useCallback(() => {
    setState(prev => ({ ...prev, sorts: [] }));
  }, []);

  const applySorting = useCallback((cells: Map<string, CellData>): Map<string, CellData> => {
    if (state.sorts.length === 0) return cells;

    // Convert map to array for sorting
    const cellArray = Array.from(cells.entries()).map(([key, cell]) => ({ key, cell }));

    // Get unique rows
    const rowsSet = new Set(cellArray.map(({ cell }) => cell.row));
    const rows = Array.from(rowsSet).sort((a, b) => a - b);

    // Create row data for sorting
    const rowData = rows.map(row => {
      const rowCells = new Map<number, CellData>();
      cellArray.forEach(({ cell }) => {
        if (cell.row === row) {
          rowCells.set(cell.col, cell);
        }
      });
      return { row, cells: rowCells };
    });

    // Sort rows
    rowData.sort((a, b) => {
      for (const sort of state.sorts.sort((s1, s2) => s1.priority - s2.priority)) {
        const cellA = a.cells.get(sort.col);
        const cellB = b.cells.get(sort.col);

        const valueA = cellA?.value ?? '';
        const valueB = cellB?.value ?? '';

        let comparison = 0;
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          comparison = valueA - valueB;
        } else {
          comparison = String(valueA).localeCompare(String(valueB));
        }

        if (comparison !== 0) {
          return sort.order === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });

    // Rebuild cells map with new row positions
    const newCells = new Map<string, CellData>();
    rowData.forEach((rowInfo, newRowIndex) => {
      const newRow = newRowIndex + 1; // 1-indexed
      rowInfo.cells.forEach((cell, col) => {
        const newKey = `${newRow}-${col}`;
        newCells.set(newKey, { ...cell, row: newRow });
      });
    });

    return newCells;
  }, [state.sorts]);

  // Filtering
  const setFilterForColumn = useCallback((col: number, condition: FilterCondition | null) => {
    setState(prev => {
      const newFilters = prev.filters.filter(f => f.col !== col);
      if (condition) {
        newFilters.push({ col, condition });
      }
      return { ...prev, filters: newFilters };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({ ...prev, filters: [] }));
  }, []);

  const applyFiltering = useCallback((cells: Map<string, CellData>): Map<string, CellData> => {
    if (state.filters.length === 0) return cells;

    const filteredCells = new Map<string, CellData>();

    // Get all rows
    const rowsSet = new Set(Array.from(cells.values()).map(cell => cell.row));
    const rows = Array.from(rowsSet);

    rowLoop: for (const row of rows) {
      // Check if row passes all filters
      for (const filter of state.filters) {
        const cellKey = `${row}-${filter.col}`;
        const cell = cells.get(cellKey);
        const value = cell?.value ?? null;

        if (!matchesFilter(value, filter.condition, cell)) {
          continue rowLoop; // Skip this row
        }
      }

      // Row passed all filters, include its cells
      for (const [key, cell] of cells) {
        if (cell.row === row) {
          filteredCells.set(key, cell);
        }
      }
    }

    return filteredCells;
  }, [state.filters]);

  // Find & Replace
  const find = useCallback((
    sheet: SheetModel,
    options: FindReplaceOptions
  ): FindResult[] => {
    const results: FindResult[] = [];
    const { findText, matchCase, matchWholeWord, searchFormulas, useRegex } = options;

    if (!findText) return results;

    let searchRegex: RegExp;
    try {
      if (useRegex) {
        searchRegex = new RegExp(findText, matchCase ? 'g' : 'gi');
      } else {
        const escapedText = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = matchWholeWord ? `\\b${escapedText}\\b` : escapedText;
        searchRegex = new RegExp(pattern, matchCase ? 'g' : 'gi');
      }
    } catch (e) {
      console.error('Invalid regex:', e);
      return results;
    }

    for (const [, cell] of sheet.cells) {
      const searchValue = searchFormulas && cell.formula
        ? `=${cell.formula}`
        : String(cell.value ?? '');

      if (searchRegex.test(searchValue)) {
        results.push({
          row: cell.row,
          col: cell.col,
          sheetId: sheet.id,
          value: searchValue,
        });
      }
    }

    return results;
  }, []);

  const replace = useCallback((
    cell: CellData,
    options: FindReplaceOptions
  ): string => {
    const { findText, replaceText, matchCase, matchWholeWord, useRegex } = options;
    const searchValue = String(cell.value ?? '');

    if (!findText) return searchValue;

    try {
      let searchRegex: RegExp;
      if (useRegex) {
        searchRegex = new RegExp(findText, matchCase ? 'g' : 'gi');
      } else {
        const escapedText = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = matchWholeWord ? `\\b${escapedText}\\b` : escapedText;
        searchRegex = new RegExp(pattern, matchCase ? 'g' : 'gi');
      }

      return searchValue.replace(searchRegex, replaceText);
    } catch (e) {
      console.error('Replace error:', e);
      return searchValue;
    }
  }, []);

  // Data Validation
  const setValidation = useCallback((validation: CellValidation) => {
    setState(prev => {
      const newValidations = prev.validations.filter(
        v => !(v.row === validation.row && v.col === validation.col)
      );
      newValidations.push(validation);
      return { ...prev, validations: newValidations };
    });
  }, []);

  const removeValidation = useCallback((row: number, col: number) => {
    setState(prev => ({
      ...prev,
      validations: prev.validations.filter(v => !(v.row === row && v.col === col)),
    }));
  }, []);

  const getValidation = useCallback((row: number, col: number): CellValidation | null => {
    return state.validations.find(v => v.row === row && v.col === col) || null;
  }, [state.validations]);

  const validateCell = useCallback((row: number, col: number, value: string | number | boolean | null): boolean => {
    const validation = state.validations.find(v => v.row === row && v.col === col);
    if (!validation) return true;

    switch (validation.rule.type) {
      case 'list':
        return validation.rule.values.includes(String(value));

      case 'number': {
        const num = Number(value);
        if (isNaN(num)) return false;
        if (validation.rule.min !== undefined && num < validation.rule.min) return false;
        if (validation.rule.max !== undefined && num > validation.rule.max) return false;
        return true;
      }

      case 'date': {
        if (typeof value !== 'string' && typeof value !== 'number') return false;
        const date = new Date(value);
        if (isNaN(date.getTime())) return false;
        if (validation.rule.min && date < validation.rule.min) return false;
        if (validation.rule.max && date > validation.rule.max) return false;
        return true;
      }

      case 'textLength': {
        const text = String(value);
        if (validation.rule.min !== undefined && text.length < validation.rule.min) return false;
        if (validation.rule.max !== undefined && text.length > validation.rule.max) return false;
        return true;
      }

      case 'custom':
        // TODO: Implement custom formula validation
        return true;

      default:
        return true;
    }
  }, [state.validations]);

  // Conditional Formatting
  const addConditionalFormat = useCallback((rule: ConditionalFormattingRuleEntry) => {
    setState(prev => ({
      ...prev,
      conditionalFormats: [...prev.conditionalFormats, rule],
    }));
  }, []);

  const removeConditionalFormat = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      conditionalFormats: prev.conditionalFormats.filter((_, i) => i !== index),
    }));
  }, []);

  const getConditionalFormat = useCallback((
    row: number,
    col: number,
    value: string | number | boolean | null
  ): Partial<CellData['style']> | null => {
    // Sort by priority
    const rules = [...state.conditionalFormats].sort((a, b) => a.priority - b.priority);

    for (const ruleEntry of rules) {
      if (!isInRange(row, col, ruleEntry.range)) continue;

      const { rule } = ruleEntry;
      let matches = false;

      switch (rule.type) {
        case 'cellValue': {
          const numValue = Number(value);
          switch (rule.operator) {
            case 'greaterThan':
              matches = numValue > Number(rule.value);
              break;
            case 'lessThan':
              matches = numValue < Number(rule.value);
              break;
            case 'equals':
              matches = value === rule.value;
              break;
            case 'between':
              matches = numValue >= Number(rule.value) && numValue <= Number(rule.value2);
              break;
          }
          if (matches) return rule.format;
          break;
        }

        case 'dataBar':
        case 'colorScale':
        case 'iconSet':
          // TODO: Implement visual formatting types
          break;

        case 'customFormula':
          // TODO: Implement custom formula evaluation
          break;
      }

      if (matches && ruleEntry.stopIfTrue) break;
    }

    return null;
  }, [state.conditionalFormats]);

  return {
    state,
    // Sorting
    setSortForColumn,
    addMultiColumnSort,
    clearSorts,
    applySorting,
    // Filtering
    setFilterForColumn,
    clearFilters,
    applyFiltering,
    // Find & Replace
    find,
    replace,
    // Validation
    setValidation,
    removeValidation,
    getValidation,
    validateCell,
    // Conditional Formatting
    addConditionalFormat,
    removeConditionalFormat,
    getConditionalFormat,
  };
}

// Helper functions
function matchesFilter(
  value: string | number | boolean | null,
  condition: FilterCondition,
  cell?: CellData
): boolean {
  if (condition.type === 'value' && condition.values) {
    return condition.values.has(String(value ?? ''));
  }

  if (condition.type === 'condition' && condition.operator) {
    const strValue = String(value ?? '').toLowerCase();
    const searchValue = String(condition.value ?? '').toLowerCase();

    switch (condition.operator) {
      case 'equals':
        return strValue === searchValue;
      case 'contains':
        return strValue.includes(searchValue);
      case 'startsWith':
        return strValue.startsWith(searchValue);
      case 'endsWith':
        return strValue.endsWith(searchValue);
      case 'greaterThan':
        return Number(value) > Number(condition.value);
      case 'lessThan':
        return Number(value) < Number(condition.value);
      default:
        return true;
    }
  }

  if (condition.type === 'color' && cell) {
    return cell.style?.backgroundColor === condition.color;
  }

  return true;
}

function isInRange(row: number, col: number, range: string): boolean {
  // Parse range like "A1:B10"
  const match = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!match) return false;

  const startCol = columnLetterToNumber(match[1]);
  const startRow = parseInt(match[2]);
  const endCol = columnLetterToNumber(match[3]);
  const endRow = parseInt(match[4]);

  return row >= startRow && row <= endRow && col >= startCol && col <= endCol;
}

function columnLetterToNumber(letter: string): number {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64);
  }
  return result;
}
