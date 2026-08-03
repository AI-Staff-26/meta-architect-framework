---
name: pattern-multi-tenant
description: |
  Multi-tenancy pattern for SaaS. Tenant isolation strategies (DB/Schema/Row-level), 
  context resolution, per-tenant configuration. For B2B platforms, white-label 
  solutions. 🔴 High complexity. NOT for single-tenant apps.
---

# 🏢 Multi-Tenant — Мультиарендность

<purpose>
Паттерн для обслуживания нескольких клиентов (тенантов) в одном приложении.
Изоляция данных и конфигураций при общей кодовой базе.
</purpose>

---

## Когда Использовать

**Подходит для:**

- SaaS приложения
- B2B платформы с множеством клиентов
- White-label решения
- Проекты с требованием изоляции данных
- Централизованное управление несколькими организациями

**НЕ подходит для:**

- Однопользовательские приложения
- B2C с единой базой пользователей
- Приложения без требований к изоляции
- MVP с одним клиентом

**Сложность внедрения:** 🔴 High

---

## Концепция

### Ключевая Идея

```
Один код. Множество клиентов. Полная изоляция.

┌─────────────────────────────────────────────────┐
│              Multi-Tenant Application           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Tenant A │ │ Tenant B │ │ Tenant C │        │
│  │  (Acme)  │ │ (Globex) │ │ (Initech)│        │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘        │
│       │            │            │               │
│  ═════╪════════════╪════════════╪═══════════   │
│       │    Tenant Resolution Layer │            │
│  ═════╪════════════╪════════════╪═══════════   │
│       │            │            │               │
│  ┌────┴────────────┴────────────┴────┐         │
│  │         Shared Application         │         │
│  └────────────────────────────────────┘         │
└─────────────────────────────────────────────────┘
```

### Принципы

1. **Tenant Isolation** — данные одного тенанта недоступны другим
2. **Tenant Context** — текущий тенант определяется на каждый запрос
3. **Shared Codebase** — единая кодовая база для всех
4. **Configurable** — каждый тенант может иметь свои настройки
5. **Scalability** — возможность независимого масштабирования

---

## Стратегии Изоляции

### Сравнение Подходов

| Стратегия | Изоляция | Сложность | Стоимость | Масштабирование |
|-----------|----------|-----------|-----------|-----------------|
| Database per Tenant | 🟢 Полная | 🔴 High | 🔴 High | 🟢 Независимое |
| Schema per Tenant | 🟡 Высокая | 🟡 Medium | 🟡 Medium | 🟡 Среднее |
| Row-Level (Shared) | 🟠 Логическая | 🟢 Low | 🟢 Low | 🔴 Общее |
| Hybrid | 🟢 Гибкая | 🔴 High | 🟡 Variable | 🟢 Гибкое |

### Database per Tenant

```
┌───────────────────────────────────────┐
│           Application Layer           │
└───────────┬───────────┬───────────────┘
            │           │
    ┌───────▼───┐ ┌─────▼─────┐
    │  DB Acme  │ │ DB Globex │  ← Отдельные базы
    └───────────┘ └───────────┘
```

**Когда использовать:**

- Высокие требования к изоляции (compliance, регуляции)
- Клиенты с большими объёмами данных
- Разные SLA для разных клиентов

**Реализация:**

```typescript
// infrastructure/database/TenantDatabaseManager.ts

class TenantDatabaseManager {
  private connections: Map<string, Database> = new Map();

  async getConnection(tenantId: string): Promise<Database> {
    if (!this.connections.has(tenantId)) {
      const config = await this.loadTenantDbConfig(tenantId);
      const db = await createConnection(config);
      this.connections.set(tenantId, db);
    }
    return this.connections.get(tenantId)!;
  }

  private async loadTenantDbConfig(tenantId: string): Promise<DbConfig> {
    // Загрузка конфигурации из центральной БД или конфига
    return {
      host: `${tenantId}.db.example.com`,
      database: `tenant_${tenantId}`,
      // ...
    };
  }
}
```

### Schema per Tenant

```
┌───────────────────────────────────────┐
│           Shared Database             │
│  ┌──────────┐ ┌──────────┐            │
│  │schema_   │ │schema_   │            │
│  │ acme     │ │ globex   │  ← Схемы   │
│  └──────────┘ └──────────┘            │
└───────────────────────────────────────┘
```

