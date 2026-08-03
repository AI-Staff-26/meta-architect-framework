---
name: framework-knowledge-base
description: |
  Answers questions about the Meta-Architect Framework itself — how it is
  installed, why it is shaped this way, what to do when it misbehaves, and
  which file defines what. Use when the user asks "как работает фреймворк",
  "зачем нужен STOP", "почему агент не сработал", "как поставить в проект",
  "чем отличается X от Y", or asks about roles, gates, delegation, memory, or
  IDE setup. For writing or editing framework text, use `authoring-skills`.
---

# The Framework, Documented

Two kinds of question arrive here. *How does this work?* is already answered by the framework itself — it is written to be read. *Why is it built this way?* is what this skill holds.

**Answer from the source, never from a copy kept here.** A catalog of roles or skills in this folder would be a second set of definitions, and copies drift until the agent believes whichever it read last. When asked what an agent or a skill does, open its file and quote it.

## Where each answer lives

| Question | Source |
|---|---|
| What binds every task — language, complexity, gates, roles | `CLAUDE.md` |
| What a given agent owns and how it works | `agents/<name>.md` |
| Which skill fits this work | `skills/README.md`, then that skill's own `description` |
| What gets recorded, when, and by whom | `rules/memory-protocol.md` |
| The format of a memory file, ADR, wiki entry, or work report | `memory-keeping` |
| How framework text is written and pruned | `authoring-skills` |
| Why the framework is shaped this way | `references/framework-overview.md` |
| How to install it and run the first task | `references/getting-started.md` |
| Something behaves wrong — agent, skill, gate, memory | `references/troubleshooting.md` |
| Which IDE reads which folder | `references/ide-compatibility.md` |

## Answering well

Name the file the answer came from — it lets the user verify it and find it again without you.

A question about the current project's state is a different question: `memory/CONTEXT.md`, `memory/FACTS.md`, and `memory/repo-wiki/` answer that, not this skill.

When the question is a request for action wearing a question mark — «а как бы ты добавил X?» — answer briefly, then do the work through the normal route rather than continuing to describe it.

When the framework has no answer, say so and say what would fill the gap. An invented convention becomes real the moment someone follows it.

## Completion criterion

Answered when: the answer names its source file; nothing was restated from memory that the source contradicts; and any gap found in the framework is either fixed through `authoring-skills` or reported as a gap.

## Related

- `authoring-skills` — writing and editing framework text
- `skill-creator` — building a skill with evals and measured triggering
- `onboarding` — a project with no `memory/PROFILE.md` yet
