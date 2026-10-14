import assert from "node:assert/strict";
import { test } from "node:test";
import { baseBlueprint, contractOf, findingsOf, lintBlueprint, transitionOf } from "./support.ts";
import type { BlueprintFiles } from "./support.ts";

// One test per lint rule. Each breaks the clean base in one place and checks the rule id and the object the finding
// names. Wording is not compared, so a message can be reworded without touching the tests.

function expectFinding(b: BlueprintFiles, rule: string, object: string, kind: "errors" | "warnings" = "errors"): void {
  const findings = lintBlueprint(b);
  const hits = findingsOf(findings[kind], rule, object);
  assert.ok(hits.length > 0, `expected ${rule} naming "${object}" among ${kind}:\n${findings[kind].join("\n") || "(none)"}`);
}

test("the base blueprint lints clean, so each finding below comes from its own change", () => {
  assert.deepEqual(lintBlueprint(baseBlueprint()), { errors: [], warnings: [] });
});

test("L0: an unknown field, and cells for a lane that does not exist", () => {
  const b = baseBlueprint();
  Object.assign(transitionOf(b, "order", "O02"), { colour: "red" });
  Object.assign(b.journey.steps[0]?.cells ?? {}, { robot: "—" });
  const { errors } = lintBlueprint(b);
  assert.ok(findingsOf(errors, "L0", "transitions[O02]").some((e) => e.includes("'colour'")), errors.join("\n"));
  assert.ok(findingsOf(errors, "L0", "step s1").some((e) => e.includes("'robot'")), errors.join("\n"));
});

test("L0: a wrong shape stops the build before the lint", () => {
  const b = baseBlueprint();
  Object.assign(transitionOf(b, "order", "O02"), { to: ["paying"] });
  const { errors } = lintBlueprint(b);
  assert.ok(findingsOf(errors, "L0", "transitions[O02].to").length > 0, errors.join("\n"));
  assert.deepEqual(errors.filter((e) => !e.startsWith("L0 ")), []);
});

test("L0: unknown fields in seq actors and messages, note cards and seq, meta.as_is and meta.labels", () => {
  const b = baseBlueprint();
  b.journey.seq = {
    title: "Оплата",
    actors: [Object.assign({ id: "u", label: "Человек" }, { shape: "box" })],
    msgs: [Object.assign({ from: "u", to: "u", text: "платит" }, { style: "bold" })],
  };
  b.calls.notes = [{
    id: "n1", title: "Заметка", cards: [Object.assign({ title: "Итог", body: "—" }, { icon: "★" })],
    seq: Object.assign({ title: "Колбэк", actors: [{ id: "p", label: "Провайдер" }], msgs: [] }, { width: 2 }),
  }];
  b.meta.meta = {
    ...b.meta.meta,
    as_is: Object.assign({ title: "Как сейчас", body: "—" }, { author: "архитектор" }),
    labels: Object.assign({ div_tab: "Расхождения" }, { colour: "red" }),
  };
  const { errors } = lintBlueprint(b);
  for (const [object, key] of [
    ["journey.seq.actors[u]", "shape"], ["journey.seq.msgs[0]", "style"], ["notes[n1].cards[0]", "icon"],
    ["notes[n1].seq", "width"], ["meta.as_is", "author"], ["meta.labels", "colour"],
  ] as const) {
    assert.ok(findingsOf(errors, "L0", object).some((e) => e.includes(`'${key}'`)), `${object} '${key}':\n${errors.join("\n")}`);
  }
});

test("L0: a lane or seq actor colour outside #hex, var(--name) and a colour keyword", () => {
  const b = baseBlueprint();
  Object.assign(b.meta.lanes?.[0] ?? {}, { color: "red\" onmouseover=\"alert(1)" });
  b.journey.seq = {
    title: "Оплата", actors: [{ id: "u", label: "Человек", color: "red;background:url(https://evil.example/x)" }], msgs: [],
  };
  const { errors } = lintBlueprint(b);
  for (const object of ["lanes[user].color", "journey.seq.actors[u].color"]) {
    assert.ok(findingsOf(errors, "L0", object).length > 0, `${object}:\n${errors.join("\n")}`);
  }
});

test("L0: the colours a page may use pass", () => {
  for (const color of ["#abc", "#abcd", "#a1b2c3", "#a1b2c3d4", "var(--lane-user)", "rebeccapurple"]) {
    const b = baseBlueprint();
    Object.assign(b.meta.lanes?.[0] ?? {}, { color });
    assert.deepEqual(lintBlueprint(b), { errors: [], warnings: [] }, color);
  }
});

