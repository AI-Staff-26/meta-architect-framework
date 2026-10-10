# Agent workspaces — trees, stands, cleanup

Where an agent physically works: which git tree, which running instance, which database, and who removes them afterwards. Every parallel lane needs all of these; every one left behind costs disk, memory and the next agent's confusion.

## 1. One tree by default

Agents work one at a time in the main tree — `SKILL.md`, *Decompose*, holds why. A separate tree earns its cost in four cases only:

| Case | Why a separate tree |
|---|---|
| **A parallel lane** — work that must run alongside another and may touch overlapping files | Two writers in one tree commit each other's half-finished work |
| **A check on an old commit** — «the test is red without the fix» | The main tree must stay on the work |
| **Mutations** — breaking a guard on purpose to see its test go red | A mutation must never reach another agent's test run or a commit |
| **A reviewer's copy** | The reviewer reads and runs a fixed commit while implementation moves on |

Disjoint file sets in parallel (infrastructure in `deploy/` beside a feature in `src/`) stay in one tree — each agent commits only its own paths.

## 2. Setting one up

- **For a delegated agent:** the Agent tool's `isolation: "worktree"` creates a tree for it; an unchanged tree is removed automatically, a changed one stays with its branch — someone owns merging and removing it.
- **By hand:** `git worktree add <known path> -b <branch> <base>` — a path named in the prompt (e.g. `<repo>-wt/<lane>`), never a random temp name nobody will find.
- **The prompt names everything the lane owns:** the tree's path and branch, the base commit, its stand port, its database or schema, where its scratch goes.
- **Budget the install.** Each tree needs its own dependency install and build — minutes and hundreds of megabytes. A short check (one test on an old commit) can reuse the main tree's installed packages by linking them when the lockfile is the same in both commits, instead of a fresh install.

## 3. Test stands

A stand is a running instance of the product for checks that need a live server: end-to-end scenarios, review by attack, screenshots.

- **One command** starts, resets and stops it, and prints what it runs: the commit, the port, the log and mail paths, the file of test accounts.
- **Its own port and its own database or schema** per lane; the ports of production, the stand and the release rehearsal are written down once in the project's memory and never shared.
- **Test accounts** live in a known file with mode 0600, seeded by the stand's command — never typed into prompts or command lines.
- **Production is never a stand.** Probes, attacks and screenshots go to the stand; production gets only the release gate's smoke check and the architect's look after a deploy.
- **When the repository is the deployment** — `memory/PROFILE.md` → *Runtime* says `live-from-tree` — there is no separate stand to send checks to. The stand is then the runner's fence (`verification-budget` §3): state in scratch directories, live paths read-only. A smoke run of the real program sets every path override explicitly, and the report lists them. *Runtime* empty → read the mode from the host as `onboarding` describes, and record it.
- **Restart from the commit under check**, and say which one in the report — a stand running an older build has produced many false greens.
- **Stop it when nobody is using it.** It starts in seconds; idle, it holds memory on a shared machine.
- **Runs that share a database wait on a lock**, not on luck: two full suites or two e2e runs against one database corrupt each other's state.

## 4. Merging and shipping

- **The architect merges lanes**, in dependency order, and resolves conflicts — the lane agents do not merge each other.
- **Ship only a commit whose every line passed review.** A merge of a reviewed commit with an unreviewed branch is unreviewed.
- **After a lane lands, the next prompt re-checks its pinned tests** against `git log <prompt approval>..HEAD -- <tests>` — the other lane may have pinned behaviour the next prompt changes.

## 5. Cleanup belongs to the delegation

Whoever created a tree or a stand removes it when the delegation ends — not at the end of a stage, when nobody remembers what each one was for.

- `git worktree remove --force <path>` — never a recursive delete of a tree's directory, which leaves git's record of it behind;
- `git worktree prune` for records whose directory is already gone;
- `git branch -d <branch>` once it is merged (`-d` refuses an unmerged branch — that refusal is the check);
- stop the stand; remove the scratch directory the prompt named.

The report of the delegation lists what it removed and what it deliberately left running, with the reason.

**Done when:** `git worktree list` shows only trees with a live owner and purpose; no stand runs without one; every scratch directory belongs to a running delegation.
