import type { WorkbookModel } from './types';

export async function* generateSqlDump(model: WorkbookModel): AsyncIterable<string> {
  // Schema creation
  yield `
-- Workbook and metadata tables
CREATE TABLE workbook (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sheet (
  id TEXT PRIMARY KEY,
  workbook_id TEXT NOT NULL,
  sheet_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (workbook_id) REFERENCES workbook(id)
);

CREATE TABLE shared_string (
  id INTEGER PRIMARY KEY,
  workbook_id TEXT NOT NULL,
  value TEXT NOT NULL,
  FOREIGN KEY (workbook_id) REFERENCES workbook(id)
);

CREATE TABLE numfmt (
  id INTEGER PRIMARY KEY,
  workbook_id TEXT NOT NULL,
  format_code TEXT NOT NULL,
  FOREIGN KEY (workbook_id) REFERENCES workbook(id)
);

CREATE TABLE style (
  id INTEGER PRIMARY KEY,
  workbook_id TEXT NOT NULL,
  numfmt_id INTEGER,
  font_id INTEGER,
  fill_id INTEGER,
  border_id INTEGER,
  xf_id INTEGER,
  FOREIGN KEY (workbook_id) REFERENCES workbook(id)
);

CREATE TABLE cell (
  sheet_id TEXT NOT NULL,
  row_idx INTEGER NOT NULL,
  col_idx INTEGER NOT NULL,
  cell_type TEXT NOT NULL,
  value_numeric REAL,
  value_text TEXT,
  value_bool INTEGER,
  formula TEXT,
  style_id INTEGER,
  PRIMARY KEY (sheet_id, row_idx, col_idx),
  FOREIGN KEY (sheet_id) REFERENCES sheet(id)
);

CREATE TABLE merged_range (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sheet_id TEXT NOT NULL,
  ref TEXT NOT NULL,
  FOREIGN KEY (sheet_id) REFERENCES sheet(id)
);

CREATE TABLE row_prop (
  sheet_id TEXT NOT NULL,
  row_idx INTEGER NOT NULL,
  height REAL,
  hidden INTEGER,
  custom_height INTEGER,
  PRIMARY KEY (sheet_id, row_idx),
  FOREIGN KEY (sheet_id) REFERENCES sheet(id)
);

CREATE TABLE col_prop (
  sheet_id TEXT NOT NULL,
  col_idx INTEGER NOT NULL,
  width REAL,
  hidden INTEGER,
  custom_width INTEGER,
  PRIMARY KEY (sheet_id, col_idx),
  FOREIGN KEY (sheet_id) REFERENCES sheet(id)
);

CREATE TABLE defined_name (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workbook_id TEXT NOT NULL,
  name TEXT NOT NULL,
  ref TEXT NOT NULL,
  local_sheet_id INTEGER,
  FOREIGN KEY (workbook_id) REFERENCES workbook(id)
);

CREATE TABLE sheet_view (
  sheet_id TEXT PRIMARY KEY,
  x_split INTEGER,
  y_split INTEGER,
  top_left_cell TEXT,
  state TEXT,
  FOREIGN KEY (sheet_id) REFERENCES sheet(id)
);

-- Indexes for performance
CREATE INDEX ix_cell_sheet_row ON cell(sheet_id, row_idx);
CREATE INDEX ix_cell_sheet_col ON cell(sheet_id, col_idx);
CREATE INDEX ix_cell_formula ON cell(formula) WHERE formula IS NOT NULL;
`;

  // Insert workbook
  yield `\nINSERT INTO workbook (id) VALUES ('${escapeSQL(model.id)}');\n`;

  // Insert shared strings
  if (model.sharedStrings.length > 0) {
    for (let i = 0; i < model.sharedStrings.length; i++) {
      yield `INSERT INTO shared_string (id, workbook_id, value) VALUES (${i}, '${escapeSQL(model.id)}', '${escapeSQL(model.sharedStrings[i])}');\n`;
    }
  }

  // Insert numFmts
  for (const [id, code] of model.numFmts) {
    yield `INSERT INTO numfmt (id, workbook_id, format_code) VALUES (${id}, '${escapeSQL(model.id)}', '${escapeSQL(code)}');\n`;
  }

  // Insert styles
  for (let i = 0; i < model.styles.length; i++) {
    const s = model.styles[i];
    yield `INSERT INTO style (id, workbook_id, numfmt_id, font_id, fill_id, border_id, xf_id) VALUES (${i}, '${escapeSQL(model.id)}', ${s.numFmtId ?? 'NULL'}, ${s.fontId ?? 'NULL'}, ${s.fillId ?? 'NULL'}, ${s.borderId ?? 'NULL'}, ${s.xfId ?? 'NULL'});\n`;
  }

  // Insert sheets and cells
  for (const sheet of model.sheets) {
    yield `INSERT INTO sheet (id, workbook_id, sheet_id, name) VALUES ('${escapeSQL(sheet.id)}', '${escapeSQL(model.id)}', ${sheet.sheetId}, '${escapeSQL(sheet.name)}');\n`;

    // Insert cells in batches
    const cellBatch: string[] = [];
    for (const [, cell] of sheet.cells) {
      const valueNumeric = cell.type === 'n' && typeof cell.value === 'number' ? cell.value : 'NULL';
      const valueText = cell.type === 's' || cell.type === 'str' || cell.type === 'inlineStr' || cell.type === 'e' ? `'${escapeSQL(String(cell.value))}'` : 'NULL';
      const valueBool = cell.type === 'b' ? (cell.value ? 1 : 0) : 'NULL';
      const formula = cell.formula ? `'${escapeSQL(cell.formula)}'` : 'NULL';
      const styleId = cell.styleId !== undefined ? cell.styleId : 'NULL';

      cellBatch.push(`('${escapeSQL(sheet.id)}', ${cell.row}, ${cell.col}, '${cell.type}', ${valueNumeric}, ${valueText}, ${valueBool}, ${formula}, ${styleId})`);

      if (cellBatch.length >= 100) {
        yield `INSERT INTO cell (sheet_id, row_idx, col_idx, cell_type, value_numeric, value_text, value_bool, formula, style_id) VALUES ${cellBatch.join(', ')};\n`;
        cellBatch.length = 0;
      }
    }

    if (cellBatch.length > 0) {
      yield `INSERT INTO cell (sheet_id, row_idx, col_idx, cell_type, value_numeric, value_text, value_bool, formula, style_id) VALUES ${cellBatch.join(', ')};\n`;
    }

    // Insert merged ranges
    for (const merge of sheet.mergedRanges) {
      yield `INSERT INTO merged_range (sheet_id, ref) VALUES ('${escapeSQL(sheet.id)}', '${escapeSQL(merge.ref)}');\n`;
    }

    // Insert row props
    for (const [rowIdx, prop] of sheet.rowProps) {
      yield `INSERT INTO row_prop (sheet_id, row_idx, height, hidden, custom_height) VALUES ('${escapeSQL(sheet.id)}', ${rowIdx}, ${prop.height ?? 'NULL'}, ${prop.hidden ? 1 : 0}, ${prop.customHeight ? 1 : 0});\n`;
    }

    // Insert col props
    for (const [colIdx, prop] of sheet.colProps) {
      yield `INSERT INTO col_prop (sheet_id, col_idx, width, hidden, custom_width) VALUES ('${escapeSQL(sheet.id)}', ${colIdx}, ${prop.width ?? 'NULL'}, ${prop.hidden ? 1 : 0}, ${prop.customWidth ? 1 : 0});\n`;
    }

    // Insert sheet view
    if (sheet.sheetView?.pane) {
      const p = sheet.sheetView.pane;
      yield `INSERT INTO sheet_view (sheet_id, x_split, y_split, top_left_cell, state) VALUES ('${escapeSQL(sheet.id)}', ${p.xSplit ?? 'NULL'}, ${p.ySplit ?? 'NULL'}, ${p.topLeftCell ? `'${escapeSQL(p.topLeftCell)}'` : 'NULL'}, ${p.state ? `'${escapeSQL(p.state)}'` : 'NULL'});\n`;
    }
  }

  // Insert defined names
  for (const dn of model.definedNames) {
    yield `INSERT INTO defined_name (workbook_id, name, ref, local_sheet_id) VALUES ('${escapeSQL(model.id)}', '${escapeSQL(dn.name)}', '${escapeSQL(dn.ref)}', ${dn.localSheetId ?? 'NULL'});\n`;
  }
}

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}
