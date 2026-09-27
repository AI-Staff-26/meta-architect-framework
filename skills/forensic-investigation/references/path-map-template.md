# Path map — when fixes close one path and review finds the next

A path map enumerates every way the system reaches a sensitive effect, and every
place that later trusts the result. It turns "patch the path the review found"
into "make the whole class impossible". Build it before the first implementation
prompt for auth, access, money or a sandbox — or after two FAILs in one area.

It is an investigation artifact: the investigator builds it, the architect turns
it into decisions, and a fresh implementer receives both. The implementer who
wrote the patches does not build it — they would defend their design.

## 1. Paths

List every entry point — HTTP route, CLI command, background job, exposed
library endpoint or hook, **client auto-action** (a page that posts on load) —
that does any of:

| Code | Effect (adapt to the area) |
|---|---|
| A | sets or changes a trust attribute (email verified, role, token scope) |
| B | creates or changes a credential |
| C | creates or extends a session or token |
| D | grants, changes or removes access; consumes an invitation |
| E | spends a shared scarce resource (mail, SMS, money) or its counters |
| F | creates a principal (user, token, link) |

For each path, one row:

| # | Entry (file:line) | Effects | Who can trigger it | Checks present | Trust conferred | Consumed by |
|---|---|---|---|---|---|---|

"Who can trigger it" is precise: anonymous · any session · capability X ·
possession of a token delivered to **whose** mailbox.

## 2. Trust graph and chains

For each consumer of trust (direct add to a team, permission to invite,
password reset, API scope), list all producers. Mark every producer an attacker
can drive **without controlling the victim's mailbox and account together** —
each mark is an attack chain. Write the chains out step by step and confirm them
with probes on a test instance; keep the probes — they become permanent tests.

Consider explicitly: squatter accounts registered on someone else's address;
mail scanners that open links and execute JavaScript; the victim clicking while
signed in to a different account; concurrent sessions; token-type confusion; the
CLI; races between a slow step (password hashing, remote call) and a revocation.

## 3. Shared resources

Model every counter. Compute the worst case that an attacker with (a) no account,
(b) the cheapest foothold, (c) one verified account can force into each bucket.
Find refunds and per-new-principal limits that multiply. Name the legitimate
flow that starves (usually the owner's password reset).

## 4. Invariants

The output is not a patch list. It is the smallest set of invariants that makes
the chains impossible, each with:

- **statement** — e.g. "the verified flag is written by one function, and only on
  a proof binding mailbox and account together";
- **choke point** — the one file that enforces it;
- **negative tests** — including a static test that fails if the effect appears
  outside the choke point;
- **user-story conflicts** — and the least surprising way to keep the story.

## Output

The artifact (English, `docs/research/<area>-paths.md` or the project's research
location) and a summary: path table, chains (confirmed / hypothetical, with probe
output), worst cases, invariants with choke points and tests, conflicts.
