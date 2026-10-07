---
name: authoring-skills
description: |
  Write and maintain framework text — SKILL.md files, agent definitions,
  rules, CLAUDE.md. Use when creating or pruning a skill, writing a
  description, editing an agent, or deciding what belongs always-on. Covers
  frontmatter fields and IDE paths for .claude/, .cursor/, .windsurf/,
  .kilocode/.
---

# Authoring Framework Text

A skill exists to wrangle determinism out of a stochastic system. **Predictability** — the agent taking the same _process_ every run, not producing the same output — is the root virtue. Every rule below serves it.

This applies to every artifact the framework ships: `SKILL.md` files, agent definitions in `agents/`, rules in `rules/`, and `CLAUDE.md` itself.

## The two loads

Every line you write spends one of two budgets:

- **Context load** — text sitting in the window every turn. `CLAUDE.md`, `rules/*` reached by `@import`, and every skill `description`. Priced per turn, forever.
- **Cognitive load** — text the human must remember exists in order to reach it. User-invoked skills spend this.

A line that earns neither budget is waste. Move it down the hierarchy or delete it.

## Information hierarchy

Rank material by how immediately the agent needs it, and push each piece as far down as it will go:

1. **Always-on rule** (`CLAUDE.md`, `@import`ed rules) — the few laws that change behaviour on *every* task. Routing, language, gates.
2. **Skill step** — an ordered action in `SKILL.md`. What the agent does, in order.
3. **Skill reference** — a definition or rule in `SKILL.md`, consulted on demand.
4. **External file** — reference pushed into `references/*.md`, reached by a pointer, loaded only when the pointer fires.

**Progressive disclosure** is the move down this ladder. Inline what every path needs; push behind a pointer what only some paths reach. A pointer's *wording*, not its target, decides how reliably the agent follows it.

Once material has a rung, **co-locate**: keep a concept's definition, rules, and caveats under one heading rather than scattered.

## Completion criteria over counters

End every step with the condition that tells the agent it is done. Make it:

- **Checkable** — the agent can tell done from not-done by looking.
- **Exhaustive** where it matters — "every modified model accounted for", not "produce a change list".

**A criterion beats a count.** "Ask 15–20 questions" and "ask 5–8 questions" are the same mistake in opposite directions: both let the agent stop while the work is unfinished, and both force it to keep going when the work is done. Write the state you want instead — "every branch of the decision tree is resolved, and the user has confirmed shared understanding". The number is a proxy; the state is the thing.

## Prompt the positive

Steering by prohibition backfires: _don't think of an elephant_ names the elephant and makes it more available, not less. State the target behaviour, so the unwanted one is never spoken.

| Instead of | Write |
|---|---|
| ❌ Do not change architecture | Implement the design as specified; architectural changes go back to the architect |
| ❌ Never skip the handoff | Close every delegation with a handoff |
| ❌ Don't guess | State what you verified, and how |
| ❌ No `any` in TypeScript | Type every value; where the type is genuinely unknown, use `unknown` and narrow |

Keep a prohibition only as a hard guardrail you cannot phrase positively — and even then pair it with what to do instead. A wall of ❌ trains the agent to skim past all of them, including the one that mattered.

## Single source of truth

Each meaning lives in exactly one place, so changing the behaviour is a one-place edit. When two files need the same rule, one states it and the other points at it by name.

Duplication costs more than tokens: it inflates a meaning's apparent rank on the hierarchy past its real one, and it rots — copies drift until they contradict each other, and the agent obeys whichever it read last.

## Leading words

A **leading word** is a compact concept already in the model's pretraining that the agent thinks with while running the skill — _tight_, _red_, _seam_, _tracer bullet_, _fog of war_, _deep module_. One token recruits priors that would otherwise cost a paragraph.

It pays twice. In the body it anchors execution: the agent reaches for the same behaviour every time the word appears. In the description it anchors invocation: when the same word lives in the user's prompts and the project's docs, the agent links that shared language to the skill and fires it more reliably.

Hunt for restatements a leading word retires — "fast, deterministic, low-overhead" collapses into _tight_; "a test you believe in" collapses into _red_.

## Failure modes

Diagnose a misbehaving skill against this list:

