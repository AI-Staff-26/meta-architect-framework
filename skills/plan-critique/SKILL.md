---
name: plan-critique
description: |
  Critique a plan, spec or result a working session returned — read as if it
  arrived from outside — with a premortem for 🔴 work, a second pass before an
  expensive decision, and how to check that it really works. Triggers:
  «покритикуй план», «второй проход», «пре-мортем», «как проверить, что
  работает». Used by `prompt-engineer`. The plan checkpoint inside a working
  session → `vibe-mentor`; something broken → `workflow-debugging`.
---

# Plan critique

## Read it cold

Take the artifact as it was sent: its goal and criteria, without the story of how it was made and without the owner's opinion of it. A model rates its own text more kindly and repeats its own draft's mistakes; this session is the fresh context the working session cannot be. Whose the plan is stays out too: a model's feedback turns softer when the person says they wrote the text or like it, and harsher when they say they dislike it or did not write it (Sharma et al. 2023). Judge it as work whose author you do not know.

## Find what breaks

Each finding names the place, what goes wrong, and a tag — [bug] or [text], as `verification-budget` §5 defines them. What you can show comes first; a suspicion is labelled a hypothesis.

- Neighbouring paths: the same result reached another way, a retry, two at once, a late answer.
- What the plan assumes about the system without having checked it.
- What it leaves out that the owner asked for, and what it adds that nobody asked for.

Not every finding becomes a change. A critique asked for holes reports some even in a sound plan, so the output also says where the plan holds, and the owner acts on [bug] findings and on what can be confirmed.

## Premortem — for 🔴 work

«A month from now this failed. Why?» Write the failure stories until the likely ones are named, each with the early sign that would show it coming and the cheapest change now that prevents it or catches it early.

## Second pass — before an expensive decision

A deeper single critique, not a second round: run it when the plan commits money or a client relationship, or when the owner asks for «второй проход». When it commits weeks of work or something hard to undo, offer it in one line and run it on the owner's yes. Running it again on a plan that has not changed is the owner's call (`verification-budget` §5). The steps go in this order; each finding they produce carries its step number.

1. **Blind answer.** Write the blind question first, for a new session: the goal, the facts, the constraints and an open question, with no plan, no one's preference, and only the data that may leave. It goes at the top of the output, so the owner can send it before reading the rest. Then answer it here — from the goal and the facts, what would you recommend, and would this plan be it if nobody had a preference for it? This session has read the plan, so its answer is provisional. When the owner brings back the new session's answer, compare: where it differs from the plan, that is a finding.
2. **Assumptions.** Those from «Find what breaks», plus what the plan assumes about users, the team and the market — each with what happens to the plan if it is false.
3. **Premortem**, as above.
4. **The case against.** The strongest argument against the plan, as its best opponent would make it; then how each party it touches responds — the client, a competitor, whoever pays, whoever maintains it.
5. **Both sides.** The plan at its strongest, as its best advocate would put it, beside the case against. Where they truly disagree is the real question. It may not be the question the plan answers, and the choice may be wider than the two options on the table.
6. **Numbers.** Each figure the decision rests on is recomputed from its inputs. External facts — prices, rates, benchmarks — are checked against primary sources, with only the data that may leave, by open questions (`thinking-moves`, X4). Each conclusion gets a confidence and the facts that would change it, so a promise becomes a range.
7. **Last sweep.** Where did this critique go easy on the plan, and is any hole still open? «None» is a valid answer; a hole counts with its place and its consequence.
8. **What was not asked.** Whether there are questions the owner should be asking about this decision and has not.

## How to check it works

For each thing the plan delivers: the action or command that shows it working through the real interface, and the result that would mean it does not. These become the owner's acceptance questions to the working session.

## Stop

Rounds of critique follow `verification-budget` §5: a budget named up front, a stop by the trend. A critique names the place and the defect; the fix belongs where the plan was made.

## Output

Sections marked «только второй проход» appear only when it ran.

```markdown
## Критика: [что проверено]

[Предлагаю второй проход: почему — когда план стоит недель работы или его трудно откатить, а проход не запущен]

### Слепой вопрос для новой сессии (только второй проход)
[цель, факты, ограничения, открытый вопрос — без плана и без чьего-либо мнения]
Когда вернёшь ответ — сравню его с планом.

Мой предварительный ответ (эта сессия уже видела план): […]

### Настоящий вопрос (только второй проход)
- [вопрос, который на самом деле решается, если он не тот, на который отвечает план, — и почему; или «тот же»]

### Находки
1. [bug] `где` — что ломается → направление исправления (шаг N — во втором проходе)
2. [text] `где` — …

### Гипотезы
- [что подозреваю] — [что это подтвердит или снимет]

### Пре-мортем (🔴 или второй проход)
- [история провала] — ранний признак → самое дешёвое изменение сейчас

### Цифры (только второй проход)
- [цифра] — пересчёт: [результат], сходится / нет → вывод: [вилка], уверенность [%]; изменит вывод: [факт] — или «цифр, на которых стоит решение, нет»

### Где план держится
- [что выдержало проверку — и чем]

### Что не спросили (только второй проход)
- [вопрос] — или «ничего существенного»

### Шаги 2, 4, 7 без находок (только второй проход)
- шаг N — [почему: не применим / проверен, держится; для шага 7 — «открытых дыр не осталось»]

### Как проверить, что работает
- [что сделано] — [действие или команда] → [результат, который будет провалом]
```

## Completion criterion

Every finding has a place, a tag and a direction; every hypothesis is labelled as one; 🔴 work has its premortem; in a second pass, steps 1, 3, 5, 6 and 8 have their sections — the blind question with the provisional answer marked as such, the premortem, the real question, the numbers, what was not asked — and steps 2, 4 and 7 each have a finding with its number or a line saying why there is none; the output says where the plan holds; every delivered thing has its check.
