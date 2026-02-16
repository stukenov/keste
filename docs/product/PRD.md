# Product Requirements Document: Keste

**Modern Spreadsheet Editor Powered by SQLite**

Version: 0.1.0
Last Updated: 2025-01-03
Status: In Development

---

## 1. Product Vision

### 1.1 Overview

**Keste** — это современный редактор электронных таблиц для десктопа, который использует SQLite в качестве формата хранения данных вместо традиционных XLSX файлов. Продукт позиционируется как **privacy-first, offline-first** альтернатива Google Sheets с акцентом на производительность, безопасность данных и удобство использования.

### 1.2 Core Value Proposition

- **Privacy First**: 100% offline работа, данные никогда не покидают устройство пользователя
- **SQLite-Powered**: Производительность базы данных + возможность SQL-запросов к данным
- **Google Sheets UX**: Знакомый и интуитивный интерфейс
- **Cross-Platform**: Windows, macOS, Linux
- **Fast & Lightweight**: Мгновенные операции, минимальное потребление ресурсов

### 1.3 Target Audience

**Primary Personas:**

1. **Privacy-Conscious Professional**
   - Работает с конфиденциальными данными
   - Не доверяет облачным решениям
   - Нужен функционал Google Sheets без отправки данных в облако

2. **Data Analyst / Engineer**
   - Работает с большими объёмами данных
   - Нужна возможность SQL-запросов к таблицам
   - Требует быстрой обработки миллионов строк

3. **Offline Worker**
   - Работает без постоянного доступа к интернету
   - Нужен надёжный локальный редактор
   - Требует совместимость с Excel

---

## 2. Goals & Success Metrics

### 2.1 Version 0.1.0 (MVP) Goals

**Goal 1: Core Viewer & Storage** (Week 1-2)
- ✅ Импорт .xlsx файлов
- ✅ Создание новых пустых таблиц
- ✅ Просмотр данных в grid view
- ✅ Сохранение в .kst формат (SQLite)

**Metrics:**
- Импорт 50 МБ XLSX ≤ 10 секунд
- Потребление RAM ≤ 300 МБ
- Zero network requests
- UI response time < 100ms

**Goal 2: Modern UI** (Week 1)
- ✅ Beautiful welcome screen
- ✅ Google Sheets-inspired interface
- ✅ Smooth animations
- ✅ Responsive design

**Metrics:**
- User satisfaction > 4/5
- Time to first action < 30 seconds
- Zero UI lag on typical operations

### 2.2 Version 0.2.0 Goals (Cell Editing) - ✅ DONE

**Goal: Full Editing Capabilities**
- ✅ Click-to-edit cells
- ✅ Formula editing & evaluation
- ✅ Copy/paste/cut support
- ✅ Undo/redo functionality
- ✅ Keyboard navigation

**Metrics:**
- Edit latency < 50ms
- Formula calculation < 100ms
- Support 100+ concurrent edits/sec

### 2.3 Version 0.3.0 Goals (Excel Export) - ✅ DONE

**Goal: Bidirectional Excel Compatibility**
- ✅ Export to valid .xlsx files
- ✅ Preserve cell values and formulas
- ✅ Basic Excel compatibility
- ✅ ZIP-based XLSX format

---

## 3. User Stories & Scenarios

### 3.1 Primary User Flows

**Flow 1: Create New Spreadsheet**
```
User Story: "As a user, I want to create a new spreadsheet from scratch"

1. Launch Keste
2. Click "New Spreadsheet" on welcome screen
3. Empty spreadsheet opens with Sheet1
4. User can view grid (editing in v0.2.0)
5. User saves as .kst file
```

**Flow 2: Import Excel File**
```
User Story: "As a user, I want to import my existing Excel files"

1. Launch Keste
2. Drag & drop .xlsx file OR click "Import File"
3. File is parsed (progress shown)
4. Data appears in grid view
5. User can navigate sheets
6. User saves as .kst format
```

**Flow 3: View & Navigate Data**
```
User Story: "As a user, I want to view and navigate large spreadsheets"

1. Open .kst or .xlsx file
2. Grid view shows data with virtualization
3. User scrolls through millions of rows smoothly
4. User switches between sheets via sidebar
5. User sees formulas, formatting, merged cells
```