test("L1: a step names a model that is not registered", () => {
  const b = baseBlueprint();
  Object.assign(b.journey.steps[0] ?? {}, { models: ["ghost"] });
  expectFinding(b, "L1", "step s1");
});

test("L1: a sequence message names an actor its seq does not declare — in a journey and in a note", () => {
  const b = baseBlueprint();
  const actors = [{ id: "u", label: "Человек" }, { id: "api", label: "API" }];
  b.journey.seq = {
    title: "Оплата", actors,
    msgs: [{ from: "u", to: "api", text: "платит" }, { from: "api", to: "bank", text: "списывает" }],
  };
  b.calls.notes = [{ id: "n1", title: "Колбэк", seq: { title: "Колбэк", actors, msgs: [{ from: "psp", to: "api", text: "колбэк" }] } }];
  const { errors } = lintBlueprint(b);
  assert.ok(findingsOf(errors, "L1", "journey checkout").some((e) => e.includes("'bank'")), errors.join("\n"));
  assert.ok(findingsOf(errors, "L1", "note n1").some((e) => e.includes("'psp'")), errors.join("\n"));
  assert.equal(errors.length, 2, errors.join("\n"));
});

test("L2: a state nothing leads to", () => {
  const b = baseBlueprint();
  Object.assign(b.entities.order?.states ?? {}, { limbo: "нигде" });
  expectFinding(b, "L2", "entity order");
});

test("L3: a step that calls an external model has a transition without failures", () => {
  const b = baseBlueprint();
  Object.assign(b.journey.steps[2] ?? {}, { models: ["llm"] });
  delete transitionOf(b, "order", "O03").local;
  expectFinding(b, "L3", "order.O03");
});

test("L4: a priced endpoint without idempotency", () => {
  const b = baseBlueprint();
  Object.assign(contractOf(b, "s2").endpoint as object, { price: "price.order", idempotency: false });
  expectFinding(b, "L4", "contract s2");
});

test("L5: a delivery that is not one of sync, stream, async_job, none", () => {
  const b = baseBlueprint();
  contractOf(b, "s2").delivery = "fast";
  expectFinding(b, "L5", "contract s2");
});

test("L6: an actor that is not in meta.actors", () => {
  const b = baseBlueprint();
  contractOf(b, "s1").actor = ["admin"];
  expectFinding(b, "L6", "contract s1");
});

test("L6: an `also` endpoint's own flag without meta.flags.<flag>.off", () => {
  const b = baseBlueprint();
  contractOf(b, "s2").also = [{
    id: "retry", purpose: "«Повторить»", flag: "retries", method: "POST", path: "/orders/{id}:retry", idempotency: true,
    request: "{}", responses: { "202": "{status: paying}" }, errors: {},
  }];
  expectFinding(b, "L6", "flag 'retries'");
});

test("L7: a disabled_when without the words the person sees", () => {
  const b = baseBlueprint();
  contractOf(b, "s1").ui = { success: "Заказ создан", disabled_when: [{ when: "нет товара" }] };
  expectFinding(b, "L7", "contract s1");
});

test("L7: a disabled_when without the condition that disables", () => {
  const b = baseBlueprint();
  contractOf(b, "s1").ui = { success: "Заказ создан", disabled_when: [{ says: "Товар закончился" }] };
  const { errors } = lintBlueprint(b);
  assert.ok(findingsOf(errors, "L7", "contract s1").some((e) => e.includes("'when'")), errors.join("\n"));
});

test("L8: a fixture whose after-state the via transitions do not reach", () => {
  const b = baseBlueprint();
  const fx = contractOf(b, "s2").fixtures;
  Object.assign(Array.isArray(fx) ? fx[0] ?? {} : {}, { after: { id: "o1", status: "paid", ref: "r1" } });
  expectFinding(b, "L8", "contract s2");
});

