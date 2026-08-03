---
name: checklist-infra
description: |
  Verification for infrastructure work — containers, CI/CD pipelines, secrets,
  deployment safety, developer environment, observability, and OS hardening,
  each item carrying a severity. Use when reviewing a Dockerfile, a compose
  file, pipeline yaml, or a deploy script, when `devops` self-checks before
  calling work done, and before any infrastructure change reaches staging or
  production. `workflow-devops` builds these things; this verifies them.
---

# Infrastructure Verification

`workflow-devops` is the build side; this is the verify side. The same subjects appear in both because building it and proving it are different acts — and the second one is where the container running as root and the secret in the compose file get caught.

**Verify against the artifact, not the intention.** Read the Dockerfile, run the command, inspect the container, open the pipeline log. An item confirmed from memory of how it was set up is the item most likely to be wrong.

Severity governs what blocks: 🔴 and 🟠 must be clear before anything ships. Items that do not apply are marked as such with a reason — silence reads as passed.

---

## Severity Classification

| Level | Meaning | Action |
|-------|---------|--------|
| 🔴 CRITICAL | Security breach, data loss, system down | Must fix before any deployment |
| 🟠 BLOCKER | Breaks functionality, missing safety net | Must fix before merge |
| 🟡 WARNING | Risk or quality issue, workaround exists | Fix soon, document if deferred |
| 🟢 SUGGESTION | Better practice, nice to have | Backlog item |

---

## CHECKLIST-1: Docker & Containers

```markdown
### Image Quality
- [ ] Base image version pinned (not :latest) 🔴
- [ ] Official or verified publisher image used 🟠
- [ ] Multi-stage build used to minimize final image size 🟡
- [ ] .dockerignore exists and excludes: node_modules, .env, .git, *.log 🟠

### Security (Container)
- [ ] Container runs as non-root USER 🔴
- [ ] No secrets in ENV instructions or image labels 🔴
- [ ] No --privileged flag without documented justification 🔴
- [ ] Unnecessary packages not installed in final stage 🟡

### Runtime
- [ ] HEALTHCHECK defined in Dockerfile or compose 🟠
- [ ] Exposed ports documented and minimal 🟡
- [ ] Resource limits set (mem_limit, cpus) for prod compose 🟡
- [ ] restart: unless-stopped or on-failure set for prod 🟠

### docker-compose
- [ ] Named volumes used (not anonymous) 🟡
- [ ] Internal network defined (services not on host network) 🟠
- [ ] env_file used (not inline env values with secrets) 🔴
- [ ] depends_on with condition: service_healthy 🟡
```

---

## CHECKLIST-2: CI/CD Pipeline

```markdown
### Security
- [ ] All secrets via CI secret store (not in yaml files) 🔴
- [ ] Secrets appear as [masked] in logs 🔴
- [ ] GITHUB_TOKEN / CI token scoped to minimum permissions 🟠
- [ ] No third-party actions used without pinned commit SHA 🟠

### Pipeline Structure
- [ ] Fail-fast ordering: lint → test → build → deploy 🟠
- [ ] Dependency cache configured (npm, pip, go) 🟡
- [ ] Build artifacts uploaded between jobs (not rebuilt) 🟡
- [ ] Deploy step only runs on protected branches 🔴

### Quality Gates
- [ ] Unit tests required before build 🟠
- [ ] Security scan (SAST/SCA) present or planned 🟡
- [ ] No deploy to prod without staging validation 🔴
- [ ] Manual approval gate for production deployments 🟡

### Reliability
- [ ] Pipeline timeout configured 🟡
- [ ] Flaky tests identified and quarantined 🟡
- [ ] Failure notifications configured 🟠
```

---

## CHECKLIST-3: Secrets Management

```markdown
### Code & Repository
- [ ] No secrets committed to git (search: git grep -i "password\|secret\|token") 🔴
- [ ] .env is in .gitignore 🔴
- [ ] .env.example committed with placeholder values and comments 🟠
- [ ] No hardcoded API keys or passwords in any source file 🔴

### Runtime
- [ ] All secrets injected via environment variables 🟠
- [ ] Secrets not echoed in logs or error messages 🔴
- [ ] docker inspect shows no secrets in container env labels 🔴
- [ ] Secret rotation process documented 🟡

### Secret Manager (if used)
- [ ] Secrets scoped to minimum required permissions 🟠
- [ ] Access auditing enabled 🟡
- [ ] Expiry / rotation policy configured 🟡
```