**Flow 4: Save & Export**
```
User Story: "As a user, I want to save my work in different formats"

1. After viewing/editing
2. Click "Save .kst" → saves in native SQLite format
3. OR click "Export Excel" → exports to .xlsx (v0.3.0)
4. File is saved atomically (no corruption risk)
```

### 3.2 Edge Cases

- **Large Files**: 100+ MB XLSX files
- **Complex Formulas**: Nested functions, array formulas
- **Special Characters**: Unicode, emojis, RTL text
- **Corrupted Files**: Graceful error handling
- **Disk Full**: Clear error messages

---

## 4. Features & Scope

### 4.1 In Scope (MVP - v0.1.0)

**✅ File Operations**
- Import .xlsx files
- Create new spreadsheets
- Save as .kst (SQLite format)
- Open .kst files

**✅ Data Display**
- Virtualized grid view (react-window)
- Multiple sheets support
- Sheet navigation sidebar
- Cell value display
- Formula display (read-only)

**✅ UI/UX**
- Welcome screen with branding
- Modern toolbar
- Sheet navigation
- Progress indicators
- Toast notifications
- Smooth animations

**✅ Performance**
- Handle 1M+ rows
- Instant file save/load
- Minimal memory usage
- No UI lag

### 4.2 In Scope (v0.2.0 - Cell Editing)

**⏳ Editing Capabilities**
- Click-to-edit cells
- Formula bar
- Formula evaluation
- Copy/paste
- Cut/paste
- Undo/redo stack
- Keyboard shortcuts (Arrow keys, Enter, Tab, Esc)

**⏳ Data Entry**
- Number formatting
- Date/time input
- Text overflow
- Cell references
- Auto-complete

### 4.3 In Scope (v0.3.0 - Excel Export)

**⏳ Export Features**
- Generate valid .xlsx files
- Preserve cell values
- Preserve formulas
- Preserve formatting
- Preserve styles
- Preserve merged cells

### 4.4 Out of Scope (Future Versions)

**🔄 v0.4.0+**
- Charts & graphs
- Pivot tables
- Conditional formatting
- Data validation
- Macros/VBA
- Images & drawings
- Comments & notes
- Collaboration features
- Cloud sync
- Mobile apps
- Web version

---

## 5. Technical Architecture

### 5.1 Technology Stack

**Frontend:**
- React 18 (UI framework)
- TypeScript 5 (type safety)
- Vite 5 (build tool)
- Tailwind CSS (styling)
- shadcn/ui (component library)
- Framer Motion (animations)
- react-window (virtualization)

**Backend:**
- Rust (systems programming)
- Tauri 1.5 (desktop framework)
- rusqlite 0.30 (SQLite bindings)

**Data Processing:**
- Custom TypeScript XLSX parser
- ZIP reader (DecompressionStream API)
- SAX-style XML parser
- SQLite storage engine

### 5.2 File Format: .kst

**.kst** = SQLite database with predefined schema

**Database Schema:**

```sql
-- Core tables
workbook         -- Metadata
sheet            -- Sheet info (name, ID, order)
cell             -- Cell data (row, col, type, value, formula)
shared_string    -- String deduplication pool
numfmt           -- Number format definitions
style            -- Cell styles (fonts, colors, borders)

-- Advanced tables
merged_range     -- Merged cell ranges
row_prop         -- Row properties (height, hidden)
col_prop         -- Column properties (width, hidden)
defined_name     -- Named ranges
sheet_view       -- Freeze panes, zoom, etc.
```

**Benefits:**
- ACID transactions
- Instant queries with SQL
- Compact storage
- Fast read/write
- Industry standard format

### 5.3 Architecture Diagram

```
┌─────────────────────────────────────────┐
│           Keste Application             │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   React UI   │◄──►│  Tauri Core  │  │
│  │  TypeScript  │    │     Rust     │  │
│  └──────────────┘    └──────────────┘  │
│         │                    │          │
│         │                    │          │
│  ┌──────▼──────┐      ┌──────▼──────┐  │
│  │ XLSX Parser │      │  rusqlite   │  │
│  │ (zip + xml) │      │   SQLite    │  │
│  └─────────────┘      └─────────────┘  │
│                                         │
└─────────────────────────────────────────┘
         │                      │
         ▼                      ▼
    .xlsx files            .kst files
                         (SQLite DB)
```

