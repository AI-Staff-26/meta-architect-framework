# 🛠️ Tech Stack Selection — Выбор Технологического Стека

<purpose>
Стек — это 10-летнее решение. Выбирай осознанно, не по хайпу.
</purpose>

---

## Ключевые Принципы

### 1. Boring Technology Club

> **Скучные технологии = предсказуемые проблемы.**

```
❌ Избегай:
- "Новый фреймворк, все о нём говорят"
- "Посмотри, какой крутой синтаксис"
- "Это будет мейнстрим через год"

✅ Предпочитай:
- "5+ лет в продакшене у больших компаний"
- "Понятная документация и активное сообщество"
- "Известные проблемы с известными решениями"
```

**Правило Innovation Tokens:** У проекта 3-5 "токенов инновации". Каждая нестандартная технология стоит 1 токен. Потратишь все — получишь хаос.

---

### 2. Матрица Зрелости

| Критерий | 🔴 Опасно | 🟡 Осторожно | 🟢 Безопасно |
|----------|-----------|--------------|--------------|
| Возраст | <1 года | 1-3 года | >3 лет |
| GitHub Stars | <5K | 5K-20K | >20K |
| Major Version | 0.x | 1.x-2.x | 3.x+ |
| Компании-пользователи | Стартапы | Scale-ups | Enterprises |
| Stack Overflow ответов | <1K | 1K-10K | >10K |
| Последний релиз | >6 мес назад | 1-6 мес | <1 мес |

**Правило:** 🔴 в любом критерии = требует обоснования.

---

### 3. Принцип "Один Выбор — Один Уровень"

> **На каждом уровне архитектуры — один главный инструмент.**

```
Уровни:
┌─────────────────────────────────────┐
│ Frontend: React ИЛИ Vue ИЛИ Angular │  ← Один!
├─────────────────────────────────────┤
│ API: REST ИЛИ GraphQL ИЛИ gRPC     │  ← Один!
├─────────────────────────────────────┤
│ Backend: Node ИЛИ Go ИЛИ Python    │  ← Один!
├─────────────────────────────────────┤
│ Database: PostgreSQL ИЛИ MongoDB   │  ← Один!
└─────────────────────────────────────┘
```

**Исключение:** Разные bounded contexts могут иметь разные стеки, но это стоит 2 токена инновации.

---

### 4. Fit-for-Purpose (Соответствие Цели)

> **Выбирай технологию под задачу, не задачу под технологию.**

**Контрольные вопросы:**

```markdown
Для каждой технологии спроси:
1. Какую КОНКРЕТНУЮ проблему она решает?
2. Как решали эту проблему ДО появления этой технологии?
3. Что будет, если использовать "скучную" альтернативу?
4. Есть ли экспертиза в команде?
5. Сможем ли нанять разработчиков через 2 года?
```

**Матрица решений:**

| Задача | ❌ Overkill | ✅ Fit | ❌ Недостаточно |
|--------|------------|--------|-----------------|
| CRUD MVP | Microservices | Monolith | Spreadsheet |
| Real-time chat | Kafka | WebSocket | HTTP Polling |
| Mobile app | Flutter | React Native | PWA |
| 10 RPS | Kubernetes | Docker Compose | Bare VPS |
| 10K RPS | Bare metal | Kubernetes | Docker Compose |

---

### 5. TCO (Total Cost of Ownership)

> **Стоимость технологии = начальная + операционная + выходная.**

```
TCO = Setup Cost + Running Cost + Exit Cost

Setup Cost:
- Время на изучение
- Настройка инфраструктуры
- Интеграция с существующим кодом

Running Cost:
- Лицензии / подписки
- Инфраструктура (RAM, CPU, egress)
- Время на поддержку / обновления
- Мониторинг специфичных проблем

Exit Cost:
- Миграция данных
- Переписывание интеграций
- Vendor lock-in
```

---

## Алгоритм Выбора Стека

### Шаг 1: Определи Требования

