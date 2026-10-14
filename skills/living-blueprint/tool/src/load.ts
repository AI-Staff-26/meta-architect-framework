import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { z } from "zod";
import { allEventsOf, transitionsOf } from "./model.ts";
import { configPathProblems } from "./paths.ts";
import type { Blueprint, LoadedContract, LoadedJourney } from "./model.ts";
import { asList, dedupe, get, has, isRecord, pyRepr, sorted, truthy } from "./py.ts";
import { checkShape, Config, DataFile, pathText, PromptsFile } from "./schema.ts";
import type { ShapeIssue, Transition } from "./schema.ts";

export const CONFIG_FILE = "blueprint.config.yaml";

export interface Loaded {
  cfg: Config;
  bp: Blueprint;
  /** Findings of the load itself: L0 shape and unknown fields, L10 duplicate ids, YAML errors. */
  problems: string[];
  /** The data has a shape the lint cannot walk: report `problems` and stop. */
  shapeBroken: boolean;
}

interface SourceFile {
  name: string;
  data: unknown;
}

/** Strict YAML: the 1.2 core schema, a duplicate key is an error. */
function readYaml(path: string): unknown {
  return parse(readFileSync(path, "utf8"), { version: "1.2", schema: "core", uniqueKeys: true });
}

/** `sorted(dir.glob("*.yaml"))`; a missing directory holds no files. */
function yamlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return sorted(readdirSync(dir).filter((n) => n.endsWith(".yaml") && statSync(join(dir, n)).isFile()));
}

function emptyBlueprint(brand: unknown): Blueprint {
  return {
    config: { brand }, meta: {}, lanes: [], models: [], entities: {}, contracts: {}, journeys: [], calls: {},
    prompts: {}, divergences: [], notes: [],
  };
}

/** A contract lists neither transitions nor events: both are derived, and load() says so in its own words. */
function isDerivedKey(issue: ShapeIssue, key: string): boolean {
  return issue.path.length === 2 && issue.path[0] === "contracts" && (key === "transitions" || key === "events");
}

function describe(file: SourceFile, issue: ShapeIssue): string | null {
  const where = issue.path.length ? `${file.name} ${pathText(issue.path, file.data)}` : file.name;
  if (issue.kind === "shape") return `L0 ${where}: ${issue.message}`;
  const keys = issue.keys.filter((k) => !isDerivedKey(issue, k));
  return keys.length ? `L0 ${where}: unknown field(s) ${pyRepr(sorted(keys))}` : null;
}

export function load(root: string): Loaded {
  const problems: string[] = [];
  let shapeBroken = false;

  const parseFile = (dir: string, name: string): SourceFile | null => {
    try {
      // `yaml.safe_load(...) or {}`: an empty file is an empty mapping.
      const data = readYaml(join(dir, name));
      return { name, data: truthy(data) ? data : {} };
    } catch (e) {
      problems.push(`YAML ${name}: ${e instanceof Error ? e.message : String(e)}`);
      shapeBroken = true;
      return null;
    }
  };
  const validate = (file: SourceFile | null, schema: z.ZodType): void => {
    if (!file) return;
    for (const issue of checkShape(schema, file.data)) {
      const message = describe(file, issue);
      if (message) problems.push(message);
      if (issue.kind === "shape") shapeBroken = true;
    }
  };

  const cfgFile = existsSync(join(root, CONFIG_FILE)) ? parseFile(root, CONFIG_FILE) : { name: CONFIG_FILE, data: {} };
  validate(cfgFile, Config);
  const dataDir = join(root, "src", "data");
  const promptDir = join(root, "src", "prompts");
  const dataFiles = yamlFiles(dataDir).map((n) => parseFile(dataDir, n));
  const promptFiles = yamlFiles(promptDir).map((n) => parseFile(promptDir, n));
  dataFiles.forEach((f) => validate(f, DataFile));
  promptFiles.forEach((f) => validate(f, PromptsFile));

  if (shapeBroken || !cfgFile) {
    return { cfg: {}, bp: emptyBlueprint(""), problems, shapeBroken: true };
  }

  // The shape check passed, so every file has the type its schema infers.
  const cfg = cfgFile.data as Config;
  problems.push(...configPathProblems(root, cfg, CONFIG_FILE));
  const bp = emptyBlueprint(get(cfg, "brand", ""));
  const mergeRecord = <T>(file: string, kind: string, into: Record<string, T>, from: Record<string, T>) => {
    const dup = Object.keys(from).filter((k) => has(into, k));
    if (dup.length) problems.push(`L10 ${file}: duplicate ${kind} ids ${pyRepr(sorted(dup))}`);
    Object.assign(into, from);
  };
  for (const file of dataFiles as SourceFile[]) {
    const d = file.data as DataFile;
    if (d.meta) Object.assign(bp.meta, d.meta);
    if (d.lanes) bp.lanes.push(...d.lanes);
    if (d.models) bp.models.push(...d.models);
    if (d.divergences) bp.divergences.push(...d.divergences);
    if (d.notes) bp.notes.push(...d.notes);
    if (d.journey) bp.journeys.push(d.journey as LoadedJourney);
    if (d.entities) mergeRecord(file.name, "entities", bp.entities, d.entities);
    if (d.contracts) mergeRecord(file.name, "contracts", bp.contracts, d.contracts as Record<string, LoadedContract>);
    if (d.calls) mergeRecord(file.name, "calls", bp.calls, d.calls);
  }
  for (const file of promptFiles as SourceFile[]) {
    mergeRecord(file.name, "prompt", bp.prompts, file.data as Record<string, never>);
  }

  // A step's transitions and events are derived from the transitions' `step` field: said once, in the state machine.
  const owned = new Map<string, [string, Transition][]>();
  for (const [name, e] of Object.entries(bp.entities)) {
    for (const t of transitionsOf(e)) {
      for (const st of asList(t.step)) {
        if (st !== "*") owned.set(st, [...(owned.get(st) ?? []), [`${name}.${t.id}`, t]]);
      }
    }
  }
  for (const [sid, c] of Object.entries(bp.contracts)) {
    if (!isRecord(c)) continue;
    for (const k of ["transitions", "events"]) {
      if (has(c, k)) problems.push(`L0 contract ${sid}: '${k}' is derived from the transitions' step field — remove it`);
    }
    const mine = owned.get(sid) ?? [];
    c.transitions = mine.map(([key]) => key);
    c.events = dedupe(mine.flatMap(([, t]) => allEventsOf(t)));
  }
  for (const j of bp.journeys) {
    for (const s of j.steps) if (has(bp.contracts, s.id)) s.contract = bp.contracts[s.id];
  }
  return { cfg, bp, problems, shapeBroken: false };
}
