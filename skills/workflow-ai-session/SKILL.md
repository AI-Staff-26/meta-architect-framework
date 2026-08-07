---
name: workflow-ai-session
description: |
  Recover a degraded session: repetition, forgotten constraints, hallucinated
  APIs, resolved questions returning. Triggers: "ты забыл", "мы это уже
  обсуждали", "ходим по кругу", "начни заново". Fixes that keep breaking
  things → `forensic-investigation`.
---

# Session Recovery

A context window is not a filing cabinet. Everything in it competes for attention, and the strongest voice is the transcript itself — **the transcript becomes the specification**. A wrong turn taken twenty turns ago stays in the window and keeps voting, right alongside the instruction that was supposed to prevent it.

That is why a degraded session cannot be repaired by adding a correction. The correction joins the noise it was meant to overrule. What works is carrying forward what is true and leaving the rest behind.

## Read the signals

| Signal | What it says about the window |
|---|---|
| The same question asked twice | The answer is in the window and no longer reachable |
| A constraint stated early, violated now | Early instructions have been diluted by everything since |
| An API or file invented | Pattern-matching has replaced reading; verification stopped |
| A rejected approach proposed again | The rejection survived; the reason for it did not |
| Workarounds accumulating around one place | Each patch is reasoning from the previous patch rather than from the goal |
| Answers growing longer while progress stalls | Attention is on the conversation instead of the task |

One signal warrants attention. Two together mean the window is spending more than it returns, and the work goes faster after a restart than through it.

Turn count is a weak proxy — a long mechanical session can stay sharp while a short tangled one degrades quickly. Read the signals, not the counter.

## Route

| Situation | Move |
|---|---|
| Progress steady, constraints holding | Continue |
| Signals firing, but the task itself is understood | Restart clean — this skill |
| Fixes keep producing new breakage across iterations | `forensic-investigation` first |

That last row matters. Restarting a session whose *prompt* was the problem reproduces the same failure with a fresh window — faster, and no closer. Diagnose the input, then restart with it repaired.

## Prevent

**Load for the next decision, not for the task.** Files opened "for context" are read by the model in full and dilute everything else in the window.

**Restate the live constraint.** "As agreed above" points into the part of the window that fades first. Naming the constraint again costs a line and survives.

**Put what must hold at the edges.** Goal first, constraints and acceptance criteria last; the middle is where instructions go to die. `architectural-planning` holds the prompt anatomy this comes from.

**Close each slice.** Work landed and verified can leave the window; work half-done cannot. Finishing a slice is what makes a clean restart cheap.

## Restart

**1. Stop.** No further attempts at the current step — each one adds to what the restart must sort through.

**2. Update `memory/CONTEXT.md`** to the state a fresh session would need. The schema and the ~200-word ceiling are in `memory-keeping`. Anything larger belongs in `FACTS.md`, `DECISIONS.md`, or the chronicle, which is where a fresh session would look for it anyway.

**3. Decide what crosses over.** This is the whole skill in one step:

| Carries over | Stays behind |
|---|---|
| The goal, in one sentence | The narrative of how it was arrived at |
| Decisions, each with the reason it was made | The alternatives already eliminated |
| What is built and verified, by path | Failed attempts, retold |
| Constraints still live, including any that were violated | File contents that can be read again on demand |
| The single next step | Everything after it |

A decision without its reason is re-litigated. A reason without its decision is a discussion. Both travel together or neither is worth the line.

**4. Open the new session with a prompt that stands alone:**

```markdown
# [Task] — продолжение с чистым контекстом

## Цель
[one sentence: what works when this is done]

## Что уже готово
- `path/file.ts` — [what it does, verified how]

## Принятые решения
- [decision] — [why]

## Ограничения
- [constraint]
- [constraint that was violated earlier, restated]

## Следующий шаг
[one concrete action]

## Критерии приёмки
- [ ] [checked by running: …]
```

It refers to no earlier session. If the new agent would have to ask "what happened before?", a line above is missing.

**5. Record what caused it.** A degradation pattern that recurs — the same kind of task always running long, the same constraint always slipping — goes to `memory/INSIGHTS.md`. That is what stops the next one instead of recovering from it.

## Completion criterion

Recovered when: `CONTEXT.md` reflects the current state within its ceiling; the restart prompt carries goal, verified state, decisions with reasons, live constraints, and one next step; nothing in it points back at the old session; and work resumes from the next step rather than from re-establishing where things stand.

## Related

- `forensic-investigation` — fixes keep breaking things; diagnose the input before restarting
- `memory-keeping` — the `CONTEXT.md` schema and the rest of `memory/`
- `architectural-planning` — prompt anatomy and the context a delegation must carry
- `forensic-investigation/references/ai-failure-modes.md` — the failure-mode taxonomy
