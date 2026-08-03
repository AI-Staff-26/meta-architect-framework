---
name: checklist-ux-design
description: |
  6-pass UX DESIGN methodology for UI-heavy features. Mental model, information 
  architecture, affordances, feedback, edge states, microinteractions. Used by 
  `architect` BEFORE implementation to prevent "vanilla UI".
---

<purpose>
Pre-implementation UX design checklist. Ensures all UX aspects are considered
BEFORE coding begins. Prevents "vanilla UI" syndrome.
</purpose>

---

<when_to_use>

## Activation

**Load for:**

- 🟡 Medium or 🔴 Complex features with significant UI
- New user-facing workflows
- Design spec creation

**Before:**

- `code` starts UI implementation
- Feature spec finalized

</when_to_use>

---

## Pass 1: Mental Model Alignment

> What does the user THINK is happening?

- [ ] User expectations documented
- [ ] Familiar patterns identified (what apps/UX user knows)
- [ ] Potential misconceptions listed
- [ ] Entry points and first impressions defined
- [ ] Progressive disclosure strategy (if complex)

**Key question:** "What will the user expect when they first see this?"

---

## Pass 2: Information Architecture

> What exists in the app and how is it organized?

- [ ] All entities/concepts named
- [ ] Hierarchy structure defined
- [ ] Relationships between entities documented
- [ ] Grouping and ordering logic established
- [ ] Navigation paths mapped

**Key question:** "What are the 'things' the user will interact with?"

---

## Pass 3: Affordance & Action

> What looks clickable/editable/draggable?

- [ ] Primary actions identified and prominent
- [ ] Secondary actions accessible but not distracting
- [ ] Editable fields distinguishable
- [ ] Draggable elements have visual signals
- [ ] Disabled states clearly indicate "not available"

**Key question:** "How will user know what they can DO?"

---

## Pass 4: System Feedback

> How does the system respond to user actions?

| State | Checklist |
|-------|-----------|
| **Empty** | [ ] Helpful message + CTA |
| **Loading** | [ ] Skeleton or spinner + cancel option if long |
| **Partial** | [ ] Progress indicator ("X of Y") |
| **Error** | [ ] Clear reason + recovery action |
| **Success** | [ ] Confirmation + next steps (if any) |
| **Conflict** | [ ] Explanation + resolution options |

**Key question:** "What feedback does user get for every action?"

---

## Pass 5: Edge States

> Unusual but important scenarios

- [ ] **First visit** — onboarding, tooltips, empty guidance
- [ ] **Empty state** — not just blank, but helpful
- [ ] **Data overload** — pagination, filtering, search
- [ ] **Slow connection** — optimistic UI, timeouts
- [ ] **Offline mode** — cached data, sync status
- [ ] **Validation errors** — inline, timely, actionable
- [ ] **Concurrent edits** — conflict detection & resolution
- [ ] **Undo capability** — reversible destructive actions
- [ ] **Permission denied** — graceful handling

**Key question:** "What happens when things aren't 'normal'?"

---

## Pass 6: Microinteractions

> The details that make UI feel alive

### Hover States

- [ ] Buttons: subtle feedback (scale, color, shadow)
- [ ] Cards: elevation change, border
- [ ] Links: underline, color transition

### Transitions

- [ ] Page transitions: timing defined (200-300ms typical)
- [ ] Modal/drawer: smooth open/close
- [ ] List items: enter/exit animations

### Progress & Confirmation

- [ ] Upload: progress bar with percentage
- [ ] Save: spinner → checkmark transition
- [ ] Delete: confirmation → fade animation

**Key question:** "Does the interface feel responsive and alive?"

---

<quick_reference>

## Quick Reference

```text
Before `code` starts UI work, verify:

✅ Pass 1: User expectations documented
✅ Pass 2: Entities & hierarchy defined  
✅ Pass 3: Actions & affordances clear
✅ Pass 4: All states have feedback
✅ Pass 5: Edge cases handled
✅ Pass 6: Microinteractions planned
```

</quick_reference>

---

<anti_patterns>

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Skip UX pass | AI makes decisions "at game time" | Complete checklist before coding |
| Generic states | "Error occurred" with no action | Specific messages + recovery |
| Missing loading | User thinks app is frozen | Always show progress |
| No empty state | Blank screen confuses users | Helpful guidance + CTA |
| Invisible actions | User doesn't know what's clickable | Clear affordance signals |

</anti_patterns>

---

<handoff_protocol>

## Handoff Protocol

### Input Required

- Feature requirements / user story
- Target user profile
- Complexity assessment (🟡/🔴)

### Output Produced

- Completed 6-pass checklist
- UX Design Pass section for feature-spec

### Handoff To

| Next Role | What They Receive |
|-----------|-------------------|
| `code` | Completed UX design ready for implementation |
| `review` | Baseline expectations for `checklist-ux-completeness` |

</handoff_protocol>

---

**Used by:** `architect`  
**Followed by:** checklist-ux-completeness (verification)
