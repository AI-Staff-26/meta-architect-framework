---
name: checklist-ux-review
description: |
  Verification of an implemented UI by driving it — every interactive and data
  state reached deliberately, one keyboard traversal of the real flow, contrast
  and colour independence, the supported widths, and the copy. Use after a UI
  feature or component lands, for a design-system change, a pre-release UI pass,
  or an accessibility audit; the `review` agent loads it as a fourth axis for
  user-facing diffs. Triggers: "проверь интерфейс", "UX-ревью", "доступность".
  For the decisions that precede the code use `checklist-ux-design`.
---

# UI Verification

**Verify against the running interface, not the source.** Reading a component tells you that a state exists in the code; driving it tells you what the user sees. Between the two sit the state that renders behind a condition never met, the focus ring the reset stylesheet removed, and the empty message no fixture ever triggers.

So a state that was not reached was not reviewed, and it is reported as unverified rather than counted as passed.

## Reach every state

Each state gets reached on purpose. Reaching it is the inconvenient part, which is why it is the part that gets skipped.

| State | How to reach it | What passes |
|---|---|---|
| **Default** | Open the screen with ordinary fixture data | Matches the recorded design decision |
| **Hover** | Point at each interactive element | Visibly distinct, and only on things that are actually interactive |
| **Focus** | Tab to it — never click it | Ring visible against whatever background it lands on |
| **Active** | Hold the press | Something changes while held |
| **Disabled** | Create the condition that disables it | Distinguishable without relying on colour, and it says why |
| **Loading** | Throttle the network to slow, or delay the response | Skeleton or spinner appears immediately; layout does not jump when data lands |
| **Slow** | Delay the response past the point it feels broken | The wait is acknowledged; the control cannot be submitted twice |
| **Empty** | Empty the fixture, or filter to no matches | A sentence explaining it, and the action that fills it |
| **Error** | Block the request, or force a 5xx | Says what happened and what to do next; retry is reachable |
| **Partial** | Fail one request of several, or return the first page only | The loaded part is usable and the missing part is named |
| **Populated** | Paste far more rows and far longer strings than the layout was drawn for | No overflow, and no truncation that removes meaning |
| **Denied** | Revoke the permission on the test account | No dead end: the control is absent or explains itself |
| **Invalid** | Submit the form with the wrong value in each field | Message beside the field, and the input is preserved |
| **Success** | Complete the action | The result is confirmed, and what comes next is stated |
| **Conflict** | Open the record in two sessions and save the second | The clash is named and the options offered, rather than one write silently winning |
| **Destructive** | Trigger the irreversible action | Undo is offered, or the confirmation names exactly what is lost |
| **Reduced motion** | Set the OS reduced-motion preference | Transitions shorten or stop, and nothing needs an animation to be understood |

## The keyboard pass

One traversal of the real flow, from the top of the page to a completed task, with the mouse untouched.

Confirm as you go: focus is visible at every stop, the order matches the visual order, nothing traps, `Escape` closes what it opened, and focus returns to the control that opened it. Everything reachable by pointer is reachable by key. Along the same walk, each control announces a name — label, `alt`, or `aria-label` — and errors and live updates are announced rather than only drawn.

State the finding as the step where the traversal broke: "stop 7 enters the dialog and cannot leave it" is actionable; "keyboard navigation issues" is not.

## Colour and contrast

Contrast at WCAG AA on the rendered pixels — 4.5:1 for body text, 3:1 for large text and UI boundaries — measured in each variant, including hover, disabled, and text over an image.

**No state is signalled by colour alone.** Error, selected, required, and status each carry a second cue: icon, text, weight, or position. This failure is invisible to a reviewer who can see colour, so check it by asking what survives with the hue removed rather than by looking. Text still reads and reflows at 200% zoom.

## Widths and touch

Check the widths the project actually supports — read them from its breakpoint tokens, falling back to mobile, tablet, and desktop only where no tokens exist.

- **Run, do not judge:** no horizontal overflow at any supported width, no layout shift as content arrives, images sized for the slot they land in. These are measurable; measure them.
- **Needs eyes:** whether the reflowed layout still makes sense — what got hidden, whether the reading order survived, whether the primary action is still reachable by thumb. Touch targets at least 44×44 CSS px, with space between neighbours.

## Copy

Placeholder text that reaches review — lorem ipsum, "TODO", a sample name — is a finding, not a note. Button labels are verbs naming the outcome, not "OK". A second name for an entity the design already named is a divergence, not a preference. Where the project translates, strings are externalised and the layout survives text a third longer.

## Measure against the recorded decision

`checklist-ux-design` recorded the decisions: the primary action, the entity names, each state's copy, the motion. This checklist verifies the implementation against that record, and a divergence is a finding **against the plan** — quote the decision it diverges from. Reviewer preference does not enter.

Where no decision was recorded, the finding is that the decision was never made. Name the gap and route it back to `checklist-ux-design`. Inventing the missing decision inside a review conceals that the interface shipped without one.

## Severity and verdict

| Severity | Criterion | Effect |
|---|---|---|
| 🔴 Critical | Unusable for some users — no keyboard path, contrast below AA, a control with no accessible name | FAIL |
| 🟠 High | The flow breaks or a state is missing — no loading, empty, or error state; layout breaks at a supported width | FAIL |
| 🟡 Medium | Correct but rough — hover absent, an error that is accurate but generic, copy vague | PASS, logged as follow-up |
| 🟢 Low | Polish — animation timing, a one-off alignment | PASS, optional |

Every finding carries the component, the state it was found in, and the direction of the fix:

```
🟠 OrdersTable — empty — blank region under the header
   → empty state with the copy recorded in Plan.md, UX §4
```

Verdict is PASS when no 🔴 or 🟠 remains, and it follows from the table rather than from overall impression.

## Completion criterion

Done when: every state in the table was reached in the running interface or reported as unverified with the reason; the keyboard traversal ran end to end, or the step it broke at is named; contrast and colour independence were checked on rendered pixels; every supported width was checked, the measurable part was actually measured, and the reflowed layout was looked at rather than only its numbers; the copy was read for placeholder text, verb labels, and entity names; each finding carries component, state, severity, and direction of fix; each divergence names the decision it departs from, or names it as never recorded; and the verdict follows from the severity table.

## Related

- `checklist-ux-design` — the decisions this verifies against, and where a missing one goes back to
- `workflow-ui-build-order` — the sequence that builds what this checks
- `checklist-code-review` — the code-level gate on the same diff
- `frontend-design` — when the finding is that it looks like nothing, not that a state is missing
- `checklist-infra` — the same verify-the-artifact rule, on the infrastructure side
