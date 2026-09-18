import { Deck } from '../../domain/entities/deck.entity';
import { Flashcard } from '../../domain/entities/flashcard.entity';

export interface ImportedFlashcardInput {
  term: string;
  definition: string;
  example?: string | null;
  imageUrl?: string | null;
}

export interface VocabImportReceipt {
  userId: string;
  importId: string;
  deckId: string;
  payloadHash: string;
  cardIds: string[];
}

export interface DeckImportTransactionContext {
  deckRepository: {
    findByIdForUpdate(deckId: string): Promise<Deck | null>;
  };
  receiptRepository: {
    findByUserAndImportId(userId: string, importId: string): Promise<VocabImportReceipt | null>;
    save(receipt: VocabImportReceipt): Promise<void>;
  };
  flashcardRepository: {
    append(deckId: string, cards: ImportedFlashcardInput[]): Promise<Flashcard[]>;
  };
}

export interface DeckImportTransactionPort {
  run<T>(work: (context: DeckImportTransactionContext) => Promise<T>): Promise<T>;
}
