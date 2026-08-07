---
name: strategic-advisory
description: |
  The `consilium` agent's toolkit: five modes and seven frameworks — OODA,
  Cynefin, Voss, Taleb, Dalio, power, psychology. Use for negotiation,
  conflict, crisis, business model, pricing, or personal strategy.
---

# Strategic Advisory Toolkit

`consilium` decides which mode runs — this holds what the mode then does: its file, its frameworks, and the shape of the answer.

Blocks are used as the situation needs them, but the three levels — **стратегия → тактика → скрипт** — are always distinguishable. Advice that stops at strategy leaves the user to invent the moves; advice that is only scripts has no idea what it is playing for.

## Формат вывода

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

---

## Фреймворки по режимам

К активному режиму подключаются его фреймворки — файл читается перед ответом, а не пересказывается по памяти:

| Режим | Фреймворки | Файлы |
|:------|:-----------|:------|
| СТРАТЕГ | OODA, Backward Induction, Red Team, Second-Order, Cynefin | `frameworks/STRATEGIC_TOOLS.md`, `frameworks/POWER.md`, `frameworks/STRATAGEMS.md`, `frameworks/RISK.md` |
| ПЕРЕГОВОРЩИК | Voss Protocol, Власть, Психология, Стратагемы | `frameworks/NEGOTIATIONS.md`, `frameworks/POWER.md`, `frameworks/PSYCHOLOGY.md`, `frameworks/STRATAGEMS.md` |
| ПСИХОЛОГ | Психология (Тень, мотивация), Voss (эмпатия) | `frameworks/PSYCHOLOGY.md`, `frameworks/NEGOTIATIONS.md` |
| КРИЗИС | OODA, Риск (Skin in the Game, Via Negativa), Cynefin | `frameworks/STRATEGIC_TOOLS.md`, `frameworks/RISK.md` |
| НАСТАВНИК | Dalio (принципы, меритократия), Психология | `frameworks/DECISIONS.md`, `frameworks/PSYCHOLOGY.md` |

---

**Файлы:**

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

## Критерий завершения

Ответ готов, когда: режим выбран и назван; его файл и фреймворки прочитаны, а не воспроизведены по памяти; три уровня — стратегия, тактика, скрипт — различимы; у каждого шага есть ветки под ответ другой стороны; названы условия отхода; и при высоких ставках план атакован red team до выдачи, а последствия прослежены на три уровня.
