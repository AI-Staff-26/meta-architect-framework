# The heavy tools — keeping each one cheap

Each section: what the tool proves, where it pays, and how to run it at the smallest cost that still proves it. `SKILL.md` §4 decides *whether*; this file is *how*.

## Regression test red on the old code

**Proves** the fix is what turned the test green. **Cheap form:** run only that test file against the previous commit in a temporary worktree, paste the failure line. Not the whole suite on the old commit.

## Deterministic race gate

**Proves** the code is correct for the interleaving that fails rarely. **Cheap form:** inject a gate (a promise, a latch) into the slow step through the seam it already has; hold it while the test performs the competing action; release. One run, same result every time — no repeat loops, no sleeps.

## Static "only here" test

**Proves** an effect happens at one choke point, including paths no behavioural test exercises. **Cheap form:** one test that reads the source tree and fails when the effect appears elsewhere. Phrase the rule as *allowed only X* — an allow-list — so a new form of the effect is caught without updating the rule. When a review finds a form the rule missed twice, the rule is a deny-list in disguise: move the invariant into a runtime capability (an object only the choke point can obtain) instead of adding a third pattern.

## Generated worlds (property-based)

**Proves** a rule holds over combinations nobody listed. **Where it pays:** one rule over many interacting parts with an independent oracle — access decided by the real code versus a simple reference model of the same rule. **Cheap form:**

- a generator of small worlds with a seed;
- a size knob — a few dozen worlds in the regular run, hundreds nightly;
- shrinking, or at least the seed printed on failure, so the case replays;
- one property per rule, not one per scenario.

Libraries: fast-check (JS/TS), Hypothesis (Python), proptest / quickcheck (Rust), rapid (Go).

## Targeted mutation

**Proves** a test depends on the guard it claims to cover. **Where it pays:** the guards of a tier-A invariant and the fixes a review called blocking — not the whole codebase. **Cheap form:** for each guard, remove or invert it, run only the test file that should catch it, expect red, restore. A handful of mutations per invariant answers the question; a full mutation-testing run is a periodic audit, not a per-change gate.

Tools when the manual form grows: Stryker (JS/TS — limit with `--mutate` to the guard files, use incremental mode), mutmut (Python), cargo-mutants (Rust), gremlins (Go).

## Review by attack

**Proves** what reading cannot: neighbouring paths, real misuse, behaviour of correctly configured libraries. **Where it pays:** tier-A diffs. **Cheap form:** one reviewer with a running test instance (own port, own database), a list of what to attack drawn from the diff's surface, and a report of *reproduced* versus *hypothesis*. A path map made before planning (every path to the sensitive effect) keeps the attack from rediscovering one neighbour per review cycle.

## Release rehearsal

**Proves** the artifact: a clean checkout builds, the lockfile installs, migrations run on a copy of real data, the server boots and answers a smoke check. **Cheap form:** reuse the suite's stamp for the commit (`agent-friendly-tooling.md`); spend the gate's time on what only the gate can see.

## End-to-end scenarios

**Prove** the real interface works across the stack. **Cheap form:** one golden path per user flow; between milestones run the scenarios whose pages or endpoints the change touched; the full set once per milestone or nightly. Layout checks belong to screenshots at the widths that matter, not to pixel assertions in every scenario.

## Performance gates

**Prove** a change did not regress speed. **Cheap form:** compare against a baseline measured in the same run, on the same machine, so neighbour load cancels out; an absolute threshold on a shared machine measures the neighbours.
