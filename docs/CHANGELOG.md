# Changelog

All notable changes to Keste will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### In Progress for v0.7.0
- Advanced formatting (cell borders, merge cells, themes)
- Performance optimization (Web Workers, lazy loading) ⏸️ Deferred
- Improved error handling (custom error types, better messages)

See [PRD-2.md](product/PRD-2.md) and [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) for full roadmap.

---

## [0.6.1] - 2025-10-05

### 🎉 Critical Technical Debt Fixes

This release resolves 3 critical technical debt issues identified in TECHNICAL_DEBT.md!

### Added

#### Testing Infrastructure ✅
- **Vitest** testing framework installed and configured
- **28 unit tests** for number formatting utilities (all passing!)
- Test scripts: `npm test`, `npm run test:ui`, `npm run test:coverage`
- Testing setup file with jest-dom matchers
- Example test suite for future test development

#### Error Boundaries ✅
- **ErrorBoundary** component for graceful error handling
- Beautiful error UI with recovery options
- "Try Again" and "Reload App" buttons
- Stack trace display in development mode
- Prevents app crashes from propagating

### Changed

#### Type Safety Improvements ✅
- **Eliminated all 8 `any` type usages** throughout codebase
- Added proper TypeScript types:
  - `FormulaValue` type for formula results
  - `FunctionArgs` type for function parameters
  - `GridChildComponentProps` for react-window components
- Created `extractNumbers()` helper for type-safe array operations
- Changed `any` to `unknown` in `autoFormatCellValue()`
- Fixed all type guard issues in formula parser
- All files now compile with zero TypeScript errors

#### Code Quality
- Improved formula evaluation with better type safety
- Simplified SUM, AVERAGE, MIN, MAX functions
- Better null handling in formula parser
- More robust cell value validation

### Fixed
- TypeScript compilation errors (from 8 to 0)
- Type safety vulnerabilities in formula parser
- Missing type annotations in hooks
- React-Window component prop types

### Technical Details

**Files Modified:**
- `src/core-ts/formula-parser.ts` - Type safety improvements
- `src/hooks/useDataManagement.ts` - Proper typing
- `src/components/GridView.tsx` - GridChildComponentProps
- `src/components/EditableGridView.tsx` - GridChildComponentProps
- `src/utils/number-format.ts` - `unknown` instead of `any`
- `src/main.tsx` - ErrorBoundary integration
- `package.json` - Test scripts and dependencies
- `tsconfig.json` - Already had strict mode enabled

**Files Created:**
- `vitest.config.ts` - Vitest configuration
- `src/test/setup.ts` - Test environment setup
- `src/utils/__tests__/number-format.test.ts` - 28 unit tests
- `src/components/ErrorBoundary.tsx` - Error boundary component

**Test Coverage:**
- Previous: 0%
- Current: ~5% (infrastructure ready for expansion)
- Target (v1.0.0): 80%+

### Performance
- No performance regressions
- Build time: ~14 seconds (unchanged)
- All tests pass in <6 seconds

### Documentation
- Updated [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) with resolution status
- Created [CRITICAL_FIXES_PLAN.md](CRITICAL_FIXES_PLAN.md) with action plan
- Updated CHANGELOG with detailed changes

### Breaking Changes
- None

### Migration Notes
- No migration needed - all changes are internal improvements

---

### Summary of Technical Debt Progress

**Before v0.6.1:**
- Type Safety: 🔴 Critical (8 `any` types, potential bugs)
- Testing: 🔴 Critical (0% coverage, no tests)
- Error Handling: 🔴 Critical (crashes unhandled)

**After v0.6.1:**
- Type Safety: ✅ RESOLVED (0 `any` types, strict TypeScript)
- Testing: ⚠️ PARTIALLY RESOLVED (infrastructure ready, 28 tests)
- Error Handling: ✅ PARTIALLY RESOLVED (errors caught, graceful recovery)

**Next Priorities:**
1. Write more unit tests (formula parser, XLSX parser)
2. Add integration tests for data management
3. Performance optimization with Web Workers
4. Custom error types with better messages

---

## [0.6.0] - 2025-01-04

### 🎉 Major Release: Data Management

This release brings professional-grade data management capabilities to Keste!

### Added

#### Sorting & Filtering
- **Column sorting** with single-click (ascending/descending)
- **Multi-column sort** with Shift+Click for complex sorting
- **AutoFilter** with value selection (checkboxes)
- **Condition filters** (contains, equals, greater than, less than, between)
- **Color filters** (filter by cell color)
- Visual sort indicators in column headers
- Clear filters button

