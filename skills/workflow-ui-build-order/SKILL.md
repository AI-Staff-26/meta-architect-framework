---
name: workflow-ui-build-order
description: |
  UI IMPLEMENTATION SEQUENCING protocol. 9-phase workflow with ready prompts 
  for `code`. Design tokens → layout → components → states → polish. Use for: 
  frontend features, design systems. NOT for: backend only, minor tweaks.
---

<identity>
Systematic UI build protocol: foundation (tokens) → specifics (features).
Provides phase-specific prompts for `code` delegation.
</identity>

---

<when_to_use>

**Use when:**

- New UI feature with significant frontend
- Component library or design system
- UI redesign

**Do NOT use when:**

- Backend-only changes
- Minor UI tweaks (color, single component)
- Bug fixes

</when_to_use>

---

<prerequisites>

**Before starting:**

- [ ] Plan.md approved (for 🟡🔴)
- [ ] feature-spec.md → UX Design Pass completed
- [ ] checklist-ux-completeness reviewed

</prerequisites>

---

<build_order>

## 9-Phase Implementation

> **Principle:** Each phase builds on previous. Never skip unless adapted (see bottom).

---

### Phase 1: Design Tokens

**Goal:** Visual foundation

**Create:** `src/styles/tokens.css` with:

- Colors (primary, semantic, neutrals)
- Typography (families, sizes, weights)
- Spacing (4px scale: 4, 8, 12, 16, 24, 32...)
- Borders (radius), Shadows, Transitions, Breakpoints, Z-index

**Completion Criteria:**

- [ ] All 7 token categories implemented
- [ ] Semantic naming used (--color-primary-500, not --blue)
- [ ] File importable in project
- [ ] No hardcoded values remain

**Prompt for `code`:**

```markdown
# Task: Setup Design Tokens

## Scope
Create design tokens at `src/styles/tokens.css`.

## Requirements
1. Colors: primary palette, semantic (success/error/warning), neutrals, backgrounds, text
2. Typography: font families, size scale (xs-3xl), weights
3. Spacing: 4px-based (space-1 to space-16)
4. Borders: radius (sm/md/lg/full), shadows (sm/md/lg/xl)
5. Transitions: duration (fast/normal/slow), easing
6. Breakpoints: sm/md/lg/xl
7. Z-index: base, dropdown, modal, tooltip levels

## Constraints
❌ No components yet
❌ No hardcoded values in future code

## Acceptance
✅ All 7 categories implemented
✅ Semantic naming (--color-primary-500, not --blue)

## Reference
- Tokens structure in workflow skill
```

---

### Phase 2: Layout Shell

**Goal:** Page structure

**Create:** Container hierarchy (header, main, sidebar, footer)

**Completion Criteria:**

- [ ] Layout renders at all breakpoints
- [ ] All areas clearly visible
- [ ] Uses token spacing exclusively
- [ ] Mobile-first responsive

**Prompt:**

```markdown
# Task: Create Layout Shell

## Scope
Main layout with placeholder areas.

## Requirements
- Flex/Grid layout using token spacing
- Responsive at all breakpoints
- Placeholders for each area

## Constraints
❌ No real components (placeholders only)
❌ Use tokens for spacing

## Acceptance
✅ Layout renders at all breakpoints
✅ Areas clearly defined

## Reference
- feature-spec.md → Wireframes
```

---

### Phase 3: Navigation

**Goal:** Movement between areas

**Create:** Nav components (tabs/menu, breadcrumbs, back button)

**Completion Criteria:**

- [ ] Navigation functional (clicks work)
- [ ] Active state highlights current location
- [ ] Mobile navigation works (if applicable)
- [ ] Keyboard accessible (Tab, Enter, Esc)

**Prompt:**

```markdown
# Task: Implement Navigation

## Scope
[Specify: tabs/sidebar/navbar from spec]

## Requirements
- Active state styling
- Hover states
- Mobile responsive (hamburger if needed)
- Keyboard accessible (Tab, Enter, Esc)

## Acceptance
✅ Navigation functional
✅ Active state highlights current
✅ Mobile nav works

## Reference
- feature-spec.md → User Flow
```

---

### Phase 4: Core Components

**Goal:** Main UI elements

**Create:** List from feature spec (buttons, cards, lists, key interactives)

**Completion Criteria:**

- [ ] All listed components render
- [ ] All visual states implemented (see checklist)
- [ ] Basic interactions work
- [ ] Token-based styling only

**Prompt:**

```markdown
# Task: Build Core Components

## Scope
1. [Component A] — [variants, props]
2. [Component B] — [variants, props]
[From feature spec]

## Requirements
- Use tokens for ALL styling
- All visual states (default/hover/focus/active/disabled)
- Props for customization
- Keyboard accessible

## Constraints
❌ Mock data only (no real API)
❌ No hardcoded values

## Acceptance
✅ All states implemented
✅ Basic interactions work
✅ Token-based styling

## Reference
- feature-spec.md → Wireframes, Affordance Matrix
```

---

