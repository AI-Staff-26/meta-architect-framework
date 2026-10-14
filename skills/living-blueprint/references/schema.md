# Living blueprint — data schema v1.2

One data source, two views. The **human view** is one HTML file: lanes with a line of visibility, step drawers, raw calls, prompts, state machines, divergences. The **agent view** is `agent/`: step contracts, state machines, fixtures, provider payloads, prompts, a lock file and acceptance stubs. The build produces both from `src/` and **writes nothing while any lint error stands**.

This file is copied into every agent view as `agent/SCHEMA.md`, so an agent reading `agent/` needs nothing else.

## Reading the agent view

| File | What it holds |
|---|---|
| `SPEC.md` | rules, parameters and flags; then every journey's steps in order — trigger, actor, endpoints, transitions with their failures, UI copy, fixtures — and a Mermaid sequence diagram |
| `STATE-MACHINES.md` | per entity: fields, a Mermaid state diagram, the transition table |
| `fixtures/<step>.<name>.json` | the entity before and after the step, with the provider response that drives it |
| `calls/<call>.json` | a raw provider request and response, as the call journal stores it — key aliases, never key values |
| `prompts/<prompt>.md` | a prompt in full: system, user, output format, variables, example |
| `blueprint-lock.json` | ids and content hashes of steps, endpoints and transitions; parameter, flag, event and prompt-version lists |
| `ACCEPTANCE.md` | one Given / When / Then stub per step, extra endpoint, fixture, transition and failure |

`SPEC.md` → «Open questions», right after the rules, lists every divergence whose `status` is `discuss` or `design` — `id`, `area`, `status`, `proposal`. A divergence id cited anywhere in `agent/` is looked up there: the owner has not decided it yet.

### Semantics every implementation follows

- **Compare-and-set.** A transition applies as `UPDATE … SET <field> = <to> WHERE <field> IN (<from>)`. A second firing — a callback racing a poll, a double click — finds the state already moved and is a logged no-op. A background transition also checks that its run is still the subject's active run: a step of a finished or replaced run is a no-op even when the state matches.
- **Derived state.** An entity whose state is computed from rows (a ledger) says in its `note` how a second firing becomes a no-op — usually a unique index.
- **`with`.** Transitions linked by `with` commit in one database transaction, when the transition that declares the link fires — its guard decides. The link is symmetric: it says which transitions share a transaction, not which comes first — each side's `fired_by` says what starts it. It is shown on both sides; on the other side it reads "when X fires". A transition carried this way names in `fired_by` the trigger of the one that carries it — the same endpoint or event — and does not run a second time on it. The build checks this (L21).
- **Order by cause.** When one transition needs another's result — a character sheet for an artist that has just been claimed on login — it fires on that transition's event, not on the event both share.
- **Endpoint-fired transitions** come in two kinds. Most commit their target state inside the request and are `local`; the work that follows lives in transitions fired by events, callbacks and timers, and those carry the failures. A few start a background job and commit when it ends — then they carry the job's failures, and "already running" is an active run of the same kind on the same object.
- **Timers.** `timer` is a deadline: it counts from the moment the entity entered the transition's `from` state, so an entity with deadlines stores that moment in `<field>_at`, written whenever the state changes — a `same` transition leaves it alone. A guard that counts from another moment names it. `poll` repeats while the entity stays in the state and is never a deadline.
- **Events.** An event carries the entity, its id, `from`, `to`, the fields written and the run. A step started by an event reads the data as of that event, not as of the moment it runs.
- **Writes.** A `writes` value describes the complete new value of the field — nested objects are not merged unless the text says so. `may_write` lists fields a transition writes only sometimes.
- **Late results.** A transition marked `late` applies a result that arrives after the entity stopped waiting — a provider answer after the deadline.
- **`same` and `previous`.** `to: same` keeps the state. `to: previous` returns the entity to the state it was in before the current activity. That state is stored in `prev_<field>` by the transitions marked `saves_previous`. It is never cleared: the next activity overwrites it.
- **Failures.** A failure says how the code recognises it (`detect`), where the entity goes (`to`), what the person sees (`says`), what is given back (`compensation`) and who retries:
  - `worker` — `attempts` more tries with `backoff`; after the last one the failure applies, and the person may retry through `retry_via`.
  - `user` — the failure applies at once; the retry button calls `retry_via`. When `retry_via` is absent, it is the request that fired the transition.
  - `none` — nobody retries.
