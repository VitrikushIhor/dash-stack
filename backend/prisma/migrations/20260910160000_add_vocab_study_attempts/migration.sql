CREATE TABLE "vocab_study_attempts" (
    "userId" TEXT NOT NULL,
    "attemptId" VARCHAR(100) NOT NULL,
    "deckId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vocab_study_attempts_pkey" PRIMARY KEY ("userId", "attemptId")
);

CREATE INDEX "vocab_study_attempts_deckId_idx" ON "vocab_study_attempts"("deckId");
CREATE INDEX "vocab_study_attempts_flashcardId_idx" ON "vocab_study_attempts"("flashcardId");

ALTER TABLE "vocab_study_attempts" ADD CONSTRAINT "vocab_study_attempts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vocab_study_attempts" ADD CONSTRAINT "vocab_study_attempts_deckId_fkey"
    FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vocab_study_attempts" ADD CONSTRAINT "vocab_study_attempts_flashcardId_fkey"
    FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
