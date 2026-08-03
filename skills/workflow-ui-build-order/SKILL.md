---
name: workflow-ui-build-order
description: |
  The order UI gets built in — a thin shared foundation of tokens, shell, and
  navigation first, then one vertical slice per feature, then a consistency
  pass. Use when implementing a screen, a frontend feature, or a component
  library, when a UI is being rebuilt, or when deciding what to build before
  what. For the design decisions that precede the code use `checklist-ux-design`;
  for verifying an implemented UI use `checklist-ux-review`.
---

# UI Build Order

Two forces pull in opposite directions, and the order resolves them.

Anything **shared across screens** — the type scale, the spacing rhythm, the shell — has to exist before the first screen commits to values. Built later, every screen has already invented its own, and the design system becomes an attempt to reconcile contradictions after the fact.

Anything **specific to one feature** is best built as a vertical slice that runs end to end, for the reason every vertical slice is: it can be seen working.

So: **a thin foundation, then vertical slices.** Thin is the operative word — the foundation is sized to the first real screen, not to the product as imagined.

## The foundation

Built once, before feature work, and only this much:

**1. Tokens.** Colour, type, spacing, radius, shadow, motion, breakpoints, z-index — semantic names rather than literal ones (`--color-danger`, not `--red-500`). Take the project's existing design system values where there is one; invent only what is missing.
*Done when:* a screen can be built without a single literal colour, size, or duration.

**2. Shell.** The page container and its regions — header, main, aside, footer — responsive, spaced in tokens, holding placeholders.
*Done when:* the shell holds at every breakpoint with placeholder content, and nothing inside it is real yet.

**3. Navigation.** Movement between regions, with the active location visible and the keyboard path working.
*Done when:* every route in scope is reachable by mouse and by keyboard, and the current one is identifiable without reading the URL.

Stop the foundation there. A component library built before any screen needs it is a guess about what the screens will need, and guesses in shared code are the expensive kind.

## Then, one slice per feature

A slice is one behaviour, complete: the component, the data it shows, the input it takes, and the feedback it gives. Inside the slice the order still matters, because each step constrains the next:

| Step | What it settles |
|---|---|
| **Structure** | What the thing is and what it is made of — variants, props, composition |
| **Data** | What real content does to it: long strings, many rows, missing fields, formatting |
| **Input** | What the user can change, and how validation is surfaced |
| **Feedback** | What the user sees while it works, when there is nothing, and when it fails |

**Feedback belongs to the slice that introduces it.** A component that fetches ships its loading, empty, and error states in the same slice — not in a later states pass. Scheduled later, those states do not get built: by then the feature looks finished, and the work reads as polish that can slip.

Every component in a slice carries the same gate before the slice is done: all interactive states present (default, hover, focus, active, disabled), keyboard reachable with focus visible, contrast at WCAG AA, usable at mobile width with touch targets that can actually be hit, and styling drawn from tokens only.

## The consistency pass

Once, at the end of the feature — the sweep that individual slices cannot do because it looks across them: alignment and rhythm, terminology, motion timing drawn from tokens and honouring reduced-motion, an accessibility pass over the whole flow, and a search for literals that escaped into the code.

Then `checklist-ux-review` verifies it. That checklist is the verification; this skill is the sequence.

## Adapting

Drop what the feature has no need for — a read-only dashboard has no input step, a landing page has neither data nor input, a component library builds primitives against the foundation without a shell of its own. Say which step was dropped and why.

The order among the steps that remain holds. Building input before the structure it lives in, or data display before the component that shows it, means redoing the earlier one — that is not a shortcut, it is the same work twice.

## Token categories

```css
--color-primary-[50…900], --color-{success|error|warning|info}, --color-gray-[50…900], --color-{bg|text}-*
--font-family-{base|mono}, --font-size-[xs…3xl], --font-weight-*, --line-height-*
--space-[1…16]                       /* one base unit, 4px or 8px, multiplied */
--radius-*, --shadow-*               /* elevation as a scale, not per component */
--duration-*, --easing-*
--breakpoint-*, --z-{base|dropdown|modal|tooltip}
```

## Completion criterion

Done when: no literal colour, spacing, or duration remains in feature code; every component passes its gate; every state a component can be in has a design and an implementation; the flow works by keyboard end to end; the UI holds at mobile, tablet, and desktop widths; and each dropped step is named with its reason.

## Related

- `checklist-ux-design` — the decisions made before any of this is built
- `checklist-ux-review` — verification of the implemented UI
- `frontend-design` — aesthetic direction when the UI needs to look like something
- `workflow-feature` — the feature this UI belongs to
- `architectural-planning` — turning each slice into a prompt
