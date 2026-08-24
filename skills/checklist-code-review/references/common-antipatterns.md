# 🚫 Common Antipatterns

<purpose>
A catalogue of antipatterns to recognise in the project and in the process.
Use it to spot problems and to prevent them.
</purpose>

---

## Quick Overview

| Category | Count | Severity |
|-----------|------------|-------------|
| 🏗️ Architectural | 8 | 🔴 High |
| 💻 Code | 7 | 🟠 Medium |
| 🤖 AI process | 6 | 🔴 High |
| 📋 Planning | 5 | 🟠 Medium |

---

## 🏗️ Architectural Antipatterns

### 1. Big Ball of Mud

**Description:** No structure — everything is connected to everything.

**Signs:**
- No clear module boundaries
- Circular dependencies everywhere
- Any change breaks unrelated parts
- Impossible to tell where anything lives

**Consequences:**
- Complexity growing exponentially
- The team cannot be scaled
- Every fix creates new bugs

**Remedy:**
```
1. Identify the bounded contexts
2. Introduce layers with clear boundaries
3. Dependency Inversion to break the couplings
4. Refactor incrementally (strangler pattern)
```

---

### 2. God Object / God Class

**Description:** One class or module knows and does too much.

**Signs:**
- Class over 500 lines
- More than 10 dependencies
- Every change passes through it
- Named `Manager`, `Helper`, `Util`, `Service` with nothing qualifying it

**Consequences:**
- Cannot be tested in isolation
- Constant merge conflicts
- Single point of failure

**Remedy:**
```
1. Single Responsibility Principle
2. Extract class along the domain logic
3. Composition instead of aggregating everything
```

---

### 3. Leaky Abstraction

**Description:** Implementation details seep through the abstraction.

**Signs:**
- Calling code knows the internals
- Using the abstraction requires understanding its implementation
- People route around it "for performance"

**Consequences:**
- The implementation cannot be replaced
- Changes cascade
- A false sense of isolation

**Remedy:**
```
1. Rethink the abstraction's contract
2. Hide the details behind the interface
3. Tell, don't ask
```

---

### 4. Distributed Monolith

**Description:** Microservices built with monolithic thinking.

**Signs:**
- Synchronous calls between services
- Shared database
- All services deploy together
- Changing one requires changing many

**Consequences:**
- The complexity of microservices plus the coupling of a monolith
- Network latency plus distributed failures
- The worst of both worlds

**Remedy:**
```
1. Revisit the service boundaries
2. Async communication (events)
3. Database per service
4. Or go back to a modular monolith
```

---

### 5. Premature Optimization

**Description:** Optimising without measurement or a real need.

**Signs:**
- Caching "just in case"
- Elaborate patterns "for scalability"
- Micro-optimisations instead of solving the problem
- No metric confirming the problem exists

**Consequences:**
- Complexity nobody needed
- The real problems stay ignored
- Time spent for nothing

**Remedy:**
```
1. Make it work → make it right → make it fast
2. Measure before optimising
3. 80/20: optimise the bottlenecks only
```

---

### 6. Copy-Paste Architecture

**Description:** Duplication in place of abstraction.

**Signs:**
- The same code in several places
- "It is slightly different" as the justification
- A bug fixed in one place survives in the copies

**Consequences:**
- Inconsistency
- Bugs multiplied
- Refactoring becomes impossible

**Remedy:**
```
1. Extract the shared abstraction
2. DRY with judgement, not as dogma
3. Rule of Three: duplicate twice, abstract on the third
```

---

### 7. Golden Hammer

**Description:** One tool or pattern used for everything.

**Signs:**
- "We always use X"
- The pattern applied where it fits and where it does not
- Technology chosen by familiarity rather than by the problem

**Consequences:**
- Suboptimal solutions
- Complexity where none is needed
- Too little where it is

**Remedy:**
```
1. The right tool for the problem
2. Study the alternatives
3. Weigh the trade-offs
```

---

### 8. Anemic Domain Model

**Description:** Domain objects with no logic, only data.

**Signs:**
- Entities are getters and setters
- All the logic sits in services
- The "domain model" is a DTO
- Tell, don't ask, violated

**Consequences:**
- Procedural code in an OOP shell
- Business logic smeared across the system
- Invariants cannot be guaranteed

**Remedy:**
```
1. Move the logic inside the domain objects
2. Enforce invariants in the constructor and the methods
3. Rich domain model
```

---

## 💻 Code Antipatterns

### 1. Magic Numbers/Strings

**Description:** Literals with nothing explaining what they mean.

**Remedy:** Named constants that say it.

---

### 2. Long Method

**Description:** A method that does too much.

