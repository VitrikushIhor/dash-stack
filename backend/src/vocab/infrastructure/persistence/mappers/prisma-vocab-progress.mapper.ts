import {
  VocabProgress as PrismaVocabProgress,
  VocabProgressStatus as PrismaVocabProgressStatus,
  Flashcard as PrismaFlashcard,
} from '@prisma/client';
import { VocabProgress } from '../../../domain/entities/vocab-progress.entity';
import { VocabProgressStatus } from '../../../domain/enums/vocab.enums';
import { StudyCardReadModel } from '../../../application/read-models/study-card.read-model';

export class PrismaVocabProgressMapper {
  static toDomain(raw: PrismaVocabProgress): VocabProgress {
    return VocabProgress.reconstitute({
      id: raw.id,
      userId: raw.userId,
      deckId: raw.deckId,
      flashcardId: raw.flashcardId,
      status: raw.status as unknown as VocabProgressStatus,
      box: raw.box,
      isStarred: raw.isStarred,
      correctStreak: raw.correctStreak,
      correctCount: raw.correctCount,
      incorrectCount: raw.incorrectCount,
      lastReviewedAt: raw.lastReviewedAt,
      nextReviewAt: raw.nextReviewAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: VocabProgress) {
    const snapshot = entity.toSnapshot();
    return {
      id: snapshot.id || undefined,
      userId: snapshot.userId,
      deckId: snapshot.deckId,
      flashcardId: snapshot.flashcardId,
      status: snapshot.status as unknown as PrismaVocabProgressStatus,
      box: snapshot.box,
      isStarred: snapshot.isStarred,
      correctStreak: snapshot.correctStreak,
      correctCount: snapshot.correctCount,
      incorrectCount: snapshot.incorrectCount,
      lastReviewedAt: snapshot.lastReviewedAt,
      nextReviewAt: snapshot.nextReviewAt,
    };
  }

  static toStudyCardReadModel(
    card: PrismaFlashcard,
    progress: PrismaVocabProgress | null,
  ): StudyCardReadModel {
    return {
      id: card.id,
      deckId: card.deckId,
      term: card.term,
      definition: card.definition,
      example: card.example,
      imageUrl: card.imageUrl,
      position: card.position,
      progress: progress
        ? {
            id: progress.id,
            status: progress.status as unknown as VocabProgressStatus,
            box: progress.box,
            isStarred: progress.isStarred,
            correctStreak: progress.correctStreak,
            correctCount: progress.correctCount,
            incorrectCount: progress.incorrectCount,
            lastReviewedAt: progress.lastReviewedAt,
            nextReviewAt: progress.nextReviewAt,
          }
        : {
            id: null,
            status: VocabProgressStatus.NEW,
            box: 1,
            isStarred: false,
            correctStreak: 0,
            correctCount: 0,
            incorrectCount: 0,
            lastReviewedAt: null,
            nextReviewAt: null,
          },
    };
  }
}
