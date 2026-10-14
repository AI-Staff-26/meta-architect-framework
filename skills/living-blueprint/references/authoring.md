# Authoring a living blueprint

How to write data that survives an agent implementing from it. Every pattern here was found the hard way: a fresh agent reading only `agent/` asked the question, or built the stuck state, that the pattern prevents. The schema itself is `schema.md`.

## Entities first

Write `05-entities.yaml` before any contract. The machines decide what the endpoints may do; the reverse produces endpoints whose results the data model cannot hold.

- **One machine per status column.** A second status on the same table gets its own machine with the same `table`.
- **A state is a lifecycle position, a choice is a field.** Which take the person picked, which version of the text is active — those are fields on the owner entity. Put a choice into the lifecycle machine and re-picking strands the entity: the "picked" state has no way back once the work it triggered has finished.
- **`fields` is the vocabulary.** Declare every column the flow reads or writes, with its type and who writes it. Fixtures may use only these names, so one field cannot drift into two spellings across steps.
- **`terminal` means no way out.** A resting state the person can still act from — a ready song that can get another take — is an ordinary state.
- **`waiting` marks every state that waits on another party** — a provider, a callback, a queue, the person answering a dialog. Each needs a deadline (L18). The deadline is what turns "stuck forever" into "told and refunded".
- **A timer needs a clock.** A deadline counts from entering the state, so an entity with timers stores that moment in `<field>_at` (L17).
- **Derived state is allowed.** A ledger whose state is computed from append-only rows is still a machine; say so in `note`, and make `writes` name the rows each transition appends.

## Patterns

### The request commits, the work follows

An endpoint-fired transition commits its target state inside the request, together with the hold, and returns `202` with a stream. It is `local`: nothing outside can fail inside it. A rejection before the commit — no balance, a conflict, a moderation hit — is an endpoint **error** (`402`, `409`, `422`), not a transition failure.

The work after the request — builders, model calls, provider jobs — lives in transitions fired by events, callbacks and timers. Those carry the failures. A transition that is fired by an endpoint and also has failures is the sign that a later failure was attached to the request that started it.

### A provider job is its own machine

Model a provider job once, cross-cutting (`step: "*"`): `creating → created → running → succeeded | failed`, plus `unknown` when the create call times out and `stalled` when the result is late. Reserve the row before the call, and store the provider's task id the moment it arrives.

The subject — a song, a cover — moves on the job's events, in its own transactions, and keeps its own deadline. Money stays with the subject: the job never holds or refunds.

### The subject points at its job before the call

The subject writes the job reference (`provider_job_id`) in the transaction that reserves the job, before the call goes out. A restart then finds the job it already sent instead of sending a second one, and a late callback finds the subject it belongs to.

### `with` or an event

`with` is for a visible result and its money — a hold captured in the transaction that shows the result, as a cover becomes ready together with the capture of its hold — or for two machines on one row that move together. A subject and its provider job are not joined by `with`: the job records the provider's answer on its own (callback or poll), and the subject reacts to the job's event (order by cause) and has its own deadline timer. In one transaction a failure of the subject's step — a download, a decode — would stop the job from recording that the provider succeeded, and every next poll would fire the subject again. Never both on one pair: a transition that commits `with` another and fires on its event waits for a commit it is part of (L21).

### Money

- Place the hold in the same transaction as the transition that needs it (`with: [hold.H01]`).
- Capture on the success the person can see.
- Release as the `compensation` of the failure, in the failure's transaction.
- One hold per paid operation — a text with self-correction is two operations and two holds.
- A partial capture is two rows, capture and release; `writes` gives the formula.

### Return to where the activity started

When an activity can start from several states, mark those transitions `saves_previous` and send its failures `to: previous`. L19 then proves that no state inside the activity is reachable without a saved value.

### Outcomes the person must hear about

A transition fired by an event or a timer that ends the activity badly — the job failed, the queue waited a day — carries `says` and `compensation`, like a failure does. Without `says` the person sees the spinner stop and nothing else.

### Wait for the last piece, not for the job

When a job yields several pieces — two takes, a batch of covers — the owner moves when the **last piece resolves**, not when the provider says "done". Each piece emits an event when it succeeds and another when it fails. The owner's transitions fire on either event, with a guard that this was the last piece. "All pieces failed" is its own transition with `says` and `compensation`.

### Late results

A provider can answer after the deadline gave up on it. Decide per subject: apply the result (`late: true` — a master the job already paid for, an image the person still wants), or log it and drop it (a cover whose notes were already refunded). Say which in the transition or in a project rule.

### Batches queue

A batch with a parallel limit needs a `queued` state before `generating`. Otherwise the generation deadline starts while an item is still waiting for a slot, and the last items time out without ever being sent.

### Creation is idempotent

Every transition that creates an entity names `unique` — the key under which a second creation is a no-op (L20). The pairs to look for: two triggers that create the same thing (a login and a ready photo both ordering one character sheet), and a step repeated after a restart.

