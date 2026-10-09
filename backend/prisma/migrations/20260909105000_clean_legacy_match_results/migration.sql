BEGIN;

DELETE FROM "deck_leaderboards" WHERE "cardCount" > 12;

DELETE FROM "deck_leaderboards" loser
USING "deck_leaderboards" winner
WHERE loser."deckId" = winner."deckId"
  AND loser."userId" = winner."userId"
  AND (loser."durationMs", loser."createdAt", loser.id) >
      (winner."durationMs", winner."createdAt", winner.id);

COMMIT;
