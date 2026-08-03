# Delegation Patterns — Flowcharts

## Standard Feature Flow

```
[User Request] → "Добавь функцию X"
        ↓
[architect activates]
        ↓
    Analyze complexity
        ↓
   ┌────┴────┬────────┐
   🟢        🟡       🔴
   │         │        │
   │         ├─ Plan.md
   │         │  🛑 STOP
   │         │  approval
   │         │        ├─ Research.md (if needed)
   │         │        ├─ Plan.md
   │         │        ├─ ADR
   │         │        └─ 🛑 STOP approval
   │         │        │
   └─────┬───┴────────┘
         │
    Generate prompt
    "Скажите: 'Выполни реализацию'"
         │
         ↓
   [User] "Выполни реализацию"
         ↓
   [code activates]
         ↓
    Implement code
         ↓
    "Скажите: 'Проверь код'"
         ↓
   [User] "Проверь код"
         ↓
   [review activates]
         ↓
    ┌────┴────┐
  PASS      FAIL
    │         │
    │         └→ [meta-architect analyzes]
    │            └→ Revise Plan.md
    │               └→ Re-delegate `code`
    │
    ↓
  [Done]
```

---

## Investigation Flow (Unknown Cause)

```
[User] "Проблема X, не понятно почему"
        ↓
[architect]
        ↓
   Can explain why?
        ↓
     ┌──┴──┐
    Yes   No
     │     │
     │     └→ "Скажите: 'Начни расследование'"
     │              ↓
     │        [debug]
     │              ↓
     │         Investigation
     │              ↓
     │         Research.md
     │              ↓
     │         "Скажите: 'Создай план...'"
     │              │
     └──────────────┘
                    ↓
           [meta-architect]
                    ↓
              Creates Plan.md
                    ↓
              Standard flow
```

---

## Multi-Phase Flow (🔴 Complex)

```
[User] Complex task
        ↓
[architect]
        ↓
   Plan.md with phases
   🛑 STOP approval
        ↓
   Phase 1:
   └→ `code` → `review` → 🛑 Gate
                               ↓
   Phase 2:                  PASS?
   └→ `code` → `review` → 🛑 Gate
                               ↓
   Phase 3:                  PASS?
   └→ `code` → `review` → 🛑 Gate
                               ↓
   Phase N:                  PASS?
   └→ `code` → `review` → Done
```

---

## Review FAIL Loop Prevention

```
[reviewer] ❌ FAIL
        ↓
[meta-architect receives]
        ↓
   Failure count?
        ↓
     ┌──┴──┐
   First  >2nd
     │      │
     │      └→ "Invoke `debug`"
     │              ↓
     │         Root cause analysis
     │              ↓
     │         Revise approach
     │              │
     └──────────────┘
                    ↓
           Analyze FAIL report
                    ↓
         Update Plan.md OR
         Revise prompt
                    ↓
           Re-delegate `code`
                    ↓
              `review`
                    ↓
               PASS → Done
```

---

## Progressive Disclosure (Skill Loading)

```
[User request]
        ↓
[IDE analyzes YAML descriptions]
        ↓
    Semantic matching
        ↓
   Activate primary role
        ↓
   ┌────────────────┐
   │ role-meta-     │
   │ architect      │──┐
   └────────────────┘  │
                       │ Loads as needed:
                       ├→ workflow-feature
                       ├→ pattern-clean-architecture
                       └→ pattern-rbac
        ↓
   Delegate to `code`
   [User activates]
        ↓
   ┌────────────────┐
   │ Unload: meta   │
   │ Load: coder    │
   └────────────────┘
        ↓
   Delegate to `review`
   [User activates]
        ↓
   ┌────────────────┐
   │ Unload: coder  │
   │ Load: reviewer │──┐
   └────────────────┘  │
                       │ Loads as needed:
                       ├→ checklist-security
                       └→ checklist-ux-completeness
        ↓
      Done
```