### 5.4 IPC Commands (Tauri)

**Renderer → Rust:**

```rust
choose_open_file() -> String
choose_save_file(defaultName: String) -> String
save_sqlite(sqlDump: String, outPath: String) -> {bytesWritten}
```

**Renderer (TypeScript):**

```typescript
readXlsxToModel(buffer: ArrayBuffer) -> WorkbookModel
generateSqlDump(model: WorkbookModel) -> AsyncIterable<string>
```

---

## 6. UI/UX Specifications

### 6.1 Welcome Screen

**Layout:**
- Large Keste logo (gradient emerald-to-teal)
- Tagline: "Modern Spreadsheet Editor"
- Two action cards:
  - "New Spreadsheet" (green button)
  - "Import File" (drag & drop zone)
- Three feature badges at bottom

**Interactions:**
- Click "New Spreadsheet" → creates empty workbook
- Drag .xlsx file → imports and opens
- Click "Import File" → file picker dialog

### 6.2 Main Editor Screen

**Toolbar (Top):**
- Keste logo + branding (left)
- Progress bar (center, when active)
- "Save .kst" button (right)
- "Export Excel" button (right)
- Menu button (left)

**Sidebar (Left):**
- Sheet list
- Sheet switcher
- Cell count per sheet

**Main Area (Center):**
- Virtualized grid
- Column headers (A, B, C...)
- Row headers (1, 2, 3...)
- Scrollbars

**Status Bar (Bottom, v0.2.0):**
- Cell reference (e.g., "A1")
- Cell type
- Formula bar

### 6.3 Design System

**Colors:**
- Primary: `hsl(142, 76%, 36%)` (Emerald green)
- Secondary: `hsl(174, 70%, 40%)` (Teal)
- Background: `hsl(0, 0%, 100%)` (White)
- Text: `hsl(222, 84%, 5%)` (Dark slate)

**Typography:**
- Headings: System fonts, 600 weight
- Body: System fonts, 400 weight
- Code: Monospace for formulas

**Spacing:**
- Base unit: 4px
- Grid: 8px system

**Animations:**
- Duration: 200-300ms
- Easing: ease-out
- Subtle, purposeful motion

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| File import (50 MB) | ≤ 10 sec | Time from file select to display |
| Memory usage | ≤ 300 MB | Peak RAM during import |
| UI response time | < 100 ms | Click to action |
| Scroll FPS | ≥ 60 FPS | Virtual grid scrolling |
| File save | < 2 sec | .kst file write |

### 7.2 Reliability

- **Data Integrity**: Atomic file writes (temp → rename)
- **Crash Recovery**: Auto-save drafts every 30 sec (v0.2.0)
- **Error Handling**: Graceful failures with clear messages
- **File Validation**: Check .xlsx/.kst file integrity

### 7.3 Security

- **No Network**: Zero network permissions
- **No Telemetry**: Zero data collection
- **Sandboxing**: Tauri security model enforced
- **CSP**: Strict Content Security Policy
- **File Access**: Limited to user-selected files

### 7.4 Compatibility

**Platforms:**
- Windows 10+ (x64, ARM64)
- macOS 12+ (Intel, Apple Silicon)
- Linux (Ubuntu 22.04+, Fedora 38+)

**File Formats:**
- Import: .xlsx (Excel 2007+)
- Native: .kst (SQLite 3.x)
- Export: .xlsx (v0.3.0)

### 7.5 Accessibility

- Keyboard navigation (v0.2.0)
- Screen reader support (v0.4.0)
- High contrast mode (v0.4.0)
- Scalable fonts

---

## 8. Development Plan

### 8.1 Phase 1: MVP (v0.1.0) - ✅ DONE

**Week 1-2:**
- ✅ Tauri project setup
- ✅ React + TypeScript + Tailwind
- ✅ shadcn/ui components
- ✅ Welcome screen
- ✅ XLSX parser (ZIP + XML)
- ✅ SQLite writer (Rust)
- ✅ Grid view with virtualization
- ✅ Sheet navigation
- ✅ Save .kst functionality

### 8.2 Phase 2: Editing (v0.2.0) - ✅ DONE

**Week 3:**
- ✅ Click-to-edit cell implementation
- ✅ Input component with validation
- ✅ Formula bar component
- ✅ Keyboard event handlers

