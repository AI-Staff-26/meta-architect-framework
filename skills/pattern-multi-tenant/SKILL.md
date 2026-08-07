---
name: pattern-multi-tenant
description: |
  Multi-tenancy: isolation strategy (database, schema, or row per tenant),
  tenant resolution, and the paths that silently drop the tenant — jobs,
  caches, files, exports, logs, migrations. Use for SaaS, B2B, white-label,
  or when `tenant_id` is about to enter the schema. Triggers:
  "мультиарендность", "изоляция тенантов".
---

# Multi-Tenancy

**Isolation is an invariant, and it holds only as well as the one path that forgets it.** Ninety-nine queries filtered by tenant and one that is not is not ninety-nine percent isolated — it is breached, and the breach is usually reported by a customer who saw someone else's data.

So the filter is not the work — writing one is the easy part. The work is the inventory of places where the tenant is dropped by default rather than by decision, and closing each one with a mechanism instead of a habit.

## Choose the strategy from compliance and scale

| Strategy | Isolation | Operational cost | Migrations & backup | Cross-tenant reporting | Blast radius of one mistake |
|---|---|---|---|---|---|
| **Database per tenant** | Physical — the wrong connection holds nothing to leak | Highest: N databases, N pools, provisioning | N migration runs; per-tenant restore is trivial | Needs its own aggregation path | One tenant |
| **Schema per tenant** | Strong — the search path is the boundary | Medium: one server, N schemas | N runs, one backup; restore is per schema | Possible via UNION, at a cost | One tenant |
| **Row-level, shared schema** | Logical — a `WHERE` clause is the boundary | Lowest | One run, one backup; single-tenant restore is hard | Free, it is one query | Every tenant at once |
| **Hybrid** — shared pool, dedicated for those who demand it | Per contract | Two code paths forever | Both of the above | Only across the shared pool | Bounded by the pool |

Regulated data, data-residency clauses, or tenants large enough to need their own scaling and SLA push toward a dedicated database. Many small tenants on one product and one price plan push toward row-level — with the database enforcing it (Postgres RLS or the equivalent) rather than the application remembering to. Row-level enforced only in application code is the cheapest option and the one with the largest blast radius. Hybrid is earned by a single enterprise contract the rest of the fleet does not need, and its price is that every leak below has to be closed twice.

## The choice is the point of no return

It reaches every query, migration, backup, job, export, and report. Once tenant data exists, changing it is not a refactor — it is `workflow-architecture-change`: 🔴, phased, reversible per step, with a data migration per tenant and a cutover window.

So it is decided before the first table exists rather than discovered at the first enterprise contract.

## Tenant resolution

| Source | Where it fits | What it costs |
|---|---|---|
| Subdomain — `acme.app.com` | Public entry, white-label, branded login | Wildcard DNS and certificates |
| Path — `app.com/acme` | Simple routing, internal tools | Every route carries the segment, and one will omit it |
| JWT claim | Authenticated app and API traffic | Works only after auth; re-issued on tenant switch |
| Header — `X-Tenant-ID` | Service-to-service, admin tooling | Trusted on its own, it is authorisation by request header |

**The tenant identity comes from something the caller cannot set.** Subdomain, path, and header are routing hints; the tenant is accepted only where it matches the tenant on the authenticated principal, and a mismatch is a refusal logged as a security event rather than a redirect. Unauthenticated entry points — signup, marketing pages — resolve a tenant for presentation only and reach nothing tenant-scoped.

The resolved tenant then lives in a request-scoped ambient context every repository reads, so no call site can forget to pass it, and an absent tenant raises. Defaulting to "no tenant" or "all tenants" is how this failure becomes silent.

## The leak inventory

Every path where the tenant is present in the request and absent by default everywhere else. Walk it against the system; a row with no answer is an open leak.

