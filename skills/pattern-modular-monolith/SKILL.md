---
name: pattern-modular-monolith
description: |
  Module-based architecture pattern. api/internal separation, event-based 
  communication, shared kernel. Balance between monolith simplicity and 
  microservices flexibility. For 3-10 dev teams. Migration path to microservices.
---

# 🧱 Modular Monolith — Модульный Монолит

<purpose>
Паттерн организации кода с логическим разделением на модули.
Баланс между простотой монолита и гибкостью микросервисов.
</purpose>

---

## Когда Использовать

**Подходит для:**

- Средние проекты (3-10 разработчиков)
- Проекты с чёткими бизнес-доменами
- MVP с потенциалом роста
- Переход от монолита к микросервисам
- Когда микросервисы — overkill

**НЕ подходит для:**

- Маленькие проекты (1-2 разработчика) → Clean Architecture достаточно
- Огромные распределённые системы → Microservices
- Проекты с разными требованиями к масштабированию модулей

**Сложность внедрения:** 🟡 Medium

---

## Концепция

### Ключевая Идея

```
Один деплой. Множество автономных модулей.

┌─────────────────────────────────────────────┐
│              Modular Monolith               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  User   │ │  Order  │ │ Catalog │       │
│  │ Module  │ │ Module  │ │ Module  │       │
│  └────┬────┘ └────┬────┘ └────┬────┘       │
│       │           │           │             │
│  ═════╪═══════════╪═══════════╪═════════   │
│       │    Integration Layer   │            │
│  ═════╪═══════════╪═══════════╪═════════   │
│       │           │           │             │
│  ┌────┴───────────┴───────────┴────┐       │
│  │         Shared Kernel           │       │
│  └─────────────────────────────────┘       │
└─────────────────────────────────────────────┘
```

### Принципы

1. **Модуль = Bounded Context** — чёткие границы ответственности
2. **High Cohesion** — всё связанное внутри модуля
3. **Low Coupling** — минимум зависимостей между модулями
4. **Explicit Communication** — модули общаются через явные интерфейсы
5. **Shared Kernel** — общий код минимален и стабилен

---

## Структура Модуля

### Каждый Модуль Содержит

```
/modules/[module-name]/
├── api/                    # Публичный API модуля
│   ├── [Module]Service.ts  # Интерфейс для внешних вызовов
│   ├── events/             # Публикуемые события
│   └── dtos/               # Внешние DTO
├── internal/               # Внутренняя реализация (приватно!)
│   ├── domain/             # Entities, Value Objects
│   ├── application/        # Use Cases
│   ├── infrastructure/     # Repositories, Adapters
│   └── presentation/       # Controllers (если есть)
└── module.ts               # Entry point, DI configuration
```

### Правила Доступа

```
✅ module/api/*          — публично, доступно другим модулям
❌ module/internal/*     — приватно, только внутри модуля
✅ shared/*              — общий код, доступен всем
```

---

## Структура Проекта

```
/src
├── modules/
│   ├── user/
│   │   ├── api/
│   │   │   ├── UserService.ts       # Публичный интерфейс
│   │   │   ├── dtos/
│   │   │   │   └── UserDTO.ts
│   │   │   └── events/
│   │   │       └── UserCreated.ts
│   │   ├── internal/
│   │   │   ├── domain/
│   │   │   │   ├── User.ts
│   │   │   │   └── IUserRepository.ts
│   │   │   ├── application/
│   │   │   │   ├── CreateUser.ts
│   │   │   │   └── UserServiceImpl.ts
│   │   │   └── infrastructure/
│   │   │       └── PostgresUserRepository.ts
│   │   └── module.ts
│   │
│   ├── order/
│   │   ├── api/
│   │   │   ├── OrderService.ts
│   │   │   └── events/
│   │   │       └── OrderPlaced.ts
│   │   ├── internal/
│   │   │   └── ...
│   │   └── module.ts
│   │
│   └── catalog/
│       └── ...
│
├── shared/
│   ├── kernel/              # Shared Domain concepts
│   │   ├── Money.ts
│   │   └── Email.ts
│   ├── infrastructure/      # Shared Infrastructure
│   │   ├── database.ts
│   │   └── eventBus.ts
│   └── types/
│       └── Result.ts
│
├── integration/             # Module communication
│   ├── eventBus/
│   │   └── InMemoryEventBus.ts
│   └── moduleRegistry.ts
│
├── http/                    # Single HTTP entry point
│   ├── routes.ts
│   └── middleware/
│
└── main.ts                  # Composition Root
```

