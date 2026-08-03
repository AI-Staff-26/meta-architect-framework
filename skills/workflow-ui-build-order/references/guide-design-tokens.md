# 🎨 Design Tokens First — Принцип Проектирования UI

<purpose>
Философия и практика "Design Tokens First" для консистентного UI.
Определи токены ПЕРЕД созданием компонентов.
</purpose>

---

## Принцип

> **"Design Tokens First"** — начинай UI-разработку с определения дизайн-токенов, а не с компонентов.

**Почему это важно:**
- Обеспечивает визуальную консистентность
- Упрощает будущие изменения (один источник правды)
- Даёт AI чёткие ограничения (не выбирает цвета "на лету")
- Профессиональный результат с первой попытки

---

## Минимальный Набор Токенов

### 🎨 Colors

```css
/* === SEMANTIC COLORS === */
--color-primary: #3b82f6;        /* Main brand / CTA */
--color-primary-hover: #2563eb;
--color-secondary: #6b7280;      /* Secondary actions */

/* === BACKGROUNDS === */
--color-bg-primary: #ffffff;     /* Main background */
--color-bg-secondary: #f3f4f6;   /* Cards, sections */
--color-bg-tertiary: #e5e7eb;    /* Hover states */

/* === TEXT === */
--color-text-primary: #111827;   /* Headings, important */
--color-text-secondary: #6b7280; /* Body text */
--color-text-muted: #9ca3af;     /* Placeholders, hints */

/* === SEMANTIC === */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;

/* === BORDERS === */
--color-border: #e5e7eb;
--color-border-focus: #3b82f6;
```

### 📝 Typography

```css
/* === FONTS === */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* === SIZES === */
--text-xs: 0.75rem;    /* 12px - labels, badges */
--text-sm: 0.875rem;   /* 14px - secondary text */
--text-base: 1rem;     /* 16px - body */
--text-lg: 1.125rem;   /* 18px - large body */
--text-xl: 1.25rem;    /* 20px - subheadings */
--text-2xl: 1.5rem;    /* 24px - headings */
--text-3xl: 1.875rem;  /* 30px - page titles */

/* === WEIGHTS === */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* === LINE HEIGHTS === */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### 📏 Spacing

```css
/* === SPACING SCALE (8px base) === */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### 🔲 Borders & Shadows

```css
/* === BORDER RADIUS === */
--radius-sm: 0.25rem;  /* 4px - inputs, small elements */
--radius-md: 0.5rem;   /* 8px - cards, buttons */
--radius-lg: 1rem;     /* 16px - modals, large cards */
--radius-full: 9999px; /* Pills, avatars */

/* === SHADOWS === */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

### ⏱️ Transitions

```css
/* === DURATIONS === */
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;

/* === EASINGS === */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## Применение в Промптах

### Для `code`

```markdown
## Design Tokens Setup

Before creating any UI components, establish design tokens.

Create `src/styles/tokens.css` with:
- Colors: primary, semantic (success/error/warning), backgrounds, text
- Typography: font families, sizes (xs to 3xl), weights
- Spacing: 4px-based scale (space-1 to space-16)
- Borders: radius-sm to radius-full
- Shadows: sm, md, lg, xl
- Transitions: durations and easings

Use CSS custom properties. Reference tokens in ALL component styles.
```

### Checklist для `architect`

- [ ] Токены определены до создания компонентов
- [ ] Цвета имеют семантические названия
- [ ] Spacing использует консистентную шкалу
- [ ] Токены ссылаются на tokens.css, а не hardcoded значения

---

## Dark Mode Strategy

```css
/* === DARK MODE (prefers-color-scheme) === */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #111827;
    --color-bg-secondary: #1f2937;
    --color-text-primary: #f9fafb;
    --color-text-secondary: #d1d5db;
    --color-border: #374151;
  }
}

/* === DARK MODE (class-based) === */
.dark {
  --color-bg-primary: #111827;
  /* ... */
}
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Hardcoded colors | `color: #3b82f6` everywhere | Use `var(--color-primary)` |
| Magic numbers | `padding: 17px` | Use `var(--space-4)` |
| Inconsistent fonts | Different sizes per component | Use typography scale |
| Direct hex in components | Hard to change globally | Reference tokens only |

---

**Связанные файлы:**
- `../../checklist-ux-design/SKILL.md` → UX Design Pass section
- `../../checklist-ux-review/SKILL.md` → Pass verification
- `../SKILL.md` → Step 1: Design Tokens

---

**END OF GUIDE**
