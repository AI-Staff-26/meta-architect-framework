# Memory Protocol

Always-on. Every agent follows it. Formats live in the `memory-keeping` skill — invoke it when you are about to write.

Memory is what makes a session continuous with the ones before it. Without it every session re-derives the same context, re-asks resolved questions, and re-makes decided decisions.

---

## Gates

Check both before substantive work.

**1. Onboarding.** No `memory/PROFILE.md` → invoke the `onboarding` skill and complete it first. Everything downstream reads PROFILE; work started without it is work built on guesses.

**2. Weekly rotation.** No folder for the current ISO week (`memory/weeks/YYYY-WNN/`) → rotate:

1. Create `memory/weeks/YYYY-WNN/CHRONICLE.md`, headed `# Chronicle — Week YYYY-WNN (Mon DD – Sun DD)`.
2. Find the most recent previous week folder and read its chronicle.
3. Write that week's `SUMMARY.md`: accomplished, key decisions, issues and blockers, new facts, insights, metrics.
4. Append its digest to `memory/SUMMARY.md`: focus, key outcomes, decision count, open issues, next priority.
5. Continue in the current week.

---

## The cycle

**Read before acting.** Always: `PROFILE.md`, `CONTEXT.md`, `repo-wiki/meta.json`. When relevant: `FACTS.md`, `DECISIONS.md`, the current `CHRONICLE.md`.

**Record while working**, at the moment knowledge appears rather than in a batch at the end — batched memory is reconstructed memory, and reconstruction loses exactly the detail worth keeping.

| What appeared | Where it goes |
|---|---|
| A verified fact | `FACTS.md`, with source and date |
| A decision | `DECISIONS.md` (numbered) **and** a `[decision]` chronicle entry |
| A significant event | `CHRONICLE.md`, with a category tag |
| A pattern, good or bad | `INSIGHTS.md` |
| An architectural decision | `memory/adrs/ADR-NNN.md` |

**Update after finishing.** Refresh `CONTEXT.md` when the project state moved. Propose a `PROFILE.md` change to the user when your understanding of the project deepened — PROFILE is theirs to confirm.

---

## Contradictions

When new information contradicts what memory says, record the change before making it: what changed, why, and what the old value was. Then update.

A silently overwritten memory looks identical to a memory that was always right, and the reasoning that justified the old value is gone.

---

## What to record

**Record:** verified facts; decisions with rationale; architecture changes; discovered constraints; user preferences and communication style; recurring patterns; milestones; blockers and how they resolved; new tool, API, or library learnings.

**Skip:** typo and formatting fixes; temporary debug output; speculative ideas not yet validated; intermediate scratch reasoning; failed attempts — record the resolution they led to instead.

---

## Per-agent responsibilities

| Agent | Reads | Records | Updates |
|---|---|---|---|
| **architect** | All | Decisions, milestones, architecture facts | CONTEXT, PROFILE, CHRONICLE |
| **code** | PROFILE, CONTEXT, FACTS | Technical facts, implementation patterns | FACTS, CHRONICLE, repo-wiki |
| **review** | PROFILE, CONTEXT, FACTS, DECISIONS | Quality insights, recurring issues | INSIGHTS, CHRONICLE |
| **debug** | All | Root causes, investigation findings | FACTS, INSIGHTS, CHRONICLE |
| **devops** | PROFILE, CONTEXT, FACTS | Infrastructure facts, deployment patterns | FACTS, CHRONICLE |
| **advisor** | PROFILE, FACTS, DECISIONS, INSIGHTS | Product and market insights | INSIGHTS, CHRONICLE |
| **consilium** | PROFILE, FACTS, DECISIONS, INSIGHTS | Strategic decisions, business insights | DECISIONS, INSIGHTS, CHRONICLE |
| **vibe-mentor** | PROFILE, CONTEXT, INSIGHTS | Method observations, recurring gaps | INSIGHTS, CHRONICLE |

---

## Repo wiki

`memory/repo-wiki/` documents the codebase; `meta.json` indexes it and is loaded on every task.

After a code change, ask whether the wiki still describes the code. A new module, a significantly changed one, or a new concept worth finding by → update the entry and its tags. Nothing meaningful changed → skip, since noise costs more than the gap.

Format and the `meta.json` schema: `memory-keeping`.

---

## Work reports

Every completed 🟡 or 🔴 task produces one at `memory/weeks/YYYY-WNN/YYYY-MM-DD/work-report-<slug>.md`, written **before** the completion message, which then references it by path. Template: `memory-keeping`.

🟢 work closes with a `CHRONICLE.md` line when it produced something worth keeping — a fact, a decision, a surprise — and with nothing when it did not. A report per typo is how the chronicle becomes unreadable and the discipline becomes theatre.

Before closing out, check whether the change also needs a repo-wiki update.

---

## Hygiene

Periodically, or when the user asks: consolidate duplicate facts; mark resolved decisions `Superseded by #NNN`; prune stale insights; bring `CONTEXT.md` back under ~200 words.

**Completion criterion:** `CONTEXT.md` reflects the state a fresh session would need, and every fact, decision, and chronicle entry from this task is written down.
