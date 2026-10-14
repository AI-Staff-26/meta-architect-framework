import { lstatSync, realpathSync, statSync } from "node:fs";
import type { Stats } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { BuildError } from "./agent-view.ts";
import type { Config } from "./schema.ts";

// Where the build may write. agent/ files stay inside agent/; the human view and the prompts document stay inside the
// blueprint directory's parent, out of its src/ and agent/, off its config file and off an existing folder. Each holds
// for the path as written (lexical, L0) and for the path the file system will follow (real path, checked before
// anything is deleted or written); nothing is written or deleted through a symlink at the path itself; and a path that
// cannot be written — a file or a symlink loop on the way — is refused before the first write, not halfway.

/** The blueprint's own folders: src/ is what the build reads, agent/ is what it writes. html and prompts_md stay out. */
const RESERVED_DIRS = ["src", "agent"] as const;

/** Errors that mean no entry can be reached at a path: nothing there, a file on the way, a symlink loop on the way. */
const UNREACHABLE = ["ENOENT", "ENOTDIR", "ELOOP"];

const unreachable = (e: unknown) => UNREACHABLE.includes((e as NodeJS.ErrnoException).code ?? "");

/** An entry exists at `path`, a dangling symlink included — existsSync() follows the link and calls it missing. */
export function lexists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch (e) {
    if (unreachable(e)) return false;
    throw e;
  }
}

/** The real path `path` will have once written: the real path of its deepest existing entry, plus the segments that do
 * not exist yet. Null when that entry cannot be resolved — a dangling symlink or a loop. */
export function realPath(path: string): string | null {
  const missing: string[] = [];
  let cur = resolve(path);
  while (!lexists(cur) && dirname(cur) !== cur) {
    missing.unshift(basename(cur));
    cur = dirname(cur);
  }
  try {
    return join(realpathSync(cur), ...missing);
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ELOOP" || code === "ENOTDIR") return null;
    throw e;
  }
}

const within = (dir: string, path: string) => path === dir || path.startsWith(dir + sep);

/** One line for each path the file system would carry somewhere other than where it is written. Its base is the
 * tightest of agent/, the blueprint directory and the blueprint's parent that holds it as written; the real path must
 * be the base's real path plus the rest as written. So a symlink above the base (a linked blueprint directory, a linked
 * home) is followed, and a symlinked folder between the base and the file — `out/ → elsewhere`, `../prompts →
 * elsewhere` — is refused, even when it points somewhere inside the base. */
export function realPathEscapes(root: string, paths: Iterable<string>): string[] {
  const blueprint = resolve(root);
  const bases = [join(blueprint, "agent"), blueprint, dirname(blueprint)];
  const out: string[] = [];
  for (const path of paths) {
    const written = resolve(path);
    const base = bases.find((dir) => within(dir, written)) ?? dirname(blueprint);
    const realBase = realPath(base);
    const real = realPath(written);
    const rel = relative(blueprint, written);
    if (real === null || realBase === null) {
      out.push(`${rel} cannot be resolved — a dangling symlink or a symlink loop on the way; nothing is written through one`);
    } else if (real !== join(realBase, relative(base, written))) {
      out.push(`${rel} resolves to ${real} — a symlinked folder on the way; nothing is written through one`);
    }
  }
  return out;
}

/** `path` lies below `dir` — not `dir` itself. Lexical, as resolve() is: symlinks are the business of `entryRefusals()`
 * and `realPathEscapes()`. */
export function isInside(dir: string, path: string): boolean {
  return resolve(path).startsWith(resolve(dir) + sep);
}

/** The agent view's files by absolute path. A file that would land outside agent/ — an id the lint should have refused
 * — stops the build before anything is written. */
export function agentOutputs(root: string, files: ReadonlyMap<string, string>): Map<string, string> {
  const agentDir = join(root, "agent");
  const out = new Map<string, string>();
  for (const [rel, text] of files) {
    const path = join(agentDir, rel);
    if (!isInside(agentDir, path)) throw new BuildError(`agent/${rel} resolves outside agent/ — nothing written`);
    out.set(path, text);
  }
  return out;
}

/** Config fields that name an output file. */
const OUTPUT_FIELDS = ["html", "prompts_md"] as const;

/** The human view's file name when the config gives no `html`. */
export const DEFAULT_HTML = "blueprint.html";

/** A path whose last segment is empty, `.` or `..` — `out/`, `out/.` — names a folder. resolve() drops that segment,
 * so the build would write a file in the folder's place. */
const NAMES_FOLDER = /(^|\/)\.{0,2}$/;

/** An existing folder at `path`, a symlinked one included. Anything stat cannot reach is not one; the build refuses a
 * path behind a file or a loop on its own, before it writes. */
export function isFolder(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch (e) {
    if (unreachable(e)) return false;
    throw e;
  }
}

/** L0 findings for `html` and `prompts_md`: each is a relative path that resolves inside the blueprint directory's
 * parent, so a project keeps the prompts document next to the blueprint (`../prompts/…`), and outside the blueprint's
 * src/ and agent/ and off its config file, `file` — the name the findings start with; each names a file, not a folder;
 * and the two are different files. Lexical, but for one look at the disk: a path that is an existing folder is refused
 * here, since the write into it would fail only after agent/ was rewritten. */
