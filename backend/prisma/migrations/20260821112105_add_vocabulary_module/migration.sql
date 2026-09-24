-- CreateEnum
CREATE TYPE "DeckVisibility" AS ENUM ('PRIVATE', 'UNLISTED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "DeckStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DeckType" AS ENUM ('USER_GENERATED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CEFRLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "VocabProgressStatus" AS ENUM ('NEW', 'LEARNING', 'KNOWN', 'MASTERED', 'FORGOTTEN');

-- CreateTable
CREATE TABLE "decks" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "level" "CEFRLevel",
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visibility" "DeckVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "DeckStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "DeckType" NOT NULL DEFAULT 'USER_GENERATED',
    "forkedFromDeckId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "example" TEXT,
    "imageUrl" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocab_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "status" "VocabProgressStatus" NOT NULL DEFAULT 'NEW',
    "box" INTEGER NOT NULL DEFAULT 1,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "correctStreak" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocab_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_leaderboards" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "cardCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deck_leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "decks_slug_key" ON "decks"("slug");

-- CreateIndex
CREATE INDEX "decks_ownerUserId_idx" ON "decks"("ownerUserId");

-- CreateIndex
CREATE INDEX "decks_visibility_status_idx" ON "decks"("visibility", "status");

-- CreateIndex
CREATE INDEX "flashcards_deckId_position_idx" ON "flashcards"("deckId", "position");

-- CreateIndex
CREATE INDEX "vocab_progress_userId_nextReviewAt_idx" ON "vocab_progress"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "vocab_progress_deckId_idx" ON "vocab_progress"("deckId");

-- CreateIndex
CREATE UNIQUE INDEX "vocab_progress_userId_deckId_flashcardId_key" ON "vocab_progress"("userId", "deckId", "flashcardId");

-- CreateIndex
CREATE INDEX "deck_leaderboards_deckId_durationMs_idx" ON "deck_leaderboards"("deckId", "durationMs");

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_forkedFromDeckId_fkey" FOREIGN KEY ("forkedFromDeckId") REFERENCES "decks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_progress" ADD CONSTRAINT "vocab_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_progress" ADD CONSTRAINT "vocab_progress_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocab_progress" ADD CONSTRAINT "vocab_progress_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_leaderboards" ADD CONSTRAINT "deck_leaderboards_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_leaderboards" ADD CONSTRAINT "deck_leaderboards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
