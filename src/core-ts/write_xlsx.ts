/**
 * XLSX Writer for Keste
 * Generates valid Excel 2007+ (.xlsx) files from WorkbookModel
 */

import type { WorkbookModel, SheetModel, CellData } from './types';

/**
 * XML escape utility
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate [Content_Types].xml
 */
function generateContentTypes(sheetCount: number): string {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n';
  xml += '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n';
  xml += '  <Default Extension="xml" ContentType="application/xml"/>\n';
  xml += '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>\n';

  for (let i = 1; i <= sheetCount; i++) {
    xml += `  <Override PartName="/xl/worksheets/sheet${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\n`;
  }

  xml += '  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>\n';
  xml += '  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>\n';
  xml += '</Types>';

  return xml;
}

/**
 * Generate _rels/.rels
 */
function generateRootRels(): string {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n';
  xml += '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>\n';
  xml += '</Relationships>';

  return xml;
}

/**
 * Generate xl/_rels/workbook.xml.rels
 */
function generateWorkbookRels(sheetCount: number): string {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n';

  for (let i = 1; i <= sheetCount; i++) {
    xml += `  <Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i}.xml"/>\n`;
  }

  xml += `  <Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>\n`;
  xml += `  <Relationship Id="rId${sheetCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n`;
  xml += '</Relationships>';

  return xml;
}

/**
 * Generate xl/workbook.xml
 */
function generateWorkbook(workbook: WorkbookModel): string {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n';
  xml += '  <sheets>\n';

  workbook.sheets.forEach((sheet, index) => {
    xml += `    <sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>\n`;
  });

  xml += '  </sheets>\n';
  xml += '</workbook>';

  return xml;
}

/**
 * Build shared strings table
 */
function buildSharedStrings(workbook: WorkbookModel): { table: Map<string, number>, xml: string } {
  const stringMap = new Map<string, number>();
  let stringIndex = 0;

  // Collect all unique strings
  workbook.sheets.forEach(sheet => {
    sheet.cells.forEach(cell => {
      if (cell.type === 's' && typeof cell.value === 'string') {
        if (!stringMap.has(cell.value)) {
          stringMap.set(cell.value, stringIndex++);
        }
      }
    });
  });

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${stringMap.size}" uniqueCount="${stringMap.size}">\n`;

  const sortedStrings = Array.from(stringMap.entries()).sort((a, b) => a[1] - b[1]);
  sortedStrings.forEach(([str]) => {
    xml += `  <si><t>${escapeXml(str)}</t></si>\n`;
  });

  xml += '</sst>';

  return { table: stringMap, xml };
}

/**
 * Generate xl/styles.xml (minimal)
 */
function generateStyles(): string {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n';

  // Number formats
  xml += '  <numFmts count="0"/>\n';

  // Fonts
  xml += '  <fonts count="1">\n';
  xml += '    <font><sz val="11"/><name val="Calibri"/></font>\n';
  xml += '  </fonts>\n';

  // Fills
  xml += '  <fills count="2">\n';
  xml += '    <fill><patternFill patternType="none"/></fill>\n';
  xml += '    <fill><patternFill patternType="gray125"/></fill>\n';
  xml += '  </fills>\n';

  // Borders
  xml += '  <borders count="1">\n';
  xml += '    <border><left/><right/><top/><bottom/><diagonal/></border>\n';
  xml += '  </borders>\n';

  // Cell style formats
  xml += '  <cellStyleXfs count="1">\n';
  xml += '    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>\n';
  xml += '  </cellStyleXfs>\n';

  // Cell formats
  xml += '  <cellXfs count="1">\n';
  xml += '    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>\n';
  xml += '  </cellXfs>\n';

  // Cell styles
  xml += '  <cellStyles count="1">\n';
  xml += '    <cellStyle name="Normal" xfId="0" builtinId="0"/>\n';
  xml += '  </cellStyles>\n';

  xml += '</styleSheet>';

  return xml;
}

/**
 * Convert column number to Excel letter (0=A, 25=Z, 26=AA)
 */
