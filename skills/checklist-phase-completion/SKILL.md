---
name: checklist-phase-completion
description: |
  Whether a phase is actually finished or only feels finished — the checkable
  condition for each transition from understanding to planning to
  implementation to review to closing. Use before moving a task forward, when
  resuming work someone else left, when a review keeps finding things the
  previous phase should have settled, or when asking "готово ли это".
  Catches premature completion, the failure that gets more expensive with
  every phase it survives.
---

# Is This Phase Actually Done

Work rarely fails by doing the wrong thing. It fails by carrying an unfinished phase forward under the label *done* — attention slides to being finished while the thing itself is not, and every later phase then builds on the gap.

The cost multiplies as it travels. A scope left vague costs a paragraph to fix during understanding, a re-plan during planning, a rewrite during implementation, and a FAIL cycle during review. Each transition below has a condition you can check by looking rather than by feeling.

## The transitions

| Moving from → to | True before you move | What the unfinished version looks like |
|---|---|---|
| **Understanding → research or planning** | You can state what *done* looks like in one sentence the user would agree with, and the unknowns are named as unknowns | Scope described by the name of the feature; "выяснится по ходу" |
| **Research → planning** | The cause or the mechanism is supported by evidence you can point at, and the alternatives considered are written down with why they lost | «Скорее всего из-за…» — a plausible theory that nothing was tested against |
| **Planning → implementation** | Approved at a STOP; every acceptance criterion names how it gets checked; every file is listed or marked CREATE; the `vibe-mentor` checkpoint passed for 🟡🔴 | Criteria that read "работает корректно"; a file list that says "и связанные файлы" |
| **Implementation → review** | Every criterion is checked off with how it was verified; the full suite and the linter were run, and you saw the output | "Должно работать"; the suite was run before the last three edits |
| **Review → closing** | PASS; or findings classified by severity and routed — plan, prompt, or targeted fix | A FAIL retried with the same prompt because the findings looked minor |
| **Closing → done** | The path works through the real interface, not only under test; `memory/` reflects what changed; the work report is written and referenced | The report describes what was intended rather than what landed |

## Skipping is a decision, not a shortcut

🟢 work skips planning because the level says so — that is the framework working, not a phase left unfinished. The difference is whether the skip was decided out loud with a reason, or simply happened.

The reverse case matters more: a phase that keeps producing questions belonging to the previous one means the previous one is not done. Going back costs one step now; going forward costs every step after.

## Tells of premature completion

- «Это потом починю» — the follow-up task does not exist, so *potom* is *never*
- «Код выглядит правильно» — looking right and running right are separate claims; run it
- The criteria are restated in the report instead of verified against
- The report is written in the future tense — *будет*, *должно*
- The phase ended exactly when it became tedious rather than when it became complete
- The next phase opens by re-establishing what the previous one was supposed to have settled

Any of these is a signal to reopen the phase, not to argue it closed. Reopening while the context is still loaded costs a fraction of what rediscovering it later costs.

## Completion criterion

A phase is done when its row above is true by inspection — you can name the artifact, the command, or the file that proves it — and nothing in the next phase depends on something you intend to settle later.

## Related

- `architectural-planning/references/plan-template.md` — what an approved plan contains
- `forensic-investigation/references/research-template.md` — what finished research contains
- `checklist-code-review` — the review phase itself
- `memory-keeping` — the work report that closes the task
- the `vibe-mentor` agent — the checkpoint before implementation, and phase readiness generally
