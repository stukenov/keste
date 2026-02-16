# Keste Architecture

**Version:** v0.6.0  
**Last Updated:** October 4, 2025  
**Status:** Living Document

---

## 📐 System Overview

Keste is a desktop spreadsheet editor built with a hybrid architecture:
- **Frontend:** React + TypeScript (UI & business logic)
- **Backend:** Rust + Tauri (file system access, SQLite operations)
- **Storage:** SQLite database (.kst format)
- **Import/Export:** Custom TypeScript XLSX parser/writer

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Keste Desktop App                        │
│                        (Tauri)                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              React Frontend (TypeScript)            │    │
│  │                                                     │    │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐  │    │
│  │  │ Components  │  │    Hooks     │  │  Utils   │  │    │
│  │  │   (UI)      │  │  (State &    │  │ (Helpers)│  │    │
│  │  │             │  │   Logic)     │  │          │  │    │
│  │  └─────────────┘  └──────────────┘  └──────────┘  │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         Core Business Logic (TypeScript)      │  │    │
│  │  │                                               │  │    │
│  │  │  • XLSX Parser/Writer (ZIP + XML)            │  │    │
│  │  │  • Formula Parser & Evaluator                │  │    │
│  │  │  • Data Management (Sort, Filter, Validate)  │  │    │
│  │  │  • Cell Reference Resolution                 │  │    │
│  │  │  • Number Formatting                          │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  └─────────────────┬───────────────────────────────────┘    │
│                    │                                        │
│                    │ Tauri IPC Commands                     │
│                    ▼                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Rust Backend (src-tauri/)                 │   │
│  │                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │   │
│  │  │ File System  │  │   SQLite     │  │  Tauri   │  │   │
│  │  │   Access     │  │   Writer     │  │  Core    │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   File System    │
                  │                  │
                  │  • .xlsx files   │
                  │  • .kst files    │
                  │    (SQLite DB)   │
                  └──────────────────┘
```

---

## 🧩 Component Architecture

### Frontend Layer (React + TypeScript)

```
src/
├── components/              # React UI Components
│   ├── WorkbookViewer.tsx   # Main app container
│   ├── EditableGridView.tsx # Spreadsheet grid (virtualized)
│   ├── EditableCell.tsx     # Individual cell editor
│   ├── FormulaBar.tsx       # Formula input bar
│   ├── SheetTabs.tsx        # Sheet navigation tabs
│   ├── ExportBar.tsx        # Toolbar with actions
│   │
│   ├── ColumnHeader.tsx     # Column header (Phase 6)
│   ├── FilterDialog.tsx     # Filter configuration
│   ├── FindReplaceDialog.tsx # Find/Replace UI
│   ├── DataValidationDialog.tsx # Validation rules
│   ├── ConditionalFormattingDialog.tsx # Formatting rules
│   │
│   └── ui/                  # shadcn/ui primitives
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ...
│
├── hooks/                   # Custom React Hooks
│   ├── useSpreadsheetEditor.ts  # Main editing logic
│   ├── useDataManagement.ts     # Sort/Filter/Validate (Phase 6)
│   └── ...
│
├── core-ts/                 # Pure TypeScript Business Logic
│   ├── types.ts             # Core data structures
│   ├── editor-types.ts      # Editor-specific types
│   ├── style-types.ts       # Style definitions
│   ├── data-management-types.ts # Phase 6 types
│   │
│   ├── read_xlsx.ts         # XLSX import parser
│   ├── write_xlsx.ts        # XLSX export writer
│   ├── zip.ts               # ZIP compression/decompression
│   ├── xml_sax.ts           # SAX-style XML parser
│   │
│   ├── formula-parser.ts    # Formula tokenizer & evaluator
│   ├── sql_dump.ts          # SQLite dump generator
│   └── ...
│
└── utils/                   # Utility functions
    ├── number-format.ts     # Number formatting (Excel compatible)
    └── ...
