---
name: checklist-release
description: |
  The Go / No-Go decision before production. Use before a release, a first
  deploy, or a major version, and on "готовы ли мы к релизу". Depth comes
  from `checklist-code-review`, `checklist-security`, `checklist-infra`.
---

# Go / No-Go

This is a decision, not an inspection. The inspections already happened — in review, in the security pass, in the infrastructure check. What this gate asks is narrower and harder: **what happens if this is wrong, and how fast can we undo it?**

A release blocked here is cheap. A release that ships broken with no rehearsed rollback is the expensive kind, and the expense is paid by whoever is on call.

## The seven questions

Each is answered by naming evidence — a command, a run, a person — never by "yes".

**1. Is the code actually finished?** Everything planned is in, everything in got a PASS from `review`, no blocking defect is open, and the feature flags are set the way production needs them rather than the way the last test left them.

**2. Do the gates pass on the artifact being shipped?** The full suite, the linter, the build — run on the commit that is deploying, not on one from earlier in the day. Depth: `checklist-code-review`.

**3. Has security been looked at, for these changes?** Anything touching auth, permissions, user data, external input, or dependencies gets `checklist-security`. Dependencies scanned, nothing new and known-vulnerable, no secret anywhere in the repository or the image.

**4. Is the infrastructure ready?** Staging matches production closely enough for its result to mean something, configuration and secrets exist in the target environment, migrations have run against production-shaped data, and a backup taken before the deploy has been verified by restoring it. Depth: `checklist-infra`.

**5. Will you see it break before your users tell you?** Health checks answer, logs arrive somewhere you will look, the error-rate and latency alerts exist and have fired at least once in a test, and someone specific receives them.

**6. Can you undo it, and has anyone done so?** The rollback is a written command or procedure, rehearsed — not deduced. The abort thresholds are numbers agreed before the deploy, so the decision under pressure is a comparison rather than an argument. If a migration makes rollback impossible past a certain step, that step is marked and the recovery path for it is agreed with the user in advance.

**7. Is anyone there?** The deploy happens when people who can respond are available, stakeholders know it is happening, and the release is tagged so the next person can tell what shipped.

## The decision

**GO** requires all seven answered with evidence. Anything unanswered is a No-Go — an unanswered question is not a small risk, it is an unmeasured one.

**GO with known issues** is legitimate when the issue is understood, bounded, documented in the release notes, and has a follow-up task that exists. Written down, it is a decision; unwritten, it is the thing everyone forgets until it recurs.

| Severity | What it means | Effect |
|---|---|---|
| 🔴 **Blocker** | Security hole, possible data loss, core flow broken | No-Go, no exceptions |
| 🟠 **Critical** | A major capability broken or a significant regression | No-Go for a planned release; hotfix only under an explicit call |
| 🟡 **Major** | Broken with an acceptable workaround | Go, if written into the release notes with its follow-up task |
| 🟢 **Minor** | Cosmetic, rare edge case | Go |

State the verdict plainly, with what it rests on: **GO — [evidence]** or **NO-GO — [what is unanswered or broken]**.

## After the deploy

Verification is part of the release, not the next task. The critical user flows are exercised in production; error rate and latency are compared against the pre-deploy baseline rather than judged by eye; the logs are read for anything new.

If the abort threshold is crossed, roll back first and diagnose after. A rollback under way is recoverable; a debugging session with users on the broken version is not.

Then close it: release notes and tag published, `memory/` updated, and a post-mortem scheduled if anything went wrong — while the details are still recoverable.

## Completion criterion

Decided when: all seven questions carry evidence rather than assertions; the verdict names what it rests on; every known issue shipped with the release has a written follow-up; the rollback has been rehearsed and its thresholds agreed; and post-deploy verification was run and its result recorded.

## Related

- `checklist-code-review` — the code gate this one assumes has happened
- `checklist-security` — the security pass for anything sensitive
- `checklist-infra` — containers, pipeline, secrets, deployment safety
- `workflow-devops` — building the deployment this verifies
