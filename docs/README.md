# Keste Documentation

Welcome to the Keste documentation! This directory contains all project documentation, specifications, and guides.

---

## ✅ FORMULA ENGINE FIXED

**Formula Engine Investigation - October 5, 2025 - RESOLVED**

**Problem:** Формулы возвращали неправильные результаты (0 вместо суммы)  
**Root Cause:** Несоответствие индексации между workbook (1-based) и HyperFormula (0-based)  
**Solution:** Добавлена конвертация индексов `hfRow = row - 1`

### Documentation:
- 📋 [**Debug Summary**](FORMULA_DEBUG_SUMMARY.md) - Полное решение
- 🔬 [Investigation Report](FORMULA_ENGINE_INVESTIGATION.md) - Техническая документация
- 🧪 [Testing Instructions](FORMULA_TESTING_INSTRUCTIONS.md) - Как тестировалось

**Status:** ✅ RESOLVED  
**Result:** Все 380+ функций Excel теперь работают корректно!

---

## 📚 Quick Links

| Document | Description | Audience |
|----------|-------------|----------|
| [User Guide](../README.md) | How to use Keste | End Users |
| [Setup Guide](SETUP.md) | Installation & development setup | Developers |
| [Architecture](ARCHITECTURE.md) | System design & architecture | Developers |
| [Technical Debt](TECHNICAL_DEBT.md) | Known issues & improvements | Developers |
| [Development Mode](DEV_MODE.md) | Development workflow tips | Developers |

---

## 📖 Documentation Structure

```
docs/
├── README.md                          # This file - documentation index
├── SETUP.md                           # Installation and setup guide
├── DEV_MODE.md                        # Development mode tips
├── ARCHITECTURE.md                    # System architecture (TODO)
├── TECHNICAL_DEBT.md                  # Technical debt tracking
│
├── product/                           # Product specifications
│   ├── PRD.md                        # Product Requirements v1.0
│   ├── PRD-2.md                      # Product Requirements v2.0
│   └── ROADMAP.md                    # Product roadmap
│
├── phases/                            # Phase implementation docs
│   ├── PHASE6.md                     # Phase 6: Data Management
│   ├── PHASE6_INTEGRATION.md         # Phase 6 integration guide
│   ├── PHASE6_COMPLETE.md            # Phase 6 completion summary
│   └── PHASE6_SUMMARY.txt            # Phase 6 quick summary
│
└── api/                               # API documentation (TODO)
    └── API_REFERENCE.md              # API reference (TODO)
```

---

## 🎯 Documentation by Role

### For End Users
- **[Main README](../README.md)** - What is Keste, features, quick start
- **[Setup Guide](SETUP.md)** - How to install and run Keste

### For Developers
- **[Setup Guide](SETUP.md)** - Development environment setup
- **[Development Mode](DEV_MODE.md)** - Tips for efficient development
- **[Technical Debt](TECHNICAL_DEBT.md)** - Known issues to work on
- **[Phase 6 Docs](phases/)** - Latest feature implementation details

### For Product Managers
- **[PRD v1.0](product/PRD.md)** - Initial product requirements (v0.1-0.5)
- **[PRD v2.0](product/PRD-2.md)** - Advanced features roadmap (v0.6-2.0)
- **[Technical Debt](TECHNICAL_DEBT.md)** - Engineering constraints

### For Contributors
- **CONTRIBUTING.md** (TODO) - How to contribute
- **CODE_OF_CONDUCT.md** (TODO) - Community guidelines
- **[Technical Debt](TECHNICAL_DEBT.md)** - Areas that need help

---

## 🚀 Getting Started

### New to Keste?
1. Read the [Main README](../README.md) to understand the project
2. Follow the [Setup Guide](SETUP.md) to get it running
3. Check [Development Mode](DEV_MODE.md) for productivity tips

### Want to Contribute?
1. Review [Technical Debt](TECHNICAL_DEBT.md) for issues to work on
2. Read relevant [Phase Documentation](phases/) for context
3. Check [PRD-2.md](product/PRD-2.md) for future features

### Need Technical Details?
1. **Architecture:** See `ARCHITECTURE.md` (coming soon)
2. **API Reference:** See `api/API_REFERENCE.md` (coming soon)
3. **Phase Docs:** See `phases/` for implementation details

---

## 📋 Document Index

### Core Documentation

#### [SETUP.md](SETUP.md)
Installation instructions for all platforms (Windows, macOS, Linux). Covers:
- Prerequisites (Node.js, Rust, platform-specific tools)
- Development setup
- Building for production
- Troubleshooting

#### [DEV_MODE.md](DEV_MODE.md)
Development workflow tips:
- Using web mode vs Tauri dev mode
- Hot module replacement
- Performance tips
- Common issues

#### [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md)
Comprehensive technical debt tracking:
- Type safety issues
- Missing tests
- Performance bottlenecks
- Architecture improvements
- Prioritization matrix
- Roadmap alignment

---

### Product Documentation

#### [product/PRD.md](product/PRD.md)
**Product Requirements Document v1.0**

Covers versions 0.1.0 - 0.5.0:
- Product vision and goals
- Target audience
- Features (file operations, editing, formatting)
- Technology stack
- Success metrics
- Development phases 1-5

#### [product/PRD-2.md](product/PRD-2.md)
**Product Requirements Document v2.0**

Covers versions 0.6.0 - 2.0.0:
- Phase 6: Data Management (sorting, filtering, validation)
- Phase 7: Advanced Formatting (borders, themes, merge cells)
- Phase 8: Visualization & Charts
- Phase 9: Formulas & References (100+ functions)
- Phase 10: Performance & Scale
- Phase 11: Collaboration (future)

---

### Phase Documentation

