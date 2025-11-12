## Quick guide for AI coding agents

This repository is a Vite + React + TypeScript frontend following Feature-Sliced Design (FSD). Keep the guidance short and actionable so you can be productive immediately.

- Primary scripts (use exact commands):
  - dev: `npm run dev` (Vite on port 3000)
  - build: `npm run build` (runs `tsc -b` then `vite build`)
  - type check: `npm run type-check` (runs `tsc --noEmit`)
  - lint: `npm run lint` and `npm run lint:fix`
  - format: `npm run format` / `npm run format:check`

- High-level architecture
  - Feature-Sliced Design. Main top-level folders:
    - `src/app/` — providers, routing initialization, global styles
    - `src/pages/` — route-level pages (compositions)
    - `src/widgets/` — reusable page fragments composed from features
    - `src/features/` — use-case-level logic and UI
    - `src/entities/` — business entities & domain models
    - `src/shared/` — UI kit, utilities, config and small libs

- Important patterns and conventions to follow
  - Layering: upper layers may import from lower layers only (e.g. `pages/` -> `widgets/` -> `features/` -> `entities/` -> `shared/`). Avoid circular dependencies.
  - Barrel exports: expose public APIs via `index.ts` files in directories (e.g. `shared/ui/components/index.ts`). When adding reusable components, add them to `shared/ui/components` and export from the barrel.
  - State: stores are commonly colocated in `feature` or `entity` subfolders under `model/` and typically use Zustand. Look for `*.store` or `*-store.ts` naming patterns.
  - Forms: use `react-hook-form` + `zod`. Validation schemas are usually in `model/` directories (see `features/*/model/*`).
  - Routing: TanStack Router is used. Routes are assembled under `src/routeTree.gen.ts` and pages in `src/pages/`.
  - UI: TailwindCSS + Radix + shadcn components. Global styles are in `src/app/styles/*.css`.

- Where to look for real examples
  - Auth flows: `src/features/auth/` and pages under `src/pages/auth/` show form wiring and store usage.
  - Team feature: `src/features/team/` and `src/pages/team/` show entity modeling and component composition.
  - App shell & providers: `src/app/` (look in `context/` and `config/` for providers like theme, fonts, layout, direction).

- Common change tasks & examples
  - Add a shared component
    1. Create `src/shared/ui/components/<my-component>/index.tsx` and CSS or Tailwind classes.
    2. Export from `src/shared/ui/components/index.ts` (barrel) so other layers import `shared/ui/components`.
    3. Follow existing classnames / tailwind patterns used in `shared/ui/components`.

  - Add a route page
    1. Create page under `src/pages/<area>/` and wire it in `src/routeTree.gen.ts` using the existing route patterns.
    2. Keep page composition thin — use widgets and features for behavior/UI.

- Build / debug tips
  - Start dev server: `npm run dev` (hot reload via Vite).
  - If you change types or want a full type check: `npm run type-check`.
  - Lint and formatting are enforced by Husky + lint-staged on commits; run `npm run lint` and `npm run format` locally when editing.

- Tests
  - There is no test framework present in the repository. Do not assume test runners exist; add CI/tests only after confirming preferred test framework.

- Integration & external dependencies
  - API base URL is configured via env: `VITE_API_URL` in `.env`.
  - Data fetching uses TanStack Query; async services live in features or shared libs (search for `useQuery` or `react-query` usage).

- Do NOT change without confirmation
  - Global layout and providers in `src/app/` — changing these affects the entire app.
  - Route generation (`src/routeTree.gen.ts`) — follow existing patterns when updating routes.

If any of these sections need more project-specific info (for example, CI commands, deployed preview URLs, or backend auth details), tell me what you want included and I will iterate.


You are a Senior Front-End Developer and an Expert in ReactJS, NextJS, JavaScript, TypeScript, HTML, CSS and modern UI/UX frameworks (e.g., TailwindCSS, Shadcn, Radix). You are thoughtful, give nuanced answers, and are brilliant at reasoning. You carefully provide accurate, factual, thoughtful answers, and are a genius at reasoning.

- Follow the user’s requirements carefully & to the letter.
- First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail.
- Confirm, then write code!
- Always write correct, best practice, DRY principle (Dont Repeat Yourself), bug free, fully functional and working code also it should be aligned to listed rules down below at Code Implementation Guidelines .
- Focus on easy and readability code, over being performant.
- Fully implement all requested functionality.
- Leave NO todo’s, placeholders or missing pieces.
- Ensure code is complete! Verify thoroughly finalised.
- Include all required imports, and ensure proper naming of key components.
- Be concise Minimize any other prose.
- If you think there might not be a correct answer, you say so.
- If you do not know the answer, say so, instead of guessing.

