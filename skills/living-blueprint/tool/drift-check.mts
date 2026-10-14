// drift-check.mts — reverse drift between a living blueprint and the tests.
//
//   node drift-check.mts <blueprint-dir> <tests-dir> [--base <git-ref>] [--only <prefix,…>]
//
// Missing: a locked id (`ids` in agent/blueprint-lock.json) that no test token equals.
// Stale (with --base): a step, endpoint or transition whose hash changed since <base>
// while no changed test file carries its id, or an id extending it at `.` or `:`.
// Moved (with --base, a warning): the other direction — a step, endpoint or transition
// whose hash is the same as at <base> while a changed test file carries its id, or an
// id extending it: the code and its tests moved, the blueprint may not have. Both
// read one set of changed test files: the diff against <base> plus untracked files
// under the tests dir, deleted files skipped.
// --only narrows all three lists to the ids under one of its prefixes, so a lane that
// adopts the check one area at a time is not failed by areas outside its scope.
// A prefix covers whole segments: `BP:s1` is BP:s1 and the ids extending it at `.`
// or `:`, never BP:s10. A prefix ending in `:` or `.` (`SM:`, `SM:song.`) is a plain
// string prefix.
//
// Exit 0: nothing missing or stale. Exit 1: drift found. Exit 2: the check could not
// run. Moved never changes the exit code.
//
// No dependencies beyond `node:` modules and erasable TypeScript syntax only, so a
// project can copy this single file into its CI and run it with plain Node (22.18+,
// which strips types by default).

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, sep } from 'node:path';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node drift-check.mts <blueprint-dir> <tests-dir> [--base <git-ref>] [--only <prefix,…>]';
const LOCK_PATH = join('agent', 'blueprint-lock.json');
// Printed after the Moved count when it is above zero; step 10 of the skill keeps the blueprint describing what is built.
const MOVED_ADVICE = 'if the behaviour changed, update the blueprint (living-blueprint step 10)';