| Path | How the tenant is lost | What holds it |
|---|---|---|
| Background jobs, queues | The job outlives the request; the ambient context is gone when it runs | `tenantId` is a required field of the payload, and the worker enters the tenant context before touching data |
| Scheduled tasks | Nothing enqueued them, so there was never a request | The schedule iterates tenants explicitly, one context per tenant |
| Cache | Two tenants collide on one key and the second reader gets the first's data | Tenant is the first key segment; invalidation and eviction are per tenant |
| File and blob storage | Paths are built from the entity id alone | Tenant is the top path segment; signed URLs carry it and are checked on read |
| Search indexes | One index, one query, no filter | Index per tenant, or a tenant filter the query builder adds, not the caller |
| Exports, generated reports | Generation is async and the artefact lands in shared storage | The export inherits the requesting tenant; the download is authorised again at fetch |
| Logs, error tracking | Records carry user data with no tenant, so an incident cannot be scoped | Every line carries `tenantId` and names subjects by id, not email |
| Database migrations | Written against one schema, run once | Run per tenant, count reconciled against the tenant list; a partial run fails the deploy |
| Admin and cross-tenant queries | The scoped repository is reused with its filter disabled | A separate path — see below |
| Connection pools | A checked-out connection keeps the previous tenant's session state (search path, RLS variable) | Set on checkout, cleared on release; or a pool per tenant |
| Webhooks, external callbacks | They arrive from outside with no session at all | Tenant encoded in the endpoint URL with a per-tenant signing secret, verified before the payload is parsed |
| Provisioning a new tenant | It is created after the last migration ran, so its storage starts behind | Provisioning runs the full migration set and seeds, then reconciles against the tenant list |

The shapes that make the tenant visible at a glance in review:

```
cache key    tenant:{tenantId}:user:{userId}
blob path    {tenantId}/invoices/{invoiceId}.pdf
```

## Cross-tenant operations are their own path

Admin dashboards, fleet analytics, billing rollups, and support impersonation get a repository or read model of their own, reachable only behind an explicit super-admin check. Reusing the tenant-scoped repository with the filter switched off — a null tenant, a `skipTenantFilter` flag — is how an admin feature becomes a data breach: one code path now serves both cases, and a single wrong caller crosses the wall in silence.

Such a path aggregates rather than returning tenant rows wherever the question allows it, and every call is audited with actor, tenants touched, and reason. Impersonation enters one named tenant, is time-boxed, and is visible to that tenant.

## Proving isolation

For every repository, a test in which tenant B requests tenant A's row **by id** and receives nothing — the direct read, not a filtered list. Isolation asserted in prose is an intention, and it survives exactly until the first hand-written query.

Extend the same shape across the inventory: a job enqueued by A and run cold, a cache read attempted across tenants, an export requested by B for A's id, a restore that brings back one tenant only. These are what keep each new surface — a job, an export, a restore — from shipping outside the wall. `tdd` holds where such a test belongs.

## Adjacent concerns

**Two filters stack on every query, and they are not the same kind of thing.** The tenant filter is an invariant: ambient, applied by construction, and never the caller's to supply — which is why it lives where no call site can forget it. The actor's scope filter is a decision: it comes back from the authorisation service and has to be enumerable per endpoint, because a security review must be able to list who can reach what. Tenant first, then scope. `pattern-rbac` argues against filters buried in repositories; that argument is about the second one.

What a plan turns on and how much of it — entitlements and per-tenant limits — is `pattern-feature-flags`, keyed by tenant. Branding, locale, and the rest of a tenant's settings belong to the tenant record itself.

## Adopting it

🔴 — architecture and data isolation both, by the signals in CLAUDE.md's complexity table, which is where the gate lives. The ADR is written before any code and records the strategy, the compliance or scale requirement that forced it, the tenant-resolution source, and which paths get a shared-tenant exception. Format in `memory-keeping`.

## Completion criterion

Done when: an ADR records the isolation strategy and the requirement that forced it; tenant identity is derived from the authenticated session and a mismatch is refused and logged; every repository is tenant-scoped by construction and carries a test proving tenant B cannot read tenant A's row by id; every row of the leak inventory has a named mechanism or an explicit "not present in this system"; cross-tenant access runs through a separate audited path and the scoped one has no filter-disabling switch; and migrations, backup, and restore are per tenant, including a tenant provisioned after the last run, with the tenant count reconciled.

## Related

- `checklist-security` — the verification pass over auth, data protection, and the tests that prove them
- `pattern-rbac` — roles and permissions inside a single tenant
- `pattern-feature-flags` — per-tenant entitlements, plan limits, and staged rollout
- `workflow-architecture-change` — changing the isolation strategy once tenant data exists
- `memory-keeping` — the ADR format that records the choice
