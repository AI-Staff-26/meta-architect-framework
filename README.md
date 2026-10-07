# Meta-Architect Framework (MAF)

A framework of roles, rules and skills that turns an AI coding agent into a disciplined engineering team. An architect agent orchestrates and delegates to specialised agents — coder, reviewer, debugger, DevOps, advisors. Work is graded by complexity, gated by plans and review, and kept continuous across sessions by a file-based project memory.

Current version: see [`VERSION`](VERSION). History: [`CHANGELOG.md`](CHANGELOG.md).

## Install (Claude Code)

MAF is the framework part of `~/.claude`: `CLAUDE.md`, `agents/`, `skills/`, `rules/`. The rest of `~/.claude` (`settings.json`, `projects/`, sessions, credentials, caches) is your local state and not part of MAF.

**Fresh machine** (no `~/.claude` yet):

```bash
git clone https://github.com/AI-Staff-26/meta-architect-framework.git ~/.claude
```

**Existing `~/.claude`** — turn it into a checkout without touching personal files:

```bash
cd ~/.claude
git init -b main
git remote add origin https://github.com/AI-Staff-26/meta-architect-framework.git
git fetch origin
git checkout -b main --track origin/main
```

`git checkout` stops if your own `CLAUDE.md`, `agents/`, `skills/` or `rules/` would be overwritten. Move them aside, then run the checkout again.

`.gitignore` is a whitelist: it ignores everything except the framework files (`CLAUDE.md`, `agents/`, `skills/`, `rules/`, `VERSION`, `CHANGELOG.md`, `README.md`, `.github/`), so settings and session state never show up in `git status`.

## Update

```bash
git -C ~/.claude pull --ff-only
```

## Check the version

```bash
cat ~/.claude/VERSION
git ls-remote --tags --refs https://github.com/AI-Staff-26/meta-architect-framework 'v*' | sed 's#.*/##' | sort -V | tail -1
```

The first command prints the installed version (`2.0.0`), the second the latest release tag (`v2.0.0`). When the latest tag is newer, update.

## Versions and projects

MAF follows semantic versioning; [`CHANGELOG.md`](CHANGELOG.md) states what MAJOR, MINOR and PATCH mean here. Using MAF in a project means the **latest release**.

## Other harnesses

Hermes, Codex, Cursor and other harnesses use an adaptation of MAF rather than this checkout. An adaptation must state which MAF version it adapts, and must be updated with each MINOR and MAJOR release.

## Access and questions

Write to the repository owner, [@Haik-G](https://github.com/Haik-G).