### Phase 5: Data Display

**Goal:** Information presentation

**Create:** Lists/tables/cards, formatting, sorting/filtering UI, pagination

**Completion Criteria:**

- [ ] Data displays correctly with mock data
- [ ] Formatting consistent (dates, numbers)
- [ ] Large datasets handled (pagination/virtualization)
- [ ] Sorting/filtering works (if applicable)

**Prompt:**

```markdown
# Task: Implement Data Display

## Scope
- [List/Table/Cards for X]
- Formatting (dates, numbers)
- [Sorting/filtering if applicable]

## Requirements
- Follow Information Architecture from spec
- Mock data matching API schema
- Pagination if >50 items, virtualization if >500

## Acceptance
✅ Data displays correctly
✅ Formatting consistent
✅ Large datasets handled

## Reference
- feature-spec.md → Information Architecture (Pass 2)
```

---

### Phase 6: Forms & Inputs

**Goal:** User input

**Create:** Form fields, validation UI, submit handling

**Completion Criteria:**

- [ ] All form fields work correctly
- [ ] Validation displays inline on blur
- [ ] Error messages clear and actionable
- [ ] Form accessible (labels, aria)

**Prompt:**

```markdown
# Task: Implement Forms

## Scope
Form: [Name]
Fields: [List with types and validation]

## Requirements
- Inline validation on blur
- Clear error messages below/beside field
- Loading state on submit
- Keyboard accessible (labels, aria-describedby)

## Constraints
❌ No real API (console.log form data)

## Acceptance
✅ All fields work
✅ Validation displays inline
✅ Errors clear and actionable
✅ Accessible

## Reference
- feature-spec.md → Edge States (Validation)
```

---

### Phase 7: States & Feedback

**Goal:** System feedback

**Create:** Empty, Loading, Error, Success, Partial states

**Completion Criteria:**

- [ ] All 5 state types implemented
- [ ] Error messages actionable (not generic)
- [ ] Loading cancellable if >5s
- [ ] Success feedback non-blocking

**Prompt:**

```markdown
# Task: Implement All States

## Scope
1. Empty: helpful message + CTA
2. Loading: skeleton/spinner (no layout jump)
3. Error: clear message + retry
4. Success: toast/confirmation (3-5s)
5. Partial: progress indicator (if applicable)

## Requirements
- Each state has distinct visual
- Error recovery (retry button)
- Long operations (>5s) show cancel

## Constraints
❌ No generic "Error occurred" (be specific)

## Acceptance
✅ All 5 states implemented
✅ Errors actionable
✅ Success feedback non-blocking

## Reference
- feature-spec.md → System Feedback (Pass 4), Edge States (Pass 5)
```

---

### Phase 8: Microinteractions

**Goal:** UI polish

**Create:** Hover states, transitions, animations

**Completion Criteria:**

- [ ] All hover states smooth
- [ ] Transitions use token timing
- [ ] Reduced-motion respected
- [ ] No layout shifts (CLS = 0)

**Prompt:**

```markdown
# Task: Add Microinteractions

## Scope
- Hovers: [buttons subtle scale/shadow, cards elevate, links underline]
- Transitions: [page fade 250ms, modal slide 300ms]
- Animations: [progress bars, confirmation checkmarks]

## Requirements
- Use transition tokens (duration, easing)
- Respect prefers-reduced-motion
- 60fps (use transform/opacity)

## Acceptance
✅ Hovers smooth
✅ Transitions use tokens
✅ Reduced-motion respected

## Reference
- feature-spec.md → Microinteractions (Pass 6)
```

---

### Phase 9: Polish Pass

**Goal:** Final consistency

**Review:** Alignment, spacing, typography, colors, accessibility

**Completion Criteria:**

- [ ] No hardcoded colors/spacing found
- [ ] Focus states visible everywhere
- [ ] WCAG AA contrast met (4.5:1)
- [ ] Build clean (no errors/warnings)

**Prompt:**

```markdown
# Task: Final Polish

## Scope
- Visual consistency check
- All spacing uses tokens (no magic numbers)
- Accessibility audit (keyboard, contrast, screen reader)
- Code cleanup (no console errors, ESLint clean)

## Acceptance
✅ No hardcoded colors/spacing
✅ Focus states visible everywhere
✅ WCAG AA contrast (4.5:1 text)
✅ Build clean

## Reference
- Tokens file, checklist-ux-completeness
```

</build_order>

---

<workflow_rules>

## DO ✅

- Build foundation before specifics (follow phase order)
- Use component checklist for every component
- Test each phase before moving to next
- Generate phase-specific prompts for `code`
- Document deviations from standard flow
- Verify token usage (no hardcoded values)

## DON'T ❌

- Skip phases without documenting why
- Mix multiple phases in one `code` prompt
- Move to next phase with incomplete previous
- Hardcode values when tokens exist
- Ignore mobile/tablet breakpoints
- Skip accessibility requirements

</workflow_rules>

---

<component_checklist>

## Component Quality Gate

**For each component (Phases 2-6):**

