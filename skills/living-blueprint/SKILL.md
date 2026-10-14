---
name: living-blueprint
description: >
  Living blueprint of a product flow — service blueprint, entity state machines, step contracts.
  Triggers: «сервис-блюпринт», «покажи, как это будет работать — со стороны пользователя и под капотом»,
  «наглядная схема пайплайна», «проектировка в HTML», «user flow со стейтами», «стейт-машина сущности»,
  «контракт шага для агентов», «сверка до ТЗ». Screens alone → `checklist-ux-design`; one endpoint → a
  sequence diagram in `Plan.md`.
---

# Living Blueprint

```
ONE SOURCE, TWO VIEWS. THE BUILD FAILS ON A CONTRADICTION.
```

A flow with model calls, money and background jobs is decided twice:
- once by the owner, who needs to *see* it before approving the spec;
- once by every agent that implements a piece of it, and needs it *exact*.

A picture drawn for the first goes stale before the second starts. A spec written for the second is unreadable to the first.

So both views are generated from one set of data files:

| View | Reader | Contents |
|---|---|---|
| **Human view** — one HTML file | the owner | lanes with a **line of visibility**, screen sketches, raw model calls, prompts, state machines, divergences |
| **Agent view** — `agent/` | coding agents | step contracts, state machines, fixtures, provider payloads, prompts, a lock file, acceptance stubs, the schema |

The build checks the data against itself — dangling references, states with no way out, waits with no deadline, failures nobody can recognise or retry. While any contradiction stands it writes nothing. That refusal is what keeps the blueprint *living*.

## Size it to the work

| Level | What to produce |
|---|---|
| 🟢 | Nothing here — at most a sequence diagram in `Plan.md` |
| 🟡 | The agent view only: entities, step contracts, fixtures |
| 🔴, or any flow the owner must approve before the spec | Both views |

## Steps

### 1. Set up the tool
Once per host, run `npm ci` in `~/.claude/skills/living-blueprint/tool/`. Then run `node ~/.claude/skills/living-blueprint/tool/build.ts --init docs/blueprint`. It creates `docs/blueprint/blueprint.config.yaml` and `src/` with a small worked example. The tool needs Node ≥ 22.18.

*Done when:* `node ~/.claude/skills/living-blueprint/tool/build.ts docs/blueprint` builds the starter with 0 errors and 0 warnings.

### 2. Model the entities
Write `src/data/05-entities.yaml` from the data model in the spec — before any contract. `references/authoring.md` holds the patterns. The ones that matter most:
- one machine per status column, with every column the flow touches declared in `fields`;
- a choice is a field, a lifecycle is states;
- every state that waits on another party is in `waiting` and has a deadline;
- every failure says how it is recognised, what the person sees, what is given back and who retries.

*Done when:* every status column of the data model has a machine, and the build reports no L2, L17, L18 or L19 error.

### 3. Tell each journey from the person's side
One file per journey; steps left to right; five lanes filled per step: person, screen, engine, models, data.

Use **one demo object** through every journey — the same person, artist, song or order from the first click to the download. That **through-line** is what makes the sheet readable, and it becomes the fixtures.

*Done when:* every scenario of the spec maps to a journey, and every lane of every step is filled or deliberately `—`.

### 4. Write the contract of every step
`src/data/06-contracts.yaml`:
- trigger, actor, delivery;
- the full contract of every endpoint — request, responses, errors with the words the person sees — declared once, referenced elsewhere;
- an `also` endpoint behind every retry, upload or recheck button;
- UI copy for every screen state, and the sentence of every `disabled_when`;
- journal, budget, flag, parameters;
- fixtures that walk the demo object through the step's transitions.

Project-wide rules, numbers and switches go once into `meta.rules`, `meta.params` and `meta.flags`. A step's transitions and events come from the state machines, so contracts do not list them.

*Done when:* the build reports 0 errors and 0 warnings.

### 5. Record the calls and prompts as they will really run
- **Raw request and response** per external call, shaped like the call journal will store it — key aliases, never key values.
- **Every prompt** with its variables and an example.
- **Prompts that already work** in an existing system are quoted verbatim with their source, then extended. A proven prompt is an asset; rewriting it from memory throws the tuning away.

