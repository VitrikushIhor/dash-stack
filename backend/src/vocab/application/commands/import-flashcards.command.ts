import { ImportedFlashcardInput } from '../ports/deck-import-transaction.port';

export interface ImportFlashcardsCommand {
  deckId: string;
  userId: string;
  importId: string;
  cards: ImportedFlashcardInput[];
}
