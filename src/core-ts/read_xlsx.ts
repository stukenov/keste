import { ZipReader } from './zip';
import { XmlSaxParser } from './xml_sax';
import type {
  WorkbookModel,
  SheetModel,
  CellData,
  CellXfsStyle,
  DefinedName,
  Font,
  Fill,
  Border,
  BorderEdge,
  CellXf,
  Alignment,
} from './types';

export async function readXlsxToModel(buffer: ArrayBuffer): Promise<WorkbookModel> {
  console.log('Starting XLSX import, buffer size:', buffer.byteLength);

  const zip = new ZipReader(buffer);
  const entries = await zip.readEntries();

  console.log('ZIP entries found:', entries.size);
  console.log('Entry names:', Array.from(entries.keys()).join(', '));

  const model: WorkbookModel = {
    id: crypto.randomUUID(),
    sheets: [],
    sharedStrings: [],
    numFmts: new Map(),
    styles: [],
    definedNames: [],
    fonts: [],
    fills: [],
    borders: [],
    cellXfs: [],
  };

  // 1. Parse sharedStrings
  const sstData = entries.get('xl/sharedStrings.xml');
  if (sstData) {
    model.sharedStrings = parseSharedStrings(sstData);
  }

  // 2. Parse styles
  const stylesData = entries.get('xl/styles.xml');
  if (stylesData) {
    const { numFmts, styles, fonts, fills, borders, cellXfs } = parseStyles(stylesData);
    model.numFmts = numFmts;
    model.styles = styles;       // Старый формат (для совместимости)
    model.fonts = fonts;          // НОВОЕ
    model.fills = fills;          // НОВОЕ
    model.borders = borders;      // НОВОЕ
    model.cellXfs = cellXfs;      // НОВОЕ
  }

  // 3. Parse workbook relationships to map rId to actual file paths
  const relsData = entries.get('xl/_rels/workbook.xml.rels');
  const rIdMap = new Map<string, string>();

  if (relsData) {
    const relsParser = new XmlSaxParser();
    relsParser.parse(relsData, {
      onStartElement: (name, attrs) => {
        if (name === 'Relationship') {
          const id = attrs.get('Id') || '';
          const target = attrs.get('Target') || '';
          if (id && target) {
            rIdMap.set(id, target);
            console.log(`Relationship: ${id} -> ${target}`);
          }
        }
      },
    });
  }

  // 4. Parse workbook (sheets list, defined names)
  const wbData = entries.get('xl/workbook.xml');
  if (!wbData) {
    throw new Error('workbook.xml not found');
  }

  const { sheets, definedNames } = parseWorkbook(wbData);
  model.definedNames = definedNames;

  // 5. Parse each sheet using relationships
  for (const sheetInfo of sheets) {
    // Get actual file path from relationship
    const relTarget = rIdMap.get(sheetInfo.id);
    const sheetPath = relTarget ? `xl/${relTarget}` : `xl/worksheets/sheet${sheetInfo.sheetId}.xml`;

    console.log(`Looking for sheet "${sheetInfo.name}" (${sheetInfo.id}) at: ${sheetPath}`);

    const sheetData = entries.get(sheetPath);
    if (sheetData) {
      try {
        const sheet = parseSheet(sheetData, sheetInfo.id, sheetInfo.name, sheetInfo.sheetId, model.sharedStrings);
        model.sheets.push(sheet);
      } catch (error) {
        console.error(`Failed to parse sheet "${sheetInfo.name}":`, error);
        // Create empty sheet as fallback
        model.sheets.push({
          id: sheetInfo.id,
          name: sheetInfo.name,
          sheetId: sheetInfo.sheetId,
          cells: new Map(),
          mergedRanges: [],
          rowProps: new Map(),
          colProps: new Map(),
        });
      }
    }
  }

  // Validate model before returning
  if (!model.sheets || model.sheets.length === 0) {
    console.warn('No sheets found in workbook');
    // Create a default empty sheet
    model.sheets = [{
      id: 'sheet1',
      name: 'Sheet1',
      sheetId: 1,
      cells: new Map(),
      mergedRanges: [],
      rowProps: new Map(),
      colProps: new Map(),
    }];
  }

  // Ensure required arrays are initialized
  if (!model.sharedStrings) model.sharedStrings = [];
  if (!model.styles) model.styles = [];
  if (!model.definedNames) model.definedNames = [];
  if (!model.fonts) model.fonts = [];
  if (!model.fills) model.fills = [];
  if (!model.borders) model.borders = [];
  if (!model.cellXfs) model.cellXfs = [];
  if (!model.numFmts) model.numFmts = new Map();

  return model;
}

