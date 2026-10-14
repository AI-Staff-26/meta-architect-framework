# Review: the stress test and the owner review

Two different readers check a blueprint before it is approved. The **stress test** asks whether an agent can build from it without guessing. The **owner review** asks whether it is the product the owner wants. Run the stress test first: the owner's time goes on decisions, not on contradictions the build could have caught.

## Stress test — step 7

### Who runs it

A fresh `code` agent, started by its `subagent_type`. A fork inherits the author's reasoning and stops being a stress test. It reads only `agent/`, writes nothing, and reports in a fixed shape.

Run one agent per hard journey, in parallel. Hard means money, a provider job, a callback or a long wait. Easy journeys can share an agent.

### The prompt

```text
This is a specification stress test. Work read-only: your output is the report below.

Imagine you are the coding agent assigned to implement the "<journey>" journey of <project>:
<two or three sentences: what the person does, what happens in the background>.
The backend is <stack>; you would write the API endpoints, the background steps and the tests.

Your only sources are the files in `<path>/agent/` — what is not there does not exist for this test.
- Start with `SCHEMA.md` — it explains how to read the rest.
- `SPEC.md`: "Rules", "Open questions", "Parameters", "Flags" and the "<journey>" section (<step ids>).
- `STATE-MACHINES.md`: <entities>.
- `fixtures/<prefix>*.json`, the related `calls/` and `prompts/` files.
- `ACCEPTANCE.md`: the BP:<prefix>* stubs and the SM stubs of those entities.

Rows in "Open questions" are known and wait for the owner. Report one only where the spec
contradicts itself around it.

Report, in English, at most 450 words:
1. Questions you would have to ask before coding — every place the spec is silent or
   ambiguous. Name the step, transition, endpoint or field.
2. Assumptions you would make silently if nobody answered, each with what you would assume.
3. Contradictions or impossible states between SPEC.md, the state machines, the fixtures
   and ACCEPTANCE.md. Tag each one [bug] if code built from the spec as written would
   misbehave, or [text] if only wording disagrees.
4. Missing schema fields — generic ones any project's step contract should have, not
   <project> facts.

Be ruthless and specific. Report gaps only: when something you looked for is present and
clear, move on.
```

### Folding the answers back

Sort every item into one of four bins:

| Bin | What it is | Where it goes |
|---|---|---|
| **Fact** | the answer exists — in the brief, the spec, the provider's documentation, the code of the existing system | into the data. Check it at its source first: an agent's guess is not a fact |
| **Design** | nobody decided, and the architect can | decide it and write it into the data; record a decision when it is non-obvious |
| **Generic gap** | the schema has no place to say it | a field in `schema.md`, a lint rule that would have caught it, and a pattern in `authoring.md` |
| **Owner** | product, money or policy that only the owner can settle | the owner questions for step 8 |

An item the spec already answers is still a signal. If a careful reader missed it, the answer is in the wrong place or worded too weakly — move it, don't dismiss it.

Then rebuild and run the next round with fresh agents. Rounds go deeper as the data gets better: the first finds missing fields, the second the impossible states those fields expose, later ones the edge cases of retries, races and late answers. A generic gap found in round N becomes a lint rule, so round N+1 starts where the build stops.

Two more bins appear in later rounds and are legitimate places to stop:

| Bin | What it is | Where it goes |
|---|---|---|
| **Live provider** | only a real call can tell — a provider's synchronous or asynchronous answer, its error codes | a check for the first lane, written in the failure's `detect` |
| **Typed contract** | types, limits and schemas of payloads | the project's day-0 contracts (OpenAPI, JSON Schema); the blueprint keeps the shape |

### Fold discipline

- **Every twin.** A value lives in several places — a rule, a transition, a prompt, a call example, a fixture. A fix reaches all of them; a fix in one place comes back next round as a subtler finding.
- **Sweep the known classes.** Before the next round, check the whole data for every class a round has already found, not only the transitions you touched. A class found twice becomes a lint rule or a sweep script.

The round is done when `SKILL.md` step 7 says so.

## Owner review — step 8

### What to send

- The HTML file — opened locally, or wherever the owner reads documents. Publishing it anywhere public is the owner's call.
- **What changed since the version they saw**, in three to five lines.
- **The owner questions**, one per line, each with the recommended answer and what it costs.
- The divergences tab: every `discuss` and `design` row needs an answer.
- **When step 7 stopped at the third round:** each such journey's [bug] count per round and the cost of one more round — another round is the owner's call.

### How the owner reads it

1. A journey tab with the filter on «Только пользователь» — does the person's path make sense?
2. The same tab with «Всё» — what happens under the line of visibility at each step.
3. A step drawer — the screen sketch, the calls and the prompt behind it.
4. «Расхождения» — every row the owner has to answer.

The owner reviews the product, not the schema. `agent/` is for agents; send its numbers (steps, transitions, endpoints, failures) as one line of evidence, not as reading.

State **«🛑 STOP — жду подтверждения»** and wait. A question is not approval: answer it, then STOP again.

### Recording the outcome

- Each answer becomes a decision in `DECISIONS.md` and a change in the data. The divergence row's status moves to `accept` or `keep`.
- `meta.version` is bumped, and `meta.status` says it is approved.
- The spec stops restating steps, states and contracts, and points at the blueprint instead.
- The build runs green before anyone reports the approval.

The review is done when `SKILL.md` step 8 says so.
