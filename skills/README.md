# Meta-Architect Skills

Коллекция скилов (навыков) для **Meta-Architect Framework** — системы управления AI-агентами в IDE (Claude Code, Cursor, Windsurf, KiloCode).

## Структура

```
skills/
├── architectural-planning/    # Методологический инструментарий архитектора
├── authoring-skills/          # Создание и поддержка скилов
├── canvas-design/             # Визуальный дизайн (постеры, PDF, PNG)
├── algorithmic-art/           # Генеративное искусство (p5.js)
├── frontend-design/           # UI/UX дизайн веб-интерфейсов
├── theme-factory/             # Темизация артефактов
├── web-artifacts-builder/     # Сборка сложных HTML-артефактов
├── mcp-builder/               # Создание MCP-серверов
├── skill-creator/             # Создание и тестирование скилов
├── strategic-advisory/        # Стратегическое консультирование
├── onboarding/                # Инициализация проекта
├── forensic-investigation/    # Криминалистический анализ кода
├── framework-knowledge-base/  # Документация фреймворка
├── vercel-deploy/             # Деплой на Vercel
│
├── pattern-clean-architecture/    # Чистая архитектура
├── pattern-modular-monolith/      # Модульный монолит
├── pattern-multi-tenant/          # Мультиарендность
├── pattern-rbac/                  # Role-Based Access Control
├── pattern-feature-flags/         # Флаги функций
│
├── workflow-feature/              # Добавление функциональности
├── workflow-debugging/            # Отладка и фикс багов
├── workflow-refactoring/          # Рефакторинг кода
├── workflow-architecture-change/   # Архитектурные изменения
├── workflow-new-project/          # Инициализация нового проекта
├── workflow-legacy-analysis/      # Анализ legacy-кода
├── workflow-requirements-interview/ # Сбор требований
├── workflow-ui-build-order/       # UI-разработка
├── workflow-ai-session/          # Управление AI-сессиями
├── workflow-devops/              # DevOps-процедуры
│
├── checklist-code-review/        # Ревью кода
├── checklist-security/           # Безопасность
├── checklist-ux-design/          # UX-дизайн
├── checklist-ux-review/         # UX-ревью
├── checklist-infra/             # Инфраструктура
├── checklist-release/           # Релиз
├── checklist-phase-completion/  # Завершение фаз
│
└── README.md                    # Этот файл
```

---

## 🧠 Архитектура и Планирование

### architectural-planning
**Методологический инструментарий** для архитектурного планирования и делегирования между AI-агентами.

- Протоколы передачи задач (handoff) между @coder, @reviewer, @coder-expert
- Шаблоны промптов для реализации, баг-фиксов, рефакторинга
- Гайды: prompt engineering, декомпозиция задач, управление контекстом, контроль скоупа
- Фреймворк оценки сложности: 🟢 Simple / 🟡 Medium / 🔴 Complex
- Протокол STOP-gates и обработки FAIL-ревью

**Триггеры:** планирование задачи, создание промпта, декомпозиция, оценка сложности

---

## 🎨 Дизайн и Визуализация

### canvas-design
Создание визуальных артефактов (постеры, PDF, PNG) через дизайн-философию.

- Двухшаговый процесс: философия дизайна → визуальное выражение
- Работа с формой, пространством, цветом, композицией
- Использование кастомных шрифтов из `canvas-fonts/`
- Минимальный текст как визуальный акцент

**Триггеры:** создание постера, дизайна, арт-объекта

### algorithmic-art
Создание генеративного искусства на p5.js с сидированной случайностью.

- Двухшаговый процесс: алгоритмическая философия → код
- Flow fields, particle systems, noise functions
- Seeded randomness (Art Blocks pattern)
- Интерактивные HTML-артефакты с параметрами и навигацией по seed

**Триггеры:** генеративное искусство, алгоритмическое искусство, particle systems

### frontend-design
Гайд по созданию выразительного, интенционального визуального дизайна для веб-интерфейсов.

- Дизайн-принципы: типографика, структура, моушн
- Процесс: brainstorm → explore → plan → critique → build → critique
- Рестриктивность и самокритика
- Копирайтинг в дизайне

**Триггеры:** UI-дизайн, визуальное направление, типографика

### theme-factory
Набор из 10 предустановленных тем для стилизации артефактов (слайды, документы, лендинги).

- 10 тем: Ocean Depths, Sunset Boulevard, Forest Canopy, Modern Minimalist, Golden Hour, Arctic Frost, Desert Rose, Tech Innovation, Botanical Garden, Midnight Galaxy
- Каждая тема: цветовая палитра + шрифтовые пары
- Возможность создания кастомных тем

**Триггеры:** стилизация артефактов, темы для слайдов/документов

### web-artifacts-builder
Сборка сложных многостраничных HTML-артефактов с React, Tailwind CSS, shadcn/ui.

- Инициализация React-проекта через `scripts/init-artifact.sh`
- Бандлинг в единый HTML-файл через `scripts/bundle-artifact.sh`
- 40+ предустановленных shadcn/ui компонентов

