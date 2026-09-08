import { DeckRepositoryPort } from './deck-repository.port';
import { FlashcardRepositoryPort } from './flashcard-repository.port';
import { VocabProgressRepositoryPort } from './vocab-progress-repository.port';

export interface StudyProgressTransactionContext {
  deckRepository: Pick<DeckRepositoryPort, 'findById'>;
  flashcardRepository: Pick<FlashcardRepositoryPort, 'findByDeckId' | 'findById'>;
  vocabProgressRepository: Pick<
    VocabProgressRepositoryPort,
    'findByUserAndCardIds' | 'findByUserAndCard' | 'save' | 'upsertBatch'
  >;
}

export interface StudyProgressTransactionPort {
  /** The callback may be retried with fresh state; it must not perform external side effects. */
  run<T>(work: (context: StudyProgressTransactionContext) => Promise<T>): Promise<T>;
}
