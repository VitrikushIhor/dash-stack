# Vocabulary & SRS — Phase 10 Release Evidence

> **Status:** In progress; not release-closed
> **Evidence date:** 2026-09-19
> **Branch:** `feature/vocab-srs-system`
> **Baseline commit:** `1b12a2a`

## Scope and evidence rules

Phase 10 closes integration, browser E2E, migration/seed, CI, build, and release
verification gaps without adding Practice Test or rewriting completed study
modes. Unit/jsdom, database integration, HTTP integration, browser E2E, local
builds, and GitHub Actions are reported separately. A local pass is not evidence
that the corresponding CI job passed.

## Coverage matrix

| Required flow | Existing automated coverage | Level | Phase 10 addition or missing assertion | Current result |
|---|---|---|---|---|
| Deck lifecycle and access matrix | `vocab-lifecycle.integration.test.ts`, `vocab-http-flows.integration.test.ts` | DB + HTTP integration | Catalog visibility and owner/non-owner/private/draft/archived access matrix | Passed locally in the integration run |
| Atomic editor save/delete/reorder and rollback | `vocab-lifecycle.integration.test.ts` | DB integration | Invalid editor snapshot rollback and exact reorder permutation | Passed locally in the integration run |
| Public catalog → Deck study | `vocabulary-critical-flows.spec.ts` | Browser E2E | Guest opens catalog deck and starts Flashcards | Passed locally in Chromium |
| Public/unlisted Deck → Fork → edit | `vocab-lifecycle.integration.test.ts`, `vocabulary-critical-flows.spec.ts` | DB integration + browser E2E | Authenticated public-deck fork and independent edit; unlisted remains covered below browser level | Public browser flow passed locally; unlisted browser path remains unverified |
| Flashcards → progress → due counter | `vocab-progress.integration.test.ts`, `vocab-http-flows.integration.test.ts` | DB + HTTP integration | Due card moves through progress and out of due count | Passed locally in the integration run |
| Adaptive Learn completion and resume | existing Learn unit/component tests and `vocab-progress.integration.test.ts` | Unit/jsdom + DB integration | Idempotent attempts and retry persistence are covered; full browser resume is missing | Automated lower-level coverage passed previously; browser flow unverified |
| Match completion → leaderboard | `match.integration.test.ts`, `match-http.integration.test.ts` | DB + HTTP integration | Server-authoritative completion, expiry, one completion, best result, minimum-card guard | Passed locally in the integration run |
| Star → starred-only study | `vocab-progress.integration.test.ts`, `vocab-http-flows.integration.test.ts`, `vocabulary-critical-flows.spec.ts` | DB + HTTP integration + browser E2E | Desired-state PUT and deep-scroll star/unstar without scroll reset | Passed locally in the integration and isolated Chromium runs |
| Import → edit → export → re-import | `import-export-http.integration.test.ts`, import/export unit/component tests, `vocabulary-critical-flows.spec.ts` | HTTP integration + unit/jsdom + browser E2E | JSON v1 content/order, formula-safe CSV, 2000/2001 boundary, and browser CSV→JSON download→JSON re-import | Passed locally in the integration and isolated Chromium runs |
| Seed idempotency and destructive-reset guard | `seed-safety.integration.test.ts`, reset guard in `vocab-lifecycle.integration.test.ts` | DB integration | Repeated normal seed preserves user data; reset refuses protected environments | Passed locally against an isolated database |

## Validation evidence

The Phase 10 working tree added a dedicated integration command and a real
Chromium suite:

```bash
pnpm --filter backend run test:integration
pnpm --filter frontend run test:e2e
```

- Backend database/HTTP integration: **7 suites, 63 tests passed locally**.
- Browser E2E: **3 tests passed locally in Chromium** against an isolated
  PostgreSQL 16 database and dedicated frontend/backend ports (`3102`/`8102`):
  - guest catalog → public deck → Flashcards;
  - authenticated public deck → fork → edit private copy.
  - owner 1000-row CSV import → reload → JSON download/content check → JSON
    file re-import → reload, including deep-scroll card 1000 star/unstar.
- Manual Chrome smoke against a disposable PostgreSQL 16 database previously confirmed
  guest catalog → public deck → Flashcards and the Space/Arrow keyboard path.
  Owner Chrome smoke was not asserted because the shared profile contained stale
  localhost cookies from another database; the isolated owner flow is covered by
  the clean Playwright context above.
- Backend Jest: **97 suites, 660 tests passed locally**.
- Frontend Vitest: **139 files, 605 tests passed locally**.
- Frontend coverage command: **139 files, 605 tests passed locally**, with
  65.24% statements, 54.61% branches, 56.78% functions, and 66.59% lines.
