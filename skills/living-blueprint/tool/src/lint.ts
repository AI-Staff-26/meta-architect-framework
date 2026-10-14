import {
  allEventsOf, BODYLESS, CREATION, contractEndpoint, endpointIndex, epKey, retryVia, SPECIAL_TO,
  stepIndex, transitionIndex, transitionsOf, usesPrevious,
} from "./model.ts";
import type { Blueprint, ErrorSink, LocatedTransition } from "./model.ts";
import { asList, dedupe, get, has, isRecord, py, pyEq, pyRepr, pyStr, sorted, strip, truthy, PY_WHITESPACE } from "./py.ts";
import { DELIVERY, FAIL_CLASSES, FIRE_KINDS, FIXTURE_MODES, RETRY } from "./schema.ts";
import type { Entity, FiredBy, Transition } from "./schema.ts";

// The lint rules L1–L21 of references/schema.md, in the order they report. L0 — unknown
// fields and wrong shapes — is the zod check in load.ts; the one L0 check that needs the merged data (cells keys are
// lane ids) is here.

export class Lint implements ErrorSink {
  readonly errors: string[] = [];
  readonly warnings: string[] = [];

  err(rule: string, msg: string): void {
    this.errors.push(`${rule} ${msg}`);
  }

  warn(rule: string, msg: string): void {
    this.warnings.push(`${rule} ${msg}`);
  }
}

const oneOf = (values: readonly string[]): ReadonlySet<unknown> => new Set(values);
const DELIVERY_SET = oneOf(DELIVERY);
const RETRY_SET = oneOf(RETRY);
const FIRE_KIND_SET = oneOf(FIRE_KINDS);
const FAIL_CLASS_SET = oneOf(FAIL_CLASSES);
const FIXTURE_MODE_SET = oneOf(FIXTURE_MODES);
/** A field whose description starts so is computed, and a snapshot fixture leaves it out. */
const COMPUTED_PREFIXES = ["вычисляется", "derived"];
/** How many characters of an error text a message quotes. */
const QUOTE_LENGTH = 40;
/** Ids that become file names (agent/fixtures/) or test tokens (`BP:`, `SM:` — drift-check reads exactly this grammar
 * per segment): steps, entities, transitions, `also` and inbound ids, fixture names. */
const PLAIN_ID = /^[A-Za-z0-9_]+$/;
const PLAIN_ID_TEXT = "letters, digits and _ ([A-Za-z0-9_]+)";
/** Call and prompt ids name files in agent/calls/ and agent/prompts/ and may be dotted (`c.lyrics.write`). No `/`, no
 * `..`: the file stays in its directory. */
const FILE_ID = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/;
const FILE_ID_TEXT = "letters, digits, _, . and - ([A-Za-z0-9_][A-Za-z0-9_.-]*) without '..'";
/** {{var}}, {{#section}}, {{/section}}, {{^inverted}} — with Python's \s, not JavaScript's. */
const PROMPT_TOKEN = new RegExp(`\\{\\{[${PY_WHITESPACE}]*([#/^]?)[${PY_WHITESPACE}]*([^}]+?)[${PY_WHITESPACE}]*\\}\\}`, "g");

const count = <T>(xs: readonly T[], x: T) => xs.filter((y) => y === x).length;
const byStr = (a: unknown, b: unknown) => {
  const [x, y] = [pyStr(a), pyStr(b)];
  return x < y ? -1 : x > y ? 1 : 0;
};
const keysOf = (o: unknown): string[] => (isRecord(o) ? Object.keys(o) : []);

/** States reachable from `initial` through the given transitions; `same` and `previous` are not states. */
function reachable(initial: unknown, ts: readonly Transition[]): Set<unknown> {
  const reach = new Set<unknown>([initial]);
  const frontier: unknown[] = [initial];
  while (frontier.length) {
    const cur = frontier.pop();
    for (const t of ts) {
      const frs: unknown[] = asList(t.from);
      if (frs.includes(cur) || (frs.includes(CREATION) && cur === initial)) {
        for (const nxt of [t.to, ...asList(t.failures).map((f) => f.to)]) {
          if (!SPECIAL_TO.has(nxt) && !reach.has(nxt)) {
            reach.add(nxt);
            frontier.push(nxt);
          }
        }
      }
    }
  }
  return reach;
}

/** A transition that carries another: it lists that one in `with`. */
interface Carrier {
  key: string;
  t: Transition;
}

/** Transition key → the transitions that carry it. Unlike `withIndex`, it keeps the direction: X carries Y when
 * `X.with` lists Y. A `with` that names no transition is L1's finding and is left out. */
