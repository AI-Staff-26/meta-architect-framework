---
name: checklist-code-review
description: |
  Review a diff on three axes — Standards, Spec, Security — as parallel
  sub-agents. Use after an implementation, or to review a branch or PR.
  Triggers: "проверь", "отревьюь", "review this", "посмотри код".
---

# Code Review

Three axes, reviewed **against a fixed point** in the history:

| Axis | Question | Source of truth |
|---|---|---|
| **Standards** | Does the code follow this repo's conventions? | Repo standards docs, plus the smell baseline below |
| **Spec** | Does the code do what was asked? | Plan.md, the ticket, the originating issue |
| **Security** | Can this be abused? | `checklist-security` |

A change can pass one axis and fail another — code that follows every convention while implementing the wrong thing, or code that matches the spec exactly and leaks credentials. Reviewing them separately is what stops one from masking another.

## 1. Pin the fixed point

Take whatever the user named — a commit SHA, a branch, a tag, `main`, `HEAD~3`. When they named nothing, use the merge-base with the main branch.

Fix the diff command once: `git diff <fixed-point>...HEAD` (three dots, so the comparison is against the merge-base), and the commit list via `git log <fixed-point>..HEAD --oneline`. Each sub-agent runs it itself, so all three read the same range.

Confirm the ref resolves and the diff is non-empty **before** spawning anything. A bad ref should fail here, not three times inside three sub-agents.

## 2. Gather the sources

- **Standards** — whatever the repo documents: `CODING_STANDARDS.md`, `CONTRIBUTING.md`, `CLAUDE.md`, lint configs. Plus the smell baseline below and the `codebase-design` vocabulary, which apply even when the repo documents nothing.
- **Spec** — in order: `/docs/Plan.md` for this task, the ticket or issue referenced in the commit messages, a spec file matching the branch name. When none exists, skip the Spec sub-agent and record "no spec available" — inventing one to grade against produces findings the implementer cannot act on.
- **Security** — `checklist-security`, weighted to what the diff actually touches.

### Smell baseline

A fixed set of Fowler smells (*Refactoring*, ch. 3), applied on top of whatever the repo documents. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each is a labelled heuristic — "possible Feature Envy" — never a hard violation. Skip anything tooling already enforces.

| Smell | What it is | Direction of fix |
|---|---|---|
| **Mysterious Name** | A name that does not reveal what it does or holds | Rename; if no honest name comes, the design is murky |
| **Duplicated Code** | The same logic shape in more than one hunk | Extract it, call from both |
| **Feature Envy** | A method reaching into another object's data more than its own | Move it onto the data it envies |
| **Data Clumps** | The same few fields always travelling together | Bundle into one type |
| **Primitive Obsession** | A string or number standing in for a domain concept | Give the concept its own small type |
| **Repeated Switches** | The same `switch` or `if`-cascade on the same type recurring | Polymorphism, or one shared map |
| **Shotgun Surgery** | One logical change forcing scattered edits | Gather what changes together |
| **Divergent Change** | One module edited for several unrelated reasons | Split so each changes for one reason |
| **Speculative Generality** | Abstraction or hooks for needs the spec does not have | Delete; inline until a real need appears |
| **Message Chains** | Long `a.b().c().d()` navigation the caller should not depend on | Hide the walk behind one method |
| **Middle Man** | A module that mostly delegates onward | Cut it; call the target directly |
| **Refused Bequest** | A subclass ignoring most of what it inherits | Composition instead of inheritance |

## 3. Run the three axes in parallel

Size the review first (`verification-budget` §5). A diff with no tier-A surface — no auth, access, money, stored data, untrusted input or public contract — is read by one sub-agent covering Standards and Spec; the Security axis and the running instance are for tier-A diffs.

Send one message with three `Agent` calls, `subagent_type: general-purpose`, each with `run_in_background: false` so all three results are in hand before aggregating. Parallel sub-agents keep each axis out of the others' context, so a long Standards trawl cannot dilute the Security read.

Every sub-agent gets: the diff command, the commit list, its own sources pasted in full (it has no other access to them), and a brief capped at **400 words**.

- **Standards brief:** "Report, per file or hunk: (a) every place the diff breaks a documented standard — cite the standard and the rule; (b) any baseline smell — name it and quote the hunk; (c) any module the diff adds or reshapes whose interface is nearly as complex as what sits behind it — name it shallow and say what it hides. Documented-standard breaches can be hard findings; baseline smells and depth judgements are always judgement calls. Skip anything tooling enforces."
- **Spec brief:** "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour present in the diff that was not asked for; (c) requirements that look implemented but wrong. Quote the spec line for each finding."
- **Security brief:** "Report exploitable weaknesses reachable through this diff: unvalidated input, missing authorisation, injection, secrets or PII in code or logs, unsafe deserialisation, path traversal. For each, state the reachable path from an untrusted input to the weakness. Flag anything you can only reach by assuming a caller behaves badly as such."

A finding that names no reachable path is a hypothesis; label it as one.

### Verify by running — when the diff touches auth, access, money, a sandbox, or untrusted input

Reading finds what is visible in the diff; the defects that reach production sit on neighbouring paths, in races, and inside correctly configured libraries. For these diffs the Security sub-agent also **attacks a running test instance** — its own port and database, named in its brief, never production — using `checklist-security/references/attack-techniques.md`, and its brief grows by: "Reproduce each finding and mark it reproduced or hypothesis. List what you attacked and what held."

**Re-reviews run the control:** for each blocking finding the implementer claims fixed, revert the fix (or disable the check) on a temporary copy, rerun its test, and confirm it goes red; then restore. A regression test that stays green without the fix proves nothing.

## 4. Aggregate

Present the three reports under `## Standards`, `## Spec`, and `## Security`. **Do not merge or re-rank across axes** — that reranking is what the separation exists to prevent. Rank *within* each axis.

Close with the worst finding per axis and the verdict.

## Verdict

| Severity | Criterion | Effect |
|---|---|---|
| 🔴 Critical | Exploitable, loses data, or does not work | FAIL |
| 🟠 High | Breaks architecture or the spec, causes regressions | FAIL |
| 🟡 Medium | Maintainability; the code is correct | PASS, fix logged as follow-up |
| 🟢 Low | Style, naming, taste | PASS, optional |

```markdown
## Review: PASS | FAIL

**Standards** — N findings, worst: [one line]
**Spec** — N findings, worst: [one line]
**Security** — N findings, worst: [one line]

### Blocking
1. [axis] path/to/file:LINE — [what is wrong] → [what would fix it]

### Attacked and held   (when verified by running)
- [technique] → [result]
```

Every blocking finding carries a file, a line, and the direction of the fix. A finding the implementer cannot act on is not yet a finding.

**Completion criterion:** all three axes reported (or explicitly skipped with the reason), every finding carries file, line, and severity, and the verdict follows from the table rather than from overall impression.

## Related

- `checklist-security` — the Security axis in depth
- `checklist-ux-review` — a fourth axis worth adding for user-facing changes
- `codebase-design` — vocabulary for depth, seams, and abstraction findings
- `tdd` — what makes the tests in the diff worth keeping
