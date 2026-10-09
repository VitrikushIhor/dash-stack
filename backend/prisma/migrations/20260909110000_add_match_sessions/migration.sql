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