const TEST_EXTENSIONS = new Set(['.py', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.go', '.rb']);
const SKIPPED_DIRS = new Set(['node_modules', '.git', 'dist', 'build']);
// The id grammar of ACCEPTANCE.md: BP:<step>[.<endpoint>][:<fixture>], SM:<entity>.<id>[:<failure>].
const ID_TOKEN = /(?:BP|SM):[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)?(?::[A-Za-z0-9_]+)?/g;
// A large repository can list thousands of changed paths; past the default 1 MiB
// execFileSync aborts with ENOBUFS.
const GIT_MAX_BUFFER = 64 * 1024 * 1024;

const EXIT_CLEAN = 0;
const EXIT_DRIFT = 1;
const EXIT_CANNOT_RUN = 2;

/** A condition that stops the check before it can give a verdict (exit 2). */
class CannotRun extends Error {}

type Options = {
  blueprintDir: string;
  testsDir: string;
  base: string | undefined;
  only: string[];
};

/** A step, endpoint or transition with a content hash, and the test id that covers it. */
type Hashed = {
  label: string;
  id: string;
  hash: string;
};

/** Keyed by label: `step a1`, `endpoint POST /x`, `transition song.S01`. */
type HashedEntries = Map<string, Hashed>;

type StaleEntry = Hashed & { baseHash: string };

/** Both directions against <base>: hashes that changed without a changed test, and changed tests on unchanged hashes. */
type BaseResult =
  | { checked: false }
  | { checked: true; base: string; baseLockFound: boolean; changed: number; stale: StaleEntry[]; moved: Hashed[] };

// ---------------------------------------------------------------- arguments

function readArgs(argv: string[]) {
  try {
    return parseArgs({
      args: argv,
      options: { base: { type: 'string' }, only: { type: 'string' } },
      allowPositionals: true,
    });
  } catch (error) {
    throw new CannotRun(`${(error as Error).message}\n${USAGE}`);
  }
}

function parseOptions(argv: string[]): Options {
  const { values, positionals } = readArgs(argv);
  const [blueprintDir, testsDir, ...extra] = positionals;
  if (blueprintDir === undefined || testsDir === undefined || extra.length > 0) {
    throw new CannotRun(USAGE);
  }
  const only = (values.only ?? '')
    .split(',')
    .map((prefix) => prefix.trim())
    .filter((prefix) => prefix !== '');
  if (values.only !== undefined && only.length === 0) {
    throw new CannotRun(`--only needs at least one prefix\n${USAGE}`);
  }
  if (values.base !== undefined && values.base.trim() === '') {
    throw new CannotRun(`--base needs a git ref\n${USAGE}`);
  }
  return { blueprintDir, testsDir, base: values.base, only };
}

// --------------------------------------------------------------------- lock

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson(text: string, origin: string): Record<string, unknown> {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new CannotRun(`${origin} is not valid JSON: ${(error as Error).message}`);
  }
  if (!isRecord(data)) throw new CannotRun(`${origin} is not a JSON object`);
  return data;
}

function parseIds(lock: Record<string, unknown>, origin: string): string[] {
  const ids = lock.ids;
  if (!Array.isArray(ids) || !ids.every((id): id is string => typeof id === 'string')) {
    throw new CannotRun(`${origin} has no "ids" list of strings (lock schema 1.2 or later)`);
  }
  return ids;
}

function hashOf(entry: unknown): string | undefined {
  return isRecord(entry) && typeof entry.hash === 'string' ? entry.hash : undefined;
}

/**
 * The hashed entries of a lock and the id each one maps to:
 * step `<step>` → `BP:<step>`; an endpoint of `<step>` with id `<id>` → `BP:<step>.<id>`,
 * with id null → `BP:<step>`; transition `<entity>.<id>` → `SM:<entity>.<id>`.
 * (Placeholders, not examples: a real id in this comment would count as a test
 * token if the file were ever copied into a tests dir.)
 */
function parseHashed(lock: Record<string, unknown>): HashedEntries {
  const entries: HashedEntries = new Map();
  const add = (label: string, id: string, hash: string): void => {
    entries.set(label, { label, id, hash });
  };

  const steps = isRecord(lock.steps) ? lock.steps : {};
  for (const [key, entry] of Object.entries(steps)) {
    const hash = hashOf(entry);
    if (hash !== undefined) add(`step ${key}`, `BP:${key}`, hash);
  }

  const endpoints = isRecord(lock.endpoints) ? lock.endpoints : {};
  for (const [key, entry] of Object.entries(endpoints)) {
    const hash = hashOf(entry);
    if (hash === undefined || !isRecord(entry) || typeof entry.step !== 'string') continue;
    const id = typeof entry.id === 'string' ? `BP:${entry.step}.${entry.id}` : `BP:${entry.step}`;
    add(`endpoint ${key}`, id, hash);
  }

  const transitions = isRecord(lock.transitions) ? lock.transitions : {};
  for (const [key, entry] of Object.entries(transitions)) {
    const hash = hashOf(entry);
    if (hash !== undefined) add(`transition ${key}`, `SM:${key}`, hash);
  }

  return entries;
}

function readLockFile(lockFile: string): Record<string, unknown> {
  let text: string;
  try {
    text = readFileSync(lockFile, 'utf8');
  } catch (error) {
    throw new CannotRun(`cannot read the lock ${lockFile}: ${(error as Error).message}`);
  }
  return parseJson(text, lockFile);
}

// -------------------------------------------------------------------- tests

function isTestFile(name: string): boolean {
  return TEST_EXTENSIONS.has(extname(name));
}

/** Every test file under `dir`, skipping vendored and build output. */
function listTestFiles(dir: string): string[] {
  const files: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) walk(full);
      } else if (entry.isFile() && isTestFile(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(dir);
  return files.sort();
}

/**
 * Whether `file` (absolute) is a test file under `testsRoot` (absolute, real): it
 * has a test extension and no directory between them is a skipped one.
 */
function isTestFileUnder(file: string, testsRoot: string): boolean {
  const rel = relative(testsRoot, file);
  if (rel === '' || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return false;
  const parts = rel.split(sep);
  const name = parts.pop() ?? '';
  return isTestFile(name) && !parts.some((part) => SKIPPED_DIRS.has(part));
}

function tokensIn(file: string): string[] {
  return readFileSync(file, 'utf8').match(ID_TOKEN) ?? [];
}

/** True when `token` is `id` itself or extends it at a `.` or `:` boundary. */
function covers(token: string, id: string): boolean {
  return token === id || token.startsWith(`${id}.`) || token.startsWith(`${id}:`);
}

/** True when `id` falls under --only: no prefixes given, or one of them covers it — a prefix that ends at a
 * boundary as a string prefix, any other as whole segments. */
function inScope(id: string, only: string[]): boolean {
  return only.length === 0
    || only.some((prefix) => (prefix.endsWith(':') || prefix.endsWith('.') ? id.startsWith(prefix) : covers(id, prefix)));
}

// ---------------------------------------------------------------------- git

function git(cwd: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: GIT_MAX_BUFFER,
  });
}

