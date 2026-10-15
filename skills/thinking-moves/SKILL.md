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

Assembled from published research on how models fail in conversation. `plan-critique`'s «Second pass» follows the order of one reported outside use of that research, by someone else's agent; none of it is tested on our tasks yet — note what worked and what did not. Each move answers one measured failure.

## Six failures, six moves

| The model… | It looks like | Move |
|---|---|---|
| fills gaps with guesses and holds on to them (Laban et al. 2025) | a confident answer to a different question | **X1. Questions first** — an interview, or a list of the assumptions to confirm; the confirmed brief goes to a new chat as one message |
| gives the most typical answer (Verbalized Sampling, 2025) | templated options that look alike | **X2. Widen** — clearly different options with rough probabilities, unlikely ones included; a change of angle |
| finds its own errors poorly, fixes pointed-out ones well (Tyen et al. 2023) | «сделай лучше» rewrites everything, the error stays | **X3. Point fix** — the place and the defect named, the rest kept |
| repeats its draft's errors and rates its own text higher (CoVe 2023; Panickssery et al. 2024) | the self-check says «всё верно» | **X4. Check outside the chat** — a fresh chat, another model, a search, a run; only with data allowed to leave |
| agrees with the person (Sharma et al. 2023) | praises the idea; drops a right answer under «ты уверен?» | **X5. Disagreement on request** — your opinion and your authorship hidden, a premortem or the strongest counter-case asked for |
| works worse on long, cluttered context (Chroma 2025) | forgets agreements, repeats an old error | **X6. Context hygiene** — one chat per task; after two failed fixes of the same thing, a summary and a new chat; state in a file |

A strong reasoning model checks its routine work itself. X4 is for high stakes, facts from outside, or a cheaper model.

## The moves as requests

Each is one request: you make it yourself, or the owner pastes it into another chat — handed to the owner in the owner's language (`CLAUDE.md`, «Language»).

- **X1.** «List the assumptions you had to make because I did not state them.» An interview: one question at a time, each with options, ending when the unknowns left would not change the result.
- **X2.**
  - Options with rough probabilities, unlikely ones included.
  - The answers a typical assistant would give, why each is a template, then one that is none of them.
  - Six hats, one at a time: facts, feelings, risks, benefits, alternatives, the decision.
  - SCAMPER on an idea or a product: substitute, combine, adapt, modify, put to another use, eliminate, reverse.
  - The task through other eyes: someone from another field, someone with no budget, someone with an unlimited one, someone who wants it to fail.
  - A step back: what class of problem this is, and which principles govern it (Zheng et al. 2023).
- **X3.**
  - One defect a turn, with its place.
  - Numbered items, and only the named ones change.
  - A score on two or three criteria: the parts that scored low are rewritten, the rest kept.
  - «If there is nothing left to improve, say so» ends the loop.
- **X4.**
  - Facts through open questions that do not reveal the claimed value, answered from primary sources: a yes/no question tends to get agreement whether the claim is right or wrong (observed in CoVe).
  - Numbers recomputed from their inputs.
  - A search or a run rather than another reread.
- **X5.**
  - Distance: nothing said about whose the work is, judged in the third person. Presented as a colleague's, it draws harsher feedback — a way to dig for holes, not a neutral verdict.
  - Your own view held back until the model has answered.
  - The ladder of strictness: the answer as usual → a top-journal reviewer's standard → «this ships and fails in a month — what was missed?» → the answer rewritten with both.
  - A premortem; the strongest case against; both sides at their strongest, to find the real question.
  - The whole sequence for an expensive decision is `plan-critique`, «Second pass».
- **X6.**
  - Long material above the question, the question last: it can improve quality by up to 30% in Anthropic's tests, especially on multi-document input.
  - For a long document, the relevant quotes first, then the answer from them.
  - Every few turns, the original task restated in one line.
  - A list of what is settled; anything not on it is open.

**What is measured, and on whom:**

- **Measured on models:**
  - X1's failure, and the brief in one message that recovers most of the loss (Laban et al.);
  - X2's options with probabilities (Verbalized Sampling) and the step back (Zheng et al.);
  - X3 (Tyen et al.);
  - X4 (CoVe);
  - the pull to agree: stated authorship or liking shifts feedback either way, and saying nothing about whose it is is the neutral case (Sharma et al.);
  - long material first (Anthropic's own tests).
- **Measured on people, carried over to models:** the premortem (Klein 2007).
- **Practice, not measured:** everything else — among it six hats, SCAMPER, other eyes, the ladder, the work presented as a colleague's, both sides and the real question.

## Pipelines

- **P1. Decide** — X1 brief → X2: three to five options, «ничего не делать» among them, criteria set before choosing → options × criteria → the favourite through the second pass (`plan-critique`) in a fresh session — the owner opens a new companion session with the options, the criteria and the facts, not this conversation → the owner decides and records what was chosen, why, what was rejected, and the signal to revisit.
- **P2. Research** — X2: a step back and the questions worth asking → sources with quotes, the primary source over a retelling → claim, source, confidence → X4 for the key numbers and attributions → a synthesis that marks what is firm, disputed and unknown.
- **P3. Text** — X1: the reader, the action they should take, the tone → an outline agreed first → section by section with X3 → a self-check against the criteria → X4: a cold reader → numbers checked.
- **P4. Check someone's work** — `plan-critique`, with its second pass when a decision rests on the work; facts through X4; fixes by severity, not every finding.
- **P5. Long work** — X1 at each stage; state in a file; one chat per stage; two failed fixes → a summary and a restart (`workflow-ai-session`).
- **P6. Learn** — an explanation at two levels → one level deeper at a time: the hardest point of the overview, then where it stops holding, then what is still open → questions and hints instead of answers → a retelling, and the gaps in it → X3 on the gaps → practice from easy to hard.
- **P7. Ideas** — the context and what was tried → X2 wide: SCAMPER, other eyes, the answers that are not templates → group, and set criteria before judging → a shortlist → X5 for the finalists.
- **P8. A bot's prompt** — X1: users, what the bot does and must not do, its data and tools → a draft: context over rules, a reason for each limit, no capitals → real and hard cases, run, failures recorded → X3 one failure at a time, every case rerun → X4 → `checklist-security`, «LLM and agent features» → the prompt and its cases in git.

## What does not help current models

A role of «expert» for accuracy; emotional stakes and tips; «ты уверен?» as a check; capitals; «думай шаг за шагом» for a reasoning model; «сделай лучше»; a self-check taken as proof; three answers agreeing inside one reply taken as independent confirmation; a client's data sent to another model or a search before checking that it may go there.

## Completion criterion

The task has its pipeline; each move is used where its failure is likely; and every claim that matters is checked outside the conversation or marked unchecked.
