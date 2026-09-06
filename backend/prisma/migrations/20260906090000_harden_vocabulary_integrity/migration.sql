-- Preserve the domain invariants if data is written outside the application layer.
ALTER TABLE "flashcards"
  ADD CONSTRAINT "flashcards_position_non_negative"
  CHECK ("position" >= 0);

ALTER TABLE "vocab_progress"
  ADD CONSTRAINT "vocab_progress_box_range"
  CHECK ("box" BETWEEN 1 AND 5),
  ADD CONSTRAINT "vocab_progress_correct_streak_non_negative"
  CHECK ("correctStreak" >= 0),
  ADD CONSTRAINT "vocab_progress_correct_count_non_negative"
  CHECK ("correctCount" >= 0),
  ADD CONSTRAINT "vocab_progress_incorrect_count_non_negative"
  CHECK ("incorrectCount" >= 0);

ALTER TABLE "deck_leaderboards"
  ADD CONSTRAINT "deck_leaderboards_duration_non_negative"
  CHECK ("durationMs" >= 0),
  ADD CONSTRAINT "deck_leaderboards_match_card_minimum"
  CHECK ("cardCount" >= 6);

CREATE INDEX "vocab_progress_userId_deckId_nextReviewAt_idx"
  ON "vocab_progress"("userId", "deckId", "nextReviewAt");
