---
name: verification-budget
description: |
  Sizing checks to risk: which tests, reviews and gates a change earns, and
  how to run them without waste. Triggers: «тесты идут часами», «сколько
  проверять», «нужно ли ревью», «мутации», «property-based», «пробная
  выкатка», slow suite, flaky gate, huge test logs, too many review agents,
  test runner script, affected tests. The red → green loop itself → `tdd`;
  the review procedure → `checklist-code-review`.
---

# Verification Budget

Verification is a budget, not a virtue. Every check spends wall-clock time, agent context and attention; it earns its place by catching a defect that nothing cheaper would. Too little and defects reach users; too much and the product ships days late while agents wait on the same green run for the third time.

Two ideas carry the skill: **checks are sized by the blast radius of the change**, and **every recurring check is one command that returns one short answer**.

## 1. Grade the change, not the project

Grade each change by what a defect in it would do. A stage about access control still has layout fixes in it; those are graded as layout fixes.

| Tier | A defect here… | Examples | What it earns |
|---|---|---|---|
| **A — silent harm** | leaks, loses or corrupts, and nobody reports it | auth, access rules, money, migrations, secrets, sandbox, public API contract | Invariant tests, generated worlds, targeted mutations, a review that attacks a running instance |
| **B — visible behaviour** | breaks a flow someone will notice | business rules, state, async continuations, error handling | Tests at the seam, a regression test red on the old code, one end-to-end path |
| **C — presentation** | looks or reads wrong | layout, styles, copy, docs | Look at it: screenshots at the widths that matter, the owner's eye; a test only where the regression is likely and cheap to pin |

Write the tier into the plan next to each item. **A tier is a claim about consequences**, not about diff size — a two-line change to a guard can be the worst defect of the year:

- unsure between two tiers → the higher one, until the change shows otherwise;
- removing or loosening a check, a validation or a limit is tier A whatever it sits in;
- a «just a refactor» of a tier-A module stays tier A until its tests prove behaviour unchanged;
- in tier A at least one check comes from outside the implementer — a reference model, the spec's worked example, the reviewer's attack — so the code cannot pass by agreeing with itself.

When an item turns out to touch a tier-A surface, re-grade it out loud.

## 2. The run ladder

Climb only as high as the question needs. Each rung answers something the rung below cannot.

| Rung | Question it answers | When it runs | Feels like |
|---|---|---|---|
| **The file** | Does the thing I just changed work? | After each edit | seconds |
| **The failures** | Did my fix fix what was red? | After a red run — rerun only what failed | seconds |
| **The affected set** | Did I break what depends on it? | After each slice | a minute or two |
| **The full suite** | Is the whole commit green? | Once, on the final commit of a delegation, clean tree | minutes |
| **The release gate** | Does the *artifact* build, install, migrate and boot? | Once per release candidate | minutes |
| **Slow suites** — full e2e, generated worlds at full size, perf | Do the long paths still hold? | At a milestone or nightly; the affected scenarios in between | as long as they take, off the inner loop |

Stop at the first failure on the lower rungs (`-x`, `--bail`, `-failfast`) — one failure at a time is all the inner loop can use; the full suite reports every failure at once.

**One commit, one run.** Rerunning the same check on the same commit and tree *to get a green* is a lottery ticket, not evidence. A flaky failure is evidence — often of a race; repeating the suspicious test on purpose is diagnosis and belongs to `workflow-debugging`. The release gate proves what the suite cannot — a clean checkout, a lockfile install, migrations on a copy, a live boot — and reuses the suite's verdict for that exact commit through a stamp instead of rerunning it. `references/agent-friendly-tooling.md` holds the stamp.

**Speed is a deliverable.** When the inner loop stops being seconds or the full suite stops being minutes, the fix is a task on the list — profile the slowest tests, cheapen deliberate slowness outside the test that verifies it, parallelise by isolated databases — not a cost the agents quietly absorb.

## 3. One command, one answer

Agents are readers with a finite window. A check designed for them:

