---
name: workflow-legacy-analysis
description: |
  Mapping an unfamiliar codebase before changing it — the reading order, which
  evidence to trust, where the dangerous parts are, and how the map gets
  written into `memory/repo-wiki/`. Use for an inherited or undocumented
  project, before a refactor or migration, when a module nobody understands
  has to be touched, or when the user says "разберись как тут всё устроено".
  For a specific symptom use `workflow-debugging`; for a project with no code
  yet use `onboarding`.
---

# Mapping Unfamiliar Code

You are mapping, not exploring. The deliverable is a map good enough to predict where a change lands and what it will break — not a complete understanding of the system, which no one has, including the people who wrote it.

**Time-box this.** Analysis without a boundary becomes a project of its own, and the map goes stale while it is being drawn. Decide up front how long it gets and what question it must answer.

Write as you go, into `memory/repo-wiki/` and `memory/FACTS.md`. Notes kept in the session die with it, and the second pass costs as much as the first. `memory-keeping` holds the wiki format, the `meta.json` registration, and the FACTS entry shape.

## Read in this order

Each step answers a question the next one depends on.

**1. Entry points.** `main`, `index`, route registrations, CLI commands, cron jobs, queue consumers. Everything the system does starts at one of them; anything unreachable from them may be dead.

**2. The dependency manifest.** `package.json`, `requirements.txt`, `go.mod`, and the lockfile. The frameworks in it tell you the conventions before you read a line of code — the shape of a Django project is not a discovery you should have to make. Note what is abandoned or years behind.

**3. Configuration and environment.** What the system needs to run tells you what it talks to: databases, queues, third-party APIs, feature flags. `.env.example`, compose files, CI config, deployment manifests.

**4. The data model.** Schema, migrations, core entities. In most systems the data model is the truest statement of what the domain actually is — code drifts around it, the schema stays.

**5. The seams.** Where the layers meet: the boundary between transport and logic, the interface to the database, the calls to anything external. Changes happen at seams; `codebase-design` holds the vocabulary for judging them.

## Rank the evidence

Sources disagree, and the disagreement itself is information — usually the sign of a change nobody propagated.

| Trust | Source | Why |
|---|---|---|
| Highest | Running code and its output | It cannot be out of date with itself |
| High | Tests that pass | Executable claims about intent, verified continuously |
| Medium | Git history | Records what actually happened, though not why |
| Low | Comments, README, wikis | Written once, at the moment of least knowledge, never re-run |

When documentation contradicts the code, the code wins and the contradiction gets recorded as a fact — someone believed the documented version, and that belief is still in circulation.

## Find the dangerous parts

Risk concentrates where change is frequent, structure is large, and tests are absent. Churn is measurable:

```bash
git log --format=format: --name-only --since='12 months ago' \
  | sed '/^$/d' | sort | uniq -c | sort -rn | head -20
```

Cross the top of that list against file size and test coverage. A file that changes constantly, is large, and has no test is where the next regression will come from — and where the analysis time is best spent.

Record these as a hot-spots entry in the wiki with what makes each one risky, and separately: **what not to touch**, with the reason. "Do not change without reading X" is the single most valuable line a map can carry into the next task.

## Ask the code what it was for

Where a construct looks wrong, assume a reason existed before assuming incompetence. `git log -S'<symbol>'` and `git blame` find the commit that introduced it, and commit messages, linked issues, and the diff's surroundings usually explain what it was solving. A workaround removed without knowing what it worked around comes back as a bug with the original symptom.

Where the authors are reachable, ask them — half an hour of their memory outruns a day of reading.

## Close it out

The map lands in `memory/`: wiki entries per module registered in `meta.json`, technical facts and constraints in `FACTS.md` with source and date, hot spots and no-touch zones recorded, and `CONTEXT.md` reflecting the new state. Decisions taken during the analysis — what to migrate, what to leave — go to `DECISIONS.md` with their reasoning.

Then route: `workflow-refactoring` for structure, `workflow-feature` for new behaviour, `workflow-architecture-change` for migration, `workflow-debugging` for a specific symptom. Each of them now starts from the wiki instead of from zero, which is the entire return on this work.

## Completion criterion

Done when: you can name where a given change would land and what it would break; entry points, data model, and external dependencies are documented in the wiki and registered in `meta.json`; hot spots and no-touch zones are written down with reasons; every contradiction found between docs and code is recorded; and the time-box held — or was extended deliberately, with what the extra time is buying.

## Related

- `memory-keeping` — wiki entry format, `meta.json`, FACTS and DECISIONS shapes
- `codebase-design` — seams, module depth, and where a boundary belongs
- `workflow-refactoring` — changing the structure once the map exists
- `workflow-architecture-change` — migrating it
- `onboarding` — no `memory/PROFILE.md` yet; run that first
