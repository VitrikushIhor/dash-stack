CREATE TABLE "vocab_import_receipts" (
    "userId" TEXT NOT NULL,
    "importId" VARCHAR(100) NOT NULL,
    "deckId" TEXT NOT NULL,
    "payloadHash" VARCHAR(64) NOT NULL,
    "cardIds" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vocab_import_receipts_pkey" PRIMARY KEY ("userId", "importId")
);

CREATE INDEX "vocab_import_receipts_deckId_idx" ON "vocab_import_receipts"("deckId");

ALTER TABLE "vocab_import_receipts" ADD CONSTRAINT "vocab_import_receipts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vocab_import_receipts" ADD CONSTRAINT "vocab_import_receipts_deckId_fkey"
    FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
