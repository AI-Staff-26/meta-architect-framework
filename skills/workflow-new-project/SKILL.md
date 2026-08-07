---
name: workflow-new-project
description: |
  Start a project from nothing: what it must do, a stack you can defend, one
  path running end to end before anything is built wide. Use for greenfield,
  an MVP or PoC, or a rewrite. Adding to something existing →
  `workflow-feature`; bootstrapping memory → `onboarding`.
---

# Starting From Nothing

A new project has no tests to break, no users to disturb, and no history to respect — which is why the expensive mistakes here are all made in the first week and paid off over years.

Two of them account for most of it: **choosing a stack for reasons that will not survive contact with the work**, and **building wide before anything runs**. The order below exists to prevent both.

## 1. Settle what it must do

Before any technology is named: what the thing does, for whom, and what it is explicitly not. A project that starts without a stated boundary grows one by accretion, and every later decision inherits the ambiguity.

Where the request is a sentence and the project is a month, run `grilling`; `workflow-requirements-interview` supplies the territory the questions have to cover and the `Requirements.md` it produces.

Name the first user-visible thing that would count as working. That sentence becomes the target for step 3, and it is the only requirement that must be settled before the stack is chosen — the rest can firm up while it is built.

## 2. Choose the stack, and defend it

Two or three real options, each with what it costs and what it buys, and a recommendation with the reason. Not a survey — a decision presented for approval.

The reasons that hold: the team already knows it, it fits the shape of the problem, its failure modes are understood, and it will still be maintained in three years. The reasons that do not: it is new, it is fast in a benchmark nobody ran on this workload, or the alternative was fashionable last year.

`references/tech-stack-selection.md` holds the selection method — the boring-technology default, the maturity check, total cost beyond the first month, and the spike for anything genuinely unknown.

Then **STOP** for approval, and record the choice in `memory/DECISIONS.md` with its rationale and the alternatives rejected. A stack choice is the decision most often re-litigated six months later by someone who has forgotten why; the entry is what ends that conversation.

For anything architecturally consequential — the persistence model, the boundary between services, the auth approach — write an ADR too: `workflow-architecture-change/references/adr-template.md`.

## 3. Get one path running end to end

The first deliverable is a **tracer bullet**: the thinnest possible slice that goes from the outside of the system to the store and back, running in the environment it will actually run in.

One route, one handler, one table, one response, deployed. Not a scaffold, not a folder tree, not a login system. It proves the pieces connect — which is the only thing at this stage that cannot be proven by reasoning, and the thing every later estimate depends on.

Everything the tracer needs gets built now; everything it does not, waits. That is the whole rule, and it settles most of the "should we set up X first" questions on its own.

| Now — the tracer needs it | Later — it does not |
|---|---|
| Runtime version pinned, one command to start | A component library |
| The one route and the one table it uses | The full schema |
| Configuration and secrets loading | A secret manager |
| A test that runs the path, and a way to run tests | A coverage target |
| Whatever it takes to deploy it once | A full pipeline, staging, blue-green |

`workflow-devops` covers the environment and the container; `checklist-infra` verifies them. Both come in at the size the tracer needs, and grow with the project rather than ahead of it.

## 4. Then build features

From here it is `workflow-feature`, one vertical slice at a time, each landing on a path that already runs. `tdd` from the first slice — a project with tests from the start keeps them; a project that adds them later mostly does not.

Structure grows from what the slices need. A folder layout designed before the second feature exists is a prediction, and predictions about a codebase that does not exist yet are wrong in ways that are expensive to undo.

## 5. Write down what a newcomer needs

`memory/PROFILE.md` comes from `onboarding` — if it is missing, that runs first. What this workflow adds: the stack and its rationale in `DECISIONS.md`, the constraints discovered while wiring things up in `FACTS.md`, and a `repo-wiki/` entry describing the shape once the tracer runs. Formats: `memory-keeping`.

The README earns its place with exactly two things at this stage: how to run it, and how to run the tests.

## Completion criterion

Ready to build features when: one user-visible path works in the deployed environment, not only locally; a fresh clone can be started and tested from documented commands; the stack decision and its alternatives are in `DECISIONS.md`; secrets load from configuration and none are in the repository; and nothing has been built that the running path does not use.

## Related

- `references/tech-stack-selection.md` — how the stack decision gets made
- `workflow-requirements-interview` + `grilling` — settling what it must do
- `workflow-feature` — every slice after the tracer
- `workflow-devops` — environment, containers, deployment
- `pattern-clean-architecture`, `pattern-modular-monolith` — when the shape of the problem already has a known architecture
