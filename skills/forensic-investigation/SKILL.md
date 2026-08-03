---
name: forensic-investigation
description: |
  Investigation protocols and diagnostic methodologies for complex technical problems.
  Includes: systematic investigation (5 phases), AI loop diagnosis and exit strategies,
  legacy code reverse engineering, performance analysis, debugging tools reference.
  Used primarily by @coder-expert mode, but available to any mode needing
  structured investigation approach. Triggers: root cause analysis, AI loops,
  legacy mysteries, performance bottlenecks, integration failures.
---

<investigation_protocol>

## 🔍 Investigation Protocol

### Phase 1: Gather Facts (Not Opinions!)

```markdown
## Facts (Objective)
- What's happening? [Specific behavior]
- When did it start? [Time/version/commit]
- Reproduction conditions? [Steps]
- What's in logs? [Specific entries]
- What's the state? [DB, cache, memory]

## NOT facts (Yet)
- Assumptions
- "Should work like this"
- "Used to work"
```

### Phase 2: Build Hypotheses

```markdown
## Hypotheses

### H1: [Hypothesis name]
**Assumption:** [What we assume]
**How to test:** [Specific steps]
**Expected result if true:** [What we'll see]

### H2: [Hypothesis name]
**Assumption:** [What we assume]
**How to test:** [Specific steps]
**Expected result if true:** [What we'll see]

### H3: [Hypothesis name]
...
```

**Hypothesis rules:**

- Minimum 2-3 hypotheses (avoid tunnel vision)
- Each must be testable
- Start with most likely
- Include "non-obvious" options

### Phase 3: Test Hypotheses

```markdown
## Testing H1: [Name]

### Experiment:
[What I did to test]

### Result:
[What I got — specific data]

### Conclusion:
✅ CONFIRMED / ❌ REJECTED / ⚠️ PARTIAL

### Evidence:
- [Log/screenshot/data]
```

### Phase 4: Root Cause Analysis

```markdown
## Root Cause

### Direct cause:
[What directly causes the problem]

### Root cause:
[Why this became possible]

### Chain:
[Root cause] → [Intermediate effect] → [Direct cause] → [Symptom]

### Evidence:
- [Fact 1 supporting conclusion]
- [Fact 2 supporting conclusion]
```

### Phase 5: Recommendations

```markdown
## Recommendations

### Immediate fix (Fix):
[What to do to eliminate the problem]

### Prevention (Prevention):
[What to do so it doesn't repeat]

### Improved diagnostics (Observability):
[How to improve detection of similar issues]
```

</investigation_protocol>

---

<ai_loop_diagnosis>

## 🔄 AI Loop Diagnosis

### What is an AI Loop?
>
> @coder fixes bug → creates new one → fixes it → creates another → ...

### Signs

- [ ] >2 fix-regression iterations
- [ ] Workarounds accumulating
- [ ] Code becomes more complex after each fix
- [ ] Same errors returning
- [ ] @coder "forgets" constraints

### AI Loop Types and Repair

| Type | Symptoms | Root Cause | Repair |
|------|----------|------------|--------|
| **Context Overload** | Forgets early instructions | Context >50% | → Snapshot Context.md → Restart |
| **Weak Constraints** | Ignores constraints | No explicit ❌ | → Add explicit constraints |
| **Wrong Complexity** | Fixes create bugs | 🟢 instead of 🟡/🔴 | → Reclassify complexity |
| **Missing Context** | Invents API/functions | No code context | → Provide explicit list of available |
| **Circular Dependencies** | Changes to A break B and vice versa | Architectural issue | → @meta-architect for refactoring |

### Loop Exit Protocol

```markdown
## AI Loop Diagnosis

### Observations:
- Iteration 1: [What @coder did] → [What broke]
- Iteration 2: [What @coder did] → [What broke]
- Iteration 3: [What @coder did] → [What broke]

### Pattern:
[What's repeating / what's accumulating]

### Loop Type:
[Context Overload / Weak Constraints / ...]

### Root Cause:
[Why @coder is looping]

### Recommendation:
1. STOP current work
2. [Specific action to break the cycle]
3. [Changes to prompt/plan]
4. Restart with clean context

### New prompt for @coder:
[Corrected prompt accounting for found problem]
```

</ai_loop_diagnosis>

---

<legacy_analysis>

## 🏚️ Legacy Code Analysis

### Reverse Engineering Protocol