**Signs:** Over 20 lines, multiple responsibilities.

**Remedy:** Extract Method along the steps of the logic.

---

### 3. Primitive Obsession

**Description:** Primitives standing in for domain types.

**Example:** `string email` instead of `Email email`.

**Remedy:** Value objects for domain concepts.

---

### 4. Feature Envy

**Description:** A method uses another class's data more than its own.

**Remedy:** Move the method to the data.

---

### 5. Shotgun Surgery

**Description:** One change requires edits in many places.

**Remedy:** Group the related logic together.

---

### 6. Dead Code

**Description:** Code that never runs.

**Signs:** Commented-out code, unreachable branches.

**Remedy:** Delete it. Git remembers.

---

### 7. Speculative Generality

**Description:** Abstractions for a future that never arrives.

**Signs:** Unused interfaces, empty hooks, "TODO: extend later".

**Remedy:** YAGNI — You Aren't Gonna Need It.

---

## 🤖 AI Process Antipatterns

### 1. Context Dump

**Description:** Loading everything "just in case".

**Consequences:** Context overflow, lost in the middle.

**Remedy:** Load only what the CURRENT step needs.

---

### 2. Session Marathon

**Description:** A session running past 15 steps with no restart.

**Consequences:** Quality degrades, the agent starts looping.

**Remedy:** 10–15 steps, then a mandatory restart.

---

### 3. Patch Spiral

**Description:** Patch → regression → patch → regression.

**Consequences:** Workarounds pile up and it never works.

**Remedy:** STOP → `debug` → Research.md → clean restart.

---

### 4. Hope-Driven Prompts

**Description:** Vague prompts, in the hope the AI will work it out.

**Signs:** «Сделай хорошо», «Улучши код», «Исправь баги».

**Remedy:** Concrete acceptance criteria, measurable requirements.

---

### 5. Delegation Without Plan

**Description:** Calling `code` with no Plan.md on a 🟡/🔴 task.

**Consequences:** Wrong direction, work redone.

**Remedy:** No plan, no `code` — 🟢 excepted.

---

### 6. Skipping `review`

**Description:** Moving to the next task straight after `code`.

**Consequences:** Bugs and vulnerabilities reach the codebase.

**Remedy:** `review` after `code`, every time.

---

## 📋 Planning Antipatterns

### 1. Analysis Paralysis

**Description:** Endless analysis, no action.

**Signs:** Research.md keeps growing, Plan.md never appears.

**Remedy:** Timeboxed research → decision → Plan.md.

---

### 2. Scope Creep

**Description:** The scope keeps widening.

**Signs:** «А ещё давайте…», «Заодно можно…».

**Remedy:** Explicit boundaries and an ❌ Out of Scope section.

---

### 3. Bikeshedding

**Description:** Debating trivia instead of what matters.

**Signs:** Hours on naming, minutes on architecture.

**Remedy:** Prioritise by impact.

---

### 4. Planning Without Research

**Description:** A plan written without knowing the current state.

**Consequences:** The plan cannot be executed; the assumptions are wrong.

**Remedy:** Research is mandatory for 🟡/🔴.

---

### 5. Invisible Dependencies

**Description:** Dependencies between tasks left unexamined.

**Consequences:** Blockers surface mid-work.

**Remedy:** Map the dependencies in Research.md.

---

## Detection Checklist

### Architectural Health Check
- [ ] Are the module boundaries clear?
- [ ] Do the dependencies point inward?
- [ ] Can a module be deployed independently?
- [ ] Is the project structure easy to follow?

### Code Health Check
- [ ] Methods under 20 lines?
- [ ] Classes under 300 lines?
- [ ] No magic numbers or strings?
- [ ] No dead code?

### Process Health Check
- [ ] Sessions under 15 steps?
- [ ] Plan.md before `code` for 🟡/🔴?
- [ ] `review` after every `code`?
- [ ] Research before the plan for 🟡/🔴?

---

## Quick Reference

```
Red flags (STOP immediately):

🏗️ Architecture:
   - Circular dependencies
   - God objects
   - A change breaking something unrelated

💻 Code:
   - Copy-paste more than twice
   - Magic literals
   - Over 500 LOC in a file

🤖 Process:
   - Session past 15 steps
   - Patch → regression loop
   - `code` with no Plan.md

📋 Planning:
   - Scope growing continuously
   - Research with no deadline
   - Dependencies left unexamined
```

---

**Related files:**
- `../../forensic-investigation/references/ai-failure-modes.md` — diagnosing AI failures
- `../../architectural-planning/SKILL.md` — scope, decomposition, delegation
- `../SKILL.md` — the review checklist
