# 📸 Context Snapshot — Сохранение Контекста Сессии

<purpose>
Шаблон для создания функции снапшота контекста LLM перед завершением сессии
или при переключении между задачами. Позволяет продолжить работу
без потери информации.
</purpose>

---

## Когда Создавать

**Обязательно:**

- Перед завершением длинной сессии (>1 час работы)
- При переключении на другую задачу
- Перед передачей задачи другому агенту/разработчику

**Рекомендуется:**

- После каждого значимого milestone
- При возникновении сложных проблем
- Перед экспериментами с неизвестным исходом

---

## Template

```markdown
# Context Snapshot: [Название задачи/сессии]
*Created: YYYY-MM-DD HH:MM*
*Session Duration: [X часов/минут]*

## Current State

### Progress Summary
[Что сделано за сессию]

- [x] [Выполненный пункт 1]
- [x] [Выполненный пункт 2]
- [ ] [Незавершённый пункт — IN PROGRESS]
- [ ] [Неначатый пункт]

### Current Position
[Где именно остановились]

**Файл:** `path/to/current/file.ts`
**Строка/Функция:** [конкретное место]
**Действие:** [что делали в момент остановки]

### Modified Files
[Какие файлы были изменены за сессию]

| File | Status | Changes |
|------|--------|---------|
| `file1.ts` | ✅ Complete | [Описание изменений] |
| `file2.ts` | 🔄 In Progress | [Что сделано / что осталось] |
| `file3.ts` | ⏳ Not Started | [Что планировалось] |

## Active Context

### Key Decisions Made
[Важные решения принятые за сессию]

1. **[Решение 1]:** [Обоснование]
2. **[Решение 2]:** [Обоснование]

### Working Hypotheses
[Текущие предположения, которые проверяем]

1. [Гипотеза 1] — [Статус: подтверждена/опровергнута/проверяется]
2. [Гипотеза 2] — [Статус]

### Blockers / Issues
[Проблемы, которые не решены]

| Issue | Severity | Notes |
|-------|----------|-------|
| [Проблема 1] | 🔴 High | [Детали, попытки решения] |
| [Проблема 2] | 🟡 Medium | [Детали] |

### Open Questions
[Вопросы, требующие ответа]

1. [Вопрос 1]?
2. [Вопрос 2]?

## Technical Context

### Relevant Files
[Файлы, которые нужно держать в контексте]

```

memory/repo-wiki/overview.md — текущая архитектура
/src/module/Component.ts — основной файл работы
/tests/module/Component.test.ts — тесты

```

### Environment State
[Состояние окружения]

- Branch: `feature/task-name`
- Last Commit: `abc123 — "WIP: partial implementation"`
- Uncommitted Changes: [да/нет, какие]
- Tests Status: [passing/failing + какие]
- Build Status: [clean/errors]

### Dependencies / External State
[Внешние зависимости, состояние]

- Database: [состояние миграций, тестовые данные]
- External APIs: [какие используются, статус]
- Config: [особые настройки]

## Next Steps

### Immediate (Resume Here)
[Первое действие при возобновлении]

1. [Конкретный шаг 1]
2. [Конкретный шаг 2]

### Upcoming
[Следующие шаги после immediate]

1. [Шаг 1]
2. [Шаг 2]

### Risks / Warnings
[О чём помнить при продолжении]

⚠️ [Предупреждение 1]
⚠️ [Предупреждение 2]

## Session Notes
[Свободные заметки, наблюдения, мысли]

---
*End of Snapshot*
```

---

## Minimal Snapshot (Quick Save)

Для быстрого сохранения контекста:

```markdown
# Quick Context: [Задача]
*Time: YYYY-MM-DD HH:MM*

## Where I Am
- File: `path/to/file.ts`
- Doing: [действие]
- Blocked by: [если есть]

## Resume With
1. [Первое действие]
2. [Второе действие]

## Key Files
- `file1.ts`
- `file2.ts`

## Notes
[Критически важное]
```

---

## Примеры

### Development Session

```markdown
# Context Snapshot: User Authentication Refactor
*Created: 2024-01-15 18:30*
*Session Duration: 2.5 hours*

## Current State

### Progress Summary
- [x] Извлечь AuthService из UserController
- [x] Создать JWT utilities
- [ ] Добавить refresh token — IN PROGRESS
- [ ] Обновить тесты

### Current Position
**Файл:** `src/services/AuthService.ts`
**Функция:** `refreshToken()`
**Действие:** Реализация логики обновления токена, застрял на инвалидации

### Modified Files
| File | Status | Changes |
|------|--------|---------|
| `AuthService.ts` | 🔄 In Progress | 80% готов, осталось refreshToken |
| `JwtUtils.ts` | ✅ Complete | Создан с нуля |
| `UserController.ts` | ✅ Complete | Извлечена auth логика |

## Active Context

### Key Decisions Made
1. **JWT в Redis:** Храним invalidated tokens в Redis для быстрой проверки
2. **Refresh rotation:** Каждый refresh создаёт новую пару токенов

### Blockers / Issues
| Issue | Severity | Notes |
|-------|----------|-------|
| Redis connection в тестах | 🟡 Medium | Нужен mock или test container |

### Open Questions
1. TTL для refresh token — 7 дней или 30?
2. Нужен ли device fingerprint?

## Next Steps

### Immediate
1. Спросить про TTL у пользователя
2. Добавить Redis mock для тестов
3. Закончить refreshToken()

### Risks
⚠️ Не забыть обновить документацию API!
⚠️ Breaking change — старые токены перестанут работать
```

### Debug Session

```markdown
# Context Snapshot: Debug Memory Leak
*Created: 2024-01-15 22:15*
*Session Duration: 1 hour*

## Current State

### Progress Summary
- [x] Воспроизвёл утечку в development
- [x] Снял heap snapshot
- [x] Нашёл подозрительный рост EventListeners
- [ ] Найти источник — IN PROGRESS

### Current Position
**Файл:** `src/components/DataGrid.tsx`
**Строка:** 145-180 (useEffect cleanup)
**Действие:** Проверяю cleanup функции

## Working Hypotheses
1. Missing cleanup в useEffect DataGrid — проверяется
2. Event listeners не отписываются — отклонено (проверил)

## Next Steps
1. Добавить console.log в cleanup useEffect
2. Проверить React.StrictMode поведение
3. Попробовать React DevTools Profiler
```

---

## Чеклист перед Созданием Snapshot

- [ ] Current Position точно указан (файл, строка, действие)
- [ ] Modified Files актуальны
- [ ] Blockers перечислены
- [ ] Next Steps конкретны (первое действие понятно)
- [ ] Uncommitted changes указаны
- [ ] Key Decisions задокументированы

---

**Связанные файлы:**

- `workflows/ai-session.md` — управление AI сессиями
- `guides/context-management.md` — общие принципы контекста
- `templates/context.md` — формат memory/CONTEXT.md

---

**END OF TEMPLATE**
