---
name: workflow-requirements-interview
description: |
  Turn a vague request into a Requirements.md that can be planned against —
  the coverage map of what a feature's requirements must settle, plus the
  document template. Use when a request has several possible readings, when a
  past attempt missed the mark, or when the user says "не уверен что именно
  нужно", "надо обсудить", "сделай как лучше". Supplies the territory;
  invoke grilling for the interview loop itself.
---

# Requirements Interview

Extract requirements you can plan against. This skill holds the **coverage map** — the territory a feature's requirements have to settle — and the document they land in.

**The interview loop lives in `grilling`.** Invoke it and work this map through it. This skill supplies *what* to resolve; `grilling` supplies *how* to ask.

## When it earns its cost

Reach for it when the request has more than one reasonable reading, when it carries many decision points, or when a previous attempt built the wrong thing. When a clear specification already exists, or the whole change is under half an hour, go straight to planning — an interview there spends the user's attention to confirm what you both already know.

## Coverage map

Six areas. They are territory, not a sequence — follow whichever branch the last answer opened, and use this to notice what has gone unexamined.

**Problem** — what problem this solves, for whom, what success looks like, and what failure looks like. Ask *why* behind each stated requirement; the answer often replaces the requirement with a better one.

**Scope** — what it must do, what would be nice, and what is explicitly excluded. The exclusions are the most valuable answers in the interview and the ones users volunteer least, so ask for them directly.

**Behaviour** — walk one typical case end to end. What the user provides, what comes back, which user types differ, what each is allowed to do.

**Quality attributes** — speed, scale, security level, availability, and any compliance obligation. Ask for a number wherever a number exists: "fast" is not reviewable, "under 200 ms at the 95th percentile" is.

**Edge cases** — empty data, too much data, malformed input, unexpected user action, external service failure, concurrent access, a second device. Each one either gets defined behaviour or gets written down as deliberately undefined.

**Blocking unknowns** — see `grilling`; they open the interview.

### Domain question banks

Pull the bank matching what is being built.

| Domain | Resolve |
|---|---|
| **User-facing** | Primary users; what triggers the flow; the happy path; which errors occur and how they surface; where it lives in the UI; available actions; which need confirmation |
| **API** | Purpose; methods; required and optional inputs; response shape; error cases; authentication; rate limiting; idempotency |
| **Data** | What is stored; relationships; expected volume; retention; who may read what; audit trail; backup and recovery |
| **Integration** | Which external system; protocol; authentication; retry and failure behaviour; timeouts; format mapping |

## Conducting it

Ask open questions before closed ones — a closed question proposes an answer, and users accept proposals rather than correcting them.

Listen for the unstated assumption, and repeat your understanding back in your own words. When the user corrects the restatement, that correction is the requirement.

Keep gathering separate from solving. A solution offered mid-interview stops the user describing the problem and starts them evaluating your idea, and the remaining branches go unexplored.

Phrases that open branches: *"Help me understand…"*, *"What happens if…"*, *"Can you give me an example?"*, *"What would be unacceptable?"*, *"Let me repeat back what I heard…"*.

## Output

Write `/docs/Requirements.md`:

```markdown
# Requirements: [Feature]

## Overview
[What this does, in two or three sentences]

## User Stories
As [user type], I want to [action], so that [benefit].

## Functional Requirements
### FR-1: [Name]
**Description:** [what it does]
**Acceptance criteria:**
- [ ] [Observable, checkable]

## Non-Functional Requirements
- **Performance:** [number]
- **Security:** [level]
- **Scale:** [number]

## Edge Cases
| Scenario | Expected behaviour |
|---|---|
| Empty input | … |
| Invalid data | … |
| External timeout | … |

## Out of Scope
- [Explicitly excluded]

## Open Questions
- [ ] PLACEHOLDER — [what is unresolved and who decides]

## Dependencies
- [External system, other feature]
```

Every acceptance criterion is observable: something you could hand to a reviewer who would reach the same verdict as you.

## Completion criterion

Requirements are done when every area of the coverage map is either resolved or carries a written `PLACEHOLDER` naming who decides; every acceptance criterion is checkable; the Out of Scope list is non-empty; and the user has confirmed the restatement in their own words.

**Areas covered, not questions asked.** A question count stops early on a payments integration and pads a rename.
