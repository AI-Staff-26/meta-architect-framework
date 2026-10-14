import assert from "node:assert/strict";
import { test } from "node:test";
import { agentFilesOf, baseBlueprint, transitionOf } from "./support.ts";
import type { BlueprintFiles } from "./support.ts";

// The agent view, where it carries data an implementer cannot find elsewhere: SPEC.md's «Open questions», the state
// machines' table and diagrams, the provider calls.

function fileOf(b: BlueprintFiles, name: string): string {
  const text = agentFilesOf(b).get(name);
  assert.ok(text !== undefined, `${name} is rendered`);
  return text;
}

const specOf = (b: BlueprintFiles) => fileOf(b, "SPEC.md");

/** The lines of one `## ` section, without its heading. */
function section(spec: string, title: string): string[] {
  const lines = spec.split("\n");
  const start = lines.indexOf(`## ${title}`);
  assert.ok(start >= 0, `SPEC.md has ## ${title}`);
  const end = lines.findIndex((line, i) => i > start && line.startsWith("## "));
  return lines.slice(start + 1, end < 0 ? undefined : end);
}

test("SPEC.md lists the discuss and design divergences under «Open questions», right after «Rules»", () => {
  const b = baseBlueprint();
  b.meta.meta = { ...b.meta.meta, rules: ["Ошибки — единым форматом"] };
  b.calls.divergences = [
    { id: "d1", area: "Оплата", status: "keep", owner: "—", tz: "—", proposal: "—" },
    { id: "d-refund", area: "Возврат", status: "discuss", owner: "—", tz: "—", proposal: "Вернуть | частично:\n- сразу;\n- после проверки" },
    { id: "d-done", area: "Чек", status: "accept", owner: "—", tz: "—", proposal: "Как в ТЗ" },
    { id: "d-screen", status: "design", proposal: "Набросок экрана" },
  ];
  const spec = specOf(b);
  const headings = spec.split("\n").filter((line) => line.startsWith("## "));
  assert.deepEqual(headings.slice(0, 3), ["## Rules", "## Open questions", "## Parameters"]);
  assert.deepEqual(section(spec, "Open questions"), [
    "",
    "| id | area | status | proposal |",
    "|---|---|---|---|",
    "| `d-refund` | Возврат | discuss | Вернуть \\| частично: - сразу; - после проверки |",
    "| `d-screen` | — | design | Набросок экрана |",
    "",
  ]);
  assert.ok(!spec.includes("d-done"), "an accepted divergence is not an open question");
});

test("SPEC.md has no «Open questions» section when every divergence is decided", () => {
  const spec = specOf(baseBlueprint());
  assert.ok(!spec.includes("## Open questions"), spec.slice(0, 400));
});

/** The «writes · with» cell — the 7th column — of a transition's row in STATE-MACHINES.md. */
function writesWithCell(b: BlueprintFiles, id: string): string {
  const row = fileOf(b, "STATE-MACHINES.md").split("\n").find((line) => line.startsWith(`| ${id} |`));
  assert.ok(row, `STATE-MACHINES.md has a row for ${id}`);
  return row.split(" | ")[6] ?? "";
}

test("STATE-MACHINES.md shows unique and late result — for a cross-cutting transition it is the only place", () => {
  const b = baseBlueprint();
  // A shared mechanism (step "*") has no step section in SPEC.md.
  b.entities.job = {
    title: "Задача провайдера", table: "jobs", field: "state", initial: "created", terminal: ["created"],
    fields: { id: "uuid", state: "text" }, states: { created: "создана" },
    transitions: [{
      id: "J01", from: "∅", to: "created", step: "*", fired_by: { kind: "event", ref: "любой шаг с задачей" },
      unique: "(run_id, request_hash)", local: true,
    }],
  };
  transitionOf(b, "order", "O03").late = true;
  Object.assign(transitionOf(b, "order", "O02"), { may_write: { status_at: "когда ушли платить" } });

  assert.ok(!specOf(b).includes("(run_id, request_hash)"), "SPEC.md has no section for a step-* transition");
  assert.equal(writesWithCell(b, "J01"), "unique: (run_id, request_hash)");
  assert.equal(writesWithCell(b, "O01"), "unique: Idempotency-Key");
  assert.equal(writesWithCell(b, "O03"), "late result");
  // may_write and local were there already: pinned so they stay.
  assert.equal(writesWithCell(b, "O02"), "`ref` = ссылка провайдера; may write `status_at` = когда ушли платить");
  assert.match(fileOf(b, "STATE-MACHINES.md"), /^\| O02 \|.* \| local \|$/m);
});

test("agent/calls/<id>.json carries every field of the call, in the schema's order", () => {
  const b = baseBlueprint();
  Object.assign(b.calls.calls?.c1 ?? {}, {
    params: "effort: high; max_tokens: 4000; thinking: on", when: "после оплаты", latency: "2–4 с", cost: "$0.01",
    failure: "- 429: повтор через минуту", requestNote: "как в журнале",
  });
  b.calls.calls = { ...b.calls.calls, c2: { step: "s3", model: "llm", request: "{}", response: "{}" } };
  const files = agentFilesOf(b);
  const c1 = JSON.parse(files.get("calls/c1.json") ?? "{}") as Record<string, unknown>;
  assert.deepEqual(Object.keys(c1), [
    "step", "title", "model", "prompt", "when", "params", "latency", "cost", "failure", "request", "requestNote", "response",
  ]);
  assert.equal(c1.params, "effort: high; max_tokens: 4000; thinking: on");
  assert.equal(c1.failure, "- 429: повтор через минуту");
  // A field the call leaves out is not written, except the five every calls/ file has always had.
  assert.deepEqual(JSON.parse(files.get("calls/c2.json") ?? "{}"), {
    step: "s3", model: "llm", prompt: null, request: "{}", response: "{}",
  });
});

test("STATE-MACHINES.md diagrams draw a → previous edge to every state previous can be", () => {
  const b = baseBlueprint();
  // previous ∈ {draft, paying}: the from-states of the two transitions that save it.
  transitionOf(b, "order", "O02").saves_previous = true;
  transitionOf(b, "order", "O03").saves_previous = true;
  b.entities.order?.transitions?.push({
    id: "O05", from: "paying", to: "previous", step: "s3", event: "PaymentCancelled",
    fired_by: { kind: "endpoint", ref: "POST /orders/{id}:cancel" }, local: true,
  });
  transitionOf(b, "order", "O04").failures = [{ class: "timeout", detect: "нет ответа", to: "previous", says: "Ошибка", retry: "none" }];
  const sm = fileOf(b, "STATE-MACHINES.md");
  for (const edge of [
    "    paying --> draft: O05 ↩ previous PaymentCancelled", "    paying --> paying: O05 ↩ previous PaymentCancelled",
    "    paying --> draft: O04✗ timeout ↩ previous", "    paying --> paying: O04✗ timeout ↩ previous",
  ]) {
    assert.ok(sm.split("\n").includes(edge), `${edge}\n${sm}`);
  }
});
