# 📄 PRD Template (Product Requirements Document)

<purpose>
Детальный документ требований к продукту с User Stories и Acceptance Criteria.
Подходит для планирования фич, когда нужна чёткая спецификация для реализации.
</purpose>

---

> **Инструкция:**
> 1. Получи описание фичи
> 2. Задай 3-5 уточняющих вопросов (с буквенными вариантами)
> 3. Заполни PRD на основе ответов
> 4. Сохрани в `/docs/prompt-[feature-name].md` или как часть prompt-файла

---

## Метаданные

| Поле | Значение |
|------|----------|
| **Feature** | [Название фичи] |
| **Created** | YYYY-MM-DD |
| **Author** | @meta-architect |
| **Status** | Draft / Approved / In Progress / Done |

---

## Introduction / Overview

[Краткое описание фичи и проблемы, которую она решает. 2-3 предложения.]

---

## Goals

> Специфичные, измеримые цели.

- [ ] [Цель 1: что достигаем]
- [ ] [Цель 2: что достигаем]
- [ ] [Цель 3: что достигаем]

---

## User Stories

> Каждая история должна быть достаточно маленькой для реализации за одну сессию.

### US-001: [Название]

**Description:**  
As a [роль], I want [функция] so that [выгода].

**Acceptance Criteria:**
- [ ] [Конкретный проверяемый критерий]
- [ ] [Конкретный проверяемый критерий]
- [ ] Typecheck/lint passes
- [ ] **[UI stories only]** Verify in browser

---

### US-002: [Название]

**Description:**  
As a [роль], I want [функция] so that [выгода].

**Acceptance Criteria:**
- [ ] [Конкретный проверяемый критерий]
- [ ] [Конкретный проверяемый критерий]
- [ ] Typecheck/lint passes

---

## Functional Requirements

> Нумерованный список конкретных функций.

- **FR-1:** The system must allow users to [действие]
- **FR-2:** When a user clicks [X], the system must [реакция]
- **FR-3:** The system must validate [что] before [действие]
- **FR-4:** The system must display [что] in [формат]
- **FR-5:** The system must store [данные] in [где]

---

## Non-Goals (Out of Scope)

> Что явно НЕ включено в эту версию.

- ❌ [Функция которая НЕ входит]
- ❌ [Функция которая НЕ входит]

---

## Design Considerations

> UI/UX требования (если применимо).

### UI Elements
- [Описание элементов интерфейса]
- [Состояния: loading, error, empty, success]

### Existing Components to Reuse
- `ComponentName` — для [чего]

### Mockups
- [Ссылка на дизайн / скриншот / описание]

---

## Technical Considerations

> Технические ограничения и зависимости.

### Constraints
- [Ограничение 1]
- [Ограничение 2]

### Integration Points
- [API/Service] — для [чего]
- [Database] — [какие изменения]

### Performance Requirements
- [Метрика]: [требование]

---

## Success Metrics

> Как измерим успех?

- [ ] [Метрика 1]
- [ ] [Метрика 2]

---

## Open Questions

> Что ещё требует уточнения?

1. [Вопрос 1]
2. [Вопрос 2]

---

## Checklist Before Approval

- [ ] Asked clarifying questions with lettered options
- [ ] Incorporated user's answers
- [ ] User stories are small and specific
- [ ] Acceptance criteria are verifiable (not «works correctly»)
- [ ] Functional requirements are numbered and unambiguous
- [ ] Non-goals section defines clear boundaries
- [ ] UI stories include browser verification

---

## Writing Guidelines

> PRD читатель может быть junior developer или AI agent. Поэтому:

- **Будь explicit и unambiguous** — никаких неявных ожиданий
- **Избегай жаргона** или объясняй его
- **Нумеруй требования** для удобства ссылок
- **Давай конкретные примеры** где это помогает пониманию
- **Acceptance Criteria должны быть verifiable:**
  - ❌ «Works correctly»
  - ✅ «Button shows confirmation dialog before deleting»

---

## Clarifying Questions Format

> Используй для быстрых итераций с пользователем.

```markdown
## Clarifying Questions

1. What is the primary goal of this feature?
   A. [Option A]
   B. [Option B]
   C. [Option C]
   D. Other: [please specify]

2. Who is the target user?
   A. [Option A]
   B. [Option B]
   C. [Option C]

3. What is the scope?
   A. Minimal viable version
   B. Full-featured implementation
   C. Just the backend/API
   D. Just the UI
```

**Пользователь отвечает:** `1A, 2C, 3B` — быстрая итерация.

---

## Example PRD

```markdown
# PRD: Task Priority System

## Introduction
Add priority levels to tasks so users can focus on what matters most.

## Goals
- Allow assigning priority (high/medium/low) to any task
- Provide clear visual differentiation between priority levels
- Enable filtering and sorting by priority

## User Stories

### US-001: Add priority field to database
**Description:** As a developer, I need to store task priority.
**Acceptance Criteria:**
- [ ] Add priority column: 'high' | 'medium' | 'low' (default 'medium')
- [ ] Generate and run migration successfully
- [ ] Typecheck passes

### US-002: Display priority indicator on task cards
**Description:** As a user, I want to see task priority at a glance.
**Acceptance Criteria:**
- [ ] Each task shows colored badge (red=high, yellow=medium, gray=low)
- [ ] Priority visible without hovering or clicking
- [ ] Verify in browser

## Functional Requirements
- FR-1: Add `priority` field to tasks ('high'|'medium'|'low', default 'medium')
- FR-2: Display colored priority badge on each task card
- FR-3: Include priority selector in task edit modal
- FR-4: Add priority filter dropdown to task list header

## Non-Goals
- ❌ No priority-based notifications
- ❌ No automatic priority assignment based on due date
```

---

## Связанные Файлы

- `skills/workflow-feature/references/requirements-template.md` — общий шаблон требований
- `skills/workflow-feature/references/feature-spec-template.md` — детальная спецификация
- `skills/workflow-requirements-interview/SKILL.md` — протокол интервью
- `skills/workflow-architecture-change/references/adr-template.md` — шаблон ADR

---

**END OF TEMPLATE**
