<div align="center">

# ⚡ Dash Stack

**Modern Full-Stack Monorepo: Next.js 15 App Router Frontend + NestJS 11 Clean Architecture Backend**

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![CI](https://img.shields.io/github/actions/workflow/status/VitrikushIhor/dash-stack/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/VitrikushIhor/dash-stack/actions/workflows/ci.yml)

<p align="center">
  A production-ready full-stack monorepo featuring multi-tenant workspace management, real-time optimistic task & Kanban boards, dual-token JWT authentication with refresh rotation, pluggable S3/Local storage, and universal bidirectional (LTR/RTL) design.
</p>

[Quick Start](#-quick-start) • [Architecture Overview](#-architecture-overview) • [Workspaces](#-workspaces) • [Monorepo Scripts](#-monorepo-scripts) • [Docker Orchestration](#-docker-orchestration) • [Quality Gates](#-quality-gates--ci)

</div>

---

## 🌟 Core Platform Features

- **🏢 Multi-Tenant Workspace System**: Seamless organization creation, active workspace switching, member invitations, and role-based permissions (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
- **📋 Advanced Task & Kanban Suite**: Drag-and-drop Kanban board (`@dnd-kit`), filterable data tables (`@tanstack/react-table`), labels management, checklists, and bulk operations.
- **🔐 Secure Dual-Token Authentication**: JWT Access + Refresh rotation with HttpOnly cookies, OAuth2 social login (Google, GitHub, Auth0), and email verification workflows.
- **🌐 Universal Bidirectional Layout (LTR / RTL)**: Built-in support for RTL scripts (Arabic, Hebrew) and dynamic theme switching (Dark, Light, System) via persistent cookies.
- **📁 Pluggable Media Storage**: High-performance image transcoding with Sharp (WebP conversion) and interchangeable AWS S3 and Local filesystem storage adapters.
- **⚡ Server-First Full-Stack Model**: Next.js 15 Server Actions with runtime Zod validation proxying to a decoupled, hexagonal NestJS REST API.
- **📖 Auto-Generated OpenAPI Docs**: Interactive Swagger documentation generated via `@nestjs/swagger` at `/api/docs`.

---

## 🏛️ Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DASH STACK MONOREPO                               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌─────────────────────────────┐                         ┌─────────────────────┐
│   FRONTEND (Next.js 15)     │                         │  BACKEND (NestJS 11)│
│  - Feature-Sliced Design    │      Proxy / REST       │  - Clean Architecture│
│  - React 19 + Server Actions│◄───────────────────────►│  - Hexagonal Ports  │
│  - Tailwind CSS v4 + Radix  │                         │  - Prisma 7 + Postgres│
│  - TanStack Query v5        │                         │  - S3 / Local Storage│
└─────────────────────────────┘                         └─────────────────────┘
```

### Monorepo Dependency Flow

```text
  User Browser                Next.js 15 Frontend             NestJS 11 Backend
       │                               │                               │
       │  1. HTTP Request              │                               │
       ├──────────────────────────────►│  2. SSR / Server Action       │
       │                               ├──────────────────────────────►│  3. Business Use Case
       │                               │   (via Cookie Proxy / Secret) │     - Domain Policy Check
       │                               │                               │     - Prisma Repository
       │                               │◄──────────────────────────────┤
       │  4. Rendered HTML / State     │                               │
       │◄──────────────────────────────┤                               │
```

---

## 📦 Workspaces

The monorepo is managed via **pnpm Workspaces** across two dedicated services:

| Workspace | Architecture | Guide & Documentation | Description |
| :--- | :--- | :--- | :--- |
| **`frontend`** | Feature-Sliced Design (FSD v2.1) | [Frontend README](./frontend/README.md) • [Architecture Guide](./frontend/ARCHITECTURE.md) | Next.js 15 App Router, React 19, Server Components, Zustand, TanStack Query |
| **`backend`** | Clean & Hexagonal Architecture | [Backend README](./backend/README.md) • [Architecture Guide](./backend/ARCHITECTURE.md) | NestJS 11, Prisma 7, PostgreSQL, Passport JWT, AWS S3 / Local storage, Swagger |

---

## 🏁 Quick Start

### Prerequisites

- **Node.js**: `v20.x` or `v22.x`
- **pnpm**: `v10.34.5+` (enable via `corepack enable`)
- **Docker & Docker Compose**: For local PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/VitrikushIhor/dash-stack.git
cd dash-stack
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the environment templates for each service:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` and `frontend/.env` with your actual credentials.

### 4. Start PostgreSQL Database

```bash
pnpm run docker:dev
```

Or run standalone PostgreSQL:

```bash
docker compose -f docker-compose.dev.yml up postgres -d
```

### 5. Apply Database Migrations & Seed

```bash
# Run Prisma migrations
pnpm --filter backend exec prisma migrate dev

# Seed database with demo accounts and tasks
pnpm --filter backend run seed
```

### 6. Start Development Servers

```bash
# In separate terminals (or concurrently):
pnpm run dev:frontend   # http://localhost:3000
pnpm run dev:backend    # http://localhost:8000
```

* **Frontend Application**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:8000/api](http://localhost:8000/api)
* **Swagger OpenAPI Docs**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
* **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 📜 Monorepo Scripts

### Development & Build

| Command | Description |
| :--- | :--- |
| `pnpm run dev:frontend` | Start Next.js frontend development server with Turbopack |
| `pnpm run dev:backend` | Start NestJS backend development server with SWC hot-reload |
| `pnpm run build:frontend` | Build Next.js production standalone bundle |
| `pnpm run build:backend` | Build NestJS production bundle via Nest CLI & SWC |

### Testing & Quality Assurance

| Command | Description |
| :--- | :--- |
| `pnpm --filter frontend run test` | Run all 75 Vitest frontend test suites (327 tests) |
| `pnpm --filter backend run test` | Run all 51 Jest backend test suites (284 tests) |
| `pnpm run lint` | Run ESLint 9 Flat Config across both frontend and backend |
| `pnpm run lint:frontend` | Run frontend ESLint checks |
| `pnpm run lint:backend` | Run backend ESLint checks |
| `pnpm --filter frontend run lint:fsd` | Run Steiger FSD architectural linter on frontend |
| `pnpm run format:frontend` | Format frontend files via Prettier |
| `pnpm run format:backend` | Format backend files via Prettier |
| `pnpm run knip` | Scan monorepo for unused exports, types, and dependencies |

---

## 🐳 Docker Orchestration

### Development Environment (with Hot-Reload)

```bash
# Starts PostgreSQL, Backend (hot-reload), and Frontend (hot-reload)
pnpm run docker:dev:build
```

### Production Environment

```bash
# Builds optimized Next.js Standalone and NestJS production containers
pnpm run docker:up:build
```

| Service | Port | Endpoint |
| :--- | :--- | :--- |
| **Frontend** | `3000` | [http://localhost:3000](http://localhost:3000) |
| **Backend** | `8000` | [http://localhost:8000/api](http://localhost:8000/api) |
| **PostgreSQL** | `5432` | `localhost:5432` |

---

## 🛡️ Quality Gates & CI

Dash Stack enforces multi-tier quality assurance gates to guarantee zero regressions:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Git Pre-Commit Hook (Husky + lint-staged)                           │
│    - Runs ESLint 9 --fix on staged files                               │
│    - Formats code with Prettier                                        │
├────────────────────────────────────────────────────────────────────────┤
│ 2. FSD Boundary Check (Steiger)                                        │
│    - Prevents cross-slice and lower-to-higher layer import violations  │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Automated Test Suites (Vitest + Jest)                               │
│    - 126 test suites (611 total unit and integration tests)            │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Knip Dead-Code Scanner                                              │
│    - Guarantees 0 unused files, 0 dead exports, 0 orphaned dependencies│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 👤 Author

**Vitrikush Ihor**

- GitHub: [@VitrikushIhor](https://github.com/VitrikushIhor)
