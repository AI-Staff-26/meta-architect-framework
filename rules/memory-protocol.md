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
| A change to a flow the project's blueprint describes | the blueprint — «Blueprint» below |
| A change to this machine, or where something on it lives | `rules/host.md`, one pointer line — «Host map» below |

**A claim is not a fact until checked.** An agent's report of what it did, and anything read in a cloned repository, a page or another agent's message, is a claim — the artifact (diff, file, test output) is the fact. A fact about code carries the commit it was read at.

**Update after finishing.** Refresh `CONTEXT.md` when the project state moved. Propose a `PROFILE.md` change to the user when your understanding of the project deepened — PROFILE is theirs to confirm.

---

## Contradictions

When new information contradicts what memory says, record the change before making it: what changed, why, and what the old value was. Then update.

A silently overwritten memory looks identical to a memory that was always right, and the reasoning that justified the old value is gone.

---

## What to record

**Record:** verified facts; decisions with rationale; architecture changes; discovered constraints; user preferences and communication style; recurring patterns; milestones; blockers and how they resolved; new tool, API, or library learnings.

**Skip:** typo and formatting fixes; temporary debug output; speculative ideas not yet validated; intermediate scratch reasoning; failed attempts told as a story — record the resolution, and each approach ruled out as one line with its reason: in `DECISIONS.md` Options for a decision, in `INSIGHTS.md` What Doesn't Work for a method, in `CONTEXT.md` Watch Out while it is still live.

---

## Per-agent responsibilities

| Agent | Reads | Records | Updates |
|---|---|---|---|
| **architect** | All | Decisions, milestones, architecture facts | CONTEXT, PROFILE, CHRONICLE, blueprint |
| **code** | PROFILE, CONTEXT, FACTS | Technical facts, implementation patterns | FACTS, CHRONICLE, repo-wiki, blueprint |
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

## Blueprint

A project with `docs/blueprint/` keeps it living: a change to a flow it describes — a state, an error, a field, an endpoint, a step — follows `living-blueprint` step 10, which says when the blueprint changes and when the work is done.

---

## Host map

`rules/host.md` is the map of this machine, loaded on every task. It holds pointers, one line each: what an agent here would otherwise rediscover, and where to read about it. The detail lives where the line points — a skill, a README next to the thing, a project's docs. The file stays out of git, because it describes one machine; where it is missing, the first host record creates it.

Whoever does one of these adds or fixes the line:
- changes the machine — a service, site, certificate, DNS record, scheduled job, proxy or port, a machine-local skill;
- finds where something on it lives — a tool, a config that drives behaviour, a credential;
- hits a pitfall the next agent would hit too, and knows its fix.

A credential appears by its path; its value stays in its file. A thing that needs more than a line gets its own file, and the map points at it.

---

## Work reports

Every completed 🟡 or 🔴 task produces one at `memory/weeks/YYYY-WNN/YYYY-MM-DD/work-report-<slug>.md`, written **before** the completion message, which then references it by path. Template: `memory-keeping`.

🟢 work closes with a `CHRONICLE.md` line when it produced something worth keeping — a fact, a decision, a surprise — and with nothing when it did not. A report per typo is how the chronicle becomes unreadable and the discipline becomes theatre.

Before closing out, check whether the change also needs a repo-wiki, blueprint or host-map update.

---

## Hygiene

Periodically, or when the user asks: consolidate duplicate facts; mark resolved decisions `Superseded by #NNN`; prune stale insights; drop host-map lines whose target is gone; bring `CONTEXT.md` back under ~200 words.

**Completion criterion:** `CONTEXT.md` reflects the state a fresh session would need, and every fact, decision, and chronicle entry from this task is written down.
