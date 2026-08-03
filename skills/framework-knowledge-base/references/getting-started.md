# Getting Started with Meta-Architect Framework

## Prerequisites

- AI IDE with Skills support: Claude Code, Cursor, Windsurf, or compatible
- Project with `.claude/` folder structure

## Installation

### 1. Add to Project

```bash
# In your project root
mkdir -p .claude/rules
mkdir -p .claude/skills
```

### 2. Copy Framework Files

```
.claude/
├── rules/
│   └── meta-architect-framework.md  # Always-On Rules
└── skills/
    ├── role-meta-architect/SKILL.md
    ├── role-coder/SKILL.md
    ├── role-reviewer/SKILL.md
    ├── role-coder-expert/SKILL.md
    ├── role-guide/SKILL.md
    ├── workflow-*/SKILL.md (10 workflows)
    ├── pattern-*/SKILL.md (5 patterns)
    └── checklist-*/SKILL.md (5 checklists)
```

### 3. Create /docs/ Folder

```bash
mkdir -p docs/adr
```

### 4. First Task

**Option A: Start new feature**

```
You: "Добавь регистрацию пользователей"
→ role-meta-architect activates automatically
```

**Option B: Ask for help**

```
You: "Помощь по фреймворку"
→ role-guide activates
```

## IDE-Specific Setup

### Claude Code / Antigravity

- Skills auto-activate based on YAML descriptions
- No additional configuration needed

### Cursor

- Enable Custom Instructions
- Skills activate via semantic matching
- May need explicit @role-name invocation

### Windsurf

- Same as Cursor
- Skills in `.windsurf/skills/` also supported

## Verify Installation

```
You: "Помощь"
Expected: role-guide activates and explains framework

You: "Добавь простую функцию для проверки"
Expected: role-meta-architect activates, classifies 🟢, creates quick plan
```

## Your First Workflow

```
1. User: "Добавь API endpoint для списка пользователей"
   → role-meta-architect activates

2. Meta-architect: Классифицирует 🟡 Medium
                   Создает Plan.md
                   🛑 STOP — ожидает approval

3. User: "approved"

4. Meta-architect: "Скажите: 'Выполни реализацию'"

5. User: "Выполни реализацию"
   → role-coder activates

6. Coder: Implements code
          "Скажите: 'Проверь код'"

7. User: "Проверь код"
   → role-reviewer activates

8. Reviewer: ✅ PASS — Done!
```

## Common Commands

| Command | Activates | When |
|---------|-----------|------|
| "Добавь...", "Исправь..." | role-meta-architect | Start any task |
| "Выполни реализацию" | role-coder | After meta-architect prompt |
| "Проверь код" | role-reviewer | After implementation |
| "Начни расследование" | role-coder-expert | Unknown root cause |
| "Помощь", "Где находится..." | role-guide | Questions |

## Troubleshooting Setup

**Skills don't activate?**

- Check `.claude/skills/*/SKILL.md` files exist
- Verify YAML frontmatter is valid
- Try explicit invocation: `@role-meta-architect`

**Wrong skill activates?**

- Use explicit command: `@role-name`
- Check skill descriptions for overlap

**See troubleshooting.md for more.**

---

**You're ready!** Start with simple task to get familiar.
