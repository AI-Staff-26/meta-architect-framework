---
name: checklist-security
description: |
  Security verification: auth, authorization, input validation, API surface,
  data protection, secrets, logging, and the tests that prove it. Use when a
  change touches auth, user or payment data, a public endpoint, an external
  integration, uploads, PII, or a feature that calls a model or agents. The
  Security axis of `checklist-code-review`.
---

# Security verification

**Start from what the change opens to the outside.** The full list below is read in a minute and ticked in a minute — that is how a check turns into a ritual. It works the other way round: first name the new surface — which input became reachable from outside, which data became easier to reach, who can now reach what — and from there walk the sections that close that surface.

Sections the change does not touch are marked not applicable, with the reason. A section marked «ok» without a check is worse than a skipped one: it looks checked.

A weakness is found along the path of the data: where it came from → whom we trust → what we do with it → where it ended up. Each hop is a place where a check either exists or does not.

---

## 🧭 Neighbouring paths and trust

Everyone checks the main path; the hole is usually on a **neighbouring** one — where the same result is reached through another entrance. For every action the change protects, answer:

- [ ] **How many paths lead to the same result** — set a password, create or extend a session, grant access, issue a token, send an email, spend a shared resource? Does each have the same checks: Origin, session, limit, rule, authorisation, log?
- [ ] **Who writes an attribute that is trusted later** — an «email confirmed» flag, a role, a token's scope? Can a path weaker than its consumer write it? Does the write go through one function, and does a test catch a bypass?
- [ ] **What happens under N parallel requests** to limits, one-time tokens, the «last owner» rule, counter reservations?
- [ ] **A per-user limit when users multiply** — can it be bypassed by creating new accounts, links or tokens?
- [ ] **A write after which the response failed** — does it stay, and who checks it?

When these questions cannot be answered without combing the code, the area is unmapped — it needs a path map: `forensic-investigation/references/path-map-template.md`. Techniques that check these questions by running: `references/attack-techniques.md`.

---

## 🔐 Authentication

### Mechanisms

- [ ] Passwords are hashed (bcrypt/argon2, not MD5/SHA1)
- [ ] No passwords stored in plain text
- [ ] Session tokens are long and random enough
- [ ] JWTs are signed with a strong algorithm (RS256, never `none`)
- [ ] JWTs have a reasonable TTL

### Session management

- [ ] The session is invalidated on logout
- [ ] Session timeout is implemented
- [ ] Session fixation is prevented
- [ ] Cookies carry the Secure and HttpOnly flags
- [ ] The SameSite attribute is set
- [ ] Session properties handed to a library (lifetime, renewal, revocation on password change) are confirmed by a test against its behaviour, not by reading its settings
- [ ] A login does not create a session that outlives a password change or reset that happened while the password was being checked

### Multi-factor

- [ ] MFA is available for critical operations (where required)
- [ ] MFA cannot be bypassed
- [ ] Recovery codes are protected

---

## 🛡️ Authorisation

### Access checks

- [ ] Authorisation is checked at every level (API, service, data)
- [ ] No access to other users' resources (IDOR protection)
- [ ] Least privilege holds
- [ ] Default deny — access is refused unless granted

### RBAC / permissions

- [ ] Roles and permissions are defined correctly
- [ ] No privilege escalation
- [ ] Admin functions are protected
- [ ] Tenant isolation (for multi-tenant)

### API authorisation

- [ ] Every endpoint requires authentication (except the explicitly public ones)
- [ ] Rate limiting is implemented
- [ ] No bulk access to data (batch enumeration)

---

## ✅ Input validation

### Validation

- [ ] All input is validated on the server
- [ ] Allow-list approach: what is allowed is explicit, the rest is refused
- [ ] Types and formats are validated
- [ ] Input size is limited
- [ ] File uploads are validated (type, size, content)

### Sanitisation

- [ ] HTML entities are escaped
- [ ] Special characters are handled
- [ ] The client's Content-Type is not trusted

### Injection prevention

- [ ] Prepared statements / parameterised queries (SQL)
- [ ] The ORM is used correctly (no raw SQL with user input)
- [ ] Command arguments are escaped
- [ ] LDAP injection is prevented
- [ ] XML/XXE attacks are prevented

---

## 🌐 API security

### Transport

- [ ] HTTPS is mandatory (HTTP redirects)
- [ ] TLS 1.2+ (not SSL, not TLS 1.0/1.1)
- [ ] The HSTS header is set
- [ ] Certificate validation is on

### Headers

- [ ] Content-Security-Policy is set
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY or SAMEORIGIN
- [ ] Referrer-Policy is set
- [ ] CORS is configured correctly (no wildcard for authenticated requests)

### API design

- [ ] No sensitive data in URLs
- [ ] No secrets in query parameters
- [ ] No verbose error messages with internal details
- [ ] API versioning is implemented

---

## 💾 Data

### Storage

- [ ] Sensitive data is encrypted at rest
- [ ] Encryption keys are protected
- [ ] Backups are encrypted
- [ ] No sensitive data in logs

### Transmission

- [ ] Data is encrypted in transit (TLS)
- [ ] No sensitive data in query strings
- [ ] Secure channels between services

