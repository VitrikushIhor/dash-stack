# Backend Architecture Guide — Dash Stack

This document outlines the architectural principles, design patterns, and engineering standards for the **Dash Stack** backend application. It serves as the single source of truth for technical decision-making, onboarding, and architectural consistency.

---

## 📑 Table of Contents

1. [Architectural Tenets](#-1-architectural-tenets)
2. [Layer Decomposition (Clean & Hexagonal Architecture)](#-2-layer-decomposition-clean--hexagonal-architecture)
3. [Domain Layer Standards (DDD Core)](#-3-domain-layer-standards-ddd-core)
4. [Application Layer & Orchestration (Ports & Use Cases)](#-4-application-layer--orchestration-ports--use-cases)
5. [Infrastructure Layer & Adapters (Prisma, S3, Auth0)](#-5-infrastructure-layer--adapters-prisma-s3-auth0)
6. [Presentation & Transport Layer (REST, DTOs, Swagger)](#-6-presentation--transport-layer-rest-dtos-swagger)
7. [Security, Auth & Token Lifecycle](#-7-security-auth--token-lifecycle)
8. [Testing Strategy & Quality Gates](#-8-testing-strategy--quality-gates)

---

## 🏛️ 1. Architectural Tenets

Our backend architecture is governed by five core tenets:

1. **Dependency Inversion (Inward Dependency Rule)**: Dependencies strictly point inward toward the domain core. The domain and application layers have zero knowledge of databases (Prisma), web frameworks (NestJS controllers), or third-party providers (S3, Nodemailer).
2. **Ports & Adapters (Hexagonal Architecture)**: Business logic communicates with external tools exclusively via abstract TypeScript interfaces (**Ports**). Technical implementations (**Adapters**) live in the infrastructure layer and are bound at runtime via NestJS Dependency Injection.
3. **Rich Domain Modeling (Domain-Driven Design)**: Business logic, invariant rules, and calculations live inside **Entities**, **Value Objects**, and **Domain Policies** — never scattered across controllers or raw database scripts.
4. **Compile-Time & Runtime Boundary Safety**: Every boundary (HTTP payloads, environment variables, storage uploads) is strictly validated via **class-validator** and **class-transformer** before reaching application use cases.
5. **Decoupled Read & Write Models**: Application commands mutate state via domain entities and repository ports, while queries return optimized **Read Models** to eliminate unnecessary object mappings.

---

## 🧱 2. Layer Decomposition (Clean & Hexagonal Architecture)

Each feature module within `backend/src/` follows a strict 4-layer structure:

```text
src/<module-name>/
├── domain/            # Layer 1: Core business entities, value objects, policies, exceptions
├── application/       # Layer 2: Use cases, ports (in/out interfaces), read models, commands
├── infrastructure/    # Layer 3: Prisma repositories, external service adapters, mappers
├── presentation/      # Layer 4: REST controllers, DTOs, serializers, swagger definitions
└── <module>.module.ts # NestJS Module definition wiring dependencies together
```

### Unidirectional Dependency Flow

```text
   ┌────────────────────────────────────────────────────────────────────────┐
   │  Layer 4: presentation/  (REST Controllers, DTOs, Guards, Swagger)     │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │  calls use cases ▼
   ┌───────────────────────────────────▼────────────────────────────────────┐
   │  Layer 2: application/   (Use Cases, Commands, Queries, Ports)         │
   └─────────────────┬─────────────────────────────────┬────────────────────┘
                     │  uses domain rules ▼            ▲  implements ports  │
   ┌─────────────────▼──────────────────┐  ┌───────────┴────────────────────┴┐
   │  Layer 1: domain/ (PURE CORE)      │  │  Layer 3: infrastructure/       │
   │  - Entities & Value Objects        │  │  - Prisma Repositories          │
   │  - Domain Policies & Invariants    │  │  - S3 / Mailer / Auth0 Adapters │
   │  - Domain Exception Classes        │  │  - Persistence Mappers          │
   │  (Zero Framework / DB Dependencies)│  │  (Depends on Application Ports) │
   └────────────────────────────────────┘  └─────────────────────────────────┘
```

### Layer Responsibilities Matrix

| Layer                | Responsibility                                                                      | Allowed Dependencies                          | Forbidden Dependencies                               |
| :------------------- | :---------------------------------------------------------------------------------- | :-------------------------------------------- | :--------------------------------------------------- |
| **`domain`**         | Pure business rules, invariant validation, entities, value objects, domain policies | None (Pure TypeScript)                        | NestJS, Prisma, Express, Axios, S3, TypeORM          |
| **`application`**    | Orchestrating use case workflows, declaring ports, executing policies               | `domain`                                      | Prisma client, Controller decorators, HTTP responses |
| **`infrastructure`** | Implementing ports (Prisma, AWS S3, Sharp, Mailer, Bcrypt)                          | `application` (ports), `domain`               | Presentation layer, HTTP requests                    |
| **`presentation`**   | HTTP transport, DTO validation, route guards, Swagger docs                          | `application` (use cases, commands), `domain` | Prisma direct calls, Raw DB queries                  |

---

## 💎 3. Domain Layer Standards (DDD Core)

The `domain/` directory is the heart of the system. It contains no decorators from NestJS, no ORM annotations, and no HTTP abstractions.

```text
src/task/domain/
├── constants/
│   └── task-errors.ts          # Strongly typed domain error messages
├── enums/
│   └── task-status.enum.ts     # Domain enum definitions (TODO, IN_PROGRESS, DONE)
├── exceptions/
│   ├── invalid-task-dates.exception.ts
│   └── task-not-found.exception.ts
├── policies/
│   └── task-status.policy.ts   # Transition and business rule validation
└── value-objects/
    └── task-dates.vo.ts        # Immutable date-range invariant validation
```

### 1. Value Objects

Value Objects encapsulate business invariants and are immutable by design:

```typescript
// src/task/domain/value-objects/task-dates.vo.ts
import { InvalidTaskDatesException } from '../exceptions/invalid-task-dates.exception';

export class TaskDates {
  private constructor(
    public readonly startDate: Date | null,
    public readonly dueDate: Date | null,
  ) {}

  public static create(
    startDate?: Date | string | null,
    dueDate?: Date | string | null,
  ): TaskDates {
    const start = startDate ? new Date(startDate) : null;
    const due = dueDate ? new Date(dueDate) : null;

    if (start && due && due < start) {
      throw new InvalidTaskDatesException('Due date cannot precede start date');
    }

    return new TaskDates(start, due);
  }
}
```

### 2. Domain Policies

Policies isolate complex domain logic and conditional rules away from use cases:

```typescript
// src/task/domain/policies/task-status.policy.ts
import { TaskStatus } from '../enums/task-status.enum';

export class TaskStatusPolicy {
  public static canTransition(current: TaskStatus, next: TaskStatus): boolean {
    if (current === TaskStatus.ARCHIVED) return false;
    return true;
  }
}
```

---

## ⚙️ 4. Application Layer & Orchestration

The `application/` layer coordinates business workflows. It receives plain command objects from controllers, queries domain policies, interacts with ports, and returns read models.

```text
src/task/application/
├── commands/
│   ├── create-task.command.ts  # Input DTO mapped to command contract
│   └── update-task.command.ts
├── ports/
│   ├── task.repository.port.ts # Abstract storage interface
│   └── task-file-storage.port.ts
├── read-models/
│   └── task.read-model.ts      # Optimized view shape for queries
├── services/
│   └── task-assignee-validator.service.ts
└── use-cases/
    ├── create-task.use-case.ts
    ├── find-all-tasks.use-case.ts
    └── update-task.use-case.ts
```

### 1. Port Interface Pattern

Ports declare the contract that the application expects without specifying the implementation:

```typescript
// src/task/application/ports/task.repository.port.ts
import { TaskReadModel } from '../read-models/task.read-model';
import { CreateTaskCommand } from '../commands/create-task.command';

export interface TaskRepositoryPort {
  findById(id: string, organizationId: string): Promise<TaskReadModel | null>;
  create(command: CreateTaskCommand): Promise<TaskReadModel>;
  update(id: string, command: Partial<CreateTaskCommand>): Promise<TaskReadModel>;
  delete(id: string): Promise<void>;
}

export const TASK_REPOSITORY_PORT = Symbol('TaskRepositoryPort');
```

### 2. Use Case Implementation

Use cases are single-responsibility orchestrators:

```typescript
// src/task/application/use-cases/create-task.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { TASK_REPOSITORY_PORT, TaskRepositoryPort } from '../ports/task.repository.port';
import { CreateTaskCommand } from '../commands/create-task.command';
import { TaskDates } from '../../domain/value-objects/task-dates.vo';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly taskRepo: TaskRepositoryPort,
  ) {}

  async execute(command: CreateTaskCommand) {
    // 1. Enforce domain invariants via Value Object
    const dates = TaskDates.create(command.startDate, command.dueDate);

    // 2. Persist via repository port
    return this.taskRepo.create({
      ...command,
      startDate: dates.startDate?.toISOString(),
      dueDate: dates.dueDate?.toISOString(),
    });
  }
}
```

---

## 🔌 5. Infrastructure Layer & Adapters

The `infrastructure/` layer contains concrete technical implementations of application ports.

```text
src/task/infrastructure/
├── persistence/
│   ├── prisma-task.mapper.ts     # Maps Prisma rows to TaskReadModel
│   └── prisma-task.repository.ts # Implements TaskRepositoryPort
└── storage/
    └── task-file-storage.adapter.ts
```

### 1. Repository Adapter Implementation

```typescript
// src/task/infrastructure/persistence/prisma-task.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { TaskRepositoryPort } from '../../application/ports/task.repository.port';
import { PrismaTaskMapper } from './prisma-task.mapper';

@Injectable()
export class PrismaTaskRepository implements TaskRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, organizationId: string) {
    const raw = await this.prisma.task.findFirst({
      where: { id, organizationId },
      include: { label: true, assignees: { include: { user: true } } },
    });
    return raw ? PrismaTaskMapper.toReadModel(raw) : null;
  }
}
```

### 2. Dependency Injection Token Binding

In the feature module, bind the port token to the infrastructure adapter:

```typescript
// src/task/task.module.ts
import { Module } from '@nestjs/common';
import { TASK_REPOSITORY_PORT } from './application/ports/task.repository.port';
import { PrismaTaskRepository } from './infrastructure/persistence/prisma-task.repository';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { TaskController } from './presentation/task.controller';

@Module({
  controllers: [TaskController],
  providers: [
    CreateTaskUseCase,
    {
      provide: TASK_REPOSITORY_PORT,
      useClass: PrismaTaskRepository,
    },
  ],
  exports: [CreateTaskUseCase],
})
export class TaskModule {}
```

---

## 🌐 6. Presentation & Transport Layer

The `presentation/` layer handles incoming HTTP requests, performs runtime validation, maps payloads to application commands, and formats OpenAPI Swagger documentation.

```text
src/task/presentation/
├── dto/
│   ├── create-task.dto.ts      # Class-validator annotated payloads
│   ├── update-task.dto.ts
│   └── find-all-tasks.dto.ts
└── task.controller.ts          # HTTP Route Handlers
```

### 1. REST Controller Pattern

```typescript
// src/task/presentation/task.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { CreateTaskDto } from './dto/create-task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly createTaskUseCase: CreateTaskUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task successfully created' })
  async create(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.createTaskUseCase.execute({
      ...dto,
      userId: req.user.id,
      organizationId: req.user.activeOrganizationId,
    });
  }
}
```

---

## 🛡️ 7. Security, Auth & Token Lifecycle

Dash Stack employs an enterprise-grade dual-token authentication pattern:

```text
  Client (Frontend)             Auth Controller                  Database
        │                              │                            │
        │  1. POST /auth/login         │                            │
        ├─────────────────────────────►│  2. Verify credentials    │
        │                              ├───────────────────────────►│
        │                              │◄───────────────────────────┤
        │                              │  3. Sign Access JWT (15m)  │
        │                              │  4. Gen Refresh Token (7d) │
        │                              │  5. Store hashed refresh   │
        │                              ├───────────────────────────►│
        │  6. Set HTTP-only Cookies    │                            │
        │     - accessToken (15m)      │                            │
        │     - refreshToken (7d)      │                            │
        │◄─────────────────────────────┤                            │
        │                              │                            │
        │  7. Access Token Expired     │                            │
        │     POST /auth/refresh       │                            │
        ├─────────────────────────────►│  8. Validate & Rotate      │
        │                              ├───────────────────────────►│
        │  9. New Set-Cookie           │◄───────────────────────────┤
        │◄─────────────────────────────┤                            │
```

### Security Hardening Measures

- **HttpOnly & SameSite Cookies**: Tokens stored in protected cookies prevent XSS exfiltration.
- **Helmet HTTP Headers**: Enforces strict `Content-Security-Policy`, `X-Content-Type-Options`, and `HSTS`.
- **Rate Limiting**: NestJS `@nestjs/throttler` guards against brute-force attacks on `/auth/*` routes.
- **Granular RBAC**: Role-based access control (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`) verified via custom guards.

---

## 🧪 8. Testing Strategy & Quality Gates

The backend implements a multi-tier testing strategy ensuring 100% behavioral reliability:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Domain Unit Tests (Pure Jest)                                       │
│    - Verifies Entity invariants, Value Objects, and Policy rules       │
│    - Executes in < 50ms with zero mocks                                │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Application Use Case Tests (Mocked Ports)                           │
│    - Mocks Repository Ports via Jest spy / in-memory fakes             │
│    - Validates execution flow and domain coordination                  │
├────────────────────────────────────────────────────────────────────────┤
│ 3. E2E & Controller Integration Tests                                  │
│    - Runs NestJS TestModule with live test database                    │
│    - Verifies HTTP status codes, Swagger metadata, and Guards          │
└────────────────────────────────────────────────────────────────────────┘
```

### Quality Assurance Verification

Before any code can be committed or merged, the following pipeline executes:

```bash
# 1. Type-check & Build validation
npm run build -w backend

# 2. ESLint 9 Flat Config (0 errors, 0 warnings)
npm run lint -w backend

# 3. Code formatting check
npm run format:check -w backend

# 4. Knip dead code & unused export scanner
npm run knip

# 5. Unit test suite
npm run test -w backend
```