#### [phases/PHASE6.md](phases/PHASE6.md)
**Phase 6: Data Management - Full Documentation**

Complete API reference for:
- Column sorting (single & multi-column)
- AutoFilter (value, condition, color)
- Find & Replace (with regex)
- Data Validation (list, number, text length)
- Conditional Formatting (cell value, top/bottom, data bars)

Includes:
- API examples
- Component documentation
- Type definitions
- Usage patterns

#### [phases/PHASE6_INTEGRATION.md](phases/PHASE6_INTEGRATION.md)
**Phase 6 Integration Guide**

Step-by-step instructions for integrating Phase 6 features into `WorkbookViewer`:
- Import statements
- State setup
- Event handlers
- Dialog integration
- Keyboard shortcuts

#### [phases/PHASE6_COMPLETE.md](phases/PHASE6_COMPLETE.md)
**Phase 6 Completion Summary**

Celebration document! Lists:
- ✅ All completed features
- Build status
- Quick start guide
- File structure
- Performance benchmarks
- Known issues (none critical!)

#### [phases/PHASE6_SUMMARY.txt](phases/PHASE6_SUMMARY.txt)
**Phase 6 Quick Summary**

TL;DR version with:
- Implementation date
- Components created
- Features implemented
- Build status
- Next steps

---

## 🔍 Finding What You Need

### By Topic

| Topic | Documents |
|-------|-----------|
| **Installation** | [SETUP.md](SETUP.md) |
| **Development** | [DEV_MODE.md](DEV_MODE.md), [SETUP.md](SETUP.md) |
| **Architecture** | `ARCHITECTURE.md` (TODO), [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) |
| **Product Vision** | [PRD.md](product/PRD.md), [PRD-2.md](product/PRD-2.md) |
| **Current Features** | [Phase 6 Docs](phases/) |
| **Future Features** | [PRD-2.md](product/PRD-2.md) |
| **Known Issues** | [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) |
| **Testing** | [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md#2-testing-coverage) |
| **Performance** | [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md#3-performance-optimization) |

### By Version

| Version | Key Documents |
|---------|---------------|
| **v0.1.0 - v0.5.0** | [PRD.md](product/PRD.md) |
| **v0.6.0** (current) | [Phase 6 Docs](phases/), [PRD-2.md](product/PRD-2.md) |
| **v0.7.0** (next) | [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md), [PRD-2.md](product/PRD-2.md#phase-7-advanced-formatting) |
| **v1.0.0** (production) | [PRD-2.md](product/PRD-2.md#phase-10-performance--scale) |
| **v2.0.0** (future) | [PRD-2.md](product/PRD-2.md#phase-11-collaboration) |

---

## 🆕 What's New

### Recent Updates

**October 4, 2025:**
- ✅ Created `docs/` directory
- ✅ Added `TECHNICAL_DEBT.md` - comprehensive technical debt tracking
- ✅ Reorganized all documentation
- ✅ Created this README

**January 4, 2025:**
- ✅ Phase 6 complete! (Data Management)
- ✅ Added sorting, filtering, find/replace, validation, conditional formatting
- ✅ Full Phase 6 documentation

---

## 📝 Documentation Standards

### File Naming
- Use `UPPERCASE.md` for important docs (README, SETUP, TECHNICAL_DEBT)
- Use `lowercase.md` for supporting docs (contributing, changelog)
- Use `PHASE[N]_*.md` for phase documentation

### Sections
All major docs should include:
- **Title & metadata** (version, date, status)
- **Table of contents** (for long docs)
- **Overview** (what & why)
- **Details** (how)
- **Examples** (code samples)
- **Next steps** (actionable items)

### Code Examples
```typescript
// ✅ Good - shows complete example with types
const handleSort = (col: number, order: SortOrder) => {
  setSortForColumn(col, order);
};

// ❌ Bad - incomplete, no types
handleSort(col, order);
```

---

## 🤝 Contributing to Docs

### How to Improve Documentation

1. **Found an issue?** Open an issue or PR
2. **Missing information?** Add it and submit a PR
3. **Outdated content?** Update it and note the change
4. **New feature?** Create/update relevant docs

### Doc Review Process

1. Check if doc exists (search this README)
2. If updating: maintain structure and style
3. If creating: follow naming conventions
4. Add entry to this README's index
5. Update "What's New" section
6. Submit PR with clear description

---

## 🎓 Learning Resources

### Understanding Keste

1. **Start here:** [Main README](../README.md)
2. **Product vision:** [PRD.md](product/PRD.md)
3. **Current state:** [Phase 6 Docs](phases/)
4. **Future plans:** [PRD-2.md](product/PRD-2.md)

### Technology Stack

- **Tauri:** [tauri.app](https://tauri.app)
- **React:** [react.dev](https://react.dev)
- **TypeScript:** [typescriptlang.org](https://www.typescriptlang.org)
- **Rust:** [rust-lang.org](https://www.rust-lang.org)
- **SQLite:** [sqlite.org](https://www.sqlite.org)

### Spreadsheet Concepts

- **Excel Formula Reference:** [Microsoft Docs](https://support.microsoft.com/en-us/office/excel-functions-alphabetical-b3944572-255d-4efb-bb96-c6d90033e188)
- **XLSX Format:** [ECMA-376 Standard](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/)

---

## 📧 Questions?

- **User questions:** Open an issue with `question` label
- **Developer questions:** Check [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) or ask in discussions
- **Feature requests:** See [PRD-2.md](product/PRD-2.md) roadmap first, then open issue

---

## 📄 License

All documentation is licensed under [MIT License](../LICENSE) (same as the project).

---

**Last Updated:** October 4, 2025  
**Maintained by:** Keste Development Team

