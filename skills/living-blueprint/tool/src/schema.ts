import { z } from "zod";

// The data model of schema v1.2 (references/schema.md). zod only validates: the build hashes and renders the raw
// parsed YAML, never zod's output, so no schema here carries a default, a transform or a coercion.
//
// Every object is strict: an unknown field is L0, as references/schema.md promises. A field the build reads without a
// guard is required — unless a lint rule names its absence in its own words (`disabled_when.when`, L7). Every other
// field is optional and nullable, as `dict.get` treats a missing key and null alike. Values the lint checks itself
// (delivery, failure class, retry, fired_by kind, fixture mode) are plain strings here, so a wrong value is reported by
// its own lint rule; the JSON Schema still lists the allowed values.

/** Text the build prints with str(): any scalar. */
const text = z.union([z.string(), z.number(), z.boolean()]);
const optText = text.nullish();
/** A value or a list of them, read through `asList`. */
const oneOrMany = <T extends z.ZodType>(item: T) => z.union([item, z.array(item)]);
const optIds = oneOrMany(z.string()).nullish();
const optBool = z.boolean().nullish();
const textMap = z.record(z.string(), optText);
const choice = (values: readonly string[], description: string) =>
  z.string().meta({ enum: [...values], description });
/** A colour the human view puts into a style attribute: the grammar renderer/app.js `cssColor` lets through, so a value
 * the page would drop fails the build instead. */
export const CSS_COLOR = /^(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|var\(--[A-Za-z0-9_-]+\)|[A-Za-z]+)$/;
const optColor = z.string()
  .regex(CSS_COLOR, "a colour is #rgb, #rgba, #rrggbb, #rrggbbaa, var(--name) or a colour keyword")
  .nullish();

export const DELIVERY = ["sync", "stream", "async_job", "none"] as const;
export const RETRY = ["user", "worker", "none"] as const;
/** `timer` is a deadline; `poll` repeats while the entity stays in the state and is never a deadline. */
export const FIRE_KINDS = ["endpoint", "event", "timer", "poll", "callback"] as const;
export const FAIL_CLASSES = [
  "any", "timeout", "refusal", "provider_error", "invalid_response", "partial", "unknown", "moderation",
] as const;
export const FIXTURE_MODES = ["patch", "snapshot"] as const;
export const DIVERGENCE_STATUSES = ["accept", "discuss", "design", "keep"] as const;

export const Config = z.strictObject({
  brand: optText,
  page_title: optText,
  html: z.string().nullish()
    .describe("output file of the human view, relative to the blueprint directory and inside its parent"),
  prompts_md: z.string().nullish()
    .describe("optional Markdown copy of the prompt catalog, relative to the blueprint directory and inside its parent"),
  prompts_md_title: optText,
}).meta({ id: "Config", description: "blueprint.config.yaml — build settings" });

const Param = z.strictObject({
  value: optText,
  source: optText.describe("spec | admin | provider"),
  note: optText,
}).meta({ id: "Param" });

const Flag = z.strictObject({
  off: optText.describe("what happens to work in flight when the flag is switched off"),
  note: optText,
}).meta({ id: "Flag" });

const AsIs = z.strictObject({ title: optText, body: optText }).meta({ id: "AsIs" });

/** The captions the renderer reads; each has a default there. */
const Labels = z.strictObject({
  div_tab: optText,
  div_title: optText,
  div_owner: optText,
  div_spec: optText,
  div_proposal: optText,
  example_of: optText,
}).meta({ id: "Labels" });

export const Meta = z.strictObject({
  title: optText,
  status: optText,
  version: optText.describe("bumped when the owner approves"),
  date: optText,
  actors: optIds.describe("everyone who may act; contract actors come from this list"),
  rules: oneOrMany(text).nullish().describe("project-wide invariants, printed at the top of SPEC.md"),
  params: z.record(z.string(), Param).nullish(),
  flags: z.record(z.string(), Flag).nullish(),
  external_events: optIds,
  labels: Labels.nullish().describe("renderer captions"),
  as_is: AsIs.nullish(),
  promptsLead: optText,
  modelsLead: optText,
  divLead: optText,
}).meta({ id: "Meta" });

export const Lane = z.strictObject({
  id: z.string(),
  title: optText,
  hint: optText,
  color: optColor,
}).meta({ id: "Lane" });

export const Model = z.strictObject({
  key: z.string(),
  name: text,
  provider: optText,
  used_for: optText,
  where: optText,
  params: optText,
  cost: optText,
  note: optText,
  external: optBool.describe("the call leaves our servers (L3)"),
  slow: optBool.describe("the call never fits a synchronous request (L5)"),
}).meta({ id: "Model" });

