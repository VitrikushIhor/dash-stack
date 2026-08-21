<div align="center">

# ⚡ Dash Stack Backend

**Production-Grade NestJS REST API with Clean & Hexagonal Architecture, Prisma 7, and PostgreSQL**

[![NestJS](https://img.shields.io/badge/NestJS-11.1-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Hexagonal_%2F_Clean-4CAF50?style=for-the-badge&logo=buffer&logoColor=white)](./ARCHITECTURE.md)
[![Jest](https://img.shields.io/badge/Tests-51%20suites%20%7C%20284%20passed-green?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![ESLint](https://img.shields.io/badge/ESLint-9.37_Flat_Config-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)

<p align="center">
  A robust, decoupled backend architecture featuring multi-tenant workspace isolation, dual-token JWT authentication with refresh rotation, AWS S3 / Local storage providers, and OpenAPI Swagger documentation.
</p>

[Architecture Guide](./ARCHITECTURE.md) • [Getting Started](#-getting-started) • [Tech Stack](#-technology-stack) • [Scripts](#-developer-scripts) • [Quality Gates](#-quality-gates--ci)

</div>

---

## 🌟 Key Highlights

- **🏛️ Clean & Hexagonal Architecture**: Strict 4-layer isolation (`domain`, `application`, `infrastructure`, `presentation`) ensuring business rules have zero dependency on databases or transport frameworks.
- **🔐 Dual-Token Authentication**: Secure JWT Access + Refresh rotation with HttpOnly cookies, email verification tokens, and OAuth2 social login (Google, GitHub, Auth0).
- **🏢 Multi-Tenant Organization Isolation**: Granular role-based access control (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`) and organization membership guards.
- **📁 Pluggable Storage Engine**: Seamless file and image uploads powered by `Sharp` (WebP optimization) with interchangeable AWS S3 and Local file storage adapters.
- **📊 Real-time Task & Label Engine**: Comprehensive CRUD, batch operations, pagination, checklist support, and date-range validation.
- **📖 Auto-Generated OpenAPI**: Interactive Swagger documentation generated via `@nestjs/swagger` at `/api/docs`.

---

## 🚀 Technology Stack

| Domain               | Technology                                                                                                                            | Description                                                      |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------- |
| **Framework**        | [NestJS 11](https://nestjs.com/)                                                                                                      | Modular enterprise Node.js framework with Dependency Injection   |
| **Database & ORM**   | [PostgreSQL 15](https://www.postgresql.org/) + [Prisma 7](https://www.prisma.io/)                                                     | Type-safe ORM with connection pooling via `@prisma/adapter-pg`   |
| **Authentication**   | [Passport.js](http://www.passportjs.org/) + `@nestjs/jwt`                                                                             | JWT Access/Refresh tokens with bcrypt password hashing           |
| **Validation**       | [class-validator](https://github.com/typestack/class-validator) + [class-transformer](https://github.com/typestack/class-transformer) | Declarative decorator-based DTO validation and transformations   |
| **Media Processing** | [Sharp](https://sharp.pixelplumbing.com/) + [@aws-sdk/client-s3](https://aws.amazon.com/sdk-for-javascript/)                          | High-performance image transcoding (WebP) and AWS S3 integration |
| **Testing Suite**    | [Jest 29](https://jestjs.io/) + [ts-jest](https://kulshekhar.github.io/ts-jest/)                                                      | Unit testing for domain policies, value objects, and use cases   |
| **Compiler & Tools** | [SWC](https://swc.rs/) + [ESLint 9](https://eslint.org/) + [Prettier](https://prettier.io/)                                           | Lightning-fast TypeScript compilation and flat config linting    |

---

## 📁 Architecture Overview

> 📖 **Deep Dive**: For complete domain models, data flow diagrams, and port/adapter contracts, see **[Architecture Guide (ARCHITECTURE.md)](./ARCHITECTURE.md)**.

```text
backend/src/
├── auth/           # Authentication, JWT rotation, OAuth2, password reset
├── common/         # Cross-cutting filters, guards, pagination, decorators
├── health/         # System health check probe (/api/health)
├── invitation/     # Organization member invitation workflows
├── label/          # Task categorization & color labeling
├── organization/   # Multi-tenant workspace management & memberships
├── storage/        # Pluggable image & file upload providers (S3 / Local)
├── task/           # Task management, checklists, bulk actions, filters
└── user/           # User profile management and read models
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x`
- **Docker & Docker Compose**: For local PostgreSQL database
- **npm**: `v10+`

### 1. Installation

```bash
# From monorepo root
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

Key environment variables:

| Variable             | Description                   | Default                                                   |
| :------------------- | :---------------------------- | :-------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection URL     | `postgresql://prisma:topsecret@localhost:5432/dash_stack` |
| `PORT`               | API Server Port               | `8000`                                                    |
| `JWT_ACCESS_SECRET`  | Secret key for access tokens  | `your_access_secret`                                      |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | `your_refresh_secret`                                     |
| `STORAGE_PROVIDER`   | Active storage provider       | `local` (or `s3`)                                         |
| `FRONTEND_URL`       | Allowed CORS origin           | `http://localhost:3000`                                   |

### 3. Start Database & Run Migrations

```bash
# Start PostgreSQL via Docker
npm run docker:db -w backend

# Apply Prisma migrations
npx prisma migrate dev --workspace=backend

# Seed database (optional)
npm run seed -w backend
```

### 4. Run Development Server

```bash
npm run dev -w backend
```

- **API Base URL**: [http://localhost:8000/api](http://localhost:8000/api)
- **Swagger OpenAPI Docs**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 📜 Developer Scripts

| Command                           | Description                                             |
| :-------------------------------- | :------------------------------------------------------ |
| `npm run dev -w backend`          | Start NestJS development server with SWC and hot-reload |
| `npm run build -w backend`        | Build production bundle via Nest CLI & SWC              |
| `npm run start:prod -w backend`   | Run compiled production server (`dist/main.js`)         |
| `npm run test -w backend`         | Run all 51 Jest unit test suites (284 tests)            |
| `npm run test:cov -w backend`     | Run tests with coverage reports                         |
| `npm run lint -w backend`         | Run ESLint 9 Flat Config                                |
| `npm run format -w backend`       | Format all source files via Prettier                    |
| `npm run format:check -w backend` | Verify code formatting compliance                       |

---

## 🐳 Docker Deployment

### Run Complete Development Stack

```bash
# Run backend and PostgreSQL with hot-reload
./backend/run.sh
```

### Run Monorepo Production Stack

```bash
# From monorepo root: runs PostgreSQL, NestJS Backend, and Next.js Frontend
docker compose up --build -d
```
