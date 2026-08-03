---
name: checklist-ux-review
description: |
  UI/UX IMPLEMENTATION verification. All states (loading, error, empty), accessibility, 
  responsive design. Loaded by review for frontend code. Use for: UI features, 
  component reviews, design system updates.
---

<purpose>
Checklist for verifying UI/UX implementation completeness. Covers all visual
states, accessibility, and responsive behavior.
</purpose>

---

<when_to_use>

## Activation

**Auto-loaded by reviewer when:**

- Frontend components changed
- UI feature implemented
- Design system updates

**Manual load for:**

- Pre-release UI review
- Accessibility audit
- Design QA

</when_to_use>

---

## 📱 1. Visual States

### Required States for Interactive Components

- [ ] **Default** — Normal appearance
- [ ] **Hover** — Mouse over feedback
- [ ] **Focus** — Keyboard navigation visible
- [ ] **Active/Pressed** — During click
- [ ] **Disabled** — Cannot interact
- [ ] **Loading** — Async operation in progress
- [ ] **Error** — Something went wrong
- [ ] **Success** — Operation completed

### Required States for Data Display

- [ ] **Loading** — Skeleton/spinner while fetching
- [ ] **Empty** — No data to display (with helpful message)
- [ ] **Error** — Failed to load (with retry option)
- [ ] **Partial** — Some data loaded
- [ ] **Populated** — Normal data display

---

## ♿ 2. Accessibility (A11y)

### Keyboard Navigation

- [ ] All interactive elements focusable
- [ ] Focus order is logical
- [ ] Focus visible (outline)
- [ ] No keyboard traps
- [ ] Escape closes overlays

### Screen Readers

- [ ] Meaningful alt text for images
- [ ] ARIA labels on icons/buttons
- [ ] Form fields have labels
- [ ] Error messages announced
- [ ] Live regions for dynamic content

### Visual

- [ ] Color contrast WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Not color-only indicators
- [ ] Text resizable to 200%
- [ ] Motion reduced support

---

## 📐 3. Responsive Design

### Breakpoints

- [ ] **Mobile** (< 640px)
  - Touch targets 44x44px minimum
  - Readable without zoom
  - No horizontal scroll

- [ ] **Tablet** (640-1024px)
  - Layout adapts
  - Touch-friendly

- [ ] **Desktop** (> 1024px)
  - Full layout utilized
  - Hover states work

### Cross-Browser

- [ ] Chrome / Edge
- [ ] Firefox
- [ ] Safari (if supporting)
- [ ] Mobile browsers

---

## 🎨 4. Design Consistency

- [ ] Uses design tokens (colors, spacing, typography)
- [ ] Consistent component variants
- [ ] Follows spacing system
- [ ] Typography hierarchy correct
- [ ] Icons consistent style

---

## ⚡ 5. Performance

- [ ] Images optimized (WebP, proper size)
- [ ] Lazy loading for below-fold
- [ ] No layout shifts (CLS)
- [ ] Animations 60fps
- [ ] First paint fast

---

## 🔄 6. Interaction Patterns

### Forms

- [ ] Validation on blur (not just submit)
- [ ] Clear error messages
- [ ] Error shown near field
- [ ] Success feedback
- [ ] Preserves input on error

### Modals/Dialogs

- [ ] Focus trapped inside
- [ ] Escape to close
- [ ] Click outside behavior defined
- [ ] Scroll lock on body
- [ ] Accessible title

### Lists/Tables

- [ ] Empty state
- [ ] Loading state
- [ ] Pagination/infinite scroll
- [ ] Selection feedback
- [ ] Bulk actions accessible

---

## 📝 7. Content & Copy

- [ ] No Lorem ipsum
- [ ] Error messages helpful
- [ ] Loading text appropriate
- [ ] Button text is action verb
- [ ] Consistent terminology

---

## 🌐 8. Internationalization (if applicable)

- [ ] Text can expand (other languages)
- [ ] RTL layout works
- [ ] Date/number formatting
- [ ] No hardcoded strings

---

<severity_guide>

## Issue Severity

| Severity | Criteria | Example |
|----------|----------|---------|
| 🔴 **Critical** | Unusable for some users | No keyboard access, broken ARIA |
| 🟠 **High** | Major UX problem | Missing loading state, layout break |
| 🟡 **Medium** | Minor UX issue | Hover missing, slight contrast issue |
| 🟢 **Low** | Polish item | Animation timing, minor spacing |

</severity_guide>

---

<output_format>

## Review Output

```markdown
## UX Review: [Component/Feature]

### States Implementation
✅ Default, Hover, Focus, Disabled
🟠 Missing: Loading state
🟠 Missing: Error state

### Accessibility
✅ Keyboard navigable
🟡 Contrast on secondary text: 4.2:1 (needs 4.5:1)

### Responsive
✅ Desktop
✅ Tablet  
🟠 Mobile: Touch targets too small

### Verdict: PASS / FAIL
[Summary]
```

</output_format>

---

**Loaded by:** review  
**Used with:** checklist-code-review, workflow-ui-build-order