- Backend/frontend type-check, backend lint, frontend FSD lint, backend/frontend
  Prettier checks, frontend Knip, and `git diff --check`: **exit 0**.
- Frontend lint: **exit 0 with 4 pre-existing warnings** in virtualizer, image
  upload, Kanban, and deck-board code. Backend Knip reports only the retained
  `Tenant` and `TenantMembership` decorators.
- `pnpm audit --audit-level=moderate`: **exit 0; no known vulnerabilities**
  after the approved pinned dependency/security update.
- A clean detached worktree completed `pnpm install --frozen-lockfile` plus both
  production builds successfully. The frozen install initially exposed a
  `tar` override mismatch between `package.json` and `pnpm-lock.yaml`; restoring
  the approved `tar: 7.5.21` override made the install reproducible.
- Backend and frontend production builds: **exit 0**. The frontend build emits
  the same four lint warnings and defaults to `http://localhost:8000` when
  `API_URL` is not supplied; deployment must provide its production API URL.
- CI uses Node.js 22 and pnpm 10.34.5. The workflow provisions isolated
  PostgreSQL, applies migrations, runs integration tests, installs Chromium,
  seeds isolated E2E data, starts the applications through Playwright, and
  uploads failure artifacts.

Exact full-suite, lint, type-check, format, Knip, and production-build results
must be refreshed after the complete Phase 10 diff is finalized. A remote
GitHub Actions run has not yet been observed.

## Database, migrations, and seed

- Vocabulary migrations include the base vocabulary schema, integrity
  hardening, trusted Match sessions, study-attempt receipts, and
  `20260916120000_add_vocab_import_receipts`.
- CI applies committed migrations to an empty isolated PostgreSQL database
  before integration and browser tests.
- Automated integration coverage verifies normal seed idempotency, preservation
  of pre-existing user data, and destructive-reset refusal for production,
  staging, and preview environments.
- Upgrade verification used an isolated database at the state immediately before
  `20260916120000_add_vocab_import_receipts`, with an existing user, deck, and
  flashcard. Applying that migration created `vocab_import_receipts` and kept
  the existing deck/card intact.
- No committed migration was edited and no new schema migration is introduced
  by Phase 10.

## Deployment and rollback notes

1. Back up the production database and verify that the backup can be restored.
2. Deploy the backend migration job and run `prisma migrate deploy` before
   enabling the new application version.
3. Deploy the backend, then the frontend, and verify health/readiness plus the
   guest and authenticated Vocabulary smoke flows.
4. Keep the previous application artifacts available for application rollback.

The import-receipt migration is additive. Application rollback may use the
previous backend/frontend artifacts, but applied data migrations are not
automatically reversed. Preserve the receipt table unless a separately reviewed
forward-fix or restore procedure proves removal is safe. Do not claim automatic
data rollback without a tested restore.

Compatibility notes:

- The legacy star-toggle POST remains available; the UI uses idempotent PUT with
  `{ "isStarred": boolean }`.
- JSON export uses the versioned v1 object contract rather than an unversioned
  card array.
- CSV formula protection can add a leading apostrophe. JSON v1 is the lossless
  card-content interchange format.

## Remaining release blockers and unverified evidence

- No successful remote GitHub Actions run has been captured for this diff.
- Browser coverage is critical but intentionally minimal; Learn resume, Match,
  unlisted fork, keyboard/focus/history, mobile
  viewport, and reduced-motion browser flows remain unverified in automation.
- The 1000-card browser exercise and deep-scroll star/unstar timing passed.
  The 4 MiB real frontend transport boundary remains unverified; the 2000 and
  2001-card boundaries are covered by HTTP integration.
- Actual TTS audio and a physical touch device remain unverified.
- Trello was not changed and its current status is unverified.

There is no evidence of an unresolved P0/P1 defect in the completed automated
runs, but Phase 10 remains **in progress** until the blocking CI run, final
builds, migration upgrade evidence, and agreed release QA are complete.

## QA records

Automated integration and browser suites use isolated disposable data. The
user's existing large QA deck, seeded decks, and user decks were not deleted.
An earlier local E2E configuration incorrectly reused already-running local
servers and created the uniquely named fork `Phase 10 browser fork
1789828997783` (`cmu8hyzzi0001rm8z0f4b1ulw`) in the local user database. It was
identified read-only and then removed after the user's explicit approval. The
runner now always starts dedicated servers and uses isolated
database ports, preventing a repeat.