function parseSharedStrings(data: Uint8Array): string[] {
  const strings: string[] = [];
  const parser = new XmlSaxParser();
  let currentText = '';
  let inT = false;

  parser.parse(data, {
    onStartElement: (name) => {
      if (name === 't') {
        inT = true;
        currentText = '';
      }
    },
    onText: (text) => {
      if (inT) {
        currentText += text;
      }
    },
    onEndElement: (name) => {
      if (name === 't') {
        inT = false;
      } else if (name === 'si') {
        strings.push(currentText);
        currentText = '';
      }
    },
  });

  return strings;
}

function parseStyles(data: Uint8Array): {
  numFmts: Map<number, string>;
  styles: CellXfsStyle[];
  fonts: Font[];
  fills: Fill[];
  borders: Border[];
  cellXfs: CellXf[];
} {
  const numFmts = new Map<number, string>();
  const styles: CellXfsStyle[] = [];
  const fonts: Font[] = [];
  const fills: Fill[] = [];
  const borders: Border[] = [];
  const cellXfs: CellXf[] = [];

  const parser = new XmlSaxParser();

  let inNumFmts = false;
  let inFonts = false;
  let inFills = false;
  let inBorders = false;
  let inCellXfs = false;

  let currentFont: Partial<Font> | null = null;
  let currentFill: Partial<Fill> | null = null;
  let currentBorder: Partial<Border> | null = null;
  let currentCellXf: Partial<CellXf> | null = null;
  let currentAlignment: Partial<Alignment> | null = null;

  // Для border edges
  let currentBorderEdge: Partial<BorderEdge> | null = null;
  let borderEdgeType: 'top' | 'right' | 'bottom' | 'left' | 'diagonal' | null = null;

  parser.parse(data, {
    onStartElement: (name, attrs) => {
      // ===== NUM FMTS =====
      if (name === 'numFmts') {
        inNumFmts = true;
      } else if (name === 'numFmt' && inNumFmts) {
        const id = parseInt(attrs.get('numFmtId') || '0');
        const code = attrs.get('formatCode') || '';
        numFmts.set(id, code);
      }

      // ===== FONTS =====
      else if (name === 'fonts') {
        inFonts = true;
      } else if (name === 'font' && inFonts) {
        currentFont = {
          id: fonts.length,
          name: 'Calibri',
          size: 11,
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          color: 'FF000000',
        };
      } else if (currentFont) {
        if (name === 'name') {
          currentFont.name = attrs.get('val') || 'Calibri';
        } else if (name === 'sz') {
          currentFont.size = parseFloat(attrs.get('val') || '11');
        } else if (name === 'b') {
          currentFont.bold = true;
        } else if (name === 'i') {
          currentFont.italic = true;
        } else if (name === 'u') {
          currentFont.underline = true;
        } else if (name === 'strike') {
          currentFont.strikethrough = true;
        } else if (name === 'color') {
          currentFont.color = attrs.get('rgb') || attrs.get('theme') || 'FF000000';
        }
      }

      // ===== FILLS =====
      else if (name === 'fills') {
        inFills = true;
      } else if (name === 'fill' && inFills) {
        currentFill = {
          id: fills.length,
          patternType: 'none',
        };
      } else if (currentFill && name === 'patternFill') {
        currentFill.patternType = (attrs.get('patternType') || 'none') as any;
      } else if (currentFill && name === 'fgColor') {
        currentFill.fgColor = attrs.get('rgb') || attrs.get('theme');
      } else if (currentFill && name === 'bgColor') {
        currentFill.bgColor = attrs.get('rgb') || attrs.get('theme');
      }

      // ===== BORDERS =====
      else if (name === 'borders') {
        inBorders = true;
      } else if (name === 'border' && inBorders) {
        currentBorder = {
          id: borders.length,
        };
      } else if (currentBorder && ['left', 'right', 'top', 'bottom', 'diagonal'].includes(name)) {
        borderEdgeType = name as any;
        const style = attrs.get('style');
        if (style) {
          currentBorderEdge = { style: style as any };
        } else {
          currentBorderEdge = null; // Edge без стиля = нет границы
        }
      } else if (currentBorderEdge && name === 'color') {
        currentBorderEdge.color = attrs.get('rgb') || attrs.get('theme');
      }

      // ===== CELLXFS =====
      else if (name === 'cellXfs') {
        inCellXfs = true;
      } else if (name === 'xf' && inCellXfs) {
        currentCellXf = {
          id: cellXfs.length,
          numFmtId: attrs.has('numFmtId') ? parseInt(attrs.get('numFmtId')!) : undefined,
          fontId: attrs.has('fontId') ? parseInt(attrs.get('fontId')!) : undefined,
          fillId: attrs.has('fillId') ? parseInt(attrs.get('fillId')!) : undefined,
          borderId: attrs.has('borderId') ? parseInt(attrs.get('borderId')!) : undefined,
          xfId: attrs.has('xfId') ? parseInt(attrs.get('xfId')!) : undefined,
          applyFont: attrs.get('applyFont') === '1',
          applyFill: attrs.get('applyFill') === '1',
          applyBorder: attrs.get('applyBorder') === '1',
          applyAlignment: attrs.get('applyAlignment') === '1',
          applyNumberFormat: attrs.get('applyNumberFormat') === '1',
        };

        // Также сохраняем в старый формат для обратной совместимости
        const oldStyle: CellXfsStyle = {
          numFmtId: currentCellXf.numFmtId,
          fontId: currentCellXf.fontId,
          fillId: currentCellXf.fillId,
          borderId: currentCellXf.borderId,
          xfId: currentCellXf.xfId,
        };
        styles.push(oldStyle);
      } else if (currentCellXf && name === 'alignment') {
        currentAlignment = {
          horizontal: attrs.get('horizontal') as any,
          vertical: attrs.get('vertical') as any,
          wrapText: attrs.get('wrapText') === '1',
          textRotation: attrs.has('textRotation') ? parseInt(attrs.get('textRotation')!) : undefined,
          indent: attrs.has('indent') ? parseInt(attrs.get('indent')!) : undefined,
          shrinkToFit: attrs.get('shrinkToFit') === '1',
        };
      }
    },

    onEndElement: (name) => {
      if (name === 'numFmts') {
        inNumFmts = false;
      } else if (name === 'fonts') {
        inFonts = false;
      } else if (name === 'font' && currentFont) {
        fonts.push(currentFont as Font);
        currentFont = null;
      } else if (name === 'fills') {
        inFills = false;
      } else if (name === 'fill' && currentFill) {
        fills.push(currentFill as Fill);
        currentFill = null;
      } else if (name === 'borders') {
        inBorders = false;
      } else if (name === 'border' && currentBorder) {
        borders.push(currentBorder as Border);
        currentBorder = null;
      } else if (['left', 'right', 'top', 'bottom', 'diagonal'].includes(name) && borderEdgeType) {
        if (currentBorderEdge && currentBorder) {
          currentBorder[borderEdgeType] = currentBorderEdge as BorderEdge;
        }
        currentBorderEdge = null;
        borderEdgeType = null;
      } else if (name === 'cellXfs') {
        inCellXfs = false;
      } else if (name === 'alignment' && currentAlignment && currentCellXf) {
        currentCellXf.alignment = currentAlignment as Alignment;
        currentAlignment = null;
      } else if (name === 'xf' && currentCellXf) {
        cellXfs.push(currentCellXf as CellXf);
        currentCellXf = null;
      }
    },
  });

  return { numFmts, styles, fonts, fills, borders, cellXfs };
}

