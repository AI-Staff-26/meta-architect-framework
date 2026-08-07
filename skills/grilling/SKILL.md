---
name: grilling
description: |
  Interview the user relentlessly about a plan, decision, or idea until every
  branch of the decision tree is resolved. The reusable interview primitive —
  reach for it whenever requirements are vague, a design has unexamined
  branches, or another skill needs to align with the user before acting
  (requirements gathering, planning, triage, architecture review). Triggers:
  "погрилль", "grill me", "уточни требования", "задай вопросы", "давай обсудим",
  vague or one-line feature requests.
---

# Grilling

Interview the user relentlessly until you reach **shared understanding**. Walk down each branch of the decision tree, resolving dependencies between decisions one at a time.

This is a primitive. Other skills invoke it rather than restating it — see *Composing* below.

## The loop

**One question at a time.** Wait for the answer before asking the next. A batch of questions is bewildering and gets one vague answer covering none of them.

**Look up facts; ask about decisions.** If something can be discovered from the filesystem, the codebase, the git history, or a tool, go and find it. Spending the user's attention on what you could have read is the fastest way to lose it. The *decisions* are theirs: put each one to them and wait.

**Carry a recommended answer.** Every question ships with the answer you would pick and the one-line reason. This lets the user accept in a word, and it surfaces your assumptions where they can be corrected instead of leaving them silent.

**Blocking unknowns first.** Anything the build depends on that the user has not decided — payment provider, hosting, API keys, accounts, data ownership, the deadline — goes in the opening questions. Discovering at the finish line that there is no Stripe account wastes everything built on the assumption there was one.

**Follow the fog.** A resolved question usually reveals the next one. Keep going while answers keep opening branches; the tree is done when answers stop changing anything downstream.

## Unknowns you cannot resolve

When the user is unreachable, or defers, and the work has to proceed anyway: mark the gap `PLACEHOLDER — уточнить у пользователя`, in the artifact itself, at the point where the decision belongs. Then carry it into every downstream artifact — the spec, the plan, the final report — so it stays visible until answered.

Marking is what makes an assumption reviewable. A silently invented answer looks identical to a decided one, and the difference surfaces only after it is expensive.

## Composing

Invoke this skill by name from any skill that needs alignment before acting — `workflow-requirements-interview`, `workflow-feature`, `workflow-architecture-change`, `checklist-ux-design`. Those skills supply the *domain* questions; this one supplies the *loop*.

While grilling a codebase project, keep the domain language current as decisions land: when a term is resolved or sharpened, write it to the project glossary right then rather than batching it up.

## Completion criterion

When the tree stops opening branches, state the resolved picture back in a short summary — in your own words, not a replay of theirs. The restatement is what makes the gap visible: when the user corrects it, that correction is the requirement.

Grilling is done when **both** hold:

- Every branch you have surfaced is either resolved or explicitly marked `PLACEHOLDER`, and no answer given has opened a branch you have not put to the user.
- The user has confirmed that restatement. **Silence is not confirmation**, and a follow-up question is not confirmation — answer it and restate again.

**The count of questions is not the criterion.** Five may exhaust a one-file change; forty may not exhaust a payments integration. Asking a fixed number stops early on hard work and pads easy work. Resolve the tree.