### Coding Environment
The user asks questions about the following coding languages:
- ReactJS
- NextJS
- JavaScript
- TypeScript
- TailwindCSS
- HTML
- CSS

### Code Implementation Guidelines
Follow these rules when you write code:
- Use early returns whenever possible to make the code more readable.
- Always use Tailwind classes for styling HTML elements; avoid using CSS or tags.
- Use template literals or utility functions (like clsx/cn) for conditional className values.
- Use descriptive variable and function/const names. Also, event functions should be named with a “handle” prefix, like “handleClick” for onClick and “handleKeyDown” for onKeyDown.
- Implement accessibility features on elements. For example, interactive elements should have tabIndex="0", aria-label, onClick, and onKeyDown handlers where appropriate.
- Use consts instead of functions, for example, “const toggle = () =>”. Also, define a type if possible.


# Agents Project Rules — Feature-Sliced Design

## Directory Schema (top→down import order)
- app/       : App shell (providers, routing, init, styles). Imports: widgets↓
- pages/     : Route-level compositions. One slice per page.
- widgets/   : Page fragments composed from features/entities.
- features/  : User-visible interactions (use cases).
- entities/  : Business entities (User, Todo, Product).
- shared/    : UI kit, libs, utils, config; business-agnostic. No slices.

## Slice & Segment Rules
- Slices exist ONLY under: pages/, widgets/, features/, entities/.
- Slice names are business terms (e.g., todos, auth, profile, filter).
- Allowed segments inside a slice:
  - ui/     : React components of this slice
  - model/  : state, domain logic, query keys, stores
  - lib/    : pure helpers for this slice
  - api/    : slice-scoped client(s) & DTO mapping (optional)
  - config/ : slice-scoped constants (optional)
  - types/  : local TS types (optional)
- shared/ and app/ are segmented directly (no slices). Typical folders:
  - shared/ui, shared/lib, shared/api, shared/config, shared/styles, shared/types
  - app/providers, app/routes, app/styles, app/index.tsx

## Import Boundaries
- Direction: app → pages → widgets → features → entities → shared
- A module may only import from its layer or LOWER layers.
- Cross-slice imports inside the SAME layer must go through the slice **public API**:
  - Import only from `../<layer>/<slice>` root (barrel), never deep files.
- Forbidden:
  - Importing from higher layers.
  - Reaching into another slice’s internal files (e.g., `features/a/model/…`).
  - UI importing model from a HIGHER layer.

## Public API (Barrels)
- Every slice exports from `<layer>/<slice>/index.ts` only the items meant for reuse:
  - UI entry points (components)
  - Hooks from model/ (e.g., useToggleTodo)
  - Contracts/types needed by consumers
- Consumers import: `import { TodoList } from '@/widgets/todos'`
- No deep imports like: `@/widgets/todos/ui/TodoList`

## Naming Conventions
- React components: PascalCase files (`TodoList.tsx`), default export discouraged.
- Hooks: `useXxx.ts` in `model/` if stateful, in `lib/` if pure UI-agnostic.
- Tests/Stories colocated: `*.test.ts(x)` and `*.stories.tsx` beside the file.
- Feature actions/events: verb-first (`toggleTodo`, `createTodo`).

## State & Data-Fetching
- Place domain state/query logic in `model/` of the owning slice.
- shared/api may host base clients; slice `api/` adapts to domain DTOs.
- UI components receive data via props/hooks from their slice model.

## UI Composition Rules
- pages compose widgets and features; avoid direct entity/shared use unless trivial.
- widgets compose features/entities for reuse across multiple pages.
- features encapsulate a single user interaction; can render entities and shared UI.


## Styling & Assets
- Keep slice-specific styles inside the slice.
- shared/styles contains global tokens/themes only.
- No global CSS leakage from slice folders.

## Path Aliases (tsconfig)
- Use aliases to reflect layers: @app/*, @pages/*, @widgets/*, @features/*, @entities/*, @shared/*
- Cursor: Prefer alias imports over relative deep paths.

## PR Review Checklist (Cursor & humans)
- Does the change respect layer direction?
- Are new modules placed in the correct slice and segment?
- Is the slice’s public API minimal and sufficient?
- No deep imports across slices/layers.
- Tests/stories colocated and passing.
- Added/updated barrel exports as needed.

## Tooling (Recommended)
- Enforce structure with:
  - feature-sliced/eslint-config (layer/slice rules via existing plugins)
  - feature-sliced/steiger (structure linter & VSCode extension)
- If new to FSD, run Steiger on CI and add a pre-commit hook.
