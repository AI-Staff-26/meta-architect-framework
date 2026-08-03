---
name: workflow-legacy-analysis
description: |
  Understanding unfamiliar codebase protocol. Maps structure, identifies 
  patterns, documents assumptions into memory/* (repo-wiki, FACTS, DECISIONS).
  For: inherited projects, undocumented systems, pre-refactoring analysis.
  Creates repo-wiki entries from code. NOT for new projects (onboarding skill).
---

# 🏚️ Legacy Analysis Workflow — Анализ Legacy Кода

<purpose>
Протокол для анализа и документирования legacy систем.
Понимание перед изменением. Карта перед путешествием.
Все результаты записываются в memory/* (repo-wiki, FACTS, DECISIONS, CONTEXT).
</purpose>

---

## Когда Использовать

**Триггеры:**

- Новый проект с существующим кодом (после onboarding)
- Нужно понять незнакомый модуль
- Подготовка к рефакторингу/миграции
- Документация отсутствует или устарела
- Передача проекта между командами

**НЕ использовать для:**

- Фикса багов → `workflow-debugging`
- Изменения архитектуры → `workflow-architecture-change` (после анализа)
- Нового проекта с нуля → `onboarding` skill (Phase 3.5)

---

## Ключевой Принцип

> **Понять перед изменением. Документировать перед забыванием.**

```
❌ Сразу менять legacy
✅ Анализ → memory/* → План → Изменения
```

**Результат анализа (всё в memory/*):**

- `memory/repo-wiki/overview.md` — архитектурная карта системы
- `memory/FACTS.md` — технические факты о системе
- `memory/CONTEXT.md` — текущее понимание
- `memory/DECISIONS.md` — решения по дальнейшей работе
- `/docs/Research.md` — рекомендации (transient)

---

## Фаза 1: Первичный Обзор

### Шаг 1.1: Сбор Артефактов

**Найти и каталогизировать:**

- [ ] README (если есть)
- [ ] Существующая документация
- [ ] Конфигурационные файлы
- [ ] Точки входа (main, index, entry points)
- [ ] Тесты (если есть)
- [ ] CI/CD конфигурация
- [ ] Package manifests (package.json, requirements.txt, etc.)

### Шаг 1.2: Первичные Метрики

**Оценить и записать в `memory/FACTS.md`:**

```markdown
## Technical (добавить в существующий раздел)
- Project size: ~N lines of code, ~N files [source: legacy-analysis, date: YYYY-MM-DD]
- Modules/packages: N [source: legacy-analysis, date: YYYY-MM-DD]
- Test coverage: N% / No tests [source: legacy-analysis, date: YYYY-MM-DD]
- Last commit: YYYY-MM-DD (Active/Abandoned?) [source: legacy-analysis, date: YYYY-MM-DD]
- Dependencies: N (N outdated / N vulnerable) [source: legacy-analysis, date: YYYY-MM-DD]
- Documentation: Full / Partial / None [source: legacy-analysis, date: YYYY-MM-DD]
```

### Шаг 1.3: Оценка Сложности Анализа

| Уровень | Критерии |
|---------|----------|
| 🟢 Simple | <5K строк, <20 файлов, есть тесты/документация |
| 🟡 Medium | 5-20K строк, 20-100 файлов, частичная документация |
| 🔴 Complex | >20K строк, >100 файлов, нет документации |
| ⚫ Archeological | Очень старый код, устаревшие технологии, авторы недоступны |

---

## Фаза 2: Глубокий Анализ

### Шаг 2.1: @coder-expert для Анализа

```markdown
## 🤖 Delegation
**Agent:** @coder-expert
**Purpose:** Провести анализ legacy системы
**Expected Output:** Структурированный отчёт
**Focus:**
1. Архитектура (верхний уровень)
2. Ключевые компоненты и их роли
3. Зависимости (внутренние и внешние)
4. Потоки данных
5. Точки входа и API
6. Опасные зоны (complexity, coupling)

🛑 STOP after completion. Return control to @meta-architect.
```

### Шаг 2.2: Что Анализировать

**1. Структура проекта:**
- Directory layout и организация
- Точки входа (main, index, CLI commands, API endpoints)
- Разделение ответственности между модулями

**2. Dependency Graph:**
- Внешние зависимости (packages) — версии, статус
- Внутренние зависимости (модули между собой)
- Циклические зависимости (проблема!)

**3. Data Flow:**
- Откуда данные приходят?
- Где хранятся?
- Как преобразуются?
- Куда уходят?

**4. Hot Spots:**
- Самые большие файлы/классы
- Самые часто изменяемые (git history)
- Самые сложные (cyclomatic complexity)
- Самые связанные (high coupling)

---

## Фаза 3: Документирование в memory/*

### Шаг 3.1: Создать `memory/repo-wiki/overview.md`

Использовать формат repo-wiki (см. memory-protocol.md):

```markdown
---
title: Architecture Overview
description: High-level architecture of [Project Name]
---

## Entry: System Architecture
> Tags: system-diagram, entry-point, tech-stack

### Overview
[What this system does and why it exists]

### Key Files
| File | Lines | Description |
|------|-------|-------------|
| `src/main.ts` | 1-45 | Application entry point |
| `src/config/` | — | Configuration files |

### Architecture
```mermaid
graph TB
    [Component diagram]
```

### Dependencies
[External and internal dependencies]

### Important Details
[Non-obvious decisions, edge cases]
```

Зарегистрировать в `memory/repo-wiki/meta.json`:
```json
{
  "files": {
    "overview.md": {
      "tags": ["system-diagram", "entry-point", "tech-stack"]
    }
  }
}
```

### Шаг 3.2: Создать дополнительные wiki-файлы

Для каждого крупного модуля/домена — отдельный wiki-файл:

```markdown
---
title: [Module Name]
description: [Brief module description]
---

## Entry: [Component Name]
> Tags: tag1, tag2, tag3

### Overview
[What this component does]

### Key Files
| File | Lines | Description |
|------|-------|-------------|

### Architecture
[Mermaid diagram if complex]

### Dependencies
[What this depends on and what depends on it]

### Important Details
[Non-obvious decisions, edge cases]
```

Зарегистрировать каждый файл в `meta.json` с правильными тегами.

### Шаг 3.3: Обновить `memory/FACTS.md`

Добавить все обнаруженные технические факты:

```markdown
## Technical
- [Module X] handles [responsibility] [source: legacy-analysis, date: YYYY-MM-DD]
- [Component Y] depends on [external service] [source: legacy-analysis, date: YYYY-MM-DD]
- [Data flow]: [description] [source: legacy-analysis, date: YYYY-MM-DD]
- [Pattern used]: [description] in [files] [source: legacy-analysis, date: YYYY-MM-DD]

## Constraints
- [Technical constraint discovered] [source: legacy-analysis, date: YYYY-MM-DD]
- [Legacy limitation] [source: legacy-analysis, date: YYYY-MM-DD]
```

### Шаг 3.4: Обновить `memory/CONTEXT.md`

```markdown
# Current Context (updated: YYYY-MM-DD)

## State
- **Working on**: Legacy analysis completed
- **Last completed**: Codebase mapped and documented in repo-wiki

## Active Tasks
- [Based on recommendations]

## Recent Decisions
- [Any decisions made during analysis]

## Watch Out
- ⚠️ [Hot spot]: [Why dangerous]
- ⚠️ [Area]: [No tests, high coupling]
- TBD: [Items needing further investigation]
```

### Шаг 3.5: Записать Hot Spots

Добавить в `memory/FACTS.md` или создать отдельный wiki-файл:

```markdown
## Entry: Hot Spots & Risk Areas
> Tags: risk, hot-spots, technical-debt

### 🔴 Critical (Avoid changing without deep analysis)
| Location | Reason | Risk |
|----------|--------|------|
| `path/to/file` | [God class, high coupling, no tests] | [Data loss possible] |

### 🟡 Moderate (Change carefully)
| Location | Reason | Risk |
|----------|--------|------|

### Code Quality Issues
| Issue | Locations | Severity |
|-------|-----------|----------|
| Duplication | [files] | Medium |
| Dead code | [files] | Low |
```

---

## Фаза 4: Рекомендации

### Шаг 4.1: Assessment Matrix

Создать `/docs/Research.md` (transient) с рекомендациями:

```markdown
# Research: Legacy Analysis — [Project Name]
*Created: YYYY-MM-DD*

## Assessment Summary

| Aspect | Status | Priority |
|--------|--------|----------|
| Architecture | 🟢🟡🔴 | |
| Code Quality | 🟢🟡🔴 | |
| Test Coverage | 🟢🟡🔴 | |
| Documentation | 🟢🟡🔴 | |
| Dependencies | 🟢🟡🔴 | |
| Security | 🟢🟡🔴 | |

## Recommended Actions

### Immediate (перед любыми изменениями)
1. [ ] [Action]

### Short-term (первые спринты)
1. [ ] [Action]

### Long-term (roadmap)
1. [ ] [Action]

## What NOT to Touch
⛔ [Area]: [Why, what happens if touched]
```

### Шаг 4.2: Записать решения в `memory/DECISIONS.md`

```markdown
## #NNN — Legacy Analysis: [Decision Title] (YYYY-MM-DD)
**Context**: [Why this decision was needed based on analysis findings]
**Options**: [What alternatives were considered]
**Chosen**: [What was selected]
**Consequences**: [What follows]
**Status**: Active
```

---

## Фаза 5: Выход и Hand-off

### Шаг 5.1: Итоговые Артефакты

**Обязательные (в memory/*):**

- [ ] `memory/repo-wiki/overview.md` — карта системы (+ meta.json обновлён)
- [ ] `memory/FACTS.md` — технические факты обновлены
- [ ] `memory/CONTEXT.md` — текущее состояние обновлено
- [ ] `memory/DECISIONS.md` — решения записаны
- [ ] CHRONICLE.md — [milestone] entry добавлен

**Transient (в /docs/):**

- [ ] `/docs/Research.md` — рекомендации и assessment

**Для сложных систем дополнительно:**

- [ ] Отдельные wiki-файлы для крупных модулей
- [ ] Hot Spots wiki entry
- [ ] Dependency Graph (Mermaid в wiki)

### Шаг 5.2: Следующие Шаги

```
Анализ завершён
       ↓
Нужны изменения?
       ↓
[Рефакторинг] → workflow-refactoring (использовать repo-wiki)
[Новая фича] → workflow-feature (использовать repo-wiki + FACTS)
[Миграция] → workflow-architecture-change (использовать Research.md)
[Фикс бага] → workflow-debugging (использовать Hot Spots)
```

---

## Антипаттерны Анализа Legacy

| Антипаттерн | Почему плохо | Как правильно |
|-------------|--------------|---------------|
| **Менять без анализа** | Ломаешь что не понимаешь | Сначала анализ |
| **Анализ без записи в memory** | Забудешь через неделю | Записывать сразу в repo-wiki и FACTS |
| **Полный переписать** | Потеря business logic, долго | Инкрементальные изменения |
| **Игнорировать hot spots** | Сломаешь критичное | Карта рисков в FACTS |
| **Не спрашивать авторов** | Упустишь контекст | Интервью если доступны |
| **Overengineering analysis** | Анализ превращается в проект | Time-boxed, достаточный уровень |

---

## Чеклист

### Перед Анализом

- [ ] Цель анализа понятна (зачем?)
- [ ] Доступ к коду есть
- [ ] Время на анализ выделено (time-box)
- [ ] memory/PROFILE.md существует (если нет → onboarding сначала)

### Во Время Анализа

- [ ] @coder-expert делегирован
- [ ] Ключевые артефакты найдены
- [ ] Структура понятна
- [ ] Hot spots выявлены

### После Анализа

- [ ] `memory/repo-wiki/overview.md` создан + meta.json обновлён
- [ ] `memory/FACTS.md` обновлён
- [ ] `memory/CONTEXT.md` обновлён
- [ ] `/docs/Research.md` создан с рекомендациями
- [ ] CHRONICLE.md обновлён
- [ ] Hand-off к нужному workflow

---

## Quick Reference

```
Legacy System
      ↓
Первичный обзор (метрики, артефакты) → memory/FACTS.md
      ↓
Оценка сложности 🟢🟡🔴⚫
      ↓
@coder-expert анализ
      ↓
Документирование в memory/*:
- memory/repo-wiki/overview.md (+ meta.json)
- memory/FACTS.md (технические факты)
- memory/CONTEXT.md (текущее понимание)
- memory/DECISIONS.md (решения)
      ↓
/docs/Research.md (рекомендации)
      ↓
Hand-off к нужному workflow:
→ workflow-refactoring
→ workflow-feature
→ workflow-architecture-change
→ workflow-debugging
```

---

**Связанные навыки:**

- `skills/workflow-refactoring/SKILL.md` — если нужен рефакторинг после анализа
- `skills/workflow-architecture-change/SKILL.md` — если нужна миграция
- `skills/onboarding/SKILL.md` — если проект новый и нужен onboarding

---

**END OF WORKFLOW**
