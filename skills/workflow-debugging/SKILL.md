---
name: workflow-debugging
description: |
  Diagnosis loop for bugs, regressions, and performance problems — builds a
  tight feedback loop first, then reproduces, hypothesises, instruments, fixes,
  and locks the fix down with a regression test. Use when something is broken,
  throwing, failing, flaky, or slow; when a fix keeps not working; or when the
  user says "баг", "не работает", "сломалось", "почему падает", "тормозит",
  "debug this", "diagnose". For an unfamiliar system with no specific symptom,
  use workflow-legacy-analysis instead.
---

# Diagnosing Bugs

A discipline for bugs that resist a first glance. Work the phases in order; skip one only with a stated reason.

Load `memory/FACTS.md` and `memory/repo-wiki/glossary.md` before exploring — a bug in a concept you have mis-named is a bug you will not find.

## Phase 1 — Build a feedback loop

**This is the skill.** Everything after it is mechanical. With a **tight** pass/fail signal that goes **red** on *this* bug, you will find the cause — bisection, hypothesis testing, and instrumentation all just consume that signal. Without one, no amount of reading code will save you.

Spend disproportionate effort here. Be aggressive, be creative, and keep going after the first three ideas fail.

### Ways to build one — roughly in this order

1. **Failing test** at whatever seam reaches the bug — unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture input, diffing stdout against known-good output.
4. **Headless browser script** (Playwright/Puppeteer) that drives the UI and asserts on DOM, console, or network.
5. **Replay a captured trace.** Save a real request, payload, or event log to disk; replay it through the code path in isolation.
6. **Throwaway harness.** A minimal subset of the system — one service, mocked dependencies — that reaches the bug in a single function call.
7. **Property / fuzz loop.** For "sometimes wrong output": run a thousand random inputs and look for the failure.
8. **Bisection harness.** When the bug appeared between two known states, automate "boot at state X, check, repeat" so `git bisect run` can drive it.
9. **Differential loop.** Same input through old version vs new, or two configs, diffing the outputs.
10. **Human-in-the-loop script.** Last resort, when a person must click: hand them a scripted sequence that captures its output back to you, so the loop stays structured.

### Tighten it

Treat the loop as the product. Once you have *a* loop, make it **tight**:

- **Faster** — cache setup, skip unrelated init, narrow the scope.
- **Sharper** — assert the specific symptom, not "did not crash".
- **More deterministic** — pin time, seed randomness, isolate the filesystem, freeze the network.

A thirty-second flaky loop is barely better than none. A two-second deterministic one is a superpower.

### Flaky bugs

The goal is not a clean reproduction but a **higher reproduction rate**. Loop the trigger a hundred times, parallelise, add load, narrow timing windows, inject sleeps. A bug that reproduces half the time is debuggable; one percent is not — raise the rate until it is.

### When you genuinely cannot build one

Stop and say so. List what you tried, then ask for exactly one of: access to an environment that reproduces it, a captured artifact (HAR, log dump, core dump, screen recording with timestamps), or permission to add temporary production instrumentation.

**Completion criterion:** you can name **one command** — a script path, a test invocation, a curl — that you have **already run at least once**, pasting the invocation and its output, and that is:

- **Red-capable** — it drives the real code path and asserts the user's exact symptom, so it can go red on this bug and green once fixed. "Runs without erroring" does not qualify.
- **Deterministic** — same verdict every run, or a pinned high reproduction rate for a flaky bug.
- **Fast** — seconds.
- **Runnable unattended.**

Reading code to build a theory before this command exists is the exact failure this phase prevents. No red-capable command, no Phase 2.

## Phase 2 — Reproduce and minimise

Run the loop. Watch it go red.

Confirm the failure is the one the **user** described, not a different one nearby — a wrong bug gets a wrong fix. Capture the exact symptom so later phases can verify the fix addresses it.

Then **minimise**: shrink to the smallest scenario that still goes red. Cut inputs, callers, config, data, and steps one at a time, re-running after each cut. A minimal reproduction shrinks the hypothesis space in Phase 3 and becomes the regression test in Phase 5.

**Completion criterion:** the loop goes red on demand, from a clean start, for the reason the bug report describes — and every remaining element is load-bearing, so removing any one of them turns it green.

## Phase 3 — Hypothesise

Generate **ranked hypotheses before testing any of them** — enough that the list contains at least one you consider unlikely. Generating one at a time anchors you on the first plausible idea, and stopping at the first plausible one is the same failure with extra steps.

Each must be **falsifiable** — state the prediction it makes:

> If `<X>` is the cause, then `<changing Y>` makes the bug disappear, and `<changing Z>` makes it worse.

A hypothesis with no stated prediction is a vibe: sharpen it or drop it.

Show the ranked list to the user before testing. They often re-rank it instantly — "we deployed a change to number three yesterday" — or name ones they have already ruled out. Proceed with your own ranking if they are away.

## Phase 4 — Instrument

Each probe maps to a specific prediction from Phase 3. **Change one variable at a time.**

Prefer a debugger or REPL where the environment supports it — one breakpoint beats ten log lines. Otherwise place targeted logs at the boundaries that distinguish the hypotheses. Logging everything and grepping is how you drown.

**Tag every debug log** with a unique prefix such as `[DEBUG-a4f2]`, so cleanup in Phase 6 is one grep. Untagged instrumentation survives into production.

For performance work, logs usually mislead. Establish a baseline measurement — timing harness, profiler, query plan — then bisect against it. Measure first, fix second.

## Phase 5 — Fix and lock it down

Write the regression test **before the fix** — when a correct seam exists for it.

A correct seam exercises the **real bug pattern as it occurs at the call site**. When the only reachable seam is too shallow — a single-caller test for a bug that needs several, a unit test that cannot replicate the chain that triggered it — a test there buys false confidence.

**No correct seam is itself the finding.** Record it: the architecture is preventing this bug from being locked down. Carry it into Phase 6.

With a correct seam: turn the minimised reproduction into a failing test, watch it fail, apply the fix, watch it pass, then re-run the Phase 1 loop against the original un-minimised scenario.

Keep the fix minimal. Refactoring discovered along the way is a separate task with its own review.

## Phase 6 — Clean up and learn

Done means all of:

- The original reproduction no longer reproduces — re-run the Phase 1 loop.
- The regression test passes, or the absence of a correct seam is written down.
- All `[DEBUG-…]` instrumentation is removed — grep the prefix.
- Throwaway harnesses are deleted or moved somewhere clearly marked.
- The hypothesis that turned out correct is stated in the commit message, so the next person learns from it.
- Root cause recorded in `memory/FACTS.md`; a recurring pattern recorded in `memory/INSIGHTS.md`.

**Then ask what would have prevented this bug.** Answer it *after* the fix is in, when you know the most. When the answer is architectural — no good seam, tangled callers, hidden coupling — hand off with the specifics to `workflow-refactoring` or `workflow-architecture-change`.

## Escalation

| Situation | Route |
|---|---|
| Two full loop-and-hypothesis cycles produced no cause | Delegate to `debug` with the loop, the ruled-out hypotheses, and the evidence |
| The bug is a symptom of an architectural problem | `workflow-architecture-change` |
| Data is corrupted, or it is a security incident | Stop and raise with the user before touching anything |
| Which behaviour is *correct* is unclear | Invoke `grilling` — this is a requirements question wearing a bug costume |

## Related

- `tdd` — the red-green loop the regression test is written in
- `forensic-investigation` — when the agent, not the code, is the thing looping
- `codebase-design` — vocabulary for a "no correct seam" finding
