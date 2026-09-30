# ADR-0001: Server-side auth sessions with a stable browser credential

- Status: Accepted
- Date: 2026-09-24
- Scope: authentication session lifecycle, refresh concurrency, logout and access-token revocation

## Context

The current browser session uses a rotating refresh token. Two requests can read the same cookie, both receive `401`, and race to rotate it. A process-local promise can merge requests handled by one Next.js process, but it cannot coordinate multiple processes, tabs, restarts, or delayed `Set-Cookie` responses.

Keeping browser-side rotation would require a distributed replay protocol and a way to prevent an older HTTP response from overwriting a newer cookie. A short grace window alone does not solve delayed response ordering. Persisting a raw successor token to make retries idempotent would also conflict with the requirement to store bearer credentials only as hashes.

## Decision

Use a stable, random, opaque browser session credential backed by an `AuthSession` record in PostgreSQL.

- Store only a cryptographic hash of the credential. The raw value exists only in the HttpOnly cookie and the response that creates the session.
- Keep the browser credential stable for the lifetime of the session. Refresh issues a new short-lived access JWT but returns the same browser credential.
- Put `sessionId` and `tokenUse: access` in every access JWT. Sign with HS256 and fixed issuer `dash-stack-auth` and audience `dash-stack-api`; the strategy requires these claims, signature, `iat` and `exp`, then checks that the session exists, belongs to the user, is not revoked, and is not expired.
- Make logout, logout-all, password reset, and administrative revocation update the same session authority. A previously issued access JWT stops working after revocation.
- Refresh of a stable credential never creates a successor session. Revocation is authoritative at the session lookup on every protected request, so a refresh response racing with logout cannot revive access. Legacy-token exchange conditionally consumes the token and creates its replacement session in one database transaction.
- Apply an absolute session expiry. Sliding renewal, if later required, must be a separate decision with a maximum lifetime.
- Treat authentication outcomes as `authenticated`, `unauthenticated`, or `unavailable`. Only an invalid, expired, or revoked credential is `unauthenticated`; database/network/5xx failures are `unavailable` and preserve cookies.
- Keep the Next.js per-credential single-flight coordinator as a load optimization. Correctness must not depend on it.

The frontend remains the cookie owner. The backend accepts the opaque credential at the refresh/logout boundary and never returns it from ordinary protected endpoints. Login, signup verification, and OAuth exchange return it only to the trusted Next.js server boundary, which strips credentials from browser-visible action payloads.

## Security properties

- Parallel refreshes across tabs and Next.js instances are idempotent because they use the same session credential and do not rotate browser state.
- Delayed responses cannot roll the browser back to an older generation.
- A database dump does not contain a directly usable session credential.
- Revocation applies to refresh and already-issued access tokens through the session check.
- A stolen session credential remains usable until revocation or absolute expiry, as with a conventional server session. Short absolute lifetime, secure cookie settings, CSRF controls, credential rotation on privilege-sensitive events, and session management UI limit that risk.

## Migration and rollout

The project has no existing users requiring legacy refresh-token compatibility (confirmed 2026-09-28). Authentication accepts only `AuthSession` credentials. Unknown credentials are rejected; logout and password reset revoke sessions without consulting the old `RefreshToken` table.

Migration `20260928000100_remove_legacy_refresh_tokens` drops the unused table. Existing migration history remains unchanged. Deploy the session-only code and this migration together; no legacy credential exchange is supported.

Access JWTs must satisfy the issuer/audience/tokenUse contract and reference an active session.

### Rollback

Before reverting to a version that queries `RefreshToken`, restore the empty table using the `CREATE TABLE`, indexes and foreign key from `20260125093335_init/migration.sql`, plus its expiry index from `20260926200000_index_auth_credential_retention/migration.sql`, in a new forward migration. Dropped token rows cannot be recovered without a backup; the table is unused under the stated pre-release assumption. Reverting this code does not require revoking `AuthSession` credentials.

## Consequences

Every authenticated request adds a session-authority lookup unless a bounded cache is introduced. Any cache must have an explicit revocation consistency target and invalidation mechanism. PostgreSQL availability becomes part of protected-request availability, which must surface as an unavailable response rather than a false `401`.

This decision adds an incremental schema migration and changes JWT claims and auth transport contracts. It avoids a distributed rotation coordinator and makes the behavior testable with two backend and two Next.js instances.
