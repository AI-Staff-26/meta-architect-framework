import { shortHash } from "./canon.ts";
import {
  allEventsOf, contractEndpoint, CREATION, endpointIndex, epKey, eventsOf, GENERATOR, previousCandidates, retryVia,
  SCHEMA_VERSION, transitionIndex, transitionsOf, usesPrevious, withIndex,
} from "./model.ts";
import type { AnyEndpoint, Blueprint } from "./model.ts";
import { asList, dedupe, fmt, get, has, isRecord, py, pyJson, pyStr, rstrip, sorted, strip, truthy } from "./py.ts";
import type { Dict } from "./py.ts";
import type { Call, Divergence, Entity, Failure, Prompt, Seq, Transition } from "./schema.ts";

// agent/: SPEC.md, STATE-MACHINES.md, ACCEPTANCE.md, blueprint-lock.json, fixtures/, calls/, prompts/. SCHEMA.md is
// copied by the caller.

/** A hole in the data that no lint rule checks: the build stops and says what it is. */
export class BuildError extends Error {}

export interface Lock {
  schema: string;
  version: unknown;
  steps: Record<string, unknown>;
  endpoints: Record<string, { step: string; id: unknown; hash: string }>;
  transitions: Record<string, unknown>;
  inbound: string[];
  events: string[];
  params: string[];
  flags: string[];
  prompts: Record<string, unknown>;
  ids?: string[];
}

export interface AgentView {
  /** Path relative to agent/ → text. */
  files: Map<string, string>;
  lock: Lock;
}

const JSON_INDENT = 2;
const NO_VERSION = "v0";
/** agent/calls/<id>.json: every field of the call, in this order. The implementer needs `params` (effort, max_tokens,
 * thinking), `when` and `failure` as much as the payloads. */
const CALL_FIELDS = [
  "step", "title", "model", "prompt", "when", "params", "latency", "cost", "failure", "request", "requestNote", "response",
] as const satisfies readonly (keyof Call)[];
/** Written even when the call leaves them out (as null), as every calls/ file always had them. */
const CALL_FIELDS_ALWAYS: ReadonlySet<string> = new Set(["step", "model", "prompt", "request", "response"]);
/** Divergence statuses still waiting for the owner. The data cites their ids, and the divergences tab is in the human
 * view only, so SPEC.md lists them under «Open questions». */
const OPEN_STATUSES: ReadonlySet<unknown> = new Set<Divergence["status"]>(["discuss", "design"]);

const code = (x: unknown) => py`\`${x}\``;
/** Text safe inside a Markdown table cell. */
const cell = (v: unknown) => pyStr(v).replaceAll("|", "\\|").replaceAll("\n", " ");
const codes = (xs: readonly unknown[]) => xs.map(code).join(", ");

function fireS(t: Transition): string {
  return asList(t.fired_by).map((f) => py`${f.kind} \`${f.ref}\``).join("; ") || "—";
}

/** The triggers of a transition as one step sees them: that step's own endpoints when it fires the transition through
 * them, otherwise the non-endpoint triggers; all of them when the filter would leave nothing. */
function stepFireS(t: Transition, stepEps: ReadonlySet<string>): string {
  const fbs = asList(t.fired_by);
  const mine = stepEps.size
    ? fbs.filter((fb) => fb.kind === "endpoint" && stepEps.has(pyStr(fb.ref)))
    : fbs.filter((fb) => fb.kind !== "endpoint");
  return (mine.length ? mine : fbs).map((fb) => py`${fb.kind} \`${fb.ref}\``).join(" or ") || "—";
}

function retryS(f: Failure, t: Transition): string {
  const r = f.retry;
  if (!truthy(r)) return "";
  let s = py`retry: ${r}`;
  if (r === "worker") s += py` ×${f.attempts}` + (truthy(f.backoff) ? py`, backoff ${f.backoff}` : "");
  const via = retryVia(f, t);
  if (via.length) {
    const where = via.map(code).join(" or ");
    s += r === "worker" ? `; then the person retries via ${where}` : ` via ${where}`;
  }
  if (truthy(f.retry_note)) s += py` (${f.retry_note})`;
  return s;
}