- **Premature completion** — a step ends before the work is genuinely done, attention slipping to *being done*. First sharpen the completion criterion; only if it is irreducibly fuzzy, split the skill so later steps stop tempting the agent past the current one.
- **Duplication** — the same meaning in more than one place.
- **Sediment** — stale layers that settle because adding feels safe and removing feels risky. Names of roles that no longer exist, pointers to deleted files, advice for a workflow since replaced. The default fate of any text without a pruning discipline.
- **Sprawl** — simply too long, even where every line is live. Cure with the hierarchy: disclose reference behind pointers, split by path.
- **No-op** — a line the model already obeys by default, so you pay load to say nothing. Test: does it change behaviour versus the default? "Be thorough" is a no-op; the fix is a stronger word, not more words.
- **Negation** — steering by prohibition (see *Prompt the positive*).
- **Counter instead of criterion** — a number standing in for a state (see *Completion criteria over counters*).

## Pruning

Run this pass whenever you touch a file:

1. **Relevance** — does each line still bear on what this does?
2. **No-ops** — test each *sentence* in isolation. When one fails, delete the whole sentence rather than trimming words from it. Be aggressive: most prose that fails should go, not be rewritten.
3. **Sediment** — grep for every role name, file path, and skill name the text mentions; confirm each still exists.

**Completion criterion:** every sentence in the file either changes behaviour versus the default or is a pointer to material that does, and every name it references resolves.

---

## Mechanics

### When to create a skill

Create a skill when content is too detailed for an always-on rule, is relevant only to specific tasks, and is self-contained enough to load independently.

Keep it in a rule instead when it is a one-liner guardrail every session needs. Then the rule names the skill, and the skill holds the detail — the rule never restates it.

### Frontmatter fields

```yaml
---
name: my-skill                  # Required. Used for /name invocation.
description: >                  # Required. The matching surface for auto-loading.
  What this covers and when to use it. Include file names and keywords.
argument-hint: '<pr-number>'    # Optional. Hint for expected arguments.
user-invocable: false           # Optional. Set false to hide from the / menu.
disable-model-invocation: true  # Optional. Set true to make it human-only.
allowed-tools: [Bash, Read]     # Optional. Tools allowed without permission.
model: opus                     # Optional. Model override.
context: fork                   # Optional. Isolated subagent execution.
agent: Explore                  # Optional. Subagent type (with context: fork).
---
```

Fields outside this list are silently ignored.

### Invocation: who can reach it

- **Model-invoked** (default — omit `disable-model-invocation`): the agent can fire it autonomously, *and other skills can reach it*. The `description` is model-facing and carries rich trigger phrasing. Costs context load every turn.
- **User-invoked** (`disable-model-invocation: true`): only the human, typing its name. Zero context load; costs cognitive load. The `description` becomes human-facing — a one-line summary.

Choose model-invoked when the agent must reach it on its own, or when another skill must compose it. A shared primitive that other skills invoke — such as `grilling` — must be model-invoked, or those skills cannot reach it.

### Writing the description

**The description does one job: fire the skill at the right moment.** It is a matching surface, not a summary — every word that explains rather than matches is paid on every turn forever and returns nothing, because by the time anyone reads the explanation they have already loaded the body that explains it better.

So: **triggers, not identity.**

- **Enough subject to disambiguate, then triggers.** A handful of words placing the skill, then the branches that should fire it — the phrasings a user actually types, in every language they type in, plus the concrete file names and keywords they would mention.
- **One trigger per branch.** Synonyms renaming a single branch are duplication; collapse them.
- **Front-load the leading word** — the description is where it does its invocation work.
- **Route the near miss.** One clause naming the sibling skill for the adjacent case, where confusing the two is likely.
- **Say nothing the body says.** The thesis, the method, the rationale, the section list — all of it is body. A description that reads like an abstract has bought identity with always-on budget.

The three shapes, worst to best:

- *Too vague, will not fire:* "Helps with flags."
- *Bloated — an abstract of the body, priced per turn forever:* "A flag is a branch that lives in production: shipping one ships both paths and the obligation that comes with them. Covers the four flag types and their lifespans, the fallback when the store is unreachable, consistent bucketing for percentage rollouts, and cleanup as part of the work that created it…"
- *Right — subject, triggers, one routing clause:* "Feature flags: gradual rollout, kill switch, A/B experiment, per-plan entitlements and limits, trunk-based development, making a rollback a switch. Triggers: «фича-флаг», «выкатить на часть пользователей». Whether this actor may act at all → `pattern-rbac`."