**States:** Default, Hover, Focus, Active, Disabled, Loading (if applicable), Error (if applicable)

**A11y:** Keyboard nav, Focus visible, ARIA labels, Contrast WCAG AA (4.5:1)

**Responsive:** Mobile (<640px, 44px touch targets), Tablet, Desktop

**Code:** Uses tokens only, Props documented, No ESLint warnings

</component_checklist>

---

<tokens_structure>

## Design Tokens Structure (Phase 1)

**Required categories:**

```css
/* 1. Colors (semantic naming) */
--color-primary-[50-900]  /* Brand color shades */
--color-success/error/warning/info  /* Status colors */
--color-gray-[50-900]  /* Neutral grays */
--color-bg-*, --color-text-*  /* Contextual colors */

/* 2. Typography */
--font-family-base/mono
--font-size-[xs|sm|md|lg|xl|2xl|3xl]  /* Consistent scale */
--font-weight-[normal|medium|semibold|bold]
--line-height-[tight|normal|relaxed]

/* 3. Spacing (4px or 8px base scale) */
--space-[1-16]  /* Consistent increments */

/* 4. Borders & Shadows */
--radius-[sm|md|lg|full]
--shadow-[sm|md|lg|xl]  /* Elevation levels */

/* 5. Transitions */
--duration-[fast|normal|slow]
--easing-[in|out|in-out]

/* 6. Breakpoints (adapt to project) */
--breakpoint-[sm|md|lg|xl]

/* 7. Z-Index (layered scale) */
--z-base, --z-dropdown, --z-modal, --z-tooltip
```

**💡 Tip:** Use your design system values. See `guides/design-tokens-first.md` for examples.

</tokens_structure>

---

<patterns>

## UI Patterns Quick Reference

**Loading:** Initial → Loading (skeleton/spinner) → Success/Error (retry button)

**Forms:** Inline validation on blur → Submit validation → Error messages specific → Loading on submit

**Lists:** Empty state (CTA) → Loading (skeletons) → Populated → Pagination (>50 items)

**Modals:** Focus trap → Esc to close → Click outside (optional) → Action buttons bottom

**Toasts:** Auto-dismiss 3-5s → Manual dismiss (X) → aria-live region

</patterns>

---

<adaptation>

## Phase Adaptation

| Feature Type | Skip Phases | Why |
|--------------|-------------|-----|
| Read-only dashboard | 6 (Forms) | No input |
| Simple form | 5 (Data Display) | Input-focused |
| Landing page | 5, 6, 7 | Static, few states |
| Component library | 2, 3 per component | Building primitives |

**Rule:** Can skip, but NEVER reorder.

</adaptation>

---

<completion_criteria>

## Workflow Completion Criteria

**Ready to finish when:**

- [ ] All applicable phases completed (or skipped with reason)
- [ ] Component checklist passed for all components
- [ ] No hardcoded colors/spacing/typography
- [ ] Accessibility audit passed (WCAG AA minimum)
- [ ] All breakpoints tested (mobile/tablet/desktop)
- [ ] Build clean (no errors/warnings)
- [ ] Code reviewed by `review`
- [ ] feature-spec.md requirements met

**Output Artifacts:**

1. Implemented UI matching feature-spec.md
2. Design tokens file
3. All components with full state coverage
4. Passed accessibility audit
5. Clean build ready for integration

</completion_criteria>

---

<output_format>

## Expected Output from architect

```markdown
# 🎨 UI Implementation Plan: [Feature Name]

## Phases Breakdown

**Phase 1: Design Tokens** → Status: Ready
- Delegation: `code`
- Prompt: [Copy from workflow Phase 1]
- Review: `review` (verify token completeness)

**Phase 2: Layout Shell** → Status: Waiting Phase 1
- Delegation: `code`
- Prompt: [Copy from workflow Phase 2]
- Review: `review` (verify responsive)

[Continue for all 9 phases...]

## Adaptations
- Skipping Phase 6 (Forms) — read-only dashboard

## Delegation Sequence
1. Phase 1 → `code` → `review` ✅
2. Phase 2 → `code` → `review` ⏳
3. [...]

## Estimated Timeline
9 phases × 0.5 days = 4.5 days total

## Completion Checklist
- [ ] All phases executed
- [ ] Component quality gates passed
- [ ] Accessibility audit passed
- [ ] Build clean

***

🛑 STOP — Ready to delegate Phase 1 to `code`
```

</output_format>

---

<quick_reference>

```
9-Phase Flow:

1. Tokens     → Foundation
2. Layout     → Structure
3. Navigation → Movement
4. Components → UI elements
5. Data       → Presentation
6. Forms      → Input
7. States     → Feedback
8. Micro      → Polish
9. Review     → Consistency

Each phase: Prompt → `code` → Verify completion → Next
```

</quick_reference>

---

**Related:** `feature-spec-template.md`, `checklist-ux-completeness`, `/docs/Plan.md`  
**Loaded by:** architect  
**Delegates to:** code (phase prompts)  
**Verified by:** review

---
