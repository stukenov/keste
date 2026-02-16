# Product Requirements Document: Keste v2.0

**Advanced Features & Enhancements Roadmap**

Version: 2.0.0
Last Updated: 2025-01-04
Status: Planning Phase

---

## Executive Summary

Keste v1.0 успешно реализовал базовый функционал редактора электронных таблиц с поддержкой SQLite, формул и форматирования. **PRD-2** определяет путь развития продукта до уровня профессионального инструмента, способного конкурировать с Google Sheets и Excel.

### Текущее состояние (v0.5.0)
- ✅ Базовое редактирование ячеек
- ✅ Формулы (15+ функций)
- ✅ Форматирование (шрифт, цвет, выравнивание)
- ✅ Импорт/экспорт Excel
- ✅ SQLite хранилище (.kst)
- ✅ Keyboard shortcuts
- ✅ Context menu

### Цели v2.0
- 📊 **Data Power**: Сортировка, фильтры, условное форматирование, проверка данных
- 📈 **Visualization**: Чарты и графики
- 🔗 **References**: Ссылки между листами, именованные диапазоны
- 🎨 **Advanced Styling**: Границы, темы, форматы чисел, merge cells
- ⚡ **Performance**: Виртуализация, ленивая загрузка, оптимизация больших файлов
- 🤝 **Collaboration**: Комментарии, история изменений, конфликт-резолюшн (опционально)

---

## Table of Contents

