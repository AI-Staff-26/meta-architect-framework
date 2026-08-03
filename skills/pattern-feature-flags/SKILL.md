---
name: pattern-feature-flags
description: |
  Feature toggle pattern for runtime configuration. Gradual rollout, A/B testing, 
  kill switches, per-tenant features. 🟢 Low complexity. Trunk-based development 
  enabler. NOT for static configurations.
---

# 🚩 Feature Flags — Флаги Функций

<purpose>
Паттерн управления функциональностью через конфигурацию.
Включение/выключение фич без деплоя кода.
</purpose>

---

## Когда Использовать

**Подходит для:**

- Постепенный rollout новых фич
- A/B тестирование
- Per-tenant конфигурация в SaaS
- Kill switches для проблемных фич
- Trunk-based development

**НЕ подходит для:**

- Простые приложения без релизов
- Проекты с редкими деплоями
- Статические конфигурации

**Сложность внедрения:** 🟢 Low

---

## Концепция

```
┌─────────────────────────────────────────┐
│           Feature Flag System           │
│                                         │
│  ┌─────────────┐    ┌───────────────┐  │
│  │ Flag Store  │───▶│ Evaluation    │  │
│  │ (Config)    │    │ Engine        │  │
│  └─────────────┘    └───────┬───────┘  │
│                             │          │
│         ┌───────────────────┼─────┐    │
│         ▼                   ▼     ▼    │
│    ┌────────┐         ┌────────┐       │
│    │ User A │         │ User B │       │
│    │ ✅ ON  │         │ ❌ OFF │       │
│    └────────┘         └────────┘       │
└─────────────────────────────────────────┘
```

### Типы Флагов

| Тип | Описание | Пример |
|-----|----------|--------|
| Release | Скрытие незаконченных фич | new_checkout_flow |
| Experiment | A/B тесты | signup_variant_b |
| Ops | Kill switches | enable_external_api |
| Permission | Per-user/tenant | premium_feature |

---

## Domain Model

```typescript
// domain/entities/FeatureFlag.ts
class FeatureFlag extends Entity {
  constructor(
    public readonly key: string,
    private _name: string,
    private _description: string,
    private _type: FlagType,
    private _enabled: boolean,
    private _rules: TargetingRule[],
    private _defaultValue: boolean | string | number
  ) {
    super();
  }

  evaluate(context: EvaluationContext): FlagValue {
    if (!this._enabled) {
      return this._defaultValue;
    }

    for (const rule of this._rules) {
      if (rule.matches(context)) {
        return rule.value;
      }
    }

    return this._defaultValue;
  }
}

enum FlagType {
  BOOLEAN = 'boolean',
  STRING = 'string',
  NUMBER = 'number',
  JSON = 'json'
}

// Targeting Rules
class TargetingRule {
  constructor(
    public readonly conditions: Condition[],
    public readonly value: FlagValue,
    public readonly percentage?: number
  ) {}

  matches(context: EvaluationContext): boolean {
    // ALL conditions must match
    return this.conditions.every(c => c.evaluate(context));
  }
}

interface Condition {
  attribute: string;  // userId, tenantId, email, country...
  operator: Operator; // equals, contains, in, gt, lt...
  value: unknown;
}
```

---

## Feature Flag Service

```typescript
// application/services/FeatureFlagService.ts
class FeatureFlagService {
  constructor(
    private flagRepo: IFeatureFlagRepository,
    private cache: ICache
  ) {}

  async isEnabled(
    key: string, 
    context: EvaluationContext
  ): Promise<boolean> {
    const flag = await this.getFlag(key);
    if (!flag) return false;
    
    return flag.evaluate(context) === true;
  }

  async getValue<T>(
    key: string, 
    context: EvaluationContext,
    defaultValue: T
  ): Promise<T> {
    const flag = await this.getFlag(key);
    if (!flag) return defaultValue;
    
    return flag.evaluate(context) as T ?? defaultValue;
  }

  private async getFlag(key: string): Promise<FeatureFlag | null> {
    const cacheKey = `flag:${key}`;
    
    let flag = await this.cache.get<FeatureFlag>(cacheKey);
    if (flag) return flag;

    flag = await this.flagRepo.findByKey(key);
    if (flag) {
      await this.cache.set(cacheKey, flag, { ttl: 60 });
    }
    
    return flag;
  }
}

// Evaluation Context
interface EvaluationContext {
  userId?: string;
  tenantId?: string;
  email?: string;
  country?: string;
  userAgent?: string;
  percentage?: number; // 0-100, для gradual rollout
  attributes?: Record<string, unknown>;
}
```

