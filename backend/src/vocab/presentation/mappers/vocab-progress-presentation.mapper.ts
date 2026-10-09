import { DueReviewsReadModel } from '../../application/read-models/due-reviews.read-model';
import { StudyCardReadModel } from '../../application/read-models/study-card.read-model';
import { VocabProgressReadModel } from '../../application/read-models/vocab-progress.read-model';
import { ToggleCardStarResult } from '../../application/use-cases/toggle-card-star.use-case';
import { DueReviewsResponseDto } from '../dtos/due-reviews-response.dto';
import { StudyCardResponseDto } from '../dtos/study-session-response.dto';
import { VocabProgressResponseDto } from '../dtos/vocab-progress-response.dto';
import { ToggleStarResponseDto } from '../dtos/toggle-star-response.dto';

export class VocabProgressPresentationMapper {
  static toDueReviewsResponse(readModel: DueReviewsReadModel): DueReviewsResponseDto {
    return {
      totalDue: readModel.totalDue,
      perDeck: readModel.perDeck.map((d) => ({
        deckId: d.deckId,
        deckTitle: d.deckTitle,
        dueCount: d.dueCount,
      })),
    };
  }

  static toStudyCardResponse(readModel: StudyCardReadModel): StudyCardResponseDto {
    return {
      id: readModel.id,
      deckId: readModel.deckId,
      term: readModel.term,
      definition: readModel.definition,
      example: readModel.example,
      imageUrl: readModel.imageUrl,
      position: readModel.position,
      progress: {
        id: readModel.progress.id,
        status: readModel.progress.status,
        box: readModel.progress.box,
        isStarred: readModel.progress.isStarred,
        correctStreak: readModel.progress.correctStreak,
        correctCount: readModel.progress.correctCount,
        incorrectCount: readModel.progress.incorrectCount,
        lastReviewedAt: readModel.progress.lastReviewedAt
          ? readModel.progress.lastReviewedAt.toISOString()
          : null,
        nextReviewAt: readModel.progress.nextReviewAt
          ? readModel.progress.nextReviewAt.toISOString()
          : null,
      },
    };
  }

  static toStudyCardResponseList(cards: StudyCardReadModel[]): StudyCardResponseDto[] {
    return cards.map((card) => this.toStudyCardResponse(card));
  }

  static toVocabProgressResponse(readModel: VocabProgressReadModel): VocabProgressResponseDto {
    return {
      id: readModel.id,
      userId: readModel.userId,
      deckId: readModel.deckId,
      flashcardId: readModel.flashcardId,
      status: readModel.status,
      box: readModel.box,
      isStarred: readModel.isStarred,
      correctStreak: readModel.correctStreak,
      correctCount: readModel.correctCount,
      incorrectCount: readModel.incorrectCount,
      lastReviewedAt: readModel.lastReviewedAt ? readModel.lastReviewedAt.toISOString() : null,
      nextReviewAt: readModel.nextReviewAt ? readModel.nextReviewAt.toISOString() : null,
      createdAt: readModel.createdAt.toISOString(),
      updatedAt: readModel.updatedAt.toISOString(),
    };
  }

  static toVocabProgressResponseList(list: VocabProgressReadModel[]): VocabProgressResponseDto[] {
    return list.map((item) => this.toVocabProgressResponse(item));
  }

  static toToggleStarResponse(result: ToggleCardStarResult): ToggleStarResponseDto {
    return {
      flashcardId: result.flashcardId,
      isStarred: result.isStarred,
    };
  }
}
