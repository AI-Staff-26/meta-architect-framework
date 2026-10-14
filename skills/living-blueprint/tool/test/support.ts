// A minimal blueprint that lints clean, for tests to break one rule at a time. One entity (an order), three steps:
// create it, pay for it, the provider's callback confirms it — or the payment deadline fails it.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stringify } from "yaml";
import { agentView } from "../src/agent-view.ts";
import { lint } from "../src/lint.ts";
import { load } from "../src/load.ts";
import type { Config, Contract, DataFile, Entity, Journey, Prompt, Transition } from "../src/schema.ts";

export interface BlueprintFiles {
  config: Config;
  /** 00-meta.yaml: meta, lanes, models */
  meta: DataFile;
  entities: Record<string, Entity>;
  contracts: Record<string, Contract>;
  journey: Journey;
  /** 80-calls.yaml: calls and divergences */
  calls: DataFile;
  prompts: Record<string, Prompt>;
}

export function baseBlueprint(): BlueprintFiles {
  return {
    config: { brand: "Test", page_title: "Test blueprint", html: "blueprint.html" },
    meta: {
      meta: {
        title: "Checkout", version: "v1", date: "2026-10-14", actors: ["customer", "system"],
        params: {
          pay_timeout: { value: "15 мин", source: "spec" },
          poll_every: { value: "30 с", source: "spec" },
        },
        flags: { payments: { off: "новые оплаты не начинаются; начатые доходят до конца" } },
      },
      lanes: [{ id: "user", title: "Человек" }, { id: "engine", title: "Движок" }],
      models: [{ key: "llm", name: "LLM", external: true, slow: true }],
    },
    entities: {
      order: {
        title: "Заказ", table: "orders", field: "status", initial: "draft", terminal: ["paid", "failed"],
        waiting: ["paying"], required: ["id", "status"],
        fields: { id: "uuid", status: "text", status_at: "timestamp", prev_status: "text", ref: "text" },
        states: { draft: "черновик", paying: "оплачивается", paid: "оплачен", failed: "не оплачен" },
        transitions: [
          {
            id: "O01", from: "∅", to: "draft", step: "s1", event: "OrderCreated",
            fired_by: { kind: "endpoint", ref: "POST /orders" }, unique: "Idempotency-Key", local: true,
          },
          {
            id: "O02", from: "draft", to: "paying", step: "s2", event: "PaymentStarted",
            fired_by: { kind: "endpoint", ref: "POST /orders/{id}:pay" }, writes: { ref: "ссылка провайдера" }, local: true,
          },
          {
            id: "O03", from: "paying", to: "paid", step: "s3", event: "OrderPaid",
            fired_by: { kind: "callback", ref: "POST /callbacks/pay" }, local: true,
          },
          {
            id: "O04", from: "paying", to: "failed", step: "s3", fired_by: { kind: "timer", ref: "param:pay_timeout" },
            says: "Оплата не прошла", local: true,
          },
        ],
      },
    },
    contracts: {
      s1: {
        trigger: "ui: «Создать заказ»", actor: ["customer"], delivery: "sync",
        endpoint: {
          method: "POST", path: "/orders", idempotency: true, request: "{}", responses: { "201": "{order_id}" }, errors: {},
        },
        ui: { success: "Заказ создан" },
        fixtures: [{ name: "happy", entity: "order", via: ["order.O01"], mode: "patch", before: null, after: { id: "o1", status: "draft" } }],
      },
      s2: {
        trigger: "ui: «Оплатить»", actor: ["customer"], delivery: "sync", flag: "payments", params: ["pay_timeout"],
        endpoint: {
          method: "POST", path: "/orders/{id}:pay", idempotency: true, request: "{}", responses: { "202": "{status: paying}" },
          errors: { "409": "already_paid — «Заказ уже оплачен»" },
        },
        fixtures: [{
          name: "happy", entity: "order", via: ["order.O02"], mode: "patch",
          before: { id: "o1", status: "draft" }, after: { id: "o1", status: "paying", ref: "r1" },
        }],
      },
      s3: {
        trigger: "system: callback провайдера", actor: ["system"], delivery: "async_job",
        inbound: [{
          id: "pay_cb", method: "POST", path: "/callbacks/pay", auth: "HMAC", payload: "{ref, status}",
          dedupe: "по ref", answer: "200 {ok: true}",
        }],
        fixtures: [{
          name: "paid", entity: "order", via: ["order.O03"], mode: "patch",
          before: { id: "o1", status: "paying" }, after: { id: "o1", status: "paid" },
        }],
      },
    },
    journey: {
      id: "checkout", title: "Оплата",
      steps: [
        { id: "s1", title: "Создать заказ", cells: { user: "создаёт заказ", engine: "пишет строку" }, div: ["d1"] },
        { id: "s2", title: "Оплатить", cells: { user: "платит" }, prompts: ["p1"], detail: { calls: ["c1"] } },
        { id: "s3", title: "Подтверждение" },
      ],
    },
    calls: {
      calls: { c1: { step: "s2", title: "Сводка", model: "llm", prompt: "p1", request: "{}", response: "{}" } },
      divergences: [{ id: "d1", area: "Оплата", status: "keep", owner: "—", tz: "—", proposal: "—" }],
    },
    prompts: {
      p1: { title: "Сводка", step: "s2", model: "llm", system: "Кратко перескажи {{doc}}", vars: [["doc", "текст документа"]] },
    },
  };
}

