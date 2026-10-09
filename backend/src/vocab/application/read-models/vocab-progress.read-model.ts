import { VocabProgressStatus } from '../../domain/enums/vocab.enums';

export interface VocabProgressReadModel {
  id: string;
  userId: string;
  deckId: string;
  flashcardId: string;
  status: VocabProgressStatus;
  box: number;
  isStarred: boolean;
  correctStreak: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
