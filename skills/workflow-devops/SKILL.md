---
name: workflow-devops
description: |
  Structured protocol for infrastructure tasks. Provides step-by-step workflows 
  for Docker, CI/CD, deployment, environment setup, security hardening, 
  secrets management, and observability. Used by `devops` mode and `architect`.
tags:
  - devops
  - workflow
  - docker
  - cicd
  - deployment
  - infrastructure
---

# 🛠️ Skill: workflow-devops

## Purpose

Structured protocol for infrastructure tasks. Activated by **`devops`** mode and **`architect`** when routing infrastructure work. Provides step-by-step workflows for the most common DevOps scenarios.

## When to Load

Load this skill when task involves:
- Docker / docker-compose / container registry
- CI/CD pipeline setup or debugging
- Developer environment bootstrapping (Windows / Linux / Mac)
- Deployment automation (staging / prod)
- Security hardening of OS or services
- Secret management setup
- Monitoring / observability configuration

---

## Workflow Selection

```
Identify task type:
  → "Setup dev environment"          → WORKFLOW-1: Dev Environment Bootstrap
  → "Docker / containers"            → WORKFLOW-2: Container Setup
  → "CI/CD pipeline"                 → WORKFLOW-3: CI/CD Pipeline
  → "Deploy to staging/prod"         → WORKFLOW-4: Deployment
  → "Harden OS / reduce bloat"       → WORKFLOW-5: System Hardening
  → "Secrets / env vars"             → WORKFLOW-6: Secrets Management
  → "Add monitoring / observability" → WORKFLOW-7: Observability
```

---

## WORKFLOW-1: Dev Environment Bootstrap

**Goal:** Reproducible, minimal, clean dev workspace.

### Steps

```
1. ASSESS
   □ OS + version (Windows 11, Ubuntu 22.04, macOS 14...)
   □ Shell (cmd, PowerShell, bash, zsh)
   □ Project stack (Node, Python, Go, etc.)
   □ What's already installed

2. PACKAGE MANAGER
   Windows → winget (built-in) or choco
   macOS   → brew
   Linux   → apt / dnf / nix

3. CORE TOOLCHAIN
   □ Runtime version manager: nvm / pyenv / asdf / mise
   □ Language runtime (pinned version)
   □ Package manager: npm/pnpm/bun, pip, cargo
   □ Version file: .nvmrc / .python-version / .tool-versions

4. CONTAINERIZED SERVICES
   □ Prefer Docker for: DB, cache, queue, email dev server
   □ docker-compose.yml with named volumes, health checks

5. EDITOR CONFIG
   □ .editorconfig (indent, line endings)
   □ Recommended extensions list (extensions.json)

6. SETUP AUTOMATION
   □ SETUP.md or Makefile with single-command bootstrap
   □ make dev / make setup as entry point

7. VERIFICATION
   □ Run bootstrap from scratch on clean machine (or container)
   □ All commands documented

```

---

## WORKFLOW-2: Container Setup

**Goal:** Minimal, secure, production-ready container image.

### Steps

```
1. CHOOSE BASE IMAGE
   □ Use slim/alpine variant
   □ Pin exact version: node:20.11-alpine3.19 (not node:latest)
   □ Verify image on Docker Hub / registry (official / verified)

2. WRITE DOCKERFILE
   □ Multi-stage build (builder → runner stage)
   □ Install dependencies first (layer caching)
   □ Copy source after dependencies
   □ Set non-root USER
   □ Define HEALTHCHECK
   □ Document exposed ports

3. WRITE .dockerignore
   □ node_modules / __pycache__ / .venv
   □ .git / .env / *.log / docs / tests

4. WRITE docker-compose.yml
   □ Named volumes for persistent data
   □ Internal network (not host network)
   □ env_file: .env (never inline secrets)
   □ Resource limits (mem_limit, cpus)
   □ depends_on with condition: service_healthy
   □ restart: unless-stopped for prod

5. VERIFY
   □ docker build --no-cache .
   □ docker compose up --build
   □ curl health endpoint
   □ docker image ls — check size
   □ docker inspect — no secrets in env
```

### Dockerfile Template

```dockerfile
# Stage 1: Builder
FROM node:20.11-alpine3.19 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runner
FROM node:20.11-alpine3.19 AS runner
WORKDIR /app

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY . .

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
```

---

## WORKFLOW-3: CI/CD Pipeline

**Goal:** Fast, reliable, secure automated pipeline.

### Steps

```
1. IDENTIFY JOBS (ordered by fail-fast priority)
   lint → typecheck → unit-test → build → integration-test → security-scan → deploy

2. CACHING
   □ Cache package manager artifacts
   □ Cache build outputs where safe

3. SECRETS
   □ All secrets via CI secret store
   □ Never in yaml / committed files

4. DEPLOYMENT GATE
   □ Deploy only from main/release branches
   □ Require all tests to pass before deploy
   □ Optional: manual approval for prod

5. NOTIFICATIONS
   □ Notify on failure (Slack, email)
   □ Include: branch, commit, failure reason

6. VERIFY
   □ Trigger pipeline on test branch
   □ All stages complete successfully
   □ Secrets not visible in logs
```