test("L8: `previous` lands on the state the last saves_previous transition of the chain left", () => {
  const b = baseBlueprint();
  const order = b.entities.order;
  assert.ok(order?.transitions && order.states);
  order.states.held = "на проверке";
  order.transitions.push(
    { id: "O05", from: "paying", to: "held", step: "s3", fired_by: { kind: "event", ref: "OrderPaid" }, saves_previous: true, local: true },
    { id: "O06", from: "held", to: "previous", step: "s3", fired_by: { kind: "event", ref: "HoldReleased" }, local: true },
  );
  b.meta.meta = { ...b.meta.meta, external_events: ["HoldReleased"] };
  const chain = { name: "hold", entity: "order", via: ["order.O05", "order.O06"], mode: "patch" };
  contractOf(b, "s3").fixtures = [
    { ...chain, before: { id: "o1", status: "paying", prev_status: "draft" }, after: { id: "o1", status: "paying", prev_status: "paying" } },
  ];
  assert.deepEqual(findingsOf(lintBlueprint(b).errors, "L8", "contract s3"), []);
  contractOf(b, "s3").fixtures = [
    { ...chain, before: { id: "o1", status: "paying", prev_status: "draft" }, after: { id: "o1", status: "draft", prev_status: "paying" } },
  ];
  expectFinding(b, "L8", "'hold'.after.status");
});

test("L9: a prompt variable that vars does not declare", () => {
  const b = baseBlueprint();
  Object.assign(b.prompts.p1 ?? {}, { system: "Кратко перескажи {{doc}} для {{reader}}" });
  expectFinding(b, "L9", "prompt p1");
});

test("L10: two steps with one id", () => {
  const b = baseBlueprint();
  b.journey.steps.push({ id: "s1", title: "Ещё раз" });
  expectFinding(b, "L10", "s1");
});

/** The first item of a one-or-many field that the base blueprint writes as a list. */
function first<T>(items: T | T[] | null | undefined): T {
  const item = Array.isArray(items) ? items[0] : items;
  assert.ok(item !== null && item !== undefined, "the base blueprint has the item");
  return item;
}

test("L10: transition D-01 — its token SM:order.D-01 is one drift-check can never match", () => {
  const b = baseBlueprint();
  transitionOf(b, "order", "O02").id = "D-01";
  first(contractOf(b, "s2").fixtures).via = ["order.D-01"];
  expectFinding(b, "L10", "transition 'D-01'");
});

test("L10: a traversal id is rejected wherever an id becomes a file name or a test token", () => {
  const b = baseBlueprint();
  const climb = "../../../escape";
  const call = b.calls.calls?.c1;
  const prompt = b.prompts.p1;
  assert.ok(call && prompt);
  // The call and the prompt are renamed together with every reference to them.
  b.calls.calls = { [climb]: { ...call, prompt: `${climb}.p` } };
  b.prompts = { [`${climb}.p`]: prompt };
  Object.assign(b.journey.steps[1] ?? {}, { prompts: [`${climb}.p`], detail: { calls: [climb] } });
  b.journey.steps.push({ id: "../s9", title: "Ещё" });
  b.entities["../order"] = { title: "Копия", transitions: [] };
  first(contractOf(b, "s3").inbound).id = "cb/../x";
  first(contractOf(b, "s1").fixtures).name = "../happy";
  contractOf(b, "s1").also = [{ id: "a/b", method: "GET", path: "/orders", purpose: "список", responses: { "200": "[…]" }, errors: {} }];
  transitionOf(b, "order", "O03").id = "../O03";
  const { errors } = lintBlueprint(b);
  for (const object of [
    `call '${climb}'`, `prompt '${climb}.p'`, "step '../s9'", "entity '../order'", "transition '../O03'", "inbound 'cb/../x'",
    "fixture '../happy'", "also 'a/b'",
  ]) {
    assert.ok(findingsOf(errors, "L10", object).length > 0, `${object}:\n${errors.join("\n")}`);
  }
});

test("L10: call and prompt ids may be dotted; step ids may not", () => {
  const b = baseBlueprint();
  const call = b.calls.calls?.c1;
  const prompt = b.prompts.p1;
  assert.ok(call && prompt);
  b.calls.calls = { "c.sum-1.result": { ...call, prompt: "sum.write" } };
  b.prompts = { "sum.write": prompt };
  Object.assign(b.journey.steps[1] ?? {}, { prompts: ["sum.write"], detail: { calls: ["c.sum-1.result"] } });
  assert.deepEqual(lintBlueprint(b), { errors: [], warnings: [] });
  b.journey.steps.push({ id: "s1.x", title: "Ещё" });
  expectFinding(b, "L10", "step 's1.x'");
});

test("L11: a callback trigger that no inbound declares", () => {
  const b = baseBlueprint();
  transitionOf(b, "order", "O03").fired_by = { kind: "callback", ref: "POST /callbacks/other" };
  expectFinding(b, "L11", "order.O03");
});