```

---

### Backend Layer (Rust + Tauri)

```
src-tauri/
├── src/
│   ├── main.rs              # Tauri app initialization
│   ├── cmds.rs              # IPC command handlers
│   └── sqlite_writer.rs     # SQLite database writer
│
├── Cargo.toml               # Rust dependencies
└── tauri.conf.json          # Tauri configuration
```

**Key Dependencies:**
- `rusqlite` - SQLite bindings
- `serde` - Serialization/deserialization
- `tauri` - Desktop framework

---

## 🔄 Data Flow

### 1. File Import (.xlsx → .kst)

```
User selects .xlsx file
         ↓
Frontend: File picker dialog (Tauri API)
         ↓
Frontend: readXlsxToModel(buffer)
         ├─> ZIP decompression
         ├─> XML parsing (SAX-style)
         ├─> Build WorkbookModel
         └─> Return parsed model
         ↓
Frontend: generateSqlDump(model)
         └─> Generate SQL INSERT statements
         ↓
Backend: save_sqlite(sql, path)  [Rust IPC]
         └─> Execute SQL on SQLite database
         ↓
.kst file saved ✅
```

### 2. File Export (.kst → .xlsx)

```
User clicks "Export Excel"
         ↓
Frontend: Get current WorkbookModel
         ↓
Frontend: writeXlsx(model)
         ├─> Generate XML files (workbook.xml, sheet1.xml, styles.xml, etc.)
         ├─> ZIP compression (fflate)
         └─> Return .xlsx blob
         ↓
Backend: choose_save_file() [Rust IPC]
         └─> Show save dialog, get path
         ↓
Frontend: Save blob to path
         ↓
.xlsx file saved ✅
```

### 3. Cell Editing

```
User clicks cell
         ↓
EditableCell: Enter edit mode
         ↓
User types value/formula
         ↓
User presses Enter
         ↓
useSpreadsheetEditor: setCellValue()
         ├─> Update workbook state
         ├─> If formula: Parse & evaluate
         ├─> Push to undo stack
         └─> Trigger re-render
         ↓
Display updated value ✅
```

### 4. Formula Evaluation

```
Cell has formula: "=SUM(A1:A10)"
         ↓
formula-parser.ts: tokenize()
         └─> Tokens: [FUNCTION, LPAREN, RANGE, RPAREN]
         ↓
formula-parser.ts: parse()
         └─> AST: { type: 'function', name: 'SUM', args: [...] }
         ↓
formula-parser.ts: evaluate()
         ├─> Resolve range A1:A10 → [1, 2, 3, ...]
         ├─> Call SUM function
         └─> Return result: 55
         ↓
Display result: 55 ✅
```

### 5. Sorting & Filtering (Phase 6)

```
User clicks column header
         ↓
ColumnHeader: onSort(col, order)
         ↓
useDataManagement: setSortForColumn(col, order)
         └─> Update sort state
         ↓
useDataManagement: applySorting(cells)
         ├─> Extract values from cells
         ├─> Sort by specified column
         └─> Return sorted cell map
         ↓
EditableGridView: Render sorted cells ✅
```

---

## 💾 Data Model

### WorkbookModel (TypeScript)

```typescript
interface WorkbookModel {
  metadata: WorkbookMetadata;
  sheets: SheetModel[];
  sharedStrings: Map<number, string>;
  numFmts: Map<number, NumFmt>;
  styles: StyleModel[];
}

interface SheetModel {
  id: string;
  name: string;
  order: number;
  cells: Map<string, CellModel>;  // key: "row-col"
  mergedRanges: MergedRange[];
  rowProps: Map<number, RowProperties>;
  colProps: Map<number, ColProperties>;
  sheetView: SheetView;
}

interface CellModel {
  row: number;
  col: number;
  type: 'n' | 's' | 'b' | 'e' | 'str' | 'inlineStr';
  value: string | number | boolean | null;
  formula?: string;
  styleId?: number;
}
```

### SQLite Schema (.kst format)

```sql
-- Metadata
CREATE TABLE workbook (
  id INTEGER PRIMARY KEY,
  name TEXT,
  created_at TEXT,
  modified_at TEXT
);

-- Sheets
CREATE TABLE sheet (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sheet_order INTEGER NOT NULL,
  workbook_id INTEGER REFERENCES workbook(id)
);

