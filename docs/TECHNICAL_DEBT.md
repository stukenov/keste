# Technical Debt & Improvements

**Project:** Keste - SQLite-Powered Spreadsheet Editor  
**Version:** v0.6.0  
**Last Updated:** October 4, 2025  
**Status:** Active Development

---

## 📋 Overview

This document tracks known technical debt, code quality issues, architectural concerns, and improvement opportunities in the Keste project. Items are prioritized and categorized for systematic resolution.

---

## 🔴 Critical Priority

### 1. Type Safety Issues ✅ RESOLVED (Oct 5, 2025)

**Problem:**
- Mixed use of `any` types throughout codebase ✅ FIXED
- Incomplete TypeScript strict mode compliance ✅ FIXED
- Missing interface definitions for some data structures ✅ FIXED

**Impact:** Type safety vulnerabilities, potential runtime errors

**Resolution:**
- ✅ Eliminated all 8 `any` type usages
- ✅ Added proper types: `FormulaValue`, `FunctionArgs`
- ✅ Fixed all TypeScript compilation errors
- ✅ `strict: true` already enabled in tsconfig.json
- ✅ All components properly typed with React-Window types

**Files Fixed:**
- ✅ `src/core-ts/formula-parser.ts` - removed `any`, added helper functions
- ✅ `src/hooks/useDataManagement.ts` - proper cell value typing
- ✅ `src/components/GridView.tsx` - GridChildComponentProps
- ✅ `src/components/EditableGridView.tsx` - GridChildComponentProps
- ✅ `src/utils/number-format.ts` - changed `any` to `unknown`

**Original Recommended Action:**
```typescript
// Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

**Estimated Effort:** 2-3 weeks  
**Target Version:** v0.7.0

---

### 2. Testing Coverage ⚠️ PARTIALLY RESOLVED (Oct 5, 2025)

**Problem:**
- ~~**Zero unit tests**~~ ✅ Testing infrastructure set up!
- Unit tests for utility functions ✅ ADDED
- No integration tests for data management features ⏳ TODO
- No E2E tests for user workflows ⏳ TODO
- Current coverage: ~5% (was 0%)

**Progress:**
- ✅ Vitest testing framework installed and configured
- ✅ 28 unit tests created for `number-format.ts` (all passing!)
- ✅ Test scripts added to package.json
- ✅ Testing infrastructure ready for expansion

**Impact:** Bugs slip into production, regression risks, difficult refactoring (PARTIALLY MITIGATED)

**Missing Test Coverage:**
- Formula parser & evaluator
- XLSX import/export logic
- Data validation rules
- Conditional formatting engine
- Sort/Filter algorithms
- Cell reference parsing

**Recommended Action:**
```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/user-event playwright

# Setup test structure
src/
  __tests__/
    unit/
      formula-parser.test.ts
      cell-reference.test.ts
      number-format.test.ts
    integration/
      xlsx-import-export.test.tsx
      data-management.test.tsx
    e2e/
      user-workflows.spec.ts
```

**Coverage Goal:** 80%+ for critical paths  
**Estimated Effort:** 4-6 weeks  
**Target Version:** v1.0.0

---

### 3. Performance Optimization

**Problem:**
- Large file imports (100MB+) are slow
- Memory usage grows with file size
- Formula recalculation not optimized
- No lazy loading for sheets

**Current Metrics:**
- 100MB file import: ~15-20 seconds (target: <5s)
- Memory usage: ~600MB for large files (target: <500MB)
- Formula recalc: Not profiled

**Bottlenecks Identified:**
1. **XLSX Parser:** Synchronous ZIP decompression blocks UI
2. **Cell Rendering:** All cells rendered even if off-screen (partially fixed with virtualization)
3. **Formula Engine:** No dependency graph optimization
4. **State Management:** Full state updates on every change

**Recommended Actions:**

```typescript
// 1. Use Web Workers for parsing
// src/workers/xlsx-parser.worker.ts
self.addEventListener('message', async (e) => {
  const { buffer } = e.data;
  const workbook = await parseXlsxInWorker(buffer);
  self.postMessage({ workbook });
});

