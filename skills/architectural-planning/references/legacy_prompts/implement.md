# 🛠️ @coder Prompt — Implement

<purpose>
Шаблон промпта для делегирования задачи реализации агенту @coder.
Используется Meta-Architect для формирования точных инструкций.
</purpose>

---

## Использование

Скопируй структуру ниже и заполни все секции конкретными данными из контекста задачи.

---

## Template

```markdown
# Task: [Конкретное название задачи]

## Context
[Краткое описание: почему эта задача важна, как она вписывается в систему.
Укажи связь с существующими компонентами.]

## Scope
[Точный список шагов. Только то, что нужно сделать. Никакой лишней работы.]

1. [Шаг 1]
2. [Шаг 2]
3. [Шаг 3]

## Requirements
[Измеримые требования к результату]

1. [Требование 1 — конкретное, проверяемое]
2. [Требование 2 — конкретное, проверяемое]
3. [Требование 3 — конкретное, проверяемое]

## Constraints (Что НЕ делать)
❌ Не расширять scope за пределы указанного
❌ Не менять контракты/зависимости без явного указания
❌ Не оставлять console.log/debug код
❌ Не добавлять новые зависимости без согласования
❌ [Дополнительные ограничения для конкретной задачи]

## Acceptance Criteria
✅ [Тесты проходят (unit / integration)]
✅ [Build чистый, без ошибок]
✅ [Lint чистый, без warnings]
✅ [Конкретный измеримый результат]
✅ [Еще один критерий если нужно]

## Files to Work With
| File | Action | Description |
|------|--------|-------------|
| `path/to/file.ts` | CREATE | Что создать |
| `path/to/file2.ts` | MODIFY | Что изменить |
| `path/to/file3.ts` | DELETE | Почему удалить |

## Reference
[Опционально: ссылки на связанные файлы, документацию, примеры]
- `memory/repo-wiki/overview.md` — структура системы
- `rules/meta-architect-framework.md` — ограничения и соглашения
- `path/to/similar/implementation` — пример аналогичной реализации

## Output Format
Только код. Объяснения не нужны.
После завершения — отчёт:
- Что сделано
- Какие файлы изменены
- Готово к @reviewer
```

---

## Примеры Заполнения

### 🟢 Simple Task

```markdown
# Task: Add getFullName method to User model

## Context
Нужен хелпер для отображения полного имени пользователя в UI.

## Scope
1. Добавить метод `getFullName()` в `User` модель
2. Добавить unit тест

## Requirements
1. Метод возвращает `firstName + ' ' + lastName`
2. Если одно из полей пустое — возвращает только заполненное
3. Если оба пустые — возвращает пустую строку

## Constraints
❌ Не менять существующие методы
❌ Не добавлять зависимости

## Acceptance Criteria
✅ Тест проходит
✅ TypeScript компилируется без ошибок

## Files to Work With
| File | Action | Description |
|------|--------|-------------|
| `src/models/User.ts` | MODIFY | Добавить метод |
| `tests/models/User.test.ts` | MODIFY | Добавить тесты |

## Output Format
Только код.
```

### 🟡 Medium Task

```markdown
# Task: Implement User Preferences API Endpoint

## Context
Новый endpoint для сохранения и получения пользовательских настроек.
Часть фичи персонализации UI. См. /docs/Plan.md.

## Scope
1. Создать DTO для preferences
2. Добавить GET /api/users/:id/preferences
3. Добавить PUT /api/users/:id/preferences
4. Добавить валидацию
5. Добавить интеграционные тесты

## Requirements
1. Preferences хранятся как JSON в существующей колонке `user.settings`
2. GET возвращает 404 если user не найден
3. PUT валидирует schema (max 10 keys, string values)
4. Auth: только owner или admin могут изменять

## Constraints
❌ Не создавать новую таблицу
❌ Не менять существующие endpoints
❌ Не расширять schema за пределы указанного

## Acceptance Criteria
✅ Оба endpoints работают
✅ Валидация отклоняет невалидные данные
✅ Auth проверяется
✅ Интеграционные тесты проходят
✅ Lint/Build чистые

## Files to Work With
| File | Action | Description |
|------|--------|-------------|
| `src/api/dto/UserPreferences.dto.ts` | CREATE | DTO + validation |
| `src/api/controllers/UserController.ts` | MODIFY | Добавить endpoints |
| `src/api/services/UserService.ts` | MODIFY | Бизнес-логика |
| `tests/api/user-preferences.test.ts` | CREATE | Интеграционные тесты |

## Reference
- `/docs/Plan.md` — детали плана
- `src/api/controllers/ProfileController.ts` — аналогичный паттерн

## Output Format
Только код. Отчёт после завершения.
```

---

## Чеклист перед Отправкой

- [ ] Название задачи конкретное (не "сделай фичу")
- [ ] Context объясняет ЗАЧЕМ
- [ ] Scope содержит точные шаги (не размытые)
- [ ] Requirements измеримые
- [ ] Constraints явно указывают ограничения
- [ ] Acceptance Criteria можно проверить
- [ ] Files to Work With перечислены
- [ ] Нет лишней работы в scope

---

**Связанные файлы:**
- `./refactor.md` — для рефакторинга
- `./fix-bug.md` — для багфиксов
- `../../workflow-feature/SKILL.md` — основной workflow
- `../../checklist-code-review/SKILL.md` — что проверит @reviewer

---

**END OF TEMPLATE**
