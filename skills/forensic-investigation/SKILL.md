---
name: forensic-investigation
description: |
  Diagnose an agent that keeps failing: fixes producing new breakage, patches
  on patches, the same error a third time. Use after two failed cycles.
  Triggers: "уже третий раз", "снова сломалось", "ходим по кругу". A bug
  where the code is the subject → `workflow-debugging`.
---

# Diagnosing an Agent Loop

Ordinary debugging asks why the code misbehaves. This asks why the *process* keeps producing broken code — and it is a different question with a different answer.

**The cause is almost always in what the agent was given, not in the agent.** A loop means the same input keeps producing the same class of failure. Attempting the fix a third time produces the third failure; changing the input is the only move that has ever worked.

Load `memory/INSIGHTS.md` before starting. A loop that has happened here before is usually recorded, and knowing that changes the diagnosis from "what went wrong" to "why did the recorded countermeasure not hold".

## Recognise it

Two or more fix-then-regress cycles. Workarounds accumulating. Code growing more complex after every fix. Errors you already fixed coming back. Constraints stated in the prompt showing up violated in the diff.

One failed attempt is not a loop — it is a failed attempt. The second one carrying the same shape is the signal.

## Protocol

**1. Stop.** No further fix attempts while diagnosing. Every additional iteration adds noise to the evidence you are about to read and another patch to unwind.

**2. Build the iteration record.** For each cycle: what the agent was asked, what it changed, what broke. Reconstruct from the work reports in `memory/weeks/*/*/` and `git log` over the same window. Write it as a table — the pattern is usually visible the moment the cycles sit next to each other, and invisible while they are scattered across a conversation.

**3. Find what accumulates.** A loop always has a quantity that grows: patches, special cases, mocks, retries, `!important`, `any`. Name it. What is growing tells you what the agent is compensating for, and that is nearly always closer to the cause than the error message is.

**4. Name the failure mode.** `references/ai-failure-modes.md` holds the taxonomy — context overflow, lost-in-the-middle, patch loop, scope drift, hallucinated API, prompt overload, and the moderate modes — each with its signature and its repair. Match against it rather than inventing a description.

**5. Locate the cause in the input.** Four candidates, and the repair differs for each:

| Where it lives | How it shows up | What repairs it |
|---|---|---|
| **The prompt** | Constraints ignored, scope drifting, work invented | Constraints stated explicitly and placed at the start and end, not buried mid-prompt |
| **The context** | Early instructions forgotten, APIs hallucinated, the same question asked twice | Snapshot and restart clean with only what this task needs |
| **The complexity call** | Every fix breaks something adjacent | Re-classify — 🟢 work that keeps rippling was 🟡🔴 all along, and needs a plan |
| **The architecture** | Changing A always breaks B, and no seam holds a regression test | Stop implementing; this is a refactor or an architecture change, and no prompt will fix it |

The fourth is the one most often missed, because the first three all have cheap repairs and this one does not. When the evidence points there, say so plainly — three more prompt revisions will not move it.

**6. Exit.** Repair the input, then restart with clean context. `workflow-ai-session` holds the restart mechanics and the snapshot format. The revised prompt names what previously went wrong, so the fresh session does not rediscover it.

## Output

```markdown
# Диагностика цикла: [задача]

## Итерации
| # | Что просили | Что изменилось | Что сломалось |
|---|---|---|---|

## Что накапливается
[количество, которое растёт от итерации к итерации]

## Режим отказа
[по references/ai-failure-modes.md]

## Причина
[в промпте / в контексте / в оценке сложности / в архитектуре] — с доказательством из таблицы итераций

## Выход
1. [что меняем во входных данных]
2. [рестарт с чистым контекстом]

## Новый промпт
[исправленный, с явными ограничениями]
```

Record the root cause in `memory/FACTS.md` and the pattern in `memory/INSIGHTS.md`. A loop that recurs across tasks is a property of how the work is being framed, and naming it there is what stops the fourth occurrence.

## Completion criterion

Done when: every iteration is in the record with what broke; the accumulating quantity is named; the cause is placed in the prompt, the context, the complexity call, or the architecture, and supported by the iteration record rather than by impression; and the exit is either a revised prompt ready to run or an explicit statement that the fault is architectural and implementation stops here.

## Related

- `workflow-debugging` — when the code, not the process, is the thing failing
- `workflow-ai-session` — the clean restart: what carries over, and the prompt that opens it
- `references/ai-failure-modes.md` — the failure-mode taxonomy with repairs
- `references/research-template.md` — template for a written research document
