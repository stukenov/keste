# Development Mode Guide

## Проблема с `npm run tauri dev`

При запуске `npm run tauri dev` приложение может зависать на этапе компиляции Tailwind CSS.

### ✅ Решение: Используйте веб-режим

Вместо Tauri, запустите просто веб-версию для разработки:

```bash
npm run dev
```

Затем откройте в браузере:
```
http://localhost:1420
```

### Преимущества веб-режима:

1. **Быстрый запуск** - 571ms vs несколько минут
2. **Hot Module Replacement** - мгновенные обновления при изменении кода
3. **DevTools** - полный доступ к инструментам разработчика браузера
4. **Debugging** - легче отлаживать в браузере
5. **Network inspector** - видно все запросы

### Когда использовать Tauri dev?

Используйте `npm run tauri dev` только когда нужно:
- Тестировать Tauri-специфичные функции (файловая система, IPC)
- Проверить работу в нативном окне
- Тестировать перед production build

### Если все же нужен Tauri dev:

1. Очистите кэш:
```bash
rm -rf node_modules/.vite dist
```

2. Запустите:
```bash
npm run tauri dev
```

3. Подождите 1-2 минуты пока Tailwind скомпилируется

### Production Build

Для финальной сборки:

```bash
npm run tauri build
```

Executable будет в: `src-tauri/target/release/`

---

## Быстрый старт для разработки

```bash
# 1. Запустить dev server
npm run dev

# 2. Открыть в браузере
# http://localhost:1420

# 3. Редактировать код - изменения применяются мгновенно!
```

## Troubleshooting

### Порт занят
Если порт 1420 занят:
```bash
# Windows
netstat -ano | findstr :1420

# Kill process by PID
taskkill /F /PID <PID>
```

### Tailwind не обновляется
```bash
rm -rf node_modules/.vite
npm run dev
```

### Ошибки esbuild
```bash
npm cache clean --force
npm install
npm run dev
```

---

**Рекомендация:** Всегда используйте `npm run dev` для разработки, и `npm run tauri build` для production.
