// Tests for drift-check.mts, driven through its CLI: arguments in, stdout and
// exit code out. The script is meant to be copied alone into a project's CI,
// so the command line is the only interface worth pinning.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '..', 'drift-check.mts');

type RunResult = { status: number | null; stdout: string; stderr: string };

type LockInput = {
  ids: string[];
  steps?: Record<string, { hash: string }>;
  endpoints?: Record<string, { step: string; id: string | null; hash: string }>;
  transitions?: Record<string, { hash: string }>;
};

// Stops git from walking up out of the temp dirs into whatever repository
// happens to contain them, so "no repo" really means no repo.
const GIT_ENV = { ...process.env, GIT_CEILING_DIRECTORIES: tmpdir() };

function run(args: string[]): RunResult {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', env: GIT_ENV });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function writeLock(blueprintDir: string, lock: LockInput): void {
  const full = { schema: '1.2', version: 'v0', steps: {}, endpoints: {}, transitions: {}, ...lock };
  mkdirSync(join(blueprintDir, 'agent'), { recursive: true });
  writeFileSync(join(blueprintDir, 'agent', 'blueprint-lock.json'), JSON.stringify(full, null, 2));
}

function writeText(file: string, content: string): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), 'drift-check-'));
}

/** The lines of the Missing list, without indentation. */
function missingLines(stdout: string): string[] {
  const section = stdout.split(/^Stale\b/m)[0] ?? '';
  return section
    .split('\n')
    .filter((line) => line.startsWith('  '))
    .map((line) => line.trim());
}

/** The id at the head of each line of the Stale list. */
function staleIds(stdout: string): string[] {
  const section = stdout.split(/^Stale\b/m)[1] ?? '';
  return section
    .split('\n')
    .filter((line) => line.startsWith('  '))
    .map((line) => line.trim().split(/\s+/)[0] ?? '');
}

