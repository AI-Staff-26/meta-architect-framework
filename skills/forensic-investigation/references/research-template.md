# 🔍 Research Template

<purpose>
Template for documenting research findings before implementation.
Used to capture analysis, options considered, and rationale for decisions.
</purpose>

---

> **Instructions:** Fill in applicable sections. Remove sections that don't apply.  
> Focus on actionable insights, not exhaustive dumps.

---

## Metadata

| Field | Value |
|-------|-------|
| **Topic** | [Research topic/question] |
| **Date** | YYYY-MM-DD |
| **Author** | [Meta-Architect / Team] |
| **Status** | In Progress / Complete |
| **Related Task** | `/docs/Plan.md#task-id` or N/A |

---

## Research Question

> What are we trying to understand or decide?

**Primary Question:**  
[Single clear question this research answers]

**Sub-questions:**
- [Sub-question 1]
- [Sub-question 2]
- [Sub-question 3]

---

## Scope & Constraints

### In Scope
- ✅ [What we ARE investigating]
- ✅ [Boundaries of this research]

### Out of Scope
- ❌ [What we are NOT covering]
- ❌ [Deferred for later]

### Constraints
- ⚠️ [Time constraint]
- ⚠️ [Technology constraint]
- ⚠️ [Resource constraint]

---

## Sources Reviewed

| Source | Type | Key Takeaway |
|--------|------|--------------|
| [Official docs / link] | Documentation | [Main insight] |
| [Codebase: `path/to/file`] | Source Code | [What we learned] |
| [Stack Overflow / Article] | Community | [Relevant finding] |
| [Existing implementation] | Reference | [Pattern observed] |

---

## Options Analysis

### Option A: [Name]

**Description:**  
[1-2 sentences explaining the approach]

**Pros:**
- ✅ [Advantage 1]
- ✅ [Advantage 2]

**Cons:**
- ❌ [Disadvantage 1]
- ❌ [Disadvantage 2]

**Effort:** Low / Medium / High  
**Risk:** Low / Medium / High

---

### Option B: [Name]

**Description:**  
[1-2 sentences explaining the approach]

**Pros:**
- ✅ [Advantage 1]
- ✅ [Advantage 2]

**Cons:**
- ❌ [Disadvantage 1]
- ❌ [Disadvantage 2]

**Effort:** Low / Medium / High  
**Risk:** Low / Medium / High

---

### Option C: [Name] *(if applicable)*

[...]

---

## Comparison Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|--------|----------|----------|----------|
| [Criterion 1] | High | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| [Criterion 2] | Medium | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| [Criterion 3] | Low | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Total** | | [Score] | [Score] | [Score] |

---

## Recommendation

> **Recommended: Option [X]**

**Rationale:**  
[2-3 sentences explaining why this option wins]

**Trade-offs Accepted:**
- [Trade-off 1 we're OK with]
- [Trade-off 2 we're OK with]

**Risks Mitigated By:**
- [How we address Risk 1]
- [How we address Risk 2]

---

## Key Findings

> **TL;DR — What did we learn?**

1. **[Finding 1]:** [Concise summary]
2. **[Finding 2]:** [Concise summary]
3. **[Finding 3]:** [Concise summary]

---

## Open Questions

> Items requiring further investigation or decisions:

- [ ] [Question 1: context]
- [ ] [Question 2: context]
- [ ] [Question 3: who needs to decide]

---

## Next Steps

| Action | Owner | Due |
|--------|-------|-----|
| [Action 1] | [Who] | [When] |
| [Action 2] | [Who] | [When] |
| [Action 3] | [Who] | [When] |

---

## References & Links

- [Link 1: description](URL)
- [Link 2: description](URL)
- `path/to/relevant/code`
- Related ADR: `adr/ADR-NNN.md`

---

**END OF TEMPLATE**
