---
name: architectural-planning
description: |
  Turn an approved decision into work another agent can execute:
  decomposition, scope boundary, the prompt, and the handoff to an agent
  starting cold. Use when writing a prompt for `code`, `review`, `debug`, or
  `devops`, splitting a feature into tasks, drafting `/docs/Plan.md`, or
  re-delegating after a FAIL. Also parallel lanes: worktree, «рабочее
  дерево», test stand, «стенд», port per lane, cleanup after agents.
---

# Delegation

A delegated agent starts **cold** — empty context, no memory of the conversation that produced the decision. Everything it needs travels in the prompt, or it does not arrive.

That one fact drives everything here: decompose so a cold agent can hold the task, bound the scope so it knows where to stop, write the prompt so nothing it needs stays implicit, and carry the history forward on every re-delegation.

Complexity levels, STOP gates, and FAIL routing live in `CLAUDE.md`. This skill holds the mechanics they invoke.

## Decompose

**Cut vertically.** One behaviour, complete through every layer it touches — rather than every model, then every service, then every controller. A vertical slice can be verified end-to-end, reverted on its own, and gives the implementing agent the whole feature in view. Layer-wise cutting produces tasks that nobody can check until the last one lands.

**Atomicity is the test of a task.** A task is atomic when, after it: the project builds, the change can be tested in isolation, reverting it leaves the tree consistent, and one sentence describes it. Failing any of the four means it is two tasks.

**Order by dependency.** Build the graph before the list — for each piece, what must exist before it, and what depends on it. Every task references only what an earlier task has already created. A cycle showing up here is a design problem surfacing at the cheapest moment; break it with an interface before delegating either side.

The graph is a sequence, not a fan-out: implementation runs one agent at a time. Two agents editing the same files produce conflicts nobody planned and a diff nobody can review. The one exception is tasks with **disjoint file sets** — say, infrastructure in `deploy/` beside a feature in `src/` — run in parallel when each prompt names the other's files as off-limits and every agent commits only its own paths (`CLAUDE.md`, Quality). When a lane needs its own tree, stand or database — and who removes them — `references/agent-workspaces.md`.

**Map before the first prompt when the area is auth, access, money or a sandbox.** Delegate a path map to `debug` first — every path to the sensitive effect and every consumer of the trust it confers (`forensic-investigation/references/path-map-template.md`) — and decide its invariants before decomposing. Without the map, each review finds the neighbouring path the last fix missed, and the part goes round review after review.

**Delegate a task, not an epic.** "Add JWT auth with roles and OAuth" returns a different system every run. "Add `POST /auth/login` issuing a JWT, given the existing `User` model" returns the same one.

## Bound the scope

Three lists, always — **IN**, **OUT**, **FUTURE**. What is not written down is out. What is written as OUT is a decision rather than an oversight, and the entries that read as too obvious to write are exactly the ones an agent adds uninvited.

Scope firms as the work moves: open while requirements are still forming, clarification-only once the plan is approved, closed during implementation — where only what blocks an acceptance criterion gets in. Reopening it is a decision with a cost, made out loud.

**Creep announces itself** before it lands: «а может заодно», «раз уж мы здесь», «это же быстро». And after it lands: files in the diff that were not in the plan, `code` asking about functionality the spec never mentioned, a small task running for days. On any of these — stop, classify the addition as IN, OUT, or FUTURE, update the list, then continue.

## Write the prompt

| Section | What it carries |
|---|---|
| **Task** | One line naming the change |
| **Context** | Why it matters and where it fits — enough for a cold reader |
| **Scope** | The exact steps, numbered |
| **Requirements** | What must be true when it works |
| **Constraints** | The boundary of allowed change |
| **Acceptance criteria** | How each one is checked, by running something |
| **Files** | Concrete paths with the action on each |
| **Output** | What comes back — code, a report, a decision |

**The middle is where instructions go to die.** Models recall the start and the end of a prompt most reliably. Goal at the top, constraints and acceptance criteria at the bottom, reference material in between. A constraint that must hold appears in both positions.

**Make criteria checkable by running something.** "Works correctly" is unverifiable and gets self-certified. "`npm test` passes, and `POST /auth/login` with a wrong password returns 401" gets verified. Name the rung, not just the command: affected tests while working, the full suite once on the final commit, heavy tools only for the tier that earns them (`verification-budget`).