// 2. Implement lazy sheet loading
const loadSheet = async (sheetId: string) => {
  if (loadedSheets.has(sheetId)) return;
  const sheet = await fetchSheetFromSQLite(sheetId);
  setLoadedSheets(prev => new Map(prev).set(sheetId, sheet));
};

// 3. Optimize formula dependency graph
class FormulaDependencyGraph {
  private dependencies = new Map<string, Set<string>>();
  
  recalculate(changedCells: Set<string>) {
    const toRecalc = this.getDependents(changedCells);
    // Only recalculate affected cells
  }
}

// 4. Use immer for immutable state updates
import { produce } from 'immer';

const updateCell = produce((draft, { row, col, value }) => {
  draft.cells.set(`${row}-${col}`, { value });
});
```

**Estimated Effort:** 3-4 weeks  
**Target Version:** v0.7.0 (initial), v1.0.0 (complete)

---

## 🟡 High Priority

### 4. Architecture & State Management

**Problem:**
- State scattered across multiple components
- No centralized state management solution
- Props drilling in deep component trees
- Undo/redo implementation tightly coupled

**Current State Flow:**
```
WorkbookViewer (workbook state)
  └─> EditableGridView (edit state)
      └─> EditableCell (local state)
  └─> ExportBar (toolbar state)
  └─> SheetTabs (sheet state)
```

**Issues:**
- State updates cause unnecessary re-renders
- Difficult to implement features like collaborative editing
- Undo/redo stack grows unbounded

**Recommended Action:**

```typescript
// Option 1: Zustand (lightweight, recommended)
import create from 'zustand';

interface WorkbookStore {
  workbook: WorkbookModel | null;
  selectedCell: CellPosition | null;
  undoStack: StateSnapshot[];
  redoStack: StateSnapshot[];
  
  // Actions
  setCellValue: (pos: CellPosition, value: string) => void;
  undo: () => void;
  redo: () => void;
}

const useWorkbookStore = create<WorkbookStore>((set, get) => ({
  workbook: null,
  selectedCell: null,
  undoStack: [],
  redoStack: [],
  
  setCellValue: (pos, value) => set(produce(draft => {
    // Update cell and push to undo stack
  })),
  
  undo: () => set(produce(draft => {
    // Pop from undo stack
  })),
  
  redo: () => set(produce(draft => {
    // Pop from redo stack
  }))
}));

// Option 2: Jotai (atomic state)
import { atom, useAtom } from 'jotai';