**Триггеры:** сложные HTML-артефакты, React-компоненты, shadcn/ui

---

## 🔧 Инструменты Разработчика

### mcp-builder
Создание MCP (Model Context Protocol) серверов для интеграции LLM с внешними сервисами.

- 4 фазы: Research → Implementation → Review → Evaluation
- Поддержка TypeScript (рекомендуется) и Python
- Streamable HTTP для удаленных серверов, stdio для локальных
- Инструменты для создания eval-наборов и тестирования

**Триггеры:** создание MCP-сервера, интеграция API

### skill-creator
Создание, модификация и оптимизация скилов с измерением производительности.

- Цикл: draft → test → evaluate → improve → repeat
- Параллельный запуск тестов (with-skill vs baseline)
- Количественные и качественные метрики
- Оптимизация описания для лучшего авто-триггеринга

**Триггеры:** создание скила, редактирование, оптимизация, eval

### authoring-skills
Гайд по созданию и поддержке скилов в разных IDE.

- Совместимость: Claude Code, Cursor, Windsurf, KiloCode
- Поддерживаемые поля frontmatter
- Структура файлов и naming conventions
- Когда создавать скил vs когда писать в rules

**Триггеры:** создание SKILL.md, написание описаний, выбор структуры

---

## 🧭 Стратегия и Консультирование

### strategic-advisory
Инструментарий стратегического консультирования для режима CONSILIUM.

- 5 режимов: STRATEG, NEGOTIATOR, PSYCHE, CRISIS, MENTOR
- 7 фреймворков: OODA, Voss Protocol, Taleb, Dalio, Power, Psychology, Stratagems
- Формат вывода: Диагноз → Стратегия → Тактика → Скрипты → Red Team → Second-Order

**Триггеры:** стратегия, переговоры, кризис, конфликт, бизнес-решения

---

## 🚀 Онбординг и Инициализация

