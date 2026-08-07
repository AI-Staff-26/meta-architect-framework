---
name: codebase-design
description: |
  Shared vocabulary for designing deep modules — a lot of behaviour behind a
  small interface, placed at a clean seam. Use when designing or improving a
  module's interface, deciding where a seam goes, judging whether an
  abstraction earns its keep, making code more testable, or when another skill
  needs the words (module, interface, depth, seam, adapter, leverage,
  locality). Triggers: "где провести границу", "стоит ли выносить", "как
  спроектировать модуль", interface design, abstraction review.
---

# Codebase Design

Design **deep modules**: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface. The aim is leverage for callers, locality for maintainers, and testability for everyone.

Use these words exactly. Consistent language is most of the value — an agent that says "component", "service", and "module" for the same thing cannot reason about it.

## Glossary

**Module** — anything with an interface and an implementation. Deliberately scale-agnostic: a function, a class, a package, a tier-spanning slice.

**Interface** — everything a caller must know to use the module correctly. The type signature, and also: invariants, ordering constraints, error modes, required configuration, performance characteristics. Broader than "API" or "signature", which cover only the type-level surface.

**Implementation** — what is inside the module. Distinct from **adapter**: a thing can be a small adapter with a large implementation (a Postgres repository) or a large adapter with a small one (an in-memory fake). Reach for "adapter" when the seam is the topic, "implementation" otherwise.

**Depth** — leverage at the interface: how much behaviour a caller or test can exercise per unit of interface it has to learn. A module is **deep** when a lot of behaviour sits behind a small interface, **shallow** when the interface is nearly as complex as what is behind it.

**Seam** *(Michael Feathers)* — a place where behaviour can be altered without editing in that place; the *location* where a module's interface lives. Where to put the seam is a separate decision from what goes behind it. Prefer this word to "boundary", which is overloaded by DDD's bounded context.

**Adapter** — a concrete thing satisfying an interface at a seam. Describes the *role* it fills, not what is inside it.

**Leverage** — what callers get from depth: more capability per unit of interface learned. One implementation pays back across N call sites and M tests.

**Locality** — what maintainers get from depth: change, bugs, knowledge, and verification concentrate in one place instead of spreading across callers. Fix once, fixed everywhere.

## Deep and shallow

```
      DEEP                          SHALLOW
┌──────────────────┐     ┌────────────────────────────┐
│  small interface │     │      large interface       │
├──────────────────┤     ├────────────────────────────┤
│                  │     │   thin implementation      │
│  much behaviour  │     └────────────────────────────┘
│                  │       (mostly passes through)
└──────────────────┘
```

When designing an interface, ask: can I remove a method? Can I simplify a parameter? Can I hide more behind it?

## Principles

- **Depth is a property of the interface, not the implementation.** A deep module can be built internally from small, swappable parts — they are simply not part of its interface. A module can have **internal seams** used by its own tests as well as the **external seam** at its interface.
- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through and was costing you a hop for nothing. If complexity reappears scattered across N callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. Wanting to test *past* the interface means the module is probably the wrong shape.
- **One adapter is a hypothetical seam; two is a real one.** Introduce a seam when something actually varies across it. A single implementation behind an interface invented for a second one that never arrived is speculative generality.
- **Make the change easy, then make the easy change.** When a change fights the current shape, prefactor first as its own step, then do the change against the new shape.

## Designing for testability

Good interfaces make testing natural — the same properties produce both.

**Accept dependencies rather than constructing them.** `processOrder(order, paymentGateway)` is testable; a `processOrder(order)` that news up a `StripeGateway` inside is not.

**Return results rather than mutating.** `calculateDiscount(cart): Discount` is testable; an `applyDiscount(cart): void` that edits `cart.total` in place forces the test to reach around the interface to see what happened.

**Keep the surface small.** Fewer methods means fewer tests; fewer parameters means simpler setup.

## Relationship to the pattern skills

These answer different questions, and both apply:

| Question | Skill |
|---|---|
| Which architecture should this project have? | `pattern-clean-architecture`, `pattern-modular-monolith`, … |
| Is *this* module the right shape, and where does its seam go? | this skill |

A project can follow Clean Architecture perfectly and still be built from shallow modules — every layer boundary respected, and each one a pass-through that costs a hop and hides nothing. Layer discipline places seams; depth decides whether they earn their place.

## Completion criterion

A design is settled when: each module's interface is stated in full, in the sense this skill gives the word — not only the signature; each seam has a named reason to exist that survives the deletion test; and every abstraction introduced has at least one real caller today.
