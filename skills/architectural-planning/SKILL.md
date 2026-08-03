---
name: architectural-planning
description: |
  Методологический инструментарий для архитектурного планирования и делегирования.
  Содержит: протоколы передачи задач между агентами (handoff), шаблоны промптов 
  для `code`/`review`/`debug`, гайды по prompt engineering, декомпозиции задач,
  управлению контекстом и контролю скоупа. Используется преимущественно режимом 
  `architect`, но доступен любому режиму при необходимости.
  Triggers: планирование задачи, создание промпта для агента, декомпозиция, 
  оценка сложности, формирование /docs/Plan.md, передача задачи между режимами.
---

<purpose>
This skill provides the **methodological toolkit** for architectural planning and agent delegation.
It does NOT define a role or identity — those are defined by the active mode (e.g., `architect`).
This skill is a **library of protocols, templates, and guides** that any mode can load when needed.
</purpose>

---

<handoff_protocol>

## Handoff Protocol — Передача Задач Между Режимами

### To `code` (code mode)

```markdown
## ✅ План готов — Делегирование к Реализации

### Промпт для выполнения:

# Task: [Title]

## Context
[Why this matters]

## Scope
1. [Step 1]
2. [Step 2]

## Requirements
1. [Measurable req]

## Constraints
❌ [Forbidden 1]
❌ [Forbidden 2]

## Acceptance Criteria
✅ [Verifiable criterion]

## Files
- `file.ts` — [action]

## Reference
- `rules/meta-architect-framework.md`
- `memory/repo-wiki/overview.md`

## Output Format
Code + brief report
```

### To `debug` (debug mode)

```markdown
## 🔍 Требуется Расследование

**Проблема:** [Description]
**Симптомы:** [What's happening]
**Что проверено:** [What we know]
**Ожидаемый результат:** /docs/Research.md with root cause + recommendations
```

### To `review` (review mode)

```markdown
### Проверка Качества

**Проверить:** Specification compliance, security, architecture, rules/meta-architect-framework.md
**Scope реализации:** [What was implemented]
**Spec reference:** [/docs/Plan.md / prompt that was given to `code`]
```

</handoff_protocol>

---

<prompt_templates>

## Agent Prompt Templates

### Standard Implementation Prompt

```markdown
# Task: [Specific title]

## Context
[Why this matters, how it fits system]

## Scope
1. [Exact step]
2. [Exact step]

## Requirements
1. [Measurable]

## Constraints
❌ No scope creep
❌ No dependency changes
❌ No debug logs/secrets

## Acceptance Criteria
✅ [Tests pass]
✅ [Build clean]

## Files
- `path/file.ts` — [action]

## Reference
- `rules/meta-architect-framework.md`
- `memory/repo-wiki/overview.md`

## Output Format
Code + brief report
```

### Bug Fix Prompt

```markdown
# Task: Fix Bug — [Short description]

## Bug Description
**Actual:** [What happens]
**Expected:** [What should happen]

## Root Cause
[Hypothesis or "requires investigation"]

## Scope
1. [Minimal fix step]
2. [Add regression test]

## Constraints
❌ Fix ONLY this bug
❌ No refactoring
❌ Minimal changes

## Acceptance Criteria
✅ Bug no longer reproduces
✅ Regression test added
✅ Existing tests pass
```

### Refactoring Prompt

```markdown
# Task: Refactor — [What exactly]

## Context
**Current state:** [What's wrong]
**Target state:** [What we want]

## Scope
1. [Refactoring step]

## Constraints
⚠️ BEHAVIOR MUST NOT CHANGE
❌ No public API changes
❌ No new features
❌ No feature removal

## Acceptance Criteria
✅ All existing tests pass WITHOUT logic changes
✅ Build clean
✅ [Specific metric: fewer lines / classes / duplication]
```

**Quality checklist for any prompt:**

- [ ] Scope 100% clear
- [ ] All constraints stated
- [ ] Acceptance criteria measurable
- [ ] Files list complete
- [ ] No implicit expectations
</prompt_templates>

---

<complexity_assessment>

## Complexity Assessment Framework

### 🟢 Simple (Direct Execution)

- **Criteria:** Single file, <50 lines, no DB/API, clear requirement
- **Flow:** Assess → prompt → `code` → `review` → Done
- **Plan required:** No (quick assessment + delegation)
- **Examples:** Fix typo, add validation, update constant