function carriersIndex(trans: Map<string, LocatedTransition>): Map<string, Carrier[]> {
  const out = new Map<string, Carrier[]>();
  for (const [key, { t }] of trans) {
    for (const w of dedupe(asList(t.with))) {
      if (trans.has(w)) out.set(w, [...(out.get(w) ?? []), { key, t }]);
    }
  }
  return out;
}

/** The same trigger: kind and ref equal. */
const sameTrigger = (a: FiredBy, b: FiredBy) => pyEq(a.kind, b.kind) && pyEq(a.ref, b.ref);
const firesOn = (t: Transition, fb: FiredBy) => asList(t.fired_by).some((own) => sameTrigger(own, fb));
/** The events a transition is fired by. */
const firingEvents = (t: Transition) => dedupe(asList(t.fired_by).filter((fb) => fb.kind === "event").map((fb) => fb.ref));

export function lint(bp: Blueprint, problems: readonly string[]): Lint {
  const L = new Lint();
  L.errors.push(...problems);
  const meta = bp.meta;
  const steps = stepIndex(bp);
  const trans = transitionIndex(bp);
  const models = new Map(bp.models.map((m) => [m.key, m]));
  const external = new Set([...models].filter(([, m]) => truthy(m.external)).map(([k]) => k));
  const slow = new Set([...models].filter(([, m]) => truthy(m.slow)).map(([k]) => k));
  const actors = new Set<unknown>(asList(meta.actors));
  const flags = meta.flags ?? {};
  const divs = new Set<unknown>(bp.divergences.map((d) => d.id));
  const eps = endpointIndex(bp, L);
  const eventsEmitted = new Set<unknown>(asList(meta.external_events));
  for (const { t } of trans.values()) for (const ev of allEventsOf(t)) eventsEmitted.add(ev);

  // L0: cells are keyed by lane ids — the one key check that needs the merged data.
  const laneIds = new Set<unknown>(bp.lanes.map((x) => x.id));
  for (const j of bp.journeys) {
    for (const s of j.steps) {
      const extra = keysOf(s.cells).filter((k) => !laneIds.has(k));
      if (extra.length) L.err("L0", `step ${s.id}: cells for unknown lanes ${pyRepr(sorted(extra))}`);
    }
  }

  if (!actors.size) L.err("L6", "meta.actors is empty — list who may act");

  // L10 unique ids
  const seen = new Set<string>();
  for (const j of bp.journeys) {
    for (const s of j.steps) {
      if (seen.has(s.id)) L.err("L10", `duplicate step id ${s.id}`);
      seen.add(s.id);
    }
  }
  for (const [name, e] of Object.entries(bp.entities)) {
    const ids = transitionsOf(e).map((t) => t.id);
    for (const t of sorted(new Set(ids))) if (count(ids, t) > 1) L.err("L10", `duplicate transition ${name}.${t}`);
  }
  lintIdGrammar(L, bp);

  // L1 references
  for (const [sid, { step: s }] of steps) {
    for (const m of asList(s.models)) if (!models.has(m)) L.err("L1", `step ${sid}: unknown model ${m}`);
    for (const p of asList(s.prompts)) if (!has(bp.prompts, p)) L.err("L1", `step ${sid}: unknown prompt ${p}`);
    for (const d of asList(s.div)) if (!divs.has(d)) L.err("L1", `step ${sid}: unknown divergence ${d}`);
    for (const c of asList(s.detail?.calls)) if (!has(bp.calls, c)) L.err("L1", `step ${sid}: unknown call ${c}`);
  }
  const modelKeys = new Set<unknown>(models.keys());
  for (const [cid, c] of Object.entries(bp.calls)) {
    if (!modelKeys.has(c.model)) L.err("L1", py`call ${cid}: unknown model ${c.model}`);
    if (truthy(c.prompt) && !has(bp.prompts, c.prompt)) L.err("L1", py`call ${cid}: unknown prompt ${c.prompt}`);
  }
  for (const [pid, p] of Object.entries(bp.prompts)) {
    if (!modelKeys.has(p.model)) L.err("L1", py`prompt ${pid}: unknown model ${p.model}`);
  }
  for (const [cid, c] of Object.entries(bp.contracts)) {
    if (!steps.has(cid)) L.err("L1", `contract for unknown step ${cid}`);
    for (const k of asList(c.params)) {
      if (!has(meta.params ?? {}, k)) L.err("L1", `contract ${cid}: param '${k}' is not in meta.params`);
    }
  }
  for (const [k, { t }] of trans) {
    for (const w of asList(t.with)) if (!trans.has(w)) L.err("L1", `${k}: with ${w} is not a transition`);
    for (const st of asList(t.step)) if (st !== "*" && !steps.has(st)) L.err("L1", `${k}: unknown step ${st}`);
  }
  // A sequence message runs between actors of its own seq: the agent view draws journeys' seqs, the human view all.
  const seqs = [
    ...bp.journeys.map((j) => ({ where: `journey ${j.id}`, seq: j.seq })),
    ...bp.notes.map((n, i) => ({ where: truthy(n.id) ? `note ${pyStr(n.id)}` : `notes[${i}]`, seq: n.seq })),
  ];
  for (const { where, seq } of seqs) {
    if (!seq) continue;
    const actorIds = new Set(seq.actors.map((a) => a.id));
    seq.msgs.forEach((m, i) => {
      for (const end of dedupe([m.from, m.to])) {
        if (!actorIds.has(end)) L.err("L1", `${where} seq: message ${i + 1} (${m.from} → ${m.to}): '${end}' is not one of its actors`);
      }
    });
  }

  const carriers = carriersIndex(trans);

  // L2 graphs · L13 failures · L17 fields · L18 waiting states · L19 previous · L20 creation
  for (const [name, e] of Object.entries(bp.entities)) lintEntity(L, name, e, trans, eps, carriers);

  // step contracts: L3–L8, L16
  for (const [sid, { step: s }] of steps) {
    const c = s.contract;
    if (!c || !truthy(c)) {
      L.warn("L6", `step ${sid}: no contract`);
      continue;
    }
    const ext = new Set(asList(s.models).filter((m) => external.has(m)));
    const ctrans = asList(c.transitions);
    for (const tr of ctrans) if (!trans.has(tr)) L.err("L1", `contract ${sid}: unknown transition ${tr}`);
    const [ekey, ep, here] = contractEndpoint(c, eps);
    if (typeof c.endpoint === "string" && !ep) {
      L.err("L16", `contract ${sid}: endpoint '${c.endpoint}' is not declared in full anywhere`);
    }
    if (ctrans.length) {
      for (const f of ["trigger", "actor", "delivery"] as const) {
        if (!truthy(c[f])) L.err("L6", `contract ${sid}: transitions need '${f}'`);
      }
      if (pyStr(get(c, "trigger", "")).startsWith("ui:") && !truthy(ekey)) {
        L.err("L6", `contract ${sid}: a ui-triggered step with transitions needs an endpoint`);
      }
    }
    const alsoItems = asList(c.also);
    for (const a of [...asList(c.actor), ...alsoItems.filter(isRecord).flatMap((al) => asList(al.actor))]) {
      if (!actors.has(a)) L.err("L6", `contract ${sid}: actor '${a}' is not in meta.actors`);
    }
    // The step's flag, and the flag an `also` endpoint names for itself (null: open whatever the step's flag).
    const stepFlags = [c.flag, ...alsoItems.map((a) => a.flag)];
    for (const fl of stepFlags) {
      if (fl === null || fl === undefined) continue;
      const flag = get(flags, fl);
      if (!(isRecord(flag) && truthy(flag.off))) {
        L.err("L6", `contract ${sid}: flag '${fl}' needs meta.flags.${fl}.off — what happens to work in flight when it is `
          + "switched off");
      }
    }
    if (truthy(c.delivery) && !DELIVERY_SET.has(c.delivery)) {
      L.err("L5", `contract ${sid}: delivery must be one of ${pyRepr(sorted(DELIVERY))}`);
    }
    const extSlow = [...ext].filter((m) => slow.has(m));
    if (c.delivery === "sync" && extSlow.length) {
      L.err("L5", `contract ${sid}: calls ${pyRepr(sorted(extSlow))} — delivery cannot be sync`);
    }
    // L16 endpoints declared here
    const decls: [unknown, Record<string, unknown>][] = [
      ...(here && isRecord(c.endpoint) ? [[null, c.endpoint] as [unknown, Record<string, unknown>]] : []),
      ...alsoItems.filter(isRecord).map((a) => [a.id, a] as [unknown, Record<string, unknown>]),
    ];
    for (const a of alsoItems) {
      if (!isRecord(a)) L.err("L16", py`contract ${sid}: also '${a}' must be an endpoint object with id, method, path, purpose, …`);
    }
    const alsoIds = alsoItems.filter(isRecord).map((a) => a.id);
    for (const aid of [...new Set(alsoIds)].sort(byStr)) {
      if (aid === null || aid === undefined) L.err("L16", `contract ${sid}: every also endpoint needs an id`);
      else if (count(alsoIds, aid) > 1) L.err("L10", `contract ${sid}: duplicate also id ${aid}`);
    }
    for (const [aid, e] of decls) {
      const where = `contract ${sid}` + (truthy(aid) ? py` also ${aid}` : " endpoint");
      if (!truthy(e.method) || !truthy(e.path)) L.err("L16", `${where}: needs method and path`);
      if (aid !== null && aid !== undefined && !truthy(e.purpose)) {
        L.err("L16", `${where}: needs purpose — what the person or system uses it for`);
      }
      if (!truthy(e.responses)) L.err("L16", `${where}: ${epKey(e)} has no responses`);
      if (!has(e, "errors")) L.err("L16", `${where}: ${epKey(e)} has no errors — write errors: {} when there are none`);
      if (!BODYLESS.has(e.method) && !truthy(e.request)) L.err("L16", `${where}: ${epKey(e)} has no request`);
      if (truthy(e.price) && !truthy(e.idempotency)) L.err("L4", `${where}: a paid endpoint needs idempotency: true`);
      for (const [code, text] of Object.entries(isRecord(e.errors) ? e.errors : {})) {
        for (const part of pyStr(text).split(";")) {
          if (!part.includes("«")) {
            const quoted = [...strip(part)].slice(0, QUOTE_LENGTH).join("");
            L.err("L16", `${where}: error ${code} '${quoted}' has no «words the person sees»`);
          }
        }
      }
    }
    const paid = Boolean(ep && truthy(ep.price));
    for (const tr of ctrans) {
      const hit = trans.get(tr);
      if (!hit) continue;
      const { t } = hit;
      if (truthy(t.local)) continue;
      const fails = asList(t.failures);
      if (ext.size && !(fails.length && fails.every((f) => truthy(f.retry)))) {
        L.err("L3", `${tr} (step ${sid} calls ${pyRepr(sorted(ext))}): needs failures[] with class, detect, to, says and `
          + "retry — or local: true");
      }
      if (paid) {
        for (const f of fails) {
          if (!truthy(f.compensation)) L.err("L4", py`${tr} (paid step ${sid}): failure '${f.class}' needs a compensation`);
        }
      }
    }
    // L7
    asList(c.ui?.disabled_when).forEach((d, i) => {
      const which = truthy(d.when) ? py`'${d.when}'` : `[${i}]`;
      if (!truthy(d.when)) L.err("L7", `contract ${sid}: disabled_when ${which} has no 'when' — the condition that disables it`);
      if (!truthy(d.says)) L.err("L7", `contract ${sid}: disabled_when ${which} has no 'says'`);
    });
    // L8 fixtures
    const fixtures = asList(c.fixtures);
    const names = fixtures.map((fx) => fx.name);
    for (const fx of fixtures) {
      const fname = fx.name;
      for (const k of ["name", "entity", "via", "mode"] as const) {
        if (!truthy(fx[k])) L.err("L8", py`contract ${sid}: fixture '${fname}' needs '${k}'`);
      }
      if (truthy(fname) && count(names, fname) > 1) L.err("L10", py`contract ${sid}: duplicate fixture name ${fname}`);
      if (truthy(fx.mode) && !FIXTURE_MODE_SET.has(fx.mode)) {
        L.err("L8", py`contract ${sid}: fixture '${fname}' mode must be one of ${sorted(FIXTURE_MODES)}`);
      }
      const ename = fx.entity;
      if (!has(bp.entities, ename)) {
        L.err("L8", py`contract ${sid}: fixture '${fname}' entity '${ename}' unknown`);
        continue;
      }
      const e = bp.entities[ename as string] as Entity;
      const field = e.field;
      const fields = e.fields ?? {};
      for (const side of ["before", "after"] as const) {
        const obj = fx[side];
        if (obj === null || obj === undefined) continue;
        const missing = asList(e.required).filter((k) => !has(obj, k));
        if (missing.length) L.err("L8", py`contract ${sid}: fixture '${fname}'.${side} misses ${missing}`);
        if (truthy(fields)) {
          for (const k of Object.keys(obj)) {
            if (!has(fields, k)) L.err("L8", py`contract ${sid}: fixture '${fname}'.${side}.${k} is not a field of ${ename}`);
          }
        }
      }
      const via = asList(fx.via);
      for (const tr of via) if (!trans.has(tr)) L.err("L8", py`contract ${sid}: fixture '${fname}' via ${tr} unknown`);
      const own = via.flatMap((tr) => {
        const hit = trans.get(tr);
        return hit && hit.name === ename ? [hit.t] : [];
      });
      for (let i = 0; i + 1 < own.length; i++) {
        const [a, b] = [own[i] as Transition, own[i + 1] as Transition];
        const lands = new Set<string>(a.to === "same" ? asList(a.from) : [a.to]);
        if (a.to !== "previous" && !asList(b.from).some((fr) => lands.has(fr))) {
          L.err("L8", `contract ${sid}: fixture '${pyStr(fname)}' via ${a.id} → ${b.id}: ${pyRepr(sorted(lands))} is not `
            + `a from-state of ${b.id}`);
        }
      }
      const last = own.at(-1);
      if (last && isRecord(fx.after)) {
        const after = fx.after;
        const applied = truthy(fx.failure) ? own.slice(0, -1) : own;
        const must = new Set(applied.flatMap((t) => keysOf(t.writes)));
        if (applied.some((t) => truthy(t.saves_previous))) must.add(py`prev_${field}`);
        for (const k of sorted([...must].filter((k) => !has(after, k)))) {
          L.err("L8", py`contract ${sid}: fixture '${fname}'.after misses '${k}', which its via transitions write`);
        }
        if (fx.mode === "snapshot") {
          const computed = (v: unknown) => COMPUTED_PREFIXES.some((p) => pyStr(v).startsWith(p));
          const row = new Set([
            ...asList(e.required), ...Object.entries(fields).filter(([, v]) => !computed(v)).map(([k]) => k),
          ]);
          for (const k of sorted([...row].filter((k) => !must.has(k) && !has(after, k)))) {
            L.err("L8", py`contract ${sid}: snapshot fixture '${fname}'.after misses '${k}' — a snapshot holds the whole row`);
          }
        }
      }
      if (last && truthy(fx.after) && truthy(field)) {
        // walk the via transitions from `before`: `same` keeps the state reached so far; a saves_previous transition
        // remembers the state it leaves, and `previous` lands there — on before.prev_<field> until one does
        const before = truthy(fx.before) ? fx.before : {};
        let state = get(before, field as string);
        let prev = get(before, py`prev_${field}`);
        const land = (target: unknown, cur: unknown) => (target === "same" ? cur : target === "previous" ? prev : target);
        for (const t of own.slice(0, -1)) {
          if (truthy(t.saves_previous)) prev = state;
          state = land(t.to, state);
        }
        if (truthy(last.saves_previous)) prev = state;
        let want = land(last.to, state);
        if (truthy(fx.failure)) {
          const match = asList(last.failures).filter((f) => f.class === fx.failure);
          if (!match[0]) {
            L.err("L8", py`contract ${sid}: fixture '${fname}' failure '${fx.failure}' is not a failure of ${via.at(-1)}`);
            continue;
          }
          want = land(match[0].to, state);
        }
        const got = get(fx.after, field as string);
        if (!pyEq(got, want)) L.err("L8", py`contract ${sid}: fixture '${fname}'.after.${field}='${got}' ≠ '${want}'`);
      }
      const first = own[0];
      if (first && truthy(fx.before) && truthy(field)) {
        const frs = asList(first.from);
        const got = get(fx.before, field as string);
        if (!frs.some((fr) => pyEq(fr, got))) {
          L.err("L8", py`contract ${sid}: fixture '${fname}'.before.${field}='${got}' ∉ ${frs}`);
        }
      }
    }
    if (ctrans.length && !truthy(c.fixtures)) L.warn("L8", `contract ${sid}: transitions without a fixture`);
  }

  // L11 every transition names what fires it · L12 no double firing · L14 inbound
  const inbound = new Set<string>();
  const params = new Set<unknown>(keysOf(meta.params));
  for (const [sid, { step: s }] of steps) {
    for (const ib of asList(s.contract?.inbound)) {
      inbound.add(epKey(ib));
      for (const k of ["id", "auth", "payload", "dedupe", "answer"] as const) {
        if (!truthy(ib[k])) L.err("L14", `contract ${sid}: inbound ${epKey(ib)} has no '${k}'`);
      }
    }
  }
  const seenFire = new Map<string, string>();
  for (const [name, e] of Object.entries(bp.entities)) {
    for (const t of transitionsOf(e)) {
      const key = `${name}.${t.id}`;
      const fbs = asList(t.fired_by);
      if (!fbs.length) {
        L.err("L11", `${key}: no fired_by {kind, ref}`);
        continue;
      }
      if (t.step === "*") continue; // cross-cutting: described, not wired to one step
      for (const fb of fbs) {
        const kind = fb.kind;
        const ref = pyStr(get(fb, "ref", ""));
        if (!FIRE_KIND_SET.has(kind)) L.err("L11", py`${key}: fired_by.kind '${kind}' — one of ${sorted(FIRE_KINDS)}`);
        else if (kind === "endpoint" && !eps.has(ref)) L.err("L11", `${key}: fired_by endpoint '${ref}' is not declared in any contract`);
        else if (kind === "callback" && !inbound.has(ref)) L.err("L11", `${key}: fired_by callback '${ref}' is not declared as inbound`);
        else if (kind === "event" && !eventsEmitted.has(ref)) {
          L.err("L11", `${key}: fired_by event '${ref}' is not emitted by any transition nor declared external`);
        } else if ((kind === "timer" || kind === "poll") && !params.has(ref.replaceAll("param:", ""))) {
          L.err("L11", `${key}: fired_by ${kind} '${ref}' is not a declared param`);
        }
        for (const fr of asList(t.from)) {
          // A tuple key: JSON keeps a missing kind (None) apart from "None", and an absent guard ("") apart from null.
          const sig = JSON.stringify([name, fr, kind ?? null, ref, get(t, "guard", "") ?? null]);
          const prior = seenFire.get(sig);
          if (prior !== undefined && fr !== CREATION) {
            L.err("L12", `${key} and ${prior}: same source state, same trigger, same guard — double firing`);
          }
          seenFire.set(sig, key);
        }
      }
    }
  }

  // L9 prompt variables: every {{var}} is declared; vars inside a {{#section}} belong to that section
  for (const [pid, p] of Object.entries(bp.prompts)) {
    const declared = new Set<string>();
    for (const v of asList(p.vars)) {
      for (let part of pyStr(v[0]).split("/")) {
        part = strip(strip(part).replace(/…+$/u, ""));
        if (part) declared.add(part);
      }
    }
    const known = (name: string) => declared.has(name)
      || [...declared].some((d) => d.endsWith(".*") && name.startsWith(d.slice(0, -1)))
      || [...declared].some((d) => name.startsWith(d + "."));
    for (const fld of ["system", "user"] as const) {
      const openSections: string[] = [];
      const source = p[fld];
      for (const [, mark = "", name = ""] of (truthy(source) ? pyStr(source) : "").matchAll(PROMPT_TOKEN)) {
        if (mark === "#") {
          openSections.push(name);
          if (!known(name)) L.err("L9", `prompt ${pid}: section {{#${name}}} is not declared in vars`);
        } else if (mark === "/") {
          if (openSections.length && openSections.at(-1) === name) openSections.pop();
        } else if (!openSections.length && !known(name)) {
          L.err("L9", `prompt ${pid}: {{${name}}} is not declared in vars`);
        }
      }
    }
  }

  // L21 `with` links. X carries Y: they commit in one transaction when X fires, so Y fires on X's trigger — never
  // after a commit of the other, which is what firing on its event means.
  for (const [xKey, { t: x }] of trans) {
    for (const yKey of dedupe(asList(x.with))) {
      const y = trans.get(yKey)?.t;
      if (!y) continue;
      if (!asList(y.fired_by).some((fb) => firesOn(x, fb))) {
        L.err("L21", `${yKey}: names none of the triggers of ${xKey}, the transition that carries it`);
      }
      const yEmits = new Set<unknown>(allEventsOf(y));
      for (const ev of firingEvents(x).filter((ev) => yEmits.has(ev))) {
        L.err("L21", py`${xKey}: waits for ${yKey}'s event ${ev} yet commits with ${yKey}; fire ${xKey} on that event `
          + "without `with`, or fire both on the same trigger");
      }
      const xEmits = new Set<unknown>(allEventsOf(x));
      const others = (carriers.get(yKey) ?? []).filter((c) => c.key !== xKey);
      for (const ev of firingEvents(y).filter((ev) => xEmits.has(ev))) {
        if (others.some((c) => firesOn(c.t, { kind: "event", ref: ev }))) continue;
        L.err("L21", py`${yKey}: waits for ${xKey}'s event ${ev} yet commits with ${xKey}, the transition that carries it; `
          + py`drop ${ev} from its fired_by, or let a transition fired by ${ev} carry it`);
      }
    }
  }
  return L;
}

