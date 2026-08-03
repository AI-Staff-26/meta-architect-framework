# Complexity Classification Guide — 🟢🟡🔴

## Decision Matrix

| Criteria | 🟢 Simple | 🟡 Medium | 🔴 Complex |
|----------|-----------|-----------|------------|
| **Files** | 1-2 | 3-6 | 7+ or architecture |
| **DB Changes** | None | Schema add/modify | Migrations, multi-table |
| **API Changes** | None | New endpoints | Breaking changes, versioning |
| **Architecture** | No impact | Module changes | Layer/pattern changes |
| **Ambiguity** | Clear | Some unknowns | Requires research |
| **Risk** | Low | Medium | High (auth, scaling, data) |
| **Testing** | Unit tests | Integration | E2E + performance |

## 🟢 Simple Examples

- Fix typo in validation message
- Add new field to existing form
- Update CSS styling
- Fix obvious bug (known cause)
- Add simple utility function

**Characteristics:**

- Single file (<50 lines changed)
- No database/API modifications
- Clear requirement
- Low risk

**Process:** Assess → `code` → `review` → Done  
**Plan.md:** Not required

---

## 🟡 Medium Examples

- Add new REST endpoint
- Create new UI component
- Database schema add column
- Multi-file refactoring
- Cross-module integration

**Characteristics:**

- Multiple files (3-6)
- Database or API changes
- Some edge cases to clarify
- Medium risk

**Process:** Assess → Plan.md → 🛑 Approval → `code` → `review` → Done  
**Plan.md:** Required

---

## 🔴 Complex Examples

- Multi-tenant migration
- Authentication system overhaul
- Performance optimization (caching, indexing)
- Breaking API changes
- Major architectural refactor
- Payment integration

**Characteristics:**

- Architectural changes
- Auth/authz modifications
- Multiple integration points
- High risk (data loss, security)
- Migration required

**Process:** Assess → (maybe `debug`) → Research.md → Plan.md + ADR → 🛑 Approval → Phased `code` → `review` per phase → Done  
**Plan.md + ADR:** Required

---

## Escalation Rules

### 🟢 → 🟡 Escalate if

- "Simple" task reveals hidden complexity
- Edge cases discovered during implementation
- Cross-module dependencies found

### 🟡 → 🔴 Escalate if

- Requires architectural changes
- Security implications discovered
- Data migration needed
- Breaking changes required

### Any → `debug` if

- Root cause unclear after investigation
- >2 failed fix attempts
- AI agents looping
- Legacy code mysteries

---

## Common Mistakes

❌ **Under-classification:**

- "Just add auth" → Seems 🟢, actually 🔴
- "Small refactor" → Touches 15 files = 🟡

❌ **Over-classification:**

- "New feature" → If single file CRUD = 🟢
- "Bug fix" → If clear cause + 1 file = 🟢

**When in doubt:** Classify higher, downgrade if analysis confirms simpler
