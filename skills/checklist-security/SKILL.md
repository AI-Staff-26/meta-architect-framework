---
name: checklist-security
description: |
  Security verification checklist. Authentication, authorization, input validation, 
  API security, secrets management, data protection. Loaded by role-reviewer for 
  security-critical changes. 9 categories, severity classification.
---

# 🔒 Security Checklist — Чеклист Безопасности

<purpose>
Детальная проверка безопасности для критических изменений.
Используй при изменении auth/authz, работе с данными, интеграциях.
</purpose>

---

## Когда Использовать

**Обязательно:**

- Изменения в аутентификации/авторизации
- Работа с пользовательскими данными
- Новые API endpoints (особенно публичные)
- Интеграции с внешними сервисами
- Обработка платежей / финансов
- Работа с PII (Personal Identifiable Information)

**Рекомендуется:**

- Любые изменения в security-critical модулях
- Перед релизом (как часть release checklist)

---

## 🔐 Аутентификация

### Механизмы аутентификации

- [ ] Пароли хешируются (bcrypt/argon2, не MD5/SHA1)
- [ ] Нет хранения паролей в открытом виде
- [ ] Session tokens достаточно длинные и случайные
- [ ] JWT подписаны надёжным алгоритмом (RS256, не none)
- [ ] JWT имеют разумный TTL

### Session Management

- [ ] Session invalidation при logout
- [ ] Session timeout реализован
- [ ] Защита от session fixation
- [ ] Secure и HttpOnly флаги для cookies
- [ ] SameSite атрибут установлен

### Multi-Factor

- [ ] MFA доступен для критических операций (если требуется)
- [ ] MFA bypass невозможен
- [ ] Recovery codes защищены

---

## 🛡️ Авторизация

### Проверки доступа

- [ ] Авторизация проверяется на каждом уровне (API, service, data)
- [ ] Нет доступа к чужим ресурсам (IDOR protection)
- [ ] Принцип наименьших привилегий соблюдён
- [ ] Default deny — доступ запрещён по умолчанию

### RBAC / Permissions

- [ ] Роли и права определены корректно
- [ ] Нет privilege escalation
- [ ] Admin функции защищены
- [ ] Tenant isolation (для multi-tenant)

### API Authorization

- [ ] Все endpoints требуют аутентификацию (кроме явно публичных)
- [ ] Rate limiting реализован
- [ ] Нет массового доступа к данным (batch enumeration)

---

## ✅ Валидация Входных Данных

### Input Validation

- [ ] Все входные данные валидируются на сервере
- [ ] Whitelist подход (разрешено явно, остальное запрещено)
- [ ] Валидация типов и форматов
- [ ] Лимиты на размер входных данных
- [ ] Валидация file uploads (тип, размер, содержимое)

### Sanitization

- [ ] HTML entities экранируются
- [ ] Специальные символы обрабатываются
- [ ] Нет доверия к Content-Type от клиента

### Injection Prevention

- [ ] Prepared statements / parameterized queries (SQL)
- [ ] ORM используется правильно (нет raw SQL с user input)
- [ ] Command arguments экранируются
- [ ] LDAP injection предотвращён
- [ ] XML/XXE атаки предотвращены

---

## 🌐 API Security

### Transport

- [ ] HTTPS обязателен (HTTP редиректит)
- [ ] TLS 1.2+ (не SSL, не TLS 1.0/1.1)
- [ ] HSTS header установлен
- [ ] Certificate validation включён

### Headers

- [ ] Content-Security-Policy установлен
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY или SAMEORIGIN
- [ ] Referrer-Policy установлен
- [ ] CORS настроен корректно (не wildcard для authenticated)

### API Design

- [ ] Нет чувствительных данных в URL
- [ ] Нет secrets в query parameters
- [ ] Нет verbose error messages с internal details
- [ ] API versioning реализован

---

## 💾 Данные

### Storage

- [ ] Чувствительные данные зашифрованы (at rest)
- [ ] Ключи шифрования защищены
- [ ] Backups зашифрованы
- [ ] Нет чувствительных данных в логах

### Transmission

- [ ] Данные зашифрованы при передаче (TLS)
- [ ] Нет чувствительных данных в query strings
- [ ] Безопасные каналы для inter-service communication

### Retention

- [ ] Политика хранения определена
- [ ] Механизм удаления данных реализован (GDPR)
- [ ] Нет избыточного сбора данных

---

## 🔑 Секреты и Конфигурация

### Secrets Management

- [ ] Нет hardcoded credentials в коде
- [ ] Нет secrets в git history
- [ ] Secrets хранятся в vault / env variables
- [ ] Secrets ротируются регулярно
- [ ] Разные secrets для разных окружений

### Configuration

- [ ] Нет debug mode в production
- [ ] Нет default passwords
- [ ] Конфигурация не экспоузится публично
- [ ] Безопасные default значения

---

## 📝 Logging и Monitoring

### Logging

- [ ] Аутентификация/авторизация логируется
- [ ] Подозрительные события логируются
- [ ] Нет PII в логах
- [ ] Нет secrets в логах
- [ ] Нет stack traces в production logs для клиентов

### Monitoring

- [ ] Алерты на брутфорс попытки
- [ ] Алерты на аномальную активность
- [ ] Audit trail для критических операций

---

## 🧪 Testing

### Security Testing

- [ ] Security unit tests написаны
- [ ] Negative tests (что НЕ должно работать)
- [ ] Boundary tests для валидации
- [ ] Тесты на injection (если применимо)

### Review

- [ ] Код проверен на security issues
- [ ] Dependencies проверены на уязвимости
- [ ] Static analysis пройден

---

## Severity Classification

| Level | Примеры | Действие |
|-------|---------|----------|
| 🔴 Critical | RCE, Auth bypass, SQLi, Data leak | STOP — немедленное исправление |
| 🟠 High | XSS, CSRF, Privilege escalation | Исправить перед deploy |
| 🟡 Medium | Information disclosure, Weak crypto | Исправить в ближайшем спринте |
| 🟢 Low | Missing headers, Verbose errors | Track and fix |

---

## Quick Reference

```
Security Priority:

1. Authentication — кто это?
2. Authorization — что может делать?
3. Input Validation — можно ли доверять данным?
4. Data Protection — защищены ли данные?
5. Secrets — защищены ли credentials?

Red Flags:
❌ User input → SQL/Command без sanitization
❌ Secrets в коде / логах
❌ Отсутствие auth checks
❌ Verbose errors с internal details
❌ HTTP (не HTTPS)
```

---

**Связанные файлы:**

- `checklist-code-review/SKILL.md` — общий чеклист ревью
- `checklist-release/SKILL.md` — предрелизный чеклист

---

**END OF CHECKLIST**
