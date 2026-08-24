---
name: workflow-feature
description: |
  Add functionality to a system that already exists: where it attaches, the
  edges the request never mentioned, first slice end to end. Triggers:
  "добавь", "нужна фича", "хочу чтобы можно было". Broken →
  `workflow-debugging`; from nothing → `workflow-new-project`.
---

# Adding a Feature

The request states the happy path. Everything that makes the feature hard is what it left out — the rows that predate it, the second actor doing the same thing, the call that times out, the permission nobody named.

A feature also lands in a system that already works. Most of the risk is in the fit, not in the new code.

## 1. Read the request

One plausible reading, or several? If you cannot state what *done* looks like in a sentence the user would agree with, the requirements are not there yet — run `grilling`, and `workflow-requirements-interview` for the territory it must cover.

Then find where the feature attaches: the `memory/repo-wiki/` entry for the area it touches, `FACTS.md` for the constraints already discovered, `DECISIONS.md` and `memory/adrs/` for what is already settled. A feature that contradicts an existing decision is a decision to reopen out loud, not a detail to code around.

**Done when:** you can name the modules it touches and the one sentence that says what works afterwards.

## 2. Find the edges

The dimension nobody asks about is the one that returns as a bug three weeks later. Walk all of them:

| Dimension | The question to answer |
|---|---|
| **Existing data** | What happens to records created before this feature existed? |
| **Boundaries** | Zero items, exactly one, far more than expected; the longest input someone actually sends |
| **Permission** | Who reads it, who changes it, and what does the wrong actor get back? |
| **Concurrency** | Two actors doing this at the same moment — what wins, and does the loser know? |
| **Failure** | Its dependency times out or errors: what does the user see, and what state is left behind? |
| **Lifecycle** | Delete, restore, archive — what happens to everything pointing at it? |
| **Compatibility** | During rollout: old clients, running jobs, cached responses, in-flight requests |

Every answer becomes a requirement or an explicit OUT of scope. For UI work, `checklist-ux-design` covers the interface states — loading, empty, error, first visit — on the same principle.

**Done when:** each dimension has an answer or an explicit "not applicable, because …".

## 3. Assess and route

Complexity levels and their required artifacts are in `CLAUDE.md`. Weigh the answers from step 2, not the size of the request as stated — a one-line ask that turns out to touch permissions is not 🟢.

Escalate the moment the feature touches an auth boundary, changes the schema, alters a contract someone else depends on, or spreads across modules that were independent before.

## 4. Plan (🟡🔴)

`architectural-planning` holds decomposition, scope, and the prompt; its `references/plan-template.md` holds the document. Run `prior-art` before decomposing where the feature is a self-contained capability — a parser, a scheduler, a rate limiter, a signature check — because taking a package reshapes the decomposition rather than following from it. Reach for `codebase-design` when the feature needs a new module or a seam, and the matching pattern skill when it needs an architecture, access model, or tenant isolation that already has a name — `pattern-clean-architecture`, `pattern-modular-monolith`, `pattern-rbac`, `pattern-multi-tenant`, `pattern-feature-flags`.

**Sequence the slices so the first one runs end to end.** The thinnest possible path through every layer the feature touches — one field, one route, one screen — proves the attachment before any breadth is built on top of it. Widen from there. Slices cut per layer hide the integration risk until the last one lands, which is exactly when it is most expensive.

Then STOP for approval, and pass the plan through the `vibe-mentor` checkpoint before it reaches `code`.

## 5. Build

One slice per delegation, `review` after each phase. Tests are `tdd`: red before green, at the seam the slice actually crosses. A FAIL gets classified before it is retried — `CLAUDE.md` law 5 — and a second failed cycle on the same slice routes to `debug` rather than a third attempt.

## 6. Close

Close by `rules/memory-protocol.md`. What a feature adds to it: a module that is new or significantly changed earns a `repo-wiki` entry and its tags in `meta.json`, because the next feature attaches to what that entry describes.

## Completion criterion

Shipped when: every acceptance criterion is verified by running something; every edge dimension is answered or explicitly out of scope; `review` returned PASS on each phase; the feature works end to end through the real interface, not only in tests; and `memory/` reflects what changed.

## Related

- `workflow-requirements-interview` + `grilling` — the request has more than one reading
- `prior-art` — the slice is a capability that may already exist as a package
- `architectural-planning` — decomposition, scope, prompts, handoff
- `checklist-ux-design` — UI features, before implementation
- `tdd` — the red → green loop per slice
- `checklist-code-review` — the gate after each phase
- `workflow-architecture-change` — the feature turns out to require a different architecture
