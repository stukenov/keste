# Setup Instructions

## Installation Steps

### 1. Install Node.js Dependencies

```bash
npm install
```

or if you prefer pnpm:

```bash
pnpm install
```

### 2. Install Rust and Tauri Prerequisites

#### Windows
Install Microsoft Visual Studio C++ Build Tools:
- Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Select "Desktop development with C++" workload

Install Rust:
```bash
winget install Rustlang.Rust.MSVC
```

#### macOS
Install Xcode Command Line Tools:
```bash
xcode-select --install
```

Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 3. Generate Icons (Optional)

Place your app icon (512x512 PNG recommended) in the project root and run:

```bash
npm run tauri icon icon.png
```

This will generate all required icon sizes in `src-tauri/icons/`.

### 4. Development

Start the development server with hot-reload:

```bash
npm run tauri dev
```

The app will open in a native window. Changes to React code will hot-reload.

### 5. Build Production Release

Build optimized binaries for your platform:

```bash
npm run tauri build
```

The built executables will be in:
- Windows: `src-tauri/target/release/excel-sqlite-converter.exe`
- macOS: `src-tauri/target/release/bundle/macos/`
- Linux: `src-tauri/target/release/bundle/appimage/` or `/deb/`

## Troubleshooting

### "command not found: tauri"
Make sure dependencies are installed:
```bash
npm install
```

### Rust compilation errors
Update Rust to the latest stable version:
```bash
rustup update stable
```

### WebView2 missing (Windows)
Download and install WebView2 Runtime:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Build fails on Linux
Ensure all system dependencies are installed (see step 2 above).

## Project Structure

```
keste/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── core-ts/           # Excel parsing logic
│   └── main.tsx           # Entry point
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # Tauri app setup
│   │   ├── cmds.rs        # IPC commands
│   │   └── sqlite_writer.rs  # SQLite writer
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── package.json           # Node dependencies
└── vite.config.ts         # Vite configuration
```

## Development Tips

- Use React DevTools browser extension for debugging UI
- Check Rust console output in the terminal for backend errors
- Use `console.log()` in frontend - it appears in the terminal
- For production builds, test on the target platform if possible

## Next Steps

1. Test with your Excel files
2. Customize the UI styling
3. Add additional Excel feature support
4. Configure auto-updates (optional)
5. Set up code signing for distribution

## Resources

- Tauri Docs: https://tauri.app/
- React Docs: https://react.dev/
- Vite Docs: https://vitejs.dev/
