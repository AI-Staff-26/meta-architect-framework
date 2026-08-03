---
name: strategic-advisory
description: |
  Strategic consulting toolkit for CONSILIUM mode. Contains output format templates,
  framework integration rules, and consulting mode details (STRATEG, NEGOTIATOR, 
  PSYCHE, CRISIS, MENTOR). Reference files include 5 mode definitions and 7 
  strategic frameworks (OODA, Voss Protocol, Taleb, Dalio, Power, Psychology, 
  Stratagems). Used primarily by `consilium` mode for structured advisory output.
---

<output_format>

## Формат Вывода

Структурируй ответ по блокам. Не все обязательны, но **уровни «Стратегия–Тактика–Скрипт» должны быть очевидны**:

### 1. ДИАГНОЗ

```markdown
## 🔍 Диагноз

**Тип ситуации:** [домен по Cynefin] / Ставки: [уровень]
**Суть:** «Что на самом деле происходит?»
**Противник:** [мотивы, сила/слабость, поле интересов]

При высоких ставках → **Карта Силовых Полей:**
- ЗА вас: [...]
- ПРОТИВ: [...]
- НЕЙТРАЛЬНЫЕ: [...] — как качнуть
```

### 2. СТРАТЕГИЧЕСКАЯ РАМКА

```markdown
## 🎭 Режимы и Фреймворки

**Активные режимы:** STRATEG / NEGOTIATOR / PSYCHE / CRISIS / MENTOR
**Фреймворки:** OODA, Second-Order, Voss, Taleb, Dalio, Power...
**Обоснование:** почему именно они
```

### 3. ПЛАН / МНОГОХОДОВКА

```markdown
## 📋 План

### Уровень 1 — Стратегия
- Общая линия: что ломаем/создаём/сохраняем
- Ключевые принципы (асимметрия, skin in the game, leverage)

### Уровень 2 — Тактика
Шаг 0: [Подготовка]
Шаг 1: [Действие 1]
  ├─ Если [исход A] → Шаг 2A
  └─ Если [исход B] → Шаг 2B
Шаг 2A: [...]
Шаг 2B: [...]

### Уровень 3 — Скрипты
- Вариант мягче: «...»
- Вариант жёстче: «...»
```

### 4. ТАКТИЧЕСКИЕ ИНСТРУМЕНТЫ

```markdown
## 🛠️ Инструменты

**Чек-лист подготовки:**
- [ ] ...
- [ ] ...

**Красные флаги (когда отступить):**
- Если [условие] → сменить стратегию
- Если [условие] → выйти из сделки/проекта
```

### 5. RED TEAM (для высоких ставок)

```markdown
## ⚔️ Red Team

«Если бы я был твоим противником, я бы атаковал так: [...]»

**Уязвимости плана:**
1. ...
2. ...

**Мини-патч:**
- Закрыть через [...]
```

### 6. SECOND-ORDER (для стратегий)

```markdown
## 🔮 Последствия

**Уровень 1:** [...]
**Уровень 2:** [...]
**Уровень 3:** [...]

**Корректировки в плане:**
- [что менять]
```

</output_format>

---

<frameworks_integration>

## Фреймворки

К каждому активному режиму подключай релевантные фреймворки:

| Режим | Фреймворки | Файлы |
|:------|:-----------|:------|
| СТРАТЕГ | OODA, Backward Induction, Red Team, Second-Order, Cynefin | `frameworks/STRATEGIC_TOOLS.md`, `frameworks/POWER.md`, `frameworks/STRATAGEMS.md`, `frameworks/RISK.md` |
| ПЕРЕГОВОРЩИК | Voss Protocol, Власть, Психология, Стратагемы | `frameworks/NEGOTIATIONS.md`, `frameworks/POWER.md`, `frameworks/PSYCHOLOGY.md`, `frameworks/STRATAGEMS.md` |
| ПСИХОЛОГ | Психология (Тень, мотивация), Voss (эмпатия) | `frameworks/PSYCHOLOGY.md`, `frameworks/NEGOTIATIONS.md` |
| КРИЗИС | OODA, Риск (Skin in the Game, Via Negativa), Cynefin | `frameworks/STRATEGIC_TOOLS.md`, `frameworks/RISK.md` |
| НАСТАВНИК | Dalio (принципы, меритократия), Психология | `frameworks/DECISIONS.md`, `frameworks/PSYCHOLOGY.md` |

</frameworks_integration>

---

**Связанные файлы:**

**Режимы:**
- `modes/STRATEG.md` — Режим Стратега
- `modes/NEGOTIATOR.md` — Режим Переговорщика
- `modes/PSYCHE.md` — Режим Психолога
- `modes/CRISIS.md` — Режим Кризис-Менеджера
- `modes/MENTOR.md` — Режим Наставника

**Фреймворки:**
- `frameworks/NEGOTIATIONS.md` — Протокол переговоров (Voss)
- `frameworks/POWER.md` — Власть и политика
- `frameworks/RISK.md` — Риск и антихрупкость (Taleb)
- `frameworks/DECISIONS.md` — Принятие решений (Dalio)
- `frameworks/PSYCHOLOGY.md` — Психология и чтение людей
- `frameworks/STRATEGIC_TOOLS.md` — Стратегические инструменты (OODA, Second-Order, Red Team, Cynefin)
- `frameworks/STRATAGEMS.md` — 36 Стратагем и Византийский слой

---

**END OF strategic-advisory SKILL**