const workbookAtom = atom<WorkbookModel | null>(null);
const selectedCellAtom = atom<CellPosition | null>(null);
```

**Benefits:**
- Cleaner component code
- Better performance (selective re-renders)
- Easier testing
- Foundation for advanced features

**Estimated Effort:** 2-3 weeks  
**Target Version:** v0.8.0

---

### 5. XLSX Import/Export Completeness

**Problem:**
- Not all Excel features are preserved
- Custom formats may be lost
- Complex formulas might break
- Charts/images not supported

**Current Support:**
- ✅ Basic cell values
- ✅ Simple formulas
- ✅ Basic styles (font, color, alignment)
- ❌ Charts
- ❌ Images
- ❌ Pivot tables
- ❌ Complex conditional formatting
- ❌ Data validation (partially)
- ❌ VBA macros

**Excel Feature Parity:**
| Feature | Import | Export | Notes |
|---------|--------|--------|-------|
| Cell values | ✅ | ✅ | Complete |
| Formulas | ✅ | ✅ | Basic functions only |
| Cell styles | ✅ | ⚠️ | Partial |
| Merged cells | ✅ | ⚠️ | Import only |
| Charts | ❌ | ❌ | Phase 8 |
| Images | ❌ | ❌ | Future |
| Conditional formatting | ⚠️ | ❌ | Phase 6 (partial) |
| Data validation | ⚠️ | ❌ | Phase 6 (partial) |
| Pivot tables | ❌ | ❌ | Future |
| Named ranges | ❌ | ❌ | Phase 9 |

**Recommended Action:**
- Prioritize export feature parity
- Add Excel compatibility test suite
- Document unsupported features clearly

**Estimated Effort:** 6-8 weeks (phased)  
**Target Version:** v0.8.0 (basic), v1.0.0 (full)

---

### 6. Formula Engine Improvements

**Problem:**
- Limited function library (15 functions vs Excel's 400+)
- No circular reference detection
- No array formulas support
- Performance issues with complex calculations

**Current Functions Supported:**
```
SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, IF, ABS, 
ROUND, CONCATENATE, UPPER, LOWER, LEFT, RIGHT, LEN
```

**Missing Critical Functions:**
```
VLOOKUP, HLOOKUP, INDEX, MATCH, XLOOKUP
SUMIF, SUMIFS, COUNTIF, COUNTIFS, AVERAGEIF
DATE, TODAY, NOW, YEAR, MONTH, DAY
TEXT, VALUE, FIND, SEARCH, SUBSTITUTE
AND, OR, NOT, IFERROR, IFNA
PMT, PV, FV, NPV, IRR
```

**Circular Reference Issue:**
```typescript
// Cell A1: =B1+1
// Cell B1: =A1+1
// ❌ Currently causes infinite loop
```

**Recommended Action:**

```typescript
// 1. Expand function library
import { functionRegistry } from './formula-functions';

functionRegistry.register('VLOOKUP', (lookupValue, tableArray, colIndex, exactMatch) => {
  // Implementation
});

// 2. Add circular reference detection
class CircularReferenceDetector {
  private visited = new Set<string>();
  private stack = new Set<string>();
  
  detect(cellRef: string, formula: string): boolean {
    if (this.stack.has(cellRef)) {
      throw new Error(`Circular reference detected: ${Array.from(this.stack).join(' -> ')} -> ${cellRef}`);
    }
    
    this.stack.add(cellRef);
    const deps = this.extractDependencies(formula);
    
    for (const dep of deps) {
      this.detect(dep, this.getFormula(dep));
    }
    
    this.stack.delete(cellRef);
    return false;
  }
}

// 3. Array formula support
const evaluateArrayFormula = (formula: string, range: Range): CellValue[][] => {
  // Evaluate formula for entire range at once
};
```

**Estimated Effort:** 8-10 weeks  
**Target Version:** v0.9.0

---

## 🟢 Medium Priority

### 7. Code Organization & Modularity

**Problem:**
- Large component files (1000+ lines)
- Mixed concerns (UI + business logic)
- Utility functions scattered across files
- No clear separation of layers

**Examples:**
- `WorkbookViewer.tsx`: ~800 lines (UI + state + logic)
- `EditableGridView.tsx`: ~600 lines (rendering + editing + events)
- `useSpreadsheetEditor.ts`: ~400 lines (multiple concerns)

**Recommended Structure:**

```
src/
├── core/              # Business logic (framework-agnostic)
│   ├── workbook/
│   │   ├── workbook-manager.ts
│   │   ├── sheet-manager.ts
│   │   └── cell-manager.ts
│   ├── formulas/
│   │   ├── parser.ts
│   │   ├── evaluator.ts
│   │   ├── functions/
│   │   └── dependency-graph.ts
│   ├── import-export/
│   │   ├── xlsx-reader.ts
│   │   ├── xlsx-writer.ts
│   │   └── kst-converter.ts
│   └── data-management/
│       ├── sorting.ts
│       ├── filtering.ts
│       └── validation.ts
│
├── components/        # Presentation components (React)
│   ├── workbook/
│   │   ├── WorkbookViewer.tsx
│   │   └── WorkbookToolbar.tsx
│   ├── grid/
│   │   ├── GridView.tsx
│   │   ├── GridCell.tsx
│   │   └── GridHeader.tsx
│   └── dialogs/
│       └── ...
│
├── hooks/             # React hooks (thin wrappers)
│   ├── useWorkbook.ts
│   ├── useSheet.ts
│   └── useCell.ts
│
└── utils/             # Pure utility functions
    ├── cell-reference.ts
    ├── number-format.ts
    └── date-utils.ts
