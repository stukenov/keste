# Инструкция по сборке Keste

## Команды для сборки

### Разработка
```bash
npm run tauri:dev
```
Запускает приложение в режиме разработки с hot-reload.

### Production сборка
```bash
npm run tauri:build
```
Создает оптимизированную production версию приложения.

## Где найти исполняемый файл

После успешной сборки исполняемые файлы будут находиться в:

### Windows
- **Основной .exe файл**: `src-tauri\target\release\Keste.exe` - это standalone исполняемый файл, который можно запускать без установки
- **Инсталлятор**: `src-tauri\target\release\bundle\nsis\Keste_0.1.0_x64-setup.exe` - инсталлятор для установки приложения

### Linux
- `src-tauri/target/release/keste` - исполняемый файл
- `src-tauri/target/release/bundle/` - различные форматы пакетов (deb, AppImage и т.д.)

### macOS
- `src-tauri/target/release/bundle/dmg/Keste_0.1.0_x64.dmg` - образ диска
- `src-tauri/target/release/bundle/macos/Keste.app` - приложение

## Требования для сборки

1. **Node.js** (v16 или выше)
2. **Rust** (установка через [rustup](https://rustup.rs/))
3. **Зависимости системы**:
   - Windows: Visual Studio Build Tools или MinGW
   - Linux: `libwebkit2gtk-4.1-dev`/`libjavascriptcoregtk-4.1-dev` (Ubuntu 24.04) или `libwebkit2gtk-4.0-dev`/`libjavascriptcoregtk-4.0-dev` (Ubuntu ≤22.04), `libsoup2.4-dev`, `build-essential`, `curl`, `wget`, `pkg-config`, `libssl-dev`, `libgtk-3-dev`, `libglib2.0-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `patchelf`
   - macOS: Xcode Command Line Tools

## Оптимизация размера

Текущая конфигурация оптимизирована для создания компактного исполняемого файла:
- Используется NSIS для создания инсталлятора Windows
- Минимальные внешние зависимости
- Оптимизированная компиляция Rust (release mode)

## Первая сборка

При первой сборке процесс может занять 10-15 минут, так как Rust компилирует все зависимости. Последующие сборки будут значительно быстрее благодаря кэшированию.

## Проблемы при сборке

Если возникают ошибки:
1. Убедитесь, что установлен Rust: `rustc --version`
2. Обновите зависимости: `npm install`
3. Очистите кэш сборки: `cd src-tauri && cargo clean`
4. Проверьте логи в процессе сборки

## CI/CD релизы по тегам

Готовые сборки публикуются автоматически по тегам `v*` через GitHub Actions (Linux раннер: Ubuntu 22.04 для совместимости с WebKitGTK 4.0/JSCore 4.0):
- Windows: NSIS инсталлятор (`.exe`)
- macOS: `.app` и `.dmg`
- Linux: `.AppImage`

Артефакты собираются без подписания (unsigned) и прикрепляются к GitHub Release.