export const FiredBy = z.strictObject({
  kind: choice(FIRE_KINDS, "what fires the transition").nullish(),
  ref: optText.describe("endpoint: \"METHOD path\"; event: an event name; timer, poll: param:<name>; callback: \"METHOD path\" of an inbound"),
}).meta({ id: "FiredBy" });

export const Failure = z.strictObject({
  class: choice(FAIL_CLASSES, "failure class").nullish(),
  detect: optText.describe("how the code recognises it; required unless the class is any"),
  to: z.string().nullish().describe("a state, same, or previous"),
  says: optText,
  event: optIds,
  compensation: optText,
  retry: choice(RETRY, "who retries").nullish(),
  attempts: z.number().nullish().describe("worker: more tries before the failure applies"),
  backoff: optText,
  retry_via: optIds.describe("\"METHOD path\" of the endpoint the retry calls"),
  retry_note: optText,
}).meta({ id: "Failure" });

export const Transition = z.strictObject({
  id: z.string(),
  from: oneOrMany(z.string()).describe("a state, a list of states, or ∅ for creation"),
  to: z.string().describe("a state, same, or previous"),
  step: optIds.describe("a step id, a list of them, or * for cross-cutting"),
  event: optIds,
  fired_by: oneOrMany(FiredBy).nullish(),
  guard: optText,
  local: optBool.describe("no outside dependency — no failures"),
  writes: textMap.nullish(),
  with: optIds.describe("transitions committed in the same database transaction"),
  saves_previous: optBool,
  may_write: textMap.nullish(),
  unique: optText.describe("creation only: the key under which a second creation is a no-op"),
  late: optBool,
  says: optText,
  compensation: optText,
  failures: oneOrMany(Failure).nullish(),
}).meta({ id: "Transition" });

export const Entity = z.strictObject({
  title: optText,
  table: optText,
  field: z.string().nullish().describe("the status column"),
  initial: z.string().nullish(),
  terminal: optIds,
  waiting: optIds,
  required: optIds,
  fields: textMap.nullish().describe("every column the flow reads or writes"),
  states: textMap.nullish(),
  note: optText,
  // Absent is no transitions; null is a wrong shape.
  transitions: z.array(Transition).optional(),
}).meta({ id: "Entity" });

const endpointFields = {
  method: z.string().nullish(),
  path: z.string().nullish(),
  idempotency: optBool,
  price: optText,
  request: optText,
  responses: textMap.nullish(),
  errors: textMap.nullish().describe("{} when there are none; each error is code — «the words the person sees»"),
};

export const Endpoint = z.strictObject(endpointFields).meta({ id: "Endpoint" });

export const Also = z.strictObject({
  id: z.string().nullish(),
  purpose: optText,
  actor: optIds,
  flag: z.string().nullish()
    .describe("a key of meta.flags; null keeps the endpoint open whatever the step's flag; absent inherits the step's flag"),
  ...endpointFields,
}).meta({ id: "Also" });

export const Inbound = z.strictObject({
  id: z.string().nullish(),
  method: z.string().nullish(),
  path: z.string().nullish(),
  auth: optText,
  payload: optText,
  dedupe: optText,
  answer: optText,
}).meta({ id: "Inbound" });

// L7 checks both: the condition and the words the person sees.
export const DisabledWhen = z.strictObject({ when: optText, says: optText }).meta({ id: "DisabledWhen" });

export const Ui = z.strictObject({
  empty: optText,
  loading: optText,
  partial: optText,
  success: optText,
  error: optText,
  conflict: optText,
  disabled_when: oneOrMany(DisabledWhen).nullish(),
}).meta({ id: "Ui" });

/** Entity rows in fixtures hold any JSON. */
const Row = z.record(z.string(), z.unknown());

export const Fixture = z.strictObject({
  name: z.string().nullish(),
  entity: z.string().nullish(),
  via: optIds.describe("the transitions the step runs, in order"),
  mode: choice(FIXTURE_MODES, "patch: identity and changed fields; snapshot: the whole row").nullish(),
  failure: z.string().nullish().describe("the failure class it exercises"),
  before: Row.nullish(),
  after: Row.nullish(),
  provider_response: z.string().nullish().describe("a call id"),
}).meta({ id: "Fixture" });

