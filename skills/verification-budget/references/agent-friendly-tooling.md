# Agent-friendly check tooling

The contract from `SKILL.md` §3, made concrete: one command, a short verdict on screen, the full log on disk, an honest exit code, safe to run twice.

## The runner contract

```text
<runner> [file…|--changed|--all]
  → stdout: summary line, each failure (name, file:line, assertion, ≤ 10 stack lines), slowest 5
  → full log: .logs/test-<scope>-<timestamp>.log (path printed last)
  → exit 0 only when everything selected passed
```

Keep it a script in the repo (`scripts/test.sh`, a `package.json` script, a `Makefile` target), named in the project's README and in `memory/` — an agent that has to rediscover the command each session pays for it every session.

## Short verdict, full log — per runner

Most runners can emit two reports at once: a terse one to the terminal and a complete one to a file.

| Runner | Terse on screen, full to file |
|---|---|
| `node --test` | `--test-reporter=dot --test-reporter-destination=stdout --test-reporter=spec --test-reporter-destination=$LOG` (reporters pair with destinations in order; `dot` prints no counts — the wrapper reads them from the log's tail) |
| Vitest | `--reporter=dot --reporter=junit --outputFile.junit=$LOG` |
| Jest | `--silent --json --outputFile=$LOG`, and in the config `reporters: [['summary', { summaryThreshold: 0 }]]` — by default `summary` prints failure details only above 20 suites, and reporter options cannot be passed on the CLI |
| pytest | `-q -rfE --tb=short --durations=5` plus `--junitxml=$LOG` (or `> $LOG` and print the tail) |
| Go | `gotestsum --format dots --jsonfile "$LOG" -- ./...` — keeps `go test`'s exit code |
| Playwright | `--reporter=line,json` with `PLAYWRIGHT_JSON_OUTPUT_NAME=$LOG`; an `html` reporter serves its report and waits on failure unless `PLAYWRIGHT_HTML_OPEN=never` |

Some runners already switch to terse output when they detect an AI agent (recent Vitest, Bun under `CLAUDECODE=1`); an explicitly configured reporter overrides that detection, so check which one wins.

When the runner cannot split its output, the wrapper does it: run with the full reporter into the log, then print only the summary and the failure blocks (`grep -A` on the runner's failure marker, or parse the JUnit XML).

## Affected tests

The rung between "the file" and "the full suite" — what depends on what changed.

| Ecosystem | Built in |
|---|---|
| Vitest | `vitest related <files> --run`; `vitest --changed [ref]` |
| Jest | `--findRelatedTests <files>`; `--changedSince=<ref>` |
| Playwright | `--only-changed=<ref>` — changed test files and the test files that import changed files; end-to-end tests rarely import application code, so mapping touched pages and routes to scenarios is the project's job |
| pytest | `pytest-testmon` (`--testmon`) — coverage-based selection |
| Go | `go test ./...` — the test result cache reruns only packages whose inputs changed, importers included |
| Monorepos | `nx affected -t test`, `turbo run test --filter=...[ref]`, Bazel |

Where nothing is built in (plain `node --test`, custom harnesses): build the reverse import graph of the test files — parse relative imports transitively, keep the tests whose closure contains a changed path. Every graph-based selector misses dynamic imports and non-code inputs: a config, fixture, schema or template change selects everything — the wrapper decides that and says so in the output.

After a red run, the cheapest rerun is the failures alone: `pytest --lf`, `jest --onlyFailures`, `playwright test --last-failed`. On the lower rungs stop at the first failure: `pytest -x`, `jest --bail`, `vitest --bail=1`, `go test -failfast`.

## The stamp — one commit, one run

A release gate that reruns the suite on a commit that just passed it pays the full cost for no new evidence. Record the verdict instead:

1. After a green full run, write `.stamps/<sha>` with: the commit, the lockfile hash, a hash of what is installed (e.g. `node_modules/.package-lock.json`, `pip freeze`), the runtime version, a hash of the ignored inputs the tests read (`.env.test`, generated code) and of the environment variables they read, and the time.
2. Write it only when the tree is clean (`git status --porcelain` empty, untracked files included) — otherwise the run did not test the commit.
3. The gate reads the stamp for the commit it ships. Every field matches → skip the suite, say so in the gate's output. Anything differs or is missing → run the suite as before.
4. Everything the suite cannot prove still runs: build from a clean checkout, install strictly from the lockfile, migrations on a copy, boot and smoke.

Go's test cache is the same idea built into the toolchain; CI systems get it from caching keyed by commit.

## A fast suite

- **Deliberate slowness only where it is the subject.** Password hashing, key derivation, rate-limit windows: test parameters everywhere, the real parameters in the one test that verifies them.
- **Parallel by isolation.** One database or schema per worker; shared fixtures read-only. A suite that waits on one lock runs on one core however many it has.
- **Events over timers.** Wait for the child's "ready" line or the request's response, with a generous ceiling as a safety net. A tight timer turns neighbour load into red builds.
- **A size knob on generated tests.** Small by default, large nightly; print the seed on failure so the case can be replayed.
- **Profile before optimising.** The runner's per-test durations usually show a few dozen tests holding most of the time.

## Background runs

Long runs go to the background with their output in the log; the agent continues and is told when the run ends. Polling a running suite by re-reading its log fills the window with progress lines nobody needs.
