# ADR-003: Persisted Match Sessions and Best Results

## Status

Accepted. Schema and migration were approved and applied on 2026-09-09 after
empty-database and upgraded-database verification.

## Date

2026-09-09

## Context

Match needs authenticated, server-created sessions instead of accepting a
client-provided duration. Each session belongs to one user and deck, contains
6–12 distinct server-selected cards, and expires exactly 30 minutes after its
stored start time. The leaderboard exposes one best result per user and deck.

The repository uses PostgreSQL, Prisma `DateTime` columns, cuid identifiers,
snake-case table mappings, and incremental timestamped migration directories.
The latest vocabulary integrity migration adds SQL checks alongside Prisma
indexes. Existing migrations must remain unchanged.

Amended after security review: selected cards use `MatchSessionCard` rows with
flashcard foreign keys, stable positions, and nullable `matchedAt`. The client
records each solved pair through
`POST /api/v1/vocab/decks/:deckId/match/sessions/:sessionId/pairs` with only the
session card ID. Completion remains bodyless and is rejected until every
session-card row has a server-recorded match. This replaces the immutable
`selectedCardIds` array described below; that text documents the initial design.
Repeated pair reports are idempotent so a lost HTTP response cannot strand the
game. Deleting a flashcard cascades its session-card row and thereby invalidates
that active session without blocking editor deletion.

The leaderboard is server-authoritative for identity, deck, selected-card
membership, expiry, pair count, one-time completion, and elapsed duration. It is
not presented as bot-proof: as with any browser game, a modified client can
automate valid pair submissions using information rendered to the player.

## Decision

### Proposed schema

Add this model to `backend/prisma/schema.prisma`, with a `matchSessions
MatchSession[]` reverse relation on both `User` and `Deck`:

```prisma
model MatchSession {
  id              String    @id @default(cuid())
  deckId          String
  userId          String
  selectedCardIds String[]
  startedAt       DateTime
  expiresAt       DateTime
  completedAt     DateTime?

  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([deckId])
  @@index([userId])
  @@map("match_sessions")
}
```

For `DeckLeaderboard`, add `@@unique([deckId, userId])` and `@@index([userId])`.
Replace `@@index([deckId, durationMs])` with
`@@index([deckId, durationMs, createdAt, id])`. Preserve its existing fields and
foreign keys. The extra `id ASC` ordering resolves otherwise identical timestamps
without changing the required `durationMs ASC, createdAt ASC` precedence.

`selectedCardIds` is an immutable snapshot, not a live card relation. Card edits
or deletion do not rewrite an already-issued game. Selection checks membership
and uniqueness inside the session-creation transaction. Deck/user deletion
cascades sessions and results through their foreign keys.

`completedAt` is the durable idempotency state. A separate leaderboard reference
is unnecessary: a slower completion still consumes its session, and its elapsed
time remains derivable from `completedAt - startedAt`, while the best-result row
may subsequently improve.

### Migration proposal

Create a new `YYYYMMDDHHMMSS_add_match_sessions` migration. Generate and inspect
the Prisma SQL after schema approval, then include SQL constraints for:

- `selectedCardIds` being non-null with cardinality 6–12 and no null elements;
- `expiresAt = startedAt + interval '30 minutes'`;
- `completedAt IS NULL OR (completedAt >= startedAt AND completedAt < expiresAt)`;
- leaderboard `cardCount <= 12` in addition to its existing minimum and
  non-negative-duration constraints.

Before adding the unique constraint, check for duplicate `(deckId, userId)` rows
and invalid existing results. Abort if found; do not delete or silently rewrite
historical scores. There is no automatic data cleanup in this migration.

The proposed SQL is below. The unique index and additional leaderboard check
fail on incompatible historical rows, rolling back the transaction.

