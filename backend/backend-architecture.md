Ось повний вміст вашого PDF-документа, дбайливо перенесений та структурований у форматі Markdown. Ви можете скопіювати цей текст та зберегти його як файл з розширенням `.md`.

```markdown
# NestJS модульна архітектура: application / domain / infrastructure / presentation

Ця структура — практична адаптація Clean Architecture, Hexagonal Architecture і DDD для feature-модулів у NestJS. Вона потрібна не для “красивих папок”, а щоб ізолювати бізнес-логіку від framework, бази даних, HTTP і зовнішніх сервісів.

Основний принцип: залежності мають дивитися всередину.
* `presentation` (або `interfaces`) залежить від `application`.
* `application` залежить від `domain`.
* `infrastructure` реалізує порти `application`, але домен і use-cases не залежать від Prisma, S3, Redis, Nest controller decorators.
* `domain` не залежить ні від чого зовнішнього.

---

## 1. Головна ідея по шарах

### `domain/`
Це ядро бізнес-логіки. Тут лежить:
* сутність предметної області (TaskEntity, OrderEntity, InvoiceEntity)
* value objects (TaskDates, Email, Money, DateRange)
* domain policies / business rules (TaskStatusPolicy, PricingPolicy)
* domain constants / domain errors
* іноді domain events

`domain` не повинен знати:
* що таке NestJS
* що таке Prisma
* що таке HTTP/DTO
* що таке Postgres/S3

### `application/`
Це orchestration layer. Тут лежить:
* use-cases (CreateTaskUseCase, UpdateTaskUseCase)
* ports (TaskRepositoryPort, FileStoragePort, MailerPort)
* application services (валідація, координація, permission checks, якщо це не чистий domain concern)
* mappers між transport/persistence shape та application input/output model

`application`:
* координує сценарій
* викликає domain logic
* викликає repository/storage через ports
* не повинен знати про Prisma implementation details

### `infrastructure/`
Це технічна реалізація зовнішніх залежностей. Тут лежить:
* Prisma repositories
* адаптери до S3, Redis, email, queue, external APIs
* transaction manager
* persistence mappers, якщо вони дуже Prisma-specific

`infrastructure` залежить від `application` і іноді читає `domain`, але не навпаки.

### `presentation/` або `interfaces/`
Це вхідні/вихідні адаптери. Тут лежить:
* REST controllers
* DTO
* GraphQL resolvers
* WebSocket gateways
* message consumers
* presenters/view models (якщо треба)

Вони: приймають запит, валідовують transport shape, перетворюють його на input use case, віддають response.

---

## 2. Dependency rule

Правильний напрям залежностей:
`presentation -> application -> domain`
`infrastructure -> application -> domain`

Або в термінах відповідальності:
* `presentation` знає, як прийняти запит
* `application` знає, як виконати сценарій
* `domain` знає, які правила предметної області
* `infrastructure` знає, як технічно це реалізувати

Неправильно:
* `domain` імпортує Prisma
* `entity` кидає NotFoundException
* use case приймає `@Body()` або Request
* repository знає про HTTP DTO

---

## 3. Повний граф модуля

```text
src/task/
├── task.module.ts
├── presentation/
│   ├── controllers/
│   │   └── task.controller.ts
│   ├── dto/
│   │   ├── create-task.dto.ts
│   │   ├── update-task.dto.ts
│   │   ├── bulk-update-task-status.dto.ts
│   │   └── find-all-tasks.dto.ts
│   ├── requests/
│   │   └── task-request.mapper.ts
│   └── responses/
│       ├── task-response.dto.ts
│       ├── task-list-item.response.ts
│       └── task-details.response.ts
├── application/
│   ├── use-cases/
│   │   ├── commands/
│   │   │   ├── create-task.use-case.ts
│   │   │   ├── update-task.use-case.ts
│   │   │   ├── delete-task.use-case.ts
│   │   │   ├── delete-many-tasks.use-case.ts
│   │   │   └── bulk-update-task-status.use-case.ts
│   │   └── queries/
│   │       ├── find-task-by-id.use-case.ts
│   │       └── find-all-tasks.use-case.ts
│   ├── ports/
│   │   ├── incoming/
│   │   │   └── optional, if using explicit input ports
│   │   └── outgoing/
│   │       ├── task.repository.port.ts
│   │       ├── task-file-storage.port.ts
│   │       ├── event-bus.port.ts
│   │       └── transaction-manager.port.ts
│   ├── services/
│   │   ├── task-assignee-validator.service.ts
│   │   ├── task-authorization.service.ts
│   │   └── task-attachment-orchestrator.service.ts
│   ├── commands/
│   │   ├── create-task.command.ts
│   │   ├── update-task.command.ts
│   │   └── bulk-update-task-status.command.ts
│   ├── queries/
│   │   ├── find-task-by-id.query.ts
│   │   └── find-all-tasks.query.ts
│   ├── mappers/
│   │   ├── task-command.mapper.ts
│   │   ├── task-query.mapper.ts
│   │   └── task-read-model.mapper.ts
│   └── read-models/
│       ├── task-list-item.read-model.ts
│       └── task-details.read-model.ts
├── domain/
│   ├── entities/
│   │   └── task.entity.ts
│   ├── value-objects/
│   │   ├── task-dates.vo.ts
│   │   ├── task-title.vo.ts
│   │   └── task-description.vo.ts
│   ├── policies/
│   │   ├── task-status.policy.ts
│   │   └── task-assignment.policy.ts
│   ├── events/
│   │   ├── task-created.event.ts
│   │   └── task-attachments-removed.event.ts
│   ├── factories/
│   │   └── task.factory.ts
│   ├── repositories/
│   │   └── optional only if you keep domain repo abstractions here
│   ├── constants/
│   │   └── task-errors.ts
│   └── specifications/
│       └── optional complex rules
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma/
│   │   │   ├── prisma-task.repository.ts
│   │   │   ├── prisma-task.mapper.ts
│   │   │   ├── prisma-task.payload.ts
│   │   │   └── prisma-transaction-manager.adapter.ts
│   │   └── migrations/
│   │       └── outside feature usually, but noted here conceptually
│   ├── storage/
│   │   └── task-file-storage.adapter.ts
│   ├── events/
│   │   ├── nest-event-bus.adapter.ts
│   │   └── outbox.publisher.ts
│   ├── cache/
│   │   └── optional
│   └── integrations/
│       └── optional external services
├── shared/
│   ├── types/
│   ├── base/
│   ├── utils/
│   └── exceptions/
└── tests/
    ├── unit/
    │   ├── domain/
    │   └── application/
    ├── integration/
    │   └── infrastructure/
    └── e2e/
        └── presentation/