export const Contract = z.strictObject({
  trigger: optText.describe("ui: <what the person does> | event: <DomainEvent> | system: <timer/worker>"),
  actor: optIds,
  endpoint: z.union([z.string(), Endpoint]).nullish()
    .describe("an endpoint object, or \"METHOD path\" of an endpoint declared in full in another step"),
  also: oneOrMany(Also).nullish(),
  inbound: oneOrMany(Inbound).nullish(),
  delivery: choice(DELIVERY, "how the result reaches the screen").nullish(),
  ui: Ui.nullish(),
  journal: z.union([text, z.array(text)]).nullish(),
  budget: z.union([text, z.array(text)]).nullish(),
  flag: z.string().nullish().describe("a key of meta.flags"),
  // A list when present, so null is an error too.
  params: z.array(z.string()).optional().describe("names from meta.params"),
  fixtures: oneOrMany(Fixture).nullish(),
}).meta({ id: "Contract" });

const SeqActor = z.strictObject({ id: z.string(), label: text, color: optColor }).meta({ id: "SeqActor" });
const SeqMsg = z.strictObject({
  from: z.string().describe("an actor id of this seq (L1)"),
  to: z.string().describe("an actor id of this seq (L1)"),
  text: z.string(),
  dashed: optBool,
}).meta({ id: "SeqMsg" });

export const Seq = z.strictObject({
  title: optText,
  actors: z.array(SeqActor),
  msgs: z.array(SeqMsg),
}).meta({ id: "Seq" });

export const Detail = z.strictObject({
  user: optText,
  mock: optText.describe("a tiny screen sketch, one element per line"),
  hood: optText,
  calls: optIds.describe("call ids"),
  data: optText,
  states: optText,
  divergence: optText,
}).meta({ id: "Detail" });

export const Step = z.strictObject({
  id: z.string(),
  title: text,
  cells: textMap.nullish().describe("one cell per lane id"),
  models: optIds,
  prompts: optIds,
  div: optIds,
  refs: z.array(z.string()).nullish(),
  detail: Detail.nullish(),
}).meta({ id: "Step" });

export const Journey = z.strictObject({
  id: z.string(),
  tab: optText,
  title: text,
  lead: optText,
  check: oneOrMany(text).nullish(),
  steps: z.array(Step),
  seq: Seq.nullish(),
}).meta({ id: "Journey" });

export const Call = z.strictObject({
  step: z.string().nullish(),
  title: optText,
  model: z.string().nullish(),
  prompt: z.string().nullish(),
  when: optText,
  params: optText,
  latency: optText,
  cost: optText,
  failure: optText,
  request: z.unknown().describe("shaped like the call journal stores it — key aliases, never key values"),
  requestNote: optText,
  response: z.unknown(),
}).meta({ id: "Call" });

export const Divergence = z.strictObject({
  id: z.string(),
  area: optText,
  status: choice(DIVERGENCE_STATUSES, "the row's status").nullish(),
  owner: optText,
  tz: optText,
  proposal: optText,
}).meta({ id: "Divergence" });

const Card = z.strictObject({ title: optText, body: optText }).meta({ id: "Card" });

export const Note = z.strictObject({
  id: z.string().nullish(),
  tab: optText,
  title: optText,
  lead: optText,
  cards: z.array(Card).nullish(),
  seq: Seq.nullish(),
}).meta({ id: "Note" });

export const Example = z.strictObject({ note: optText, input: optText, output: optText }).meta({ id: "Example" });

export const Prompt = z.strictObject({
  title: text,
  step: z.string(),
  model: z.string().nullish(),
  version: optText,
  lang: optText,
  stage: optText,
  purpose: optText,
  system: optText,
  user: optText,
  output: optText,
  vars: z.array(z.array(optText).min(2)).nullish().describe("[[name, where it comes from], …]"),
  example: Example.nullish(),
  notes: optText,
  source: optText.describe("where a prompt that already works is quoted from"),
}).meta({ id: "Prompt" });

/** One file of src/data/. Top-level values cannot be null: load() merges them into the blueprint. */
export const DataFile = z.strictObject({
  meta: Meta.optional(),
  lanes: z.array(Lane).optional(),
  models: z.array(Model).optional(),
  entities: z.record(z.string(), Entity).optional(),
  contracts: z.record(z.string(), Contract).optional(),
  journey: Journey.optional(),
  calls: z.record(z.string(), Call).optional(),
  divergences: z.array(Divergence).optional(),
  notes: z.array(Note).optional(),
}).meta({ id: "DataFile", description: "one file of src/data/*.yaml" });

