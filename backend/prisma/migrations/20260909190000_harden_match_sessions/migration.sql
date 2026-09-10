BEGIN;

CREATE TABLE "match_session_cards" (
  "sessionId" TEXT NOT NULL,
  "flashcardId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "matchedAt" TIMESTAMP(3),
  CONSTRAINT "match_session_cards_pkey" PRIMARY KEY ("sessionId", "flashcardId"),
  CONSTRAINT "match_session_cards_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "match_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "match_session_cards_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "match_session_cards_sessionId_position_key" ON "match_session_cards"("sessionId", "position");
CREATE INDEX "match_session_cards_flashcardId_idx" ON "match_session_cards"("flashcardId");
INSERT INTO "match_session_cards" ("sessionId", "flashcardId", "position")
SELECT s.id, card.id, card.ordinality - 1
FROM "match_sessions" s CROSS JOIN LATERAL unnest(s."selectedCardIds") WITH ORDINALITY AS card(id, ordinality)
JOIN "flashcards" f ON f.id = card.id AND f."deckId" = s."deckId";
DELETE FROM "match_sessions" s WHERE (SELECT count(*) FROM "match_session_cards" c WHERE c."sessionId" = s.id) NOT BETWEEN 6 AND 12;
ALTER TABLE "match_sessions" DROP COLUMN "selectedCardIds";
CREATE INDEX "match_sessions_expiresAt_idx" ON "match_sessions"("expiresAt");

COMMIT;