test("L12: two transitions from one state on one trigger with one guard", () => {
  const b = baseBlueprint();
  b.entities.order?.transitions?.push({
    id: "O05", from: "draft", to: "failed", step: "s2", fired_by: { kind: "endpoint", ref: "POST /orders/{id}:pay" }, local: true,
  });
  expectFinding(b, "L12", "order.O05");
});

test("L13: a failure of an unknown class", () => {
  const b = baseBlueprint();
  transitionOf(b, "order", "O04").failures = [{ class: "weird", detect: "ответ 500", to: "failed", says: "Ошибка", retry: "none" }];
  expectFinding(b, "L13", "order.O04");
});

test("L13: attempts is an integer ≥ 1 whoever retries", () => {
  for (const [retry, attempts] of [["worker", 0], ["none", 0], [null, 2.5], ["user", -1]] as const) {
    const b = baseBlueprint();
    transitionOf(b, "order", "O04").failures = [{
      class: "timeout", detect: "нет ответа", to: "failed", says: "Ошибка", retry, attempts, retry_via: "POST /orders/{id}:pay",
    }];
    const { errors } = lintBlueprint(b);
    assert.ok(findingsOf(errors, "L13", "order.O04").some((e) => e.includes("attempts")), `${retry} ×${attempts}:\n${errors.join("\n")}`);
  }
});

test("L13: a boolean is not a number of attempts", () => {
  const b = baseBlueprint();
  transitionOf(b, "order", "O04").failures = [{
    class: "timeout", detect: "нет ответа", to: "failed", says: "Ошибка", retry: "worker", attempts: true as unknown as number,
  }];
  const { errors } = lintBlueprint(b);
  assert.ok(errors.some((e) => e.includes("transitions[O04].failures[0].attempts")), errors.join("\n"));
});

test("L14: an inbound callback without a dedupe rule", () => {
  const b = baseBlueprint();
  const inbound = contractOf(b, "s3").inbound;
  if (Array.isArray(inbound) && inbound[0]) delete inbound[0].dedupe;
  expectFinding(b, "L14", "contract s3");
});

test("L16: an error without «the words the person sees»", () => {
  const b = baseBlueprint();
  Object.assign(contractOf(b, "s2").endpoint as object, { errors: { "409": "already_paid" } });
  expectFinding(b, "L16", "contract s2");
});

test("L17: a transition writes a field the entity does not declare", () => {
  const b = baseBlueprint();
  transitionOf(b, "order", "O02").writes = { ref: "ссылка провайдера", note: "комментарий" };
  expectFinding(b, "L17", "order.O02");
});

test("L18: a waiting state whose only exit besides the callback is a poll — a poll is not a deadline", () => {
  const b = baseBlueprint();
  transitionOf(b, "order", "O04").fired_by = { kind: "poll", ref: "param:poll_every" };
  expectFinding(b, "L18", "entity order");
});

test("L19: `previous` without a saves_previous transition", () => {
  const b = baseBlueprint();
  transitionOf(b, "order", "O04").to = "previous";
  expectFinding(b, "L19", "entity order");
});

test("L20: a creation without `unique`", () => {
  const b = baseBlueprint();
  delete transitionOf(b, "order", "O01").unique;
  expectFinding(b, "L20", "order.O01");
});

test("L20: a creation with failures — a lost answer, a late callback or a retry would have no row to land on", () => {
  const b = baseBlueprint();
  const create = transitionOf(b, "order", "O01");
  delete create.local;
  create.failures = [{ class: "provider_error", detect: "ответ 5xx", to: "failed", says: "Заказ не создан", retry: "none" }];
  expectFinding(b, "L20", "order.O01");
});

// `with`: the base plus a hold. Paying places it in the request's transaction (order.O02 carries hold.H01), and the
// provider's callback captures it in the confirmation's (order.O03 carries hold.H02). Each carried transition names
// the trigger of its carrier.

function withHold(): BlueprintFiles {
  const b = baseBlueprint();
  b.entities.hold = {
    title: "Холд", table: "ledger_entry", field: "state", initial: "held", terminal: ["captured"], required: ["id", "state"],
    fields: { id: "uuid", state: "вычисляется из записей" }, states: { held: "заморожено", captured: "списано" },
    transitions: [
      {
        id: "H01", from: "∅", to: "held", step: "s2", fired_by: { kind: "endpoint", ref: "POST /orders/{id}:pay" },
        unique: "order_id", local: true,
      },
      { id: "H02", from: "held", to: "captured", step: "s3", fired_by: { kind: "callback", ref: "POST /callbacks/pay" }, local: true },
    ],
  };
  transitionOf(b, "order", "O02").with = ["hold.H01"];
  transitionOf(b, "order", "O03").with = ["hold.H02"];
  return b;
}