```

**Benefits:**
- Easier testing (core logic isolated)
- Better reusability
- Clearer responsibilities
- Easier onboarding for new developers

**Estimated Effort:** 3-4 weeks  
**Target Version:** v0.8.0

---

### 8. Error Handling & User Feedback ✅ PARTIALLY RESOLVED (Oct 5, 2025)

**Problem:**
- Generic error messages ⏳ TODO
- ~~No error boundaries in React~~ ✅ FIXED
- Crashes prevented ✅ FIXED
- Import errors not user-friendly ⏳ TODO

**Progress:**
- ✅ ErrorBoundary component created and integrated
- ✅ Beautiful error UI with recovery options
- ✅ Errors logged for debugging
- ✅ Stack traces shown in development mode
- ✅ App no longer crashes completely

**Current Experience:**
```typescript
// ❌ Bad
try {
  importFile(file);
} catch (e) {
  console.error(e); // User sees nothing!
}

// ❌ Bad
throw new Error("Invalid cell reference"); // Crashes app
```

**Recommended Improvements:**

```typescript
// ✅ Good - Custom error types
class KestError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public recoverable: boolean = true
  ) {
    super(message);
  }
}

class FileImportError extends KestError {
  constructor(filename: string, reason: string) {
    super(
      `Failed to import ${filename}: ${reason}`,
      'FILE_IMPORT_ERROR',
      `Unable to open "${filename}". ${reason}. Please try a different file.`,
      true
    );
  }
}

// ✅ Good - Error boundaries
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);
    
    if (error instanceof KestError && error.recoverable) {
      // Show user-friendly message
      showToast(error.userMessage, 'error');
    } else {
      // Critical error - show recovery options
      this.setState({ criticalError: true });
    }
  }
  
  render() {
    if (this.state.criticalError) {
      return <CriticalErrorScreen onRecover={this.recover} />;
    }
    return this.props.children;
  }
}

// ✅ Good - User feedback
const importFile = async (file: File) => {
  try {
    setLoading(true);
    setProgress(0);
    
    const workbook = await parseXlsx(file, {
      onProgress: (percent) => setProgress(percent)
    });
    
    showToast(`Successfully imported "${file.name}"`, 'success');
    return workbook;
    
  } catch (error) {
    if (error instanceof FileImportError) {
      showToast(error.userMessage, 'error');
    } else {
      showToast('An unexpected error occurred. Please try again.', 'error');
      logError(error);
    }
    throw error;
  } finally {
    setLoading(false);
  }
};
```

**Estimated Effort:** 1-2 weeks  
**Target Version:** v0.7.0

---

### 9. Accessibility (a11y)

**Problem:**
- Limited keyboard navigation
- Missing ARIA labels
- No screen reader support
- Poor focus management

**Current State:**
- ✅ Basic arrow key navigation
- ✅ Tab between cells
- ❌ No ARIA labels on toolbar buttons
- ❌ Screen reader can't announce cell values
- ❌ Keyboard shortcuts not documented
- ❌ No high contrast mode

**WCAG 2.1 Compliance:** ~40% (estimated)

**Recommended Improvements:**

```typescript
// Add ARIA labels
<button
  onClick={onSave}
  aria-label="Save workbook"
  aria-keyshortcuts="Ctrl+S"
