# ADR-0004: Shared PostgreSQL counters for auth throttling

- Status: Accepted
- Date: 2026-09-26
- Scope: Nest auth endpoint abuse limits across instances

## Context

A process-local `@nestjs/throttler` store resets on restart and gives each Nest instance a separate allowance. Per-account and per-credential trackers avoid charging all browser users to the Next.js BFF socket address, but distinct credentials can bypass those limits. `X-Forwarded-For` is client-controllable unless an ingress is configured to overwrite it, so Nest must not treat it as an authenticated client identity.

## Decision

Persist short-lived throttle counters in PostgreSQL using an atomic `INSERT ... ON CONFLICT ... DO UPDATE`, keyed by Nest's route/tracker digest. Each auth endpoint uses its existing account/credential limit and an additional 1200 requests/minute aggregate circuit breaker. The latter protects against high-volume distinct credentials, but is deliberately a coarse availability bound, not a per-client policy. The whole `AuthController` is guarded, including logout and the disabled legacy OAuth exchange endpoint. Storage errors fail closed: Nest does not silently switch to a fresh process-local quota.

`auth_rate_limits` has an expiry index and is included in the bounded auth cleanup command. A full cleanup pass can delete up to 1000 expired throttle rows, separately from the 100-row credential batches; schedule the command every minute and alert on backlog. The migration creates an additive table and can be reversed by dropping that table after the code has stopped using it.

## Consequences and production boundary

Two independent PostgreSQL connections share the same exact counter under parallel requests, and a Nest HTTP test confirms 429 across distinct email values despite varying `X-Forwarded-For`. PostgreSQL becomes a dependency for login abuse protection, consistent with its existing role as session authority. The fixed-window counter permits a boundary burst; the per-endpoint aggregate cap can also temporarily reject legitimate users during a large attack.

A production ingress still needs a client-aware limit using a trustworthy address after stripping incoming forwarded headers. Do not deploy a multi-instance service with a process-local fallback, and do not claim distributed-client resistance from the aggregate cap alone. Verify the actual proxy topology and limits during stage 10 acceptance.
