#!/usr/bin/env node
// Living blueprint build, schema v1.2. One data source, two views: the human view (one HTML file) and the agent view
// (agent/). It began as a port of a Python prototype; output parity was verified at port time, and the tool has grown
// since. Where a comment speaks of Python semantics (str(), json.dumps(), truthiness), it means the output the
// prototype printed.
//
//   node build.ts <blueprint-dir>   lint, then write <config.html>, agent/ and <config.prompts_md>; on any error
//                                   print the findings, write nothing and exit 1
//   node build.ts <blueprint-dir> --check
//                                   lint and render in memory, compare with those files on disk, write nothing; print
//                                   the paths a build would change and exit 1 when there are any, or on any error
//   node build.ts --init <dir>      copy the starter (blueprint.config.yaml and src/) into <dir>
//   node build.ts --schema          print the data model as JSON Schema
//
// Exit 2: a bad command line, no blueprint at <blueprint-dir>, or no ../references/schema.md next to this tool.
//
// Inputs: <dir>/blueprint.config.yaml · <dir>/src/data/*.yaml · <dir>/src/prompts/*.yaml, and from this tool
// renderer/ and ../references/schema.md — a copy of the tool keeps tool/ and references/ side by side.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { agentView, BuildError } from "./src/agent-view.ts";
import { humanView, readRenderer } from "./src/human-view.ts";
import { lint, Lint } from "./src/lint.ts";
import { CONFIG_FILE, load } from "./src/load.ts";
import { agentOutputs, DEFAULT_HTML, entryRefusals, isFolder, lexists, realPathEscapes, removalRefusals } from "./src/paths.ts";
import { promptsDoc } from "./src/prompts-doc.ts";
import type { Blueprint } from "./src/model.ts";
import { dataModelJsonSchema } from "./src/schema.ts";
import type { Config } from "./src/schema.ts";

const TOOL_DIR = import.meta.dirname;
const RENDERER_DIR = join(TOOL_DIR, "renderer");
const STARTER_DIR = join(TOOL_DIR, "starter");
const SCHEMA_DOC = resolve(TOOL_DIR, "..", "references", "schema.md");
/** agent/ subdirectories regenerated whole, so a renamed step leaves no stale file behind. */
const GENERATED_DIRS = ["fixtures", "calls", "prompts"];
const GENERATED_EXTENSIONS = [".json", ".md"];
const BYTES_PER_KB = 1024;

const EXIT_OK = 0;
const EXIT_ERRORS = 1;
/** --check: a file on disk is not what the build would write. */
const EXIT_STALE = 1;
const EXIT_USAGE = 2;
/** The blueprint directory or the tool's references/ is not there. */
const EXIT_CANNOT_RUN = 2;

const USAGE = `usage: node build.ts <blueprint-dir>
       node build.ts <blueprint-dir> --check
       node build.ts --init <dir>
       node build.ts --schema`;

function render(root: string, cfg: Config, bp: Blueprint, warnings: number) {
  const { files, lock } = agentView(bp);
  files.set("SCHEMA.md", readFileSync(SCHEMA_DOC, "utf8"));
  bp.build = {
    errors: 0, warnings, steps_locked: Object.keys(lock.steps).length,
    transitions_locked: Object.keys(lock.transitions).length, endpoints: Object.keys(lock.endpoints).length,
    events: lock.events.length,
  };
  const page = humanView(bp, cfg, readRenderer(RENDERER_DIR));
  const promptsTarget = cfg.prompts_md ? resolve(root, cfg.prompts_md) : null;
  const promptsText = promptsTarget !== null ? promptsDoc(bp, cfg) : null;
  return { files, lock, page, promptsTarget, promptsText };
}

type Rendered = ReturnType<typeof render>;

interface Prepared {
  bp: Blueprint;
  rendered: Rendered;
  /** Every file the build writes: absolute path → text. */
  outputs: Map<string, string>;
  htmlName: string;
  warnings: number;
}

const isGenerated = (name: string) => GENERATED_EXTENSIONS.some((ext) => name.endsWith(ext));