**Когда использовать:**

- Средние требования к изоляции
- PostgreSQL / SQL Server
- Нужны cross-tenant queries (admin)

**Реализация:**

```typescript
// infrastructure/database/SchemaResolver.ts

class SchemaResolver {
  getSchema(tenantId: string): string {
    return `tenant_${tenantId}`;
  }

  wrapQuery(query: string, tenantId: string): string {
    const schema = this.getSchema(tenantId);
    return `SET search_path TO ${schema}; ${query}`;
  }
}
```

### Row-Level (Shared Schema)

```
┌───────────────────────────────────────┐
│           Shared Database             │
│  ┌──────────────────────────────────┐ │
│  │ users                            │ │
│  │ id | tenant_id | email | ...     │ │
│  │ 1  | acme      | a@a.com         │ │
│  │ 2  | globex    | b@b.com         │ │
│  └──────────────────────────────────┘ │
└───────────────────────────────────────┘
```

**Когда использовать:**

- Много мелких тенантов
- Простота важнее изоляции
- Ограниченный бюджет

**Реализация:**

```typescript
// domain/repositories/TenantAwareRepository.ts

abstract class TenantAwareRepository<T> {
  constructor(
    protected db: Database,
    protected tenantContext: TenantContext
  ) {}

  protected addTenantFilter(query: QueryBuilder): QueryBuilder {
    return query.where('tenant_id', this.tenantContext.getId());
  }

  async findById(id: string): Promise<T | null> {
    return this.db
      .select('*')
      .from(this.tableName)
      .where('id', id)
      .where('tenant_id', this.tenantContext.getId())
      .first();
  }
}
```

---

## Tenant Resolution

### Способы Определения Тенанта

| Способ | Пример | Плюсы | Минусы |
|--------|--------|-------|--------|
| Subdomain | acme.app.com | Интуитивно | DNS настройка |
| Path | app.com/acme | Просто | Конфликты роутинга |
| Header | X-Tenant-ID: acme | Гибко | Security concerns |
| JWT Claim | { tenant: "acme" } | Безопасно | Только auth users |

### Middleware Реализация

```typescript
// presentation/middleware/TenantMiddleware.ts

class TenantMiddleware {
  constructor(
    private tenantResolver: TenantResolver,
    private tenantContext: TenantContext
  ) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    const tenantId = await this.tenantResolver.resolve(req);
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant not identified' });
    }

    const tenant = await this.tenantService.getById(tenantId);
    
    if (!tenant || !tenant.isActive) {
      return res.status(403).json({ error: 'Tenant not found or inactive' });
    }

    // Устанавливаем контекст
    this.tenantContext.set(tenant);
    
    next();
  }
}

// Resolvers
class SubdomainTenantResolver implements TenantResolver {
  resolve(req: Request): string | null {
    const host = req.hostname;
    const subdomain = host.split('.')[0];
    return subdomain !== 'www' ? subdomain : null;
  }
}

class HeaderTenantResolver implements TenantResolver {
  resolve(req: Request): string | null {
    return req.headers['x-tenant-id'] as string | null;
  }
}

class JwtTenantResolver implements TenantResolver {
  resolve(req: Request): string | null {
    const user = req.user; // После auth middleware
    return user?.tenantId ?? null;
  }
}
```

### Tenant Context

```typescript
// shared/infrastructure/TenantContext.ts

// Вариант 1: AsyncLocalStorage (Node.js)
import { AsyncLocalStorage } from 'async_hooks';

class TenantContext {
  private storage = new AsyncLocalStorage<Tenant>();

  set(tenant: Tenant): void {
    this.storage.enterWith(tenant);
  }

  get(): Tenant {
    const tenant = this.storage.getStore();
    if (!tenant) {
      throw new TenantNotSetError();
    }
    return tenant;
  }

  getId(): string {
    return this.get().id;
  }
}

// Вариант 2: Request-scoped (NestJS)
@Injectable({ scope: Scope.REQUEST })
class TenantContext {
  private tenant: Tenant | null = null;

  set(tenant: Tenant): void {
    this.tenant = tenant;
  }

  get(): Tenant {
    if (!this.tenant) {
      throw new TenantNotSetError();
    }
    return this.tenant;
  }
}
```

---

## Структура Проекта

