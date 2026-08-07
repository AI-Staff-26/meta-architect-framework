---
name: pattern-feature-flags
description: |
  A flag is a branch that lives in production: shipping one ships both paths
  and the obligation that comes with them — a removal date, or the acceptance
  that it is now a permanent operational control. Covers the four flag types
  and their lifespans, the fallback when the flag store is unreachable,
  consistent bucketing for percentage rollouts, and cleanup as part of the work
  that created the flag. Use for a gradual rollout, a kill switch, an A/B
  experiment, per-plan entitlements and limits, trunk-based development, or
  making a 🔴 rollout reversible; triggers "фича-флаг", "выкатить на часть
  пользователей".
  Whether this actor may act at all is `pattern-rbac`.
---

# Feature Flags

**A flag is a branch that lives in production.** Shipping one ships both paths and the obligation that comes with them: either a date it is removed, or the acceptance that it is now a permanent operational control. A flag with neither is untested code with a switch on it.

A value that only changes by deploy is configuration, not a flag: it has no second path and nothing to remove, and giving it a type, an owner and an evaluation log buys nothing.

So the first decision is not the toggle — it is which kind of flag this is, because the kind sets everything after it.

## The four types differ by lifespan

| Type | Question it answers | Lifespan | Removal |
|---|---|---|---|
| **Release** | Is this unfinished work visible yet? | Temporary — one release cycle | A removal ticket created together with the flag |
| **Experiment** | Which variant wins? | A fixed measurement window | The window closes, a decision is recorded, both flag and losing path go |
| **Ops kill switch** | Can we turn this off at 3am? | Permanent by design | None — this is an operational control, not debt |
| **Entitlement** | Does this plan or tenant include the capability? | Permanent | None — it belongs to the billing and tenant model |

Two of these are debt on a clock and two are product surface. Calling a permanent control "technical debt" gets it deleted the week you need it; calling a release flag permanent is how a branch survives three years unread. Each flag also names the person who decides when it ends — a flag the whole team owns is a flag nobody removes.

## Entitlement is not permission

An **entitlement** asks whether the plan includes a capability. A **permission** asks whether this actor may act, and that is `pattern-rbac`. Conflating them is how billing rules end up inside the authorisation service, where a pricing change becomes a security change and a plan upgrade goes through a permission migration.

The two compose: the entitlement decides whether the feature exists for this tenant, the permission decides who inside that tenant may use it. In a multi-tenant product the entitlement is keyed by tenant and lives with the plan model — `pattern-multi-tenant`.

Entitlements are often quantitative — seats, storage, API rate. A plan limit is the same lookup returning a number instead of a boolean, under the same fallback rule, which is why it belongs here and not in a second configuration system.

## The fallback is part of creating the flag

Every evaluation returns something when the flag store is unreachable, and the answer is decided when the flag is created, not discovered during the outage. Choose it so failure lands on the safe side.

A kill switch that fails open is not a kill switch — the thing it exists to stop stays on exactly when the control plane is down. A release flag fails to the path that was already working. An entitlement fails to what the session already carries rather than to *granted*, so a flaky store never hands out a plan nobody paid for.

## Bucketing has to be consistent

The same subject gets the same answer across requests, processes, and services. That means hashing the subject together with the flag key, never sampling per call:

```
bucket  = hash(flag_key + ":" + subject_id) mod 100
enabled = bucket < rollout_percent
```

The flag key belongs inside the hash so that two 10% rollouts do not land on the same tenth of the population. The subject is whatever experiences the feature — user, tenant, or account; a per-user bucket on something a whole team sees splits the team mid-workflow.

A percentage rollout that flickers per request is worse than no rollout: the user watches the feature appear and vanish, and the bug report that follows is unreproducible.

## The combination is what ships

Flags multiply paths combinatorially, and the combination that reaches production is the one that has to be tested. Test the paths that will actually be live together — not each flag alone against a clean baseline — and keep the number of simultaneously live release flags small enough that someone can enumerate them from memory. When nobody can list them, nobody can say what is running.

