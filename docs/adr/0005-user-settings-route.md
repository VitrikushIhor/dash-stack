# ADR-0005: One user settings route

- Status: Accepted
- Date: 2026-09-29
- Scope: Frontend account settings navigation

## Context

Dashboard and Vocabulary rendered separate account settings shells and profile/account pages. User settings belong to the authenticated user and must be available without organization membership.

## Decision

Use `/user/settings` and its `sessions`, `accounts`, `appearance`, `notifications`, and `display` subroutes as the canonical settings section. A dedicated route layout checks authentication and renders the shared settings navigation independently of the dashboard organization guard. Profile data is loaded on the server. Existing settings forms remain in their feature slices. Session listing, pagination, URL confirmation, and revocation live in `features/manage-sessions`, with dedicated server query and API contracts. Connected provider listing and linking UI live in `features/manage-connected-accounts`, using a dedicated server query and API client. The OAuth confirmation flow remains in the existing BFF routes. Shared cookie persistence and cross-tab authentication events live in Shared; neither settings feature imports `auth`.

Dashboard and Vocabulary navigation link directly to the canonical routes. OAuth linking returns to `/user/settings/accounts`. The previous `/settings/*` and `/vocab/settings/*` routes are removed; no legacy redirect pages remain.

## Consequences

Account settings UI has one route implementation. The section uses its own settings shell with the shared Vocabulary header. Navigation targets `/user/settings` directly without the dashboard organization guard. Session list loading and pagination run on the server using the page query parameter. The URL confirmation dialog and revocation handler remain client components; successful revocation refreshes the server list.

## Session activity

Authenticated requests update the existing `AuthSession.lastUsedAt` after session and user validation, at most once every five minutes. The database update checks ownership, expiry, revocation, and the previous activity timestamp atomically, preventing redundant writes from concurrent requests. The sessions DTO exposes `lastUsedAt`; the current session shows Active now, while other sessions show the stored timestamp. This is approximate authenticated-request activity, not a record of individual user interactions. No database migration is required.

Password login forwards the browser User-Agent from the Next.js server action, and OAuth login forwards it from the callback request. The backend validates the header length and control characters before passing it to session creation. Missing or invalid metadata does not prevent authentication; sessions created before this change retain their existing browser metadata.

Session listing uses the existing repository `paginate()` helper and `PaginatedResult` contract (`data` and `meta`), with 20 sessions per page. Metadata counts only the authenticated user's active sessions. The frontend reads page totals and navigation from metadata; the earlier `items`/`hasNextPage` response is replaced.
