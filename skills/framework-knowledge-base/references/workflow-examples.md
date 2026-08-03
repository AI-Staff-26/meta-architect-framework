# Workflow Examples — End-to-End Scenarios

## Example 1: Simple Bug Fix (🟢)

**Task:** Fix validation bug in email field

### Flow

```
User: "Email validation не работает на форме регистрации"

→ role-meta-architect:
  - Классифицирует: 🟢 Simple
  - Assessment: Single file, clear issue, no DB changes
  - Scope: Fix validation regex in registration.form.ts
  - Делегирует напрямую без Plan.md

Meta-architect: 
"## Делегирование к Реализации

Следующая роль: role-coder

Скажите: 'Выполни реализацию'

Промпт:
Fix email validation in registration form.
Scope: Update validation regex in src/forms/registration.form.ts
Constraints: Use standard RFC 5322 email pattern
Acceptance: All existing tests pass + add negative test case"

User: "Выполни реализацию"

→ role-coder:
  - Updates registration.form.ts
  - Fixes regex
  - Adds test

Coder: "✅ Реализация завершена. Скажите: 'Проверь код'"

User: "Проверь код"

→ role-reviewer:
  - Checks spec compliance
  - Validates regex pattern
  - Verifies test coverage

Reviewer: "✅ PASS — bug fix ready for merge"
```

**Duration:** 5-10 minutes  
**Files changed:** 1-2  
**Plan.md:** Not required

---

## Example 2: Medium Feature (🟡)

**Task:** Add user profile page with avatar upload

### Flow

```
User: "Добавь страницу профиля пользователя с возможностью загрузки аватара"

→ role-meta-architect:
  - Классифицирует: 🟡 Medium
  - Loads: workflow-feature
  - Reasons: Multiple files, DB schema change, file upload, UI component
  - Creates: Plan.md

Meta-architect:
"## 📋 План

**Complexity:** 🟡 Medium

**Architecture:**
- Frontend: New profile.page.tsx component
- Backend: New /api/profile endpoint
- Storage: Add avatar_url to users table
- File handling: Upload to /uploads/ with validation

**Changes:**
1. Database:
   - Migration: Add users.avatar_url (nullable string)
   
2. Backend:
   - api/profile/[id].ts — GET profile
   - api/profile/avatar.ts — POST upload (multipart)
   - Validation: file type (jpg/png), size (<5MB)
   
3. Frontend:
   - components/ProfilePage.tsx
   - components/AvatarUpload.tsx
   - State: loading, error, success

**Acceptance Criteria:**
✅ User can view profile
✅ User can upload jpg/png avatar (<5MB)
✅ Invalid files rejected with clear message
✅ Avatar displays on profile
✅ All tests pass

**Risks:**
- File upload security → validate server-side
- Large files → enforce size limit

🛑 STOP — Awaiting approval"

User: "approved"

Meta-architect: "Скажите: 'Выполни реализацию'"

User: "Выполни реализацию"

→ role-coder: Implements all files

Coder: "✅ Реализация завершена. Скажите: 'Проверь код'"

User: "Проверь код"

→ role-reviewer:
  - Loads: checklist-security (file upload)
  - Loads: checklist-ux-completeness (UI states)
  - Verifies all criteria

Reviewer: "✅ PASS — feature complete"

Meta-architect updates: memory/repo-wiki/overview.md, marks task done
```

**Duration:** 30-60 minutes  
**Files changed:** 6-8  
**Plan.md:** Required + approval gate

---

## Example 3: Complex Investigation (🔴 → Expert)

**Task:** Performance degradation after recent deploy

### Flow

```
User: "После деплоя вчера API стал медленный, но не понятно почему"

→ role-meta-architect:
  - Анализирует: Причина неясна, нужно расследование
  - Решение: Делегировать @coder-expert

Meta-architect: 
"## 🔍 Требуется Расследование

Проблема: API performance degradation after deploy
Симптомы: Response times increased (specific endpoints?)
Что неясно: Root cause unknown

Скажите: 'Начни расследование'"

User: "Начни расследование"

→ role-coder-expert:
  - Checks recent commits
  - Analyzes DB query logs
  - Profiles slow endpoints
  - Tests hypotheses
  - Finds: N+1 query introduced in user.relations change

Coder-expert:
"## 🔍 Расследование Завершено

**Root Cause:** N+1 query in getUserWithPosts()
Location: api/users/posts.ts:45
Change: commit abc123 added eager loading without join

**Research.md created:**
- Detailed analysis
- Query comparison (before/after)
- Performance metrics

**Recommendations:**
1. Add explicit join to reduce queries
2. Add DB query monitoring
3. Load testing before deploy

Скажите: 'Создай план на основе расследования'"

User: "Создай план на основе расследования"

→ role-meta-architect:
  - Reads Research.md
  - Creates Plan.md with fix + prevention
  - Классифицирует: 🟡 Medium

Meta-architect: Plan готов, approval → delegate @coder → @reviewer → Done
```

**Duration:** 1-3 hours  
**Roles involved:** 4 (meta → expert → meta → coder → reviewer)  
**Artifacts:** Research.md + Plan.md + fixed code

---

## Example 4: Architecture Change (🔴)

**Task:** Migrate to multi-tenant architecture

### Flow Summary

```
User: "Нужно сделать приложение multi-tenant с изоляцией данных"

→ role-meta-architect:
  - Классифицирует: 🔴 Complex
  - Loads: workflow-architecture-change, pattern-multi-tenant
  - Creates: Research.md (tenant isolation strategies)
  - Creates: Plan.md (phased migration)
  - Creates: ADR-001-tenant-isolation-strategy.md

Meta: 🛑 STOP — approval required

User: "approved"

→ Phase 1: Schema changes
   @coder → @reviewer → PASS

→ Phase 2: Update queries with tenant filter
   @coder → @reviewer → PASS

→ Phase 3: Add tenant middleware
   @coder → @reviewer → PASS

→ Phase 4: Migration script
   @coder → @reviewer → PASS

Meta-architect: Updates Architecture.md, closes task
```

**Duration:** Days (phased)  
**Plan.md + ADR:** Required  
**Multi-phase:** Yes, with gates between phases

---

**Pattern Summary:**

- **🟢 Simple:** Direct delegation, no plan, quick review
- **🟡 Medium:** Plan.md → approval gate → implementation → review
- **🔴 Complex:** Research → Plan + ADR → phased execution with gates
- **🔴 + Unknown:** Expert investigation first → plan → execution
