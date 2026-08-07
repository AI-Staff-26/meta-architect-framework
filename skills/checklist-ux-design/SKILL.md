---
name: checklist-ux-design
description: |
  Settle the six UI decisions before implementation: mental model,
  information architecture, affordance, feedback, edge states, motion. Use
  before delegating UI-heavy work, or when previous UI came back generic and
  stateless. Verification after → `checklist-ux-review`.
---

# UX Design Passes

**Vanilla UI is what deferral looks like.** Every decision left unmade before implementation gets made anyway — at speed, by whoever is writing the component, in favour of the default. A generic screen with three states and no empty message is not a failure of taste; it is a record of which decisions were never made.

So each pass below ends in a decision written down. "We will see how it looks" is the absence of a decision, and it is the thing this skill exists to catch.

Run this for 🟡🔴 features with real interface surface, before the plan is finished.

## Pass 1 — Mental model

What does the user believe is happening, before being told anything?

Name the thing this resembles — the app or pattern they already know — and then name **where the resemblance breaks**. That break is where every misconception will live, and it is the only part that needs explaining in the interface.

*Settled when:* the expectation is written in one sentence, the closest familiar pattern is named, and every point where this behaves differently is listed with what the UI does about it.

## Pass 2 — Information architecture

What things exist, what they are called, and how they nest.

The name the user reads is the deliverable here, not a label chosen later: it should be the same word in the interface, the API, and the conversation with the user. Two names for one thing is a bug that ships in every layer at once.

Settle grouping and default order too — most lists have an order that is right for the task and an order that is merely easy to implement.

*Settled when:* every entity has one name, the containment is drawn, and each list has a stated default order with the reason.

## Pass 3 — Affordance

How does the user know what can be done?

**Exactly one primary action per screen.** Two primaries is none — the eye has nowhere to land. Secondary actions stay reachable without competing; destructive ones are separated from routine ones by more than colour.

Disabled controls carry the reason: a control that cannot be used and does not say why sends the user looking for the fault in themselves.

*Settled when:* the primary action is named for each screen, editable and draggable things are distinguishable from static ones, and every disabled state has the sentence it shows.

## Pass 4 — Feedback

For every action, what the system says back.

| State | The decision to make |
|---|---|
| **Empty** | What it says and what it invites the user to do — a blank region is an unanswered question |
| **Loading** | Skeleton or spinner, and what happens when it runs long |
| **Partial** | Whether progress is shown, and against what total |
| **Success** | Whether it is confirmed at all, and what comes next |
| **Error** | The specific reason and the recovery action — "Что-то пошло не так" is a decision not to explain |
| **Conflict** | What the user sees when someone else changed it first, and what their options are |

*Settled when:* every action in scope maps to what appears afterwards, and no error message is generic.

## Pass 5 — Edge states

The scenarios that are rare per user and constant across users.

First visit with nothing to show. Far more data than the layout was drawn for. A slow or absent connection. Permission denied. Two people editing the same thing. A destructive action and whether it can be undone — and if it cannot, what stands between the user and it.

*Settled when:* each scenario has a described behaviour, or an explicit "not applicable, because …".

## Pass 6 — Motion

What moves, for how long, and what the movement explains.

Motion earns its place by explaining a relationship — where a panel came from, what turned into what, that something arrived. Motion that decorates costs frames and attention and returns nothing. Timings come from tokens, and `prefers-reduced-motion` is honoured because for some users motion is not decoration but symptoms.

*Settled when:* each transition is listed with its duration, its purpose, and its reduced-motion behaviour.

## What this produces

A UX section written into `/docs/Plan.md` — one heading per pass, decisions only, no intentions. From it, each `code` prompt can be written without a single new choice being made at implementation time.

`frontend-design` covers the aesthetic direction — what it should look like — which is a different question from the six above and worth running alongside them when the UI needs a point of view.

## Completion criterion

Done when: every pass has a written decision or an explicit exclusion with a reason; the primary action, the entity names, and every state's copy are specified rather than described; and someone implementing from this document would not need to invent anything visible to the user.

## Related

- `workflow-ui-build-order` — the order it then gets built in
- `checklist-ux-review` — verification after implementation
- `frontend-design` — visual direction and typography
- `grilling` — the user's expectations are guesses so far
