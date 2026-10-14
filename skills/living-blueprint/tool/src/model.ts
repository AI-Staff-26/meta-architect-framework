import type {
  Also, Call, Contract, Divergence, Endpoint, Entity, Failure, Journey, Lane, Meta, Model, Note, Prompt, Step, Transition,
} from "./schema.ts";
import { asList, dedupe, get, isRecord, py, pyStr, sorted, truthy } from "./py.ts";

export const SCHEMA_VERSION = "1.2";
export const GENERATOR = "living-blueprint 1.2.0";

/** Creation: a transition from "∅" creates the entity. */
export const CREATION = "∅";
/** Transition targets that are not states. */
export const SPECIAL_TO: ReadonlySet<unknown> = new Set(["same", "previous"]);
export const BODYLESS: ReadonlySet<unknown> = new Set(["GET", "HEAD", "DELETE"]);

/** A contract after load: its transitions and events are derived from the transitions' `step` field. */
export type LoadedContract = Contract & { transitions: string[]; events: string[] };
export type LoadedStep = Step & { contract?: LoadedContract };
export type LoadedJourney = Omit<Journey, "steps"> & { steps: LoadedStep[] };

export interface BuildStats {
  errors: number;
  warnings: number;
  steps_locked: number;
  transitions_locked: number;
  endpoints: number;
  events: number;
}

/** The merged data — the human view embeds it whole, so it holds nothing else. */
export interface Blueprint {
  config: { brand: unknown };
  meta: Meta;
  lanes: Lane[];
  models: Model[];
  entities: Record<string, Entity>;
  contracts: Record<string, LoadedContract>;
  journeys: LoadedJourney[];
  calls: Record<string, Call>;
  prompts: Record<string, Prompt>;
  divergences: Divergence[];
  notes: Note[];
  build?: BuildStats;
}

/** Either kind of declared endpoint. */
export type AnyEndpoint = Endpoint | Also;

export interface LocatedStep {
  journey: LoadedJourney;
  step: LoadedStep;
}

export interface LocatedTransition {
  name: string;
  entity: Entity;
  t: Transition;
}

export interface DeclaredEndpoint {
  step: string;
  id: string | null;
  ep: AnyEndpoint;
  actor: string[];
}

/** Receives L10 findings while the endpoint index is built; lint passes one, the agent view does not. */
export interface ErrorSink {
  err(rule: string, msg: string): void;
}

export function epKey(ep: { method?: unknown; path?: unknown }): string {
  return py`${ep.method} ${ep.path}`;
}

export function eventsOf(t: Transition): string[] {
  return asList(t.event);
}

/** The transition's own events and the events its failures emit. */
export function allEventsOf(t: Transition): string[] {
  return [...eventsOf(t), ...asList(t.failures).flatMap((f) => asList(f.event))];
}

export function transitionsOf(e: Entity): Transition[] {
  return e.transitions ?? [];
}

// A later duplicate replaces the value and keeps the first position, as a Python dict comprehension does; Map.set
// behaves the same.

export function stepIndex(bp: Blueprint): Map<string, LocatedStep> {
  const out = new Map<string, LocatedStep>();
  for (const journey of bp.journeys) for (const step of journey.steps) out.set(step.id, { journey, step });
  return out;
}

export function transitionIndex(bp: Blueprint): Map<string, LocatedTransition> {
  const out = new Map<string, LocatedTransition>();
  for (const [name, entity] of Object.entries(bp.entities)) {
    for (const t of transitionsOf(entity)) out.set(`${name}.${t.id}`, { name, entity, t });
  }
  return out;
}

/** "METHOD path" → where it is declared in full: a contract's endpoint or one of its `also` items. */
export function endpointIndex(bp: Blueprint, sink?: ErrorSink): Map<string, DeclaredEndpoint> {
  const out = new Map<string, DeclaredEndpoint>();
  for (const [sid, c] of Object.entries(bp.contracts)) {
    const decls: [string | null, AnyEndpoint][] = [];
    if (isRecord(c.endpoint)) decls.push([null, c.endpoint]);
    for (const a of asList(c.also)) if (isRecord(a)) decls.push([a.id ?? null, a]);
    for (const [aid, ep] of decls) {
      const k = epKey(ep);
      const seen = out.get(k);
      if (seen) {
        sink?.err("L10", `${k} is declared in full in ${seen.step} and in ${sid} — declare it once, `
          + `refer to it elsewhere as endpoint: "${k}"`);
        continue;
      }
      const own = asList(get(ep, "actor") as string | string[] | null | undefined);
      out.set(k, { step: sid, id: aid, ep, actor: own.length ? own : asList(c.actor) });
    }
  }
  return out;
}

/** The contract's endpoint as [key, declaration, declared-here]. */
export function contractEndpoint(
  c: Contract, eps: Map<string, DeclaredEndpoint>,
): [string | null, AnyEndpoint | null, boolean] {
  const ep = c.endpoint;
  if (isRecord(ep)) return [epKey(ep), ep, true];
  if (typeof ep === "string") return [ep, eps.get(ep)?.ep ?? null, false];
  return [null, null, false];
}

/** Endpoints the person repeats a failed action through: explicit, else — for retry: user — the endpoints that fire
 * the transition (the person repeats the same request). */
export function retryVia(f: Failure, t: Transition): string[] {
  if (truthy(f.retry_via)) return asList(f.retry_via).map(pyStr);
  if (f.retry === "user") {
    return asList(t.fired_by).filter((fb) => fb.kind === "endpoint").map((fb) => pyStr(fb.ref));
  }
  return [];
}

/** `with` is symmetric: a transition declared together with another is listed on both. */
export function withIndex(bp: Blueprint): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const add = (k: string, v: string) => out.set(k, [...(out.get(k) ?? []), v]);
  for (const [name, e] of Object.entries(bp.entities)) {
    for (const t of transitionsOf(e)) {
      const key = `${name}.${t.id}`;
      for (const w of asList(t.with)) {
        add(key, w);
        add(w, key);
      }
    }
  }
  return new Map([...out].map(([k, v]) => [k, dedupe(v)]));
}

export function usesPrevious(e: Entity): boolean {
  return transitionsOf(e).some((t) => t.to === "previous" || asList(t.failures).some((f) => f.to === "previous"));
}

export function previousCandidates(e: Entity): string[] {
  const states = transitionsOf(e)
    .filter((t) => truthy(t.saves_previous))
    .flatMap((t) => asList(t.from))
    .filter((fr) => fr !== CREATION);
  return sorted(new Set(states));
}
