# Skills Index — All 24 Skills Catalog

## Role Skills (5)

### architect

**Purpose:** Core orchestrator for all development tasks  
**Triggers:** New feature, bug, refactoring, "добавь", "исправь"  
**Key Function:** Plans, delegates, coordinates other roles  
**Delegates to:** coder, reviewer, coder-expert  
**Use when:** Starting any development task

---

### code

**Purpose:** Precision implementer from approved specs  
**Triggers:** "Выполни реализацию", "implement", "execute plan"  
**Key Function:** Writes code exactly per prompt  
**Invoked by:** meta-architect  
**Use when:** Plan exists (🟡🔴) or 🟢 Simple with clear scope

---

### review

**Purpose:** Quality gate after implementation  
**Triggers:** "Проверь код", "review", "verify"  
**Key Function:** Verifies code against spec, security, architecture  
**Invoked by:** User after coder completion  
**Returns:** PASS/FAIL with severity classification

---

### debug

**Purpose:** Forensic investigator for complex issues  
**Triggers:** "Начни расследование", "investigate"  
**Key Function:** Root cause analysis, creates Research.md  
**Invoked by:** meta-architect when cause unknown  
**Use when:** >2 failed fixes, AI loops, mysteries

---

### role-guide

**Purpose:** Framework + codebase consultant  
**Triggers:** "Помощь", "где находится", "как работает", "нужно ли"  
**Key Function:** Explains framework, navigates code, advises features  
**Use when:** Questions (not tasks)  
**Does NOT:** Implement or plan (redirects to meta-architect)

---

## Workflow Skills (10)

| Skill | Purpose | Loaded By | Complexity |
|-------|---------|-----------|------------|
| **workflow-feature** | New functionality protocol | meta-architect | 🟢🟡🔴 |
| **workflow-debugging** | Bug fix protocol | meta-architect | 🟢🟡 |
| **workflow-refactoring** | Code improvement | meta-architect | 🟡🔴 |
| **workflow-architecture-change** | Major architectural shifts | meta-architect | 🔴 |
| **workflow-new-project** | Starting from scratch (greenfield) | meta-architect | 🔴 |
| **workflow-requirements-interview** | Requirements gathering | meta-architect | 🟡🔴 |
| **workflow-legacy-analysis** | Understanding unfamiliar code | meta-architect | 🟡🔴 |
| **workflow-ai-session** | Session management | meta-architect | N/A |
| **workflow-ui-build-order** | UI implementation sequencing | meta-architect | 🟡 |

---

## Pattern Skills (5)

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| **pattern-clean-architecture** | Layered arch with DI | Complex business logic |
| **pattern-multi-tenant** | Tenant isolation | SaaS, multi-org apps |
| **pattern-rbac** | Access control | Authorization systems |
| **pattern-modular-monolith** | Monolith with boundaries | Pre-microservices |
| **pattern-feature-flags** | Runtime toggles | Risky changes, A/B testing |

---

## Checklist Skills (5)

| Skill | Purpose | Loaded By | Domains |
|-------|---------|-----------|---------|
| **checklist-security** | Security audit | reviewer (for auth/data code) | 9 security domains |
| **checklist-code-review** | General quality | reviewer (standard reviews) | Code quality |
| **checklist-release** | Pre-production | meta-architect/reviewer | Release readiness |
| **checklist-phase-completion** | Phase gates | meta-architect (🔴 multi-phase) | Phase completion |
| **checklist-ux-completeness** | UI/UX verification | reviewer (frontend code) | UI states, a11y |

---

## Skill Relationships

```
architect (CORE)
    ├─ Loads: workflow-* (for protocols)
    ├─ Loads: pattern-* (for architecture)
    ├─ Delegates to: code
    ├─ Delegates to: debug
    └─ Activates: review (via user command)

code
    └─ Hands off to: review

review
    ├─ Loads: checklist-security
    ├─ Loads: checklist-code-review
    ├─ Loads: checklist-ux-completeness
    └─ Returns to: architect (on FAIL)

debug
    └─ Returns to: architect (with Research.md)

role-guide
    └─ Redirects to: architect (when action needed)
```

---

**Total:** 24 skills  
**Description budget:** 5,330 / 15,000 chars (35%)  
**Progressive Disclosure:** Auto-activates based on semantic matching