function failS(f: Failure, t: Transition): string {
  let s = py`\`${f.class}\` → \`${f.to}\` «${get(f, "says", "")}»`;
  if (truthy(f.detect)) s += py`; detect: ${f.detect}`;
  if (truthy(f.event)) s += "; event " + codes(asList(f.event));
  if (truthy(f.compensation)) s += py`; compensation: ${f.compensation}`;
  const r = retryS(f, t);
  return s + (r ? `; ${r}` : "");
}

function writesS(t: Transition): string {
  const pairs = (o: unknown) => Object.entries(isRecord(o) ? o : {}).map(([k, v]) => py`\`${k}\` = ${v}`).join(", ");
  const s = pairs(t.writes);
  const may = pairs(t.may_write);
  return s + (may ? (s ? "; " : "") + `may write ${may}` : "");
}

function transLine(key: string, name: string, t: Transition, wi: Map<string, string[]>): string {
  let line = py`- **transition ${key}:** \`${name}: ${asList(t.from).join("/")} → ${t.to}\``;
  if (eventsOf(t).length) line += " · event " + codes(eventsOf(t));
  line += ` · fired by ${fireS(t)}`;
  if (truthy(t.guard)) line += py`; guard: ${t.guard}`;
  if (truthy(t.saves_previous)) line += "; saves previous";
  if (truthy(t.unique)) line += py`; unique: ${t.unique}`;
  if (truthy(t.late)) line += "; late result";
  if (truthy(t.writes) || truthy(t.may_write)) line += truthy(t.writes) ? `; writes ${writesS(t)}` : `; ${writesS(t)}`;
  const linked = wi.get(key);
  if (linked?.length) {
    const own = asList(t.with);
    line += "; with " + linked.map((x) => (own.includes(x) ? `\`${x}\`` : `\`${x}\` (when \`${x}\` fires)`)).join(", ");
  }
  if (truthy(t.says)) line += py`; the person sees «${t.says}»`;
  if (truthy(t.compensation)) line += py`; compensation: ${t.compensation}`;
  if (truthy(t.local)) line += "; local";
  return line;
}

function epLines(e: AnyEndpoint, indent = "  "): string[] {
  const out: string[] = [];
  if (truthy(e.request)) out.push(py`${indent}- request: ${e.request}`);
  for (const [k, d] of Object.entries(e.responses ?? {})) out.push(py`${indent}- ${k}: ${d}`);
  for (const [k, d] of Object.entries(e.errors ?? {})) out.push(py`${indent}- error ${k}: ${d}`);
  return out;
}

function epHead(e: AnyEndpoint): string {
  return `\`${epKey(e)}\`` + (truthy(e.idempotency) ? " · Idempotency-Key" : "")
    + (truthy(e.price) ? py` · price \`${e.price}\`` : " · free");
}

/** Marks an edge that lands on `previous`: the diagram draws it to every state previous can be. */
const PREVIOUS_MARK = "↩ previous";

function mermaidState(e: Entity): string {
  const lines = ["stateDiagram-v2", py`    [*] --> ${e.initial}`];
  const previous = previousCandidates(e);
  for (const t of transitionsOf(e)) {
    for (const fr of asList(t.from)) {
      const src = fr === CREATION ? "[*]" : fr;
      if (src === "[*]" && t.to === e.initial) continue;
      const events = eventsOf(t).join(" ");
      if (t.to === "previous") {
        for (const dst of previous) lines.push(rstrip(`    ${src} --> ${dst}: ${t.id} ${PREVIOUS_MARK} ${events}`));
      } else {
        lines.push(rstrip(`    ${src} --> ${t.to === "same" ? fr : t.to}: ${t.id} ${events}`));
      }
      for (const f of asList(t.failures)) {
        if (f.to === "previous") {
          for (const dst of previous) lines.push(py`    ${src} --> ${dst}: ${t.id}✗ ${f.class} ${PREVIOUS_MARK}`);
          continue;
        }
        const odst = f.to === "same" ? fr : f.to;
        if (odst !== CREATION) lines.push(py`    ${src} --> ${odst}: ${t.id}✗ ${f.class}`);
      }
    }
  }
  for (const st of asList(e.terminal)) lines.push(`    ${st} --> [*]`);
  return lines.join("\n");
}