/** One file of src/prompts/: prompt id → prompt. */
export const PromptsFile = z.record(z.string(), Prompt).meta({ id: "PromptsFile", description: "one file of src/prompts/*.yaml" });

export type Config = z.infer<typeof Config>;
export type Meta = z.infer<typeof Meta>;
export type Lane = z.infer<typeof Lane>;
export type Model = z.infer<typeof Model>;
export type FiredBy = z.infer<typeof FiredBy>;
export type Failure = z.infer<typeof Failure>;
export type Transition = z.infer<typeof Transition>;
export type Entity = z.infer<typeof Entity>;
export type Endpoint = z.infer<typeof Endpoint>;
export type Also = z.infer<typeof Also>;
export type Inbound = z.infer<typeof Inbound>;
export type Fixture = z.infer<typeof Fixture>;
export type Contract = z.infer<typeof Contract>;
export type Seq = z.infer<typeof Seq>;
export type Step = z.infer<typeof Step>;
export type Journey = z.infer<typeof Journey>;
export type Call = z.infer<typeof Call>;
export type Divergence = z.infer<typeof Divergence>;
export type Note = z.infer<typeof Note>;
export type Prompt = z.infer<typeof Prompt>;
export type DataFile = z.infer<typeof DataFile>;

/** `--schema`: the data model as JSON Schema — one property per kind of input file. */
export function dataModelJsonSchema(): unknown {
  const root = z.strictObject({
    config: Config.describe("blueprint.config.yaml"),
    data: DataFile.describe("each file of src/data/*.yaml"),
    prompts: PromptsFile.describe("each file of src/prompts/*.yaml"),
  }).meta({
    title: "Living blueprint data model, schema v1.2",
    description: "Not a document shape: each property describes one kind of input file. Rules beyond shape are the lint rules L0–L21 of references/schema.md.",
  });
  return z.toJSONSchema(root);
}

// ---------------------------------------------------------------- shape check

/** An unknown key does not stop the lint: it is reported and the lint carries on. A wrong shape does: the lint cannot
 * walk past it. */
export type ShapeIssue =
  | { kind: "unknown_keys"; path: PropertyKey[]; keys: string[] }
  | { kind: "shape"; path: PropertyKey[]; message: string };

type ZodIssue = z.core.$ZodIssue;

/** The type names of a value, as zod names them in its messages. */
function received(value: unknown): string {
  return value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
}

/** zod reports a failed union as one issue holding every branch's issues. When a branch matched the value's type and
 * failed deeper, its issues are the real ones; when none did, say which types would have done. */
function flatten(issue: ZodIssue, base: PropertyKey[], root: unknown): ShapeIssue[] {
  const path = [...base, ...issue.path];
  if (issue.code === "invalid_union" && issue.errors.length > 0) {
    const depth = (branch: ZodIssue[]) => (branch.length ? Math.min(...branch.map((i) => i.path.length)) : 0);
    const best = [...issue.errors].sort((a, b) => depth(b) - depth(a))[0];
    if (best && depth(best) > 0) return best.flatMap((i) => flatten(i, path, root));
    const expected = issue.errors.flat().flatMap((i) => (i.code === "invalid_type" && i.path.length === 0 ? [i.expected] : []));
    const value = path.reduce<unknown>((v, k) => (v as Record<PropertyKey, unknown> | undefined)?.[k], root);
    return [{ kind: "shape", path, message: `expected ${[...new Set(expected)].join(" or ")}, got ${received(value)}` }];
  }
  if (issue.code === "unrecognized_keys") return [{ kind: "unknown_keys", path, keys: issue.keys }];
  return [{ kind: "shape", path, message: issue.message }];
}

export function checkShape(schema: z.ZodType, value: unknown): ShapeIssue[] {
  const result = schema.safeParse(value);
  return result.success ? [] : result.error.issues.flatMap((i) => flatten(i, [], value));
}

/** Fields that name a list item, in the order they are tried. */
const ITEM_NAMES = ["id", "key", "name"];

/** A zod path as a dotted name; a list item is named by its id where it has one: entities.order.transitions[O02]. */
export function pathText(path: readonly PropertyKey[], root: unknown): string {
  let node = root;
  return path.map((p, i) => {
    const item = (node as Record<PropertyKey, unknown> | null | undefined)?.[p];
    node = item;
    if (typeof p !== "number") return (i ? "." : "") + String(p);
    const named = ITEM_NAMES.map((k) => (item as Record<string, unknown> | null | undefined)?.[k]).find((v) => typeof v === "string");
    return `[${named ?? p}]`;
  }).join("");
}
