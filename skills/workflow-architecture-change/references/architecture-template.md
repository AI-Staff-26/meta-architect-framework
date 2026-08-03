# 🏗️ Architecture Template

<purpose>
Шаблон документирования архитектуры системы или компонента.
Используется как источник правды для технических решений.
</purpose>

---

> **Инструкция:** Заполни секции ниже. Удали неприменимые секции.  
> Для нового проекта: заполни полностью.  
> Для фичи: обнови затронутые секции.

---

## Метаданные

| Поле | Значение |
|------|----------|
| **Система/Компонент** | [Название] |
| **Версия документа** | 1.0 |
| **Дата обновления** | YYYY-MM-DD |
| **Владелец** | [Team / Person] |
| **Статус** | Draft / Approved / Deprecated |

---

## Обзор Системы

### Назначение
> Что делает система и зачем?

[1-3 предложения о назначении системы]

### Ключевые Характеристики
- **Тип:** [Web App / API / CLI / Library / Microservice]
- **Язык:** [TypeScript / Python / Go / etc.]
- **Фреймворк:** [Next.js / FastAPI / etc.]
- **Стиль архитектуры:** [Monolith / Microservices / Serverless / Event-driven]

### Границы Системы
```
┌─────────────────────────────────────────┐
│              [System Name]              │
│                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ Module  │  │ Module  │  │ Module  │  │
│  │    A    │──│    B    │──│    C    │  │
│  └─────────┘  └─────────┘  └─────────┘  │
│                                         │
└─────────────────────────────────────────┘
        ▲               │
        │               ▼
  [External Input]  [External Output]
```

---

## Структура Компонентов

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Presentation                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │   Web    │  │  Mobile  │  │   CLI    │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
└───────┼─────────────┼─────────────┼──────────────────────┘
        │             │             │
        ▼             ▼             ▼
┌──────────────────────────────────────────────────────────┐
│                      API Layer                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │              REST / GraphQL / gRPC                │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                   Business Logic                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  Service   │  │  Service   │  │  Service   │         │
│  │     A      │  │     B      │  │     C      │         │
│  └────────────┘  └────────────┘  └────────────┘         │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                    Data Layer                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  Database  │  │   Cache    │  │  Storage   │         │
│  └────────────┘  └────────────┘  └────────────┘         │
└──────────────────────────────────────────────────────────┘
```

### Компоненты

| Компонент | Назначение | Технологии |
|-----------|------------|------------|
| **[Component A]** | [What it does] | [Tech stack] |
| **[Component B]** | [What it does] | [Tech stack] |
| **[Component C]** | [What it does] | [Tech stack] |

---

## Структура Каталогов

```
project-root/
├── src/
│   ├── api/              # API endpoints / routes
│   ├── services/         # Business logic
│   ├── models/           # Data models / entities
│   ├── repositories/     # Data access layer
│   ├── utils/            # Shared utilities
│   └── config/           # Configuration
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── Architecture.md   # This file
│   ├── Requirements.md
│   └── adr/              # Architecture Decision Records
├── scripts/              # Build / deploy scripts
└── config/               # Environment configs
```

### Соглашения об Именовании

| Тип | Паттерн | Пример |
|-----|---------|--------|
| Файлы | kebab-case | `user-service.ts` |
| Классы | PascalCase | `UserService` |
| Функции | camelCase | `getUserById` |
| Константы | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Таблицы БД | snake_case | `user_sessions` |

---

## Модель Данных

### Сущности (Entities)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│    User     │      │   Project   │      │    Task     │
├─────────────┤      ├─────────────┤      ├─────────────┤
│ id          │──┐   │ id          │──┐   │ id          │
│ email       │  │   │ name        │  │   │ title       │
│ name        │  │   │ description │  │   │ status      │
│ created_at  │  └──>│ owner_id    │  └──>│ project_id  │
└─────────────┘      │ created_at  │      │ assignee_id │
                     └─────────────┘      └─────────────┘
```

### Схема Базы Данных

| Таблица | Поля | Связи |
|---------|------|-------|
| `users` | id, email, name, created_at | has_many: projects, tasks |
| `projects` | id, name, owner_id, created_at | belongs_to: user |
| `tasks` | id, title, project_id, assignee_id | belongs_to: project, user |

---

## API Контракты