---

## Коммуникация Между Модулями

### Способы Взаимодействия

| Способ | Синхронный | Связанность | Когда использовать |
|--------|------------|-------------|-------------------|
| Direct Call | ✅ | Высокая | Query, быстрый response нужен |
| Events | ❌ | Низкая | Commands, eventual consistency OK |
| Shared DB | — | Medium | Anti-pattern, избегать |

### Direct Call (через API модуля)

```typescript
// modules/order/internal/application/PlaceOrder.ts

import { UserService } from '@/modules/user/api/UserService';

class PlaceOrder {
  constructor(
    private userService: UserService,  // Публичный интерфейс!
    private orderRepo: IOrderRepository
  ) {}

  async execute(dto: PlaceOrderDTO): Promise<Result<Order>> {
    // Вызов другого модуля через его публичный API
    const user = await this.userService.getById(dto.userId);
    
    if (!user) {
      return Result.fail('User not found');
    }

    const order = Order.create(user, dto.items);
    await this.orderRepo.save(order);
    
    return Result.ok(order);
  }
}
```

### Event-Based (рекомендуется для Commands)

```typescript
// modules/order/internal/application/PlaceOrder.ts

import { EventBus } from '@/shared/infrastructure/eventBus';
import { OrderPlaced } from '../api/events/OrderPlaced';

class PlaceOrder {
  constructor(
    private orderRepo: IOrderRepository,
    private eventBus: EventBus
  ) {}

  async execute(dto: PlaceOrderDTO): Promise<Result<Order>> {
    const order = Order.create(dto);
    await this.orderRepo.save(order);

    // Публикуем событие — другие модули реагируют
    await this.eventBus.publish(new OrderPlaced({
      orderId: order.id,
      userId: dto.userId,
      total: order.total,
    }));

    return Result.ok(order);
  }
}

// modules/notification/internal/handlers/OrderPlacedHandler.ts
class OrderPlacedHandler {
  constructor(private emailService: EmailService) {}

  async handle(event: OrderPlaced): Promise<void> {
    await this.emailService.sendOrderConfirmation(event.userId, event.orderId);
  }
}
```

---

## Shared Kernel

### Что Включать

✅ **Включать:**

- Базовые Value Objects (Money, Email, Address)
- Общие типы (Result, Option)
- Базовые классы (Entity, AggregateRoot)
- Инфраструктурные утилиты (Logger, Config)

❌ **НЕ включать:**

- Бизнес-сущности (они принадлежат модулям)
- Сложную логику (разносить по модулям)
- Часто меняющийся код

### Правило

```
Shared Kernel должен быть СТАБИЛЬНЫМ.
Изменения в нём затрагивают ВСЕ модули.
Минимизируй его размер.
```

---

## Module Entry Point

### Структура module.ts

```typescript
// modules/user/module.ts

import { IUserRepository } from './internal/domain/IUserRepository';
import { PostgresUserRepository } from './internal/infrastructure/PostgresUserRepository';
import { UserServiceImpl } from './internal/application/UserServiceImpl';
import { UserService } from './api/UserService';

export interface UserModuleDeps {
  database: Database;
  eventBus: EventBus;
}

export function createUserModule(deps: UserModuleDeps): {
  service: UserService;
} {
  const repository: IUserRepository = new PostgresUserRepository(deps.database);
  const service: UserService = new UserServiceImpl(repository, deps.eventBus);

  return { service };
}

// Регистрация event handlers
export function registerUserEventHandlers(bus: EventBus): void {
  bus.subscribe('OrderPlaced', new UserOrderHandler());
}
```

### Composition Root

