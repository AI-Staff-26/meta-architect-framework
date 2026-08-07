---
name: pattern-clean-architecture
description: |
  Clean Architecture: the dependency rule, layer placement, dependency
  inversion, making the framework or ORM replaceable. Use when choosing an
  architecture, judging whether existing layers hold, or on "куда положить
  этот код". Team and feature ownership instead → `pattern-modular-monolith`.
---

# Clean Architecture

**Dependencies point inward.** That single direction is the whole pattern — the four layers are filing until the direction is enforced. Four folders with imports running both ways cost more than no layers at all: the indirection is paid for and nothing is bought.

## What the direction buys

Three properties, each of which stops being true the moment one import runs outward:

- **Business rules exercisable without infrastructure** — the domain runs in a test with no database, no server, no fixtures, in milliseconds. This is what makes `tdd` cheap enough to actually do on business logic.
- **A replaceable framework and ORM** — nothing inside knows their names, so swapping the ORM, the web framework, or the payment provider is an infrastructure-layer change with the rules untouched.
- **A domain readable on its own** — the rules are legible without paging through connection handling, retries, and serialisation.

A project that needs none of the three is paying the cost for nothing.

## Where does this code go?

| Layer | Holds | May import |
|---|---|---|
| **Domain** | Entities, value objects, domain services, domain events, repository interfaces | The language and its standard library. Nothing else |
| **Application** | Use cases — one scenario each, orchestration only — and their DTOs | Domain |
| **Presentation** | Controllers, resolvers, CLI commands, presenters, mappers | Application and Domain |
| **Infrastructure** | Repository implementations, ORM, API clients, config, the composition root | Everything — it exists to implement what the inner layers declare |

The inversion that makes this work: the interface is declared where it is *needed* and implemented where the technology lives. `UserRepository` is a domain file; `PostgresUserRepository` is an infrastructure file. Data still reaches the database while the arrow still points inward.

One place does the wiring — the composition root builds concrete implementations and injects them.

The events in the Domain row are the domain's own. An event *published to other modules* is a contract rather than an internal fact, and it belongs to `pattern-modular-monolith`'s `api/`.

## The check is mechanical

Read a layer's import list. A domain file importing a driver, an ORM, or a web framework is the violation, and it is visible without reading a single function body — which is what makes it a lint rule that fails the build rather than something reviewers remember to look for. `pattern-modular-monolith` holds the mechanism per stack, and the argument for why a boundary nobody enforces decays.

## The cost, and where it is not repaid

Indirection: a change that would touch one file touches four. Mapping between DTO and entity is real code carrying no business value. A stack trace runs further before reaching the rule that produced it.

That cost is repaid by change over time — years of maintenance, rules worth naming, a technology expected to move. It is not repaid here:

| Situation | Shape to reach for instead |
|---|---|
| A surface that is genuinely a thin shell over tables | Controllers talking to the ORM directly; introduce a seam only where one part grows deep — `codebase-design` |
| A PoC whose open question is whether anyone wants the thing | One thin path end to end — `workflow-new-project` — and architecture once demand is real |
| Mixed: a rich core plus a wide CRUD periphery | Layers around the core only, and the periphery left flat. The rule is worth enforcing where the rules live |

## When the pattern is decorative

| Symptom | What it means | Direction of fix |
|---|---|---|
| All four folders exist, entities are bags of public fields, every rule lives in a use case | The layers are present and the rule is not — the domain is a data format, not a model | Move each rule onto the entity that owns its invariant; leave use cases with orchestration only |
| A use case imports a concrete repository | The arrow reversed exactly where it mattered: the application layer is now pinned to a database | Depend on the interface; construct it in the composition root |
| A domain file imports an ORM or framework type for convenience | The boundary leaked through a type rather than through a call | Give the domain its own value object and map at the edge |
| Every layer boundary is a one-method pass-through | Layer discipline placed the boundaries; nothing decided whether they earn their place | `codebase-design` |
| Layer rules hold in review but not in CI | The check is human, so it is intermittent | Add the lint rule and let it fail the build |

## Where cross-cutting concerns go

Authorisation, tenancy, and feature evaluation get asked about from everywhere, which makes the layer table look like it forbids them. It does not — they arrive the way every other technology does:

- **Authorisation** and **flag evaluation** are interfaces declared where they are needed and implemented in Infrastructure — `pattern-rbac`, `pattern-feature-flags`.
- **The tenant** is ambient, read by the infrastructure repositories rather than threaded inward through every signature — `pattern-multi-tenant`.
- A domain rule that branches on a permission or a flag takes the decision as an argument. The moment the domain calls the store itself, the direction is gone.

## Introducing it into a codebase that exists

Carry **one use case end to end** through all four layers first: one scenario, its entity, its repository interface, its implementation, its wiring, its tests. The shape gets proven where it is thin and cheap to change, and it produces the reference every later slice is written against.

Land the lint rule as soon as that reference slice is settled, before any file outside it moves. Moving every file first produces four folders and the old direction.

## Adopting it

🔴 — architecture, by the signals in CLAUDE.md's complexity table, which is where the gate lives. The ADR records which layers this project actually takes, what was rejected, the cost accepted, and where the boundary is allowed to be thin. Format in `memory-keeping`.

Into a running system it stays 🔴 for a second reason: contracts move, data migrates, and rollback is no longer a revert. That is `workflow-architecture-change`'s territory, phased so every step reverses.

## Completion criterion

Done when: every layer's imports match the table above and a CI rule fails the build when they stop matching; every business rule sits on the entity or domain service that owns its invariant, with use cases holding orchestration only; the domain suite runs with no database, no server, and no framework container; every dependency an inner layer has on an outer one is an interface declared where it is needed and constructed in the composition root; each repository implementation is exercised against the real technology rather than only through its interface; one use case has been carried end to end through all four layers before the rest moved; and an ADR records the choice, the rejected alternative, and the cost accepted.

## Related

- `codebase-design` — whether each layer boundary is deep enough to earn its hop
- `pattern-modular-monolith` — when the split that matters is by feature and team, not by technical layer
- `tdd` — the test suite the inward direction is what makes possible
- `workflow-architecture-change` — introducing or moving layers in a system already running
- `memory-keeping` — the ADR this decision gets written into
