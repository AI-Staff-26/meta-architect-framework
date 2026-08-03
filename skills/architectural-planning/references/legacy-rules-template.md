# 📜 Project Rules Template

<purpose>
Template for defining project-specific rules and constraints.
The single source of truth for coding standards, conventions, and boundaries.
</purpose>

---

> **Instructions:** Define rules that apply to this specific project.  
> Rules should be concrete, verifiable, and enforceable.  
> Update as the project evolves.

---

## Metadata

| Field | Value |
|-------|-------|
| **Project** | [Project name] |
| **Version** | 1.0 |
| **Last Updated** | YYYY-MM-DD |
| **Maintainer** | [Who keeps this current] |

---

## Core Principles

> Non-negotiable values that guide all decisions.

1. **[Principle 1]:** [Brief explanation]
2. **[Principle 2]:** [Brief explanation]
3. **[Principle 3]:** [Brief explanation]

---

## Technology Stack

### Required Technologies

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Language | [e.g., TypeScript] | [5.0+] | [Strict mode required] |
| Runtime | [e.g., Node.js] | [20.x LTS] | |
| Framework | [e.g., Next.js] | [14.x] | [App Router only] |
| Database | [e.g., PostgreSQL] | [15+] | [via Prisma ORM] |
| Styling | [e.g., Tailwind CSS] | [3.x] | |

### Prohibited Technologies

> **❌ Do NOT use these:**

- ❌ [Technology 1]: [Why prohibited]
- ❌ [Technology 2]: [Why prohibited]
- ❌ [Technology 3]: [Why prohibited]

---

## Code Style & Conventions

### Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Files (components) | PascalCase | `UserProfile.tsx` |
| Files (utilities) | camelCase | `formatDate.ts` |
| Functions | camelCase | `getUserById()` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `UserResponse` |
| CSS classes | kebab-case | `user-profile-card` |

### File Organization

```
src/
├── components/     # Reusable UI components
│   └── [ComponentName]/
│       ├── index.ts
│       ├── [ComponentName].tsx
│       └── [ComponentName].test.tsx
├── features/       # Feature-specific modules
├── lib/            # Shared utilities
├── types/          # Type definitions
└── app/            # Routes/pages
```

### Import Order

```typescript
// 1. External dependencies
import { useState } from 'react';
import { clsx } from 'clsx';

// 2. Internal aliases (@/)
import { Button } from '@/components/Button';
import { formatDate } from '@/lib/utils';

// 3. Relative imports
import { LocalComponent } from './LocalComponent';
import styles from './styles.module.css';
```

---

## Architecture Rules

### Component Rules

- ✅ [Rule 1: e.g., Components must be under 200 lines]
- ✅ [Rule 2: e.g., No business logic in UI components]
- ✅ [Rule 3: e.g., Props must be typed with interfaces]
- ❌ [Anti-pattern 1: e.g., No inline styles]
- ❌ [Anti-pattern 2: e.g., No default exports for components]

### Data Flow Rules

- ✅ [Rule 1: e.g., State management via Zustand only]
- ✅ [Rule 2: e.g., API calls only in server actions]
- ❌ [Anti-pattern: e.g., No prop drilling beyond 2 levels]

### API Rules

- ✅ [Rule 1: e.g., All endpoints return typed responses]
- ✅ [Rule 2: e.g., Errors use structured format]
- ❌ [Anti-pattern: e.g., No raw SQL queries]

---

## Security Rules

> **Non-negotiable security requirements:**

### Authentication & Authorization
- [ ] [Rule 1: e.g., All routes require auth by default]
- [ ] [Rule 2: e.g., RBAC via middleware only]

### Data Handling
- ❌ Never log PII (email, passwords, tokens)
- ❌ Never hardcode secrets or API keys
- ❌ Never expose internal IDs to clients
- ✅ Use environment variables for all secrets
- ✅ Sanitize all user inputs

### Dependencies
- [ ] Run `npm audit` before merging
- [ ] No dependencies with critical vulnerabilities
- [ ] Pin exact versions for production dependencies

---

## Testing Rules

### Required Coverage

| Type | Minimum | Command |
|------|---------|---------|
| Unit Tests | [80%] | `npm test` |
| Integration Tests | [Critical paths] | `npm run test:integration` |
| E2E Tests | [Happy paths] | `npm run test:e2e` |

### Testing Standards

- ✅ [Rule 1: e.g., Test file co-located with source]
- ✅ [Rule 2: e.g., Use Testing Library for React]
- ✅ [Rule 3: e.g., Mock external services]
- ❌ [Anti-pattern: e.g., No snapshot tests for logic]

---

## Git & Workflow Rules

### Branch Naming

```
feature/[ticket-id]-short-description
bugfix/[ticket-id]-short-description
hotfix/[ticket-id]-short-description
```

### Commit Messages

```
type(scope): short description

[optional body]

[optional footer: BREAKING CHANGE, fixes #123]
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

### PR Requirements

- [ ] Descriptive title matching commit convention
- [ ] Link to related issue/ticket
- [ ] Tests pass in CI
- [ ] No linting errors
- [ ] Reviewed by at least 1 team member

---

## Performance Rules

| Metric | Threshold | Measurement |
|--------|-----------|-------------|
| LCP | < [2.5s] | Lighthouse |
| FID | < [100ms] | Lighthouse |
| CLS | < [0.1] | Lighthouse |
| Bundle Size | < [250KB] | Build output |
| API Response | < [200ms] | Monitoring |

---

## Documentation Rules

- ✅ All public functions have JSDoc comments
- ✅ README updated for new features
- ✅ ADRs for architectural decisions
- ✅ API endpoints documented in OpenAPI/Swagger
- ❌ No undocumented environment variables

---

## Exception Process

> How to request exceptions to these rules:

1. Create an ADR documenting:
   - Which rule needs exception
   - Why exception is needed
   - Scope and duration of exception
   - Mitigation for any risks
2. Get approval from [Technical Lead / Architect]
3. Document exception in this file under "Active Exceptions"

### Active Exceptions

| Rule | Exception | Reason | Expires |
|------|-----------|--------|---------|
| [Rule] | [What's allowed] | [Why] | [Date/Never] |

---

## Related Documents

- `Architecture.md` — System architecture
- `Requirements.md` — Feature requirements
- `adr/` — Architectural Decision Records

---

**END OF TEMPLATE**