### onboarding
Инициализация проекта и создание структуры памяти (memory/*).

- Конверсационное Discovery проекта
- Классификация типа проекта (SaaS, API, library, business, creative и др.)
- Генерация: PROFILE.md, CHRONICLE.md, FACTS.md, DECISIONS.md, CONTEXT.md, INSIGHTS.md, SUMMARY.md
- Опционально: выбор стека, архитектура, scaffolding, первый deliverable

**Триггеры:** первый запуск, инициализация проекта, настройка фреймворка

---

## 🔍 Анализ и Расследование

### forensic-investigation
Протоколы расследования сложных технических проблем.

- 5 фаз: Сбор фактов → Гипотезы → Тестирование → Root Cause → Рекомендации
- Диагностика AI-циклов (зацикливание @coder)
- Reverse engineering legacy-кода
- Анализ производительности
- Инструменты: git archaeology, profiling, debugging

**Триггеры:** root cause analysis, AI loops, legacy mysteries, performance bottlenecks

### framework-knowledge-base
Полная документация Meta-Architect Framework.

- 9 reference-файлов: overview, getting-started, workflow-examples, skills-index, complexity-guide, delegation-flowchart, best-practices, troubleshooting, ide-compatibility

**Триггеры:** вопросы о фреймворке, справка по ролям/воркфлоу

---

## 🌐 DevOps и Деплой

### vercel-deploy
Деплой приложений на Vercel.

- Preview-деплой по умолчанию (не production)
- Fallback-метод при отсутствии авторизации CLI
- Production-деплой только по явному запросу

**Триггеры:** деплой, "deploy my app", "push this live"

---

## 📐 Архитектурные Паттерны

### pattern-clean-architecture
Чистая архитектура с разделением на Domain/Application/Presentation/Infrastructure.

- Dependency Inversion: зависимости направлены к центру
- Domain: entities, value objects, repository interfaces
- Application: use cases, DTOs, orchestration
- Presentation: controllers, presenters, mappers
- Infrastructure: DB, external APIs, framework

**Сложность:** 🟡 Medium

### pattern-modular-monolith
Модульный монолит — баланс между простотой монолита и гибкостью микросервисов.

- Модуль = Bounded Context с api/internal разделением
- Event-based коммуникация между модулями
- Shared Kernel (минимальный и стабильный)
- Migration path к микросервисам

**Сложность:** 🟡 Medium

### pattern-multi-tenant
Мультиарендность для SaaS-приложений.

- Стратегии изоляции: Database per Tenant, Schema per Tenant, Row-Level
- Tenant Resolution: subdomain, path, header, JWT
- Tenant Context (AsyncLocalStorage / Request-scoped)
- Cross-tenant операции для super-admin

**Сложность:** 🔴 High

### pattern-rbac
Role-Based Access Control с иерархией ролей и permissions.

- Permission naming: `{resource}:{action}[:{scope}]`
- Scopes: ALL, OWN, TEAM
- Role hierarchy с наследованием permissions
- AuthorizationService с кэшированием
- Middleware и frontend-компонент CanAccess

**Сложность:** 🟡 Medium

### pattern-feature-flags
Флаги функций для runtime-конфигурации.

- Типы: Release, Experiment, Ops, Permission
- Targeting rules: percentage rollout, user/tenant targeting
- FeatureFlagService с кэшированием
- Multi-tenant overrides
- Admin UI и audit logging

**Сложность:** 🟢 Low

---

## 🔄 Workflow-процессы

### workflow-feature
Добавление новой функциональности в существующий проект.

- 🟢 Simple: @coder → @reviewer → Done
- 🟡 Medium: Plan.md → STOP → @coder → @reviewer → Done
- 🔴 Complex: Research.md → Plan.md + ADR → STOP → phased @coder → @reviewer → Done

### workflow-debugging
Отладка и исправление багов.

- Стабилизация (репродукция) → Диагностика (гипотезы) → Планирование фикса → Реализация → Верификация
- Минимум 2 гипотезы перед фиксом
- Обязательный тест на исправленный случай

### workflow-refactoring
Рефакторинг кода без изменения поведения.

- RED → GREEN → REFACTOR цикл
- Обязательная проверка тестового покрытия перед началом
- 🟢/🟡/🔴 маршрутизация

### workflow-architecture-change
Значительные архитектурные изменения.

- Всегда 🔴 Complex: Research.md → ADR → Plan.md → STOP → phased implementation
- Rollback strategy для каждой фазы
- Миграция данных, breaking changes, инфраструктура

### workflow-new-project
Инициализация нового проекта с нуля.

- Stack Selection → Architecture Definition → Scaffolding → First Deliverable
- STOP-gates на утверждение стека и архитектуры
- Smoke test после scaffolding

### workflow-legacy-analysis
Анализ и документирование legacy-систем.

- Первичный обзор → @coder-expert анализ → Документирование в memory/* → Рекомендации
- Hot spots и risk areas
- Hand-off к нужному workflow

### workflow-requirements-interview
Структурированный сбор требований через вопросы.

- 6 фаз: Core Understanding → Scope → Functional → Non-Functional → Edge Cases → Documentation
- Шаблоны вопросов по доменам (UI, API, Data, Integration)
- Создание /docs/Requirements.md

### workflow-ui-build-order
9-фазный протокол UI-разработки.

1. Design Tokens → 2. Layout Shell → 3. Navigation → 4. Core Components → 5. Data Display → 6. Forms & Inputs → 7. States & Feedback → 8. Microinteractions → 9. Polish Pass
- Каждая фаза: готовый промпт для @coder
- Component Quality Gate для каждого компонента

### workflow-ai-session
Управление сессиями с AI-агентами.

- Мониторинг деградации контекста
- Context Snapshot и Restart
- Two Steps Back Protocol при зацикливании
- Constraint Reinforcement при нарушении ограничений

### workflow-devops
Структурированные протоколы для DevOps-задач.

- 7 воркфлоу: Dev Environment, Container Setup, CI/CD, Deployment, System Hardening, Secrets Management, Observability
- Готовые шаблоны: Dockerfile, GitHub Actions, docker-compose

---

## ✅ Чеклисты

### checklist-code-review
Качественные ворота для @reviewer. 5 категорий проверки:

- 🔴 Функциональность (соответствие требованиям, тесты)
- 🔴 Безопасность (input validation, авторизация, секреты, уязвимости)
- 🟠 Архитектура (слои, контракты, масштабируемость)
- 🟡 Качество кода (читаемость, поддерживаемость, error handling)
- 🟢 Стиль (форматирование, чистота)

### checklist-security
Детальная проверка безопасности для критических изменений.

- 9 категорий: Authentication, Authorization, Input Validation, API Security, Data Protection, Secrets, Logging, Testing
- Severity: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

### checklist-ux-design
6-pass UX-методология для UI-фич (до реализации).

1. Mental Model → 2. Information Architecture → 3. Affordance → 4. System Feedback → 5. Edge States → 6. Microinteractions

### checklist-ux-review
Верификация UI/UX реализации.

- Visual States, Accessibility (A11y), Responsive Design, Design Consistency, Performance, Interaction Patterns, Content & Copy, Internationalization

### checklist-infra
Пред-деплойная верификация инфраструктуры.

- Docker & Containers, CI/CD Pipeline, Secrets Management, Deployment Safety, Developer Environment, Monitoring & Observability, System Hardening

### checklist-release
Предрелизный чеклист. 7 фаз: Code → Docs → Infra → Security → Monitoring → Deploy → Post-Deploy.

- Go/No-Go критерии: любой незакрытый 🔴 = NO-GO

### checklist-phase-completion
Критерии завершения каждой фазы работы Meta-Architect.

- ANALYSIS → RESEARCH → PLANNING → IMPLEMENTATION → REVIEW → COMPLETION
- Выходные артефакты для каждого уровня сложности
- Anti-patterns

---

## Лицензия

Private — все права защищены.
