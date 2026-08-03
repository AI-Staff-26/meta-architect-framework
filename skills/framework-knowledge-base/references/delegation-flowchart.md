# Delegation Patterns — Flowcharts

## Standard Feature Flow

```
[User Request] → "Добавь функцию X"
        ↓
[role-meta-architect activates]
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
   [role-coder activates]
         ↓
    Implement code
         ↓
    "Скажите: 'Проверь код'"
         ↓
   [User] "Проверь код"
         ↓
   [role-reviewer activates]
         ↓
    ┌────┴────┐
  PASS      FAIL
    │         │
    │         └→ [meta-architect analyzes]
    │            └→ Revise Plan.md
    │               └→ Re-delegate @coder
    │
    ↓
  [Done]
```

---

## Investigation Flow (Unknown Cause)

```
[User] "Проблема X, не понятно почему"
        ↓
[role-meta-architect]
        ↓
   Can explain why?
        ↓
     ┌──┴──┐
    Yes   No
     │     │
     │     └→ "Скажите: 'Начни расследование'"
     │              ↓
     │        [role-coder-expert]
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
[role-meta-architect]
        ↓
   Plan.md with phases
   🛑 STOP approval
        ↓
   Phase 1:
   └→ @coder → @reviewer → 🛑 Gate
                               ↓
   Phase 2:                  PASS?
   └→ @coder → @reviewer → 🛑 Gate
                               ↓
   Phase 3:                  PASS?
   └→ @coder → @reviewer → 🛑 Gate
                               ↓
   Phase N:                  PASS?
   └→ @coder → @reviewer → Done
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
     │      └→ "Invoke @coder-expert"
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
           Re-delegate @coder
                    ↓
              @reviewer
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
   Delegate to @coder
   [User activates]
        ↓
   ┌────────────────┐
   │ Unload: meta   │
   │ Load: coder    │
   └────────────────┘
        ↓
   Delegate to @reviewer
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