```
/src
├── modules/
│   ├── tenant/                   # Управление тенантами
│   │   ├── api/
│   │   │   ├── TenantService.ts
│   │   │   └── dtos/
│   │   └── internal/
│   │       ├── domain/
│   │       │   ├── Tenant.ts
│   │       │   └── TenantSettings.ts
│   │       └── infrastructure/
│   │           └── TenantRepository.ts
│   │
│   ├── user/                     # Tenant-aware модули
│   │   └── ...
│   └── billing/
│       └── ...
│
├── shared/
│   ├── multi-tenancy/
│   │   ├── TenantContext.ts
│   │   ├── TenantResolver.ts
│   │   └── TenantAwareRepository.ts
│   └── ...
│
├── infrastructure/
│   ├── database/
│   │   ├── TenantDatabaseManager.ts
│   │   └── ConnectionPool.ts
│   └── ...
│
└── presentation/
    └── middleware/
        └── TenantMiddleware.ts
```

---

## Tenant Configuration

### Модель Тенанта

```typescript
// modules/tenant/internal/domain/Tenant.ts

class Tenant extends AggregateRoot {
  constructor(
    public readonly id: string,
    private _name: string,
    private _subdomain: string,
    private _settings: TenantSettings,
    private _subscription: Subscription,
    private _status: TenantStatus
  ) {
    super();
  }

  get isActive(): boolean {
    return this._status === TenantStatus.ACTIVE 
        && this._subscription.isValid();
  }

  getFeatureFlag(flag: string): boolean {
    return this._settings.features[flag] ?? false;
  }

  getConfig<T>(key: string): T | undefined {
    return this._settings.config[key] as T;
  }
}

// Value Objects
class TenantSettings {
  constructor(
    public readonly features: Record<string, boolean>,
    public readonly config: Record<string, unknown>,
    public readonly limits: TenantLimits,
    public readonly branding: TenantBranding
  ) {}
}

class TenantLimits {
  constructor(
    public readonly maxUsers: number,
    public readonly maxStorage: number, // bytes
    public readonly apiRateLimit: number // requests per minute
  ) {}
}
```

### Применение Настроек

```typescript
// application/use-cases/CreateUser.ts

class CreateUser {
  constructor(
    private userRepo: IUserRepository,
    private tenantContext: TenantContext
  ) {}

  async execute(dto: CreateUserDTO): Promise<Result<User>> {
    const tenant = this.tenantContext.get();
    
    // Проверка лимитов тенанта
    const currentUserCount = await this.userRepo.countByTenant(tenant.id);
    if (currentUserCount >= tenant.settings.limits.maxUsers) {
      return Result.fail('User limit reached for this tenant');
    }

    // Применение feature flags
    if (tenant.getFeatureFlag('require_email_verification')) {
      // Логика верификации
    }

    const user = User.create(dto, tenant.id);
    await this.userRepo.save(user);
    
    return Result.ok(user);
  }
}
```

---

## Cross-Tenant Operations

### Admin / Super-Admin панель

```typescript
// modules/admin/internal/application/CrossTenantQuery.ts

class CrossTenantAnalytics {
  constructor(
    private tenantService: TenantService,
    private statsRepo: IStatsRepository
  ) {}

  async getGlobalStats(): Promise<GlobalStats> {
    // Только для super-admin!
    const tenants = await this.tenantService.getAllActive();
    
    const stats = await Promise.all(
      tenants.map(async (t) => ({
        tenantId: t.id,
        stats: await this.statsRepo.getForTenant(t.id)
      }))
    );

    return this.aggregateStats(stats);
  }
}

// Middleware для super-admin
class SuperAdminMiddleware {
  async handle(req: Request, res: Response, next: NextFunction) {
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    // Не устанавливаем tenant context для cross-tenant операций
    next();
  }
}
```

### Tenant Provisioning

```typescript
// modules/tenant/internal/application/ProvisionTenant.ts

class ProvisionTenant {
  constructor(
    private tenantRepo: ITenantRepository,
    private dbManager: TenantDatabaseManager,
    private eventBus: EventBus
  ) {}

  async execute(dto: CreateTenantDTO): Promise<Result<Tenant>> {
    // 1. Создание записи тенанта
    const tenant = Tenant.create(dto);
    await this.tenantRepo.save(tenant);

    // 2. Провизионирование инфраструктуры
    await this.dbManager.provisionDatabase(tenant.id);
    
    // 3. Миграции
    await this.dbManager.runMigrations(tenant.id);

    // 4. Seed данные
    await this.seedInitialData(tenant);

    // 5. Событие
    await this.eventBus.publish(new TenantProvisioned(tenant));

    return Result.ok(tenant);
  }

  private async seedInitialData(tenant: Tenant): Promise<void> {
    // Создание admin пользователя
    // Базовые настройки
    // Default roles и permissions
  }
}
```

