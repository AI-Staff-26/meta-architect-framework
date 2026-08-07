---
name: workflow-architecture-change
description: |
  Changing the shape of a running system — data migrations, replacing a
  framework or database, splitting a monolith, breaking a public contract,
  moving infrastructure. Covers choosing the migration strategy, finding the
  point of no return, and phasing the work so each step can be reversed. Always
  🔴. Use before any change where rollback is not simply reverting a commit.
  For structure without behaviour change use `workflow-refactoring`.
---

# Architecture Change

Ordinary work can be reverted by reverting a commit. This work cannot: data has been transformed, clients have been migrated, a service someone depends on has been turned off. **The plan is a plan for retreat as much as for advance.**

Two questions decide everything that follows: *what is the point of no return*, and *how long can both worlds coexist*. Answer them before choosing a strategy.

Always 🔴 — so the full path applies: investigation, plan, ADR, STOP, phased execution with a review per phase.

## 1. State the change as a pair

Current shape, target shape, and — the part usually skipped — the **driver**. What forces this now? Scale that hurts today, a cost that compounds, a limit already hit, a dependency going end-of-life. "It would be cleaner" is not a driver; it is a preference, and preferences do not survive the third week of a migration.

Then map the impact across data (migrated? reversible?), contracts (who breaks, and can they be versioned instead), dependencies (which modules, which external systems), infrastructure (what new thing must exist and be operated), and the team (who can run this).

The output is a `Research.md` — `forensic-investigation/references/research-template.md` for the shape, or `debug` to produce it when the current system is not understood well enough to describe. **STOP** before planning.

## 2. Choose how the two worlds coexist

The strategy is the single highest-leverage decision here, and it is chosen by how reversible you need to stay and how long you can afford to run both.

| Strategy | How it works | Costs | Fits when |
|---|---|---|---|
| **Strangler fig** | New system takes routes one at a time from behind a facade; old one shrinks | Longest calendar time; both run for months | The system is decomposable and must stay live — the default for anything large |
| **Parallel run** | Both process everything; outputs compared; only one is authoritative | Double the compute; comparison logic to build and discard | Correctness must be proven on real traffic before switching — money, billing, ledgers |
| **Feature-flagged switch** | One code path, selected at runtime, rolled out by percentage | Both paths must stay valid in one codebase | The change is internal and can be expressed as one branch point |
| **Big bang** | Everything switches at once | Rollback is a full restore; failure is total | Genuinely small, or a hard external deadline leaves no coexistence window — say so explicitly |

Write down which was chosen and why the others were not. That is the ADR: `references/adr-template.md`.

## 3. Phase it so each step stands alone

Every phase ends in a system that works and can be shipped. A phase that only makes sense followed by the next one is not a phase — it is the middle of one, and it cannot be reviewed, deployed, or abandoned.

For each phase name: what it delivers, how it is verified, and how it is reversed. The reversal is not a sentence — it is a command or a procedure, written before the phase starts, when there is no pressure.

**Locate the point of no return** and mark it in the plan. It is the first irreversible act: dropping the old column, deleting the old service, breaking the old contract for the last client. Everything before it is rehearsal, and it should be rehearsed. Everything after it is committed, and the plan should say what the recovery is when there is no rollback — a restore from backup with an accepted data loss window, usually, which is a decision the user makes rather than discovers.

Where data moves: the migration is written with its reverse, tested on a production-sized copy, and validated by comparing the two sides rather than by the migration reporting success. Backups are verified by restoring one, not by existing.

Where a public contract changes: version it and run both, deprecate with a date, and hold the old one until the clients are actually gone — measured, not assumed.

The plan lands in `/docs/Plan.md` (`architectural-planning/references/plan-template.md`) with the phases, the strategy, the rollbacks, and the point of no return. **STOP** for approval.

## 4. Execute

One phase per delegation, `review` after each, a checkpoint commit between them. Between phases the system is releasable — verify that rather than assuming it.

Anything touching data or a contract is rehearsed on staging with production-shaped data before it runs anywhere else, and the rollback is rehearsed there too. A rollback that has never been executed is an intention.

After the switch: watch error rate, latency, and the business metric the system exists to serve. Decide the abort threshold before deploying, because deciding it while the graph is moving is how a rollback becomes a debugging session.

## 5. Close it

The ADR moves to Accepted, the wiki entries for changed modules are rewritten rather than annotated, and the old path's removal becomes a scheduled task with a date — otherwise both systems live forever and the migration's cost never ends.

## Completion criterion

Done when: the driver is named and still true; the strategy is chosen with the alternatives recorded in an ADR; every phase has verification and a reversal that has been executed at least once in a rehearsal; the point of no return is marked and its recovery agreed with the user; data migrations validated by comparison against a production-sized copy; monitoring stayed within threshold through the switch; and the removal of the old path is scheduled, not implied.

## Related

- `references/adr-template.md` — the ADR this produces (also the format for any ADR in `memory/adrs/`)
- `architectural-planning/references/plan-template.md` — the phased plan
- `forensic-investigation/references/research-template.md` — the investigation that precedes it
- `workflow-legacy-analysis` — the current shape is not understood well enough to describe
- `workflow-refactoring` — the change turns out not to alter contracts or data
- `pattern-clean-architecture`, `pattern-modular-monolith`, `pattern-multi-tenant` — the target shape has a known name
