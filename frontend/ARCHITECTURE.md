# Frontend Architecture Guide — Dash Stack

This document outlines the architectural principles, design patterns, and engineering standards for the **Dash Stack** frontend application. It serves as the single source of truth for technical decision-making, onboarding, and architectural consistency.

---

## 📑 Table of Contents

1. [Architectural Tenets](#-1-architectural-tenets)
2. [Layer Decomposition (FSD v2.1)](#-2-layer-decomposition-fsd-v21)
3. [Public API Contracts & Import Standards](#-3-public-api-contracts--import-standards)
4. [Server & Client Boundary Architecture](#-4-server--client-boundary-architecture)
5. [State Management & Data Synchronization Model](#-5-state-management--data-synchronization-model)
6. [Security & Production Hardening](#-6-security--production-hardening)
7. [Testing Strategy & Quality Gates](#-7-testing-strategy--quality-gates)
8. [Automated CI/CD Quality Pipeline](#-8-automated-cicd-quality-pipeline)

---

## 🏛️ 1. Architectural Tenets

Our frontend architecture is governed by five core tenets:

1. **Unidirectional Dependency Flow**: Code on higher layers can only import from strictly lower layers. Lower layers must have zero awareness of higher layers.
2. **Server-First Mindset**: Leverage Next.js 15 App Router and React Server Components for data fetching and layout composition. Client components (`'use client'`) are strictly reserved for interactive leaves.
3. **Explicit Contracts Over Magic**: All re-exports must be explicitly named. Wildcard exports (`export *`) are forbidden to ensure bulletproof tree-shaking, predictable contracts, and zero leakage of internal utilities.
4. **Strong Runtime & Compile-Time Safety**: Every boundary (API requests, URL search params, forms, environment variables) is validated at runtime via **Zod** and synchronized with **TypeScript** static types.
5. **Automated Architectural Enforcement**: Architecture rules are enforced through automated linters (**Steiger**, **ESLint Flat Config**, **TypeScript Strict Mode**), ensuring violations fail in CI before code can be merged.

---

## 🧱 2. Layer Decomposition (FSD v2.1)

The application adopts the **Feature-Sliced Design (FSD)** methodology, customized for the Next.js 15 App Router:

```text
src/
├── app/          # Layer 6: App Router Root (routes, layouts, providers, middleware)
├── views/        # Layer 5: Page-level compositions (assemblies for App Router)
├── widgets/      # Layer 4: Self-contained UI blocks (headers, sidebars, tables, boards)
├── features/     # Layer 3: User-driven use cases & interactions (auth, manage-task, invite)
├── entities/     # Layer 2: Business domain entities (user, organization, task, label)
└── shared/       # Layer 1: Infrastructure, UI primitives, API client, configs, utilities
```

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │  Layer 6: app/        (Routes, Root Layout, Route Handlers, Middleware)│
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │  imports from ▼
  ┌───────────────────────────────────▼────────────────────────────────────┐
  │  Layer 5: views/      (Page Assemblies: task-kanban-page, sign-in)     │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │  imports from ▼
  ┌───────────────────────────────────▼────────────────────────────────────┐
  │  Layer 4: widgets/    (Composite Blocks: Header, Sidebar, TasksTable)  │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │  imports from ▼
  ┌───────────────────────────────────▼────────────────────────────────────┐
  │  Layer 3: features/   (Use Cases: auth, manage-task, manage-label)     │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │  imports from ▼
  ┌───────────────────────────────────▼────────────────────────────────────┐
  │  Layer 2: entities/   (Domain Models: user, organization, task, label) │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │  imports from ▼
  ┌───────────────────────────────────▼────────────────────────────────────┐
  │  Layer 1: shared/     (UI Core, API Client, Libs, Providers, Configs)  │
  └────────────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Allowed Dependencies | Examples |
| :--- | :--- | :--- | :--- |
| **`app/`** | Next.js App Router entry points, root layouts, middleware, proxy handlers, error boundaries | `views`, `widgets`, `features`, `entities`, `shared` | `src/app/(dashboard)/tasks/page.tsx`, `src/middleware.ts` |
| **`views/`** | Page-level compositions that connect widgets and features to App Router pages | `widgets`, `features`, `entities`, `shared` | `src/views/task/ui/task-kanban-page.tsx`, `src/views/auth/` |
| **`widgets/`** | Autonomous, composite UI blocks combining features and entities | `features`, `entities`, `shared` | `tasks-table`, `task-board`, `app-sidebar`, `team-switcher` |
| **`features/`** | User interactions providing concrete business value (use cases) | `entities`, `shared` | `manage-task`, `auth`, `manage-label`, `update-profile` |
| **`entities/`** | Core business domain models, entity-specific UI cards, selectors, and queries | `shared` | `entities/task`, `entities/organization`, `entities/user` |
| **`shared/`** | Reusable UI design system (`ui/core/*`), API clients, utility functions, providers, domain types | None (Layer 1) | `shared/ui/core/button`, `shared/api`, `shared/lib` |

---

## 🔒 3. Public API Contracts & Import Standards

### 1. Explicit Named Exports Rule
To guarantee tree-shaking, predictable code completion, and clean isolation:
* **NEVER use wildcard exports** (`export * from './module'`).
* **ALWAYS use explicit named exports** (`export { foo, type Bar } from './module'`).
* This rule is enforced automatically by ESLint:
  ```js
  'no-restricted-syntax': [
    'error',
    {
      selector: 'ExportAllDeclaration',
      message: 'Wildcard exports (`export * from ...`) are forbidden. Use explicit named exports instead.',
    },
  ],
  ```

### 2. Public API Entry Points (`index.ts` & `server.ts`)
* Every slice on `entities`, `features`, and `widgets` exposes a public API via `index.ts`.
* Server-only code is exposed strictly via `server.ts` (e.g. `@/entities/organization/server`).
* Direct cross-slice imports into internal folders (e.g. `@/features/auth/ui/internal-helper`) are forbidden by Steiger.

### 3. Tree-Shaking Exception for `@/shared/ui/core/*`
* To prevent Next.js bundle bloat when using shadcn/Radix components, `src/shared/ui/core/` intentionally omits a giant barrel file `index.ts`.
* Components must be imported directly from their respective paths:
  ```tsx
  // ✅ Correct (Optimal tree-shaking)
  import { Button } from '@/shared/ui/core/button'
  import { Dialog } from '@/shared/ui/core/dialog'

  // ❌ Forbidden (Causes bundling of all Radix primitives)
  import { Button, Dialog } from '@/shared/ui/core'
  ```

---

## ⚡ 4. Server & Client Boundary Architecture

```text
  User Browser                Next.js Server                   Backend API
       │                            │                               │
       │  1. Navigates to /tasks    │                               │
       ├───────────────────────────►│  2. serverApi.get('/tasks')   │
       │                            ├──────────────────────────────►│
       │                            │◄──────────────────────────────┤
       │  3. SSR HTML + Hydration   │                               │
       │◄───────────────────────────┤                               │
       │                            │                               │
       │  4. Submit Form Action     │                               │
       ├───────────────────────────►│  5. Zod Schema Validation    │
       │                            │  6. Session Cookie Guard      │
       │                            │  7. proxyApi.post('/tasks')   │
       │                            ├──────────────────────────────►│
       │                            │◄──────────────────────────────┤
       │  8. Action Result          │                               │
       │◄───────────────────────────┤                               │
       ▼ (Optimistic Cache Update)  ▼                               ▼
```

### 1. Server-Only Isolation
* Any file performing server-side database access, API calls with secrets, or cookie operations is marked with `import 'server-only'` or named `*.server.ts`.
* Next.js bundling ensures server code is never shipped to the client bundle.

### 2. Type-Safe Action Builders
All Server Actions are constructed through robust builder patterns:
* **`createAction`**: Validates input schema via Zod and extracts authentication context from session cookies.
* **`createOrgAction`**: Extends `createAction` by verifying organization membership and user role permissions before executing domain logic.

---

## 🔄 5. State Management & Data Synchronization Model

We apply the **Separation of State Concerns** principle:

```text
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │                          STATE MANAGEMENT ARCHITECTURE                          │
  ├───────────────────┬───────────────────┬───────────────────┬─────────────────────┤
  │     URL State     │   Server Cache    │   Client State    │     Form State      │
  │      (nuqs)       │ (TanStack Query)  │     (Zustand)     │     (RHF + Zod)     │
  ├───────────────────┼───────────────────┼───────────────────┼─────────────────────┤
  │ • Search query    │ • Tasks list/item │ • Sidebar toggle  │ • Input values      │
  │ • Active filters  │ • Organizations   │ • Modal open/close│ • Field validation  │
  │ • Page number     │ • User profile    │ • Command menu    │ • Error messages    │
  │ • View (table/kan)│ • Background sync │ • Transient UI    │ • Submission status │
  └───────────────────┴───────────────────┴───────────────────┴─────────────────────┘
```

1. **URL State (`nuqs`)**:
   * Single source of truth for all query parameters (filters, pagination, sort, layout view).
   * Ensures shareable, bookmarkable, and reload-proof UI state.
2. **Server Cache State (`TanStack Query v5`)**:
   * Handles asynchronous caching, background revalidation, and optimistic updates.
3. **Client Transient State (`Zustand`)**:
   * Used strictly for local, non-persistent UI state (e.g. sidebar expand/collapse, command palette open state).
4. **Form State (`React Hook Form` + `Zod`)**:
   * Uncontrolled inputs with high-performance re-rendering and strict schema validation.

---

## 🛡️ 6. Security & Production Hardening

* **Security Headers**: Standard enterprise headers configured in [next.config.ts](file:///Users/ihor/Desktop/dash-stack/frontend/next.config.ts):
  * `Strict-Transport-Security` (`max-age=63072000; includeSubDomains; preload`)
  * `X-Frame-Options: SAMEORIGIN` (Clickjacking defense)
  * `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
  * `Referrer-Policy: origin-when-cross-origin`
  * `Permissions-Policy: camera=(), microphone=(), geolocation=()`
* **Cookie Protection**: Authentication tokens (`access_token`, `refresh_token`) use `HttpOnly`, `Secure`, and `SameSite=Lax` cookies.
* **Health Probes**: Liveness/readiness probe available at `/api/health` for Docker / Kubernetes container orchestrators.
* **Middleware Route Protection**: Centralized route authentication guards in [src/middleware.ts](file:///Users/ihor/Desktop/dash-stack/frontend/src/middleware.ts).

---

## 🧪 7. Testing Strategy & Quality Gates

The test suite is built on **Vitest** + **React Testing Library** + **jsdom**:

```text
Unit & Action Tests       ➔  Pure business logic, schemas, action builders, utilities
Component & Hook Tests    ➔  Form submissions, custom hooks, user event interactions
Widget Integration Tests  ➔  Composite tables, kanban drag-and-drop, switcher UI
```

### Running Tests:
```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 🚀 8. Automated CI/CD Quality Pipeline

Every pull request and push to `dev`/`main` must pass the 6-step automated validation gate:

```text
  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
  │  1. TypeScript  │────►│  2. ESLint 9    │────►│  3. Steiger FSD │
  │ (tsc --noEmit)  │     │   (eslint .)    │     │ (steiger ./src) │
  └─────────────────┘     └─────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
  │  6. Standalone  │◄────│  5. Vitest Suite│◄────│  4. Prettier    │
  │  (next build)   │     │ (327 tests pass)│     │(prettier --check│
  └─────────────────┘     └─────────────────┘     └─────────────────┘
```

To run the entire pipeline locally before pushing:
```bash
npm run validate
```