**State constraints as the bounded behaviour**, so the unwanted action is never named: "Implement the design as specified; architectural changes come back here" beats "don't change the architecture". Keep a bare prohibition only where you cannot phrase it positively — and pair it with what to do instead. `authoring-skills` holds the reasoning.

**Show, where style matters.** Point at a file in this repo that already does the thing — "follow the shape of `UserService`" — instead of describing conventions in prose. One existing example transfers more than three paragraphs.

Where the example is external, it travels in `## Reference`: a URL pinned to a tag or commit, plus the specific decisions being copied. A reference implementation `prior-art` found and the prompt never mentions is a search that changed nothing.

**Revise by adding.** When a result misses, add the constraint or example that was missing; rewriting the prompt from scratch drops the constraints that were already doing their job.

**A prompt never contradicts a skill's safety rule.** The agent follows the prompt; the skill that forbids the shortcut may not be loaded at that moment. A request for mutations names where they run — `isolation: "worktree"` on the delegation, or the tree's path — and never asks to restore a mutated file in place. A request for a smoke run of the real program names the scratch location of every path the program writes. A task that needs a new package names the project's environment from `memory/PROFILE.md` → *Runtime*.

## The handoff

To `code`:

```markdown
## ✅ План готов — делегирую реализацию

# Task: [title]

## Context
[why this matters, how it fits the system]

## Scope
1. [step]
2. [step]

## Requirements
1. [measurable]

## Constraints
- [bounded behaviour]

## Acceptance Criteria
- [ ] [verified by running: …]

## Files
- `path/file.ts` — [action]

## Reference
- `/docs/Plan.md` — the approved plan
- `memory/repo-wiki/[entry].md` — how this area works
- `https://github.com/[owner]/[repo]/blob/[tag]/[path]` — reference implementation; take [the specific decision], not the file

## Output
Code + report against the acceptance criteria.
```

To `debug` — the symptom and the evidence already gathered, so the investigation starts where yours stopped:

```markdown
## 🔍 Требуется расследование

**Симптом:** [what is observed, and where]
**Воспроизведение:** [steps, or what is known about when it fires]
**Уже проверено:** [hypotheses eliminated, and by what evidence]
**Ожидаю:** Research.md — root cause with evidence + recommendation
```

To `review` — the fixed point it reviews against:

```markdown
## 🔍 Ревью

**Что реализовано:** [scope]
**Спека:** `/docs/Plan.md` — [section] / the prompt given to `code`
**Особое внимание:** [area, if any — auth boundary, migration, external input]
**Проверить запуском:** [test instance: port, database, how to start it, test users — never production; `references/agent-workspaces.md` §3] — for auth, access, money, sandbox
**Принятые риски:** [decision ids, one line each] — do not re-flag unless worse than stated
**История:** [previous review verdicts and what they found — on a re-review]
```

To `devops` — the target state and what must keep working:

```markdown
## 🛠️ Инфраструктура

**Задача:** [target state]
**Текущее состояние:** [what runs now]
**Должно продолжать работать:** [what a rollback protects]
**Ожидаю:** working config + verification steps + rollback
```

### Context passthrough

Re-delegation is where context is lost most often — the agent that failed is gone, and its replacement knows nothing about the attempt. Every re-delegation carries five things:

```markdown
# Task: [title] — iteration N

## Спека
`/docs/Plan.md` — [section]

## Что уже работает
[what landed and is verified — do not rebuild it]

## Почему эта итерация
[the FAIL findings, or what changed — classified, not pasted]

## Что изменить
1. [numbered, specific]

## Ограничения, выясненные до сих пор
- [constraint discovered in the previous attempt]
```

Without *what already works*, the next agent rebuilds it. Without *why this iteration exists*, it repeats the failure. Without the *discovered constraints*, it rediscovers them at the same cost.

## Completion criterion

A delegation is ready when: an agent with no other context could execute it; every acceptance criterion names how it is checked; scope states what is out as explicitly as what is in; the files listed exist, or are marked CREATE; and, for a re-delegation, all five passthrough sections are filled.

## Related

- `references/plan-template.md` — the `/docs/Plan.md` template
- `authoring-skills` — the discipline these prompt rules come from
- `codebase-design` — where the seam goes, when decomposition needs one
- `workflow-ai-session` — context degraded mid-task: snapshot and clean restart
- `forensic-investigation` — the prompt keeps producing the same failure