### Create first, call later

A transition that creates an entity is `local`: it writes the row and calls nothing. The external work runs on a transition from the created state, so a lost answer, a late callback and a retry each have a row to land on (L20).

### Background steps read a snapshot

A step started by an event reads the data as of that event. When the person can still change the source meanwhile — edit the lyrics while the sound is queued — write the version that was sent into a field (`sung_lyrics_version_id`), and let the background step read that field.

### Several outcomes from one trigger

Split by guard rather than overloading one transition. When a provider succeeds, a song with no chosen take goes to `takes_ready`, and a song that already has one goes back to `ready`. Two transitions, same trigger, complementary guards: L12 accepts them, and each states its own result.

## Contracts

- **Every endpoint carries its full contract**: `request`, `responses`, and `errors` as `code — «the words the person sees»`. Declare it once; other steps that use it write `endpoint: "METHOD path"`.
- **Every inbound callback says what we answer** — including to a token we do not know. The answer decides whether the provider retries.
- **Every button behind a failure is an endpoint.** "Повторить", "Проверить ещё раз", "Попробовать сейчас" — each goes into `also` with a `purpose`, its own `actor` when the step is run by the system, and is named in the failure's `retry_via`.
- **Project rules go once into `meta.rules`**: the error format, the access rule and what a stranger gets (404 or 403), idempotency, the stream format, what counts toward a concurrency limit. Contracts then do not repeat them.
- **Numbers go into `meta.params`, switches into `meta.flags`.** A contract names them; the value lives in one place. Each flag says what happens to work in flight when it is switched off.
- **UI copy covers every state the screen can be in**, and every `disabled_when` has the sentence the person reads.

## Failures

- **`detect` is a provider signal**, not an adjective: a status code, a response field and its value, `stop_reason`, a timeout parameter. If the signal has not been verified against the live provider yet, say what will be checked and when.
- **Retry by who can fix it.** A transient fault is retried by the `worker` with `attempts` and `backoff`. A fault the person must act on goes to the `user`, through `retry_via`.
- **`says` is final copy.** It names what was given back ("Ноты вернулись"). A failure the person never sees still says so — `— (не показывается: …)` — so the choice is visible to the reviewer.

## Fixtures

- **One through-line.** The same demo person, artist, song and order run through every journey, with the same ids. That is what makes the human view readable and the test data coherent.
- `via` lists the transitions the fixture exercises, in order; `mode: patch` lists only what changed. Add a failure fixture for every failure that moves the state the person sees.

## Prompts and calls

- **Quote a prompt that already works verbatim**, with `source` pointing at it, then extend it. Tuning lives in details nobody remembers to restate.
- **Write a call exactly as the call journal will store it**: method, URL, headers without secrets, the body, the response — and key aliases, never key values.

## Reading the lint

| Message | What it usually means | Fix |
|---|---|---|
| L2 terminal state has an outgoing transition | a resting state was marked terminal | drop it from `terminal` |
| L8 fixture field is not a field | two names for one column | rename it to the declared field, or declare it |
| L8 `after.<field>` ≠ expected | `via` does not match the story, or the machine is wrong | decide which is right from the journey the owner reads, then fix the other |
| L10 endpoint declared twice | a shared endpoint copied into several steps | declare it once; reference it by `"METHOD path"` |
| L11 fired by an event nobody emits | a step that changes nothing still triggers others | give it a transition — `to: same` with `writes` — that emits the event |
| L13 `retry: user` needs `retry_via` | a retry button with no endpoint behind it | add the endpoint to `also` and name it |
| L13 failure has no `detect` | the code cannot tell this failure from another | write the provider signal |
| L18 waiting state has no deadline | an entity can wait forever | a timer-fired exit with `says` and `compensation` — the subject's own timer, even when its provider job has one too |
| L19 previous would be stale | an activity state is reachable without `saves_previous` | mark the transitions that start the activity |
| L8 after misses a field its transitions write | the fixture tells less than the step does | add the field; if the transition writes it only sometimes, move it to `may_write` |
| L16 error has no «words» | an error code without the sentence the person reads | write the sentence; or drop the error if a project rule already covers it |
| L17 timers need `<field>_at` | a deadline with no clock | declare the field and write it on every transition |
| L20 creation without `unique`, or with failures | a second creation would duplicate the entity; with failures — the external call runs before the row exists | name the key that makes it a no-op; make the creation `local` and move the call to a transition from the created state |
| L21 names none of the triggers of its carrier, or waits for an event yet commits with it | a reaction that belongs after a commit was joined by `with` — often a subject and its provider job | keep `with` only where one trigger moves both, and name the carrier's trigger in the carried `fired_by`; otherwise drop `with` and fire on the event (order by cause) |

## Done when

The build passes with 0 errors, and every warning is either fixed or written into the owner questions with the reason it stays.