function mermaidSeq(seq: Seq): string {
  const alias = new Map<string, string>(seq.actors.map((a, i) => [a.id, `P${i}`]));
  const aliasOf = (id: string) => {
    const a = alias.get(id);
    if (a === undefined) throw new BuildError(`sequence diagram "${pyStr(seq.title)}": '${id}' is not one of its actors`);
    return a;
  };
  const lines = ["sequenceDiagram"];
  for (const a of seq.actors) lines.push(py`    participant ${aliasOf(a.id)} as ${a.label}`);
  for (const m of seq.msgs) {
    const arrow = truthy(m.dashed) ? "-->>" : "->>";
    lines.push(`    ${aliasOf(m.from)}${arrow}${aliasOf(m.to)}: ${m.text.replaceAll(";", ",")}`);
  }
  return lines.join("\n");
}

function promptMd(pid: string, p: Prompt, modelNames: Map<string, unknown>, usedBy: readonly string[]): string {
  const modelName = typeof p.model === "string" && modelNames.has(p.model) ? modelNames.get(p.model) : p.model;
  const out = [
    py`# ${get(p, "title", pid)} — \`${pid}\``, "",
    py`- **model:** ${modelName} (\`${p.model}\`); version ${get(p, "version", NO_VERSION)}; `
      + py`prompt language ${get(p, "lang", "ru")}; step \`${p.step}\``,
  ];
  if (usedBy.length) out.push("- **calls:** " + usedBy.map((c) => `\`${c}\` → \`../calls/${c}.json\``).join(", "));
  out.push("");
  if (truthy(p.purpose)) out.push(strip(pyStr(p.purpose)), "");
  for (const [k, title, lang] of [["system", "System", "text"], ["user", "User", "text"], ["output", "Output", "json"]] as const) {
    if (truthy(p[k])) out.push(`## ${title}`, "", "```" + lang, rstrip(pyStr(p[k])), "```", "");
  }
  if (truthy(p.vars)) {
    out.push("## Variables", "", "| variable | source |", "|---|---|");
    for (const v of p.vars ?? []) out.push(py`| \`{{${v[0]}}}\` | ${v[1]} |`);
    out.push("");
  }
  const ex = p.example;
  if (ex && truthy(ex)) {
    out.push("## Example (illustration, not a model run)", "");
    if (truthy(ex.note)) out.push(strip(pyStr(ex.note)), "");
    if (truthy(ex.input)) out.push("Input:", "", "```text", rstrip(pyStr(ex.input)), "```", "");
    if (truthy(ex.output)) out.push("Output:", "", "```json", rstrip(pyStr(ex.output)), "```", "");
  }
  if (truthy(p.notes)) out.push("## Notes", "", strip(pyStr(p.notes)), "");
  if (truthy(p.source)) out.push(py`*Source: ${p.source}*`, "");
  return out.join("\n");
}