/** Runs git and returns undefined when git exits non-zero; a missing git binary stops the check. */
function gitOrUndefined(cwd: string, args: string[]): string | undefined {
  try {
    return git(cwd, args);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new CannotRun('git is not installed or not on PATH; --base needs it');
    }
    return undefined;
  }
}

function splitNul(output: string): string[] {
  return output.split('\0').filter((name) => name !== '');
}

/**
 * Every token carried by a test file changed since `commit`: the diff against it plus
 * untracked files, kept to test files under the tests dir.
 */
function changedTestTokens(root: string, commit: string, testsDir: string): string[] {
  if (!existsSync(testsDir)) return [];
  const testsRoot = realpathSync(testsDir);
  const names = [
    ...splitNul(git(root, ['diff', '--name-only', '-z', commit, '--'])),
    ...splitNul(git(root, ['ls-files', '--others', '--exclude-standard', '-z'])),
  ];
  const tokens = new Set<string>();
  for (const name of new Set(names)) {
    const file = join(root, name);
    // A deleted test shows in the diff but carries nothing any more.
    if (!isTestFileUnder(file, testsRoot) || !existsSync(file)) continue;
    for (const token of tokensIn(file)) tokens.add(token);
  }
  return [...tokens];
}

function checkBase(lockFile: string, current: HashedEntries, testsDir: string, base: string): BaseResult {
  const lockDir = dirname(lockFile);
  const top = gitOrUndefined(lockDir, ['rev-parse', '--show-toplevel']);
  if (top === undefined) {
    throw new CannotRun(`${lockDir} is not inside a git repository; --base needs one`);
  }
  const root = top.trim();

  const resolved = gitOrUndefined(root, ['rev-parse', '--verify', '--quiet', '--end-of-options', `${base}^{commit}`]);
  if (resolved === undefined) {
    throw new CannotRun(`--base ${base} is not a git ref in ${root} (a shallow CI checkout must fetch it first)`);
  }
  const commit = resolved.trim();

  // git addresses blobs with '/' whatever the platform separator is.
  const lockRel = relative(root, realpathSync(lockFile)).split(sep).join('/');
  const blob = `${commit}:${lockRel}`;
  if (gitOrUndefined(root, ['cat-file', '-e', blob]) === undefined) {
    // The lock is new in this change: nothing it locks can have changed or stayed yet.
    return { checked: true, base, baseLockFound: false, changed: 0, stale: [], moved: [] };
  }
  const previous = parseHashed(parseJson(git(root, ['show', blob]), `${lockRel} at ${base}`));

  const changed: StaleEntry[] = [];
  const unchanged: Hashed[] = [];
  for (const [label, entry] of current) {
    const before = previous.get(label);
    if (before === undefined) continue;
    if (before.hash !== entry.hash) changed.push({ ...entry, baseHash: before.hash });
    else unchanged.push(entry);
  }

  // One scan of the changed tests feeds both directions: Stale wants one on every
  // changed hash, Moved reports one on an unchanged hash.
  const tokens = changedTestTokens(root, commit, testsDir);
  const touched = (entry: Hashed): boolean => tokens.some((token) => covers(token, entry.id));
  const stale = changed.filter((entry) => !touched(entry));
  const moved = unchanged.filter(touched);
  return { checked: true, base, baseLockFound: true, changed: changed.length, stale, moved };
}

