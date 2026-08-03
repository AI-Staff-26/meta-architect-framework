---
name: checklist-phase-completion
description: |
  Meta-Architect phase transition criteria. ANALYSIS→RESEARCH→PLANNING→
  IMPLEMENTATION→REVIEW→COMPLETION gates. Exit criteria per complexity level 
  (🟢🟡🔴). Required artifacts per phase. Anti-patterns detection.
---

# ✔️ Phase Completion Checklist — Чеклист Завершения Фаз

<purpose>
Критерии завершения каждой фазы работы Meta-Architect.
Используй для проверки готовности к переходу на следующую фазу.
</purpose>

---

## Фазы Работы

```
USER REQUEST
     ↓
[ANALYSIS] → Понимание задачи
     ↓
[RESEARCH] → Исследование (для 🟡🔴)
     ↓
[PLANNING] → План реализации
     ↓
[IMPLEMENTATION] → @coder работает
     ↓
[REVIEW] → @reviewer проверяет
     ↓
[COMPLETION] → Финализация
```

---

## 📊 ANALYSIS — Анализ

### Критерии завершения

- [ ] Задача понята полностью (или уточняющие вопросы заданы)
- [ ] Scope определён и ограничен
- [ ] Сложность оценена: 🟢 Simple / 🟡 Medium / 🔴 Complex
- [ ] Контекст загружен (memory/repo-wiki/, rules/ актуальны)
- [ ] Unknowns идентифицированы

### Выходные артефакты

| Сложность | Требуемые артефакты |
|-----------|---------------------|
| 🟢 Simple | — (переход к IMPLEMENTATION) |
| 🟡 Medium | Scope description → PLANNING |
| 🔴 Complex | Scope + unknowns list → RESEARCH |

### Критерии перехода

**→ RESEARCH** (если 🔴 или есть unknowns):

- Unknowns требуют исследования
- Архитектурные вопросы без ответа
- Нужен @coder-expert

**→ PLANNING** (если 🟡):

- Scope понятен
- Нет критических unknowns
- Решение очевидно

**→ IMPLEMENTATION** (если 🟢):

- Scope тривиален
- Нет архитектурных решений
- ≤2 файла

---

## 🔍 RESEARCH — Исследование

### Критерии завершения

- [ ] Research.md создан
- [ ] Текущая архитектура проанализирована
- [ ] Зависимости и ограничения определены
- [ ] Альтернативные подходы исследованы
- [ ] Риски идентифицированы
- [ ] Unknowns разрешены (или определены как acceptable)

### Выходные артефакты

```markdown
/docs/Research.md
- Current State Analysis
- Dependencies Map
- Constraints & Limitations
- Alternative Approaches
- Risks Assessment
- Recommendations
```

### Критерии перехода → PLANNING

- [ ] Research.md существует и полон
- [ ] Рекомендуемый подход обоснован
- [ ] Риски имеют митигации
- [ ] @coder-expert завершил (если вызывался)

---

## 📝 PLANNING — Планирование

### Критерии завершения

- [ ] Plan.md создан
- [ ] Архитектурное решение описано
- [ ] Альтернативы рассмотрены (для 🟡🔴)
- [ ] Почему выбран этот подход — обосновано
- [ ] Список файлов + изменения определён
- [ ] Порядок выполнения установлен
- [ ] Acceptance Criteria измеримы
- [ ] Риски и митигации описаны
- [ ] ADR создан (если архитектурное решение)

### Выходные артефакты

| Сложность | Артефакты |
|-----------|-----------|
| 🟢 Simple | — (нет плана) |
| 🟡 Medium | Plan.md |
| 🔴 Complex | Research.md + Plan.md + ADR (опционально) |

### Критерии перехода → IMPLEMENTATION

- [ ] 🛑 STOP gate пройден (user approval для 🟡🔴)
- [ ] Plan.md утверждён
- [ ] Промпт для @coder готов

---

## ⚙️ IMPLEMENTATION — Реализация

### Критерии завершения

- [ ] @coder выполнил все шаги из плана
- [ ] Код соответствует Requirements
- [ ] Build проходит
- [ ] Тесты написаны и проходят
- [ ] Нет lint ошибок

### Выходные артефакты

- Рабочий код
- Тесты
- Обновлённые интерфейсы/типы (если применимо)

### Критерии перехода → REVIEW

- [ ] @coder завершил с отчётом
- [ ] Build/tests проходят
- [ ] Готов к передаче @reviewer

---

## 🔎 REVIEW — Ревью

### Критерии завершения

- [ ] @reviewer выполнил проверку по `checklists/code-review.md`
- [ ] Вердикт вынесен: PASS или FAIL
- [ ] Комментарии задокументированы

### Выходные артефакты

```markdown
## Review Result: PASS / FAIL

**Checked:**
- [x] Functionality
- [x] Security
- [x] Architecture
- [x] Code Quality

**Issues:** [если FAIL]
**Comments:** [опционально]
```

### Критерии перехода

**→ COMPLETION** (если PASS):

- [ ] Все проверки пройдены
- [ ] Нет блокирующих issues

**→ IMPLEMENTATION** (если FAIL):

- [ ] Issues понятны
- [ ] План исправления есть
- [ ] @coder промпт обновлён

**→ PLANNING** (если FAIL критично):

- [ ] Фундаментальная проблема в подходе
- [ ] Нужен пересмотр плана
- [ ] Возможно @coder-expert

---

## ✅ COMPLETION — Завершение

### Критерии завершения

- [ ] @reviewer PASS получен
- [ ] Документация обновлена:
  - [ ] Architecture.md (если изменения)
  - [ ] Requirements.md (если новые требования)
  - [ ] Tasks.md (задача отмечена выполненной)
- [ ] ADR создан (если было arch решение)
- [ ] Пользователь уведомлён

### Выходные артефакты

- Обновлённые `/docs/*`
- Финальный отчёт пользователю

### Критерии завершения задачи

- [ ] Все Acceptance Criteria выполнены
- [ ] Код в production-ready состоянии
- [ ] Документация актуальна
- [ ] Нет открытых вопросов

---

## Anti-Patterns

| Anti-Pattern | Почему плохо | Как избежать |
|--------------|--------------|--------------|
| Skip RESEARCH для 🔴 | Незнание ведёт к переделкам | Всегда Research.md для Complex |
| Skip STOP gate | User не согласен с планом | Обязательный STOP для 🟡🔴 |
| Skip REVIEW | Баги попадают в production | ВСЕГДА @reviewer после @coder |
| Unclear Acceptance | Непонятно когда "готово" | Измеримые критерии |
| Skip docs update | Документация устаревает | Обновлять в COMPLETION |

---

## Quick Reference

```
Phase Transitions:

ANALYSIS:
  🟢 → IMPLEMENTATION
  🟡 → PLANNING
  🔴 → RESEARCH

RESEARCH:
  → PLANNING (all unknowns resolved)

PLANNING:
  → 🛑 STOP (await approval)
  → IMPLEMENTATION (after approval)

IMPLEMENTATION:
  → REVIEW (@coder done)

REVIEW:
  PASS → COMPLETION
  FAIL → IMPLEMENTATION or PLANNING

COMPLETION:
  → Update docs → Report → DONE
```

---

**Связанные файлы:**

- `workflow-feature/SKILL.md` — полный workflow
- `checklist-code-review/SKILL.md` — чеклист для REVIEW фазы
- `architectural-planning/references/plan-template.md` — шаблон Plan.md
- `forensic-investigation/references/research-template.md` — шаблон Research.md

---

**END OF CHECKLIST**