### Endpoints

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/api/v1/users` | List users | Query params | `User[]` |
| POST | `/api/v1/users` | Create user | `CreateUserDto` | `User` |
| GET | `/api/v1/users/:id` | Get user | Path param | `User` |
| PUT | `/api/v1/users/:id` | Update user | `UpdateUserDto` | `User` |
| DELETE | `/api/v1/users/:id` | Delete user | Path param | `204` |

### Пример Request/Response

```json
// POST /api/v1/users
// Request
{
  "email": "user@example.com",
  "name": "John Doe"
}

// Response (201 Created)
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Коды Ошибок

| Code | Meaning | When |
|------|---------|------|
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate / race condition |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected failure |

---

## Интеграции

### Внешние Сервисы

| Сервис | Назначение | Протокол | Auth |
|--------|------------|----------|------|
| [Service A] | [Purpose] | REST | API Key |
| [Service B] | [Purpose] | gRPC | mTLS |
| [Service C] | [Purpose] | Webhook | HMAC |

### Диаграмма Интеграции

```
┌─────────┐     REST      ┌─────────────┐
│ Our App │───────────────│ External API │
└────┬────┘               └─────────────┘
     │
     │ Events
     ▼
┌─────────────┐     Webhook     ┌─────────────┐
│ Message Q   │─────────────────│ 3rd Party   │
└─────────────┘                 └─────────────┘
```

---

## Безопасность

### Аутентификация
- **Метод:** [JWT / OAuth2 / API Key]
- **Provider:** [Auth0 / Cognito / Custom]
- **Token lifetime:** [Access: 15m, Refresh: 7d]

### Авторизация
- **Модель:** [RBAC / ABAC / ACL]
- **Роли:** [admin, editor, viewer]
- **Разрешения:** [Table of role → permissions]

### Защита Данных
| Данные | Классификация | Защита |
|--------|---------------|--------|
| Пароли | Secret | bcrypt hash |
| PII | Sensitive | Encrypted at rest |
| Tokens | Critical | Secure storage |

---

## Производительность

### Кэширование
| Layer | Технология | TTL | Invalidation |
|-------|------------|-----|--------------|
| API Response | Redis | 5m | On update |
| Database | Connection pool | - | - |
| Static | CDN | 1h | Deploy |

### Масштабирование
- **Горизонтальное:** [Как добавляем instances]
- **Вертикальное:** [Лимиты ресурсов]
- **Database:** [Read replicas / Sharding]

---

## Observability

### Логирование
- **Формат:** JSON structured
- **Уровни:** DEBUG, INFO, WARN, ERROR
- **Destination:** [Stdout / CloudWatch / ELK]

### Мониторинг
| Метрика | Алерт Порог | Action |
|---------|-------------|--------|
| Response time p99 | > 500ms | Scale up |
| Error rate | > 1% | Page on-call |
| CPU usage | > 80% | Auto-scale |

### Трейсинг
- **Система:** [OpenTelemetry / Jaeger / X-Ray]
- **Sampling:** [100% / Head-based / Tail-based]

---

## Развёртывание

### Окружения
| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost:3000 | Local dev |
| Staging | staging.example.com | Testing |
| Production | example.com | Live |

### CI/CD Pipeline
```
Push → Lint → Test → Build → [Staging Deploy] → [Prod Deploy]
                      │              │                │
                      └──────────────┴───Manual Gate──┘
```

### Инфраструктура
- **Platform:** [AWS / GCP / Azure / Vercel]
- **Compute:** [EC2 / Lambda / ECS / K8s]
- **Database:** [RDS / DynamoDB / MongoDB Atlas]
- **Cache:** [ElastiCache / Redis Cloud]
- **CDN:** [CloudFront / Cloudflare]

---

## Решения (ADR Summary)

| ADR | Решение | Статус | Дата |
|-----|---------|--------|------|
| ADR-001 | [Architecture style choice] | Accepted | YYYY-MM-DD |
| ADR-002 | [Database selection] | Accepted | YYYY-MM-DD |
| ADR-003 | [Auth approach] | Proposed | YYYY-MM-DD |

См. `memory/adrs/` для полного описания.

---

## Известные Ограничения

- ❌ [Limitation 1: description + workaround if any]
- ❌ [Limitation 2: description]
- ⚠️ [Technical debt: description + when to address]

---

## История Изменений

| Версия | Дата | Автор | Изменения |
|--------|------|-------|-----------|
| 1.0 | YYYY-MM-DD | [Name] | Initial architecture |
| 1.1 | YYYY-MM-DD | [Name] | Added caching layer |

---

**END OF TEMPLATE**
