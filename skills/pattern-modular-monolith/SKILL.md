---
name: pattern-modular-monolith
description: |
  Modular monolith: `api`/`internal` boundaries, module-owned tables, events
  between modules, extraction to services later. Triggers: "модульный
  монолит", "как разделить на модули", "готовим к микросервисам". Structure
  inside one module → `pattern-clean-architecture`.
---

# Modular Monolith

**One deploy, several owned domains, and a boundary the build enforces.** The folder layout is not the pattern — anyone can create `modules/` in an afternoon. What makes it hold is that crossing a module's boundary fails CI, because an unenforced boundary is a comment, and comments lose to deadlines.

## api/ is the surface, internal/ is everything else

A module exposes `api/`: the interface other modules call, the events it publishes, the DTOs those carry. Everything else — domain, use cases, repositories, controllers — lives under `internal/`. Callers depend on the api; nothing outside the module depends on internal.

An event in `api/` is an **integration event** — a contract other modules subscribe to. The domain events a module raises about itself stay under `internal/`, where `pattern-clean-architecture` places them. The two carry different obligations: one may be reshaped freely, the other breaks subscribers.

The implementation behind an `api` is built at the single composition root and injected, which is how one module holds another's interface without importing its internal. That root is the one place that reaches inside, so the rule below allowlists it by path.

The load-bearing part is enforcement. Use the mechanism the stack already has:

| Stack | Mechanism |
|---|---|
| TypeScript / JS | eslint `no-restricted-imports` on `*/internal/*` |
| Python | import-linter contracts |
| JVM | ArchUnit rules, or the module system |
| Go / Rust | package visibility, `pub(crate)` — the compiler already does it |

Add the rule in the same change that creates the first module.

## One module owns its tables

A module's tables are read and written by that module alone; every other module reaches that data through its `api`. This is the coupling the pattern exists to prevent — a cross-module JOIN binds two modules through a schema neither of them controls, and it is precisely what makes a later extraction impossible.

Start cheap: one schema, module-prefixed names, so ownership is legible in every query.

```
users_accounts    orders_orders    catalog_products
users_profiles    orders_items     catalog_categories
```

Schema-per-module is the stronger version — the database itself can refuse cross-module reads through grants — and costs more: migrations per schema, cross-schema queries closed off, heavier local setup. Take it when a module is on a path to extraction, or when the JOIN keeps coming back.

## Choosing how two modules talk

| The caller needs | Route | Why |
|---|---|---|
| An answer now — a query | Direct call through the other module's `api` | Synchronous and traceable; the coupling is to an interface, not to data |
| A command or notification, eventual consistency acceptable | An event on the bus | The publisher does not know its subscribers, so a new reader is a subscription, not an edit |

Events have a second and less obvious job: **they break cycles.** When two modules each need to call the other, invert one direction — the module that was being called publishes, the other subscribes — and the import graph goes acyclic again.

## The shared kernel stays small because it changes everything

A change to the kernel is a change to every module at once, so the admission test is **rate of change, not topic**: base types, `Result`/`Option`, primitive value objects such as Money and Email, access to logging and config. Anything edited weekly belongs inside a module, however general it looks.

Business entities belong to the module that owns them. An `Order` in the kernel means every module now compiles against the order domain, and the pattern is gone.

The cross-cutting mechanisms pass that test and belong here rather than in any module's `api/`: the authorisation service (`pattern-rbac`), the tenant context (`pattern-multi-tenant`), and the flag seam (`pattern-feature-flags`). Every module calls them and none owns them.

## Modules have owners

A module three teams edit is a monolith wearing a folder — the boundary has no one to defend it, and the negotiations it was meant to make explicit happen in chat instead. A team owning six modules defends the two it works in.

Record the owning team per module. Where that mapping comes out ugly, the split is wrong: redraw it along the lines the teams actually work, not the lines the domain diagram suggests.

## The payoff: a module that can leave

The pattern is bought for this — when one domain needs its own scaling, cadence, or team, it leaves without a rewrite. A module is extractable when no import crosses into its `internal/`, it shares no tables, other modules already reach it through `api` or events, and its writes sit inside its own transaction boundary.

Keep those true continuously rather than checking on extraction day; each is cheap to hold and expensive to restore. The migration itself belongs to `workflow-architecture-change` — 🔴, phased, reversible per step.

## Failure modes

| Symptom | What it means | Direction of fix |
|---|---|---|
| An import from another module's `internal/` compiles | The boundary is convention, not rule | Add the import restriction to CI before the next module lands |
| A query JOINs two modules' tables | Ownership was never exclusive | Move the read behind the owning api; prefix or split the schema |
| Two modules import each other | The dependency is genuinely bidirectional | Invert one direction into an event |
| The kernel grows every sprint | It is absorbing anything reused twice | Return the fast-changing pieces to the module that changes them |
| Every feature touches four modules | The split follows technical layers, not domains | Redraw along bounded contexts — `codebase-design` for where the seam goes |

## Adopting it

🔴 — architecture, by the signals in CLAUDE.md's complexity table, which is where the gate lives. The ADR records which bounded contexts were chosen and why those lines, which module owns which tables, the enforcement mechanism, and which interactions are direct calls versus events. Format in `memory-keeping`.

With one or two developers and no domain pressure, the boundary costs more than it returns — `pattern-clean-architecture` gives layering without it.

## Completion criterion

Done when: every module has an `api/` others import and an `internal/` nothing outside imports; a deliberate import from another module's `internal/` has been pushed once and CI rejected it; each table is owned by exactly one module and named so the ownership is visible; each cross-module interaction is a direct api call or an event by the rule above; the module import graph is acyclic; the kernel holds nothing that changes at feature pace; every module names an owning team; and an ADR records the chosen context boundaries.

## Related

- `pattern-clean-architecture` — layering inside a single module
- `codebase-design` — where a seam belongs, and whether it earns its keep
- `workflow-architecture-change` — splitting an existing monolith, or extracting a module into a service
- `workflow-new-project` — laying the modules out before there is code to move
- `memory-keeping` — the ADR format that records the context boundaries