### Retention

- [ ] A retention policy is defined
- [ ] A deletion mechanism is implemented (GDPR)
- [ ] No excess data is collected

---

## 🔑 Secrets and configuration

### Secrets management

- [ ] No hardcoded credentials in code
- [ ] No secrets in git history
- [ ] Secrets live in a vault or environment variables
- [ ] Secrets are rotated regularly
- [ ] Different secrets for different environments
- [ ] Secrets are never passed as command arguments (argv is visible in `ps`) — only the environment or a 0600 file
- [ ] A secret the agent received or generated itself — a key pasted into chat, a password from `--generate`, credentials in a knowledge file — lives in a vault or a 0600 file; documents name it only by reference

### Configuration

- [ ] No debug mode in production
- [ ] No default passwords
- [ ] Configuration is not publicly exposed
- [ ] Defaults are safe

---

## 📝 Logging and monitoring

### Logging

- [ ] Authentication and authorisation are logged
- [ ] Suspicious events are logged
- [ ] No PII in logs
- [ ] No secrets in logs
- [ ] No stack traces in production responses to clients
- [ ] Proven by a run: the path executes with a sentinel secret, including a forced failure on every write path (a database constraint, a library error), and the sentinel appears in no channel — the application log, a library's stderr, the reverse proxy's log, error bodies, responses

### Monitoring

- [ ] Alerts on brute-force attempts
- [ ] Alerts on anomalous activity
- [ ] Audit trail for critical operations

---

## 🤖 LLM and agent features

When the product itself calls a model or agents.

- [ ] Model output, retrieved content, tool output, memory and messages between agents are validated like user input
- [ ] Every invariant a prompt states («never send to external addresses») is also enforced in code, right before the side effect, and a test feeds a model response that violates it
- [ ] An irreversible action the model can trigger requires authorisation for that operation and that resource, plus confirmation or a scoped pre-approval
- [ ] **Rule of two:** within one session an agent has at most two of — processing untrusted input; access to sensitive systems or private data; the ability to change state or communicate externally. A task that needs all three splits, so the step needing the third starts a fresh session that carries none of the untrusted input — or it runs under human approval or another reliable validation
- [ ] Each agent gets only the tools and data its role needs; credentials and tokens are not passed between agents
- [ ] Context that does not fit is never truncated silently: the pipeline stops and reports what it could not carry
- [ ] Each model call and agent step is logged with a shared trace id, so a wrong answer can be traced to the step that produced it
- [ ] A changed agent or prompt is checked against a recorded set of cases — ordinary, edge and adversarial — before it ships
- [ ] Tool output is read with a size limit; unparseable output is a typed failure, never an empty success
- [ ] Code that reads another system's screen, panel, page or format is checked against what that system really shows now — its live population, or a sample that covers it, read-only — before «an unfamiliar shape is rare» becomes a reason to let it through unchecked (fail-open)

---

## 🧪 Testing

### Security testing

- [ ] Security unit tests are written
- [ ] Negative tests (what must NOT work)
- [ ] Boundary tests for validation
- [ ] Injection tests (where applicable)
- [ ] Concurrent scenarios: N parallel requests to limits, one-time tokens, «last owner»
- [ ] After a full scenario, the log holds not a single issued token

### Review

- [ ] The code is reviewed for security issues
- [ ] Dependencies are checked for vulnerabilities
- [ ] Static analysis passes

---

## Severity classification

| Level | Examples | Action |
|-------|---------|----------|
| 🔴 Critical | RCE, auth bypass, SQLi, data leak | STOP — fix immediately |
| 🟠 High | XSS, CSRF, privilege escalation | Fix before deploy |
| 🟡 Medium | Information disclosure, weak crypto | Fix in the next iteration |
| 🟢 Low | Missing headers, verbose errors | Track and fix |

---

## Finding format

Each finding is a place, an impact and a fix — not the name of a vulnerability class:

```markdown
🔴 IDOR in `GET /api/orders/:id` — `src/api/orders.ts:42`
Authentication is checked, but not that the order belongs to the user.
Any signed-in client reads other users' orders by enumerating ids.
Fix: check `order.userId === session.userId` in the service layer.
```

Five places where findings cluster: user input reaching SQL or a command line without parameters; an endpoint without a permission check next to endpoints that have one; a secret in code, a log or git history; a detailed internal error returned to the client; data sent over plain HTTP.

## Completion criterion

The check is done when: the surface the change opened is named; every section is either walked, saying where exactly it was checked, or marked not applicable with the reason; every finding has a place, an impact and a fix; for 🔴 and 🟠 it is stated what happens when it is exploited; and the new behaviour has a negative test — one that fails when the protection is removed.

## Related skills

- `checklist-infra` — secrets and access on the deployment side: CI, containers, environments
- `checklist-code-review` — the general review whose Security axis this deepens
- `checklist-release` — the pre-release gate that calls this check
- `pattern-rbac`, `pattern-multi-tenant` — when permissions and tenant isolation are being designed rather than checked
- `references/attack-techniques.md` — techniques for checking by running: the CSRF matrix, parallel requests, forged headers, path bypasses, neighbouring paths, chains