---

## Targeting Strategies

### Percentage Rollout

```typescript
// 10% пользователей видят новую фичу
const rule: TargetingRule = {
  conditions: [],
  value: true,
  percentage: 10
};

// Consistent hashing для стабильности
function getPercentageBucket(userId: string, flagKey: string): number {
  const hash = crypto.createHash('md5')
    .update(`${flagKey}:${userId}`)
    .digest('hex');
  return parseInt(hash.substring(0, 8), 16) % 100;
}

evaluate(context: EvaluationContext): boolean {
  if (this.percentage === undefined) return true;
  const bucket = getPercentageBucket(context.userId, this.flagKey);
  return bucket < this.percentage;
}
```

### User/Tenant Targeting

```typescript
// Только для определённых тенантов
{
  key: 'new_billing_system',
  rules: [
    {
      conditions: [
        { attribute: 'tenantId', operator: 'in', value: ['acme', 'globex'] }
      ],
      value: true
    }
  ],
  defaultValue: false
}

// Beta users
{
  key: 'experimental_ui',
  rules: [
    {
      conditions: [
        { attribute: 'email', operator: 'endsWith', value: '@company.com' }
      ],
      value: true
    }
  ],
  defaultValue: false
}
```

---

## Usage Patterns

### В Use Cases

```typescript
// application/use-cases/ProcessPayment.ts
class ProcessPayment {
  constructor(
    private featureFlags: FeatureFlagService,
    private oldProcessor: OldPaymentProcessor,
    private newProcessor: NewPaymentProcessor
  ) {}

  async execute(dto: PaymentDTO): Promise<Result<Payment>> {
    const context = { tenantId: dto.tenantId, userId: dto.userId };
    
    const useNewProcessor = await this.featureFlags.isEnabled(
      'new_payment_processor', 
      context
    );

    const processor = useNewProcessor 
      ? this.newProcessor 
      : this.oldProcessor;

    return processor.process(dto);
  }
}
```

### В Controllers

```typescript
// presentation/controllers/CheckoutController.ts
class CheckoutController {
  @Get('/checkout')
  async getCheckout(req: Request, res: Response) {
    const context = this.buildContext(req);
    
    const variant = await this.featureFlags.getValue<string>(
      'checkout_variant',
      context,
      'control'
    );

    return res.render(`checkout-${variant}`);
  }
}
```

### Middleware для Context

```typescript
// presentation/middleware/FeatureFlagMiddleware.ts
class FeatureFlagMiddleware {
  async handle(req: Request, res: Response, next: NextFunction) {
    req.flagContext = {
      userId: req.user?.id,
      tenantId: req.tenant?.id,
      email: req.user?.email,
      country: req.headers['cf-ipcountry'],
      userAgent: req.headers['user-agent'],
      percentage: this.calculateBucket(req.user?.id)
    };
    next();
  }
}
```

---

## Multi-Tenant Feature Flags

```typescript
// Per-tenant feature overrides
interface TenantFeatureOverride {
  tenantId: string;
  flagKey: string;
  enabled: boolean;
  value?: FlagValue;
}

class TenantAwareFeatureFlagService extends FeatureFlagService {
  async isEnabled(key: string, context: EvaluationContext): Promise<boolean> {
    // 1. Check tenant override
    if (context.tenantId) {
      const override = await this.getOverride(context.tenantId, key);
      if (override !== null) return override;
    }

    // 2. Fall back to global flag
    return super.isEnabled(key, context);
  }
}

// Tenant subscription limits
const flags = {
  'advanced_analytics': {
    rules: [
      { conditions: [{ attribute: 'plan', operator: 'in', value: ['pro', 'enterprise'] }], value: true }
    ],
    defaultValue: false
  }
};
```

