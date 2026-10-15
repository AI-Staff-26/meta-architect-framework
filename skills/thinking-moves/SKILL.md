---
name: thinking-moves
description: |
  Moves for working with a model in conversation, and pipelines for tasks
  outside development: a decision, research, a text, checking someone's
  work, learning, ideas, a bot's prompt. Triggers: «помоги решить»,
  «исследуй тему», «напиши текст», «проверь чужую работу», «придумай»,
  «промпт для бота». Used by `prompt-engineer`. Negotiation and crisis →
  `consilium`; product direction → `advisor`.
---

# Thinking moves

Assembled from published research on how models fail in conversation; not yet trialled on our own tasks — note what worked and what did not. Each move answers one measured failure.

## Six failures, six moves

| The model… | It looks like | Move |
|---|---|---|
| fills gaps with guesses and holds on to them (Laban et al. 2025) | a confident answer to a different question | **X1. Questions first** — an interview, or a list of the assumptions to confirm; the confirmed brief goes to a new chat as one message |
| gives the most typical answer (Verbalized Sampling, 2025) | templated options that look alike | **X2. Widen** — clearly different options with rough probabilities, unlikely ones included; a change of angle |
| finds its own errors poorly, fixes pointed-out ones well (Tyen et al. 2023) | «сделай лучше» rewrites everything, the error stays | **X3. Point fix** — the place and the defect named, the rest kept |
| repeats its draft's errors and rates its own text higher (CoVe 2023; Panickssery et al. 2024) | the self-check says «всё верно» | **X4. Check outside the chat** — a fresh chat, another model, a search, a run; only with data allowed to leave |
| agrees with the person (Sharma et al. 2023) | praises the idea; drops a right answer under «ты уверен?» | **X5. Disagreement on request** — your opinion hidden, the work presented as someone else's, a premortem or the strongest counter-case asked for |
| works worse on long, cluttered context (Chroma 2025) | forgets agreements, repeats an old error | **X6. Context hygiene** — one chat per task; after two failed fixes of the same thing, a summary and a new chat; state in a file |

A strong reasoning model checks its routine work itself. X4 is for high stakes, facts from outside, or a cheaper model.

## Pipelines

- **P1. Decide** — X1 brief → X2: three to five options, «ничего не делать» among them, criteria set before choosing → options × criteria → X5: a premortem of the favourite in a fresh context → the owner decides and records what was chosen, why, what was rejected, and the signal to revisit.
- **P2. Research** — X2: the questions worth asking → sources with quotes, the primary source over a retelling → claim, source, confidence → X4 for the key numbers and attributions → a synthesis that marks what is firm, disputed and unknown.
- **P3. Text** — X1: the reader, the action they should take, the tone → an outline agreed first → section by section with X3 → a self-check against the criteria → X4: a cold reader → numbers checked.
- **P4. Check someone's work** — `plan-critique`; facts through X4; fixes by severity, not every finding.
- **P5. Long work** — X1 at each stage; state in a file; one chat per stage; two failed fixes → a summary and a restart (`workflow-ai-session`).
- **P6. Learn** — an explanation at two levels → questions and hints instead of answers → a retelling, and the gaps in it → X3 on the gaps → practice from easy to hard.
- **P7. Ideas** — the context and what was tried → X2 wide → group, and set criteria before judging → a shortlist → X5 for the finalists.
- **P8. A bot's prompt** — X1: users, what the bot does and must not do, its data and tools → a draft: context over rules, a reason for each limit, no capitals → real and hard cases, run, failures recorded → X3 one failure at a time, every case rerun → X4 → `checklist-security`, «LLM and agent features» → the prompt and its cases in git.

## What does not help current models

A role of «expert» for accuracy; emotional stakes and tips; «ты уверен?» as a check; capitals; «думай шаг за шагом» for a reasoning model; «сделай лучше»; a self-check taken as proof; three answers agreeing inside one reply taken as independent confirmation; a client's data sent to another model or a search before checking that it may go there.

## Completion criterion

The task has its pipeline; each move is used where its failure is likely; and every claim that matters is checked outside the conversation or marked unchecked.