*Done when:* lint rule L9 passes, and every external call on the sheet opens a raw request.

### 6. Reconcile with the owner's view
List every statement of the owner's brief against the spec, each with a status:
- `accept`;
- `discuss` — you propose otherwise, and say why;
- `design` — open on both sides;
- `keep` — already matches.

When an existing system is involved, add **«как сейчас»** — how it works today, checked in its code. The owner's memory of a running system is a claim; the code is the fact. Check every row against the decisions already recorded, not against an older spec.

*Done when:* every statement of the brief has a row.

### 7. Stress-test the agent view
Hand **only** `agent/` to fresh `code` agents, one per hard journey, with the prompt in `references/review.md`. Each contradiction comes back tagged [bug] — code built as written would misbehave — or [text]. Sort what comes back:
- facts go into the data;
- design gaps you decide;
- a missing **generic** field goes into the schema, a lint rule and `references/authoring.md`;
- product questions go to the owner.

Fold every round as `references/review.md`, «Fold discipline», says — a half-fix is the main source of the next round's findings. Repeat with fresh agents after a change of the schema.

Rounds do not converge to zero on a large spec: each finds smaller things, and the owner's answers change more than a fourth round does.

*Done when:* every hard journey has stopped —
- a round returned no [bug]; or
- the [bug] count stopped falling — the latest round found no fewer than the one before — and what remains is retry, race or late-answer detail, which goes to the lanes' acceptance tests; or
- three rounds have run and been folded; a fourth is the owner's call in step 8.

Everything still open is an owner question written down for step 8, a live-provider check written into the data, or a typed-contract detail left to the day-0 contracts.

### 8. Owner review — STOP
Send the HTML, what changed since the last version, and the owner questions with your recommended answers — the protocol is in `references/review.md`. State **«🛑 STOP — жду подтверждения»**.

Then record the outcome as `references/review.md` describes.

*Done when:* every `discuss` and `design` row has the owner's answer, and the approved version is tagged in `meta`.

### 9. Hand it to the agents
- **Task prompts** from `architectural-planning` cite step ids (`agent/SPEC.md`, step `k3`), fixtures and transition ids. They do not restate them.
- **Tests carry the ids** from `agent/ACCEPTANCE.md` — the id grammar is in `references/schema.md`, «Reverse drift».
- **The tool goes into the project.** Copy the skill's `tool/` and `references/` folders side by side into the repository, without `node_modules`. CI runs `npm ci` in `tool/`, and the project builds with that copy from then on.
- **The drift check** runs `node tool/drift-check.mts docs/blueprint <tests dir> --base <ref>`. It fails when a locked id has no test, or when a hash changed and its test did not. `--only <id,…>` narrows it to the areas a lane already covers; an id covers itself and the ids under it — `BP:k1` covers `BP:k1:happy`, not `BP:k10`; a prefix that ends in `:` or `.` (`SM:`, `SM:song.`) matches as plain text.
- **The stale check** runs `node tool/build.ts docs/blueprint --check`. It writes nothing. It fails when `agent/`, the HTML or the prompts document is not what a build of `src/` would write — the data changed without a rebuild.

*Done when:* the drift check and the stale check run in CI and pass on the main branch.

## References

- `references/schema.md` — every field and lint rules L0–L21. The build copies it into `agent/SCHEMA.md`.
- `references/authoring.md` — patterns for entities, money, provider jobs, failures and fixtures, and what each lint message usually means.
- `references/review.md` — the stress-test prompt and how to fold its answers back; the owner-review protocol.
- `tool/` — the build, the drift check, the renderer and the starter.
- **Worked examples:** `tool/starter/`, the one `--init` copies; and MusicXO — 7 journeys, 45 contracts, 11 state machines, at `/opt/musicxo/docs/blueprint` on the host where the skill was built.

## Related

- `checklist-ux-design` — its passes 3–5 decide the screen states the contracts record
- `architectural-planning` — turns approved steps into delegated tasks
- `tdd` — the acceptance stubs become red tests first
- `verification-budget` — how much of the drift check runs per commit