1. [Phase 6: Data Management (v0.6.0)](#phase-6-data-management)
2. [Phase 7: Advanced Formatting (v0.7.0)](#phase-7-advanced-formatting)
3. [Phase 8: Visualization & Charts (v0.8.0)](#phase-8-visualization--charts)
4. [Phase 9: Formulas & References (v0.9.0)](#phase-9-formulas--references)
5. [Phase 10: Performance & Scale (v1.0.0)](#phase-10-performance--scale)
6. [Phase 11: Collaboration (v2.0.0)](#phase-11-collaboration)
7. [Technical Debt & Improvements](#technical-debt--improvements)
8. [Quality Assurance](#quality-assurance)
9. [Future Considerations](#future-considerations)

---

## Phase 6: Data Management (v0.6.0)

**Goal: Excel-like data manipulation capabilities**

### 6.1 Sorting & Filtering

#### 6.1.1 Column Sorting
**Priority: High**

**Features:**
- Single-column sort (A→Z, Z→A)
- Multi-column sort with priority
- Sort by cell color/font color
- Custom sort order
- Preserve row integrity

**Acceptance Criteria:**
- [ ] Click column header to sort
- [ ] Shift+Click for multi-column sort
- [ ] Sort dialog with custom options
- [ ] Undo/Redo support for sorting
- [ ] Performance: 100K rows in <500ms

**UI Components:**
```
- Sort button in column header
- Sort dialog (multi-level sort)
- Visual indicator for sorted columns
```

#### 6.1.2 AutoFilter
**Priority: High**

**Features:**
- Filter by values (checkboxes)
- Filter by condition (equals, contains, greater than, etc.)
- Filter by color
- Search in filter
- Clear filters
- Filter indicator

**Acceptance Criteria:**
- [ ] Filter dropdown in header
- [ ] Multiple filters active simultaneously
- [ ] Filter status visible in UI
- [ ] Quick filter shortcuts
- [ ] Performance: Filter 1M rows in <200ms

**UI Components:**
```
- Filter dropdown menu
- Filter chip indicators
- "Clear all filters" button
```

### 6.2 Find & Replace

**Priority: Medium**

**Features:**
- Find text in cells
- Find formulas
- Case-sensitive search
- Whole word match
- Replace single/all
- Find next/previous
- Regex support (advanced)

**Acceptance Criteria:**
- [ ] Ctrl+F opens find dialog
- [ ] Ctrl+H opens replace dialog
- [ ] Highlight all matches
- [ ] Navigate between results
- [ ] Replace with undo support

**UI Components:**
```
- Find dialog (floating)
- Replace dialog
- Match counter
- Navigation arrows
```

### 6.3 Data Validation

**Priority: Medium**

**Features:**
- Dropdown lists
- Number ranges
- Date ranges
- Text length
- Custom formulas
- Input message
- Error alert styles

**Acceptance Criteria:**
- [ ] Set validation rules per cell/range
- [ ] Validation on paste
- [ ] Invalid data highlighting
- [ ] Custom error messages
- [ ] Circle invalid data

**UI Components:**
```
- Data validation dialog
- Dropdown arrow in validated cells
- Error message popover
- Invalid data indicators
```

### 6.4 Conditional Formatting

**Priority: High**

**Features:**
- Highlight cells rules (greater than, between, etc.)
- Top/Bottom rules
- Data bars
- Color scales
- Icon sets
- Custom formula rules

**Acceptance Criteria:**
- [ ] Visual rule builder
- [ ] Live preview
- [ ] Multiple rules per cell
- [ ] Rule priority/order
- [ ] Performance: Apply to 100K cells in <300ms

**UI Components:**
```
- Conditional formatting toolbar button
- Rules manager dialog
- Rule preview
- Color/icon pickers
```

---

## Phase 7: Advanced Formatting (v0.7.0)

**Goal: Professional-grade visual customization**

### 7.1 Cell Borders

**Priority: High**

**Features:**
- Border styles (thin, medium, thick, double, dashed, dotted)
- Border colors
- Presets (all borders, outside, inside)
- Individual side control
- Diagonal borders

**Acceptance Criteria:**
- [ ] Border picker in toolbar
- [ ] Quick border presets
- [ ] Custom border dialog
- [ ] Border painter tool
- [ ] Excel import/export compatibility

**UI Components:**
```
- Border picker dropdown
- Border style gallery
- Color picker
- Painter tool mode
```

### 7.2 Number Formats

**Priority: High**

**Features:**
- General, Number, Currency, Accounting
- Date/Time formats (locale-aware)
- Percentage, Fraction, Scientific
- Text format
- Custom format codes
- Format preview

**Acceptance Criteria:**
- [ ] Format dropdown in toolbar
- [ ] Common formats quick-access
- [ ] Custom format builder
- [ ] Locale support (en-US, ru-RU, etc.)
- [ ] Format auto-detection

**UI Components:**
```
- Number format dropdown
- Format gallery
- Custom format dialog
- Format preview
```

### 7.3 Merge & Split Cells

**Priority: Medium**

**Features:**
- Merge cells (horizontal, vertical, all)
- Merge & center
- Unmerge cells
- Visual indicators
- Formula behavior in merged cells

**Acceptance Criteria:**
- [ ] Merge button in toolbar
- [ ] Merge options menu
- [ ] Merged cell selection handling
- [ ] Navigation in merged regions
- [ ] Excel compatibility

### 7.4 Row & Column Operations

**Priority: High**

**Features:**
- Insert rows/columns
- Delete rows/columns
- Hide/Show rows/columns
- Resize (manual + auto-fit)
- Freeze panes
- Split window

**Acceptance Criteria:**
- [ ] Right-click context menu
- [ ] Toolbar buttons
- [ ] Drag to resize
- [ ] Double-click to auto-fit
- [ ] Freeze panes UI indicator

### 7.5 Themes & Styles

**Priority: Low**

**Features:**
- Predefined themes
- Cell styles (Heading 1, Total, etc.)
- Theme colors
- Theme fonts
- Custom themes

**Acceptance Criteria:**
- [ ] Theme picker
- [ ] Apply theme to workbook
- [ ] Style gallery
- [ ] Custom style creation

---

## Phase 8: Visualization & Charts (v0.8.0)

**Goal: Data visualization capabilities**

### 8.1 Chart Types

**Priority: High**

**Chart Types:**
1. **Column & Bar Charts**
   - Clustered, Stacked, 100% Stacked
   - Horizontal bar variants

2. **Line Charts**
   - Line, Line with markers
   - Stacked line, 100% Stacked

3. **Pie & Donut Charts**
   - Pie, Exploded pie
   - Donut

4. **Area Charts**
   - Area, Stacked area

5. **Scatter & Bubble**
   - Scatter plot
   - Bubble chart

6. **Combo Charts**
   - Column + Line
   - Custom combinations

**Acceptance Criteria:**
- [ ] Chart creation wizard
- [ ] Data range selector
- [ ] Chart customization panel
- [ ] Chart styles & colors
- [ ] Export chart as image

### 8.2 Chart Customization

**Features:**
- Chart title, axis titles
- Legend position
- Data labels
- Gridlines
- Colors & styles
- Axis min/max/scale
- Chart area formatting

**Acceptance Criteria:**
- [ ] Live preview
- [ ] Drag & drop chart elements
- [ ] Format panel
- [ ] Chart templates

### 8.3 Sparklines

**Priority: Medium**

**Features:**
- Line sparklines
- Column sparklines
- Win/Loss sparklines
- In-cell mini charts

**Acceptance Criteria:**
- [ ] Insert sparkline
- [ ] Sparkline customization
- [ ] Color themes
- [ ] Min/Max markers

---

## Phase 9: Formulas & References (v0.9.0)

**Goal: Advanced formula capabilities**

### 9.1 Extended Formula Library

**Priority: High**

**New Functions (100+ total):**

**Text Functions:**
- CONCATENATE, TEXTJOIN, LEFT, RIGHT, MID
- TRIM, SUBSTITUTE, REPLACE, FIND, SEARCH
- TEXT, VALUE, UPPER, LOWER, PROPER

**Date/Time:**
- TODAY, NOW, DATE, TIME, YEAR, MONTH, DAY
- HOUR, MINUTE, SECOND, WEEKDAY, WORKDAY
- DATEDIF, EDATE, EOMONTH

**Lookup & Reference:**
- VLOOKUP, HLOOKUP, INDEX, MATCH
- XLOOKUP (modern), CHOOSE, OFFSET
- INDIRECT, ROW, COLUMN

**Statistical:**
- AVERAGE, MEDIAN, MODE, STDEV, VAR
- PERCENTILE, QUARTILE, RANK
- COUNTIF, COUNTIFS, SUMIF, SUMIFS, AVERAGEIF

**Logical:**
- AND, OR, NOT, XOR
- IFERROR, IFNA, IFS, SWITCH

**Math:**
- MOD, QUOTIENT, GCD, LCM
- CEILING, FLOOR, MROUND, TRUNC
- RAND, RANDBETWEEN

**Financial:**
- PMT, PV, FV, RATE, NPER
- NPV, IRR, XIRR

### 9.2 Array Formulas

**Priority: Medium**

**Features:**
- Ctrl+Shift+Enter syntax
- Spill arrays (dynamic arrays)
- Array functions (SORT, FILTER, UNIQUE)
- Multi-cell results

**Acceptance Criteria:**
- [ ] Array formula support
- [ ] Spill range indicator
- [ ] Array-aware calculations
- [ ] Performance optimization

### 9.3 Named Ranges

**Priority: High**

**Features:**
- Create named range
- Edit/Delete names
- Scope (workbook/sheet)
- Use names in formulas
- Name manager

**Acceptance Criteria:**
- [ ] Name box dropdown
- [ ] Name manager dialog
- [ ] Auto-suggest names in formulas
- [ ] Navigate to named range
- [ ] Excel import/export

### 9.4 Cross-Sheet References

**Priority: High**

**Features:**
- Reference other sheets: `=Sheet2!A1`
- 3D references: `=SUM(Sheet1:Sheet3!A1)`
- External workbook references (future)

**Acceptance Criteria:**
- [ ] Click-to-select across sheets
- [ ] Sheet name auto-complete
- [ ] Update references on sheet rename
- [ ] Visual indicators

### 9.5 Formula Auditing

**Priority: Medium**

**Features:**
- Trace precedents (arrows)
- Trace dependents (arrows)
- Show formulas mode
- Error checking
- Evaluate formula step-by-step

**Acceptance Criteria:**
- [ ] Formula auditing toolbar
- [ ] Visual trace arrows
- [ ] Error indicators
- [ ] Formula inspector

---

## Phase 10: Performance & Scale (v1.0.0)

**Goal: Handle massive datasets efficiently**

### 10.1 Large File Optimization

**Priority: Critical**

**Targets:**
- Load 100MB+ files in <5 seconds
- Support 1M+ rows smoothly
- Memory usage <500MB for typical workbooks

**Techniques:**
- Lazy loading (load visible sheets only)
- Virtual scrolling (already implemented)
- Cell pooling (reuse DOM nodes)
- Incremental formula calculation
- Web Workers for parsing/calculation
- IndexedDB for temporary storage

**Acceptance Criteria:**
- [ ] Benchmark suite
- [ ] Load time <5s for 100MB
- [ ] Scroll 60fps with 1M rows
- [ ] Background calculation
- [ ] Progress indicators

### 10.2 Formula Calculation Engine

**Priority: High**

**Improvements:**
- Dependency graph optimization
- Dirty cell tracking
- Parallel calculation (Web Workers)
- Calculation chain optimization
- Volatile function handling

**Acceptance Criteria:**
- [ ] Recalc 10K formulas in <100ms
- [ ] Incremental recalculation
- [ ] Avoid circular references
- [ ] Manual calculation mode

### 10.3 Memory Management

**Priority: High**

**Features:**
- Cell data compression
- Shared string pool
- Style deduplication
- Garbage collection hints
- Memory profiling tools

**Acceptance Criteria:**
- [ ] Memory usage profiling
- [ ] Reduce memory by 30%+
- [ ] No memory leaks
- [ ] Efficient undo/redo

### 10.4 File Format Optimization

**Priority: Medium**

**Improvements:**
- SQLite indexing optimization
- Compressed blobs for large values
- Incremental save (delta)
- Auto-save drafts
- File corruption recovery

**Acceptance Criteria:**
- [ ] Save time <2s for 50MB
- [ ] Incremental save support
- [ ] Auto-save every 30s
- [ ] Recovery mode

---

## Phase 11: Collaboration (v2.0.0)

**Goal: Enable team workflows (optional advanced feature)**

### 11.1 Comments & Notes

**Priority: High**

**Features:**
- Cell comments
- Comment threads
- Mentions (@user)
- Comment indicators
- Show/Hide comments
- Comment history

**Acceptance Criteria:**
- [ ] Right-click → Add comment
- [ ] Comment indicator (triangle)
- [ ] Comment popover
- [ ] Rich text in comments
- [ ] Delete/Edit comments

### 11.2 Change Tracking

**Priority: Medium**

**Features:**
- Track changes mode
- Review changes UI
- Accept/Reject changes
- Change history log
- Blame view (who changed what)

**Acceptance Criteria:**
- [ ] Enable track changes
- [ ] Visual change indicators
- [ ] Review panel
- [ ] Change log export

### 11.3 Local Network Sharing (Future)

**Priority: Low**

**Features:**
- Share file on local network
- Real-time collaboration
- Conflict detection
- Merge strategies
- User cursors & selections

**Technical Notes:**
- WebRTC or WebSocket
- Operational Transformation (OT) or CRDT
- Local-first architecture

---

## Technical Debt & Improvements

### Code Quality

**Refactoring Needed:**
1. **Type Safety**
   - Strict TypeScript mode
   - Remove `any` types
   - Complete interface coverage

2. **Testing**
   - Unit tests (Vitest)
   - Integration tests (Testing Library)
   - E2E tests (Playwright)
   - Target: 80%+ coverage

3. **Performance**
   - Bundle size optimization (<500KB gzipped)
   - Code splitting
   - Tree shaking
   - Lazy component loading

4. **Accessibility**
   - ARIA labels
   - Keyboard navigation improvements
   - Screen reader support
   - High contrast mode

### Architecture Improvements

1. **State Management**
   - Consider Zustand/Jotai for global state
   - Optimize re-renders
   - Memoization strategy

2. **Formula Engine**
   - Separate library
   - Better error handling
   - Circular reference detection
   - Performance profiling

3. **XLSX Import/Export**
   - Complete feature parity
   - Better error handling
   - Streaming for large files
   - ZIP optimization

4. **Database Layer**
   - SQLite query optimization
   - Indexes for performance
   - Migration system
   - Backup/restore utilities

---

## Quality Assurance

### Testing Strategy

**Unit Tests:**
- Formula evaluator (all functions)
- Cell reference parsing
- Number formatting
- Date/Time utilities
- Style merging

**Integration Tests:**
- Import/Export workflows
- Undo/Redo stack
- Multi-sheet operations
- Formula dependencies

**E2E Tests:**
- User workflows
- File operations
- Keyboard shortcuts
- Context menus

**Performance Tests:**
- Load time benchmarks
- Scroll performance
- Formula calculation speed
- Memory usage profiling

### Browser Compatibility

**Target:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Testing:**
- Cross-browser manual testing
- Automated browser tests
- Mobile responsiveness (future)

---

## Future Considerations

### v3.0 and Beyond

**Potential Features:**

1. **AI Integration**
   - Formula suggestions
   - Data insights
   - Auto-formatting
   - Natural language queries

2. **Advanced Data Types**
   - Images in cells
   - Checkboxes
   - Dropdowns (data validation)
   - Hyperlinks
   - Rich text

3. **Macros & Automation**
   - JavaScript-based macros
   - Event triggers
   - Custom functions
   - API/webhook integration

4. **Mobile Apps**
   - iOS app (Tauri mobile)
   - Android app
   - Responsive web version

5. **Cloud Sync (Optional)**
   - Encrypted cloud storage
   - Multi-device sync
   - Selective sync
   - Offline-first

6. **Plugin System**
   - Extension API
   - Custom functions
   - UI extensions
   - Theme marketplace

---

## Implementation Priority Matrix

### Must Have (v1.0)
1. Sorting & Filtering
2. Number formats
3. Cell borders
4. Row/column operations
5. Extended formula library
6. Named ranges
7. Cross-sheet references
8. Performance optimization

### Should Have (v1.5)
1. Conditional formatting
2. Data validation
3. Find & Replace
4. Charts (basic types)
5. Formula auditing
6. Merge cells
7. Comments

### Nice to Have (v2.0+)
1. Advanced charts
2. Sparklines
3. Themes
4. Change tracking
5. Collaboration
6. Advanced data types

---

## Success Metrics (v2.0)

### Performance KPIs
- Load 100MB file: <5 seconds
- Scroll performance: 60fps with 1M rows
- Formula calculation: 10K formulas in <100ms
- Memory usage: <500MB for typical workbook
- Save time: <2s for 50MB file

### Feature Completeness
- Excel import fidelity: >95%
- Excel export fidelity: >95%
- Formula coverage: 100+ functions
- Chart types: 10+ types
- Keyboard shortcuts: 50+ shortcuts

### Quality Metrics
- Test coverage: >80%
- TypeScript strict mode: 100%
- Bundle size: <500KB gzipped
- Accessibility score: >90 (Lighthouse)
- Bug rate: <5 critical bugs per release

### User Experience
- Time to first edit: <5 seconds
- Keyboard-only navigation: 100% features
- Context menu coverage: All common actions
- Tooltip coverage: 100% buttons
- Error messages: Clear and actionable

---

## Roadmap Timeline

**v0.6.0 - Data Management** (6-8 weeks)
- Sorting & Filtering
- Find & Replace
- Basic data validation

**v0.7.0 - Advanced Formatting** (4-6 weeks)
- Cell borders
- Number formats
- Merge cells
- Row/column operations

**v0.8.0 - Visualization** (8-10 weeks)
- Basic charts (5 types)
- Chart customization
- Export charts

**v0.9.0 - Advanced Formulas** (6-8 weeks)
- Extended function library (100+ functions)
- Named ranges
- Cross-sheet references
- Array formulas

**v1.0.0 - Performance & Polish** (4-6 weeks)
- Performance optimization
- Testing & bug fixes
- Documentation
- Marketing website

**v2.0.0 - Collaboration** (12-16 weeks)
- Comments
- Change tracking
- Conditional formatting (advanced)
- Advanced charts

---

## Conclusion

Keste v2.0 представляет собой амбициозный план развития продукта от базового редактора до профессионального инструмента. Фокус на производительность, полноту функционала и user experience обеспечит конкурентоспособность с лидерами рынка.

**Core Principles:**
1. **Privacy First** - данные пользователя всегда под его контролем
2. **Performance** - мгновенный отклик даже на больших файлах
3. **Compatibility** - бесшовная работа с Excel
4. **Simplicity** - интуитивный интерфейс без обучения
5. **Extensibility** - готовность к будущим расширениям

**Next Steps:**
1. Review and approve PRD-2
2. Prioritize v0.6.0 features
3. Create detailed technical design docs
4. Begin implementation

---

**Document Version:** 2.0
**Last Updated:** January 4, 2025
**Status:** Draft for Review
**Owner:** Keste Development Team