```sql
BEGIN;

CREATE TABLE "match_sessions" (
  "id" TEXT NOT NULL,
  "deckId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "selectedCardIds" TEXT[] NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "match_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "match_sessions_card_count" CHECK (
    cardinality("selectedCardIds") BETWEEN 6 AND 12
    AND array_ndims("selectedCardIds") = 1
    AND array_position("selectedCardIds", NULL) IS NULL
  ),
  CONSTRAINT "match_sessions_expiry" CHECK (
    "expiresAt" = "startedAt" + interval '30 minutes'
  ),
  CONSTRAINT "match_sessions_completion_time" CHECK (
    "completedAt" IS NULL OR
    ("completedAt" >= "startedAt" AND "completedAt" < "expiresAt")
  ),
  CONSTRAINT "match_sessions_deckId_fkey" FOREIGN KEY ("deckId")
    REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "match_sessions_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "match_sessions_deckId_idx" ON "match_sessions"("deckId");
CREATE INDEX "match_sessions_userId_idx" ON "match_sessions"("userId");
CREATE UNIQUE INDEX "deck_leaderboards_deckId_userId_key"
  ON "deck_leaderboards"("deckId", "userId");
CREATE INDEX "deck_leaderboards_userId_idx" ON "deck_leaderboards"("userId");
CREATE INDEX "deck_leaderboards_deckId_durationMs_createdAt_id_idx"
  ON "deck_leaderboards"("deckId", "durationMs", "createdAt", "id");
DROP INDEX "deck_leaderboards_deckId_durationMs_idx";
ALTER TABLE "deck_leaderboards"
  ADD CONSTRAINT "deck_leaderboards_match_card_maximum" CHECK ("cardCount" <= 12);

COMMIT;
```

After approval, verify the forward SQL in isolation and on an upgraded test
database before applying it to the local development database. Do not use reset
or `db push`. Generate the Prisma client after migration/schema validation.

Rollback first disconnects Match endpoints, then restores the old leaderboard
index and removes the new unique/index/check constraints. Dropping
`match_sessions` discards session history and requires explicit approval or a
backup; retaining the unused table is the non-destructive application rollback.

### Application and persistence contracts

- Creation and completion require auth before any repository work and recheck
  `DeckAccessPolicy.STUDY` inside the transaction. Reads use `VIEW`.
- Creation samples at most 12 eligible cards server-side, after optional
  `onlyDue`/`onlyStarred` filtering. Fewer than six fails before persistence.
- An injected clock supplies filter time, session start, and completion time.
  No client score, duration, card IDs, deck/user metadata, or penalty counter is
  accepted by completion. The leaderboard measures server elapsed time.
- Completion reads the session scoped to its ID, deck, and authenticated user,
  rejects expired/consumed sessions, and conditionally claims `completedAt`.
  Zero claimed rows means duplicate completion.
- Claim and best-result update share one serializable transaction. Conflicts
  retry with fresh state, bounded attempts and backoff, following the existing
  progress transaction convention. Exhaustion is an explicit conflict.
- Update the unique best-result row only for a shorter duration, or an earlier
  timestamp at equal duration. Exact ties retain the existing row.
- Leaderboard reads use shared `paginate()` and `OrderDirection`, with user
  display fields fetched as part of the query. `currentUserBest` is returned
  independently of the requested page; guests receive `null`.

### HTTP contracts to connect

| Operation                                                             | Input                             | Output                                                              |
| --------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `POST /api/v1/vocab/decks/:deckId/match/sessions`                     | Optional `onlyDue`, `onlyStarred` | `id`, `deckId`, `startedAt`, `expiresAt`, selected `cards`          |
| `POST /api/v1/vocab/decks/:deckId/match/sessions/:sessionId/complete` | No score/body fields              | `sessionId`, `durationMs`, `cardCount`, `completedAt`, `bestResult` |
| `GET /api/v1/vocab/decks/:deckId/leaderboard`                         | `page`, `perPage`                 | `data`, shared pagination `meta`, `currentUserBest`                 |

Errors follow the existing domain-exception translation: unauthenticated writes
are 401; invalid/undersized selections are 400; deck access denial is 403;
missing decks and missing/cross-user/cross-deck sessions are 404; expired and
duplicate completions are 409. Presentation must reject extraneous completion
fields and add JWT guards and rate limiting.

## Alternatives Considered

- Client-provided duration cannot establish a trusted score and is rejected.
- Signed session metadata alone cannot enforce one completion without durable
  consumption state.
- Storing every attempt in the leaderboard makes best-per-user pagination more
  complex. Session completion timestamps retain attempt timing while a unique
  leaderboard row supports simple indexed reads.

## Consequences

Database integration tests must prove rollback, concurrent completion, concurrent
best-result updates, ordering/ties, and pagination. Unit tests prove domain and
application behavior but cannot establish those database guarantees.

The server controls elapsed time and session integrity. This protocol does not
prove that a client actually solved the puzzle: that would require server-side
move validation and a different API contract.