>
  <SaveIcon />
</button>

// Announce cell values to screen reader
<div
  role="gridcell"
  aria-rowindex={row}
  aria-colindex={col}
  aria-label={`${colLetter}${row}: ${cellValue}`}
>
  {cellValue}
</div>

// Focus management
const handleCellEdit = (row: number, col: number) => {
  const cellRef = cellRefs.current[`${row}-${col}`];
  cellRef?.focus();
};

// Keyboard shortcuts help
<KeyboardShortcutsDialog>
  <h2>Keyboard Shortcuts</h2>
  <dl>
    <dt>Ctrl+C</dt><dd>Copy selected cells</dd>
    <dt>Ctrl+V</dt><dd>Paste</dd>
    <dt>Ctrl+Z</dt><dd>Undo</dd>
    <dt>Ctrl+F</dt><dd>Find</dd>
    {/* ... */}
  </dl>
</KeyboardShortcutsDialog>
```

**Target:** WCAG 2.1 Level AA compliance  
**Estimated Effort:** 2-3 weeks  
**Target Version:** v0.9.0

---

### 10. Documentation Gaps

**Problem:**
- Inline code documentation sparse
- No API documentation
- Missing architecture diagrams
- Setup instructions incomplete

**Current Documentation:**
- ✅ README.md (user-facing)
- ✅ SETUP.md (basic)
- ✅ PRD.md, PRD-2.md (product specs)
- ✅ Phase 6 docs (feature-specific)
- ❌ Code documentation (JSDoc/TSDoc)
- ❌ Architecture diagrams
- ❌ Contributing guide
- ❌ API reference

**Recommended Actions:**

```typescript
/**
 * Evaluates a formula and returns the computed value.
 * 
 * @param formula - The formula string (without leading '=')
 * @param context - Cell context with workbook and sheet info
 * @returns The computed value or an error
 * 
 * @example
 * ```typescript
 * const result = evaluateFormula('SUM(A1:A10)', {
 *   workbook,
 *   sheetId: 'sheet1',
 *   row: 5,
 *   col: 3
 * });
 * ```
 * 
 * @throws {CircularReferenceError} If formula creates circular dependency
 * @throws {InvalidReferenceError} If cell reference is invalid
 */
export function evaluateFormula(
  formula: string,
  context: FormulaContext
): CellValue | FormulaError {
  // Implementation
}
```

**Create:**
- `docs/ARCHITECTURE.md` - System design overview
- `docs/API.md` - Public API reference
- `docs/CONTRIBUTING.md` - Contribution guidelines
- `docs/TESTING.md` - Testing strategy
- JSDoc for all public functions

**Estimated Effort:** 2 weeks  
**Target Version:** v0.8.0

---

## 🔵 Low Priority / Future

### 11. Bundle Size Optimization

**Current Bundle:** 466.74 KB (gzipped: 148.42 KB)  
**Target:** <500 KB (gzipped: <150 KB)

**Opportunities:**
- Code splitting by route/feature
- Tree shaking improvements
- Replace heavy dependencies
- Lazy load dialogs

```typescript
// Lazy load dialogs
const FindReplaceDialog = lazy(() => import('./FindReplaceDialog'));
const DataValidationDialog = lazy(() => import('./DataValidationDialog'));

// Code split by feature
const routes = [
  {
    path: '/workbook',
    component: lazy(() => import('./WorkbookViewer'))
  }
];
```

**Estimated Effort:** 1 week  
**Target Version:** v1.0.0

---

### 12. Internationalization (i18n)

**Current State:** Hardcoded English strings

**Future Support:**
- UI translations (en, es, fr, de, ru, zh, ja)
- Locale-aware number formats
- Date/time localization
- RTL support (Arabic, Hebrew)

```typescript
import { useTranslation } from 'react-i18next';

