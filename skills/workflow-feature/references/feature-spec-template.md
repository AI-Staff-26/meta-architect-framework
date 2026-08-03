# ✨ Feature Specification Template

<purpose>
Template for detailed feature specification and design.
Bridges requirements and implementation with complete feature definition.
</purpose>

---

> **Instruction:** Fill in sections below before implementation starts.  
> Use this for 🟡 Medium and 🔴 Complex features requiring formal specification.  
> For 🟢 Simple features, use streamlined Plan template instead.

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature Name** | [Clear, descriptive name] |
| **Feature ID** | FEAT-XXX |
| **Priority** | 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low |
| **Complexity** | 🟢 Simple / 🟡 Medium / 🔴 Complex |
| **Status** | Draft / Review / Approved / In Progress / Done |
| **Created** | YYYY-MM-DD |
| **Author** | `architect` |
| **Stakeholders** | [Product, Engineering, Design, etc.] |

---

## Overview

### Summary
> What is this feature in one sentence?

[One clear sentence describing the feature]

### Problem Statement
> What problem does this feature solve?

[2-3 sentences describing the pain point or opportunity]

### Goals
What are we trying to achieve?

- 🎯 **Primary:** [Main goal]
- 🎯 **Secondary:** [Supporting goal]
- 🎯 **Tertiary:** [Nice-to-have goal]

### Non-Goals
What is explicitly out of scope?

- ❌ [What we are NOT doing]
- ❌ [What we are NOT doing]
- ❌ [What we are NOT doing]

---

## User Stories

### Primary User Stories

#### US-1: [Story Title]
**As a** [user type]  
**I want** [action/capability]  
**So that** [benefit/value]

**Acceptance Criteria:**
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
- [ ] [Additional criterion]

**Priority:** 🔴 Must Have

---

#### US-2: [Story Title]
**As a** [user type]  
**I want** [action/capability]  
**So that** [benefit/value]

**Acceptance Criteria:**
- [ ] Given [context], when [action], then [result]
- [ ] [Additional criterion]

**Priority:** 🟡 Should Have

---

#### US-3: [Story Title]
**As a** [user type]  
**I want** [action/capability]  
**So that** [benefit/value]

**Acceptance Criteria:**
- [ ] Given [context], when [action], then [result]

**Priority:** 🟢 Could Have

---

## Functional Requirements

### FR-1: [Requirement Name]
| Attribute | Value |
|-----------|-------|
| **ID** | FR-XXX-001 |
| **Description** | [What the system must do] |
| **Source** | [User story / Business need] |
| **Priority** | Must / Should / Could |

**Details:**
- [Specific behavior 1]
- [Specific behavior 2]
- [Edge case handling]

---

### FR-2: [Requirement Name]
| Attribute | Value |
|-----------|-------|
| **ID** | FR-XXX-002 |
| **Description** | [What the system must do] |
| **Source** | [User story / Business need] |
| **Priority** | Must / Should / Could |

**Details:**
- [Specific behavior]

---

## Non-Functional Requirements

### Performance
| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-P1 | Response time | < 200ms p95 | APM monitoring |
| NFR-P2 | Throughput | 1000 req/s | Load testing |

### Security
| ID | Requirement | Implementation |
|----|-------------|----------------|
| NFR-S1 | [Security requirement] | [How implemented] |
| NFR-S2 | [Security requirement] | [How implemented] |

### Reliability
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-R1 | Availability | 99.9% |
| NFR-R2 | Error rate | < 0.1% |

### Other Quality Attributes
- **Accessibility:** [WCAG level / requirements]
- **Localization:** [Supported languages / regions]
- **Compatibility:** [Browsers / devices / versions]

---

## User Interface

### Wireframes / Mockups

```
┌──────────────────────────────────────────┐
│  Header                           [User] │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │     [Main Content Area]            │  │
│  │                                    │  │
│  │  ┌──────────┐  ┌──────────┐       │  │
│  │  │ Element  │  │ Element  │       │  │
│  │  └──────────┘  └──────────┘       │  │
│  │                                    │  │
│  │           [ Action Button ]        │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

### User Flow

```
[Entry Point]
     │
     ▼
┌─────────────┐
│  Screen 1   │
│  [Action]   │──────┐
└─────────────┘      │
     │               │
     ▼               ▼