/** Lints and renders in memory, writing nothing. On any error prints the findings and the verdict, and returns null. */
function prepare(root: string, refusal: string): Prepared | null {
  const { cfg, bp, problems, shapeBroken } = load(root);
  // A wrong shape stops before the lint, which cannot walk it.
  let L: Lint;
  if (shapeBroken) {
    L = new Lint();
    L.errors.push(...problems);
  } else {
    L = lint(bp, problems);
  }
  for (const w of L.warnings) console.log("warning", w);
  for (const e of L.errors) console.log("ERROR", e);
  if (L.errors.length) {
    console.log(`${L.errors.length} errors, ${L.warnings.length} warnings — ${refusal}`);
    return null;
  }

  let rendered: Rendered;
  let outputs: Map<string, string>;
  try {
    rendered = render(root, cfg, bp, L.warnings.length);
    outputs = agentOutputs(root, rendered.files);
  } catch (e) {
    if (!(e instanceof BuildError)) throw e;
    console.log("ERROR", e.message);
    console.log(`1 errors, ${L.warnings.length} warnings — ${refusal}`);
    return null;
  }
  const htmlName = cfg.html || DEFAULT_HTML;
  outputs.set(resolve(root, htmlName), rendered.page);
  if (rendered.promptsTarget !== null && rendered.promptsText !== null) outputs.set(rendered.promptsTarget, rendered.promptsText);
  return { bp, rendered, outputs, htmlName, warnings: L.warnings.length };
}

function build(root: string): number {
  // Everything is rendered before anything is written: a failure leaves the previous build in place.
  const prepared = prepare(root, "nothing written");
  if (!prepared) return EXIT_ERRORS;
  const { bp, rendered: { lock, page }, outputs, htmlName, warnings } = prepared;

  const agentDir = join(root, "agent");
  const generatedDirs = GENERATED_DIRS.map((sub) => join(agentDir, sub));
  // A symlink would carry the clean-up or a write to wherever it points: refuse the build before touching anything —
  // a link at the path itself, or a symlinked folder on the way that takes the real path out of bounds. A folder where
  // a file goes, a file where a folder goes or stands on the way, a symlink loop on the way: each would fail the write
  // halfway, so each is refused here too.
  const folders = [agentDir, ...generatedDirs];
  const touched = [...folders, ...outputs.keys()];
  // The clean-up removes exactly what was checked here: a folder among the old generated files is refused, not met
  // halfway through the removal.
  const old = generatedOnDisk(root);
  const refusals = [
    ...entryRefusals(root, folders, outputs.keys()), ...realPathEscapes(root, touched), ...removalRefusals(root, old),
  ];
  if (refusals.length) {
    for (const refusal of refusals) console.log("ERROR", refusal);
    console.log(`${refusals.length} errors, ${warnings} warnings — nothing written`);
    return EXIT_ERRORS;
  }
  for (const dir of generatedDirs) mkdirSync(dir, { recursive: true });
  // rmSync on a symlinked file removes the link, never its target.
  for (const path of old) rmSync(path);
  for (const [path, text] of outputs) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text, "utf8");
  }
  // Python's len() counts code points.
  const kb = Math.floor([...page].length / BYTES_PER_KB);
  console.log(`built ${htmlName} (${kb} KB) · ${Object.keys(bp.prompts).length} prompts · ${Object.keys(lock.steps).length} `
    + `contracts · ${Object.keys(lock.transitions).length} transitions · ${Object.keys(lock.endpoints).length} endpoints · `
    + `0 errors, ${warnings} warnings`);
  return EXIT_OK;
}

/** Every entry with a generated name in agent/'s generated directories: what a build removes before it writes, so a
 * renamed step leaves nothing behind. A directory that is missing or not a folder holds none. */
