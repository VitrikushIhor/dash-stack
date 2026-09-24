ALTER TABLE "match_session_cards" DROP CONSTRAINT "match_session_cards_flashcardId_fkey";
ALTER TABLE "match_session_cards" ADD CONSTRAINT "match_session_cards_flashcardId_fkey"
  FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
