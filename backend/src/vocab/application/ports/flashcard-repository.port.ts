import { Flashcard } from '../../domain/entities/flashcard.entity';

export interface FlashcardRepositoryPort {
  save(flashcard: Flashcard): Promise<Flashcard>;
  saveMany(flashcards: Flashcard[]): Promise<Flashcard[]>;
  findById(id: string): Promise<Flashcard | null>;
  findByDeckId(deckId: string): Promise<Flashcard[]>;
  getMaxPositionByDeckId(deckId: string): Promise<number>;
  updatePositions(deckId: string, orderedCardIds: string[]): Promise<void>;
  delete(id: string): Promise<void>;
}
