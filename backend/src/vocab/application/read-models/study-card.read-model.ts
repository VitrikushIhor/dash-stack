import { VocabProgressStatus } from '../../domain/enums/vocab.enums';

export interface StudyCardProgressReadModel {
  id: string | null;
  status: VocabProgressStatus;
  box: number;
  isStarred: boolean;
  correctStreak: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
}

export interface StudyCardReadModel {
  id: string;
  deckId: string;
  term: string;
  definition: string;
  example: string | null;
  imageUrl: string | null;
  position: number;
  progress: StudyCardProgressReadModel;
}
