CREATE TABLE "deck_editor_receipts" (
    "userId" TEXT NOT NULL,
    "operationId" UUID NOT NULL,
    "deckId" TEXT NOT NULL,
    "payloadHash" VARCHAR(64) NOT NULL,
    "resultUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deck_editor_receipts_pkey" PRIMARY KEY ("userId", "operationId")
);

CREATE INDEX "deck_editor_receipts_deckId_idx" ON "deck_editor_receipts"("deckId");

ALTER TABLE "deck_editor_receipts" ADD CONSTRAINT "deck_editor_receipts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deck_editor_receipts" ADD CONSTRAINT "deck_editor_receipts_deckId_fkey"
    FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
