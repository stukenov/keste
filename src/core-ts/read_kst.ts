import { invoke } from '@tauri-apps/api/tauri';
import type { WorkbookModel, SheetModel, CellData } from './types';

interface KstCellData {
  row: number;
  col: number;
  type: string;
  value: string | null;
  formula: string | null;
  style_id: number | null;
}

interface KstSheetData {
  id: string;
  name: string;
  sheetId: number;
  cells: KstCellData[];
}

interface KstWorkbookData {
  id: string;
  sheets: KstSheetData[];
}

export async function readKstToModel(filePath: string): Promise<WorkbookModel> {
  // Call Rust backend to read SQLite
  const jsonData = await invoke<string>('read_sqlite', {
    request: { file_path: filePath }
  });

  const kstData: KstWorkbookData = JSON.parse(jsonData);

  // Convert to WorkbookModel
  const sheets: SheetModel[] = kstData.sheets.map((kstSheet) => {
    const cells = new Map<string, CellData>();

    kstSheet.cells.forEach((kstCell) => {
      const cellKey = `${kstCell.row}-${kstCell.col}`;
      
      let cellValue: string | number | boolean | null = kstCell.value;
      
      // Parse value based on type
      if (kstCell.type === 'n' && kstCell.value !== null) {
        cellValue = parseFloat(kstCell.value);
      } else if (kstCell.type === 'b' && kstCell.value !== null) {
        cellValue = kstCell.value === '1' || kstCell.value.toLowerCase() === 'true';
      }

      const cell: CellData = {
        row: kstCell.row,
        col: kstCell.col,
        type: kstCell.type as any,
        value: cellValue,
      };

      if (kstCell.formula) {
        cell.formula = kstCell.formula;
      }

      cells.set(cellKey, cell);
    });

    return {
      id: kstSheet.id,
      name: kstSheet.name,
      sheetId: kstSheet.sheetId,
      cells,
      mergedRanges: [],
      rowProps: new Map(),
      colProps: new Map(),
    };
  });

  return {
    id: kstData.id,
    sheets,
    sharedStrings: [],
    numFmts: new Map(),
    styles: [],
    definedNames: [],
  };
}
