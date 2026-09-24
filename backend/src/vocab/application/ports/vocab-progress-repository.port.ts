import { VocabProgress } from '../../domain/entities/vocab-progress.entity';
import { DueReviewsReadModel } from '../read-models/due-reviews.read-model';
import { StudyCardReadModel } from '../read-models/study-card.read-model';
import { BrowsedDeckCardsReadModel } from '../read-models/browsed-deck-cards.read-model';

export interface VocabProgressRepositoryPort {
  findByUserAndCard(
    userId: string,
    deckId: string,
    flashcardId: string,
  ): Promise<VocabProgress | null>;

  findByUserAndDeck(userId: string, deckId: string): Promise<VocabProgress[]>;

  findByUserAndCardIds(
    userId: string,
    deckId: string,
    flashcardIds: string[],
  ): Promise<VocabProgress[]>;

  getStudyCards(
    userId: string | null,
    deckId: string,
    options?: { onlyStarred?: boolean; onlyDue?: boolean; limit?: number },
  ): Promise<StudyCardReadModel[]>;

  browseDeckCards(
    userId: string | null,
    deckId: string,
    options: { search?: string; page: number; perPage: number },
  ): Promise<BrowsedDeckCardsReadModel>;

  getDueReviews(userId: string, deckId?: string): Promise<DueReviewsReadModel>;

  save(progress: VocabProgress): Promise<VocabProgress>;

  upsertBatch(progressList: VocabProgress[]): Promise<VocabProgress[]>;
}
