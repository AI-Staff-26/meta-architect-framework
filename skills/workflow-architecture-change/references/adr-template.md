# 📋 Architecture Decision Record (ADR) Template

<purpose>
Template for documenting significant architectural decisions.
Creates a historical record of decision context, rationale, and consequences.
</purpose>

---

> **Instruction:** Fill in sections below when making an architectural decision that:  
> - Affects system structure or major components  
> - Has long-term consequences  
> - Is difficult or costly to reverse  
> - Involves trade-offs between alternatives

---

## ADR-XXX: [Short Descriptive Title]

**Date:** YYYY-MM-DD HH:MM (UTC +3)
**Status:** Proposed / Accepted / Deprecated / Superseded
**Deciders:** [Who approved this decision]

> **Supersedes:** ADR-XXX (if applicable)
> **Superseded by:** ADR-XXX (if deprecated)

---

## Context

### Problem Statement
> What is the issue that requires a decision?

[Describe the problem clearly in 2-4 sentences. Focus on WHAT the problem is, not the solution.]

### Drivers
Why does this decision need to be made now?

- **Functional:** [Requirement or capability needed]
- **Quality:** [Non-functional requirement: performance, security, etc.]
- **Constraint:** [Technical or business limitation]
- **Priority:** [Why this is urgent or important]

### Current State
[If applicable, describe how things work today and why it's insufficient]

```
[Diagram of current state if helpful]
```

---

## Decision

### Statement
> We will **[chosen approach]** because **[primary justification]**.

[1-2 sentences clearly stating the decision]

### Detailed Description

[Expand on the decision with more detail:]

- **What:** [Technical approach]
- **Where:** [Affected components/layers]
- **How:** [High-level implementation approach]

```
[Architecture diagram showing the decided approach]
```

---

## Alternatives Considered

### Option A: [Chosen Option Name]
> **STATUS: SELECTED**

**Description:** [How this option works]

| Aspect | Assessment |
|--------|------------|
| **Complexity** | Low / Medium / High |
| **Effort** | X days/weeks |
| **Risk** | Low / Medium / High |

**Pros:**
- ✅ [Advantage 1]
- ✅ [Advantage 2]
- ✅ [Advantage 3]

**Cons:**
- ❌ [Drawback 1]
- ❌ [Drawback 2]

---

### Option B: [Alternative Name]
> **STATUS: REJECTED**

**Description:** [How this option works]

| Aspect | Assessment |
|--------|------------|
| **Complexity** | Low / Medium / High |
| **Effort** | X days/weeks |
| **Risk** | Low / Medium / High |

**Pros:**
- ✅ [Advantage 1]
- ✅ [Advantage 2]

**Cons:**
- ❌ [Drawback 1]
- ❌ [Drawback 2]

**Why rejected:** [Key reasons]

---

### Option C: [Alternative Name]
> **STATUS: REJECTED**

**Description:** [How this option works]

**Pros:**
- ✅ [Advantage 1]

**Cons:**
- ❌ [Drawback 1]

**Why rejected:** [Key reasons]

---

## Consequences

### Positive
- ✅ [Benefit 1: specific outcome]
- ✅ [Benefit 2: specific outcome]
- ✅ [Benefit 3: specific outcome]

### Negative
- ❌ [Trade-off 1: what we give up]
- ❌ [Trade-off 2: additional complexity/cost]

### Neutral
- ⚬ [Side effect that is neither good nor bad]

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | Low/Med/High | Low/Med/High | [How to prevent/handle] |
| [Risk 2] | Low/Med/High | Low/Med/High | [How to prevent/handle] |

---

## Implementation

### Affected Components
| Component | Change Type | Impact |
|-----------|-------------|--------|
| [Component A] | Major / Minor | [What changes] |
| [Component B] | Major / Minor | [What changes] |

### Migration Path
> If replacing existing functionality, how do we transition?

1. [Step 1: Preparation]
2. [Step 2: Implementation]
3. [Step 3: Migration]
4. [Step 4: Cleanup]

### Timeline
| Phase | Duration | Milestone |
|-------|----------|-----------|
| Design | X days | [Output] |
| Implementation | X days | [Output] |
| Testing | X days | [Output] |

---

## Validation

### Success Criteria
How do we know this decision achieved its goals?

- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
- [ ] [Measurable criterion 3]

### Review Points
When will we revisit this decision?

- **Initial review:** [Date or trigger event]
- **Sunset condition:** [When to reconsider/deprecate]

---

## References

### Related Documents
- `memory/repo-wiki/overview.md` → [Related section]
- `memory/DECISIONS.md` → [Related decision]
- `memory/adrs/ADR-XXX.md` → [Related ADR]

### External References
- [Link to relevant documentation]
- [Link to research / RFC / standard]

---

## Decision Log

| Date | Action | Notes |
|------|--------|-------|
| YYYY-MM-DD | Proposed | Initial draft by @author |
| YYYY-MM-DD | Discussed | Team review session |
| YYYY-MM-DD | Accepted | Approved by @deciders |

---

**END OF TEMPLATE**