- **Fixture modes.** In `patch` mode `after` lists the identity fields and the fields the step changed; every field it leaves out stays as it was. In `snapshot` mode `after` is the whole row — every declared field except the computed ones, whose description starts with «вычисляется» or "derived".
- **Copy.** `says`, `ui.*` and `disabled_when.says` are the exact words the person sees. `{{name}}` in them is filled in by the code.

## Files (`src/`)

| File | Top-level key | Holds |
|---|---|---|
| `data/00-meta.yaml` | `meta`, `lanes`, `models` | document meta, rules, parameters, flags; the lanes; the model registry |
| `data/05-entities.yaml` | `entities` | the state machine of every status column |
| `data/06-contracts.yaml` | `contracts` | the agent contract of every step, keyed by step id |
| `data/NN-<journey>.yaml` | `journey` | one journey: steps as the person meets them, and a sequence diagram |
| `data/80-calls.yaml` | `calls` | raw provider calls |
| `data/90-divergences.yaml` | `divergences` | the owner's brief against the spec, each row with a status |
| `data/95-notes.yaml` | `notes` | free-form tabs |
| `prompts/*.yaml` | `<prompt id>` | the prompt catalog |

`blueprint.config.yaml` next to `src/` holds the build settings: `brand`, `page_title`, `html` (the output file name), and optionally `prompts_md` and `prompts_md_title` for a Markdown copy of the prompt catalog. `html` and `prompts_md` are relative to the blueprint directory, stay inside its parent and stay out of its `src/` and `agent/` — `../prompts/01-PROMPTS-v0.md` is fine; an absolute path, one that climbs higher, or one into `src/` or `agent/` is an L0 error. The build writes and deletes nothing through a symlink, whether at an output path or at a folder on the way to one.

Any key that is not listed in this schema fails the build (L0). Text fields use a small Markdown subset: paragraphs, `- ` and `1. ` lists (nested by two spaces), `**bold**`, `` `code` ``, `[label](#hash)`.

## `meta`

| Field | Meaning |
|---|---|
| `title`, `status`, `version`, `date` | shown in the header; `version` is bumped when the owner approves |
| `actors` | everyone who may act — `actor` values must come from this list |
| `rules` | project-wide invariants every agent applies: error format, access, idempotency, streaming… Printed at the top of `SPEC.md` |
| `params` | `name: {value, source, note}` — every number the flow depends on. `source`: `spec`, `admin`, `provider` |
| `flags` | `key: {off, note}` — every kill switch, and what happens to work in flight when it is switched off |
| `external_events` | events that come from outside the blueprint (a login, a payment webhook) |
| `as_is` | `{title, body}` — how the existing system works today, checked in its code |
| `labels` | renderer captions: `div_tab`, `div_title`, `div_owner`, `div_spec`, `div_proposal`, `example_of` |
| `promptsLead`, `modelsLead`, `divLead` | lead paragraphs of those tabs |

`models[]`: `key`, `name`, `provider`, `used_for`, `where`, `params`, `cost`, `note`. Two flags drive the lint: `external: true` means a call leaves our servers (L3), and `slow: true` means the call never fits a synchronous request (L5).

## Journey and step (human view)

```yaml
journey:
  id: checkout                 # unique
  tab: "3 · Оплата"
  title: …
  lead: …                      # what this journey is, in 3–6 lines
  check: [ … ]                 # what the reviewer should check
  steps:
    - id: p2                   # unique across all journeys
      title: …
      cells: {user, screen, engine, models, data}   # one cell per lane id, 1–3 lines
      models: [llm]            # keys of models
      prompts: [ … ]           # prompt ids
      div: [ … ]               # divergence ids
      refs: [ … ]              # requirement ids
      detail: {user, mock, hood, calls: [call ids], data, states, divergence}
  seq: {title, actors: [{id, label, color}], msgs: [{from, to, text, dashed}]}
```

