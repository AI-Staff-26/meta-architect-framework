---
name: pattern-rbac
description: |
  RBAC: the `resource:action:scope` permission grammar, scopes, one
  authorisation service, cache invalidation on revoke. Use when designing
  access control, or on "роли и права", "разграничение доступа". Isolation
  between tenants → `pattern-multi-tenant`; what a plan includes →
  `pattern-feature-flags`.
---

# Role-Based Access Control

**The permission is the unit of the check; the role is only how permissions are bundled.** Code that asks about a role has hardcoded today's org chart into a conditional, and the first customer who wants a different one turns every call site into a change.

So every check names a capability, and roles are data: a mapping from role to permissions that can be edited, granted, and audited without a deploy.

## The naming grammar is the interface

The permission string is what every layer agrees on — route, service, UI, seed data, audit log. Settle it before code, because renaming one later touches all of them at once.

```
resource:action[:scope]

order:read            any order
order:update:own      only orders this actor owns
report:export:team    anything owned by the actor's team
user:*                every action on users
*:read                read anything
```

Wildcards buy brevity and cost precision. `*:*` is the one grant nobody can audit by reading it: a resource added next quarter is already granted to whoever holds it. Keep wildcards to a small set of system roles and write leaf permissions wherever a customer-visible role is defined.

Actions stay a closed vocabulary — create, read, update, delete, plus the domain verbs that genuinely differ, such as `approve`, `export`, `refund`. Any verb someone might want to grant separately is its own action; folding `approve` into `update` means everyone who can edit an order can approve it.

## Scope is the row-level half

"May edit orders" and "may edit their own orders" are the same role and different permissions. The `all` / `own` / `team` axis is exactly what a role-only system cannot express.

A system without scope grows a second, informal authorisation layer inside its query filters: the endpoint checks the role, and a `WHERE owner_id = ?` buried in a repository decides the real answer. That filter *is* authorisation — invisible to a security review, and impossible to enumerate across endpoints.

The tenant filter is the exception, because it is a different kind of thing: an invariant applied by construction rather than a decision about this actor. `pattern-multi-tenant` draws that line, and the two filters stack — tenant first, then scope.

So scope resolves where the permission does. The authorisation service returns the scope it matched, and the caller either hands it the resource for the ownership check or takes the filter from it — never invents one.

## One seam for the question

Every check goes through a single authorisation service, server-side, **deny by default**: no matching permission is a refusal, and an unrecognised permission string is a refusal too.

Place the check where the capability lives — in the application service that performs the action, not only in the controller. A controller-only check is bypassed the day that service is also called from a background job, a CLI command, another module, or a second transport. The controller may still check early to fail cheaply; the service is what makes it true.

What the UI hides is presentation. Hiding a button the user cannot use is good design and never enforcement, because the endpoint is reachable without the UI. The frontend reads the same permission strings so the two cannot drift.

## Role hierarchy

Inheritance keeps role definitions small, and its cost is direction: a permission added to a parent lands on every leaf beneath it, immediately, without anyone editing those roles. Whoever edits a parent audits the leaves, and the change is reviewed as a grant to every role below — because that is what it is.

Past two or three levels nobody can state what a leaf role can do without walking the graph, which was the property roles existed to provide.

## The cache and its invariant

Resolving permissions per request means a join per request, so caching the resolved set is close to mandatory at any real size. It creates the invariant people forget: **a revoked role that stays cached is a live privilege**, for as long as the TTL.

The invalidation event therefore exists before the cache does. A role edited, a membership changed, a permission set changed — the resolved entry for every affected actor is dropped, not left to expire. TTL is the backstop for what the event missed, not the mechanism. Key the entry so invalidation can reach it: `perm:{userId}` per actor, plus a role-version stamp when one role edit must reach thousands of actors without enumerating them.

## When RBAC stops fitting

Three signals, and each means the model has outgrown roles: conditions start depending on the *resource's* attributes (an amount over a threshold, a document's state, the time of day) or on a *relationship* (a member of this particular project) rather than on the actor; the scope set keeps growing past all/own/team; every new customer wants a new role and the role table outgrows the customer table.

That is ABAC or ReBAC, and the honest move is to name the escalation rather than bolt on a fifth scope. The check signature changes at every call site, so it is `workflow-architecture-change` with an ADR of its own.

## Failure modes

| Symptom | What it means | Direction of fix |
|---|---|---|
| A role name compared in a conditional | The org chart is compiled into the code | Replace with the capability that branch actually needs |
| Check in the controller, service reachable from a job | The seam sits at the transport, not the capability | Move it into the application service; keep the controller check as a cheap early refusal |
| A super-admin path with no audit trail | The most powerful actor is the least observed | Log actor, permission, target, and outcome for every privileged action |
| Lists filter by owner, writes check only the role | Scope is enforced on read and not on write | Authorise the write against the loaded resource, same permission and scope |
| A revocation lands and access continues | A cached entry outlived its role | Invalidate on the role and membership events; TTL is only the backstop |

## Adopting it

Adopt it when a role's permission set has to change without a deploy, or when a customer will define roles you did not ship. Two kinds of user separated by one `is_admin` flag do not earn a catalogue, a service, and an invalidation event — that check is a permission written early, and the catalogue arrives with the third kind.

🔴 — auth, by the signals in CLAUDE.md's complexity table, which is where the gate lives. The change routes through `checklist-security` regardless of size, and the ADR records the permission catalogue with each action's scope semantics: every later feature is written against it. Format in `memory-keeping`.

## Completion criterion

Done when: every check names a permission and no role name is compared outside the seed data; the grammar and the full permission catalogue are written down with each action's scope semantics; every wildcard grant sits in a system role, and each parent-role permission has been reviewed as a grant to every leaf beneath it; the authorisation service is the single server-side path, denies by default, and is called from the application service rather than only the controller; scope is enforced on writes as well as reads, against the loaded resource; every role and membership change invalidates the resolved cache by event; privileged use is audited with actor, permission, target, and outcome; and tests cover a denied permission, a wrong-scope denial, and a revocation taking effect immediately.

## Related

- `checklist-security` — the verification pass this change routes through
- `pattern-multi-tenant` — the wall between tenants; this skill draws the roles inside one
- `pattern-feature-flags` — entitlements: whether the plan includes the capability at all
- `codebase-design` — placing the authorisation seam so callers cannot route around it
- `workflow-architecture-change` — the move to ABAC or ReBAC once RBAC stops fitting
