# Active session management

Scope: authenticated users list their own unexpired, non-revoked sessions, identify the current session, and revoke a selected session after confirmation. Both dashboard and vocabulary settings expose the UI. A session represents a login, not a physical device. Unknown browser metadata is shown honestly; no IP/geolocation collection is added.

Contract: GET /auth/sessions?page=1 returns up to 20 records plus hasNextPage. Records contain id, createdAt, expiresAt, userAgent and isCurrent only. DELETE /auth/sessions/:id is user-scoped and idempotent for owned records. Current-session revocation clears local cookies/cache and synchronizes sign-out across tabs only after server confirmation. Revoking another session preserves the current login. Errors remain visible and retryable.

Implementation: dedicated session-management application port/use-case, Prisma adapter and guarded controller; frontend schema/API, server action, query/mutation hooks, settings UI and routes. Existing auth session persistence is reused without schema changes or dependencies.

Validation: PostgreSQL isolation/expiry/revocation/pagination tests; component loading/error/confirmation tests; Chromium two-context revocation flow. Run corepack pnpm --filter backend run test:integration, corepack pnpm --filter backend exec jest --runInBand, corepack pnpm --filter frontend test, both type-check and lint commands, frontend lint:fsd.

## Local verification (2026-09-28)

Implemented at `/settings/sessions` and `/vocab/settings/sessions`. Existing sessions without user-agent metadata display “Browser details unavailable”; this increment does not collect device names, IP addresses, geolocation or last-activity timestamps. Signed-in and expiry dates distinguish sessions. Revocation affects subsequent authenticated requests; it does not erase an already-rendered page on a remote device.

PASS: frontend 177 files / 805 tests, backend 137 suites / 892 tests, PostgreSQL 19 suites / 117 tests, both typechecks and lints, FSD, diff whitespace. Frontend lint retains 3 existing warnings outside this feature. New focused frontend coverage: 11 tests. Chromium two-context flow passed: guest list → 401, invalid page → 400, cancel confirmation, revoke B from A → B 401 and A 200, current session revoke → cleared cookies/sign-in. Desktop and 390px screenshots inspected. No deployment or schema migration performed.

Review: list and revoke are scoped by authenticated userId; current-session flag comes from verified JWT claims; responses select no credential/hash/IP fields and use no-store. Only a pre-handler 401 triggers one mutation retry after recovery; server/network failures remain visible without optimistic sign-out. Separate management port avoids exposing credentials through the list contract.