/** L10 id grammar: an id that becomes a file name or a test token cannot carry a path or break the token. A missing id
 * is its own rule's finding (L8, L14, L16). */
function lintIdGrammar(L: Lint, bp: Blueprint): void {
  const plain = (what: string, id: unknown) => {
    if (typeof id === "string" && !PLAIN_ID.test(id)) {
      L.err("L10", `${what} ${pyRepr(id)}: an id is ${PLAIN_ID_TEXT} — it becomes a file name or a BP:/SM: test token`);
    }
  };
  const file = (what: string, id: string) => {
    if (!FILE_ID.test(id) || id.includes("..")) L.err("L10", `${what} ${pyRepr(id)}: an id is ${FILE_ID_TEXT} — it becomes a file name`);
  };
  for (const j of bp.journeys) for (const s of j.steps) plain("step", s.id);
  for (const [name, e] of Object.entries(bp.entities)) {
    plain("entity", name);
    for (const t of transitionsOf(e)) plain(`entity ${name}: transition`, t.id);
  }
  for (const [sid, c] of Object.entries(bp.contracts)) {
    for (const a of asList(c.also)) if (isRecord(a)) plain(`contract ${sid}: also`, a.id);
    for (const ib of asList(c.inbound)) if (isRecord(ib)) plain(`contract ${sid}: inbound`, ib.id);
    for (const fx of asList(c.fixtures)) if (isRecord(fx)) plain(`contract ${sid}: fixture`, fx.name);
  }
  for (const cid of Object.keys(bp.calls)) file("call", cid);
  for (const pid of Object.keys(bp.prompts)) file("prompt", pid);
}