function parseWorkbook(data: Uint8Array): { sheets: Array<{ id: string; name: string; sheetId: number }>; definedNames: DefinedName[] } {
  const sheets: Array<{ id: string; name: string; sheetId: number }> = [];
  const definedNames: DefinedName[] = [];
  const parser = new XmlSaxParser();
  let elementCount = 0;
  let sheetTagsSeen = 0;

  parser.parse(data, {
    onStartElement: (name, attrs) => {
      elementCount++;

      // DEBUG: Log first 20 elements
      if (elementCount <= 20) {
        console.log(`parseWorkbook element #${elementCount}: <${name}>, attrs:`, Array.from(attrs.entries()));
      }

      if (name === 'sheet') {
        sheetTagsSeen++;
        const sheetData = {
          id: attrs.get('r:id') || attrs.get('id') || '',
          name: attrs.get('name') || '',
          sheetId: parseInt(attrs.get('sheetId') || '1'),
        };
        console.log(`Found sheet #${sheetTagsSeen}:`, sheetData);
        sheets.push(sheetData);
      } else if (name === 'definedName') {
        const dnName = attrs.get('name') || '';
        const localSheetId = attrs.has('localSheetId') ? parseInt(attrs.get('localSheetId')!) : undefined;
        definedNames.push({ name: dnName, ref: '', localSheetId });
      }
    },
  });

  console.log(`parseWorkbook complete: ${sheets.length} sheets found, ${elementCount} total elements`);

  return { sheets, definedNames };
}

