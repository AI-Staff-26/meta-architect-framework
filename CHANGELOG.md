# Changelog

All notable changes to the Meta-Architect Framework (MAF) are recorded here, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Versioning

`VERSION` holds the current version as `MAJOR.MINOR.PATCH`. Each release is a git tag `vMAJOR.MINOR.PATCH` with a GitHub release whose notes are the matching section below.

- **MAJOR** — roles, gates, laws or the memory format change in a way projects must adapt to: a memory migration, a new mandatory step.
- **MINOR** — a new or extended skill, agent or rule that is backward compatible.
- **PATCH** — wording or fixes with no change in behaviour.

## [2.1.0] - 2026-10-10

Lessons from two incidents: a test run that wrote into a live system running from the same tree, and a package install into the system Python that broke the host's certificate renewal.

### Added

- `CLAUDE.md` Quality: **Host** — dependencies install into the project's environment; system interpreter, global managers, system packages and guard-bypass flags are a host change routed to `devops` with the user's confirmation.
- `memory-keeping`: PROFILE section `## Runtime` — mode (`separate` / `live-from-tree` / `n/a`), live paths, dependency environment, check command. Optional: an absent section means "not yet determined".
- `onboarding`: the Runtime area, read from the host (service units, cron, process managers, bind mounts, wrappers, default paths) before asking.
- `verification-budget` §3: the runner writes nowhere but its scratch — live paths read-only when the code also runs live; path defaults resolve per call; the runner's command is recorded in PROFILE → *Runtime*.
- `verification-budget/references/agent-friendly-tooling.md`: the fence per platform, with a before/after tripwire where no sandbox exists.
- `agent-workspaces` §3: the stand when the repository is the deployment.
- `architectural-planning`: a prompt never contradicts a skill's safety rule — mutations name their worktree, smoke runs name every path, installs name the project's environment.
- `checklist-infra`: no install outside the project's environment.

### Changed

- `verification-budget/references/techniques.md`: targeted mutation names the second reason for a worktree — the live system may run from the shared tree.

## [2.0.0] - 2026-10-07

First versioned release. Everything since the initial commit.

### Added

- Skill `grilling`: the one-question-at-a-time interview primitive that other skills invoke.
- Skill `tdd`: red → green loop, which seam a test belongs at; red on the old code, deterministic races.
- Skill `codebase-design`: module, interface, depth, seam vocabulary and the deletion test.
- Skill `memory-keeping`: schemas for everything under `memory/`, loaded on demand; includes the `repo-wiki/glossary.md` entry format.
- Skill `prior-art`: check whether the thing already exists before building it.
- Skill `idea-teardown`: whether to build it at all — demand, per-component verdict, kill criteria.
- Skill `verification-budget`: checks sized to the blast radius — run ladder, one command prints one short answer, agent budget, release gates reuse a green run of the same commit.
- Skills `image-generation` and `visual-inspection`: local image generation and screenshot reading for models without vision.
- `architectural-planning/references/agent-workspaces.md`: worktrees, test stands, merging parallel lanes, cleanup by whoever created the workspace.
- Path map before the first prompt for auth, access, money and sandbox work (`forensic-investigation/references/path-map-template.md`; unmarked area as a fifth cause of repeated failure).
- `checklist-security`: neighbouring paths and trust, library behaviour pinned by a test, races, secrets kept out of argv, `references/attack-techniques.md`.
- `checklist-code-review`: review by running and attacking for auth, access, money and sandbox; "what was attacked and held"; a control rollback of the fix on re-review.
- `checklist-infra`: service sandbox — allow-list, full enumeration, outbound network by port, no DNS, fail-closed, watchdog.
- `vibe-mentor` plan checkpoint: a `Complete` criterion — every requirement maps to a task or is listed as out of scope.
- `code` agent: a fourth report state, "built, but with a doubt named"; completion claims rest on a command's output (aligned across `code`, `devops`, `debug`).
- `CLAUDE.md`: delegation law 3 sizes review to blast radius; a revised plan is unapproved until approved again; secrets never in argv; commit only your own paths.

### Changed

- `CLAUDE.md` rebuilt as a routing layer (377 → 184 lines): language, graded complexity, roles, six delegation laws, STOP gates, context, quality, and a skills table that routes every framework skill; `skills/README.md` rebuilt as routing, not a second catalog.
- Complexity grading now governs the work after implementation as well: 🟢 closes with a self-check and at most a chronicle line; 🟡 and 🔴 keep review, work report and memory update; escalation raises the "after" column too.
- Skill descriptions carry triggers, not summaries; always-on context shrank from 4272 to 3548 words.
- `rules/memory-protocol.md` slimmed from 529 to 98 lines to the protocol itself; schemas moved to `memory-keeping`; weekly rotation, onboarding gate and per-agent duties kept.
- `onboarding` rebuilt (590 → 106 lines): reads the manifest first, interviews through `grilling`, seeds `FACTS.md` and `DECISIONS.md`, hands off to `workflow-new-project`.
- Agents `code`, `review`, `debug`, `devops`, `vibe-mentor`, `advisor`, `consilium` rebuilt: positive framing, point at the skills instead of restating checklists; retired agent names removed everywhere.
- Agent models: `review` and `advisor` on `sonnet`; `debug` and `vibe-mentor` on `fable`.
- `workflow-debugging` rebuilt around a feedback loop first; `checklist-code-review` runs three axes (Standards, Spec, Security) as parallel sub-agents; `workflow-requirements-interview` supplies the territory while `grilling` supplies the loop.
- `architectural-planning`, `workflow-feature`, `workflow-ai-session`, `forensic-investigation`, `framework-knowledge-base`, the five `pattern-*` skills and `checklist-ux-review` rebuilt around what each one actually decides.
- `authoring-skills` establishes the quality standard for framework text (two loads, hierarchy, completion criteria over counters, positive framing).
- `.gitignore` is a whitelist: only the framework is tracked, runtime state of the host is not.

### Removed

- Pre-flight checklist, self-check form and core mantras from `CLAUDE.md`, replaced by the graded complexity table and a completion criterion.
- Superseded templates and guides: legacy prompts and `guide-*` files under `architectural-planning`, onboarding templates, feature-spec, requirements, PRD and architecture templates, and the old `framework-knowledge-base` reference set.

## [1.0.0] - 2026-08-03

Initial framework (commit `147314f`): `CLAUDE.md`, seven agents (`advisor`, `code`, `consilium`, `debug`, `devops`, `review`, `vibe-mentor`), `rules/memory-protocol.md`, and 36 skills covering workflows, checklists, patterns, planning, onboarding and design.
