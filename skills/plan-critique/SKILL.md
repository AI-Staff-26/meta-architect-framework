---
name: plan-critique
description: |
  Critique a plan, spec or result a working session returned — read as if it
  arrived from outside — with a premortem for 🔴 work, and say how to check
  that it really works. Triggers: «покритикуй план», «пре-мортем», «как проверить,
  что работает». Used by `prompt-engineer`. The plan checkpoint inside a
  working session → `vibe-mentor`; something broken → `workflow-debugging`.
---

# Plan critique

## Read it cold

Take the artifact as it was sent: its goal and criteria, without the story of how it was made and without the owner's opinion of it. A model rates its own text more kindly and repeats its own draft's mistakes; this session is the fresh context the working session cannot be.

## Find what breaks

Each finding names the place, what goes wrong, and a tag — [bug] or [text], as `verification-budget` §5 defines them. What you can show comes first; a suspicion is labelled a hypothesis.

- Neighbouring paths: the same result reached another way, a retry, two at once, a late answer.
- What the plan assumes about the system without having checked it.
- What it leaves out that the owner asked for, and what it adds that nobody asked for.

## Premortem — for 🔴 work

«A month from now this failed. Why?» Write the failure stories until the likely ones are named, each with the early sign that would show it coming and the change to the plan that prevents it.

## How to check it works

For each thing the plan delivers: the action or command that shows it working through the real interface, and the result that would mean it does not. These become the owner's acceptance questions to the working session.

## Stop

Rounds of critique follow `verification-budget` §5: a budget named up front, a stop by the trend. A critique names the place and the defect; the fix belongs where the plan was made.

## Output

```markdown
## Критика: [что проверено]

### Находки
1. [bug] `где` — что ломается → направление исправления
2. [text] `где` — …

### Гипотезы
- [что подозреваю] — [что это подтвердит или снимет]

### Пре-мортем (🔴)
- [история провала] — ранний признак → изменение плана

### Как проверить, что работает
- [что сделано] — [действие или команда] → [результат, который будет провалом]
```

## Completion criterion

Every finding has a place, a tag and a direction; every hypothesis is labelled as one; 🔴 work has its premortem; every delivered thing has its check.
