---
name: workflow-new-project
description: |
  Greenfield project initialization protocol. Tech stack selection, folder 
  structure, initial setup, first deliverable. For: new projects, bootstrapping, 
  MVP creation. NOT for adding features to existing project (use workflow-feature).
  All artifacts go to memory/* (repo-wiki, FACTS, DECISIONS, CONTEXT).
---

# 🆕 New Project Workflow — Инициализация Нового Проекта

<purpose>
Протокол создания нового проекта с нуля.
От идеи до рабочего скелета с настроенной инфраструктурой.
Все артефакты записываются в memory/*.
Применяется для любой сложности: 🟢 🟡 🔴
</purpose>

---

## Когда Использовать

**Триггеры:**

- Новый проект с нуля
- MVP / PoC
- Новый сервис в существующей экосистеме
- Форк/переписывание с чистого листа

**НЕ использовать для:**

- Фичей в существующем проекте → `workflow-feature`
- Рефакторинга → `workflow-refactoring`
- Миграции архитектуры → `workflow-architecture-change`

---

## Фаза 1: Scope & Requirements

### Шаг 1.1: Понимание Задачи

**Действия:**

1. Уточни у пользователя:
   - Что должен делать проект? (ключевые функции)
   - Для кого? (целевая аудитория, пользователи, системы)
   - Какие ограничения? (бюджет, сроки, хостинг)
   - Есть ли интеграции? (существующие системы, API)

2. Определи тип проекта:
   - Web App (SPA, MPA, SSR)
   - API Service (REST, GraphQL, gRPC)
   - CLI Tool
   - Library / SDK
   - Mobile App
   - Desktop App
   - Microservice

**Выход:** Понимание scope + первичный список требований.

### Шаг 1.2: Оценка Сложности

| Критерий | 🟢 Simple | 🟡 Medium | 🔴 Complex |
|----------|-----------|-----------|------------|
| Время | 1-2 дня | 1-2 недели | >2 недели |
| Компоненты | 1-2 | 3-5 | >5 |
| Интеграции | 0-1 | 2-3 | >3 |
| БД | SQLite / NoSQL | PostgreSQL + cache | Multi-DB / Sharding |
| Auth | Нет / Basic | OAuth / JWT | SSO / RBAC / Multi-tenant |
| Deploy | Static / Single server | Container + CI/CD | K8s / Multi-region |

**Правило:** При сомнении выбирай более высокий уровень сложности.

---

## Фаза 2: Stack Selection

### Шаг 2.1: Выбор Технологий

**Критерии выбора:**

- Команда уже знает технологию?
- Подходит ли для задачи?
- Есть ли ограничения от заказчика?
- Long-term support и community

**Действия:**

1. Предложи 2-3 варианта стека
2. Для каждого варианта укажи Pros/Cons
3. Дай рекомендацию с обоснованием

**Артефакт (🟡🔴):**

```markdown
## Stack Options

### Option A: [Название]
**Pros:** ...
**Cons:** ...

### Option B: [Название]
**Pros:** ...
**Cons:** ...

**Рекомендация:** Option A, потому что [обоснование]
```

### Шаг 2.2: STOP-Gate (🟡🔴)

```
🛑 STOP — Утверждение стека перед продолжением
```

Для 🟢 достаточно устного подтверждения или предложения по умолчанию.

---

## Фаза 3: Knowledge Base Setup (memory/*)

### Шаг 3.1: Создание Структуры memory/

**Действия:**

1. Создай директорию `memory/` (если не существует — обычно создаётся при onboarding)
2. Убедись что базовые файлы существуют:
   - `memory/PROFILE.md` — если нет, запусти onboarding сначала
   - `memory/CONTEXT.md` — обнови под новый проект
   - `memory/FACTS.md` — добавь факты о стеке и архитектуре
   - `memory/DECISIONS.md` — запиши решения по стеку
   - `memory/repo-wiki/meta.json` — создай если нет

### Шаг 3.2: Заполнение FACTS.md

**Добавить в `memory/FACTS.md`:**

```markdown
## Technical
- Project type: [Web App / API / CLI / etc.] [source: new-project, date: YYYY-MM-DD]
- Tech stack: [stack details] [source: new-project, date: YYYY-MM-DD]
- Database: [choice] [source: new-project, date: YYYY-MM-DD]
- Deployment target: [target] [source: new-project, date: YYYY-MM-DD]

## Constraints
- [Budget/timeline/technical constraints] [source: new-project, date: YYYY-MM-DD]
```

### Шаг 3.3: Запись Решений в DECISIONS.md

```markdown
## #NNN — Tech Stack: [Decision] (YYYY-MM-DD)
**Context**: Выбор технологического стека для нового проекта
**Options**: [Option A, Option B, Option C]
**Chosen**: [Selected option]
**Consequences**: [What follows from this choice]
**Status**: Active
```

---

## Фаза 4: Architecture Definition

### Шаг 4.1: Выбор Архитектурного Паттерна

**Опции (см. skills/pattern-*):**

- `pattern-clean-architecture` — слоёная архитектура
- `pattern-modular-monolith` — модульный монолит
- Microservices — для 🔴 проектов

**Действия:**

1. Выбери паттерн на основе Requirements
2. Адаптируй под конкретный стек
3. Задокументируй в `memory/repo-wiki/overview.md`

### Шаг 4.2: Определение Компонентов

**Для каждого компонента определи:**

- Название и ответственность
- Зависимости (от чего зависит / что от него зависит)
- Интерфейсы (публичные контракты)

### Шаг 4.3: Создание repo-wiki/overview.md

**Формат repo-wiki entry:**

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

### Шаг 4.4: STOP-Gate (🟡🔴)

```
🛑 STOP — Утверждение архитектуры перед scaffold
```

---

## Фаза 5: Project Scaffolding

### Шаг 5.1: Создание Скелета

**Действия:**

1. Сформировать промпт для `code` с задачей:
   - Инициализация проекта (npm init / cargo new / etc.)
   - Создание структуры директорий
   - Базовая конфигурация (tsconfig, eslint, etc.)
   - Инициализация Git + .gitignore

2. Делегировать `code`

**Структура должна соответствовать выбранной архитектуре.**

### Шаг 5.2: Настройка Инфраструктуры

**В зависимости от сложности:**

🟢:

- Package manager + deps
- Linter + Formatter
- Basic scripts (dev, build, test)

🟡:

- CI конфиг (GitHub Actions / GitLab CI)
- Docker (опционально)
- Pre-commit hooks

🔴:

- Full CI/CD pipeline
- Docker + Docker Compose
- Infrastructure as Code
- Monitoring setup

### Шаг 5.3: Smoke Test

**Критерии успешного scaffolding:**

- [ ] Проект запускается (`npm run dev` / etc.)
- [ ] Линтер проходит без ошибок
- [ ] Тесты запускаются (пустой тест-сьют OK)
- [ ] Структура соответствует архитектуре в repo-wiki

---

## Фаза 6: Initial Implementation

### Шаг 6.1: Определение Первого Deliverable

**Выбери минимальный рабочий срез:**

- Один endpoint / одна страница / одна команда
- End-to-end путь (от входа до выхода)
- Валидирует архитектурные решения

### Шаг 6.2: Реализация

**Протокол:**

1. Создать `/docs/prompt-first-deliverable.md` с спецификацией
2. Делегировать `code`
3. Делегировать `review`
4. Обновить `memory/*` по результатам

---

## Фаза 7: Verification

### Шаг 7.1: Финальная Проверка

**Чеклист:**

- [ ] Проект запускается и работает
- [ ] `memory/repo-wiki/` актуален (overview.md + meta.json)
- [ ] `memory/FACTS.md` содержит ключевые технические факты
- [ ] `memory/CONTEXT.md` отражает текущее состояние
- [ ] Git history чистая
- [ ] README.md понятен новому разработчику
- [ ] Первый deliverable демонстрируем

### Шаг 7.2: Обновление memory/*

**После завершения:**

1. Обновить `memory/CONTEXT.md`:
   - Working on: Project initialized and first deliverable complete
   - Last completed: [What was done]

2. Добавить в CHRONICLE.md:
   ```markdown
   ### [milestone] New project initialized
   Project [name] created with [stack]. Architecture: [pattern].
   First deliverable: [what was built]. Smoke test passed.
   ```

3. Обновить `memory/repo-wiki/` если структура изменилась при реализации

### Шаг 7.3: Handoff

**Действия:**

1. Убедиться что пользователь понимает структуру
2. Показать Quick Start (как запустить)
3. Объяснить следующие шаги

---

## Чеклист New Project

### Фаза 1: Requirements

- [ ] Scope понятен
- [ ] Тип проекта определён
- [ ] Сложность оценена

### Фаза 2: Stack

- [ ] Технологии выбраны
- [ ] Утверждение получено (🟡🔴)
- [ ] Решение записано в memory/DECISIONS.md

### Фаза 3: Knowledge Base

- [ ] memory/ структура создана/проверена
- [ ] memory/FACTS.md обновлён
- [ ] memory/DECISIONS.md обновлён

### Фаза 4: Architecture

- [ ] Паттерн выбран
- [ ] memory/repo-wiki/overview.md создан + meta.json обновлён
- [ ] Утверждение получено (🟡🔴)

### Фаза 5: Scaffold

- [ ] Проект инициализирован
- [ ] Структура соответствует архитектуре
- [ ] Smoke test пройден

### Фаза 6: First Delivery

- [ ] Первый deliverable реализован
- [ ] `review` PASS

### Фаза 7: Verification

- [ ] memory/* актуальны
- [ ] CHRONICLE.md обновлён
- [ ] Пользователь понимает структуру

---

## Quick Reference

```
Idea
  ↓
Requirements → Оценка 🟢🟡🔴
  ↓
Stack Selection → [🟡🔴 STOP] → memory/DECISIONS.md
  ↓
memory/* Setup (FACTS, repo-wiki)
  ↓
Architecture → memory/repo-wiki/overview.md → [🟡🔴 STOP]
  ↓
Scaffold (`code`) → Smoke Test
  ↓
First Deliverable → `review` → Update memory/* → DONE
```

---

## Anti-Patterns

❌ **Не начинай кодить без записи решений в memory/DECISIONS.md**
❌ **Не пропускай architecture в repo-wiki для 🟡🔴**
❌ **Не переусложняй стек для простых проектов**
❌ **Не создавай пустой каркас без первого deliverable**
❌ **Не забывай обновлять memory/repo-wiki/ при изменениях структуры**

---

**Связанные навыки:**

- `skills/onboarding/SKILL.md` — если проект ещё не прошёл onboarding
- `skills/workflow-feature/SKILL.md` — после инициализации, для добавления фич
- `skills/pattern-clean-architecture/SKILL.md` — паттерн чистой архитектуры
- `skills/pattern-modular-monolith/SKILL.md` — паттерн модульного монолита
- `references/prd-template.md` — шаблон PRD
- `references/tech-stack-selection.md` — гайд по выбору технологий

---

**END OF WORKFLOW**