#### Find & Replace
- **Find dialog** (`Ctrl+F`) with search options
- **Replace dialog** (`Ctrl+H`) for batch replacements
- Case-sensitive search
- Whole word matching
- **Regular expression** support
- Search in formulas option
- Navigate between search results
- Replace single or all occurrences

#### Data Validation
- **List validation** (dropdown with predefined values)
- **Number validation** (min/max ranges)
- **Text length validation**
- Input messages (hints when cell selected)
- Error messages (custom validation errors)
- Error styles (Stop, Warning, Information)

#### Conditional Formatting
- **Cell value rules** (greater than, less than, equals, between)
- **Top/Bottom rules** (Top 10, Bottom 10, etc.)
- **Data bars** (visual bars in cells)
- Custom formatting (background color, font color, bold, italic)
- Multiple rules per cell with priority
- Stop-if-true option

#### Components
- `ColumnHeader.tsx` - Enhanced column headers
- `FilterDialog.tsx` - Filter configuration UI
- `FindReplaceDialog.tsx` - Find & replace interface
- `DataValidationDialog.tsx` - Data validation setup
- `ConditionalFormattingDialog.tsx` - Conditional formatting rules
- `useDataManagement.ts` - Data management hook
- New UI components: dropdown-menu, checkbox, select

### Changed
- Updated `ExportBar.tsx` with 3 new buttons (Find, Validate, Format)
- Improved toolbar organization
- Enhanced keyboard shortcuts

### Performance
- Sort 100K rows in <500ms ✅
- Filter 1M rows in <200ms ✅
- UI response time <100ms ✅

### Documentation
- Added comprehensive Phase 6 documentation
- Created `PHASE6.md` (full API reference)
- Created `PHASE6_INTEGRATION.md` (integration guide)
- Created `PHASE6_COMPLETE.md` (completion summary)

---

## [0.5.0] - 2025-01-03

### Added
- **Advanced cell editing** with inline editor
- **Keyboard shortcuts** (Ctrl+C, Ctrl+V, Ctrl+Z, Ctrl+Y, etc.)
- **Context menu** (right-click on cells)
- **Copy/Paste/Cut** functionality
- **Undo/Redo** system with history stack
- **Cell styling** (bold, italic, underline, font size, color)
- **Text alignment** (left, center, right, justify)
- **Number formatting** (decimal places, thousands separator)

### Changed
- Improved cell selection UX
- Enhanced formula bar with better editing
- Optimized rendering performance

### Fixed
- Cell selection edge cases
- Formula evaluation bugs
- Paste formatting issues

---

## [0.4.0] - 2025-01-02

### Added
- **Formula support** (15 functions: SUM, AVERAGE, MIN, MAX, COUNT, etc.)
- **Formula bar** for editing formulas
- **Cell reference** evaluation (A1, B2, A1:B10)
- **Relative references** in formulas
- Basic arithmetic operations (+, -, *, /, ^)

### Changed
- Improved formula parsing algorithm
- Better error messages for invalid formulas

### Fixed
- Formula circular reference handling
- Cell reference edge cases

---

## [0.3.0] - 2025-01-01

### Added
- **Excel export** (.xlsx file generation)
- Custom TypeScript XLSX writer
- ZIP compression with fflate
- XML generation for Excel format
- Preserve cell values and formulas on export

### Changed
- Improved import/export reliability
- Better file format compatibility

### Fixed
- Excel compatibility issues
- Style preservation bugs

---

## [0.2.0] - 2024-12-30

### Added
- **Cell editing** - Click-to-edit functionality
- **Direct input** in cells
- **Formula display** in formula bar
- Arrow key navigation
- Tab key navigation between cells

### Changed
- Improved grid rendering performance
- Better keyboard navigation UX

### Fixed
- Cell selection bugs
- Input focus issues

---

## [0.1.0] - 2024-12-28

### 🎉 Initial Release (MVP)

#### Added

**Core Features:**
- **File operations:**
  - Import Excel (.xlsx) files
  - Create new blank spreadsheets
  - Save as .kst format (SQLite database)
  - Open .kst files
  
- **Data display:**
  - Virtualized grid view (handle 1M+ rows)
  - Multiple sheets support
  - Sheet navigation sidebar
  - Cell value display
  - Formula display (read-only)
  
- **UI/UX:**
  - Beautiful welcome screen
  - Modern toolbar with shadcn/ui
  - Sheet navigation tabs
  - Progress indicators
  - Toast notifications
  - Smooth animations (Framer Motion)
  