**Week 4:**
- ✅ Formula parser & evaluator
- ✅ Cell reference resolution
- ✅ Copy/paste/cut functionality
- ✅ Undo/redo stack

**Week 5:**
- ✅ Keyboard shortcuts
- ✅ Number formatting utilities
- ✅ Testing & bug fixes
- ✅ Performance optimization

### 8.3 Phase 3: Excel Export (v0.3.0) - ✅ DONE

**Week 6-7:**
- ✅ XLSX writer implementation
- ✅ XML generation (workbook, worksheets, styles, sharedStrings)
- ✅ ZIP assembly with fflate
- ✅ Cell value and formula preservation

**Week 8:**
- ✅ Excel compatibility testing
- ✅ Export integration
- ✅ Documentation updated

### 8.4 Phase 4: Advanced Features (v0.4.0+) - Future

- Charts & graphs
- Pivot tables
- Conditional formatting
- Data validation
- Collaboration (optional)

---

## 9. Testing Strategy

### 9.1 Unit Tests

**TypeScript:**
- Cell reference parsing (A1, AB123)
- Formula evaluation
- ZIP/XML parsing
- SQL generation

**Rust:**
- SQLite operations
- File I/O
- IPC handlers

### 9.2 Integration Tests

- XLSX import → .kst save → reload
- Multi-sheet handling
- Large file processing
- Error recovery

### 9.3 E2E Tests (Playwright)

- User flow: New spreadsheet
- User flow: Import .xlsx
- User flow: Save .kst
- User flow: Edit cells (v0.2.0)

### 9.4 Test Data

- Small: 10 rows × 5 columns
- Medium: 10K rows × 20 columns
- Large: 1M rows × 100 columns
- Complex: Formulas, merges, styles

---

## 10. Success Criteria

### 10.1 MVP (v0.1.0) Acceptance

- ✅ Imports .xlsx files (10-100 MB) in < 10 sec
- ✅ Creates new blank spreadsheets
- ✅ Displays data in grid view
- ✅ Navigates between sheets
- ✅ Saves .kst files successfully
- ✅ Works 100% offline
- ✅ Zero crashes on standard operations
- ✅ Beautiful, modern UI

### 10.2 v0.2.0 Acceptance

- ✅ Can edit any cell
- ✅ Formulas calculate correctly
- ✅ Copy/paste/cut works
- ✅ Undo/redo works
- ✅ Keyboard navigation works
- ✅ Performance targets met

### 10.3 v0.3.0 Acceptance

- ✅ Exports valid .xlsx files
- ✅ Preserves cell values and formulas
- ✅ Basic formatting preserved
- ✅ Compatible with Excel/LibreOffice

---

## 11. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Large file OOM | High | Medium | Streaming parser, chunked processing |
| Formula complexity | High | High | Incremental feature rollout, use library |
| Excel compatibility | Medium | High | Extensive testing, standard compliance |
| Performance degradation | Medium | Low | Profiling, optimization, Rust backend |
| UI complexity | Low | Medium | shadcn/ui, proven patterns |

---

## 12. Future Roadmap

### v0.5.0 - Advanced Formatting
- Cell borders
- Background colors
- Font styles
- Number formatting

### v0.6.0 - Charts
- Line charts
- Bar charts
- Pie charts
- Scatter plots

### v1.0.0 - Production Ready
- Full Excel compatibility
- Professional-grade stability
- Comprehensive documentation
- Marketing website

### v2.0.0 - Collaboration (Optional)
- Local network sharing
- Real-time co-editing
- Conflict resolution
- Version history

---

## 13. Conclusion

**Keste** представляет собой современную альтернативу облачным таблицам с фокусом на **приватность, производительность и удобство**. Используя SQLite в качестве формата хранения, мы получаем преимущества баз данных (скорость, надёжность, queryability) с привычным UX электронных таблиц.

**Core Differentiators:**
1. 🔒 100% offline & private
2. ⚡ SQLite-powered performance
3. 🎨 Modern, beautiful UI
4. 🚀 Fast, lightweight, responsive

**Next Steps:**
1. Complete v0.1.0 testing
2. Begin v0.2.0 development (cell editing)
3. Gather user feedback
4. Iterate and improve

---

**Document Version:** 1.0
**Last Updated:** January 3, 2025
**Status:** Active Development