**Descriptions and the routing table move together.** `CLAUDE.md`'s skills table is what makes a skill reachable deliberately; the description is what makes it reachable by accident. Trimming a description for a skill that has no row is how a skill disappears.

### File layout

```
skills/my-skill/
├── SKILL.md          # Required: frontmatter + content
└── references/
    └── detail.md     # Optional: reached by a pointer from SKILL.md
```

Name skills short, descriptive, hyphenated, with no repo prefix — the folder already scopes them.

### IDE folder paths

| IDE | Skills folder | Rules folder | Auto-activation |
|-----|---------------|--------------|-----------------|
| **Claude Code / Antigravity** | `.claude/skills/` | `.claude/rules/` | ✅ Excellent |
| **Cursor** | `.cursor/skills/` or `.claude/skills/` | `.cursor/rules/` | ⚠️ Good |
| **Windsurf** | `.windsurf/skills/` or `.claude/skills/` | `.windsurf/rules/` | ⚠️ Good |
| **KiloCode** | `.kilocode/skills/` | `.kilocode/rules/` | ✅ Excellent |
| **VS Code + Continue** | `.continue/` (config.json) | — | ❌ Manual |

For maximum portability use `.claude/` — Cursor and Windsurf read it directly.

| Field | Claude Code | Cursor | Windsurf | KiloCode |
|-------|-------------|--------|----------|----------|
| `name`, `description` | ✅ | ✅ | ✅ | ✅ |
| `user-invocable` | ✅ | ⚠️ | ⚠️ | ✅ |
| `allowed-tools` | ✅ | ❌ | ❌ | ✅ |
| `model` | ✅ | ⚠️ | ⚠️ | ✅ |
| `context` | ✅ | ❌ | ❌ | ✅ |

### Versioning

A change to framework text that changes behaviour bumps `VERSION` and adds a `CHANGELOG.md` entry **in the same commit**. Choose the level by what projects must do about it:

- **MAJOR** — roles, gates, laws or the memory format change in a way projects must adapt to: a memory migration, a new mandatory step.
- **MINOR** — a new or extended skill, agent or rule that stays backward compatible.
- **PATCH** — wording or fixes with no change in behaviour.

The release workflow tags the commit and publishes the `CHANGELOG.md` section as the release; it warns when framework files changed without a bump.

**Completion criterion:** `VERSION` equals the newest `## [x.y.z]` heading in `CHANGELOG.md`.

## Framework improvement patterns from external sources

When researching external skill frameworks (Superpowers, Matt Pocock skills)
for ideas to integrate into our Meta-Architect Framework:

**Superpowers (obra/superpowers, 267k★):**
- **Iron Law pattern** — short unconditional rule in code block at top of each
  key skill: `NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST`. Models see it
  and cannot "forget". Stronger than our completion criterion.
- **Verification before completion** — separate gate: evidence before claims.
  Table: claim → requires → not-sufficient. Solves "models say 'done' without checking".
- **Subagent prompt templates** — concrete implementer/reviewer/re-review
  templates, not abstract "delegation laws"
- **Fix loop with escalation** — R≤3 resume, R≥4 fresh agent, R=5 BLOCKED

**Matt Pocock skills (mattpocock/skills, 41 skills, 2823 lines):**
- Radical minimalism (average skill ~69 lines)
- Positive framing instead of NEVER rules
- Completion criteria instead of step counters
- Grilling pattern (one question at a time, recommended answer)
- Deep modules vocabulary

When giving these to Claude Code for framework improvement, provide the
**analysis document path** and let Claude Code read it — don't summarize the
findings into the task prompt (it constrains rather than informs).

Detailed analyses (2026-07/08): ByteRover context tree under
`development/skills/` (meta_architect_vs_matt_pocock_comparison,
skill_improvements_to_adopt_from_matt_pocock, matt_pocock_skills_repository)
and `agent_frameworks/agency_agents/operations/superpowers_matt_pocock_meta_architect`.
Original cache files `cache/skills-analysis/superpowers-vs-meta-architect.md`
and `mattpocock-skills-analysis.md` were pruned; the git commit
`264bcb3` of the profile repo holds the deleted ultracode skill with this block
inline if the raw text is ever needed.

## Related

- `skill-creator` — creating skills with evals and measured performance
- `framework-knowledge-base/references/ide-compatibility.md` — detailed IDE setup