┌─────────────┐  ┌─────────────┐
│  Screen 2   │  │  Screen 2b  │
└─────────────┘  │  (Alt path) │
     │           └─────────────┘
     ▼                   │
┌─────────────┐          │
│  Success    │◄─────────┘
└─────────────┘
```

### States

| State | Description | Visual Treatment |
|-------|-------------|------------------|
| Empty | No data yet | [Placeholder / onboarding] |
| Loading | Fetching data | [Spinner / skeleton] |
| Loaded | Data available | [Normal display] |
| Error | Request failed | [Error message + retry] |
| Disabled | Action not allowed | [Greyed out] |

### UX Design Pass (for UI-heavy features)

> **Note:** Complete this section for features with significant UI.  
> Based on 6-pass UX methodology to prevent "vanilla UI" syndrome.

#### Mental Model Alignment
> How does the user THINK this feature works?

**User expectations on entry:**
- [What does user expect to see/happen when entering this feature?]

**Familiar patterns:**
- [Which apps/patterns is user already familiar with?]
- [What conventions should we follow?]

**Potential misconceptions:**
- [What might confuse the user?]
- [What needs explicit explanation?]

#### Information Architecture

| Entity | Parent | Children | Primary Actions |
|--------|--------|----------|-----------------|
| [Entity name] | [Where it lives] | [What it contains] | [What user can do] |

**Hierarchy notes:**
- [How entities relate to each other]
- [What determines ordering/grouping]

#### Affordance Matrix

| Element | Appears As | Behavior | Visual Signal |
|---------|------------|----------|---------------|
| [Primary CTA] | Button | Main action | Prominent color, elevated |
| [Secondary action] | Text link | Alt action | Underline on hover |
| [Editable field] | Input | Updates value | Border, focus state |
| [Draggable item] | Card | Reorder | Grab cursor, shadow lift |

#### System Feedback

| State | Visual | Message | User Action |
|-------|--------|---------|-------------|
| Empty | Illustration | "No [items] yet. Create your first." | [+ Create] button |
| Loading | Skeleton/Spinner | — | Cancel if long |
| Partial | Progress indicator | "X of Y loaded" | Continue/Wait |
| Error | Red highlight | "{reason}. Try again." | [Retry] button |
| Success | Green toast | "Saved successfully" | Auto-dismiss 3s |
| Conflict | Warning modal | "Changes detected" | [Merge]/[Override] |

#### Edge States Checklist

- [ ] **First visit** — onboarding, empty state guidance
- [ ] **Empty state** — helpful empty state with CTA
- [ ] **Too much data** — pagination, virtualization, search
- [ ] **Slow connection** — optimistic UI, loading states
- [ ] **Offline mode** — cached data, sync indicators
- [ ] **Validation errors** — inline feedback, form state
- [ ] **Concurrent edits** — conflict resolution
- [ ] **Undo/redo** — reversible actions

#### Microinteractions

**Hover states:**
- [Buttons: scale, color shift]
- [Cards: shadow, border]
- [Links: underline, color]

**Transitions:**
- [Page transitions: duration, easing]
- [Modal open/close: animation type]
- [List reorder: movement timing]

**Progress indicators:**
- [Upload: progress bar with %]
- [Save: spinner → checkmark]
- [Delete: confirmation → fade out]

---

## Technical Design

### Architecture Overview

```
┌─────────────────────────────────────────────┐
│                 Feature Layer               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  UI      │──│  Logic   │──│  Data    │  │
│  │Component │  │  Service │  │  Access  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
    [Existing Infrastructure / APIs]
```

### Components

| Component | Purpose | Location |
|-----------|---------|----------|
| [UI Component] | [Renders feature UI] | `src/components/` |
| [Service] | [Business logic] | `src/services/` |
| [Repository] | [Data access] | `src/repositories/` |
| [Model] | [Data structure] | `src/models/` |

### API Changes

| Endpoint | Method | Change | Breaking? |
|----------|--------|--------|-----------|
| `/api/v1/[resource]` | POST | New endpoint | No |
| `/api/v1/[resource]/:id` | GET | Add new field | No |

#### Request/Response Examples

```json
// POST /api/v1/[resource]
// Request
{
  "field1": "value",
  "field2": 123
}