function colNumberToLetter(col: number): string {
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
 * Generate xl/worksheets/sheetN.xml
 */
function generateWorksheet(sheet: SheetModel, sharedStrings: Map<string, number>): string {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n';

  // Dimension
  let minRow = Infinity, maxRow = -Infinity;
  let minCol = Infinity, maxCol = -Infinity;

  sheet.cells.forEach(cell => {
    minRow = Math.min(minRow, cell.row);
    maxRow = Math.max(maxRow, cell.row);
    minCol = Math.min(minCol, cell.col);
    maxCol = Math.max(maxCol, cell.col);
  });

  if (sheet.cells.size > 0) {
    const topLeft = `${colNumberToLetter(minCol - 1)}${minRow}`;
    const bottomRight = `${colNumberToLetter(maxCol - 1)}${maxRow}`;
    xml += `  <dimension ref="${topLeft}:${bottomRight}"/>\n`;
  } else {
    xml += '  <dimension ref="A1"/>\n';
  }

  // Sheet views
  xml += '  <sheetViews><sheetView workbookViewId="0"/></sheetViews>\n';

  // Sheet format
  xml += '  <sheetFormatPr defaultRowHeight="15"/>\n';

  // Sheet data
  xml += '  <sheetData>\n';

  // Group cells by row
  const rowMap = new Map<number, CellData[]>();
  sheet.cells.forEach(cell => {
    if (!rowMap.has(cell.row)) {
      rowMap.set(cell.row, []);
    }
    rowMap.get(cell.row)!.push(cell);
  });

  // Sort rows
  const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b);

  sortedRows.forEach(rowNum => {
    const cells = rowMap.get(rowNum)!.sort((a, b) => a.col - b.col);
    xml += `    <row r="${rowNum}">\n`;

    cells.forEach(cell => {
      const cellRef = `${colNumberToLetter(cell.col - 1)}${cell.row}`;

      if (cell.formula) {
        // Formula cell
        xml += `      <c r="${cellRef}">\n`;
        xml += `        <f>${escapeXml(cell.formula)}</f>\n`;
        if (cell.value !== null && cell.value !== undefined) {
          xml += `        <v>${escapeXml(String(cell.value))}</v>\n`;
        }
        xml += `      </c>\n`;
      } else if (cell.type === 's' && typeof cell.value === 'string') {
        // String cell (use shared strings)
        const stringIndex = sharedStrings.get(cell.value);
        if (stringIndex !== undefined) {
          xml += `      <c r="${cellRef}" t="s"><v>${stringIndex}</v></c>\n`;
        }
      } else if (cell.type === 'n' || typeof cell.value === 'number') {
        // Number cell
        xml += `      <c r="${cellRef}"><v>${cell.value}</v></c>\n`;
      } else if (cell.type === 'b' || typeof cell.value === 'boolean') {
        // Boolean cell
        xml += `      <c r="${cellRef}" t="b"><v>${cell.value ? '1' : '0'}</v></c>\n`;
      } else if (cell.value !== null && cell.value !== undefined) {
        // Inline string
        xml += `      <c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(String(cell.value))}</t></is></c>\n`;
      }
    });

    xml += `    </row>\n`;
  });

  xml += '  </sheetData>\n';

  // Merged cells
  if (sheet.mergedRanges && sheet.mergedRanges.length > 0) {
    xml += `  <mergeCells count="${sheet.mergedRanges.length}">\n`;
    sheet.mergedRanges.forEach(range => {
      xml += `    <mergeCell ref="${range.ref}"/>\n`;
    });
    xml += '  </mergeCells>\n';
  }

  xml += '</worksheet>';

  return xml;
}

/**
 * File entry for ZIP
 */
export interface XlsxFileEntry {
  path: string;
  content: string;
}

/**
 * Generate all XLSX files
 */
export function generateXlsxFiles(workbook: WorkbookModel): XlsxFileEntry[] {
  const files: XlsxFileEntry[] = [];

  // Shared strings
  const { table: sharedStrings, xml: sharedStringsXml } = buildSharedStrings(workbook);

  // [Content_Types].xml
  files.push({
    path: '[Content_Types].xml',
    content: generateContentTypes(workbook.sheets.length)
  });

  // _rels/.rels
  files.push({
    path: '_rels/.rels',
    content: generateRootRels()
  });

  // xl/workbook.xml
  files.push({
    path: 'xl/workbook.xml',
    content: generateWorkbook(workbook)
  });

  // xl/_rels/workbook.xml.rels
  files.push({
    path: 'xl/_rels/workbook.xml.rels',
    content: generateWorkbookRels(workbook.sheets.length)
  });

  // xl/sharedStrings.xml
  files.push({
    path: 'xl/sharedStrings.xml',
    content: sharedStringsXml
  });

  // xl/styles.xml
  files.push({
    path: 'xl/styles.xml',
    content: generateStyles()
  });

  // xl/worksheets/sheetN.xml
  workbook.sheets.forEach((sheet, index) => {
    files.push({
      path: `xl/worksheets/sheet${index + 1}.xml`,
      content: generateWorksheet(sheet, sharedStrings)
    });
  });

  return files;
}

/**
 * Create XLSX blob using browser APIs
 */
export async function createXlsxBlob(workbook: WorkbookModel): Promise<Blob> {
  const files = generateXlsxFiles(workbook);

  // Use fflate library for ZIP compression
  // For now, we'll import it dynamically
  const { zip } = await import('fflate');

  // Convert files to fflate format
  const zipFiles: Record<string, Uint8Array> = {};

  files.forEach(file => {
    const encoder = new TextEncoder();
    zipFiles[file.path] = encoder.encode(file.content);
  });

  // Create ZIP
  return new Promise((resolve, reject) => {
    zip(zipFiles, { level: 6 }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(new Blob([data as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }));
      }
    });
  });
}