export function configPathProblems(root: string, cfg: Config, file: string): string[] {
  const parent = dirname(resolve(root));
  const config = resolve(root, file);
  const out: string[] = [];
  /** Targets of the values that passed every check above. */
  const passed = new Map<(typeof OUTPUT_FIELDS)[number], string>();
  for (const field of OUTPUT_FIELDS) {
    const value = cfg[field];
    if (typeof value !== "string" || !value) continue;
    const target = resolve(root, value);
    const into = RESERVED_DIRS.find((dir) => within(join(resolve(root), dir), target));
    if (isAbsolute(value)) out.push(`L0 ${file}: ${field} '${value}' is an absolute path — give it relative to the blueprint directory`);
    else if (!isInside(parent, target)) out.push(`L0 ${file}: ${field} '${value}' resolves outside ${parent}`);
    else if (into) out.push(`L0 ${file}: ${field} '${value}' points into ${into}/ — the build ${into === "src" ? "reads" : "writes"} that folder itself`);
    else if (target === config) out.push(`L0 ${file}: ${field} '${value}' is ${file} — the build reads that file itself`);
    else if (isFolder(target)) out.push(`L0 ${file}: ${field} '${value}' is an existing folder — give it a file name`);
    else if (NAMES_FOLDER.test(value)) out.push(`L0 ${file}: ${field} '${value}' names a folder — give it a file name`);
    else passed.set(field, target);
  }
  // Both written to one path: the later write would replace the other without a word.
  const html = cfg.html || DEFAULT_HTML;
  const htmlTarget = cfg.html ? passed.get("html") : resolve(root, DEFAULT_HTML);
  if (htmlTarget !== undefined && htmlTarget === passed.get("prompts_md")) {
    out.push(`L0 ${file}: prompts_md '${cfg.prompts_md}' is the same file as html '${html}' — give each its own`);
  }
  return out;
}

/** The deepest entry that exists on the way to `path`. */
function deepestEntry(path: string): string {
  let cur = dirname(path);
  while (!lexists(cur) && dirname(cur) !== cur) cur = dirname(cur);
  return cur;
}

const notAFolder = (root: string, path: string) => `${relative(root, path)} is a file, not a folder — the build cannot write below it`;

/** Why the build may not delete or write at `path` itself, in one line; null when it may. `path` is to be a `folder`
 * the build creates and cleans, or a `file` it writes. lstat does not follow the last segment, so it sees a symlink at
 * the path — a write or a delete through one would land wherever it points — and a folder where a file goes, or the
 * other way round; either would fail the build halfway, after agent/ was cleaned. ENOTDIR: a regular file stands on
 * the way. ELOOP comes from a symlink loop on a folder on the way, not from the path itself; realPathEscapes() cannot
 * resolve such a path and refuses it in its own line. */
function entryRefusal(root: string, path: string, expected: "folder" | "file"): string | null {
  let entry: Stats;
  try {
    entry = lstatSync(path);
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ELOOP") return null;
    if (code === "ENOTDIR") return notAFolder(root, deepestEntry(path));
    throw e;
  }
  if (entry.isSymbolicLink()) return `${relative(root, path)} is a symlink — the build neither deletes nor writes through one`;
  if (expected === "file" && entry.isDirectory()) return `${relative(root, path)} is a folder — the build writes a file there`;
  if (expected === "folder" && !entry.isDirectory()) return notAFolder(root, path);
  return null;
}

/** One line for each entry the build may not delete or write at — among `folders` it creates and cleans and `files` it
 * writes: a symlink at the path, the wrong kind of entry there, or a file on the way — named once, however many outputs
 * lie below it. */
export function entryRefusals(root: string, folders: Iterable<string>, files: Iterable<string>): string[] {
  const out = new Set<string>();
  const add = (refusal: string | null) => {
    if (refusal !== null) out.add(refusal);
  };
  for (const path of folders) add(entryRefusal(root, path, "folder"));
  for (const path of files) add(entryRefusal(root, path, "file"));
  return [...out];
}

/** One line for each entry among `paths` — the old generated files the build removes before it writes — that is
 * neither a regular file nor a symlink. rmSync removes a file, or a link and never its target; anything else it refuses,
 * and the clean-up would stop halfway, with part of agent/ already gone. */
export function removalRefusals(root: string, paths: Iterable<string>): string[] {
  const out: string[] = [];
  for (const path of paths) {
    let entry: Stats;
    try {
      entry = lstatSync(path);
    } catch (e) {
      if (unreachable(e)) continue;
      throw e;
    }
    if (entry.isFile() || entry.isSymbolicLink()) continue;
    const kind = entry.isDirectory() ? "a folder" : "not a regular file";
    out.push(`${relative(root, path)} is ${kind} — the build would remove it with the old generated files; move it out of ${relative(root, dirname(path))}/`);
  }
  return out;
}