export function transitionOf(b: BlueprintFiles, entity: string, id: string): Transition {
  const t = b.entities[entity]?.transitions?.find((x) => x.id === id);
  if (!t) throw new Error(`no transition ${entity}.${id}`);
  return t;
}

export function contractOf(b: BlueprintFiles, sid: string): Contract {
  const c = b.contracts[sid];
  if (!c) throw new Error(`no contract ${sid}`);
  return c;
}

/** YAML that reads the same in 1.1 (PyYAML) and 1.2: `off`, `yes` and `1:30` are quoted, so a 1.1 reader gets the
 * same data. */
const yamlText = (value: unknown) => stringify(value, { version: "1.1" });

/** Writes the files into a new temporary blueprint directory; the caller removes it. */
export function writeBlueprint(b: BlueprintFiles): string {
  const root = mkdtempSync(join(tmpdir(), "lb-test-"));
  writeSources(root, b);
  return root;
}

/** Writes (or rewrites) the source files of a blueprint directory: blueprint.config.yaml and src/. */
export function writeSources(root: string, b: BlueprintFiles): void {
  const data = join(root, "src", "data");
  const prompts = join(root, "src", "prompts");
  mkdirSync(data, { recursive: true });
  mkdirSync(prompts, { recursive: true });
  writeFileSync(join(root, "blueprint.config.yaml"), yamlText(b.config));
  writeFileSync(join(data, "00-meta.yaml"), yamlText(b.meta));
  writeFileSync(join(data, "05-entities.yaml"), yamlText({ entities: b.entities }));
  writeFileSync(join(data, "06-contracts.yaml"), yamlText({ contracts: b.contracts }));
  writeFileSync(join(data, "10-checkout.yaml"), yamlText({ journey: b.journey }));
  writeFileSync(join(data, "80-calls.yaml"), yamlText(b.calls));
  writeFileSync(join(prompts, "10-prompts.yaml"), yamlText(b.prompts));
}

export interface Findings {
  errors: string[];
  warnings: string[];
}

/** Loads and lints the files the way `build.ts` does, through a real directory. */
export function lintBlueprint(b: BlueprintFiles): Findings {
  const root = writeBlueprint(b);
  try {
    const { bp, problems, shapeBroken } = load(root);
    if (shapeBroken) return { errors: problems, warnings: [] };
    const L = lint(bp, problems);
    return { errors: L.errors, warnings: L.warnings };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/** Loads the files through a real directory and renders the agent view: path relative to agent/ → text. */
export function agentFilesOf(b: BlueprintFiles): Map<string, string> {
  const root = writeBlueprint(b);
  try {
    return agentView(load(root).bp).files;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/** The findings of one rule that name the given object. */
export function findingsOf(lines: readonly string[], rule: string, object: string): string[] {
  return lines.filter((line) => line.startsWith(`${rule} `) && line.includes(object));
}
