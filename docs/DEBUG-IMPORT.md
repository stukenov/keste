# 🔧 Debug Guide: Excel Import Issues

**Дата:** 2025-10-05
**Проблема:** Ошибки при импорте Excel файлов

---

## 🐛 Исправленные баги

### 1. ❌ "RangeError: Invalid array length"

**Причина:** Некорректные значения `nameLen` или `compSize` в ZIP-архиве .xlsx файла

**Исправление:** [src/core-ts/zip.ts](../src/core-ts/zip.ts)
```typescript
// Добавлена валидация перед созданием Uint8Array
if (nameLen < 0 || nameLen > 1000 || offset + 46 + nameLen > this.buffer.byteLength) {
  console.warn(`Invalid nameLen: ${nameLen} at offset ${offset}`);
  continue;
}

if (compSize < 0 || compSize > this.buffer.byteLength || dataOffset + compSize > this.buffer.byteLength) {
  console.warn(`Invalid compSize: ${compSize} for file ${name}`);
  continue;
}
```

### 2. ❌ Пустой workbook при импорте

**Причина:** Отсутствие валидации массива sheets

**Исправление:** [src/core-ts/read_xlsx.ts](../src/core-ts/read_xlsx.ts)
```typescript
// Validate model before returning
if (!model.sheets || model.sheets.length === 0) {
  console.warn('No sheets found in workbook');
  // Create a default empty sheet
  model.sheets = [{
    id: 'sheet1',
    name: 'Sheet1',
    sheetId: 1,
    cells: new Map(),
    mergedRanges: [],
    rowProps: new Map(),
    colProps: new Map(),
  }];
}

// Ensure required arrays are initialized
if (!model.fonts) model.fonts = [];
if (!model.fills) model.fills = [];
if (!model.borders) model.borders = [];
if (!model.cellXfs) model.cellXfs = [];
if (!model.numFmts) model.numFmts = new Map();
```

### 3. ❌ Пустые ячейки при импорте

**Возможная причина:** Проблема в парсинге XML или в getCellDisplayValue

**Диагностика:** Добавлено логирование

---

## 🔍 Диагностическое логирование

### Консольные логи при импорте:

```
Starting XLSX import, buffer size: [размер файла]
ZIP entries found: [количество]
Entry names: xl/workbook.xml, xl/worksheets/sheet1.xml, ...
Parsing sheet: [имя листа], data size: [размер], sharedStrings: [количество]
Sheet [имя] parsed: [X] cells, [Y] merged ranges
Cell 1-1: rawValue="...", displayValue="...", cellData: {...}
Cell 1-2: rawValue="...", displayValue="...", cellData: {...}
...
```

### Что проверять:

1. **ZIP entries found: 0**
   - Файл не является валидным .xlsx (или поврежден)
   - Проверьте, что файл действительно Excel 2007+ (.xlsx)

2. **Sheet parsed: 0 cells**
   - Проблема в parseSheet()
   - XML не содержит `<sheetData>` или `<c>` элементов
   - Возможно, файл использует нестандартный формат

3. **displayValue пустой, но cellData есть**
   - Проблема в getCellDisplayValue() или formatNumber()
   - Проверьте тип ячейки (n, s, b, d, str)
   - Проверьте sharedStrings индексы

4. **CellXf not found for styleId**
   - Проблема в parseStyles() - не все стили загружены
   - Или styleId некорректный

---

## 🧪 Тестирование

### Шаги для отладки:

1. **Запустите dev сервер:**
   ```bash
   npm run dev
   ```

2. **Откройте браузер:**
   - Перейдите на http://localhost:1420
   - Откройте DevTools (F12) → Console

3. **Импортируйте Excel файл:**
   - Перетащите .xlsx файл в приложение
   - Наблюдайте логи в консоли

4. **Анализируйте вывод:**
   - Сколько entries найдено?
   - Сколько cells распарсено?
   - Какие значения в rawValue и displayValue?

### Тестовые файлы:

Создайте простой Excel файл для тестирования:
- Откройте Excel
- В A1 введите: `Hello`
- В B1 введите: `=1+1`
- В A2 введите число: `123.45`
- Сохраните как test.xlsx
- Импортируйте в Keste

**Ожидаемые логи:**
```
Starting XLSX import, buffer size: 5000-10000
ZIP entries found: 8-12
Parsing sheet: Sheet1, data size: 500-2000, sharedStrings: 1
Sheet Sheet1 parsed: 3 cells, 0 merged ranges
Cell 1-1: rawValue="Hello", displayValue="Hello", cellData: {type: "s", value: "Hello", ...}
Cell 1-2: rawValue="=1+1", displayValue="2", cellData: {type: "n", formula: "1+1", value: 2, ...}
Cell 2-1: rawValue="123.45", displayValue="123.45", cellData: {type: "n", value: 123.45, ...}
```

---

## 📝 Известные ограничения

1. **Сложные формулы:** HyperFormula может не поддерживать все Excel функции
2. **Условное форматирование:** Пока не реализовано (Phase 2)
3. **Изображения/Charts:** Пока не реализовано (Phase 3)
4. **Theme colors:** Пока возвращается черный (#000000)
5. **Date formats:** Упрощенная реализация, могут быть неточности

---

## 🚀 Следующие шаги

Если проблема сохраняется:

1. **Поделитесь логами консоли** - скопируйте полный вывод из DevTools Console

2. **Проверьте структуру Excel файла:**
   - Переименуйте .xlsx в .zip
   - Распакуйте архив
   - Проверьте наличие xl/workbook.xml, xl/worksheets/sheet1.xml, xl/sharedStrings.xml

3. **Попробуйте другой файл** - может быть, конкретный файл использует редкие Excel фичи

4. **Включите расширенное логирование** - добавьте больше console.log в read_xlsx.ts

---

**Автор:** Keste Team
**Версия:** 1.0
**Статус:** Debug Build ✅
