# Keste

**Modern Spreadsheet Editor Powered by SQLite**

A beautiful, fast, and private alternative to Google Sheets that runs completely offline on your desktop.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Version](https://img.shields.io/badge/version-0.1.0-green.svg)

---

## 🎯 What is Keste?

Keste is a **desktop spreadsheet editor** that uses SQLite as its storage format instead of traditional XLSX files. Think Google Sheets, but:
- ✅ **100% offline** - Your data never leaves your device
- ✅ **SQLite-powered** - Blazing fast performance with database efficiency
- ✅ **Privacy-first** - No tracking, no cloud, no data collection
- ✅ **Cross-platform** - Works on Windows, macOS, and Linux

### Why SQLite for spreadsheets?

- **Performance**: Query and filter millions of rows instantly
- **Reliability**: ACID-compliant transactions ensure data integrity
- **Efficiency**: Compact storage with built-in compression
- **Flexibility**: Direct SQL access to your spreadsheet data
- **Standard**: Widely supported, battle-tested database format

---

## ✨ Features

### Current (v0.1.0)

- 📊 **Full Spreadsheet Editor**
  - Create new spreadsheets from scratch
  - Import existing Excel (.xlsx) files
  - Multiple sheets per workbook
  - Familiar grid interface

- 💾 **File Format**
  - Save as `.kst` (Keste format - SQLite database)
  - Import Excel `.xlsx` files
  - Export to Excel `.xlsx` (coming soon)

- 🎨 **Modern UI**
  - Beautiful interface with shadcn/ui
  - Smooth animations with Framer Motion
  - Responsive and intuitive design
  - Google Sheets-inspired UX

- 🔍 **Data Preview**
  - Virtualized grid for large datasets
  - Formula display
  - Cell styling visualization
  - Sheet navigation

- 🚀 **Performance**
  - Handle millions of cells efficiently
  - Instant save and load
  - Minimal memory footprint
  - No lag, no stuttering

### Coming Soon

- ✏️ **Cell Editing**
  - Click-to-edit cells
  - Formula editing
  - Copy/paste support
  - Undo/redo

- 🎯 **Full Excel Compatibility**
  - Export to valid .xlsx files
  - Preserve all Excel features
  - Bi-directional conversion

- 📐 **Advanced Features**
  - Formulas and calculations
  - Charts and graphs
  - Conditional formatting
  - Data validation
  - Pivot tables

---

## 📖 Documentation

**Complete documentation is available in [docs/](docs/README.md):**

- 📘 [Setup Guide](docs/SETUP.md) - Installation & development setup
- 🏗️ [Architecture](docs/ARCHITECTURE.md) - System design & technical details
- 🔧 [Technical Debt](docs/TECHNICAL_DEBT.md) - Known issues & improvements
- 🤝 [Contributing](docs/CONTRIBUTING.md) - How to contribute
- 📋 [Changelog](docs/CHANGELOG.md) - Version history
- 🚀 [Product Roadmap](docs/product/PRD-2.md) - Future features

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Rust** stable ([Install](https://rustup.rs/))
- **Platform-specific requirements**:
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: See [docs/SETUP.md](docs/SETUP.md)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/stukenov/keste.git
cd keste
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run in development mode**:
```bash
npm run tauri dev
```

### Building for Production

```bash
npm run tauri build
```

**Outputs**:
- Windows: `src-tauri/target/release/keste.exe`
- macOS: `src-tauri/target/release/bundle/macos/`
- Linux: `src-tauri/target/release/bundle/appimage/`

---

## 📖 Usage

### Creating a New Spreadsheet

1. Launch Keste
2. Click "New Spreadsheet"
3. Start editing (editing features coming in v0.2.0)

### Importing Excel Files

1. Launch Keste
2. Click "Import File" or drag & drop an `.xlsx` file
3. Your data will be converted to Keste format
4. Save as `.kst` to preserve in native format

### Saving Your Work

- **Save as .kst**: Click "Save .kst" to save in Keste's native format (SQLite)
- **Export to Excel**: Click "Export Excel" to create a standard `.xlsx` file (coming soon)

---

## 🗂️ File Format

### `.kst` Format (Keste Native)

Keste uses SQLite as its native file format. Each `.kst` file is a valid SQLite database containing:

| Table | Description |
|-------|-------------|
| `workbook` | Workbook metadata |
| `sheet` | Sheet information |
| `cell` | Cell data (values, formulas, types) |
| `shared_string` | Shared string pool |
| `numfmt` | Number format definitions |
| `style` | Cell styles and formatting |
| `merged_range` | Merged cell ranges |
| `row_prop` | Row properties |
| `col_prop` | Column properties |
| `defined_name` | Named ranges |
| `sheet_view` | View settings (freeze panes, etc.) |

**Benefits**:
- Query your spreadsheet with SQL
- Compact and efficient storage
- ACID-compliant data integrity
- Direct database access when needed

---

## 🛠 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Lucide Icons** - Icon set
- **react-window** - Virtual scrolling

### Backend
- **Rust** - Systems programming
- **Tauri 1.5** - Desktop framework
- **rusqlite 0.30** - SQLite bindings
- **serde** - Serialization

### Excel Parsing
- Custom TypeScript implementation
- ZIP reader with DecompressionStream
- SAX-style XML parser
- Memory-efficient streaming

---

## 🗺 Roadmap

### v0.2.0 - Cell Editing
- [ ] Click-to-edit cells
- [ ] Formula support
- [ ] Copy/paste functionality
- [ ] Keyboard navigation

### v0.3.0 - Excel Export
- [ ] Generate valid .xlsx files
- [ ] Preserve formatting
- [ ] Support all Excel features

### v0.4.0 - Advanced Features
- [ ] Charts and graphs
- [ ] Conditional formatting
- [ ] Data validation
- [ ] Pivot tables

### v1.0.0 - Production Ready
- [ ] Full Excel compatibility
- [ ] Performance optimizations
- [ ] Comprehensive testing
- [ ] User documentation

---

## 🔒 Privacy & Security

- ✅ **100% Offline** - No internet connection required or used
- ✅ **No Telemetry** - Zero data collection or tracking
- ✅ **Local Storage** - All files stay on your device
- ✅ **No Cloud** - Your data never touches external servers
- ✅ **Sandboxed** - Tauri's security features enabled
- ✅ **Open Source** - Fully auditable code

---

## 🎨 Design Philosophy

Keste is designed to be:

1. **Beautiful** - Modern, clean interface that's pleasant to use
2. **Fast** - Instant response, no lag, smooth animations
3. **Simple** - Familiar interface inspired by Google Sheets
4. **Powerful** - SQLite backend provides database-level capabilities
5. **Private** - Your data belongs to you, period

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Saken Tukenov

---

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Database powered by [SQLite](https://www.sqlite.org/)

---

## 📬 Support

- 🐛 **Bug Reports**: Open an issue
- 💡 **Feature Requests**: Start a discussion
- 📖 **Documentation**: See [docs/](docs/README.md)

---

<div align="center">

**Made with ❤️ using Tauri, React, Rust, and SQLite**

*Taking back control of your spreadsheets, one cell at a time.*

</div>