### GitHub Actions Template

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit

  build:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Deploy to staging
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: echo "Deploy script here"
```

---

## WORKFLOW-4: Deployment

**Goal:** Automated, observable, rollback-safe deployment.

### Steps

```
1. PRE-DEPLOY CHECKLIST
   □ Tests passing on main branch
   □ Docker image built and tagged (semver, not latest)
   □ Environment variables verified in secret store
   □ DB migrations reviewed (if any)
   □ Rollback plan documented

2. DEPLOYMENT STRATEGY (pick one)
   Blue-Green  → zero downtime, instant rollback
   Rolling     → gradual, lower resource cost
   Canary      → percentage-based rollout, risk mitigation
   Recreate    → simplest, has downtime

3. EXECUTE
   □ Tag release: git tag v1.2.3
   □ Push image to registry: docker push registry/app:v1.2.3
   □ Apply new config / manifest
   □ Monitor health checks during rollout

4. POST-DEPLOY VERIFICATION
   □ Health endpoint returns 200
   □ Error rate unchanged (check monitoring)
   □ Critical user flow works
   □ Logs show no new errors

5. ROLLBACK TRIGGER
   □ If error rate > threshold → rollback immediately
   □ Command: documented and ready before deploy begins
```

---

## WORKFLOW-5: System Hardening

**Goal:** Remove digital waste, disable attack surface, improve performance.

### Steps

```
1. AUDIT CURRENT STATE
   □ List running services
   □ List startup programs
   □ Check RAM / CPU baseline usage
   □ List listening ports

2. CATEGORIZE SERVICES
   □ Required: keep
   □ Optional: evaluate
   □ Unused/risky: disable with justification

3. DISABLE SAFELY
   □ Disable (not delete) first
   □ Reboot and verify system is stable
   □ Document each change with reason

4. NETWORK HYGIENE
   □ Firewall: deny by default, allow by exception
   □ Close unused ports
   □ Disable UPnP if not needed

5. TELEMETRY POLICY
   □ Identify what telemetry is collected
   □ Disable only after understanding impact
   □ Never disable security-related telemetry (EDR, AV)

6. VERIFY
   □ System stable after changes
   □ Required apps still function
   □ Performance improvement measured
```

---

## WORKFLOW-6: Secrets Management

**Goal:** Zero secrets in code, repos, or logs.

### Steps

```
1. AUDIT
   □ Search codebase: git grep -i "password\|secret\|api_key\|token"
   □ Check git history: git log -p | grep -i password
   □ Check .env files: are they in .gitignore?

2. ESTABLISH .env PATTERN
   □ .env.example — committed (placeholder values only)
   □ .env — gitignored, never committed
   □ Document all variables in .env.example with descriptions

3. SECRET MANAGER (choose by scale)
   Local dev:     .env file (gitignored)
   Team / CI:     Doppler / HashiCorp Vault / AWS SSM / 1Password CLI
   Cloud deploy:  Native KMS (AWS Secrets Manager, GCP Secret Manager)

4. ROTATE COMPROMISED SECRETS
   □ Revoke immediately at source (API provider, cloud console)
   □ Generate new secret
   □ Update in all environments
   □ Check git history — consider repo force-push if secret was committed

5. VERIFY
   □ docker inspect shows no env secrets in labels
   □ CI logs show [masked] for secret values
   □ grep -r "sk-" . returns nothing
```

---

## WORKFLOW-7: Observability

**Goal:** See what's happening before users report problems.

### Steps

```
1. DEFINE WHAT TO OBSERVE
   □ Golden Signals: Latency, Traffic, Errors, Saturation
   □ Business metrics: signups, purchases, key user flows
   □ Infrastructure: CPU, memory, disk, network

2. STRUCTURED LOGGING
   □ Use JSON format for logs
   □ Include: timestamp, level, service, requestId, userId (no PII)
   □ Route to aggregator: Loki / ELK / Datadog / CloudWatch

3. HEALTH ENDPOINTS
   □ GET /health — basic liveness (returns 200 OK)
   □ GET /ready — readiness (checks DB, cache connections)

4. METRICS
   □ Instrument with Prometheus or OpenTelemetry
   □ Expose /metrics endpoint
   □ Visualize in Grafana or cloud dashboard

5. ALERTING
   □ Error rate > 1% → alert
   □ Latency p99 > 2s → alert
   □ Disk > 80% → alert
   □ Any deployment event → notify

6. VERIFY
   □ Trigger a test error → appears in logs
   □ Health endpoint returns correct status under load
   □ Alert fires on test condition
```

---

## References

- Docker best practices: https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- GitHub Actions docs: https://docs.github.com/en/actions
- 12-Factor App: https://12factor.net
- OWASP Docker Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html