```
*(Примітка: Структура дерева складена згідно з секцією "Повний граф модуля")*

---

## 4. Що лежить у кожному файлі

**`presentation/controllers/task.controller.ts`**
Тільки HTTP orchestration.
Повинен: читати `@Body`, `@Param`, `@Query`, діставати user/org context, викликати use case, повертати response DTO.
Не повинен: рахувати completedAt, напряму ходити в Prisma, містити бізнес-правила.

**`presentation/dto/*.dto.ts`**
Transport-level validation. Тут: class-validator, swagger decorators, shape конкретного REST API. DTO не повинні ставати внутрішньою моделлю всього модуля.

**`application/commands/*.command.ts`**
Внутрішній input contract use case. Навіщо: use case не залежить від HTTP DTO, той самий command можна використати з REST, GraphQL, queue consumer, cron.

**`application/use-cases/commands/*.use-case.ts`**
Один use case = один сценарій (наприклад: `CreateTaskUseCase`, `UpdateTaskUseCase`). 
Use case: 
1. отримує command 
2. викликає validator/service/policy 
3. завантажує aggregate або read data 
4. викликає repository через port 
5. повертає output model

**`application/use-cases/queries/*.use-case.ts`**
Окремо для читання. Плюси: чистіше розділення read/write, легше оптимізувати list/details окремо, краща основа для CQRS style без фанатизму.

**`application/ports/outgoing/*.port.ts`**
Контракти для зовнішніх залежностей (TaskRepositoryPort, TaskFileStoragePort). Use case залежить від порта, не від Prisma/S3.

**`application/services/*.service.ts`**
Сюди класти application-level coordination logic (перевірка прав, membership validation, orchestration of attachments, анти-дублювання між use-cases). Не клади сюди все підряд.

**`application/mappers/*.mapper.ts`**
Явне перетворення між шарами (DTO -> Command, Query DTO -> Query model, Prisma payload -> ReadModel).

**`application/read-models/*.read-model.ts`**
Моделі для читання, які повертають use-cases (TaskListItemReadModel, TaskDetailsReadModel). Це краще, ніж повертати голі Prisma payload types у весь код.

**`domain/entities/task.entity.ts`**
Entity потрібна, коли в об'єкта є поведінка й інваріанти (markCompleted(), reopen(), replaceAttachments(), changeSchedule()). Якщо entity — лише інтерфейс полів, це ще не entity, а просто type alias.

**`domain/value-objects/*.vo.ts`**
Для маленьких, але важливих інваріантів (TaskDates, Email, Money, Slug, DateRange). VO добре працює там, де хочеш централізувати validation/normalization і не розмазувати її по use-cases.

**`domain/policies/*.policy.ts`**
Окремі бізнес-правила, що не належать прямо одній entity (логіка переходу статусів, правила призначення assignee, pricing rules, permission rules домену).

**`domain/events/*.event.ts`**
Факти, що відбулися в домені (TaskCompletedEvent, OrderPaidEvent). Корисно, коли хочеш: нотифікації, аудит, асинхронні side effects, outbox pattern.

**`infrastructure/persistence/prisma/prisma-task.repository.ts`**
Реалізація TaskRepositoryPort.
Повинен: знати Prisma schema, будувати include/where/connect/set, робити transaction.
Не повинен: містити бізнес-правила рівня use-case, вирішувати, чи можна переводити task в COMPLETED.

**`infrastructure/persistence/prisma/prisma-task.mapper.ts`**
Тут мапиш Prisma payload у read model або entity, якщо це потрібно.

**`infrastructure/storage/task-file-storage.adapter.ts`**
Адаптер до storage (delete files, generate signed URLs, move objects). Це implementation `TaskFileStoragePort`.

---

## 5. Які патерни тут використовуються
1. **Layered Architecture:** Шари з різною відповідальністю.
2. **Clean Architecture:** Залежності дивляться всередину. Бізнес-логіка не залежить від framework/infrastructure.
3. **Hexagonal Architecture (Ports and Adapters):** ports = контракти, adapters = реалізації.
4. **CQRS-lite:** commands/use-cases для write, queries/use-cases для read.
5. **Repository Pattern:** TaskRepositoryPort + PrismaTaskRepository.
6. **Application Service / Use Case Pattern:** Кожен сценарій оформлений окремим класом.
7. **Value Object Pattern:** Для інваріантів типу dates, email, money.
8. **Policy / Specification:** Для складних бізнес-правил.
9. **Mapper Pattern:** Для явного переведення shape між шарами.
10. **Dependency Inversion:** Use case залежить від абстракції (port), а не від Prisma чи S3.

---

## 6. Як правильно розширювати

**Якщо додається новий write scenario (наприклад: archive task):**
Додаєш:
* `application/use-cases/commands/archive-task.use-case.ts`
* якщо є правило, то `domain/policies/task-archive.policy.ts` або метод entity
* якщо треба нове persistence API — розширюєш `TaskRepositoryPort`
* controller endpoint
Не треба пхати все в TaskService.update().

**Якщо додається новий read scenario (наприклад: get overdue tasks summary):**
Додаєш:
* `application/use-cases/queries/get-overdue-tasks-summary.use-case.ts`
* окремий read model
* спеціалізований repository method або query service

**Якщо додається зовнішня інтеграція (наприклад: відправка нотифікації після completion):**
Додаєш:
* `application/ports/outgoing/notifier.port.ts`
* `infrastructure/integrations/slack-notifier.adapter.ts`
* use case або event handler, що викликає цей порт

**Якщо зростає складність домену:**
Переходиш від plain objects до: entity methods, value objects, domain events, factory.

**Якщо зростає кількість модулів:**
Кожен feature тримає власні: presentation, application, domain, infrastructure.
Тобто не роби глобальні папки controllers, services, repositories на весь проєкт — це погано масштабується.

---

## 7. Практичні правила “що куди класти”

**Клади в domain, якщо:**
* це бізнес-правило
* це інваріант
* це поведінка сутності
* це логіка, яка має працювати незалежно від REST/Prisma/Nest

**Клади в application, якщо:**
* це сценарій use case
* це orchestration кількох залежностей
* це coordination logic
* це бізнес-процес, але не чисте domain rule

**Клади в infrastructure, якщо:**
* це Prisma query
* це S3/Redis/email/http integration
* це transaction implementation
* це persistence-specific mapping

**Клади в presentation, якщо:**
* це HTTP DTO
* це controller
* це transport response
* це auth/request extraction

---

## 8. Типові помилки
1. **God service:** Один TaskService на 800 рядків.
2. **DTO leakage:** Коли CreateTaskDto живе аж до repository.
3. **Prisma leakage:** Коли use case оперує Prisma types, include payload і raw where clauses.
4. **Fake domain:** Коли domain/entity.ts — це просто інтерфейс без поведінки.
5. **Overengineering:** Для модуля з 2 CRUD endpoint'ами не треба 40 абстракцій.
6. **Shared junk drawer:** shared/utils, common/helpers як звалище всього підряд.
7. **Неправильний direction of dependencies:** Коли domain імпортує infrastructure.

---

## 9. Як не оверінженірити

Починай із мінімального шаблону:
```text
feature/
├── presentation/
│   ├── feature.controller.ts
│   └── dto/
├── application/
│   ├── use-cases/
│   └── ports/
├── domain/
│   ├── policies/
│   └── value-objects/
├── infrastructure/
│   └── repositories/
└── feature.module.ts
```
Додавай лише коли є реальна причина:
* `entities/` — коли зʼявилась поведінка
* `events/` — коли є async side effects
* `read-models/` — коли list/details shape різні
* `factories/` — коли конструювання aggregate складне
* `specifications/` — коли правил дуже багато

---

## 10. Як це перевикористовувати для інших модулів

Той самий шаблон підходить для: task, project, invoice, comment, auth (з нюансами), organization.
Ти просто змінюєш доменні сутності й use-cases, але не принцип.
У кожному feature однакова логіка мислення:
1. Які сценарії?
2. Які бізнес-правила?
3. Які зовнішні залежності?
4. Який transport?

---

## 11. Еволюція від простого до сильного

**Рівень 1 — CRUD**: controller, service, repository.
**Рівень 2 — feature layering**: presentation, application, infrastructure, прості policies/value objects.
**Рівень 3 — strong modular architecture**: commands/queries, read models, domain entity behavior, ports/adapters, transaction boundaries.
**Рівень 4 — advanced**: domain events, outbox, background jobs, integration events, eventual consistency.
*Не треба стрибати одразу в рівень 4, якщо модуль цього ще не потребує.*

---

## 12. Що читати і дивитися

**По архітектурі:**
1. Clean Architecture — Robert C. Martin
2. Architecture Patterns with Python
3. Implementing Domain-Driven Design — Vaughn Vernon
4. Domain-Driven Design Distilled — Vaughn Vernon
5. Cosmic Python (безкоштовно онлайн)

**По DDD / Hexagonal / practical structure:**
1. Sairyss — domain-driven-hexagon
2. Приклади clean architecture у NestJS репозиторіях
3. Документація NestJS по controllers, providers, modules, CQRS
4. Prisma docs по relations, transactions, compound unique

**Що шукати конкретно:**
* clean architecture interface adapters
* hexagonal architecture ports and adapters
* ddd application service vs domain service
* repository pattern use case
* prisma transactions and outbox
* nestjs cqrs docs

---

## 13. Ментальна модель для себе

Запамʼятай 4 питання:
1. **Що це — правило чи сценарій?** правило => domain, сценарій => application
2. **Це залежить від HTTP/Nest?** так => presentation, ні => не presentation
3. **Це залежить від Prisma/S3/Redis?** так => infrastructure, ні => не infrastructure
4. **Це абстракція чи реалізація?** абстракція => application/ports, реалізація => infrastructure

---

## 14. Практичний базовий шаблон, який реально варто перевикористовувати
```text
src/<feature>/
├── <feature>.module.ts
├── presentation/
│   ├── controllers/
│   └── dto/
├── application/
│   ├── use-cases/
│   ├── ports/
│   ├── services/
│   ├── mappers/
│   └── read-models/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── policies/
│   ├── events/
│   └── constants/
└── infrastructure/
    ├── repositories/
    ├── persistence/
    ├── integrations/
    └── storage/
```
Це хороший production-style baseline. Потім ти відрізаєш те, що модулю не потрібно.

---

## 15. Найважливіший практичний висновок

Не думай категоріями “куди покласти файл”. Думай так:
1. Яка відповідальність цього коду?
2. Від чого він має право залежати?
3. Хто його використовує?
4. Чи це правило домену, сценарій, транспорт, чи технічна інтеграція?

Якщо відповіси на ці 4 питання, правильна папка зазвичай стає очевидною.
```