-- Cells
CREATE TABLE cell (
  id INTEGER PRIMARY KEY,
  sheet_id TEXT REFERENCES sheet(id),
  row INTEGER NOT NULL,
  col INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('n', 's', 'b', 'e', 'str', 'inlineStr')),
  value TEXT,
  formula TEXT,
  style_id INTEGER,
  UNIQUE(sheet_id, row, col)
);

CREATE INDEX idx_cell_position ON cell(sheet_id, row, col);

-- Shared strings (deduplication)
CREATE TABLE shared_string (
  id INTEGER PRIMARY KEY,
  value TEXT NOT NULL UNIQUE
);

-- Number formats
CREATE TABLE numfmt (
  id INTEGER PRIMARY KEY,
  format_code TEXT NOT NULL
);

-- Styles
CREATE TABLE style (
  id INTEGER PRIMARY KEY,
  numfmt_id INTEGER,
  font_id INTEGER,
  fill_id INTEGER,
  border_id INTEGER,
  alignment TEXT  -- JSON
);

-- Merged cells
CREATE TABLE merged_range (
  id INTEGER PRIMARY KEY,
  sheet_id TEXT REFERENCES sheet(id),
  start_row INTEGER,
  start_col INTEGER,
  end_row INTEGER,
  end_col INTEGER
);

-- Row properties
CREATE TABLE row_prop (
  sheet_id TEXT REFERENCES sheet(id),
  row INTEGER,
  height REAL,
  hidden INTEGER DEFAULT 0,
  PRIMARY KEY (sheet_id, row)
);

-- Column properties
CREATE TABLE col_prop (
  sheet_id TEXT REFERENCES sheet(id),
  col INTEGER,
  width REAL,
  hidden INTEGER DEFAULT 0,
  PRIMARY KEY (sheet_id, col)
);

-- Named ranges
CREATE TABLE defined_name (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  sheet_id TEXT REFERENCES sheet(id),
  UNIQUE(name, sheet_id)
);

-- Sheet view settings
CREATE TABLE sheet_view (
  sheet_id TEXT PRIMARY KEY REFERENCES sheet(id),
  freeze_row INTEGER DEFAULT 0,
  freeze_col INTEGER DEFAULT 0,
  zoom INTEGER DEFAULT 100
);
```

---

## 🔌 Tauri IPC Commands

Communication between frontend (TypeScript) and backend (Rust):

### Rust Commands (src-tauri/src/cmds.rs)

```rust
#[tauri::command]
pub fn choose_open_file() -> Result<String, String> {
    // Opens native file picker, returns file path
}

#[tauri::command]
pub fn choose_save_file(default_name: String) -> Result<String, String> {
    // Opens native save dialog, returns file path
}

#[tauri::command]
pub fn save_sqlite(sql_dump: String, out_path: String) -> Result<SaveResult, String> {
    // Executes SQL dump to create .kst SQLite database
    // Returns bytes written
}
```

### Frontend Usage (TypeScript)

```typescript
import { invoke } from '@tauri-apps/api/tauri';

// Open file picker
const filePath = await invoke<string>('choose_open_file');

// Save SQLite database
const result = await invoke<{ bytesWritten: number }>('save_sqlite', {
  sqlDump: sqlStatements,
  outPath: '/path/to/file.kst'
});
```

---

## 🧠 State Management

### Current Approach (v0.6.0)

**Props & useState:**
- State lives in parent components
- Passed down via props
- Local state for UI-only concerns

**Example:**
```typescript
// WorkbookViewer.tsx (top-level state)
const [workbook, setWorkbook] = useState<WorkbookModel | null>(null);
const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);

// Passed to children
<EditableGridView 
  workbook={workbook}
  selectedCell={selectedCell}
  onCellSelect={setSelectedCell}
/>
```

**Limitations:**
- Props drilling
- Unnecessary re-renders
- Difficult to scale

### Future Approach (v0.8.0+)

See [TECHNICAL_DEBT.md#4-architecture--state-management](TECHNICAL_DEBT.md#4-architecture--state-management) for planned improvements (Zustand or Jotai).

---

## ⚡ Performance Optimizations

### 1. Virtual Scrolling (react-window)

Only render visible cells:

```typescript
<FixedSizeGrid
  columnCount={1000}
  rowCount={100000}
  columnWidth={100}
  rowHeight={30}
  height={600}
  width={800}