`detail.mock` is a tiny screen sketch, one element per line: `# title`, `[Primary button]`, `[(Secondary)]`, `{field}`, `☑` / `☐`, `> note`. A row of buttons may share one line.

## Step contract — `contracts.<step id>`

```yaml
p2:
  trigger: "ui: «Оплатить · ₽N»"         # "ui: <what the person does>" | "event: <DomainEvent>" | "system: <timer/worker>"
  actor: [customer]
  endpoint:                               # an object, or "METHOD path" of an endpoint declared in full in another step
    method: POST
    path: /api/v1/orders/{id}:pay
    idempotency: true
    price: price.order                    # a priced endpoint needs idempotency: true
    request: "{method: card | sbp}"
    responses: {'202': "{order_id, status: paying}", '200': "repeat with the same key — the original answer"}
    errors: {'402': "insufficient_funds — «…»", '409': "already_paid — «…»"}   # {} when there are none
  also:                                   # more endpoints of this step
    - {id: retry, purpose: "«Повторить»", actor: [customer], flag: null, method: POST, path: /api/v1/orders/{id}:retry,
       idempotency: true, price: null, request: "{}", responses: {'202': "…"}, errors: {}}
  inbound:                                # requests a provider sends us
    - {id: pay_callback, method: POST, path: /api/v1/callbacks/pay/{token}, auth: "…", payload: "…", dedupe: "…", answer: "200 {ok: true} …"}
  delivery: async_job                     # sync | stream | async_job | none
  ui: {loading: "…", partial: "…", success: "…", error: "…", disabled_when: [{when: "…", says: "…"}]}
  journal: ["llm_call: …", "user_action: …"]
  budget: "≤ 30 с"
  flag: payments.card                     # a key of meta.flags
  params: [payment_timeout]               # names from meta.params
  fixtures:
    - {name: happy, entity: order, via: [order.O03], mode: patch, before: {…}, after: {…}, provider_response: c.pay.result}
    - {name: declined, entity: order, via: [order.O03], mode: patch, failure: refusal, before: {…}, after: {…}}
```

| Field | Meaning |
|---|---|
| `trigger` | what starts the step. A `ui:` trigger on a step with transitions needs an endpoint |
| `actor` | who may perform it — becomes the authorization check |
| `endpoint`, `also[]` | the HTTP contract. Every declared endpoint has `responses`, `errors` (possibly `{}`), and a `request` unless it is `GET`, `HEAD` or `DELETE`. Each error is `code — «the words the person sees»`; several codes under one status are separated by `;`. Errors a project rule already covers (login, a switched-off flag, idempotency) are not repeated. An endpoint is declared in full once; other steps refer to it by `"METHOD path"`. `also[]` items carry an `id` (unique in the step) and a `purpose`, and may name their own `actor` and `flag` — `flag: null` keeps the endpoint open whatever the step's flag |
| `inbound` | requests we receive: `id`, `auth`, `payload`, `dedupe` and `answer` — what we reply, even to a token we do not know |
| `delivery` | how the result reaches the screen: `sync` ≤ 2 s; `stream` — tokens or lines over SSE; `async_job` — a background job with progress over SSE; `none` |
| `ui` | copy for `empty`, `loading`, `partial`, `success`, `error`, `conflict`; `disabled_when` — a guard as the person sees it, always with `says` |
| `journal`, `budget` | what lands in the call and action journals; time and money limits |
| `flag`, `params` | references into `meta.flags` and `meta.params` — each value lives in one place |
| `fixtures` | canonical examples: `name`, `entity`, `via` (the transitions the step runs, in order), `mode`, `before`, `after`; `failure` — the failure class it exercises; `provider_response` — a call id |

A step's **transitions** and **events** are derived from the `step` field of the transitions, so they are written once — in the state machine.

## Entity state machine — `entities.<name>`