---

## Frontend Integration

```typescript
// API endpoint
// GET /api/flags?context=...
app.get('/api/flags', async (req, res) => {
  const context = buildContext(req);
  const flags = await featureFlagService.getAllForContext(context);
  res.json(flags);
});

// React Hook
function useFeatureFlag(key: string, defaultValue = false) {
  const { flags } = useFeatureFlags();
  return flags[key] ?? defaultValue;
}

// Component
function NewDashboard() {
  const showNewDashboard = useFeatureFlag('new_dashboard');
  
  if (!showNewDashboard) {
    return <OldDashboard />;
  }
  
  return <NewDashboardV2 />;
}
```

---

## Admin UI

### Flag Management

```typescript
// Admin endpoints
POST   /admin/flags           # Create flag
PUT    /admin/flags/:key      # Update flag
DELETE /admin/flags/:key      # Delete flag
POST   /admin/flags/:key/toggle  # Quick toggle

// Audit log
interface FlagAuditLog {
  flagKey: string;
  action: 'created' | 'updated' | 'toggled' | 'deleted';
  previousValue: unknown;
  newValue: unknown;
  userId: string;
  timestamp: Date;
}
```

---

## Структура Проекта

```
/src
├── modules/
│   └── feature-flags/
│       ├── api/
│       │   ├── FeatureFlagService.ts
│       │   └── dtos/
│       └── internal/
│           ├── domain/
│           │   ├── FeatureFlag.ts
│           │   └── TargetingRule.ts
│           ├── application/
│           │   └── EvaluateFlag.ts
│           └── infrastructure/
│               └── FeatureFlagRepository.ts
│
├── shared/
│   └── feature-flags/
│       ├── context.ts
│       └── decorators.ts
│
└── presentation/
    └── middleware/
        └── FeatureFlagMiddleware.ts
```

---

## Anti-Patterns

### ❌ Флаги без Cleanup

```typescript
// WRONG: Флаг существует годами
if (featureFlags.isEnabled('new_checkout_2019')) { ... }

// RIGHT: Удаляй флаги после полного rollout
// + документируй lifecycle каждого флага
```

### ❌ Бизнес-логика в Флагах

```typescript
// WRONG: Сложная логика
if (flag && user.plan === 'pro' && !user.isBlocked) { ... }

// RIGHT: Логика в TargetingRules
const enabled = await flags.isEnabled('feature', context);
if (enabled) { ... }
```

### ❌ Флаги без Мониторинга

```typescript
// WRONG: Не знаем сколько людей видят фичу
if (flags.isEnabled('experiment')) { ... }

// RIGHT: Track usage
const enabled = await flags.isEnabled('experiment', context);
analytics.track('flag_evaluated', { flag: 'experiment', enabled });
```

---

## Чеклист

- [ ] FeatureFlag entity с rules
- [ ] FeatureFlagService с caching
- [ ] EvaluationContext middleware
- [ ] Percentage rollout support
- [ ] Multi-tenant overrides
- [ ] Admin UI для управления
- [ ] Audit logging
- [ ] Flag cleanup процесс

---

## Quick Reference

```
Flag Types:
  Release    → hide incomplete features
  Experiment → A/B testing
  Ops        → kill switches
  Permission → per-tenant features

Targeting:
  User ID, Tenant ID, Email, Country, Percentage

Usage:
  flags.isEnabled('key', context) → boolean
  flags.getValue('key', context, default) → T

Lifecycle:
  Create → Gradual Rollout → Full Release → Cleanup
```

---

**Связанные файлы:**

- `pattern-multi-tenant/SKILL.md` — per-tenant flags
- `pattern-rbac/SKILL.md` — feature permissions

---

**END OF PATTERN**
