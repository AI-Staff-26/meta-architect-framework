---
name: pattern-rbac
description: |
  Role-Based Access Control pattern. Permissions hierarchy, authorization service, 
  scope-based access (ALL/OWN/TEAM). For B2B SaaS, admin panels, multi-tenant 
  systems. 🟡 Medium complexity. NOT for simple auth-only apps.
---

# 🔐 RBAC — Role-Based Access Control

<purpose>
Паттерн управления доступом на основе ролей.
Гибкая система permissions с иерархией и наследованием.
</purpose>

---

## Когда Использовать

**Подходит для:**

- Приложения с разными уровнями доступа
- B2B SaaS с организационной структурой
- Admin панели и CMS
- Multi-tenant системы

**НЕ подходит для:**

- Простые приложения без разделения ролей
- Публичные API без аутентификации

**Сложность внедрения:** 🟡 Medium

---

## Концепция

```
Пользователь → Роль → Permissions → Доступ к ресурсам

┌──────────┐     ┌──────────┐     ┌──────────────┐
│   User   │────▶│   Role   │────▶│  Permission  │
│  (John)  │     │  (Admin) │     │ (user:create)│
└──────────┘     └────┬─────┘     └──────────────┘
                      │
                      ▼
              ┌──────────────┐
              │  Resources   │
              └──────────────┘
```

### Компоненты

| Компонент | Описание | Пример |
|-----------|----------|--------|
| User | Субъект доступа | John Doe |
| Role | Набор permissions | Admin, Editor |
| Permission | Право на действие | user:create |
| Resource | Объект доступа | User, Order |

---

## Domain Model

```typescript
// domain/entities/Role.ts
class Role extends Entity {
  constructor(
    public readonly id: string,
    private _name: string,
    private _permissions: Permission[],
    private _parent: Role | null = null
  ) {
    super();
  }

  get permissions(): Permission[] {
    const inherited = this._parent?.permissions ?? [];
    return [...new Set([...this._permissions, ...inherited])];
  }

  hasPermission(permission: Permission): boolean {
    return this.permissions.some(p => p.matches(permission));
  }
}

// domain/entities/Permission.ts
class Permission extends ValueObject {
  constructor(
    public readonly resource: string,
    public readonly action: Action,
    public readonly scope: PermissionScope = PermissionScope.ALL
  ) {
    super();
  }

  get key(): string {
    return `${this.resource}:${this.action}`;
  }

  matches(other: Permission): boolean {
    if (this.resource === '*') return true;
    if (this.action === Action.ALL) {
      return this.resource === other.resource;
    }
    return this.resource === other.resource 
        && this.action === other.action;
  }
}

enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  ALL = '*'
}

enum PermissionScope {
  ALL = 'all',
  OWN = 'own',
  TEAM = 'team'
}
```

---

## Permission Naming

```
Format: {resource}:{action}[:{scope}]

Examples:
  user:read           # Чтение пользователей
  user:create         # Создание пользователей
  order:*             # Все действия над заказами
  *:read              # Чтение любых ресурсов
  report:export:own   # Экспорт только своих отчётов
```

---

## Authorization Service

```typescript
// application/services/AuthorizationService.ts
class AuthorizationService {
  constructor(
    private userRepo: IUserRepository,
    private cache: ICache
  ) {}

  async can(
    userId: string, 
    permission: string,
    resource?: { ownerId?: string }
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    const required = Permission.fromString(permission);

    const matching = userPermissions.find(p => p.matches(required));
    if (!matching) return false;

    if (matching.scope === PermissionScope.ALL) return true;
    if (!resource) return true;

    return this.checkScope(userId, matching.scope, resource);
  }

  async authorize(userId: string, permission: string): Promise<void> {
    if (!await this.can(userId, permission)) {
      throw new UnauthorizedError(`Lacks permission: ${permission}`);
    }
  }

  private async getUserPermissions(userId: string): Promise<Permission[]> {
    const cacheKey = `user:${userId}:permissions`;
    
    let permissions = await this.cache.get<Permission[]>(cacheKey);
    if (permissions) return permissions;

    const user = await this.userRepo.findWithRoles(userId);
    permissions = user?.roles.flatMap(r => r.role.permissions) ?? [];

    await this.cache.set(cacheKey, permissions, { ttl: 300 });
    return permissions;
  }
}
```

---

## Middleware

```typescript
// presentation/middleware/AuthorizationMiddleware.ts
class AuthorizationMiddleware {
  constructor(private authService: AuthorizationService) {}

  requirePermission(permission: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await this.authService.authorize(req.user.id, permission);
        next();
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        next(error);
      }
    };
  }
}

// Routes
router.post('/users', 
  authMiddleware.requirePermission('user:create'),
  userController.create
);
```

---

## Role Hierarchy

```
SUPER_ADMIN
     │
   ADMIN
   ╱    ╲
EDITOR   MANAGER
   ╲    ╱
   VIEWER
```

### System Roles

```typescript
const SYSTEM_ROLES = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    permissions: ['*:*'],
    isSystem: true
  },
  {
    id: 'admin',
    name: 'Admin',
    parent: 'super_admin',
    permissions: ['user:*', 'role:read', 'settings:*'],
    isSystem: true
  },
  {
    id: 'viewer',
    name: 'Viewer',
    permissions: ['content:read', 'media:read'],
    isSystem: true
  }
];
```

---

## Frontend Integration

```typescript
// components/CanAccess.tsx
function CanAccess({ permission, children, fallback = null }: Props) {
  const { can } = usePermission();
  
  if (!can(permission)) return fallback;
  return <>{children}</>;
}

// Usage
function UserListPage() {
  return (
    <div>
      <h1>Users</h1>
      <CanAccess permission="user:create">
        <Button onClick={createUser}>Create User</Button>
      </CanAccess>
    </div>
  );
}
```

---

## Anti-Patterns

### ❌ Hardcoded Role Checks

```typescript
// WRONG
if (user.role === 'admin') { ... }

// RIGHT
if (await authService.can(user.id, 'user:delete')) { ... }
```

### ❌ Frontend-Only Checks

```typescript
// WRONG: Security through obscurity
// Backend must always verify permissions!
```

---

## Чеклист

- [ ] Permission с wildcards
- [ ] Role с иерархией
- [ ] AuthorizationService с caching
- [ ] Middleware / decorators
- [ ] Cache invalidation
- [ ] Frontend CanAccess component

---

## Quick Reference

```
Permission: {resource}:{action}[:{scope}]

Scopes: ALL, OWN, TEAM

Check Flow:
  Request → Middleware → AuthService → Cache/DB → Allow/Deny
```

---

**Связанные файлы:**

- `pattern-multi-tenant/SKILL.md` — RBAC в multi-tenant среде
- `pattern-feature-flags/SKILL.md` — feature access control

---

**END OF PATTERN**