// --------------------------------------------------------------------- main

function main(argv: string[]): number {
  const options = parseOptions(argv);
  const lockFile = join(options.blueprintDir, LOCK_PATH);
  const lock = readLockFile(lockFile);
  const ids = parseIds(lock, lockFile);

  let testFiles: string[] = [];
  if (existsSync(options.testsDir)) {
    testFiles = listTestFiles(options.testsDir);
  } else {
    console.error(`drift-check: tests dir ${options.testsDir} does not exist; treating it as empty`);
  }
  const carried = new Set<string>();
  for (const file of testFiles) {
    for (const token of tokensIn(file)) carried.add(token);
  }

  const wanted = ids.filter((id) => inScope(id, options.only));
  const missing = wanted.filter((id) => !carried.has(id));

  const hashedInScope: HashedEntries = new Map(
    [...parseHashed(lock)].filter(([, entry]) => inScope(entry.id, options.only)),
  );
  const vsBase: BaseResult = options.base === undefined
    ? { checked: false }
    : checkBase(lockFile, hashedInScope, options.testsDir, options.base);

  console.log(`Missing: ${missing.length} of ${wanted.length} ids have no test`);
  for (const id of missing) console.log(`  ${id}`);

  if (!vsBase.checked) {
    console.log('Stale: not checked (no --base)');
    console.log('Moved: not checked (no --base)');
  } else if (!vsBase.baseLockFound) {
    console.log(`Stale: 0 (no lock at ${vsBase.base}; nothing to compare)`);
    console.log(`Moved: 0 (no lock at ${vsBase.base}; nothing to compare)`);
  } else {
    console.log(`Stale: ${vsBase.stale.length} of ${vsBase.changed} hashes changed since ${vsBase.base} have no changed test`);
    for (const entry of vsBase.stale) {
      console.log(`  ${entry.id}  ${entry.label}  ${entry.baseHash} -> ${entry.hash}`);
    }
    const advice = vsBase.moved.length > 0 ? ` — ${MOVED_ADVICE}` : '';
    console.log(`Moved: ${vsBase.moved.length} blueprint entries unchanged since ${vsBase.base} have changed tests${advice}`);
    for (const entry of vsBase.moved) console.log(`  ${entry.id}  ${entry.label}`);
  }

  const staleCount = vsBase.checked ? vsBase.stale.length : 0;
  // Moved is a warning: it is reported, and the verdict and exit code ignore it.
  const failed = missing.length > 0 || staleCount > 0;
  const baseCounts = vsBase.checked
    ? `${staleCount} stale, ${vsBase.moved.length} moved (warning)`
    : 'stale not checked, moved not checked';
  console.log(
    `drift-check: ${failed ? 'FAIL' : 'OK'}: ${missing.length} missing, ${baseCounts}; ` +
      `${wanted.length} ids, ${testFiles.length} test files`,
  );
  return failed ? EXIT_DRIFT : EXIT_CLEAN;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  if (!(error instanceof CannotRun)) throw error;
  console.error(`drift-check: ${error.message}`);
  process.exitCode = EXIT_CANNOT_RUN;
}
