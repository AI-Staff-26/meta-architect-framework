---
name: workflow-requirements-interview
description: |
  STRUCTURED REQUIREMENTS GATHERING through questioning. Discovers edge cases, 
  constraints, success criteria, hidden assumptions. Loaded BY role-meta-architect 
  when requirements unclear or incomplete. Creates Requirements.md. Use for: 
  ambiguous requests, complex features. NOT for: clear requirements.
---

<identity>
Protocol for extracting clear requirements through structured questioning.
Transforms vague requests into actionable specifications.
</identity>

---

<when_to_use>

## Activation Criteria

**Use this workflow when:**

- User request is vague or ambiguous
- Multiple interpretations possible
- Complex feature with many decision points
- User says "I'm not sure exactly what I need"
- Past implementations missed the mark

**Do NOT use when:**

- Requirements already clear
- Clear specification exists
- Simple task (< 30 min)

</when_to_use>

---

<protocol>

## Requirements Interview Protocol

### Phase 1: Core Understanding

```
GOAL QUESTIONS:
1. "What problem are you trying to solve?"
2. "Who will use this feature?"
3. "What does success look like?"
4. "What would failure look like?"
```

### Phase 2: Scope Definition

```
BOUNDARY QUESTIONS:
1. "What MUST this do?" (must-haves)
2. "What would be nice to have?" (should-haves)
3. "What is explicitly NOT included?" (won't-haves)
4. "What's the timeline/priority?"
```

### Phase 3: Functional Details

```
BEHAVIOR QUESTIONS:
1. "Walk me through a typical use case"
2. "What data does user provide?"
3. "What output/feedback do they expect?"
4. "What happens if [edge case]?"
5. "Are there different user types/permissions?"
```

### Phase 4: Non-Functional Requirements

```
QUALITY QUESTIONS:
1. "How fast should this be?" (performance)
2. "How many users/items will this handle?" (scale)
3. "What security level is needed?" (security)
4. "How reliable must it be?" (availability)
5. "Any compliance requirements?" (regulatory)
```

### Phase 5: Edge Case Discovery

```
EDGE CASE QUESTIONS:
1. "What if the data is empty?"
2. "What if there's too much data?"
3. "What if the user does something unexpected?"
4. "What if the external service fails?"
5. "What about concurrent access?"
6. "What about mobile/different devices?"
```

### Phase 6: Documentation

```
CREATE /docs/Requirements.md:
- Functional requirements (FR)
- Non-functional requirements (NFR)  
- Acceptance criteria
- Out of scope
- Open questions (if any)
```

</protocol>

---

<question_templates>

## Question Templates by Domain

### User-Facing Features

```
- Who are the primary users?
- What trigger starts this workflow?
- What's the happy path?
- What errors can occur?
- How should errors be communicated?
- Where does this appear in the UI?
- What actions are available?
- What confirmations are needed?
```

### API Endpoints

```
- What's the endpoint purpose?
- What HTTP method(s)?
- What inputs are required/optional?
- What's the response format?
- What errors can occur?
- Authentication required?
- Rate limiting needed?
- Idempotency considerations?
```

### Data/Database

```
- What data is stored?
- What relationships exist?
- How much data expected?
- How long is data retained?
- Who can access what data?
- Audit trail needed?
- Backup/recovery needs?
```

### Integration

```
- What external system?
- What's the API/protocol?
- Authentication method?
- Retry/failure handling?
- Timeout expectations?
- Data format/mapping?
```

</question_templates>

---

<requirements_template>

## Requirements.md Template

```markdown
# Requirements: [Feature Name]

## Overview
[What this feature does - 2-3 sentences]

## User Stories

### As [user type]
- I want to [action]
- So that [benefit]

## Functional Requirements

### FR-1: [Requirement Name]
**Description:** [What it does]
**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### FR-2: [Requirement Name]
...

## Non-Functional Requirements

### Performance
- [Requirement, e.g., "Response time < 200ms"]

### Security
- [Requirement, e.g., "Must be authenticated"]

### Scalability
- [Requirement, e.g., "Support 10K concurrent users"]

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty input | [behavior] |
| Invalid data | [behavior] |
| Timeout | [behavior] |

## Out of Scope
- [Explicitly excluded 1]
- [Explicitly excluded 2]

## Open Questions
- [ ] [Question needing user input]

## Dependencies
- [External system/API]
- [Other feature]
```

</requirements_template>

---

<interview_tips>

## Interview Best Practices

### DO

- Ask open-ended questions first
- Listen for unstated assumptions
- Repeat back understanding
- Probe "why" behind requirements
- Document as you go

### DON'T

- Lead the witness (suggest solutions)
- Assume you know what they mean
- Skip edge cases "for now"
- Mix gathering with solutioning

### Phrases That Help

- "Help me understand..."
- "What happens if..."
- "Can you give me an example?"
- "What would be unacceptable?"
- "Let me repeat back what I heard..."

</interview_tips>

---

**Loaded by:** role-meta-architect  
**Output:** /docs/Requirements.md with clear specifications
