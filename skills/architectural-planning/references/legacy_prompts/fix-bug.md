# 🐛 `code` Prompt — Fix Bug

<purpose>
Шаблон промпта для делегирования исправления бага агенту `code`.
Баг = код делает НЕ то, что должен (отклонение от спецификации).
</purpose>

---

## Когда Использовать

**Подходит для:**
- Runtime ошибки (exceptions, crashes)
- Неправильное поведение (результат отличается от ожидаемого)
- Регрессии (работало, перестало)
- Edge cases (граничные условия)
- Performance баги (утечки памяти, бесконечные циклы)

**НЕ использовать для:**
- Новой функциональности → `implement.md`
- Улучшения структуры кода → `refactor.md`
- "Мне не нравится как работает" → это change request, не баг

---

## Template

```markdown
# Task: Fix Bug — [Краткое описание бага]

## Bug Description
**Что происходит (Actual):**
[Точное описание неправильного поведения]

**Что должно происходить (Expected):**
[Точное описание корректного поведения]

**Воспроизведение:**
1. [Шаг 1]
2. [Шаг 2]
3. [Шаг 3]
→ Результат: [actual]
→ Ожидалось: [expected]

## Root Cause Analysis
[Если известно — описание причины]
[Если неизвестно — указать "Требуется исследование"]

**Гипотеза:**
[Предполагаемая причина бага]

**Подтверждение:**
[Как подтвердить гипотезу]

## Scope
[Точные шаги для фикса. Минимально необходимое.]

1. [Шаг 1]
2. [Шаг 2]
3. [Шаг 3]

## Constraints
❌ Не фиксить другие баги "заодно"
❌ Не рефакторить "заодно"
❌ Не менять поведение за пределами фикса
❌ Не добавлять новую функциональность
❌ Минимальные изменения для решения проблемы

## Acceptance Criteria
✅ Баг больше не воспроизводится
✅ Регрессионный тест добавлен
✅ Существующие тесты проходят
✅ Build/Lint чистые
✅ [Конкретная проверка для этого бага]

## Files to Investigate / Modify
| File | Likely Issue | Action |
|------|--------------|--------|
| `path/to/file.ts` | [Что может быть не так] | INVESTIGATE / MODIFY |

## Verification
[Как убедиться что фикс работает]

1. Воспроизвести баг → должен быть пофикшен
2. Запустить регрессионный тест → должен проходить
3. Запустить все тесты → должны проходить
4. [Дополнительная проверка если нужна]

## Output Format
1. Root cause (если не было известно)
2. Что изменено
3. Регрессионный тест добавлен
4. Все тесты проходят
```

---

## Примеры Заполнения

### Runtime Exception

```markdown
# Task: Fix Bug — NullPointerException in UserService.getProfile

## Bug Description
**Actual:**
При вызове `GET /api/users/123/profile` возвращается 500 error.
Stack trace: `NullPointerException at UserService.getProfile:45`

**Expected:**
Возвращается профиль пользователя или 404 если не найден.

**Воспроизведение:**
1. Удалить запись Profile для user_id=123 в БД
2. Вызвать GET /api/users/123/profile
→ Результат: 500 Internal Server Error
→ Ожидалось: 404 Not Found

## Root Cause Analysis
**Гипотеза:**
`userRepository.findProfile(userId)` возвращает null,
но код не проверяет на null перед обращением к полям.

**Подтверждение:**
Строка 45 в UserService: `return profile.toDto();` — нет null check.

## Scope
1. Добавить null check в UserService.getProfile
2. Выбрасывать NotFoundException если profile == null
3. Добавить регрессионный тест

## Constraints
❌ Не менять логику поиска
❌ Не добавлять автоматическое создание profile
❌ Не рефакторить другие методы

## Acceptance Criteria
✅ При отсутствии profile возвращается 404
✅ При наличии profile возвращается 200 + данные
✅ Регрессионный тест добавлен
✅ Существующие тесты проходят

## Files to Modify
| File | Issue | Action |
|------|-------|--------|
| `src/services/UserService.ts:45` | Missing null check | MODIFY |
| `tests/services/UserService.test.ts` | Missing test case | MODIFY |

## Verification
1. Удалить profile, вызвать API → 404
2. Создать profile, вызвать API → 200
3. Все тесты проходят
```

### Logic Error

```markdown
# Task: Fix Bug — Incorrect date calculation in subscription renewal

## Bug Description
**Actual:**
Подписка продлевается на 30 дней вместо 1 месяца.
Пример: подписка от 31 января продлевается до 2 марта (30 дней),
а не до 28/29 февраля (1 месяц).

**Expected:**
Подписка продлевается на 1 календарный месяц.

**Воспроизведение:**
1. Создать подписку с датой начала 2024-01-31
2. Вызвать renew()
→ Результат: expiresAt = 2024-03-02
→ Ожидалось: expiresAt = 2024-02-29

## Root Cause Analysis
**Гипотеза:**
Используется `addDays(30)` вместо `addMonths(1)`.

**Подтверждение:**
В `SubscriptionService.renew()` строка 78:
`subscription.expiresAt = subscription.expiresAt.addDays(30)`

## Scope
1. Заменить `addDays(30)` на `addMonths(1)`
2. Обновить тесты с edge cases (31 января, 31 марта)
3. Добавить регрессионный тест

## Constraints
❌ Не менять логику для годовых подписок
❌ Не менять другие даты (createdAt, etc.)
❌ Не рефакторить date utils

## Acceptance Criteria
✅ 31 января + 1 месяц = 28/29 февраля
✅ 31 марта + 1 месяц = 30 апреля
✅ Регрессионные тесты добавлены
✅ Существующие тесты обновлены

## Files to Modify
| File | Issue | Action |
|------|-------|--------|
| `src/services/SubscriptionService.ts:78` | Wrong date calc | MODIFY |
| `tests/services/SubscriptionService.test.ts` | Add edge cases | MODIFY |
```

---

## Чеклист перед Отправкой

- [ ] Баг чётко описан (Actual vs Expected)
- [ ] Шаги воспроизведения указаны
- [ ] Root cause гипотеза есть (или указано "требуется исследование")
- [ ] Scope минимален — фиксим только этот баг
- [ ] Регрессионный тест обязателен
- [ ] Constraints запрещают "заодно" фиксы

---

## ⚠️ Anti-Patterns

| Anti-Pattern | Почему плохо | Что делать |
|--------------|--------------|------------|
| "Пофикси все баги в этом файле" | Размытый scope, риск регрессий | Один баг = одна задача |
| "Пофикси и заодно отрефактори" | Смешение целей | Сначала фикс, потом рефактор |
| "Баг где-то в этом модуле" | Нет диагностики | Сначала исследование |
| Фикс без теста | Баг вернётся | Регрессионный тест обязателен |

---

**Связанные файлы:**
- `../../workflow-debugging/SKILL.md` — диагностика сложных багов
- `../SKILL.md` — для новой функциональности
- `./refactor.md` — для рефакторинга
- `../../../forensic-investigation/references/ai-failure-modes.md` — если `code` не может найти баг

---

**END OF TEMPLATE**