// Response (201)
{
  "id": "uuid",
  "field1": "value",
  "field2": 123,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Data Model Changes

| Entity | Change | Migration |
|--------|--------|-----------|
| [Entity A] | Add field | ALTER TABLE |
| [Entity B] | New entity | CREATE TABLE |

```sql
-- Migration: add_feature_support
ALTER TABLE [table] ADD COLUMN [column] [type];

-- Rollback
ALTER TABLE [table] DROP COLUMN [column];
```

### Dependencies

| Dependency | Version | Purpose | Approval |
|------------|---------|---------|----------|
| [package] | ^X.Y.Z | [Why needed] | ⏳ Pending |

---

## Test Strategy

### Unit Tests
| Test | Coverage | Location |
|------|----------|----------|
| [Component] logic | Core functions | `tests/unit/` |
| Edge cases | Error handling | `tests/unit/` |

### Integration Tests
| Test | Scope | Location |
|------|-------|----------|
| API contract | Request/response | `tests/integration/` |
| Data flow | Component interaction | `tests/integration/` |

### E2E Tests
| Scenario | User Journey |
|----------|--------------|
| Happy path | [Step 1 → Step 2 → Success] |
| Error handling | [Input → Error → Recovery] |

### Test Data

```json
// Test fixture: valid scenario
{
  "input": {...},
  "expected": {...}
}

// Test fixture: error scenario
{
  "input": {...},
  "expectedError": "..."
}
```

---

## Rollout Strategy

### Feature Flags
| Flag | Default | Purpose |
|------|---------|---------|
| `feature_xxx_enabled` | false | Master toggle |
| `feature_xxx_v2` | false | New variant |

### Phased Rollout
| Phase | Audience | Criteria | Duration |
|-------|----------|----------|----------|
| Alpha | Internal | Testing | 1 week |
| Beta | 5% users | Opt-in | 2 weeks |
| GA | 100% | Stable | Permanent |

### Rollback Plan
**Trigger conditions:**
- [ ] Error rate > X%
- [ ] Performance degradation > Y%
- [ ] Critical bug reported

**Rollback steps:**
1. Disable feature flag
2. [Additional steps if needed]
3. Notify stakeholders

---

## Metrics & Success

### Key Metrics
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| [Usage metric] | N/A | X users/day | Analytics |
| [Quality metric] | N/A | < X errors | Monitoring |
| [Business metric] | N/A | +X% revenue | Dashboard |

### Success Criteria
- [ ] [Quantitative success measure 1]
- [ ] [Quantitative success measure 2]
- [ ] [Qualitative success measure]

### Monitoring
| Dashboard | Purpose | Alert Threshold |
|-----------|---------|-----------------|
| [Metrics dashboard] | Usage tracking | - |
| [Error dashboard] | Issue detection | > X errors/min |

---

## Timeline

| Phase | Duration | Start | End | Owner |
|-------|----------|-------|-----|-------|
| Design | X days | YYYY-MM-DD | YYYY-MM-DD | `architect` |
| Development | X days | YYYY-MM-DD | YYYY-MM-DD | `code` |
| Testing | X days | YYYY-MM-DD | YYYY-MM-DD | @qa |
| Rollout | X days | YYYY-MM-DD | YYYY-MM-DD | `devops` |

---

## Open Questions

| # | Question | Owner | Status | Answer |
|---|----------|-------|--------|--------|
| 1 | [Unresolved question] | [Who] | Open | - |
| 2 | [Unresolved question] | [Who] | Resolved | [Answer] |

---

## Related Documents

- `memory/FACTS.md` → технические факты
- `memory/repo-wiki/overview.md` → [Related sections]
- `memory/adrs/ADR-XXX.md` → [Related decisions]
- [Figma / Design spec]
- [External documentation]

---

## Approval

| Role | Approver | Date | Status |
|------|----------|------|--------|
| Product | [Name] | YYYY-MM-DD | ⏳ Pending |
| Engineering | [Name] | YYYY-MM-DD | ⏳ Pending |
| Design | [Name] | YYYY-MM-DD | ⏳ Pending |

---

🛑 **STOP: Requires approval before implementation starts**

> **To approve, respond:**  
> ✅ Approved — proceed to implementation  
> ⚠️ Changes needed — [what to change]  
> ❌ Rejected — [reason]

---

**END OF TEMPLATE**