---

## Security Considerations

### Data Isolation Checklist

```
✅ Все queries фильтруются по tenant_id
✅ API endpoints проверяют tenant context
✅ File storage изолирован по тенантам
✅ Кэш ключи включают tenant prefix
✅ Background jobs имеют tenant context
✅ Logs содержат tenant_id для аудита
```

### Защита от Cross-Tenant Access

```typescript
// shared/multi-tenancy/TenantGuard.ts

class TenantGuard {
  constructor(private tenantContext: TenantContext) {}

  ensureOwnership(resource: { tenantId: string }): void {
    const currentTenant = this.tenantContext.getId();
    if (resource.tenantId !== currentTenant) {
      throw new UnauthorizedTenantAccessError(
        `Resource belongs to tenant ${resource.tenantId}, ` +
        `but current tenant is ${currentTenant}`
      );
    }
  }
}

// Использование в Repository
class UserRepository extends TenantAwareRepository<User> {
  async findById(id: string): Promise<User | null> {
    const user = await super.findById(id);
    if (user) {
      this.tenantGuard.ensureOwnership(user);
    }
    return user;
  }
}
```

---

## Anti-Patterns

### ❌ Отсутствие Tenant Context в Background Jobs

```typescript
// WRONG
class SendEmailJob {
  async execute(userId: string) {
    const user = await this.userRepo.findById(userId); // Какой тенант?
  }
}

// RIGHT
class SendEmailJob {
  async execute(payload: { tenantId: string; userId: string }) {
    await this.tenantContext.runWithTenant(payload.tenantId, async () => {
      const user = await this.userRepo.findById(payload.userId);
      // ...
    });
  }
}
```

### ❌ Shared Cache без Tenant Prefix

```typescript
// WRONG
await cache.set(`user:${userId}`, userData);

// RIGHT
await cache.set(`tenant:${tenantId}:user:${userId}`, userData);
```

### ❌ Cross-Tenant Data Leakage в Логах

```typescript
// WRONG
logger.error(`User ${user.email} failed login`);

// RIGHT
logger.error(`[Tenant: ${tenantId}] User login failed`, { 
  tenantId,
  userId: user.id // Не email!
});
```

---

## Чеклист Внедрения

### Выбор Стратегии

- [ ] Определены требования к изоляции
- [ ] Выбрана стратегия: DB / Schema / Row-level
- [ ] Учтены регуляторные требования

### Tenant Resolution

- [ ] Выбран способ определения тенанта
- [ ] Реализован TenantMiddleware
- [ ] TenantContext доступен везде

### Data Layer

- [ ] Все repositories tenant-aware
- [ ] Миграции применяются ко всем тенантам
- [ ] Backup / restore изолированы

### Security

- [ ] Аудит cross-tenant access
- [ ] Cache изолирован
- [ ] Background jobs имеют tenant context
- [ ] Logs содержат tenant_id

### Operations

- [ ] Tenant provisioning автоматизирован
- [ ] Мониторинг per-tenant
- [ ] Rate limiting per-tenant

---

## Quick Reference

```
Isolation Strategies:
  Database per Tenant → Полная изоляция, высокая стоимость
  Schema per Tenant   → Хорошая изоляция, средняя сложность
  Row-Level (Shared)  → Логическая изоляция, простота

Tenant Resolution:
  Subdomain  → acme.app.com
  Path       → app.com/acme
  Header     → X-Tenant-ID
  JWT Claim  → { tenant: "acme" }

Key Components:
  TenantMiddleware   → Определение тенанта на каждый запрос
  TenantContext      → Хранение текущего тенанта
  TenantAwareRepo    → Автоматическая фильтрация данных
```

---

**Связанные файлы:**

- `pattern-rbac/SKILL.md` — авторизация в multi-tenant среде
- `pattern-feature-flags/SKILL.md` — per-tenant feature flags
- `workflow-new-project/SKILL.md` — применение при создании проекта

---

**END OF PATTERN**
