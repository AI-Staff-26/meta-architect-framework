# Meta-Architect Framework — Complete Overview

## What Is This Framework

**Meta-Architect Framework** is a multi-agent AI system for software development
that orchestrates specialized AI roles (agents) to deliver high-quality code
through structured workflows and quality gates.

### Core Philosophy

```
ONE ORCHESTRATOR (meta-architect) controls SPECIALIZED EXECUTORS 
(coder, reviewer, expert) through STRUCTURED PROTOCOLS (workflows, 
patterns, checklists)
```

**Key Principles:**

1. **Separation of Concerns** — Each role does ONE thing well
2. **Plan Before Code** — No coding without approved spec (for 🟡🔴)
3. **Quality Gates** — Every implementation reviewed before merge
4. **Context Discipline** — Load only what's needed for current decision
5. **Progressive Disclosure** — Skills auto-activate based on semantic matching

---

## Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────────┐
│ Always-On Rules (~8KB)                                      │
│ ├─ Process guardrails (delegation authority, STOP gates)   │
│ ├─ Complexity classification (🟢🟡🔴)                        │
│ ├─ Operating loops for each role                           │
│ └─ Activation commands reference                           │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Skills (auto-activated by IDE)                             │
│                                                             │
│ ┌─────────────┐  ┌──────────────┐  ┌──────────┐          │
│ │ ROLE SKILLS │  │WORKFLOW SKILLS│  │ PATTERN  │          │
│ │             │  │              │  │ SKILLS   │          │
│ │ meta-arch   │  │ feature      │  │ clean    │          │
│ │ coder       │  │ debugging    │  │ rbac     │          │
│ │ reviewer    │  │ refactoring  │  │ multi-   │          │
│ │ expert      │  │ arch-change  │  │ tenant   │          │
│ │ guide       │  │ new-project  │  │ ...      │          │
│ │             │  │ ...          │  │          │          │
│ └─────────────┘  └──────────────┘  └──────────┘          │
│                                                             │
│ ┌──────────────────────────────────────────────────┐       │
│ │ CHECKLIST SKILLS                                 │       │
│ │ security | code-review | release | ux | phase    │       │
│ └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ memory/* (persistent knowledge)                            │
│ ├─ PROFILE.md       ── project DNA                         │
│ ├─ CONTEXT.md       ── current state snapshot              │
│ ├─ FACTS.md         ── verified facts knowledge base       │
│ ├─ DECISIONS.md     ── decision log with rationale         │
│ ├─ INSIGHTS.md      ── patterns and learnings              │
│ ├─ SUMMARY.md       ── accumulated weekly summaries        │
│ ├─ weeks/           ── weekly temporal memory              │
│ ├─ adrs/            ── architecture decision records       │
│ └─ repo-wiki/       ── codebase documentation wiki         │
├─────────────────────────────────────────────────────────────┤
│ /docs/* (transient workspace)                              │
│ ├─ prompt-*.md      ── execution prompts                   │
│ └─ Research.md      ── investigation notes (temporary)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Role System

### role-meta-architect (Orchestrator)

**Responsibility:** Strategy, planning, agent coordination

**When Active:**

- User starts any development task
- Planning new features
- Analyzing bugs
- Making architecture decisions

**What It Does:**

1. Classifies complexity (🟢🟡🔴)
2. Routes to appropriate workflow-* skill
3. Creates /docs/* specifications
4. Generates prompts for other roles
5. Delegates to @coder/@reviewer/@expert
6. Verifies completion
7. Updates project memory

**ONLY role that can invoke other roles.**

---

### role-coder (Implementer)

**Responsibility:** Precise code execution from specs

**When Active:**

- User says "Выполни реализацию" / "Execute implementation"
- Meta-architect delegated with prompt

**What It Does:**

1. Validates prerequisites (Plan.md exists for 🟡🔴)
2. Implements EXACTLY what's in prompt
3. Follows framework rules from rules/meta-architect-framework.md
4. No improvisation or architectural decisions
5. Returns control with "Проверь код" command

**Never self-activates. Waits for delegation.**

---

### role-reviewer (Quality Gate)

**Responsibility:** Code verification against specs + security

**When Active:**

- User says "Проверь код" / "Review code"
- After @coder completes implementation

**What It Does:**

1. Verifies against specification
2. Checks security (loads checklist-security)
3. Validates architecture compliance
4. Ensures framework rules adherence (rules/meta-architect-framework.md)
5. Returns PASS (ready) or FAIL (issues + severity)

**Auto-loads checklist-* skills as needed.**

---

### role-coder-expert (Forensic Investigator)

**Responsibility:** Root cause analysis for complex issues

**When Active:**

- User says "Начни расследование" / "Investigate"
- Meta-architect requests when cause unknown

**What It Does:**

1. Systematic investigation
2. Hypothesis testing
3. Creates Research.md with findings
4. Provides recommendations
5. Returns to meta-architect for planning

**Use when: >2 failed fixes, AI loops, mysteries.**

---

### role-guide (Consultant & Navigator)

**Responsibility:** Framework help + codebase navigation + feature advice

**When Active:**

- User says "Помощь" / "Help" / "Где находится"
- Framework questions
- Codebase navigation requests
- Feature advisory questions

**What It Does:**

1. Explains framework concepts
2. Navigates codebase ("где находится X")
3. Advises on features ("нужна ли Y", "чего не хватает")
4. Redirects to appropriate role when action needed

**Answers questions, does NOT perform tasks.**

---

## Workflow System

Workflows = step-by-step protocols for specific scenarios.

**Loaded BY role-meta-architect** when planning tasks.

### Available Workflows

| Workflow | Purpose | Complexity |
|----------|---------|------------|
| **workflow-feature** | Adding new functionality | 🟢🟡🔴 |
| **workflow-debugging** | Bug fixes, regressions | 🟢🟡 |
| **workflow-refactoring** | Code improvement without behavior change | 🟡🔴 |
| **workflow-architecture-change** | Major architectural shifts | 🔴 |
| **workflow-new-project** | Starting from scratch (greenfield) | 🔴 |
| **workflow-requirements-interview** | Gathering unclear requirements | 🟡🔴 |
| **workflow-legacy-analysis** | Understanding unfamiliar codebase | 🟡🔴 |
| **workflow-ai-session** | Session management, context recovery | N/A |
| **workflow-ui-build-order** | UI implementation sequencing | 🟡 |

---

## Pattern System

Patterns = architectural guidance for specific design problems.

**Loaded when role-meta-architect or role-coder needs architectural knowledge.**

### Available Patterns

- **pattern-clean-architecture** — Layered architecture with dependency inversion
- **pattern-multi-tenant** — Tenant isolation strategies (DB/schema/row)
- **pattern-rbac** — Role-Based Access Control implementation
- **pattern-modular-monolith** — Monolith with module boundaries
- **pattern-feature-flags** — Runtime feature toggling

---

## Checklist System

Checklists = verification frameworks for quality gates.

**Loaded by role-reviewer when performing reviews.**

### Available Checklists

- **checklist-security** — Security audit (auth, data, APIs)
- **checklist-code-review** — General code quality
- **checklist-release** — Pre-production verification
- **checklist-phase-completion** — Phase/sprint gate (multi-phase projects)
- **checklist-ux-completeness** — UI/UX verification (states, a11y, responsive)

---

## How Skills Activate (Progressive Disclosure)

### Mechanism

1. **IDE always loads:**
   - Always-On Rules (~8KB)
   - YAML descriptions of all skills (~5KB)

2. **User makes request:**
   - IDE analyzes YAML descriptions
   - Semantic matching with user intent
   - Auto-activates relevant skills

3. **Example:**

   ```
   User: "Добавь аутентификацию"
   → IDE matches "добавь" + "аутентификацию"
   → Activates: role-meta-architect
   → Meta-architect loads: workflow-feature, pattern-rbac
   ```

4. **Delegation:**

   ```
   Meta-architect creates prompt
   → Outputs: "Скажите: 'Выполни реализацию'"
   
   User: "Выполни реализацию"
   → IDE matches command
   → Activates: role-coder
   ```

5. **Context switches:**

   ```
   Coder completes
   → Outputs: "Скажите: 'Проверь код'"
   
   User: "Проверь код"
   → IDE: Unloads role-coder, Loads role-reviewer
   → Reviewer loads: checklist-security (if auth-related)
   ```

---

## Complexity Classification

### 🟢 Simple (<2 files, no DB/API, clear requirement)

**Criteria:**

- Single file changes (<50 lines)
- No database/API modifications
- No architectural impact
- Unambiguous requirement

**Flow:**

```
Assess → Quick scope → @coder → @reviewer → Done
```

**Plan required:** No (brief assessment only)

---

### 🟡 Medium (multiple files, DB/API, some ambiguity)

**Criteria:**

- New module or multiple files
- Database/API modifications
- Cross-module integration
- Some edge cases need clarification

**Flow:**

```
Assess → Plan.md → STOP (approval) → @coder → @reviewer → Done
```

**Plan required:** Yes (in /docs/Plan.md)

---

### 🔴 Complex (architecture, auth, scaling, migrations)

**Criteria:**

- Architectural changes
- Multi-tenancy, auth/authz modifications
- Performance/scaling requirements
- Multiple integration points
- Migration risks

**Flow:**

```
Assess → (maybe @expert) → Research.md → Plan.md + ADR → 
STOP (approval) → Phased @coder → @reviewer per phase → Done
```

**Plan required:** Yes + Research.md + ADR

---

## Delegation Flow

```
┌──────────────────┐
│ User Task        │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ role-meta-architect              │
│ ├─ Classify 🟢🟡🔴              │
│ ├─ Load workflow-* if needed     │
│ ├─ Create Plan.md (🟡🔴)         │
│ └─ Generate prompt for @coder    │
└────────┬─────────────────────────┘
         │
         │ STOP (for 🟡🔴 approval)
         ▼
┌────────────────────────┐
│ User Approval          │
│ "approved"             │
└────────┬───────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ meta-architect outputs:          │
│ "Скажите: 'Выполни реализацию'"  │
└────────┬─────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ User Command           │
│ "Выполни реализацию"   │
└────────┬───────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ role-coder                       │
│ ├─ Validate Plan.md exists       │
│ ├─ Implement per prompt          │
│ └─ Output: "Проверь код"         │
└────────┬─────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ User Command           │
│ "Проверь код"          │
└────────┬───────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ role-reviewer                    │
│ ├─ Load checklist-* as needed    │
│ ├─ Verify against spec           │
│ └─ Return PASS/FAIL              │
└────────┬─────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  PASS      FAIL
    │         │
    │         └──> meta-architect analyzes
    │              └──> Revise Plan.md
    │                  └──> Retry with improved prompt
    │
    ▼
┌─────────────────────┐
│ Task Complete       │
│ Docs updated        │
└─────────────────────┘
```

---

## Quality Gates

### 5 Non-Negotiable Rules

1. **No Plan, No @coder (🟡🔴)**
   - Plan.md must exist before delegation
   - Exception: 🟢 Simple with clear scope

2. **Unknown Cause → @coder-expert**
   - If can't explain "why" → investigate first
   - Then plan based on findings

3. **Every Implementation → @reviewer**
   - No merging without review
   - Exception: trivial changes (justified)

4. **Anti-Loop (Two Steps Back)**
   - >2 failures → STOP all implementation
   - Invoke @expert for root cause
   - Revise plan with lessons learned

5. **FAIL ≠ Blind Retry**
   - Analyze FAIL report
   - Update Plan.md if architectural issue
   - Revise prompt if implementation issue
   - >2 CRITICAL failures → invoke @expert

---

## /docs/* Memory System

Framework uses `/docs/` folder as **single source of truth**.

### Key Files

**Architecture.md**

- System design documentation
- Layer boundaries, patterns
- Technology stack
- Integration points

**Plan.md**

- Current/completed task plan
- Execution steps
- Acceptance criteria
- Risks and mitigation

**Requirements.md**

- Functional requirements (FR)
- Non-functional requirements (NFR)
- Success criteria
- Constraints

**Framework Rules** (rules/meta-architect-framework.md)

- Framework-level constraints and orchestration rules
- Agent routing and delegation protocols
- Complexity classification
- STOP gate semantics
- Project-specific rules can be added via memory/FACTS.md and memory/DECISIONS.md

**Research.md**

- Investigation findings (from @expert)
- Root cause analysis
- Alternatives considered
- Recommendations

**Tasks.md**

- Backlog/roadmap
- Prioritization
- Status tracking

**Context.md**

- Session snapshot (~200 words)
- Created when >10 turns or context heavy
- Use for session restart

**adr/** folder

- Architecture Decision Records
- Format: ADR-NNN-title.md
- Context, options, decision, consequences

---

## Best Practices

### For Users

1. **Start with meta-architect**
   - Every task begins with orchestrator
   - Let it classify and plan

2. **Use structured commands**
   - "Выполни реализацию" not "сделай"
   - "Проверь код" not "проверь"
   - Clear commands → reliable activation

3. **Trust STOP gates**
   - When meta-architect says STOP → approve plan before proceeding
   - Quality comes from process

4. **Keep sessions focused**
   - >10 turns → consider Context.md + restart
   - One task per session for 🔴

5. **Explicit fallback**
   - If IDE activates wrong skill → use @role-name explicitly

### For Framework

1. **Plan quality > Code quality**
   - Bad plan guarantees rework

2. **Context is battlefield, not warehouse**
   - Load minimum, stay focused

3. **Documentation is law**
   - Code lies, /docs/* is truth

4. **When in doubt, STOP and ask**
   - Assumptions = failures

---

## Common Patterns

### Pattern: New Feature (🟡 Medium)

```
User: "Добавь поиск по категориям"
→ role-meta-architect activates

Meta: Классифицирует 🟡
      Загружает workflow-feature
      Создает Plan.md
      STOP для approval

User: "approved"

Meta: Генерирует промпт для @coder
      Выдает: "Скажите: 'Выполни реализацию'"

User: "Выполни реализацию"
→ role-coder activates

Coder: Имплементирует
       Выдает: "Скажите: 'Проверь код'"

User: "Проверь код"
→ role-reviewer activates

Reviewer: PASS → Done
```

### Pattern: Bug Fix (🟢 Simple)

```
User: "Исправь validation ошибку в email"
→ role-meta-architect activates

Meta: Классифицирует 🟢
      Быстрый assessment (без Plan.md)
      Сразу делегирует @coder

User: "Выполни реализацию"
→ role-coder fixes

User: "Проверь код"
→ role-reviewer PASS → Done
```

### Pattern: Mystery Bug (→ Expert)

```
User: "После обновления пользователи иногда разлогиниваются"
→ role-meta-architect activates

Meta: Причина неясна
      Делегирует @coder-expert

User: "Начни расследование"
→ role-coder-expert investigates

Expert: Создает Research.md
        Выдает: "Создай план на основе расследования"

User: "Создай план на основе расследования"
→ role-meta-architect creates Plan.md

Meta: План готов → @coder → @reviewer → Done
```