/** L2, L13, L17, L18, L19 and L20 for one entity. */
function lintEntity(
  L: Lint, name: string, e: Entity, trans: Map<string, LocatedTransition>, eps: Map<string, unknown>,
  carriers: Map<string, Carrier[]>,
): void {
  const states = new Set<unknown>(keysOf(e.states));
  const ts = transitionsOf(e);
  const field = e.field;
  const fields = e.fields ?? {};
  const initial = e.initial;
  if (!states.has(initial)) L.err("L2", py`entity ${name}: initial '${initial}' is not a state`);
  for (const t of ts) {
    const key = `${name}.${t.id}`;
    for (const fr of asList(t.from)) {
      if (fr !== CREATION && !states.has(fr)) L.err("L2", `${key}: from '${fr}' is not a state`);
    }
    if (!states.has(t.to) && !SPECIAL_TO.has(t.to)) L.err("L2", `${key}: to '${t.to}' is not a state`);
    for (const f of asList(t.failures)) {
      const cls = f.class;
      if (!states.has(f.to) && !SPECIAL_TO.has(f.to)) L.err("L2", py`${key}: failure '${cls}' → '${f.to}' is not a state`);
      if (!FAIL_CLASS_SET.has(cls)) L.err("L13", py`${key}: failure class '${cls}' — one of ${sorted(FAIL_CLASSES)}`);
      if (!truthy(f.says)) L.err("L13", py`${key}: failure '${cls}' has no 'says'`);
      if (cls !== "any" && !truthy(f.detect)) L.err("L13", py`${key}: failure '${cls}' has no 'detect' — how the code recognises it`);
      const r = f.retry;
      if (truthy(r) && !RETRY_SET.has(r)) L.err("L13", py`${key}: failure '${cls}' retry must be one of ${sorted(RETRY)}`);
      const attempts = f.attempts;
      // typeof: a boolean is not a number of attempts (Python's isinstance(True, int) let it through)
      const countable = typeof attempts === "number" && Number.isInteger(attempts) && attempts >= 1;
      if (r === "worker" && !countable) {
        L.err("L13", py`${key}: failure '${cls}' retry: worker needs attempts (an integer ≥ 1)`);
      } else if (attempts !== null && attempts !== undefined && !countable) {
        L.err("L13", py`${key}: failure '${cls}' attempts must be an integer ≥ 1, not ${attempts}`);
      }
      const via = retryVia(f, t);
      if (r === "user" && !via.length) {
        L.err("L13", py`${key}: failure '${cls}' retry: user needs retry_via — the endpoint the retry calls`);
      }
      for (const v of via) {
        if (!eps.has(v)) L.err("L13", py`${key}: failure '${cls}' retry_via '${v}' is not a declared endpoint`);
      }
    }
    if (truthy(t.compensation) && !truthy(t.says)) {
      L.err("L13", `${key}: gives something back (compensation) — say what the person sees: says`);
    }
  }
  // L2 reachability
  const reach = reachable(initial, ts);
  for (const st of sorted(keysOf(e.states).filter((s) => !reach.has(s)))) {
    L.err("L2", py`entity ${name}: state '${st}' is unreachable from '${initial}'`);
  }
  const leaves = (st: unknown) => ts.some((t) => (asList(t.from) as unknown[]).includes(st));
  const terminal = new Set<unknown>(asList(e.terminal));
  for (const st of sorted(new Set(asList(e.terminal)))) {
    if (!states.has(st)) L.err("L2", `entity ${name}: terminal '${st}' is not a state`);
    else if (leaves(st)) L.err("L2", `entity ${name}: terminal state '${st}' has an outgoing transition — it is not terminal`);
  }
  for (const st of sorted(keysOf(e.states).filter((s) => !terminal.has(s)))) {
    if (!leaves(st)) L.err("L2", `entity ${name}: state '${st}' has no outgoing transition — mark it terminal or add one`);
  }
  // L17 fields
  if (!truthy(fields)) {
    L.err("L17", `entity ${name}: no fields — declare the columns the flow reads or writes`);
  } else {
    for (const f of [field, ...asList(e.required)]) {
      if (!has(fields, f)) L.err("L17", py`entity ${name}: '${f}' is not in fields`);
    }
    if (usesPrevious(e) && !has(fields, py`prev_${field}`)) {
      L.err("L17", py`entity ${name}: uses 'previous' — declare 'prev_${field}' in fields`);
    }
    for (const t of ts) {
      for (const k of [...keysOf(t.writes), ...keysOf(t.may_write)]) {
        if (!has(fields, k)) L.err("L17", `${name}.${t.id}: writes '${k}', which is not in fields`);
      }
    }
    const timed = ts.filter((t) => asList(t.fired_by).some((fb) => fb.kind === "timer"));
    if (timed.length && !has(fields, py`${field}_at`)) {
      L.err("L17", py`entity ${name}: timers (${timed.map((t) => t.id).join(", ")}) count from entering a state — `
        + py`declare '${field}_at' in fields`);
    }
  }
  for (const t of ts) {
    if (!(asList(t.from) as unknown[]).includes(CREATION)) continue;
    if (!truthy(t.unique)) {
      L.err("L20", `${name}.${t.id}: creates the entity — name \`unique\`, the key under which a second creation is a no-op`);
    }
    if (asList(t.failures).length) {
      L.err("L20", `${name}.${t.id}: creates the entity and has failures — create the row first (\`local\`), and do the `
        + "external work on a transition from the created state, so every failure, late answer and retry has a row to land on");
    }
  }
  // L18 waiting states
  const waiting = asList(e.waiting);
  for (const st of waiting) {
    if (!states.has(st)) {
      L.err("L18", `entity ${name}: waiting '${st}' is not a state`);
      continue;
    }
    let timedOut = false;
    for (const t of ts) {
      if (!asList(t.from).includes(st)) continue;
      const kinds: unknown[] = asList(t.fired_by).map((fb) => fb.kind);
      for (const w of asList(t.with)) {
        const hit = trans.get(w);
        if (hit) kinds.push(...asList(hit.t.fired_by).map((fb) => fb.kind));
      }
      if (t.to !== "same" && t.to !== st && kinds.includes("timer")) timedOut = true;
      if (asList(t.failures).some((f) => f.class === "timeout" && f.to !== "same" && f.to !== st)) timedOut = true;
    }
    if (!timedOut) {
      L.err("L18", `entity ${name}: waiting state '${st}' has no deadline — add a timer-fired exit (or one \`with\` a `
        + "timer-fired transition) or a timeout failure that leaves it");
    }
  }
  for (const t of ts) {
    // A callback shared with a transition that carries this one is the carrier's: the carrier waits, not this one.
    const carriedBy = carriers.get(`${name}.${t.id}`) ?? [];
    const ownCallbacks = asList(t.fired_by).filter((fb) => fb.kind === "callback" && !carriedBy.some((c) => firesOn(c.t, fb)));
    if (!truthy(t.late) && ownCallbacks.length) {
      for (const fr of asList(t.from)) {
        if (fr !== CREATION && !waiting.includes(fr)) L.warn("L18", `${name}.${t.id}: '${fr}' is left by a callback — declare it in waiting`);
      }
    }
  }
  // L19 previous
  if (usesPrevious(e)) {
    if (!ts.some((t) => truthy(t.saves_previous))) {
      L.err("L19", `entity ${name}: uses 'previous' but no transition has saves_previous: true`);
    }
    const plain = reachable(initial, ts.filter((t) => !truthy(t.saves_previous)));
    for (const t of ts) {
      if (t.to === "previous" || asList(t.failures).some((f) => f.to === "previous")) {
        for (const fr of asList(t.from)) {
          if (plain.has(fr)) {
            L.err("L19", `${name}.${t.id}: returns to 'previous' from '${fr}', which is reachable without a `
              + "saves_previous transition — previous would be stale");
          }
        }
      }
    }
  }
}