function parseSheet(data: Uint8Array, id: string, name: string, sheetId: number, sharedStrings: string[]): SheetModel {
  console.log(`Parsing sheet: ${name}, data size: ${data.byteLength}, sharedStrings: ${sharedStrings.length}`);

  const sheet: SheetModel = {
    id,
    name,
    sheetId,
    cells: new Map(),
    mergedRanges: [],
    rowProps: new Map(),
    colProps: new Map(),
  };

  const parser = new XmlSaxParser();
  let inSheetData = false;
  let currentCell: Partial<CellData> | null = null;
  let currentCellRef = '';
  let inFormula = false;
  let formulaText = '';

  parser.parse(data, {
    onStartElement: (name, attrs) => {
      if (name === 'sheetData') {
        inSheetData = true;
      } else if (name === 'row' && inSheetData) {
        const r = parseInt(attrs.get('r') || '0');
        const ht = attrs.get('ht');
        const hidden = attrs.get('hidden') === '1';
        if (ht || hidden) {
          sheet.rowProps.set(r, {
            row: r,
            height: ht ? parseFloat(ht) : undefined,
            hidden,
            customHeight: attrs.get('customHeight') === '1',
          });
        }
      } else if (name === 'c' && inSheetData) {
        try {
          currentCellRef = attrs.get('r') || '';
          const { row, col } = parseCellRef(currentCellRef);
          
          // Skip invalid cells
          if (row === 0 || col === 0) {
            currentCell = null;
            return;
          }
          
          const type = (attrs.get('t') || 'n') as CellData['type'];
          const s = attrs.get('s');

          currentCell = {
            row,
            col,
            type,
            value: null,
            styleId: s ? parseInt(s) : undefined,
          };
        } catch (error) {
          console.warn(`Failed to parse cell ${attrs.get('r')}:`, error);
          currentCell = null;
        }
      } else if (name === 'f' && currentCell) {
        // Formula tag started
        inFormula = true;
        formulaText = '';

        // Handle formula attributes (for shared formulas, array formulas, etc.)
        // const t = attrs.get('t'); // Formula type: normal, shared, array
        // const ref = attrs.get('ref'); // For array formulas
        // const si = attrs.get('si'); // Shared formula index

        // Store formula type metadata if needed (for now we just capture the formula text)
      } else if (name === 'mergeCell') {
        const ref = attrs.get('ref') || '';
        sheet.mergedRanges.push({ ref });
      } else if (name === 'col') {
        const min = parseInt(attrs.get('min') || '0');
        const width = attrs.get('width');
        const hidden = attrs.get('hidden') === '1';
        if (width || hidden) {
          sheet.colProps.set(min, {
            col: min,
            width: width ? parseFloat(width) : undefined,
            hidden,
            customWidth: attrs.get('customWidth') === '1',
          });
        }
      } else if (name === 'pane') {
        if (!sheet.sheetView) sheet.sheetView = {};
        sheet.sheetView.pane = {
          xSplit: attrs.has('xSplit') ? parseInt(attrs.get('xSplit')!) : undefined,
          ySplit: attrs.has('ySplit') ? parseInt(attrs.get('ySplit')!) : undefined,
          topLeftCell: attrs.get('topLeftCell'),
          state: attrs.get('state'),
        };
      }
    },
    onText: (text) => {
      if (inFormula) {
        // Capture formula text
        formulaText += text;
      } else if (currentCell) {
        try {
          if (currentCell.type === 's') {
            // Shared string index
            const idx = parseInt(text);
            if (idx >= 0 && idx < sharedStrings.length) {
              currentCell.value = sharedStrings[idx] || '';
            } else {
              currentCell.value = '';
            }
          } else if (currentCell.type === 'n') {
            const num = parseFloat(text);
            currentCell.value = isFinite(num) ? num : 0;
          } else if (currentCell.type === 'b') {
            currentCell.value = text === '1';
          } else {
            currentCell.value = text;
          }
        } catch (error) {
          console.warn(`Failed to parse cell value:`, error);
          currentCell.value = text;
        }
      }
    },
    onEndElement: (name) => {
      if (name === 'sheetData') {
        inSheetData = false;
      } else if (name === 'f' && inFormula) {
        // Formula tag ended, save formula to current cell
        if (currentCell && formulaText) {
          currentCell.formula = formulaText;
        }
        inFormula = false;
        formulaText = '';
      } else if (name === 'c' && currentCell) {
        sheet.cells.set(currentCellRef, currentCell as CellData);
        currentCell = null;
        currentCellRef = '';
      }
    },
  });

  console.log(`Sheet ${name} parsed: ${sheet.cells.size} cells, ${sheet.mergedRanges.length} merged ranges`);

  return sheet;
}

function parseCellRef(ref: string): { row: number; col: number } {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { row: 0, col: 0 };

  const colStr = match[1];
  const rowStr = match[2];

  // Limit column string length to prevent overflow
  if (colStr.length > 3) {
    console.warn(`Column string too long: ${colStr}`);
    return { row: 0, col: 0 };
  }

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }

  // Limit row string length to prevent overflow
  if (rowStr.length > 7) {
    console.warn(`Row string too long: ${rowStr}`);
    return { row: 0, col: 0 };
  }

  const row = parseInt(rowStr, 10);

  // Check for NaN or Infinity
  if (!isFinite(row) || !isFinite(col)) {
    console.warn(`Non-finite values: row=${row}, col=${col}`);
    return { row: 0, col: 0 };
  }

  // Excel limits: max row = 1048576, max col = 16384 (XFD)
  const MAX_ROW = 1048576;
  const MAX_COL = 16384;

  if (row > MAX_ROW || col > MAX_COL || row < 1 || col < 1) {
    console.warn(`Invalid cell reference: ${ref} (row: ${row}, col: ${col}). Skipping.`);
    return { row: 0, col: 0 };
  }

  return { row, col };
}
