import { lstatSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { BuildError } from "./agent-view.ts";
import type { Config } from "./schema.ts";

// Where the build may write. agent/ files stay inside agent/; the human view and the prompts document stay inside the
// blueprint directory's parent and out of its src/ and agent/. Each holds for the path as written (lexical, L0) and for
// the path the file system will follow (real path, checked before anything is deleted or written); and nothing is
// written or deleted through a symlink at the path itself.

/** The blueprint's own folders: src/ is what the build reads, agent/ is what it writes. html and prompts_md stay out. */
const RESERVED_DIRS = ["src", "agent"] as const;

/** An entry exists at `path`, a dangling symlink included — existsSync() follows the link and calls it missing. */
export function lexists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR") return false;
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

/** `path` lies below `dir` — not `dir` itself. Lexical, as resolve() is: symlinks are `symlinks()`' business. */
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

/** L0 findings for `html` and `prompts_md`: each is a relative path that resolves inside the blueprint directory's
 * parent, so a project keeps the prompts document next to the blueprint (`../prompts/…`), and outside the blueprint's
 * src/ and agent/. */
export function configPathProblems(root: string, cfg: Config, file: string): string[] {
  const parent = dirname(resolve(root));
  const out: string[] = [];
  for (const field of OUTPUT_FIELDS) {
    const value = cfg[field];
    if (typeof value !== "string" || !value) continue;
    const target = resolve(root, value);
    const into = RESERVED_DIRS.find((dir) => within(join(resolve(root), dir), target));
    if (isAbsolute(value)) out.push(`L0 ${file}: ${field} '${value}' is an absolute path — give it relative to the blueprint directory`);
    else if (!isInside(parent, target)) out.push(`L0 ${file}: ${field} '${value}' resolves outside ${parent}`);
    else if (into) out.push(`L0 ${file}: ${field} '${value}' points into ${into}/ — the build ${into === "src" ? "reads" : "writes"} that folder itself`);
  }
  return out;
}

function isSymlink(path: string): boolean {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw e;
  }
}

/** The paths among `paths` that are symlinks. A write or a delete through one would land wherever it points. */
export function symlinks(paths: Iterable<string>): string[] {
  return [...paths].filter(isSymlink);
}