---

## CHECKLIST-4: Deployment Safety

```markdown
### Pre-Deploy
- [ ] All tests passing on target branch 🔴
- [ ] Docker image tagged with semver (not :latest for prod) 🟠
- [ ] DB migrations reviewed and tested on staging 🔴
- [ ] Rollback command documented and tested 🔴
- [ ] Deployment runbook exists or inline in CI step 🟡

### Deployment Strategy
- [ ] Zero-downtime strategy in use for prod (Blue-Green / Rolling) 🟠
- [ ] Health checks pass before old version is terminated 🔴
- [ ] Feature flags in place for risky features 🟡

### Post-Deploy
- [ ] Health endpoint verified after deployment 🔴
- [ ] Error rate baseline unchanged (monitoring) 🟠
- [ ] Critical user flow verified 🟠
- [ ] Deployment event logged / notified 🟡
```

---

## CHECKLIST-5: Developer Environment

```markdown
### Reproducibility
- [ ] Runtime version pinned (.nvmrc / .python-version / .tool-versions) 🟠
- [ ] Single-command bootstrap documented (make setup / ./scripts/bootstrap.sh) 🟡
- [ ] README includes prerequisites and setup steps 🟠
- [ ] Works on clean machine / fresh container 🟡

### Hygiene
- [ ] .editorconfig present 🟡
- [ ] .gitignore covers: .env, *.log, build outputs, IDE files 🟠
- [ ] No dev-only tools required globally (use local installs) 🟡
- [ ] Containerized services used for DB / cache / queue 🟡
```

---

## CHECKLIST-6: Monitoring & Observability

```markdown
### Logging
- [ ] Structured JSON logs in production 🟠
- [ ] No sensitive data in logs (passwords, tokens, PII) 🔴
- [ ] Log levels used correctly (debug/info/warn/error) 🟡
- [ ] Log rotation configured (no unbounded disk growth) 🟠

### Health & Metrics
- [ ] /health endpoint returns 200 when service is up 🟠
- [ ] /ready endpoint checks dependencies (DB, cache) 🟡
- [ ] Key metrics instrumented (request count, latency, errors) 🟡

### Alerting
- [ ] Alert defined for error rate spike 🟠
- [ ] Alert defined for resource saturation (CPU, memory, disk) 🟡
- [ ] Deployment events notify on-call / team channel 🟡
- [ ] Alert routing tested (fires and reaches recipient) 🟠
```

---

## CHECKLIST-7: System Hardening (OS/Server)

```markdown
### Service Hygiene
- [ ] Running services audited — unused ones disabled 🟡
- [ ] Each disabled service has documented justification 🟡
- [ ] System stable after service changes (reboot tested) 🟠

### Network
- [ ] Firewall configured: deny by default, allow by exception 🟠
- [ ] Unused ports closed 🟠
- [ ] UPnP disabled unless explicitly needed 🟡
- [ ] SSH: key auth only, root login disabled 🔴

### Updates & Patches
- [ ] OS security updates applied 🟠
- [ ] Automatic security updates enabled or scheduled 🟡
```

---

## Output Format

Use this format when reporting checklist results:

```markdown
## 🏗️ Infrastructure Review: [Component Name]

### ✅ PASS / ❌ FAIL / ⚠️ CONDITIONAL PASS

### Issues Found:

#### 🔴 CRITICAL
1. [Description] — [File/Location] — [Fix]

#### 🟠 BLOCKER
2. [Description] — [File/Location] — [Fix]

#### 🟡 WARNING
3. [Description] — [Recommended fix]

### Verified ✅:
- [x] Item 1 — passed
- [x] Item 2 — passed

### Decision:
PASS: All 🔴 and 🟠 items clear
FAIL: [N] critical / blocker issues must be resolved before deployment
```

## Completion criterion

Done when: every checklist that applies has been walked against the actual artifact; each item is passed with where it was verified, failed with its fix, or marked not applicable with a reason; every 🔴 and 🟠 is resolved or explicitly accepted by the user; and the rollback path named in the deployment section has been executed at least once in a rehearsal.

## Related

- `workflow-devops` — building the infrastructure this verifies
- `checklist-security` — application-level security: auth, input, data
- `checklist-release` — the Go / No-Go gate this feeds
- `checklist-code-review` — the code inside the containers