/** Runs git in `cwd` with an identity of its own and no user hooks or signing. */
function git(cwd: string, ...args: string[]): string {
  const result = spawnSync(
    'git',
    [
      '-c', 'user.name=drift-check test',
      '-c', 'user.email=drift-check@example.invalid',
      '-c', 'commit.gpgsign=false',
      '-c', 'core.hooksPath=/dev/null',
      ...args,
    ],
    { cwd, encoding: 'utf8', env: GIT_ENV },
  );
  assert.equal(result.status, 0, `git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim();
}

function commitAll(repo: string, message: string): string {
  git(repo, 'add', '-A');
  git(repo, 'commit', '-q', '-m', message);
  return git(repo, 'rev-parse', 'HEAD');
}

const BASE_LOCK: LockInput = {
  ids: ['BP:a1', 'BP:a1:happy', 'BP:a1.get', 'BP:a10', 'SM:thing.T01', 'SM:thing.T01:timeout'],
  steps: { a1: { hash: '111111111111' }, a10: { hash: '101010101010' } },
  endpoints: {
    'POST /things': { step: 'a1', id: null, hash: '222222222222' },
    'GET /things/{id}': { step: 'a1', id: 'get', hash: '333333333333' },
  },
  transitions: { 'thing.T01': { hash: '444444444444' } },
};

// Every id of BASE_LOCK, so the Missing list stays empty and only Stale decides.
const ALL_IDS_TEST = BASE_LOCK.ids.map((id) => `test('${id}', () => {});`).join('\n') + '\n';

/**
 * A repository with one commit: the lock and a test file carrying every id.
 * Returns the repo, the base commit, and the blueprint and tests dirs.
 */
function repoWithBase(root: string, name: string): { repo: string; base: string; bp: string; tests: string } {
  const repo = join(root, name);
  const bp = join(repo, 'docs', 'blueprint');
  const tests = join(repo, 'tests');
  mkdirSync(repo, { recursive: true });
  git(repo, 'init', '-q');
  writeLock(bp, BASE_LOCK);
  writeText(join(tests, 'all.test.ts'), ALL_IDS_TEST);
  const base = commitAll(repo, 'base');
  return { repo, base, bp, tests };
}

function withHashes(changes: {
  steps?: Record<string, string>;
  endpoints?: Record<string, string>;
  transitions?: Record<string, string>;
}): LockInput {
  const lock: LockInput = structuredClone(BASE_LOCK);
  for (const [key, hash] of Object.entries(changes.steps ?? {})) lock.steps![key]!.hash = hash;
  for (const [key, hash] of Object.entries(changes.endpoints ?? {})) lock.endpoints![key]!.hash = hash;
  for (const [key, hash] of Object.entries(changes.transitions ?? {})) lock.transitions![key]!.hash = hash;
  return lock;
}

describe('missing ids', () => {
  let root = '';
  before(() => {
    root = tempDir();
  });
  after(() => {
    rmSync(root, { recursive: true, force: true });
  });

  test('an id no test carries is reported, and the run exits 1', () => {
    const bp = join(root, 'm1', 'blueprint');
    const tests = join(root, 'm1', 'tests');
    writeLock(bp, { ids: ['BP:a1', 'BP:a1:happy', 'SM:song.S01'] });
    writeText(join(tests, 'a1.test.ts'), "test('creates a draft BP:a1', () => {});\n");
    writeText(join(tests, 'sub', 'song_test.py'), 'def test_s01():\n    """SM:song.S01"""\n');

    const result = run([bp, tests]);

    assert.equal(result.status, 1, result.stderr);
    assert.deepEqual(missingLines(result.stdout), ['BP:a1:happy']);
    assert.match(result.stdout, /\b1 missing\b/);
  });

  test('every id carried by a test: the run exits 0', () => {
    const bp = join(root, 'm2', 'blueprint');
    const tests = join(root, 'm2', 'tests');
    writeLock(bp, { ids: ['BP:a1', 'BP:a1:happy'] });
    writeText(join(tests, 'a1.test.ts'), "test('BP:a1', () => {});\ntest('BP:a1:happy', () => {});\n");

    const result = run([bp, tests]);

    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.deepEqual(missingLines(result.stdout), []);
    assert.match(result.stdout, /\b0 missing\b/);
  });

  test('a token counts only whole: BP:a10 and BP:a1:happy do not satisfy BP:a1', () => {
    const bp = join(root, 'm3', 'blueprint');
    const tests = join(root, 'm3', 'tests');
    writeLock(bp, { ids: ['BP:a1', 'BP:a10', 'BP:a1:happy'] });
    writeText(join(tests, 'a.test.ts'), "test('BP:a10', () => {});\ntest('BP:a1:happy', () => {});\n");

    const result = run([bp, tests]);

    assert.equal(result.status, 1, result.stderr);
    assert.deepEqual(missingLines(result.stdout), ['BP:a1']);
  });

  test('only the listed extensions count, and vendored or built dirs are skipped', () => {
    const bp = join(root, 'm4', 'blueprint');
    const tests = join(root, 'm4', 'tests');
    const ids = ['BP:py', 'BP:js', 'BP:tsx', 'BP:mjs', 'BP:cjs', 'BP:go', 'BP:rb', 'BP:md', 'BP:nm', 'BP:dist', 'BP:build'];
    writeLock(bp, { ids });
    writeText(join(tests, 'x_test.py'), '# BP:py');
    writeText(join(tests, 'x.test.js'), '// BP:js');
    writeText(join(tests, 'x.test.tsx'), '// BP:tsx');
    writeText(join(tests, 'x.test.mjs'), '// BP:mjs');
    writeText(join(tests, 'x.test.cjs'), '// BP:cjs');
    writeText(join(tests, 'x_test.go'), '// BP:go');
    writeText(join(tests, 'x_spec.rb'), '# BP:rb');
    writeText(join(tests, 'notes.md'), 'BP:md');
    writeText(join(tests, 'node_modules', 'dep', 'index.js'), '// BP:nm');
    writeText(join(tests, 'dist', 'x.test.js'), '// BP:dist');
    writeText(join(tests, 'build', 'x.test.js'), '// BP:build');

    const result = run([bp, tests]);

    assert.equal(result.status, 1, result.stderr);
    assert.deepEqual(missingLines(result.stdout), ['BP:md', 'BP:nm', 'BP:dist', 'BP:build']);
  });

  test('--only narrows the missing list to ids with the given prefixes', () => {
    const bp = join(root, 'm5', 'blueprint');
    const tests = join(root, 'm5', 'tests');
    writeLock(bp, { ids: ['BP:a1', 'BP:k1', 'BP:k2', 'SM:song.S01', 'SM:take.T01'] });
    writeText(join(tests, 'k.test.ts'), '// BP:k2');

    const result = run([bp, tests, '--only', 'BP:k1,BP:k2,SM:take']);

    assert.equal(result.status, 1, result.stderr);
    assert.deepEqual(missingLines(result.stdout), ['BP:k1', 'SM:take.T01']);
  });

  test('--only covers whole segments: BP:s1 is BP:s1, BP:s1.x and BP:s1:y, never BP:s10; a prefix ending in : or . stays a prefix', () => {
    const bp = join(root, 'm6', 'blueprint');
    const tests = join(root, 'm6', 'tests');
    writeLock(bp, { ids: ['BP:s1', 'BP:s1.x', 'BP:s1:y', 'BP:s10', 'BP:s10:y', 'SM:song.S01', 'SM:song.S01:timeout', 'SM:take.T01'] });
    mkdirSync(tests, { recursive: true });

    assert.deepEqual(missingLines(run([bp, tests, '--only', 'BP:s1']).stdout), ['BP:s1', 'BP:s1.x', 'BP:s1:y']);
    assert.deepEqual(missingLines(run([bp, tests, '--only', 'SM:song.S01']).stdout), ['SM:song.S01', 'SM:song.S01:timeout']);
    assert.deepEqual(missingLines(run([bp, tests, '--only', 'SM:']).stdout), ['SM:song.S01', 'SM:song.S01:timeout', 'SM:take.T01']);
    assert.deepEqual(missingLines(run([bp, tests, '--only', 'SM:song.']).stdout), ['SM:song.S01', 'SM:song.S01:timeout']);
  });
});

describe('stale ids (--base)', () => {
  let root = '';
  before(() => {
    root = tempDir();
  });
  after(() => {
    rmSync(root, { recursive: true, force: true });
  });

  test('a changed hash with no changed test is reported; touching the test clears it', () => {
    const { repo, base, bp, tests } = repoWithBase(root, 's1');
    writeLock(bp, withHashes({ steps: { a1: 'aaaaaaaaaaaa' } }));
    commitAll(repo, 'plan change');

    const before = run([bp, tests, '--base', base]);
    assert.equal(before.status, 1, before.stderr);
    assert.deepEqual(staleIds(before.stdout), ['BP:a1']);
    assert.match(before.stdout, /\b1 stale\b/);

    writeText(join(tests, 'all.test.ts'), ALL_IDS_TEST + '// BP:a1 follows the new plan\n');
    const after = run([bp, tests, '--base', base]);
    assert.equal(after.status, 0, after.stdout + after.stderr);
    assert.deepEqual(staleIds(after.stdout), []);
    assert.match(after.stdout, /\b0 stale\b/);
  });

  test('a test changed in a later commit, or a new untracked test, counts as touched', () => {
    const committed = repoWithBase(root, 's2');
    writeLock(committed.bp, withHashes({ steps: { a1: 'aaaaaaaaaaaa' } }));
    writeText(join(committed.tests, 'a1.test.ts'), "test('BP:a1', () => {});\n");
    commitAll(committed.repo, 'plan change with its test');
    const viaCommit = run([committed.bp, committed.tests, '--base', committed.base]);
    assert.equal(viaCommit.status, 0, viaCommit.stdout + viaCommit.stderr);

    const untracked = repoWithBase(root, 's3');
    writeLock(untracked.bp, withHashes({ steps: { a1: 'aaaaaaaaaaaa' } }));
    commitAll(untracked.repo, 'plan change');
    writeText(join(untracked.tests, 'new', 'a1.test.ts'), "test('BP:a1', () => {});\n");
    const viaUntracked = run([untracked.bp, untracked.tests, '--base', untracked.base]);
    assert.equal(viaUntracked.status, 0, viaUntracked.stdout + viaUntracked.stderr);
  });

  test('endpoints map to BP:<step>[.<id>], transitions to SM:<key>; an extending id satisfies', () => {
    const { repo, base, bp, tests } = repoWithBase(root, 's4');
    writeLock(
      bp,
      withHashes({
        endpoints: { 'POST /things': 'bbbbbbbbbbbb', 'GET /things/{id}': 'cccccccccccc' },
        transitions: { 'thing.T01': 'dddddddddddd' },
      }),
    );
    commitAll(repo, 'plan change');

    const untouched = run([bp, tests, '--base', base]);
    assert.equal(untouched.status, 1, untouched.stderr);
    assert.deepEqual(staleIds(untouched.stdout), ['BP:a1', 'BP:a1.get', 'SM:thing.T01']);

    // BP:a1:happy extends BP:a1 at ':' and SM:thing.T01:timeout extends SM:thing.T01;
    // neither extends BP:a1.get.
    writeText(join(tests, 'touched.test.ts'), "test('BP:a1:happy', () => {});\ntest('SM:thing.T01:timeout', () => {});\n");
    const touched = run([bp, tests, '--base', base]);
    assert.equal(touched.status, 1, touched.stderr);
    assert.deepEqual(staleIds(touched.stdout), ['BP:a1.get']);
  });

  test('boundary: a changed test carrying BP:a10 does not satisfy a changed BP:a1', () => {
    const { repo, base, bp, tests } = repoWithBase(root, 's5');
    writeLock(bp, withHashes({ steps: { a1: 'aaaaaaaaaaaa' } }));
    commitAll(repo, 'plan change');
    writeText(join(tests, 'a10.test.ts'), "test('BP:a10', () => {});\n");

    const result = run([bp, tests, '--base', base]);

    assert.equal(result.status, 1, result.stderr);
    assert.deepEqual(staleIds(result.stdout), ['BP:a1']);
  });

  test('a changed file outside the tests dir, or in a skipped dir, does not count as a touched test', () => {
    const { repo, base, bp, tests } = repoWithBase(root, 's6');
    writeLock(bp, withHashes({ steps: { a1: 'aaaaaaaaaaaa' } }));
    writeText(join(repo, 'src', 'a1.ts'), '// implements BP:a1\n');
    writeText(join(tests, 'dist', 'a1.test.js'), '// built from BP:a1\n');
    writeText(join(tests, 'a1.notes.md'), 'BP:a1\n');
    commitAll(repo, 'plan change and code, no test');

    const result = run([bp, tests, '--base', base]);

    assert.equal(result.status, 1, result.stderr);
    assert.deepEqual(staleIds(result.stdout), ['BP:a1']);
  });

  test('--only narrows the stale list too: with --only BP:k3 a changed SM:song.S06 is not reported', () => {
    const repo = join(root, 's7');
    const bp = join(repo, 'docs', 'blueprint');
    const tests = join(repo, 'tests');
    mkdirSync(repo, { recursive: true });
    git(repo, 'init', '-q');
    const lock: LockInput = {
      ids: ['BP:k3', 'SM:song.S06'],
      steps: { k3: { hash: '555555555555' } },
      transitions: { 'song.S06': { hash: '666666666666' } },
    };
    writeLock(bp, lock);
    writeText(join(tests, 'all.test.ts'), "test('BP:k3', () => {});\ntest('SM:song.S06', () => {});\n");
    const base = commitAll(repo, 'base');
    writeLock(bp, {
      ...lock,
      steps: { k3: { hash: 'eeeeeeeeeeee' } },
      transitions: { 'song.S06': { hash: 'ffffffffffff' } },
    });
    commitAll(repo, 'plan change in two areas');

    const unscoped = run([bp, tests, '--base', base]);
    assert.equal(unscoped.status, 1, unscoped.stderr);
    assert.deepEqual(staleIds(unscoped.stdout), ['BP:k3', 'SM:song.S06']);

    const scoped = run([bp, tests, '--base', base, '--only', 'BP:k3']);
    assert.equal(scoped.status, 1, scoped.stderr);
    assert.deepEqual(staleIds(scoped.stdout), ['BP:k3']);

    writeText(join(tests, 'k3.test.ts'), "test('BP:k3 follows the new plan', () => {});\n");
    const touched = run([bp, tests, '--base', base, '--only', 'BP:k3']);
    assert.equal(touched.status, 0, touched.stdout + touched.stderr);
    assert.deepEqual(staleIds(touched.stdout), []);
  });
});

describe('stale ids when the lock is new', () => {
  let root = '';
  before(() => {
    root = tempDir();
  });
  after(() => {
    rmSync(root, { recursive: true, force: true });
  });

  test('a lock absent at the base has nothing to compare: no stale ids', () => {
    const repo = join(root, 'n1');
    const bp = join(repo, 'docs', 'blueprint');
    const tests = join(repo, 'tests');
    mkdirSync(repo, { recursive: true });
    git(repo, 'init', '-q');
    writeText(join(tests, 'all.test.ts'), ALL_IDS_TEST);
    const base = commitAll(repo, 'tests before the blueprint');
    writeLock(bp, BASE_LOCK);
    commitAll(repo, 'blueprint arrives');

    const result = run([bp, tests, '--base', base]);

    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /^Stale: 0 \(no lock at /m);
  });
});

describe('exit codes', () => {
  let root = '';
  before(() => {
    root = tempDir();
  });
  after(() => {
    rmSync(root, { recursive: true, force: true });
  });

  test('0 when nothing drifted, 1 when an id is missing', () => {
    const { repo, base, bp, tests } = repoWithBase(root, 'e1');
    assert.equal(run([bp, tests]).status, 0);
    assert.equal(run([bp, tests, '--base', base]).status, 0);

    writeLock(bp, { ...BASE_LOCK, ids: [...BASE_LOCK.ids, 'BP:a2'] });
    commitAll(repo, 'new step');
    assert.equal(run([bp, tests, '--base', base]).status, 1);
  });

  test('2 when --base is not a git ref', () => {
    const { bp, tests } = repoWithBase(root, 'e2');

    const result = run([bp, tests, '--base', 'no-such-ref']);

    assert.equal(result.status, 2);
    assert.match(result.stderr, /no-such-ref.*not a git ref/);
  });

  test('2 when --base is given and the blueprint is not in a git repository', () => {
    const bp = join(root, 'e3', 'blueprint');
    const tests = join(root, 'e3', 'tests');
    writeLock(bp, { ids: ['BP:a1'] });
    writeText(join(tests, 'a1.test.ts'), '// BP:a1');

    const result = run([bp, tests, '--base', 'HEAD']);

    assert.equal(result.status, 2);
    assert.match(result.stderr, /not inside a git repository/);
  });

  test('2 when the lock is absent or the arguments are wrong', () => {
    const empty = join(root, 'e4');
    mkdirSync(empty, { recursive: true });

    const noLock = run([empty, empty]);
    assert.equal(noLock.status, 2);
    assert.match(noLock.stderr, /blueprint-lock\.json/);

    const noArgs = run([]);
    assert.equal(noArgs.status, 2);
    assert.match(noArgs.stderr, /usage:/);
  });
});

describe('--base reaches git as a ref, never as an option', () => {
  let root = '';
  before(() => {
    root = tempDir();
  });
  after(() => {
    rmSync(root, { recursive: true, force: true });
  });

  test('--base=--output=<file> exits 2 and creates no file', () => {
    const { bp, tests } = repoWithBase(root, 'g1');
    const target = join(root, 'g1-injected');

    const result = run([bp, tests, `--base=--output=${target}`]);

    assert.equal(result.status, 2, result.stdout + result.stderr);
    assert.match(result.stderr, /not a git ref/);
    assert.deepEqual(readdirSync(root).filter((name) => name.startsWith('g1-injected')), []);
  });

  // git rev-parse --end-of-options is what lets a ref look like an option; without it the name below is parsed as a
  // flag and the check cannot run. (The --output= case above exits 2 either way on git 2.34: rev-parse has no
  // --output, and the ^{commit} suffix spoils any option it does have.)
  test('a ref whose name starts with a dash is still a ref', () => {
    const { repo, base, bp, tests } = repoWithBase(root, 'g2');
    git(repo, 'update-ref', 'refs/tags/-base', base);
    writeLock(bp, withHashes({ steps: { a1: 'aaaaaaaaaaaa' } }));
    commitAll(repo, 'plan change');

    const result = run([bp, tests, '--base=-base']);

    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.deepEqual(staleIds(result.stdout), ['BP:a1']);
  });
});
