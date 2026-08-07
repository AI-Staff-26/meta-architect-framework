---
name: workflow-refactoring
description: |
  Change structure while behaviour stays identical — the safety net, the
  green-to-green loop, and the rule that tests do not change. Triggers:
  "почисти", "отрефактори", "надо упростить", "технический долг". Wrong
  behaviour → `workflow-debugging`; new behaviour → `workflow-feature`.
---

# Refactoring

**Refactoring is defined by what stays the same.** Structure moves; observable behaviour does not.

That definition is a safety property, not a purity rule. Work labelled *refactor* gets reviewed as a refactor — the reviewer checks that nothing changed, and does not look for the correctness of anything new. Behaviour that slips in under the label passes through the one gate that would have caught it.

## Establish the safety net first

Behaviour that is not covered is behaviour you are about to change without knowing.

**No tests means tests come first.** Not a full suite — coverage of the code being touched, at the seam it is touched through. `tdd` holds where the seam belongs and what makes such a test worth keeping.

These are **characterization tests**: they describe what the code does today, not what it should do. If current behaviour is odd, the test records the oddity — that is correct, because preserving it is the whole contract of this task. A bug found this way gets written down and fixed in its own change, with its own review.

*Ready when:* the affected behaviour runs under test, the suite is green, and you have watched it go green rather than assumed it.

## Name the improvement

State what gets better in terms someone else can check: duplication between two named files removed; a module testable without a database; a function that fit on one screen. "Cleaner" and "better" have no end state, and refactoring without an end state does not have one either.

Write down the starting state too — files in scope, the problem, the intended shape. It is what tells you, mid-change, whether you are still doing the thing you started.

## The loop

**Green → change → green.** Every step starts and ends with a passing suite.

This is not the red → green of `tdd`. There is no red bar here: a red bar during a refactor means the last step was too large or changed behaviour, and the response is to revert it, not to debug it. Reverting one small step costs seconds. Debugging a large one costs the afternoon and often ends with a test edited to make it pass.

Steps stay small enough that reverting one is never an expensive decision, and the suite runs after every one, not at the end.

## Tests do not change

A test edited to make it pass is behaviour change with the evidence removed. The suite is the invariant; if it fails, the code moved further than intended.

One case is legitimate and is its own step: a test that asserts on an implementation detail being deliberately removed — an internal method name, a call count. Move that test to the behaviour it was really protecting, while everything is green, as a separate change, and say so. Never in the same step as the restructuring it would otherwise be evidence for.

## Pick the transformation by blast radius

| Transformation | Reaches | Notes |
|---|---|---|
| Rename, extract function, inline | One file | Safest; let the tooling do it where it can |
| Move between files or modules | Callers across the repo | Update every call site in the same step, so the suite stays honest |
| Extract type or class, split a god object | The module's shape | Needs a plan for 🟡; the new boundary is a design decision — `codebase-design` |
| Replace conditionals with polymorphism, decompose a module | Structure and its callers | 🔴 territory; phase it, review each phase |

**Escalation signal:** the moment the change touches a public contract, a layer boundary, or a pattern the project follows elsewhere, this stopped being a refactor. It is an architecture change — `workflow-architecture-change`, with an ADR.

## Keep it separate

One delegation does one kind of change. A refactor mixed with a feature or a bug fix produces a diff where the behaviour change is invisible among moved lines, and neither part can be reverted without the other.

When something worth fixing turns up mid-refactor, note it and keep going. It becomes its own task, with its own test.

## Completion criterion

Done when: the whole suite passes with no test edited, except any test move that was made deliberately and stated; the named improvement is present and checkable; public contracts and observable behaviour are unchanged; no feature or fix rode along; and `review` confirmed all of it against the starting state.

## Related

- `tdd` — where the test goes, and what makes it worth keeping
- `codebase-design` — depth, seams, and whether the new boundary earns its place
- `checklist-code-review` — the gate afterwards
- `workflow-architecture-change` — the change outgrew refactoring
- `workflow-debugging` — the behaviour turns out to be wrong, not just ugly
