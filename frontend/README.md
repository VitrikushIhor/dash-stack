<div align="center">

# ⚡ Dash Stack Frontend

**Production-Grade, Enterprise Next.js 15 Application with Feature-Sliced Design (FSD)**

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Architecture: FSD](https://img.shields.io/badge/Architecture-FSD_v2.1-orange?style=for-the-badge&logo=buffer&logoColor=white)](https://feature-sliced.design/)
[![Vitest](https://img.shields.io/badge/Tests-75%20passed%20%7C%20327%20tests-green?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-9.37_Flat_Config-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)

<p align="center">
  A scalable, type-safe full-stack frontend architecture featuring multi-tenant workspace management, real-time optimistic task boards, role-based access control (RBAC), and full bidirectional (LTR/RTL) design support.
</p>

[Architecture Guide](./ARCHITECTURE.md) • [Getting Started](#-getting-started) • [Tech Stack](#-technology-stack) • [Scripts](#-developer-scripts) • [Quality Gates](#-quality-gates--ci)

</div>

---

## 🌟 Enterprise Highlights

- **🏢 Multi-Tenant Workspace Architecture**: Seamless active organization switching, team invitation flows, and role-based permissions (Owner, Admin, Member).
- **📋 Advanced Task & Kanban Suite**: Drag-and-drop Kanban board (`@dnd-kit`), filterable data tables (`@tanstack/react-table`), labels management, and bulk batch operations.
- **🌐 Universal Bidirectional Layout (LTR / RTL)**: Built-in support for RTL scripts (Arabic, Hebrew) and dynamic theme switching (Dark, Light, System) via persistent cookies.
- **⚡ Server-First Architecture**: Next.js 15 Server Actions guarded by `createAction` and `createOrgAction` with runtime Zod validation and HttpOnly session cookies.
- **🔗 Type-Safe URL State**: URL search parameter synchronization powered by `nuqs` for bookmarkable, shareable views and filter states.
- **🛡️ Zero-Trust Security**: Enterprise HTTP security headers (HSTS, CSP, X-Frame-Options, nosniff), automated FSD boundary enforcement, and health monitoring probes (`/api/health`).

---

## 🚀 Technology Stack

| Domain                  | Technology                                                                                                           | Description                                                              |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| **Core Framework**      | [Next.js 15 (App Router)](https://nextjs.org/)                                                                       | Hybrid SSR/SSG, Server Components, Server Actions, Standalone output     |
| **UI Library**          | [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)                                     | Modern React with Server Actions, compiler optimizations, strict types   |
| **Design System**       | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)                                    | Radix UI primitives, design tokens, responsive typography                |
| **Architecture**        | [Feature-Sliced Design](https://feature-sliced.design/) + [Steiger](https://github.com/feature-sliced/steiger)       | Strict 6-layer modular architecture with automated boundary linter       |
| **Server State**        | [TanStack Query v5](https://tanstack.com/query)                                                                      | Asynchronous cache, optimistic updates, background revalidation          |
| **Client & Form State** | [Zustand](https://zustand-demo.pmnd.rs/) + [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Transient state, uncontrolled high-performance forms, schema validation  |
| **Data Tables & DND**   | [TanStack Table v8](https://tanstack.com/table) + [@dnd-kit](https://dndkit.com/)                                    | Virtualized tables, column sorting/filtering, accessible drag-and-drop   |
| **Testing Suite**       | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)                                      | Fast unit/integration test runner with jsdom and code coverage           |
| **Quality Tooling**     | [ESLint 9](https://eslint.org/) + [Prettier](https://prettier.io/) + [Knip](https://knip.dev/)                       | Flat config, import sorting, Tailwind class sorting, dead-code detection |

---

## 📁 Architecture Overview

> 📖 **Deep Dive**: For full diagrams, data flow lifecycles, and import rules, refer to the **[Architecture Guide (ARCHITECTURE.md)](./ARCHITECTURE.md)**.

```
frontend/src/
├── app/          # Next.js App Router (pages, root layouts, proxy handlers, middleware)
├── views/        # Page-level compositions connecting widgets and features to routes
├── widgets/      # Autonomous, composite UI blocks (Header, Sidebar, TasksTable, TaskBoard)
├── features/     # User interactions & use cases (Auth, ManageTask, ManageLabel, InviteMember)
├── entities/     # Domain business logic & models (User, Organization, Task, Label)
└── shared/       # Reusable UI primitives (ui/core/*), API client, providers, test utilities
```

### 📐 Public API & Import Golden Rules

1. **Unidirectional Flow**: `app` ➔ `views` ➔ `widgets` ➔ `features` ➔ `entities` ➔ `shared`.
2. **Explicit Named Exports**: Wildcard exports (`export *`) are strictly banned and enforced via ESLint.
3. **Optimized Tree-Shaking**: UI core components are imported directly from `@/shared/ui/core/<component>` to prevent Radix bundle bloat.
4. **Server Isolation**: Server-only queries and action builders reside in `*.server.ts` and are exposed via `@/.../server`.

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher (or pnpm/yarn)
- **Docker** (Optional, for containerized local runs)

### 1. Installation

```bash
# Clone the repository and navigate to frontend (or monorepo root)
cd frontend

# Install exact dependencies
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure backend endpoints:

```bash
cp .env.example .env
```

| Variable                | Description                          | Default                     |
| :---------------------- | :----------------------------------- | :-------------------------- |
| `NEXT_PUBLIC_API_URL`   | Backend REST API base URL            | `http://localhost:8000/api` |
| `NEXT_PUBLIC_APP_URL`   | Frontend application URL             | `http://localhost:3000`     |
| `AWS_CLOUDFRONT_DOMAIN` | CDN domain for uploaded media assets | Optional                    |

### 3. Development Server

Start the development server with Next.js Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📜 Developer Scripts

| Command                 | Description                                     | Purpose                        |
| :---------------------- | :---------------------------------------------- | :----------------------------- |
| `npm run dev`           | Start development server with Turbopack         | Local rapid development        |
| `npm run build`         | Build standalone production bundle              | Production artifact creation   |
| `npm run start`         | Run production Next.js standalone server        | Production runtime             |
| `npm run validate`      | **Run full CI validation suite**                | **Pre-push verification**      |
| `npm run lint`          | Execute ESLint CLI check                        | Code style & rule verification |
| `npm run lint:fix`      | Automatically fix ESLint violations             | Auto-remediation               |
| `npm run lint:fsd`      | Run Steiger architectural linter                | FSD layer boundary check       |
| `npm run type-check`    | Run strict TypeScript compiler (`tsc --noEmit`) | Type safety check              |
| `npm run format`        | Format codebase via Prettier                    | Code formatting                |
| `npm run format:check`  | Check code formatting compliance                | CI formatting gate             |
| `npm run test`          | Run Vitest unit & integration test suite        | Quality assurance              |
| `npm run test:watch`    | Run Vitest in interactive watch mode            | Test-driven development        |
| `npm run test:coverage` | Generate code coverage report                   | Coverage analysis              |
| `npm run knip`          | Scan for unused files, exports & dependencies   | Dead code elimination          |

---

## 🧪 Quality Gates & CI

Before any code is merged into `dev` or `main`, it must pass the unified validation command:

```bash
npm run validate
```

This single command runs all quality gates in sequence:
$$\text{TypeScript Check} \longrightarrow \text{ESLint 9} \longrightarrow \text{Steiger FSD} \longrightarrow \text{Prettier} \longrightarrow \text{Vitest Suite (327 tests)}$$

---

## 🐳 Production Deployment & Docker

The project uses Next.js standalone output (`output: 'standalone'`) for ultra-lightweight Docker images:

### 1. Build Standalone Locally

```bash
npm run build
```

### 2. Build & Run with Docker

```bash
# Build Docker image
docker build -t dash-stack-frontend .

# Run container with port forwarding
docker run -p 3000:3000 --env-file ../.env dash-stack-frontend
```

### 3. Container Healthcheck Probe

The application exposes a native healthcheck endpoint for load balancers and container orchestrators:

```bash
curl -f http://localhost:3000/api/health
# Response: {"status":"ok","timestamp":"2026-08-16T17:00:00.000Z","uptime":120.4}
```

---

## 🤝 Contributing & Code Standards

1. **Branching**: Create feature branches from `dev` (`feature/<scope>-<description>`, `fix/<scope>-<description>`).
2. **Commit Convention**: Strictly follow Conventional Commits (`feat(task): ...`, `fix(auth): ...`, `refactor(frontend): ...`).
3. **FSD Compliance**: Slices must remain autonomous. Run `npm run lint:fsd` before committing.
4. **Pull Requests**: Ensure `npm run validate` passes with 0 errors and 0 warnings before opening a PR.

---

<div align="center">
  <sub>Built with ❤️ for scalable, enterprise-grade web development.</sub>
</div>