```typescript
// main.ts

import { createUserModule, registerUserEventHandlers } from './modules/user/module';
import { createOrderModule, registerOrderEventHandlers } from './modules/order/module';
import { InMemoryEventBus } from './integration/eventBus/InMemoryEventBus';
import { database } from './shared/infrastructure/database';

// Shared infrastructure
const eventBus = new InMemoryEventBus();

// Create modules
const userModule = createUserModule({ database, eventBus });
const orderModule = createOrderModule({ 
  database, 
  eventBus,
  userService: userModule.service,  // Inject dependency
});

// Register event handlers
registerUserEventHandlers(eventBus);
registerOrderEventHandlers(eventBus);

// HTTP layer
const app = createHttpApp({
  userController: new UserController(userModule.service),
  orderController: new OrderController(orderModule.service),
});

app.listen(3000);
```

---

## Database Strategy

### Варианты

| Стратегия | Описание | Trade-offs |
|-----------|----------|------------|
| Single Schema | Все модули в одной схеме | Простота, но coupling |
| Schema per Module | Отдельная схема для каждого | Изоляция, сложнее joins |
| Separate Tables | Каждый модуль владеет таблицами | Баланс |

### Рекомендация

```
Начни с Separate Tables в одной схеме.
Используй naming convention: [module]_[table]

  users_accounts
  users_profiles
  orders_orders
  orders_items
  catalog_products
```

### Правило

```
Модуль владеет своими таблицами ЭКСКЛЮЗИВНО.
Другие модули НЕ читают напрямую — только через API.
```

---

## Anti-Patterns

### ❌ Circular Dependencies

```typescript
// WRONG
// user/module.ts imports from order/module.ts
// order/module.ts imports from user/module.ts

// RIGHT: Используй Events для разрыва цикла
// Order публикует OrderPlaced
// User подписывается и обновляет статистику
```

### ❌ Прямой Доступ к Internal

```typescript
// WRONG
import { User } from '@/modules/user/internal/domain/User';

// RIGHT
import { UserDTO } from '@/modules/user/api/dtos/UserDTO';
```

### ❌ Shared Database Queries

```typescript
// WRONG: Order модуль читает таблицу users напрямую
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// RIGHT: Order вызывает UserService
const user = await this.userService.getById(userId);
```

### ❌ Раздутый Shared Kernel

```typescript
// WRONG: Бизнес-сущность в shared
// shared/kernel/Order.ts — НЕЛЬЗЯ!

// RIGHT: Order принадлежит модулю order
// modules/order/internal/domain/Order.ts
```

---

## Migration Path

### От Монолита к Modular Monolith

```
1. Identify Bounded Contexts
         ↓
2. Create module folders
         ↓
3. Move code, respect api/internal boundary
         ↓
4. Replace direct imports with module APIs
         ↓
5. Add event-based communication
         ↓
6. Enforce boundaries (linter rules)
```

### От Modular Monolith к Microservices

```
1. Модуль уже изолирован? → Готов к extraction
         ↓
2. Events уже используются? → Замени на message broker
         ↓
3. Отдельная БД схема? → Extract database
         ↓
4. Deploy отдельно
```

---

## Чеклист Внедрения

### Структура

- [ ] Модули отражают бизнес-домены
- [ ] api/ — только публичные контракты
- [ ] internal/ — вся реализация

### Коммуникация

- [ ] Модули общаются через api/ интерфейсы
- [ ] Events для асинхронных операций
- [ ] Нет direct imports из internal/

### Database

- [ ] Каждый модуль владеет своими таблицами
- [ ] Нет cross-module SQL queries

### Shared Kernel

- [ ] Минимальный размер
- [ ] Только стабильный код
- [ ] Нет бизнес-сущностей

### Boundaries

- [ ] Linter rules для import restrictions
- [ ] Нет circular dependencies

---

## Quick Reference

```
/modules/[name]/
├── api/        → Public interface (exported)
├── internal/   → Private implementation
└── module.ts   → Entry point + DI

Communication:
  Query  → Direct Call via api/Service
  Command → Events (eventual consistency)

Shared Kernel:
  Minimal, Stable, No Business Entities

Database:
  Module owns its tables exclusively
```

---

**Связанные файлы:**

- `patterns/clean-architecture.md` — внутренняя структура модулей
- `templates/architecture.md` — шаблон документации
- `workflow-new-project/SKILL.md` — применение при создании проекта
- `workflows/architecture-change.md` — миграция архитектуры

---

**END OF PATTERN**