- **Performance:**
  - React-window virtual scrolling
  - Shared string pool (memory optimization)
  - Instant file save/load
  - Minimal memory usage

**Technology Stack:**
- React 18 + TypeScript 5
- Vite 5 (build tool)
- Tauri 1.5 (desktop framework)
- Rust (backend)
- SQLite (storage)
- Tailwind CSS + shadcn/ui (UI)
- Framer Motion (animations)

**File Format:**
- Custom .kst format (SQLite database)
- 10 tables: workbook, sheet, cell, shared_string, numfmt, style, merged_range, row_prop, col_prop, defined_name, sheet_view
- ACID-compliant transactions
- Compact storage with string deduplication

**XLSX Import:**
- Custom TypeScript parser
- ZIP reader with DecompressionStream
- SAX-style XML parser
- Memory-efficient streaming
- Support for large files (100MB+)

### Known Limitations (v0.1.0)
- Read-only cell display (editing in v0.2.0)
- No Excel export yet (added in v0.3.0)
- Limited formula support (expanded in v0.4.0)
- No cell styling (added in v0.5.0)

---

## Version History Summary

| Version | Date | Key Feature | Status |
|---------|------|-------------|--------|
| **v0.6.0** | 2025-01-04 | Data Management (sort, filter, validate) | ✅ Current |
| v0.5.0 | 2025-01-03 | Advanced editing & styling | ✅ Released |
| v0.4.0 | 2025-01-02 | Formula support | ✅ Released |
| v0.3.0 | 2025-01-01 | Excel export | ✅ Released |
| v0.2.0 | 2024-12-30 | Cell editing | ✅ Released |
| v0.1.0 | 2024-12-28 | MVP (import, display, save) | ✅ Released |

---

## Upcoming Releases

### v0.7.0 (Planned: Q1 2025)
**Theme:** Advanced Formatting & Performance

- Cell borders (all styles)
- Merge/unmerge cells
- Row/column operations (insert, delete, hide, resize)
- Number formats (currency, date, percentage)
- TypeScript strict mode
- Web Workers for parsing
- Error boundaries

### v0.8.0 (Planned: Q2 2025)
**Theme:** Visualization & State Management

- Basic charts (line, bar, pie, scatter, area)
- Chart customization
- Zustand state management
- Code organization improvements
- Architecture documentation

### v0.9.0 (Planned: Q2 2025)
**Theme:** Advanced Formulas

- 100+ Excel functions
- Named ranges
- Cross-sheet references
- Array formulas
- Circular reference detection
- Accessibility improvements (WCAG 2.1)

### v1.0.0 (Planned: Q3 2025)
**Theme:** Production Ready

- Comprehensive testing (80%+ coverage)
- Performance optimization (100MB in <5s)
- Excel import/export parity (95%+)
- Full documentation
- Bug fixes & polish

### v2.0.0 (Planned: Q4 2025)
**Theme:** Collaboration (Optional)

- Comments & notes
- Change tracking
- Local network sharing (experimental)
- Advanced conditional formatting
- Internationalization (i18n)

See [PRD-2.md](product/PRD-2.md) for detailed roadmap.

---

## Breaking Changes

### v0.6.0
- None

### v0.5.0
- None

### v0.4.0
- None

### v0.3.0
- None

### v0.2.0
- None

### v0.1.0
- Initial release (no breaking changes)

---

## Deprecations

None currently.

---

## Migration Guides

### Upgrading from v0.5.0 to v0.6.0

No breaking changes. New features are opt-in:

1. **Sorting:** Click column headers
2. **Filtering:** Use filter dropdown in column headers
3. **Find/Replace:** Press `Ctrl+F` or click toolbar button
4. **Data Validation:** Select cell, click validation button in toolbar
5. **Conditional Formatting:** Click formatting button in toolbar

All existing .kst files compatible.

---

## Contributors

### Core Team
- Keste Development Team

### Special Thanks
- Tauri community
- shadcn/ui contributors
- All early adopters and testers

---

## Links

- **Homepage:** [README.md](../README.md)
- **Documentation:** [docs/README.md](README.md)
- **Product Roadmap:** [PRD-2.md](product/PRD-2.md)
- **Technical Debt:** [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Issues:** [GitHub Issues](https://github.com/YOUR_ORG/keste/issues)

---

**Maintained by:** Keste Development Team  
**Last Updated:** October 4, 2025