```yaml
order:
  title: Заказ
  table: order
  field: status
  initial: draft
  terminal: [refunded]          # states with no way out
  waiting: [paying]             # states that wait on an outside party — each needs a deadline
  required: [id, status]
  fields: {id: uuid, status: "…", status_at: "…", prev_status: "…", provider_ref: "…"}
  note: "…"
  states: {draft: черновик, paying: оплачивается, paid: оплачен, refunded: возвращён}
  transitions:
    - id: O03
      from: draft                 # a state, a list of states, or "∅" for creation
      to: paying                  # a state, same, or previous
      step: p2                    # a step id, a list of them, or "*" for cross-cutting
      event: PaymentStarted       # an event or a list
      fired_by: {kind: endpoint, ref: "POST /api/v1/orders/{id}:pay"}   # one or a list: endpoint | event | timer | poll | callback
      guard: "…"                  # checked before the transition
      writes: {provider_ref: "…"} # what it always writes besides the status field
      may_write: {note: "…"}      # what it writes only sometimes
      with: [hold.H01]            # transitions committed in the same transaction
      saves_previous: true        # stores the current state into prev_<field>
      unique: "Idempotency-Key"   # creation only: the key under which a second creation is a no-op
      late: true                  # applies a result that arrived after the entity stopped waiting
      says: "…"                   # what the person sees when it happens (an outcome fired by an event or a timer)
      compensation: "…"           # what it gives back
      local: true                 # no outside dependency — no failures
      failures:
        - class: refusal          # any | timeout | refusal | provider_error | invalid_response | partial | unknown | moderation
          detect: "…"             # how the code recognises it; required unless the class is any
          to: previous
          says: "…"
          event: PaymentFailed    # what the failure emits
          compensation: "…"
          retry: worker           # user | worker | none
          attempts: 1             # worker: more tries before the failure applies
          backoff: "30 с"
          retry_via: "POST /api/v1/orders/{id}:retry"   # or a list; for retry: user it defaults to the endpoints that fire the transition
          retry_note: "…"
```

`fired_by` refs: `endpoint` — `"METHOD path"` of a declared endpoint; `event` — an event some transition or failure emits, or one in `meta.external_events`; `timer` (a deadline) and `poll` (a repeating check) — `param:<name>` of a declared parameter; `callback` — `"METHOD path"` of an inbound declaration. Cross-cutting transitions (`step: "*"`) describe a shared mechanism — a provider job, a ledger — and their refs are prose.

## Calls, prompts, divergences, notes

- `calls.<id>`: `step`, `title`, `model`, `prompt`, `when`, `params`, `latency`, `cost`, `failure`, `request`, `requestNote`, `response`. Request and response are shaped like the call journal stores them.
- `prompts.<id>`: `title`, `step`, `model`, `version`, `lang`, `stage`, `purpose`, `system`, `user`, `output`, `vars` (`[[name, where it comes from], …]`), `example` (`note`, `input`, `output`), `notes`, `source`. A prompt that already works somewhere is quoted verbatim, and `source` points at it.
- `divergences[]`: `id`, `area`, `status` (`accept` | `discuss` | `design` | `keep`), `owner`, `tz`, `proposal`.
- `notes[]`: `id`, `tab`, `title`, `lead`, `cards` (`title`, `body`), `seq`.

## Lint rules — the build writes nothing while any fails

