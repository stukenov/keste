# Contributing to Keste

Thank you for your interest in contributing to Keste! This document provides guidelines and instructions for contributing to the project.

---

## 🎯 How Can I Contribute?

### 1. Reporting Bugs

Before creating a bug report:
- **Check existing issues** to avoid duplicates
- **Test on latest version** to ensure bug still exists
- **Gather information** (OS, version, steps to reproduce)

**Create a bug report with:**
```markdown
**Environment:**
- OS: Windows 10 / macOS 13 / Ubuntu 22.04
- Keste Version: v0.6.0
- Node: v20.x
- Rust: 1.75.x

**Description:**
Clear description of what went wrong.

**Steps to Reproduce:**
1. Open Keste
2. Import file X
3. Click button Y
4. Error occurs

**Expected Behavior:**
What should have happened.

**Actual Behavior:**
What actually happened.

**Screenshots/Logs:**
(if applicable)
```

### 2. Suggesting Features

Before suggesting a feature:
- **Check [PRD-2.md](product/PRD-2.md)** - feature might be planned
- **Search discussions** to see if already proposed
- **Consider scope** - does it fit Keste's vision?

**Feature request should include:**
- **Use case:** Why do you need this?
- **Proposed solution:** How should it work?
- **Alternatives:** What other approaches exist?
- **Impact:** Who benefits from this?

### 3. Contributing Code

#### Quick Contribution Checklist
- [ ] Fork the repository
- [ ] Create a feature branch (`feature/amazing-feature`)
- [ ] Follow code style guidelines
- [ ] Write tests for your changes
- [ ] Update documentation
- [ ] Commit with clear messages
- [ ] Push and create Pull Request

---

## 🏗️ Development Setup

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Rust stable** - [Install](https://rustup.rs/)
- **Platform tools:**
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: See [docs/SETUP.md](SETUP.md)

### Setup Steps

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/keste.git
cd keste

# 2. Install dependencies
npm install

# 3. Run in dev mode
npm run dev  # Web mode (fast)
# OR
npm run tauri dev  # Native app (slower)

# 4. Build for production (test before PR)
npm run tauri build
```

See [docs/SETUP.md](SETUP.md) and [docs/DEV_MODE.md](DEV_MODE.md) for details.

---

## 📝 Code Guidelines

### TypeScript/React

**Style:**
- Use **functional components** with hooks
- Prefer **named exports** over default exports
- Use **TypeScript strict mode** (no `any` types)
- Follow **React best practices** (memo, useMemo, useCallback)

**Example:**
```typescript
// ✅ Good
export const MyComponent = ({ value }: { value: number }) => {
  const computed = useMemo(() => expensiveCalc(value), [value]);
  
  return <div>{computed}</div>;
};

// ❌ Bad
export default function MyComponent(props: any) {
  const computed = expensiveCalc(props.value); // No memoization
  return <div>{computed}</div>;
}
```

**Naming Conventions:**
- Components: `PascalCase` (e.g., `EditableCell.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useDataManagement.ts`)
- Utilities: `camelCase` (e.g., `formatNumber.ts`)
- Types: `PascalCase` (e.g., `CellModel`, `WorkbookModel`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_ROWS`)

### Rust

**Style:**
- Follow **Rust standard style** (use `cargo fmt`)
- Use **descriptive names** for functions and variables
- Add **doc comments** for public APIs
- Handle **all errors** explicitly

**Example:**
```rust
/// Saves a SQLite database from SQL dump string.
/// 
/// # Arguments
/// * `sql_dump` - SQL statements as a string
/// * `out_path` - Output file path
/// 
/// # Returns
/// * `Ok(SaveResult)` with bytes written
/// * `Err(String)` if save failed
#[tauri::command]
pub fn save_sqlite(sql_dump: String, out_path: String) -> Result<SaveResult, String> {
    let conn = Connection::open(&out_path)
        .map_err(|e| format!("Failed to create database: {}", e))?;
    
    conn.execute_batch(&sql_dump)
        .map_err(|e| format!("Failed to execute SQL: {}", e))?;
    
    Ok(SaveResult { bytesWritten: calc_size(&out_path) })
}
```