```markdown
## Legacy Analysis: [Component/Module]

### 1. Boundary Mapping
- Entry points: [endpoints, functions, events]
- Exit points: [what it returns, where it writes]
- Dependencies: [what it depends on]
- Dependents: [what depends on it]

### 2. Data Flow
[Where data comes from] → [How it transforms] → [Where it goes]

### 3. Hidden Contracts
- [Implicit assumption 1]
- [Implicit assumption 2]
- [Side effect that's not obvious]

### 4. Landmines
⚠️ [Dangerous place 1]: [why dangerous]
⚠️ [Dangerous place 2]: [why dangerous]

### 5. Safe Change Zones
✅ [What can be changed safely]

### 6. Recommendations
[How to work with this code]
```

</legacy_analysis>

---

<performance_analysis>

## ⚡ Performance Analysis

### Protocol

```markdown
## Performance Analysis: [What we're analyzing]

### 1. Baseline (Current metrics)
- Response time p50: [value]
- Response time p95: [value]
- Throughput: [req/sec]
- Resource usage: CPU/Memory/IO

### 2. Bottleneck Identification
[Identification method: profiling, tracing, logs]

### 3. Hotspots Found
1. [Place 1]: [% of time] — [why slow]
2. [Place 2]: [% of time] — [why slow]

### 4. Root Causes
- [Cause 1]: [evidence]
- [Cause 2]: [evidence]

### 5. Optimization Recommendations
| Optimization | Expected Effect | Complexity | Risks |
|--------------|-----------------|------------|-------|
| [What to do] | [Improvement] | Low/Med/High | [Risks] |

### 6. Quick Wins
[What can be improved quickly with minimal risk]
```

</performance_analysis>

---

<output_templates>

## 📤 Output Templates

### Standard result — Research.md

```markdown
# Research: [Investigation title]
*Date: YYYY-MM-DD*
*Investigator: @coder-expert*
*Status: Complete / In Progress*

## Problem Statement
[Clear problem description]

## Investigation Summary

### Facts Gathered
- [Fact 1]
- [Fact 2]

### Hypotheses Tested

#### H1: [Name] — ❌ REJECTED
[Brief description why rejected]

#### H2: [Name] — ✅ CONFIRMED
[Brief description why confirmed]

## Root Cause
[Root cause with evidence]

## Recommendations

### Immediate Fix
[What to do now]

### Prevention
[How to prevent in future]

## Appendix
[Logs, screenshots, experiment data]
```

### For AI Loop

```markdown
# AI Loop Diagnosis

## Loop Pattern
[Pattern description]

## Root Cause
[Why it's looping]

## Exit Strategy
1. [Step 1]
2. [Step 2]

## Revised Prompt for @coder
[New prompt]
```

### When blocked

```markdown
# Investigation Blocked

## Current State
[Where we stopped]

## Blocker
[What's blocking]

## Needed
[What's needed to continue]
```

</output_templates>

---

<tools_and_techniques>

## 🛠️ Tools and Techniques

### Debugging

```bash
DEBUG=* node app.js                  # Verbose logging
node --inspect-brk app.js            # Breakpoints (chrome://inspect)
console.trace('Where am I?')         # Stack trace
```

### Database

```sql
SHOW PROCESSLIST; SELECT * FROM pg_stat_activity;  -- Active queries
EXPLAIN ANALYZE SELECT ...;                         -- Query plan
SELECT * FROM pg_locks; SHOW ENGINE INNODB STATUS;  -- Locks
```

### Network

```bash
curl -v -X POST https://api.example.com/endpoint  # HTTP debug
nslookup domain.com                                # DNS
nc -zv host port                                   # Connectivity
```

### Git Archaeology

```bash
git blame file.ts                              # Who changed line
git log --oneline -20 -- file.ts               # File history
git log -S "searchString" --oneline            # Find by content
git diff commit1..commit2 -- file.ts           # Diff versions
git bisect start && git bisect bad HEAD && git bisect good v1.0.0  # Find bug
```

### Code Analysis

```bash
grep -rn "TODO\|FIXME" src/                    # Find TODOs
grep -rn "functionName" --include="*.ts"       # Find usages
npx madge --image graph.svg src/               # Dependency graph
```

### Performance Profiling

```javascript
// Node.js profiling
node --prof app.js
node --prof-process isolate-*.log > profile.txt

// Chrome DevTools
// Performance tab, Memory tab

// Database
EXPLAIN ANALYZE SELECT ...;
SHOW PROFILE FOR QUERY X;
```

</tools_and_techniques>

---

**Связанные файлы:**

- `references/ai-failure-modes.md` — диагностика сбоев AI-агентов
- `references/research-template.md` — шаблон исследования

---

**END OF forensic-investigation SKILL**