- **runs from one command** that selects its scope — a file, the affected set, everything;
- **prints a verdict** — counts, then each failure as name, `file:line`, the assertion, the first lines of the stack, and the slowest few tests;
- **saves the full log** to a known path and prints that path;
- **exits non-zero** on failure, so the verdict is machine-checkable;
- **waits safely** — a lock or an isolated database, so two runs do not corrupt each other.

The agent reads the verdict. It opens the full log only to diagnose a named failure, by searching for that failure's name — a log is a reference, not reading material.

Build this runner the first time a check is run twice in a project. Recipes for common runners, affected-test selection and the stamp: `references/agent-friendly-tooling.md`.

## 4. The heavy tools — what each catches

Each pays only where its defect class lives. `references/techniques.md` holds how to keep each one cheap.

| Tool | Catches | Reach for it when |
|---|---|---|
| **Regression test red on the old code** | A fix that fixes nothing | Every tier-A and tier-B bug fix |
| **Deterministic race gate** | Races that fail one run in five | A slow step and a competing action — hashing vs logout, response vs navigation |
| **Static "only here" test** | The path nobody wrote a test for | An invariant with a single choke point: one writer of a trust flag, one issuer of a grant |
| **Generated worlds** (property-based) | Combinations no one imagined | A rule over many interacting parts — access over trees, shares and passwords; pricing over plans |
| **Targeted mutation** | A test that stays green without the guard it claims to cover | The guards a tier-A invariant depends on, and fixes a review called blocking |
| **Review by attack** | Neighbouring paths, real-world misuse | Tier-A diffs, against a running test instance |
| **Release rehearsal** | Packaging, migration, boot failures | Before each production release |

A tool used outside its row costs its full price and catches nothing new.

## 5. The AI budget

Agents are the most expensive check. Size them like the rest.

- **Reviews follow the tier.** Tier A: a review of that change, by running. Tier B: one reviewer per milestone, reading the diff and running its tests. Tier C: no reviewer — screenshots and the owner.
- **A reviewer reruns nothing it was handed.** The implementer's report carries the command and its output; the reviewer runs focused tests for what it doubts, not the whole suite again.
- **Findings go back as one list to one fixer.** One agent per finding re-reads the same code N times and collides in the same files.
- **A re-review checks the fixes, not the world.** It verifies each blocking finding is fixed and its test is red without the fix; the rest of the diff was already reviewed. A small fix diff is reviewed on a cheaper model tier.
- **One check of a plan or prompt.** A second only when the plan materially changed.
- **One agent per question.** Parallel sub-agents earn their cost when the questions are independent and each would crowd the others' context; a small diff needs one reader.
- **Prompts point, agents read.** Name the files and the decision; the agent can open them. A prompt longer than the change it asks for is a smell.

## Signals

| Over-verifying | Under-verifying |
|---|---|
| The same commit tested twice with nothing changed between | A defect in production a cheap test would have caught |
| A tier-C change waiting on a reviewer | A tier-A change without an invariant test |
| An agent reading a log longer than the code it changed | «Выглядит правильно» in place of a command and its output |
| A reviewer rerunning the suite the implementer already ran | A diff that goes green by adding `.skip`, deleting an assertion, lowering a threshold or an `ignore` comment — the cheapest road to green |
| Process text — prompts, reviews, registers — growing faster than code | A review that only read code which runs |
| Most of a delegation's wall-clock spent waiting on checks | A flaky gate everyone reruns until it passes |

Either column is a reason to re-plan the verification, not to push through.

## Completion criterion

Verification is sized when: every planned change carries a tier and the checks of that tier ran; no check ran twice on the same commit and tree; every check run more than once has a one-command form that prints a short verdict and saves the full log; and the time spent waiting on checks is measured — where it exceeds the inner-loop and full-suite budgets, the speed-up is a task with an owner.

## Related

- `tdd` — the red → green loop and what makes a test worth keeping
- `checklist-code-review` — the review procedure, sized by section 5
- `checklist-security` — tier-A depth
- `checklist-release` — the release gate
- `workflow-debugging` — a flaky check is a bug with a feedback loop
