---
name: workflow-incident
description: |
  Production is down or degraded right now: restore service first, then find
  the cause. Triggers: «прод лёг», «сайт не работает», «упало на проде»,
  «у всех ошибка», «срочно чините», outage, incident, "production is down".
  A bug with time to investigate → `workflow-debugging`.
---

# Production incident

**Restore first, understand second.** While users are hit, every minute spent on the cause is paid by them. The cause still gets found — after service is back, from a timeline written while it happened.

## 1. Declare it

- Tell the owner at once, in one message: what is down, who is affected, since when (best estimate), and what you are about to do.
- Open a timeline file — `memory/weeks/YYYY-WNN/YYYY-MM-DD/incident-<slug>.md`, next to the work reports — and add one chronicle entry, `[issue]`, that points to it; the chronicle stays append-only. Log each action and observation in the file with its time, as you go: by the next morning, memory of an incident is a reconstruction.
- Name what you will touch. A shared host has neighbours: read the host map (`~/.claude/rules/host.md`) before touching a shared service.

## 2. Stabilise

Prefer the step that is reversible and known, in this order:

1. **Roll back what changed last** — a deploy, a config, a dependency in the project's environment, a certificate. A recent change is the usual cause; `git log`, the chronicle, package logs and the host map show what changed.
2. **Restart or switch off** the failing part when no change explains it.
3. **Contain** — disable the feature, show a maintenance page, stop a job that keeps making it worse.

A step waits for the owner, whatever the pressure, when its effect reaches past the failing part: it crosses a data or schema change (a down-migration that drops columns, old code that cannot run against the new schema); it is a host change under `CLAUDE.md` «Host» (a system or global package, a second instance of a service); it touches a shared service another project depends on; or it destroys something — data, a table, history. A step that did not restore service is undone before the next one.

## 3. Diagnose under a clock

- Each hypothesis gets a time box, sized to the harm users are taking and written into the timeline. When it ends without an observation that confirms the hypothesis, move to the next one rather than deeper into the same one.
- Read before you change: logs, service status, the proxy's error log, recent changes. Each change made during the incident goes into the timeline, so the next person can tell a symptom from a side effect.
- Once service is back and the cause is still unknown, the incident is over: the rest is `debug`'s work with `workflow-debugging`.

## 4. Confirm recovery

Recovery is shown, not assumed: the path that failed works through the real interface — a request, a page, a job run — and the evidence goes into the timeline. Then tell the owner what was down, for how long, what restored it, and what is still unknown.

## 5. Review without blame

Within a day, write the review into the incident file:

- the timeline, the impact, and what restored service;
- **what the system allowed** — a missing guard, check, alert or rule — rather than who did it;
- each follow-up, with an owner.

A recurring class gets its counter in `INSIGHTS.md` — the third sighting is answered by a rule, a check or a design change. A change to the machine gets its host-map line. A rule that would have prevented the incident is proposed for the framework.

## Completion criterion

Done when: service is restored and shown working through the real interface; the timeline file exists, with times, and the chronicle points to it; the owner knows what happened, for how long, and what is still open; the review names what the system allowed and gives every follow-up an owner; and the class counter and the host map are updated where they apply.

## Related

- `workflow-debugging` — the root cause, once service is back
- `forensic-investigation` — when an agent's own actions keep causing the failure
- `workflow-devops`, `checklist-infra` — rollback paths and deploy safety
- `rules/memory-protocol.md` — the chronicle, the class counter in `INSIGHTS.md`, the host map