### File Organization

**Component structure:**
```typescript
// 1. Imports
import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { formatNumber } from '@/utils/number-format';

// 2. Types
interface MyComponentProps {
  value: number;
  onUpdate: (value: number) => void;
}

// 3. Component
export const MyComponent = ({ value, onUpdate }: MyComponentProps) => {
  // State
  const [editing, setEditing] = useState(false);
  
  // Computed values
  const formatted = useMemo(() => formatNumber(value), [value]);
  
  // Event handlers
  const handleClick = () => {
    setEditing(true);
  };
  
  // Render
  return (
    <div onClick={handleClick}>
      {formatted}
    </div>
  );
};

// 4. Helper functions (if needed)
const helperFunction = () => {
  // ...
};
```

---

## 🧪 Testing

### Writing Tests

**Unit Tests (Vitest):**
```typescript
// src/utils/__tests__/number-format.test.ts
import { describe, it, expect } from 'vitest';
import { formatNumber } from '../number-format';

describe('formatNumber', () => {
  it('formats integers correctly', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });
  
  it('handles decimals', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });
  
  it('handles edge cases', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(-1234)).toBe('-1,234');
  });
});
```

**Integration Tests (React Testing Library):**
```typescript
// src/components/__tests__/EditableCell.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EditableCell } from '../EditableCell';

describe('EditableCell', () => {
  it('displays cell value', () => {
    render(<EditableCell row={1} col={1} value="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('enters edit mode on double-click', () => {
    render(<EditableCell row={1} col={1} value="Test" />);
    const cell = screen.getByText('Test');
    fireEvent.doubleClick(cell);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- number-format.test.ts

# Watch mode
npm test -- --watch
```

**Coverage Requirements:**
- New code: **80%+ coverage**
- Critical paths: **100% coverage**
- UI components: **70%+ coverage**

---

## 📚 Documentation

### Code Documentation

**TypeScript (JSDoc/TSDoc):**
```typescript
/**
 * Evaluates a formula and returns the computed value.
 * 
 * @param formula - The formula string (without leading '=')
 * @param context - Cell context with workbook and sheet info
 * @returns The computed value or a formula error
 * 
 * @example
 * ```typescript
 * const result = evaluateFormula('SUM(A1:A10)', context);
 * console.log(result); // 55
 * ```
 * 
 * @throws {CircularReferenceError} If circular dependency detected
 */
export function evaluateFormula(
  formula: string,
  context: FormulaContext
): CellValue | FormulaError {
  // Implementation
}
```

**Rust (doc comments):**
```rust
/// Saves a SQLite database from SQL dump.
/// 
/// # Arguments
/// * `sql_dump` - SQL statements as a string
/// * `out_path` - Output file path
/// 
/// # Example
/// ```rust
/// let result = save_sqlite(dump, "/path/to/file.kst")?;
/// println!("Wrote {} bytes", result.bytesWritten);
/// ```
pub fn save_sqlite(sql_dump: String, out_path: String) -> Result<SaveResult, String> {
    // Implementation
}
```

### Updating Documentation

When adding a feature:
- [ ] Update relevant [docs/](.) files
- [ ] Add examples to [docs/phases/](phases/) if Phase-specific
- [ ] Update [README.md](../README.md) if user-facing
- [ ] Add to [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) if incomplete

---

## 🔧 Pull Request Process

### Before Submitting

1. **Test your changes:**
   ```bash
   npm run build  # Must succeed
   npm test       # All tests pass
   npm run lint   # No linting errors
   ```

2. **Update documentation:**
   - Code comments
   - README if needed
   - Relevant docs/ files

3. **Write clear commit messages:**
   ```
   feat: Add conditional formatting dialog
   
   - Implement ConditionalFormattingDialog component
   - Add cell value, top/bottom, and data bar rules
   - Integrate with ExportBar toolbar
   - Add tests for rule validation
   
   Closes #123
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance (dependencies, build, etc.)