function generatedOnDisk(root: string): string[] {
  const out: string[] = [];
  for (const sub of GENERATED_DIRS) {
    const dir = join(root, "agent", sub);
    if (!isFolder(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (isGenerated(name)) out.push(join(dir, name));
    }
  }
  return out;
}

/** Generated files a build removes for good: those it does not write again. */
function leftovers(root: string, outputs: ReadonlyMap<string, string>): string[] {
  return generatedOnDisk(root).filter((path) => !outputs.has(path));
}

/** --check: the paths a build would change — create (missing), rewrite (stale) or remove (extra). */
function check(root: string): number {
  const prepared = prepare(root, "nothing compared");
  if (!prepared) return EXIT_ERRORS;
  const { outputs, warnings } = prepared;
  const differ: { kind: "missing" | "stale" | "extra"; path: string }[] = [];
  for (const [path, text] of outputs) {
    // Bytes, not text: a stray BOM or an invalid UTF-8 sequence is a difference the build would remove.
    if (!existsSync(path)) differ.push({ kind: "missing", path });
    else if (!readFileSync(path).equals(Buffer.from(text, "utf8"))) differ.push({ kind: "stale", path });
  }
  for (const path of leftovers(root, outputs)) differ.push({ kind: "extra", path });

  const shown = differ.map(({ kind, path }) => ({ kind, rel: relative(root, path) }))
    .sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  for (const { kind, rel } of shown) console.log(`${kind} ${rel}`);
  if (shown.length) {
    console.log(`${shown.length} files differ from src/ — run node ${join(TOOL_DIR, "build.ts")} ${root}`);
    return EXIT_STALE;
  }
  console.log(`${outputs.size} files match src/ · 0 errors, ${warnings} warnings`);
  return EXIT_OK;
}

function init(target: string): number {
  const src = join(target, "src");
  const config = join(target, CONFIG_FILE);
  // lstat, not existsSync: a dangling symlink is an entry too, and copying over it aborts Node.
  if (lexists(src)) {
    console.error(`${src} exists${existsSync(src) ? "" : " (a dangling symlink)"} — --init only starts a new blueprint`);
    return EXIT_ERRORS;
  }
  if (lexists(config) && !existsSync(config)) {
    console.error(`${config} is a dangling symlink — remove it or point it at a file, then run --init again`);
    return EXIT_ERRORS;
  }
  if (!existsSync(STARTER_DIR)) {
    console.error(`the starter is missing: ${STARTER_DIR}`);
    return EXIT_ERRORS;
  }
  const keptConfig = existsSync(config);
  // force: false — an existing blueprint.config.yaml is the author's, and stays.
  cpSync(STARTER_DIR, target, { recursive: true, force: false });
  console.log(`created ${join(target, "src")}/` + (keptConfig ? ` (kept the existing ${CONFIG_FILE})` : ` and ${CONFIG_FILE}`));
  console.log(`next: node ${join(TOOL_DIR, "build.ts")} ${target}`);
  return EXIT_OK;
}

/** Runs a build or a check when the tool's references/ and the blueprint are both there; otherwise says which is missing,
 * in one line. */
function withBlueprint(dir: string, run: (root: string) => number): number {
  const root = resolve(dir);
  if (!existsSync(SCHEMA_DOC)) {
    console.error(`${SCHEMA_DOC} is missing — keep references/ next to tool/: the build copies it into agent/SCHEMA.md`);
    return EXIT_CANNOT_RUN;
  }
  if (!existsSync(join(root, "src", "data"))) {
    console.error(`no blueprint at ${root} — run --init first`);
    return EXIT_CANNOT_RUN;
  }
  return run(root);
}

function main(argv: readonly string[]): number {
  const [first, second, ...rest] = argv;
  if (first === "--schema" && second === undefined) {
    console.log(JSON.stringify(dataModelJsonSchema(), null, 2));
    return EXIT_OK;
  }
  if (first === "--init" && second !== undefined && !rest.length) return init(resolve(second));
  if (first !== undefined && !first.startsWith("-")) {
    if (second === undefined) return withBlueprint(first, build);
    if (second === "--check" && !rest.length) return withBlueprint(first, check);
  }
  console.error(USAGE);
  return EXIT_USAGE;
}

process.exitCode = main(process.argv.slice(2));