const Toolbar = () => {
  const { t } = useTranslation();
  
  return (
    <button>{t('toolbar.save')}</button>
  );
};
```

**Estimated Effort:** 3-4 weeks  
**Target Version:** v2.0.0

---

### 13. Collaboration Features (Future)

**Phase 11 (PRD-2.md):**
- Comments & notes
- Change tracking
- Local network sharing
- Real-time co-editing

**Technical Challenges:**
- Conflict resolution (OT or CRDT)
- WebRTC/WebSocket infrastructure
- User presence indicators
- Permissions system

**Estimated Effort:** 12-16 weeks  
**Target Version:** v2.0.0

---

## 📊 Priority Matrix

| Issue | Priority | Impact | Effort | Target |
|-------|----------|--------|--------|--------|
| Type Safety | 🔴 Critical | High | 2-3w | v0.7.0 |
| Testing | 🔴 Critical | High | 4-6w | v1.0.0 |
| Performance | 🔴 Critical | High | 3-4w | v0.7.0 |
| State Management | 🟡 High | Medium | 2-3w | v0.8.0 |
| XLSX Parity | 🟡 High | High | 6-8w | v1.0.0 |
| Formula Engine | 🟡 High | High | 8-10w | v0.9.0 |
| Code Organization | 🟢 Medium | Medium | 3-4w | v0.8.0 |
| Error Handling | 🟢 Medium | Medium | 1-2w | v0.7.0 |
| Accessibility | 🟢 Medium | Medium | 2-3w | v0.9.0 |
| Documentation | 🟢 Medium | Low | 2w | v0.8.0 |
| Bundle Size | 🔵 Low | Low | 1w | v1.0.0 |
| i18n | 🔵 Low | Low | 3-4w | v2.0.0 |
| Collaboration | 🔵 Future | High | 12-16w | v2.0.0 |

---

## 🎯 Recommended Roadmap

### v0.7.0 (Next Release) - 4-6 weeks
1. ✅ Enable TypeScript strict mode
2. ✅ Implement error boundaries
3. ✅ Performance optimization (Web Workers, lazy loading)
4. ✅ Advanced formatting features (borders, merge cells)

### v0.8.0 - 6-8 weeks
1. ✅ Refactor to centralized state management (Zustand)
2. ✅ Code organization improvements
3. ✅ Charts & visualization (basic)
4. ✅ Documentation (architecture, API)

### v0.9.0 - 8-10 weeks
1. ✅ Expand formula library (100+ functions)
2. ✅ Circular reference detection
3. ✅ Named ranges, cross-sheet references
4. ✅ Accessibility improvements

### v1.0.0 (Production Ready) - 4-6 weeks
1. ✅ Comprehensive testing (80%+ coverage)
2. ✅ Excel import/export parity
3. ✅ Performance targets met
4. ✅ Bug fixes & polish

### v2.0.0 (Future) - 12-16 weeks
1. ✅ Collaboration features
2. ✅ Advanced conditional formatting
3. ✅ Internationalization
4. ✅ Plugin system

---

## 📝 Notes

### Decision Log

**2025-10-04:** Created technical debt document  
- Identified 13 major areas of improvement
- Prioritized based on impact and effort
- Aligned with product roadmap

### Future Considerations

- **Mobile Support:** Tauri mobile for iOS/Android (post v2.0)
- **Cloud Sync:** Optional encrypted cloud storage (post v2.0)
- **Plugin System:** Extension API for custom functions (post v2.0)
- **AI Features:** Formula suggestions, data insights (experimental)

---

## 🤝 Contributing

When working on technical debt:

1. **Create an issue** referencing this document
2. **Link to specific section** (e.g., "Addresses #7: Code Organization")
3. **Write tests** for your improvements
4. **Update this document** when debt is resolved
5. **Document decisions** in commit messages

---

**Document Owner:** Keste Development Team  
**Review Cycle:** Monthly  
**Next Review:** November 4, 2025