**Examples:**
```
feat(grid): Add virtual scrolling support

Implement react-window for grid virtualization to handle
1M+ rows efficiently.

- Use FixedSizeGrid for constant row height
- Optimize cell rendering with memo
- Add performance benchmarks

Closes #45
```

```
fix(formula): Handle circular reference error

Detect circular references before evaluation to prevent
infinite loops.

- Add CircularReferenceDetector class
- Throw clear error message
- Add tests for various circular patterns

Fixes #89
```

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
- [ ] Dependent PRs merged

## Screenshots (if applicable)

## Related Issues
Closes #123
```

### Review Process

1. **Automated checks** run (build, test, lint)
2. **Maintainer review** (1-3 days)
3. **Feedback addressed** (if needed)
4. **Approved & merged**

**Tips for faster review:**
- Keep PRs small (<500 lines)
- Add tests
- Clear description
- Respond to feedback promptly

---

## 🐛 Working on Technical Debt

See [docs/TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) for tracked issues.

**Process:**
1. Choose an issue from TECHNICAL_DEBT.md
2. Comment on GitHub issue claiming it
3. Create feature branch: `fix/tech-debt-type-safety`
4. Implement fix with tests
5. Update TECHNICAL_DEBT.md to mark as resolved
6. Submit PR linking to issue

---

## 🎨 UI/UX Guidelines

### Design System

We use **shadcn/ui** components. Consistent styling:

```typescript
// ✅ Use shadcn/ui components
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

<Button variant="default" size="sm">Save</Button>

// ❌ Don't create custom buttons
<button className="my-custom-btn">Save</button>
```

**Colors:**
```typescript
// Use CSS variables from tailwind.config.js
className="bg-primary text-primary-foreground"
className="bg-secondary text-secondary-foreground"
```

**Spacing:**
```typescript
// Use Tailwind spacing scale
className="p-4 gap-2 mt-6"  // 4px scale: 0.5, 1, 2, 3, 4, 6, 8...
```

### Accessibility

- **Keyboard navigation:** All features accessible via keyboard
- **ARIA labels:** Buttons and controls labeled
- **Focus indicators:** Visible focus states
- **Screen reader:** Semantic HTML

```typescript
// ✅ Good accessibility
<button
  onClick={handleSave}
  aria-label="Save workbook"
  aria-keyshortcuts="Ctrl+S"
>
  <SaveIcon aria-hidden="true" />
</button>

// ❌ Bad accessibility
<div onClick={handleSave}>
  <SaveIcon />
</div>
```

---

## 🚀 Release Process

(For maintainers)

1. **Version bump** in `package.json` and `Cargo.toml`
2. **Update CHANGELOG.md** with release notes
3. **Create git tag:** `git tag v0.7.0`
4. **Build release:** `npm run tauri build`
5. **Test on all platforms**
6. **Publish release on GitHub**
7. **Update documentation**

---

## ❓ Questions?

- **General questions:** Open a [Discussion](https://github.com/YOUR_ORG/keste/discussions)
- **Bug reports:** Open an [Issue](https://github.com/YOUR_ORG/keste/issues)
- **Feature ideas:** Check [PRD-2.md](product/PRD-2.md) first, then discuss

---

## 📜 Code of Conduct

Be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

**In short:**
- Be kind and respectful
- Welcome diverse perspectives
- Focus on what's best for the project
- Accept constructive criticism gracefully

---

## 🙏 Thank You!

Every contribution, no matter how small, makes Keste better. Thank you for being part of the journey!

---

**Document Version:** 1.0  
**Last Updated:** October 4, 2025  
**Maintained by:** Keste Development Team

