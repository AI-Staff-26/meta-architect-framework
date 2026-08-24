# 🛠️ Tech Stack Selection

<purpose>
A stack is a ten-year decision. Choose deliberately, not by hype.
</purpose>

---

## Key Principles

### 1. Boring Technology Club

> **Boring technology means predictable problems.**

```
❌ Avoid:
- "A new framework, everyone is talking about it"
- "Look at how nice the syntax is"
- "This will be mainstream within a year"

✅ Prefer:
- "5+ years in production at large companies"
- "Clear documentation and an active community"
- "Known problems with known solutions"
```

**The Innovation Tokens rule:** a project holds 3–5 "innovation tokens". Every non-standard technology costs one. Spend them all and you get chaos.

---

### 2. Maturity Matrix

| Criterion | 🔴 Dangerous | 🟡 Careful | 🟢 Safe |
|----------|-----------|--------------|--------------|
| Age | <1 year | 1–3 years | >3 years |
| GitHub stars | <5K | 5K–20K | >20K |
| Major version | 0.x | 1.x–2.x | 3.x+ |
| Companies using it | Startups | Scale-ups | Enterprises |
| Stack Overflow answers | <1K | 1K–10K | >10K |
| Last release | >6 months ago | 1–6 months | <1 month |

**Rule:** a 🔴 on any criterion demands a justification.

---

### 3. One Choice Per Layer

> **One primary tool at each layer of the architecture.**

```
Layers:
┌─────────────────────────────────────┐
│ Frontend: React OR Vue OR Angular   │  ← One!
├─────────────────────────────────────┤
│ API: REST OR GraphQL OR gRPC        │  ← One!
├─────────────────────────────────────┤
│ Backend: Node OR Go OR Python       │  ← One!
├─────────────────────────────────────┤
│ Database: PostgreSQL OR MongoDB     │  ← One!
└─────────────────────────────────────┘
```

**Exception:** different bounded contexts may run different stacks — at a cost of two innovation tokens.

---

### 4. Fit-for-Purpose

> **Choose the technology for the problem, not the problem for the technology.**

**Control questions:**

```markdown
For each technology, ask:
1. What SPECIFIC problem does it solve?
2. How was that problem solved BEFORE this technology existed?
3. What happens if we use the "boring" alternative?
4. Does the team have the expertise?
5. Will we be able to hire for it in two years?
```

**Decision matrix:**

| Problem | ❌ Overkill | ✅ Fit | ❌ Not enough |
|--------|------------|--------|-----------------|
| CRUD MVP | Microservices | Monolith | Spreadsheet |
| Real-time chat | Kafka | WebSocket | HTTP polling |
| Mobile app | Flutter | React Native | PWA |
| 10 RPS | Kubernetes | Docker Compose | Bare VPS |
| 10K RPS | Bare metal | Kubernetes | Docker Compose |

---

### 5. TCO (Total Cost of Ownership)

> **The cost of a technology = entry + operation + exit.**

```
TCO = Setup Cost + Running Cost + Exit Cost

Setup Cost:
- Time to learn it
- Infrastructure setup
- Integration with existing code

Running Cost:
- Licences and subscriptions
- Infrastructure (RAM, CPU, egress)
- Maintenance and upgrade time
- Monitoring its specific failure modes

Exit Cost:
- Data migration
- Rewriting integrations
- Vendor lock-in
```

---

## The Selection Procedure

### Step 1: Establish the requirements

```markdown
## Functional
- Application type (web/mobile/API/CLI)
- Key features
- Integrations

## Non-functional
- Load (RPS, users, data volume)
- Latency requirements
- Availability (SLA)
- Security and compliance

## Constraints
- Budget
- Timeline
- Team expertise
- Existing infrastructure
```

### Step 2: Build a shortlist

```markdown
For each layer:
1. Identify 2–3 candidates
2. Drop anything 🔴 on the maturity matrix
3. Check Fit-for-Purpose
```

### Step 3: Score against the criteria

```markdown
| Criterion | Weight | Option A | Option B | Option C |
|----------|-----|----------|----------|----------|
| Maturity | 20% | 8 | 9 | 6 |
| Fit-for-Purpose | 25% | 9 | 7 | 8 |
| Team expertise | 20% | 7 | 9 | 5 |
| TCO | 15% | 8 | 6 | 9 |
| Ecosystem | 10% | 8 | 9 | 7 |
| Hiring pool | 10% | 9 | 8 | 6 |
| **TOTAL** | | **8.1** | **7.9** | **6.9** |
```

### Step 4: Run a spike

```markdown
Before the final decision:
- Implement the key use case on the top 2 candidates
- Time-box it: 4–8 hours per candidate
- Judge the developer experience
- Check how the edge cases get solved
```

### Step 5: Record it in memory/*

```markdown
1. Write the decision into memory/DECISIONS.md:
   ## #NNN — Tech Stack: [Category] (YYYY-MM-DD)
   **Context**: Technology stack selection
   **Options**: [Option A, Option B]
   **Chosen**: [Selected]
   **Consequences**: [What follows]

2. Add the facts to memory/FACTS.md:
   ## Technical
   - Tech stack: [details] [source: stack-selection, date: YYYY-MM-DD]

3. Where the decision is architectural — create memory/adrs/ADR-NNN.md
```

---

## Antipatterns

| Antipattern | Symptom | How to avoid it |
|-------------|---------|--------------|
| **Hype-Driven** | "Everyone uses it" | Check the maturity matrix |
| **CV-Driven** | "I want it on my CV" | Fit-for-Purpose check |
| **Golden Hammer** | "We always use X" | Score against the requirements |
| **Bleeding Edge** | Version 0.x in production | Innovation Tokens |
| **Frankenstack** | 5+ languages, 3+ databases | One choice per layer |
| **Lock-in Blindness** | "Cloud native" with no exit plan | TCO including Exit Cost |

---

## Reference Stacks

### 🌐 Web Application (Enterprise)

```
Frontend: React + TypeScript
API: REST (OpenAPI)
Backend: Node.js (NestJS) or Go
Database: PostgreSQL
Cache: Redis
Queue: RabbitMQ or SQS
Infra: Kubernetes or ECS
```

### 📱 Mobile-First Startup

```
Mobile: React Native or Flutter
API: GraphQL
Backend: Node.js (Express) or Python (FastAPI)
Database: PostgreSQL + Redis
Infra: Managed (Supabase/Firebase) or Docker Compose
```

### 🎯 High-Performance

```
API: gRPC
Backend: Go or Rust
Database: PostgreSQL (partitioned)
Cache: Redis Cluster
Queue: Kafka
Infra: Kubernetes with custom autoscaling
```

---

## Quick Reference

```
Stack selection = a ten-year decision

Rules:
1. Boring Technology > hype
2. 3–5 Innovation Tokens, maximum
3. One tool per layer
4. Fit-for-Purpose > feature list
5. TCO = Setup + Running + Exit
```

---

**Related files:**
- `skills/prior-art/SKILL.md` — whether the thing needs building before a stack is chosen for it
- `skills/workflow-architecture-change/references/adr-template.md` — the ADR template for recording decisions
- `skills/workflow-new-project/SKILL.md` — the project initialisation workflow
- `skills/pattern-modular-monolith/SKILL.md` — the architectural pattern