## Cleanup is part of the work that created the flag

The removal task exists from day one, created with the flag and carrying its type's lifespan. An intention to clean up later is not a task and does not survive the sprint.

An old release flag costs twice: it is a live untested branch, and it is a stale mental model that tells every reader a choice is still open long after the decision was made. Removing it deletes the flag *and* the losing path, in its own change — `workflow-refactoring`.

## Evaluation is observable

Record each evaluation with the flag key, the subject, the result, and the reason — which rule matched, or which fallback fired. A flag whose evaluations are not recorded cannot be rolled back with confidence, because nobody can say who was on it. For an experiment that record *is* the data the decision rests on.

Flips are audited separately: who changed it, when, from what to what. During an incident that log is the first thing read.

## Where the flag lives

Environment config is honest at the start — version-controlled, reviewed, free. The trigger for moving to a store is a person who cannot deploy needing to flip it: support killing a broken integration at 3am, product opening an experiment. That is when the flag needs an interface, an audit trail, and a cache whose invalidation is fast enough that a kill switch actually kills.

Choose the product after the trigger fires. What keeps that choice reversible is one narrow seam in your code — a single `evaluate(key, subject)` the whole codebase calls, with the store behind it (`codebase-design`). It returns the flag's **value**, not only a boolean: on or off for a release or kill switch, the winning variant for an experiment, the number for a plan limit. A boolean-only seam is redesigned at the first three-armed experiment and again at the first metered plan.

Settle the key grammar with the same care `pattern-rbac` gives permission strings, and for the same reason: the key appears in code, the store, the audit log, and every dashboard, so renaming one later touches all of them at once.

## Failure modes

| Symptom | What it means | Direction of fix |
|---|---|---|
| A flag with no owner and no removal date | Its type was never decided | Assign a type; release and experiment get a removal ticket, ops and entitlement get written down as permanent |
| The feature appears and vanishes for one user | Rollout samples per call | Bucket on `hash(flag_key + subject)` so the answer is stable |
| `if (flag && plan == 'pro')` at the call site | An entitlement leaked into the branch | Move the condition into the flag's own rules; the call site asks one question |
| The store goes down and requests fail | No fallback was decided | Give every flag a default that lands on the safe side |
| A kill switch nobody has ever flipped | Untested code holding the incident plan | Exercise it in staging, and in a low-traffic window in production |

## Adopting it

🟢 to add one flag where the system already evaluates them — a clear prompt to `code`. Introducing the flag mechanism, or paying down accumulated flag debt, is 🟡; CLAUDE.md's complexity table holds the gate. The ADR records the store, the fallback convention, and the key grammar (`memory-keeping`).

The reason the framework cares is 🔴 work. A migration or a rewrite placed behind a flag becomes reversible without a deploy, which is what turns a rollback plan from a hope into a switch — see `workflow-architecture-change`.

## Completion criterion

Done when: every live flag has a type, an owner, and either a removal ticket or a written statement that it is a permanent control; each flag's fallback is decided and fails to the safe side; percentage rollouts bucket on the flag key plus the subject so one subject's answer is stable across requests and services; the flag combinations that will be live together are covered by tests; every evaluation goes through the single flag seam rather than a store call at the call site, and is recorded with flag key, subject, result, and the rule or fallback that produced it; each flip is recorded with actor, time, and the values on both sides; entitlement checks sit in the flag layer and permission checks in the authorisation service; and every removed flag took its losing path with it.

## Related

- `workflow-feature` — building the feature the release flag is hiding
- `pattern-multi-tenant` — per-tenant entitlements, keyed to the plan model
- `pattern-rbac` — whether this actor may act, as opposed to whether the plan includes it
- `checklist-release` — the Go / No-Go; what ships behind a flag changes what shipping means
- `workflow-devops` — the store, its config, and flipping it safely in production