/** Findings of one rule whose subject — the object before the colon — is the given transition. */
const aboutTransition = (lines: readonly string[], rule: string, key: string) => findingsOf(lines, rule, `${key}:`);

test("L18: a callback shared with the transition that carries it does not make the state a waiting one — the carrier waits", () => {
  assert.deepEqual(lintBlueprint(withHold()), { errors: [], warnings: [] });
});

test("L18: a callback of the carried transition's own still makes its state a waiting one", () => {
  const b = withHold();
  const inbound = contractOf(b, "s3").inbound;
  if (Array.isArray(inbound)) {
    inbound.push({
      id: "refund_cb", method: "POST", path: "/callbacks/refund", auth: "HMAC", payload: "{ref}", dedupe: "по ref", answer: "200 {ok: true}",
    });
  }
  transitionOf(b, "hold", "H02").fired_by = [
    { kind: "callback", ref: "POST /callbacks/pay" }, { kind: "callback", ref: "POST /callbacks/refund" },
  ];
  expectFinding(b, "L18", "hold.H02: 'held'", "warnings");
});

test("L21 a: a carried transition names none of the triggers of the transition that carries it", () => {
  const b = withHold();
  transitionOf(b, "hold", "H01").fired_by = { kind: "endpoint", ref: "POST /orders" };
  const { errors } = lintBlueprint(b);
  const hits = aboutTransition(errors, "L21", "hold.H01");
  assert.ok(hits.length === 1 && hits[0]?.includes("order.O02"), errors.join("\n"));
  assert.equal(findingsOf(errors, "L21", "").length, 1, errors.join("\n"));
});

test("L21 b: a carrier fired by an event the transition it carries emits", () => {
  const b = withHold();
  transitionOf(b, "hold", "H02").event = "HoldCaptured";
  transitionOf(b, "order", "O03").fired_by = [
    { kind: "callback", ref: "POST /callbacks/pay" }, { kind: "event", ref: "HoldCaptured" },
  ];
  const { errors } = lintBlueprint(b);
  const hits = aboutTransition(errors, "L21", "order.O03");
  assert.ok(hits.length === 1 && hits[0]?.includes("hold.H02") && hits[0].includes("HoldCaptured"), errors.join("\n"));
  assert.equal(findingsOf(errors, "L21", "").length, 1, errors.join("\n"));
});

test("L21 c: a carried transition fired by an event its carrier emits", () => {
  const b = withHold();
  transitionOf(b, "hold", "H01").fired_by = [
    { kind: "endpoint", ref: "POST /orders/{id}:pay" }, { kind: "event", ref: "PaymentStarted" },
  ];
  const { errors } = lintBlueprint(b);
  const hits = aboutTransition(errors, "L21", "hold.H01");
  assert.ok(hits.length === 1 && hits[0]?.includes("order.O02") && hits[0].includes("PaymentStarted"), errors.join("\n"));
  assert.equal(findingsOf(errors, "L21", "").length, 1, errors.join("\n"));
});

test("L21 c: the carrier's event is allowed when another transition fired by it carries the same transition", () => {
  const b = withHold();
  transitionOf(b, "hold", "H01").fired_by = [
    { kind: "endpoint", ref: "POST /orders/{id}:pay" }, { kind: "event", ref: "PaymentStarted" },
  ];
  // The order's own reaction to PaymentStarted carries the hold too, as lyrics.V02 carries hold.H02 on LyricsWritten.
  const react = { id: "O05", from: "paying", to: "same", step: "s2", fired_by: { kind: "event", ref: "PaymentStarted" }, local: true };
  b.entities.order?.transitions?.push({ ...react, with: ["hold.H01"] });
  assert.deepEqual(lintBlueprint(b), { errors: [], warnings: [] });

  // Fired by that event, but not carrying the hold: the exception does not apply.
  const without = withHold();
  transitionOf(without, "hold", "H01").fired_by = transitionOf(b, "hold", "H01").fired_by;
  without.entities.order?.transitions?.push(react);
  const { errors } = lintBlueprint(without);
  assert.ok(aboutTransition(errors, "L21", "hold.H01").some((e) => e.includes("PaymentStarted")), errors.join("\n"));
});