export function agentView(bp: Blueprint): AgentView {
  const files = new Map<string, string>();
  const meta = bp.meta;
  const trans = transitionIndex(bp);
  const eps = endpointIndex(bp);
  const wi = withIndex(bp);
  const flags: Dict = meta.flags ?? {};
  const models = new Map<string, unknown>(bp.models.map((m) => [m.key, m.name]));
  const paramsAll: Dict = { ...(meta.params ?? {}) };
  const usedBy = new Map<string, string[]>();
  for (const [cid, c] of Object.entries(bp.calls)) {
    const body = Object.fromEntries(CALL_FIELDS.filter((k) => CALL_FIELDS_ALWAYS.has(k) || has(c, k)).map((k) => [k, c[k]]));
    files.set(`calls/${cid}.json`, pyJson(body, { indent: JSON_INDENT }));
    if (truthy(c.prompt)) usedBy.set(c.prompt as string, [...(usedBy.get(c.prompt as string) ?? []), cid]);
  }
  for (const [pid, p] of Object.entries(bp.prompts)) files.set(`prompts/${pid}.md`, promptMd(pid, p, models, usedBy.get(pid) ?? []));

  const out: string[] = [
    py`# ${get(meta, "title", "Blueprint")} — agent contract`, "",
    py`*Generated by \`${GENERATOR}\` from \`src/\` (blueprint ${meta.version}, ${meta.date}; schema ${SCHEMA_VERSION}). `
      + "Do not edit by hand. How to read it: `SCHEMA.md`. State machines: `STATE-MACHINES.md`. Fixtures: `fixtures/`, provider "
      + "payloads: `calls/`, prompts: `prompts/`. Tests carry the ids from `ACCEPTANCE.md`.*", "",
  ];
  if (truthy(meta.rules)) out.push("## Rules", "", ...asList(meta.rules).map((r) => py`- ${r}`), "");
  const open = bp.divergences.filter((d) => OPEN_STATUSES.has(d.status));
  if (open.length) {
    out.push("## Open questions", "", "| id | area | status | proposal |", "|---|---|---|---|");
    for (const d of open) out.push(`| \`${d.id}\` | ${cell(fmt(d.area))} | ${cell(d.status)} | ${cell(fmt(d.proposal))} |`);
    out.push("");
  }
  if (truthy(paramsAll)) {
    out.push("## Parameters", "", "| name | value | source | note |", "|---|---|---|---|");
    for (const [k, v] of Object.entries(paramsAll)) {
      out.push(`| \`${k}\` | ${cell(get(v, "value"))} | ${cell(get(v, "source", ""))} | ${cell(get(v, "note", ""))} |`);
    }
    out.push("");
  }
  if (truthy(flags)) {
    out.push("## Flags", "", "| flag | when switched off |", "|---|---|");
    for (const [k, v] of Object.entries(flags)) {
      out.push(`| \`${k}\` | ${cell(get(v, "off", ""))}` + (truthy(get(v, "note")) ? `; ${cell(get(v, "note"))}` : "") + " |");
    }
    out.push("");
  }
  const lock: Lock = {
    schema: SCHEMA_VERSION, version: meta.version, steps: {}, endpoints: {}, transitions: {}, inbound: [], events: [],
    params: sorted(Object.keys(paramsAll)), flags: sorted(Object.keys(flags)), prompts: {},
  };
  const ids: string[] = [];
  const acc: string[] = [
    "# Acceptance stubs", "",
    "Name real tests with these ids (pytest `test_bp_k3_happy` with the id in its docstring, Playwright "
      + "`test('BP:k3:happy …')`). `BP:<step>` — a step; `BP:<step>.<id>` — an extra endpoint or an inbound callback of the step; "
      + "`BP:<step>:<fixture>` — a fixture; `SM:<entity>.<id>` — a transition; `SM:<entity>.<id>:<class>` — its failure. "
      + "CI: every id in `blueprint-lock.json` → `ids` appears in at least one test; a changed `hash` must touch its test.", "",
  ];
  for (const j of bp.journeys) {
    out.push(py`## ${j.title}`, "");
    acc.push(py`## ${j.title}`, "");
    for (const s of j.steps) {
      const c = s.contract;
      out.push(py`### ${s.id} · ${s.title}`);
      if (!c || !truthy(c)) {
        out.push("", "_No contract: narrative-only step._", "");
        continue;
      }
      const [ekey, ep, here] = contractEndpoint(c, eps);
      out.push(`- **trigger:** ${fmt(c.trigger)} · **actor:** ${fmt(c.actor)}`);
      if (ep === null) out.push(`- **endpoint:** — · **delivery:** \`${fmt(c.delivery)}\``);
      else if (here) out.push(`- **endpoint:** ${epHead(ep)} · **delivery:** \`${fmt(c.delivery)}\``, ...epLines(ep));
      else out.push(`- **endpoint:** ${epHead(ep)}, declared in \`${eps.get(ekey as string)?.step}\` · **delivery:** \`${fmt(c.delivery)}\``);
      const also = asList(c.also);
      for (const a of also) {
        const own = asList(a.actor);
        const actor = own.length ? own : asList(c.actor);
        const gate = has(a, "flag") && a.flag === null ? " · flag none" : truthy(a.flag) ? py` · flag \`${a.flag}\`` : "";
        out.push(py`- **also \`${s.id}.${a.id}\`:** ${epHead(a)} — ${get(a, "purpose", "")} · actor ${fmt(actor)}${gate}`, ...epLines(a));
      }
      const inbound = asList(c.inbound);
      for (const ib of inbound) {
        out.push(py`- **inbound \`${s.id}.${ib.id}\`** \`${epKey(ib)}\` — auth: ${ib.auth}; payload: ${ib.payload}; `
          + py`dedupe: ${ib.dedupe}; we answer: ${ib.answer}`);
      }
      for (const k of asList(c.params)) {
        const v = truthy(get(paramsAll, k)) ? get(paramsAll, k) : {};
        out.push(py`- **param** \`${k}\` = ${get(v, "value")} (${get(v, "source", "")})`);
      }
      for (const tr of asList(c.transitions)) {
        const hit = trans.get(tr);
        if (!hit) continue;
        out.push(transLine(tr, hit.name, hit.t, wi), ...asList(hit.t.failures).map((f) => `  - failure ${failS(f, hit.t)}`));
      }
      if (truthy(c.events)) out.push(`- **events:** ${codes(c.events)}`);
      const calls: string[] = [];
      for (const cid of asList(s.detail?.calls)) {
        const cl = has(bp.calls, cid) ? bp.calls[cid] : undefined;
        if (!cl) continue;
        const pr = cl.prompt;
        const prompt = typeof pr === "string" && truthy(pr) ? bp.prompts[pr] : undefined;
        calls.push(py`\`${cid}\` (${models.has(cl.model as string) ? models.get(cl.model as string) : "?"}`
          + (prompt ? py`, prompt \`${pr}\` ${get(prompt, "version", NO_VERSION)} → \`prompts/${pr}.md\`` : "")
          + `) → \`calls/${cid}.json\``);
      }
      if (calls.length) out.push(`- **calls:** ${calls.join("; ")}`);
      const ui: Dict = c.ui ?? {};
      const uiStates = Object.entries(ui).filter(([k]) => k !== "disabled_when").map(([k, v]) => py`${k}: «${v}»`);
      if (uiStates.length) out.push(`- **ui:** ${uiStates.join("; ")}`);
      for (const d of asList(c.ui?.disabled_when)) out.push(py`- **disabled when** ${d.when} → «${d.says}»`);
      for (const f of ["journal", "budget"] as const) if (truthy(c[f])) out.push(`- **${f}:** ${fmt(c[f])}`);
      if (truthy(c.flag)) out.push(py`- **flag:** \`${c.flag}\` — off: ${get(get(flags, c.flag as string) || {}, "off", "—")}`);
      const fixtures = asList(c.fixtures);
      for (const fx of fixtures) {
        const fname = py`${s.id}.${fx.name}.json`;
        const body: Dict = { ...fx };
        const pr = fx.provider_response;
        if (truthy(pr) && has(bp.calls, pr)) body.provider_response = { call: pr, response: bp.calls[pr as string]?.response };
        files.set(`fixtures/${fname}`, pyJson(body, { indent: JSON_INDENT }));
        out.push(py`- **fixture** \`${fx.name}\`` + (truthy(fx.failure) ? py` (failure \`${fx.failure}\`)` : "") + `: \`fixtures/${fname}\``);
      }
      if (truthy(s.refs)) out.push(`- **refs:** ${(s.refs ?? []).join(", ")}`);
      out.push("");

      const h = shortHash({ contract: c, transitions: asList(c.transitions).flatMap((t) => trans.get(t)?.t ?? []) });
      lock.steps[s.id] = {
        hash: h, endpoint: ekey, also: also.map((a) => a.id), transitions: asList(c.transitions),
        events: asList(c.events), fixtures: fixtures.map((fx) => fx.name),
      };
      if (ep !== null && here && ekey !== null) lock.endpoints[ekey] = { step: s.id, id: null, hash: shortHash(ep) };
      for (const a of also) lock.endpoints[epKey(a)] = { step: s.id, id: a.id, hash: shortHash(a) };
      for (const ib of inbound) lock.inbound.push(epKey(ib));
      lock.events.push(...asList(c.events));

      const stepEps = new Set<string>([...(truthy(ekey) ? [ekey as string] : []), ...also.map(epKey)]);
      if (truthy(ekey) || truthy(c.also) || truthy(c.transitions) || truthy(c.inbound)) {
        ids.push(`BP:${s.id}`);
        acc.push(py`- [ ] \`BP:${s.id}\` — ${s.title}` + (truthy(ekey) ? ` · \`${ekey}\`` : "") + ` · hash \`${h}\``);
      } else {
        acc.push(py`- \`${s.id}\` — ${s.title}: narrative step, nothing to implement`);
      }
      for (const a of also) {
        ids.push(py`BP:${s.id}.${a.id}`);
        acc.push(py`- [ ] \`BP:${s.id}.${a.id}\` — \`${epKey(a)}\` — ${get(a, "purpose", "")} · hash \`${shortHash(a)}\``);
      }
      for (const ib of inbound) {
        ids.push(py`BP:${s.id}.${ib.id}`);
        acc.push(py`- [ ] \`BP:${s.id}.${ib.id}\` — inbound \`${epKey(ib)}\`: auth ${ib.auth}; dedupe ${ib.dedupe}; `
          + py`we answer ${ib.answer} · hash \`${shortHash(ib)}\``);
      }
      for (const fx of fixtures) {
        const via = asList(fx.via).filter((tr) => trans.has(tr));
        const viaT = (tr: string) => trans.get(tr) as { name: string; t: Transition };
        const when = via.map((tr) => stepFireS(viaT(tr).t, stepEps)).join(" → ") || fmt(c.trigger);
        ids.push(py`BP:${s.id}:${fx.name}`);
        const given = fx.before !== null && fx.before !== undefined ? pyJson(fx.before) : "nothing (creation)";
        const then = pyJson(fx.after);
        let stub = py`- [ ] \`BP:${s.id}:${fx.name}\` — **Given** ${fx.entity} ${given} **When** ${when}`;
        let failure: Failure | undefined;
        if (truthy(fx.failure)) {
          const own = via.filter((tr) => viaT(tr).name === fx.entity).map((tr) => viaT(tr).t);
          const last = own.at(-1);
          failure = last ? asList(last.failures).find((f) => f.class === fx.failure) : undefined;
          stub += py` and it fails with \`${fx.failure}\`` + (failure && truthy(failure.detect) ? py` (${failure.detect})` : "");
        }
        stub += py` **Then** ${fx.entity} ${then}`;
        if (failure && truthy(failure.compensation)) stub += py`, compensation: ${failure.compensation}`;
        if (!truthy(fx.failure)) {
          const causes = new Set(via.flatMap((tr) => asList(viaT(tr).t.fired_by))
            .filter((fb) => fb.kind === "event").map((fb) => pyStr(fb.ref)));
          // the links the via transitions declare themselves, not the mirrored ones
          const linked = via.flatMap((tr) => asList(viaT(tr).t.with)).filter((w) => trans.has(w));
          const evs = dedupe([
            ...via.flatMap((tr) => eventsOf(viaT(tr).t)),
            ...linked.flatMap((w) => eventsOf(viaT(w).t)).filter((ev) => !causes.has(ev)),
          ]);
          if (evs.length) stub += ` and events ${evs.join(", ")}`;
        }
        acc.push(stub);
      }
    }
    acc.push("");
    if (j.seq && truthy(j.seq)) out.push("```mermaid", mermaidSeq(j.seq), "```", "");
  }

  const sm: string[] = [
    "# State machines", "",
    "*Generated. `∅` — creation. `✗` — a failure path. `same` — stays in its state; `previous` — back to the state the "
      + "entity was in before the current activity, stored as `prev_<field>` by the transitions marked “saves previous”; "
      + `a diagram draws it as an edge marked \`${PREVIOUS_MARK}\` to each state it can be. `
      + "Every transition applies as a compare-and-set on its `from` state: a second firing finds the state already moved "
      + "and is a logged no-op.*", "",
  ];
  acc.push("## Transitions", "");
  for (const [name, e] of Object.entries(bp.entities)) {
    const terms = codes(asList(e.terminal)) || "—";
    const waits = codes(asList(e.waiting)) || "—";
    let hdr = py`Table \`${e.table}\`, field \`${e.field}\`; initial \`${e.initial}\`; terminal ${terms}; waiting ${waits}.`;
    if (usesPrevious(e)) {
      const savers = transitionsOf(e).filter((t) => truthy(t.saves_previous)).map((t) => t.id);
      hdr += py` \`previous\` ∈ {${previousCandidates(e).join(", ")}} — saved into \`prev_${e.field}\` by ${savers.join(", ")}.`;
    }
    sm.push(py`## ${name} — ${get(e, "title", "")}`, "", hdr, "");
    if (truthy(e.note)) sm.push(strip(pyStr(e.note)), "");
    if (truthy(e.fields)) {
      sm.push("| field | type and meaning |", "|---|---|", ...Object.entries(e.fields ?? {}).map(([k, v]) => `| \`${k}\` | ${cell(v)} |`), "");
    }
    sm.push("```mermaid", mermaidState(e), "```", "",
      "| id | from → to | step | fired by | event | guard | writes · with | failures |", "|---|---|---|---|---|---|---|---|");
    for (const t of transitionsOf(e)) {
      const key = `${name}.${t.id}`;
      const fails = asList(t.failures).map((f) => failS(f, t)).join("<br>") || (truthy(t.local) ? "local" : "—");
      const ownWith = asList(t.with);
      const linked = wi.get(key);
      const extra = [
        writesS(t),
        linked?.length ? "with " + linked.map((w) => (ownWith.includes(w) ? `\`${w}\`` : `\`${w}\` (when it fires)`)).join(", ") : "",
        truthy(t.saves_previous) ? "saves previous" : "",
        // As SPEC.md words them. A cross-cutting transition (step "*") has no step section, so this is its only place.
        truthy(t.unique) ? py`unique: ${t.unique}` : "",
        truthy(t.late) ? "late result" : "",
        truthy(t.says) ? py`says «${t.says}»` : "",
        truthy(t.compensation) ? py`compensation: ${t.compensation}` : "",
      ].filter((x) => x).join("; ") || "—";
      const events = eventsOf(t);
      sm.push(py`| ${t.id} | ${asList(t.from).join("/")} → ${t.to} | ${cell(fmt(t.step))} | ${cell(fireS(t))} | `
        + `${cell(fmt(events.length ? events : null))} | ${cell(fmt(t.guard))} | ${cell(extra)} | ${cell(fails)} |`);
      const th = shortHash(t);
      lock.transitions[key] = {
        hash: th, from: asList(t.from), to: t.to, fired_by: asList(t.fired_by), failures: asList(t.failures).map((f) => f.class),
      };
      let stub = py`- [ ] \`SM:${key}\` — **Given** ${name} in \`${asList(t.from).join("/")}\``
        + (truthy(t.guard) ? py` and ${t.guard}` : "") + py` **When** ${fireS(t)} **Then** \`${t.to}\``;
      if (events.length) stub += ", events " + codes(events);
      if (truthy(t.writes) || truthy(t.may_write)) stub += truthy(t.writes) ? `, writes ${writesS(t)}` : `, ${writesS(t)}`;
      if (truthy(t.says)) stub += py`, the person sees «${t.says}»`;
      if (truthy(t.compensation)) stub += py`, compensation: ${t.compensation}`;
      ids.push(`SM:${key}`);
      acc.push(stub + ` · hash \`${th}\``);
      for (const f of asList(t.failures)) {
        ids.push(py`SM:${key}:${f.class}`);
        acc.push(py`  - [ ] \`SM:${key}:${f.class}\` — **When** it fails with \`${f.class}\``
          + (truthy(f.detect) ? py` (${f.detect})` : "")
          + py` **Then** \`${f.to}\`, the person sees «${get(f, "says", "")}»`
          + (truthy(f.compensation) ? py`, compensation: ${f.compensation}` : "")
          + (truthy(f.retry) ? `, ${retryS(f, t)}` : ""));
      }
    }
    sm.push("");
  }
  lock.inbound = sorted(new Set(lock.inbound));
  lock.ids = sorted(new Set(ids));
  lock.events = sorted(new Set([
    ...lock.events, ...[...trans.values()].flatMap(({ t }) => allEventsOf(t)), ...asList(meta.external_events),
  ]));
  lock.prompts = Object.fromEntries(Object.entries(bp.prompts).map(([pid, p]) => [pid, get(p, "version", NO_VERSION)]));
  files.set("SPEC.md", out.join("\n"));
  files.set("STATE-MACHINES.md", sm.join("\n"));
  files.set("ACCEPTANCE.md", acc.join("\n"));
  files.set("blueprint-lock.json", pyJson(lock, { indent: JSON_INDENT }));
  return { files, lock };
}