```markdown
## Функциональные
- Тип приложения (web/mobile/API/CLI)
- Ключевые фичи
- Интеграции

## Нефункциональные
- Нагрузка (RPS, users, data volume)
- Latency requirements
- Availability (SLA)
- Security/Compliance

## Ограничения
- Бюджет
- Timeline
- Экспертиза команды
- Существующая инфраструктура
```

### Шаг 2: Сформируй Shortlist

```markdown
Для каждого уровня:
1. Определи 2-3 кандидата
2. Исключи 🔴 по матрице зрелости
3. Проверь Fit-for-Purpose
```

### Шаг 3: Оцени по Критериям

```markdown
| Критерий | Вес | Option A | Option B | Option C |
|----------|-----|----------|----------|----------|
| Зрелость | 20% | 8 | 9 | 6 |
| Fit-for-Purpose | 25% | 9 | 7 | 8 |
| Экспертиза команды | 20% | 7 | 9 | 5 |
| TCO | 15% | 8 | 6 | 9 |
| Ecosystem | 10% | 8 | 9 | 7 |
| Hiring Pool | 10% | 9 | 8 | 6 |
| **TOTAL** | | **8.1** | **7.9** | **6.9** |
```

### Шаг 4: Проведи Spike

```markdown
Перед финальным решением:
- Реализуй ключевой use case на 2 топ-кандидатах
- Ограничь время: 4-8 часов на кандидата
- Оцени Developer Experience
- Проверь, как решаются edge cases
```

### Шаг 5: Зафиксируй в memory/*

```markdown
1. Запиши решение в memory/DECISIONS.md:
   ## #NNN — Tech Stack: [Category] (YYYY-MM-DD)
   **Context**: Выбор технологического стека
   **Options**: [Option A, Option B]
   **Chosen**: [Selected]
   **Consequences**: [What follows]

2. Добавь факты в memory/FACTS.md:
   ## Technical
   - Tech stack: [details] [source: stack-selection, date: YYYY-MM-DD]

3. Если архитектурное решение — создай memory/adrs/ADR-NNN.md
```

---

## Антипаттерны

| Антипаттерн | Признак | Как избежать |
|-------------|---------|--------------|
| **Hype-Driven** | "Все используют" | Проверь матрицу зрелости |
| **CV-Driven** | "Хочу в резюме" | Fit-for-Purpose проверка |
| **Golden Hammer** | "Мы всегда используем X" | Оценка под требования |
| **Bleeding Edge** | Version 0.x в проде | Innovation Tokens |
| **Frankenstack** | 5+ языков, 3+ БД | Один выбор на уровень |
| **Lock-in Blindness** | "Cloud Native" без Exit Plan | TCO с Exit Cost |

---

## Референсные Стеки

### 🌐 Web Application (Enterprise)

```
Frontend: React + TypeScript
API: REST (OpenAPI)
Backend: Node.js (NestJS) или Go
Database: PostgreSQL
Cache: Redis
Queue: RabbitMQ или SQS
Infra: Kubernetes или ECS
```

### 📱 Mobile-First Startup

```
Mobile: React Native или Flutter
API: GraphQL
Backend: Node.js (Express) или Python (FastAPI)
Database: PostgreSQL + Redis
Infra: Managed (Supabase/Firebase) или Docker Compose
```

### 🎯 High-Performance

```
API: gRPC
Backend: Go или Rust
Database: PostgreSQL (с партиционированием)
Cache: Redis Cluster
Queue: Kafka
Infra: Kubernetes с custom autoscaling
```

---

## Quick Reference

```
Stack Selection = 10-летнее решение

Правила:
1. Boring Technology > Hype
2. 3-5 Innovation Tokens максимум
3. Один инструмент на уровень
4. Fit-for-Purpose > Feature List
5. TCO = Setup + Running + Exit
```

---

**Связанные файлы:**
- `skills/workflow-architecture-change/references/adr-template.md` — шаблон ADR для фиксации решений
- `skills/workflow-new-project/SKILL.md` — workflow инициализации проекта
- `skills/pattern-modular-monolith/SKILL.md` — архитектурный паттерн

---

**END OF GUIDE**
