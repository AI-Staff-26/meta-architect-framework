---
name: onboarding
description: |
  Bootstrap `memory/` for a project that has none. Use on the first
  interaction when `memory/PROFILE.md` does not exist, or on "start
  onboarding", "initialize project", "настрой фреймворк". Blocks everything
  downstream until it completes.
---

# Onboarding

**Everything downstream reads `PROFILE.md`.** Work started without it is work built on guesses, which is why `rules/memory-protocol.md` makes this skill a gate rather than a suggestion.

The output is one thing: a `memory/` tree the next session can start from cold. This runs **once per project**.

## Phase 1 — Discover

Invoke `grilling`. It supplies the loop — one question at a time, facts looked up rather than asked, each question carrying your recommended answer. This phase supplies only the territory:

| Area | What it has to settle |
|---|---|
| **Identity** | What this is, what it is called, what kind of thing it is |
| **Goal** | What success looks like, and how anyone would know it arrived |
| **State** | Greenfield, existing codebase, migration, or mid-flight — and what has been done |
| **Stack** | Languages, frameworks, data stores, hosting, external services. Skip for non-technical projects |
| **People** | Solo or team; who decides what; who else has a stake |
| **Constraints** | Deadlines, budget, legacy that cannot move, compliance |
| **Communication** | Language, level of detail, how they want to be told bad news |

Adapt the depth to the kind of project — a business plan needs the goal and the constraints and almost none of the stack. Where the user does not know, mark `TBD` and move on; onboarding never blocks on an unknown.

**Read before you ask.** When a codebase exists, `package.json`, the lockfile, the CI config, and the directory layout answer most of the stack questions. Arriving with "I see this is Next.js on Postgres — is that current?" spends one question where seven would have gone.

## Phase 2 — Classify, and confirm

Name the project type — `saas`, `api`, `library`, `mobile`, `cli`, `business`, `creative`, `research`, `personal`, `education`, `devops`, `data`, or `mixed` — and which agents this project will actually use.

| Project type | Agents worth activating |
|---|---|
| Dev (saas, api, library, mobile, cli, devops, data) | `code`, `review`, `debug`, `devops`, `vibe-mentor` |
| Business | `consilium`, `advisor` |
| Creative, research, education | `advisor`, and `consilium` where the stakes are strategic |
| Personal | `advisor`, plus `code` where the work is technical |
| Mixed | Whatever its components call for |

The architect is not on the list: it is the entry point, not an option.

Say whether the project would benefit from a custom agent, rule, or skill — and say so only when you can name what it would own that nothing existing does.

Then present the type, the agents, and the extensions, and **🛑 STOP — жду подтверждения**.

## Phase 3 — Generate

Create the tree. **`memory-keeping` holds every schema**; follow it rather than inventing a shape here.

```
memory/
├── PROFILE.md          ← everything Phase 1 settled
├── CONTEXT.md          ← where the project stands today
├── FACTS.md            ← what discovery verified, each with its source
├── DECISIONS.md        ← decisions already made and why
├── INSIGHTS.md         ← empty
├── SUMMARY.md          ← empty
├── weeks/YYYY-WNN/CHRONICLE.md   ← opened with a [milestone] entry
└── repo-wiki/meta.json ← empty index
```

Two of these are not empty at birth. `FACTS.md` takes what discovery verified — the stack you read out of the manifest, the deadline the user named — each with where it came from. `DECISIONS.md` takes the decisions the project already made before you arrived, when the user can state them; a decision recorded now is one nobody re-litigates in month three.

Use today's date and the current ISO week.

Where a codebase already exists, `workflow-legacy-analysis` maps it and writes the first `repo-wiki` entries. Do not attempt that mapping here — it is a different job with its own reading order, and doing it badly during setup produces a wiki nobody trusts.

## Phase 4 — Confirm and hand off

Show what was created, the classification, and anything left `TBD`. Invite correction — this is the last cheap moment to fix a wrong reading of the project.

Once confirmed, close the chronicle entry and say plainly how the thing works from here: memory carries across sessions, facts and decisions land as work happens, and the weekly rotation summarises.

Then route, rather than continue:

- **Greenfield software** → `workflow-new-project`. Stack choice, architecture, and the first end-to-end path belong to it.
- **Existing codebase** → `workflow-legacy-analysis`.
- **Anything else** → whatever the user actually came for.

## Special cases

**`PROFILE.md` already exists.** Do not re-run. Say so, and ask what changed — then edit the affected files directly.

**The user is in a hurry.** Take four answers — what it is, the goal, the stack, the hard constraints — generate with `TBD` everywhere else, and say which fields are still open. A thin PROFILE beats no PROFILE; an invented one is worse than either.

**The user is unsure.** Record `TBD`, add a line under CONTEXT's *Watch Out*, move on without pressure.

**Non-English project.** Hold the conversation in the user's language and record it under *Communication*. File **content** follows that language; **structure** stays English — headings, field labels, and tags like `[milestone]` — so the schemas stay machine-readable across projects.

## Completion criterion

Done when: `memory/PROFILE.md` exists and every field is filled or explicitly `TBD`; `FACTS.md` carries what discovery verified with sources, and `DECISIONS.md` what was already decided; the current week's `CHRONICLE.md` opens with the initialization milestone; every other file and `repo-wiki/meta.json` exists with its schema's shape; the user has confirmed the classification at a STOP; and the next step is named and routed to a skill rather than started here.

## Related

- `memory-keeping` — the schema for every file this creates
- `grilling` — the interview loop Phase 1 runs on
- `workflow-new-project` — greenfield, after this completes
- `workflow-legacy-analysis` — mapping a codebase that already exists
- `framework-knowledge-base` — what the user asks next about how any of this works