### 🟡 Medium (Planned Execution)

- **Criteria:** Multiple files, DB/API changes, new module, some ambiguity
- **Flow:** /docs/Plan.md → STOP (approval) → prompt → `code` → `review` → Done
- **Plan required:** Yes (in /docs/Plan.md)
- **Examples:** New API endpoint, service class, 3rd party integration

### 🔴 Complex (Research + Planned Execution)

- **Criteria:** Architecture change, auth/tenancy, scaling, migrations, high risk
- **Flow:** (maybe `debug`) → /docs/Research.md → /docs/Plan.md + ADR → STOP (approval) → Phased `code` → `review` per phase → Done
- **Plan required:** Yes + /docs/Research.md + ADR
- **Examples:** Multi-tenancy, database migration, auth redesign

</complexity_assessment>

---

<stop_semantics>

## STOP Gates

**STOP gates are mandatory checkpoints, not suggestions.**

At STOP gates:

- ✅ Output required artifact (/docs/Plan.md, /docs/Research.md, prompt)
- ✅ Explicitly state: **"🛑 STOP — Awaiting approval to proceed"**
- ✅ Wait for user's explicit "approved" / "proceed" / "continue"
- ❌ Do NOT continue automatically
- ❌ Do NOT assume approval from silence
- ❌ Do NOT proceed if user asks questions (answer first, then re-STOP)

**When to STOP:**

- After /docs/Plan.md creation for 🟡 tasks
- After /docs/Research.md + /docs/Plan.md + ADR for 🔴 tasks
- When encountering blocker during execution
- When scope unclear or requirements conflict
- When user approval explicitly required by workflow

</stop_semantics>

---

<fail_protocol>

## Review FAIL Protocol

When `review` returns **FAIL**:

### FORBIDDEN

- Immediately re-running `code` with same prompt
- Asking `code` to "try again" without analysis
- Making cosmetic prompt changes and retrying

### REQUIRED

1. **Analyze FAIL report**
2. **Categorize issues:**
   - 🔴 Critical (security, constraint violation) → Revise /docs/Plan.md
   - 🟠 Blocker (missing logic, bad implementation) → Revise coder prompt
   - 🟡 Warning (style, minor) → Targeted fixes only
3. **IF >2 CRITICAL failures** → Invoke `debug` (root cause)
4. **Update /docs/Plan.md / prompt** with findings
5. **THEN re-delegate** to `code`

**Two Steps Back rule applies if looping:**

```
STOP all implementation
→ `debug` investigates
→ /docs/Research.md created
→ /docs/Plan.md revised
→ Clean context restart
→ `code` with improved prompt
→ `review` verification
```

</fail_protocol>

---

<forbidden_actions>

## Forbidden by Default

Unless **explicitly requested** by user or specified in /docs/Plan.md:

| Action | Why Forbidden | How to Request |
|--------|---------------|----------------|
| **Dependency upgrades** | Breaking changes, compatibility risks | Separate task with version compatibility check |
| **DB schema changes / migrations** | Data loss potential, migration complexity | Explicit migration plan with rollback strategy |
| **Infra / CI-CD changes** | Environment impact, deployment risks | ADR + staged rollout plan |
| **Breaking API changes** | Client compatibility broken | Versioned API (v2) or migration guide |

**When spotted outside scope:**

- `code`: Mention at end of report but do NOT implement
- `architect`: Create separate task in /docs/Tasks.md

</forbidden_actions>

---

**Связанные файлы:**

- `references/plan-template.md` — шаблон /docs/Plan.md
- `references/guide-context-management.md` — управление контекстом
- `references/guide-prompts-engineering.md` — prompt engineering
- `references/guide-decomposition.md` — декомпозиция задач
- `references/guide-scope-control.md` — контроль scope
- `references/guide-mermaid-diagrams.md` — использование Mermaid
- `references/legacy-rules-template.md` — шаблон правил проекта (legacy reference)
- `references/legacy_prompts/implement.md` — промпт для реализации
- `references/legacy_prompts/fix-bug.md` — промпт для багфиксов
- `references/legacy_prompts/refactor.md` — промпт для рефакторинга

---

**END OF architectural-planning SKILL**