>
  {Cell}
</FixedSizeGrid>
```

**Result:** Handle 1M+ rows without lag

### 2. Memoization

```typescript
// Expensive computation cached
const sortedCells = useMemo(() => {
  return applySorting(cells, sorts);
}, [cells, sorts]);

// Component only re-renders when props change
const Cell = memo(({ row, col, value, style }: CellProps) => {
  return <div style={style}>{value}</div>;
});
```

### 3. Shared String Pool

Deduplicate repeated strings:

```typescript
// Instead of storing "Yes" 10,000 times:
cells: [
  { value: "Yes" }, { value: "Yes" }, ...
]

// Store once in shared pool:
sharedStrings: Map<number, string> = {
  0: "Yes"
}
cells: [
  { type: 's', value: 0 }, { type: 's', value: 0 }, ...
]
```

**Result:** 50-70% memory reduction for text-heavy sheets

### 4. Lazy Loading (Future)

Load sheets on-demand:

```typescript
// Only load active sheet
const loadSheet = async (sheetId: string) => {
  if (!loadedSheets.has(sheetId)) {
    const sheet = await fetchSheetFromSQLite(sheetId);
    setLoadedSheets(prev => new Map(prev).set(sheetId, sheet));
  }
};
```

---

## 🧪 Testing Strategy

See [TECHNICAL_DEBT.md#2-testing-coverage](TECHNICAL_DEBT.md#2-testing-coverage) for full strategy.

**Test Pyramid:**

```
      ╱─────────────╲
     ╱  E2E Tests    ╲    10%  (Playwright)
    ╱─────────────────╲
   ╱ Integration Tests ╲  20%  (React Testing Library)
  ╱─────────────────────╲
 ╱    Unit Tests         ╲ 70%  (Vitest)
╱─────────────────────────╲
```

**Coverage Goal:** 80%+ for critical paths

---

## 📦 Build & Deployment

### Development Build

```bash
# Frontend only (web mode)
npm run dev
# → http://localhost:1420

# Full Tauri app
npm run tauri dev
# → Native window
```

### Production Build

```bash
npm run tauri build
```

**Output:**
- **Windows:** `src-tauri/target/release/keste.exe`
- **macOS:** `src-tauri/target/release/bundle/macos/Keste.app`
- **Linux:** `src-tauri/target/release/bundle/appimage/keste.AppImage`

**Bundle Size:**
- Frontend: ~466 KB (gzipped: ~148 KB)
- Backend: ~5 MB (Rust binary)
- Total: ~5.5 MB

---

## 🔒 Security Model

### Tauri Security

1. **No Node.js runtime** - Avoids supply chain attacks
2. **Strict CSP** - Content Security Policy enforced
3. **Limited IPC** - Only exposed commands accessible
4. **Sandboxing** - OS-level process isolation

### File Access

```rust
// Only user-selected files accessible
let path = choose_open_file()?; // Native dialog
read_file(path)?; // ✅ Allowed

// Direct path access blocked
read_file("/etc/passwd")?; // ❌ Requires user consent
```

### No Network Access

- Zero network permissions
- No telemetry or tracking
- All operations local

---

## 🚀 Future Architecture Improvements

See [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) for details:

1. **State Management** - Zustand/Jotai (v0.8.0)
2. **Web Workers** - Offload parsing (v0.7.0)
3. **IndexedDB** - Browser-based temp storage (v0.8.0)
4. **Code Splitting** - Lazy load features (v1.0.0)
5. **Micro-frontends** - Modular architecture (v2.0.0)

---

## 📚 References

- **Tauri Architecture:** [tauri.app/architecture](https://tauri.app/v1/references/architecture/)
- **React Architecture:** [react.dev/learn/thinking-in-react](https://react.dev/learn/thinking-in-react)
- **XLSX Format:** [ECMA-376 Standard](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/)
- **SQLite Design:** [sqlite.org/arch.html](https://www.sqlite.org/arch.html)

---

**Last Updated:** October 4, 2025  
**Version:** v0.6.0  
**Maintained by:** Keste Development Team