| Rule | Check |
|---|---|
| L0 | Every key is one this schema knows; `cells` keys are lane ids; contracts do not list `transitions` or `events`; a lane or `seq` actor `color` is `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `var(--name)` or a colour keyword |
| L1 | Every reference resolves: models, prompts, calls, divergences, steps, transitions, `with`, contract `params`; every `seq.msgs[]` `from` and `to` is an id from that `seq.actors`, in journeys and notes alike |
| L2 | `initial` is a state; every state is reachable from it; every state that is not terminal has a way out; a terminal state has none |
| L3 | A non-local transition of a step that calls an `external` model has failures, each with a `retry` |
| L4 | A priced endpoint has `idempotency: true`; failures of a paid step name a `compensation` |
| L5 | `delivery` is valid; a step that calls a `slow` model is not `sync` |
| L6 | A step with transitions has `trigger`, `actor` and `delivery`; a `ui:` trigger needs an endpoint; actors come from `meta.actors`; a flag has `meta.flags.<flag>.off`; a step without a contract is a warning |
| L7 | Every `disabled_when` has `when` and `says` |
| L8 | Fixtures: `name`, `entity`, `via` and `mode` present; `before` and `after` hold the `required` fields and only declared `fields`; consecutive `via` transitions chain; `after` holds every field its `via` transitions write (and `prev_<field>` after `saves_previous`), and a snapshot holds the whole row; the status field before and after matches the `via` transitions or the named failure |
| L9 | Every `{{var}}` in a prompt's `system` and `user` is declared in `vars` |
| L10 | Ids are unique: steps, transitions, calls, prompts, `also` ids, fixture names; an endpoint is declared in full only once. Ids that become file names or test tokens keep to a grammar: steps, entities, transitions, `also` and inbound ids, fixture names are `[A-Za-z0-9_]+`; call and prompt ids are `[A-Za-z0-9_][A-Za-z0-9_.-]*` without `..` |
| L11 | Every transition has `fired_by`, and each ref resolves to a declared endpoint, inbound callback, emitted event or parameter |
| L12 | No two transitions share a source state, a trigger and a guard |
| L13 | Failures: a known class; `says`; `detect` unless the class is `any`; `retry` valid; `worker` has `attempts`; `user` has a resolvable `retry_via`. A transition with `compensation` has `says` |
| L14 | Every inbound declaration has `id`, `auth`, `payload`, `dedupe`, `answer` |
| L16 | Every declared endpoint has `method`, `path`, `responses`, `errors`, and a `request` unless `GET`, `HEAD` or `DELETE`; every error part carries «the words the person sees»; `also` items have `id` and `purpose`; a referenced endpoint is declared somewhere |
| L17 | Every entity declares `fields`, including the status field, the `required` ones, every `writes` and `may_write` key, `prev_<field>` when `previous` is used, and `<field>_at` when a transition is fired by a `timer` |
| L18 | Every `waiting` state has a deadline: an exit fired by a `timer` (or `with` a timer-fired transition), or a `timeout` failure that leaves it — a `poll` is not a deadline. A state left by a callback but not declared `waiting` is a warning, unless the transition is `late` or shares that callback with a transition that carries it — then the carrier waits |
| L19 | An entity that uses `previous` has a `saves_previous` transition, and every state that returns to `previous` is unreachable without passing one |
| L20 | Every transition that creates an entity (`from: "∅"`) names `unique`, and has no `failures` — the external work runs on a transition from the created state |
| L21 | `with`: when X carries Y (`X.with` lists Y), Y names one of X's triggers — `kind` and `ref` equal; X is not fired by an event Y emits; Y is not fired by an event X emits, unless another transition that carries Y is fired by that event |

L15 was retired in v1.2: events are derived from transitions, so they cannot disagree.

## Reverse drift

Tests in the codebase carry the ids from `ACCEPTANCE.md` in their names or docstrings: `BP:<step>`, `BP:<step>.<endpoint or callback id>`, `BP:<step>:<fixture>`, `SM:<entity>.<id>`, `SM:<entity>.<id>:<failure class>`. `blueprint-lock.json` lists them all under `ids`. CI fails when an id has no test, or when a hash changed and its test did not. A change of plan reaches the code instead of drifting away from it.

A token is `BP:` or `SM:` and then segments of `[A-Za-z0-9_]+` joined by `.` and `:` as above — the build refuses any id that would break one (L10), so every locked id is one drift-check can find.

Hashes are the first 12 hex characters of SHA-256 over canonical JSON: keys sorted, no whitespace, UTF-8, integral floats written as integers.

`node build.ts <dir> --check` covers the other direction — `agent/`, the HTML and the prompts document lagging behind `src/`. It lints and renders in memory, writes nothing, prints each file a build would create, rewrite or remove, and exits 1 when there is one or on any lint error.
