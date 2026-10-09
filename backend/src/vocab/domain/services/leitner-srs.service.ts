import {
  LEITNER_BOX_INTERVALS_DAYS,
  MAX_LEITNER_BOX,
  MIN_LEITNER_BOX,
  type LeitnerBoxNumber,
} from '../constants/srs.constants';
import { VocabProgressStatus } from '../enums/vocab.enums';

interface SrsCalculationInput {
  currentBox: number;
  isCorrect: boolean;
  currentStreak?: number;
  correctCount?: number;
  incorrectCount?: number;
  now?: Date;
}

interface SrsCalculationResult {
  nextBox: number;
  nextReviewAt: Date;
  status: VocabProgressStatus;
  correctStreak: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: Date;
}

export class LeitnerSrsEngine {
  /**
   * Pure calculation of next Leitner state without side-effects.
   */
  public static calculateNextReview(input: SrsCalculationInput): SrsCalculationResult {
    const {
      currentBox,
      isCorrect,
      currentStreak = 0,
      correctCount = 0,
      incorrectCount = 0,
      now = new Date(),
    } = input;

    let nextBox: number;
    let nextStreak: number;
    let nextCorrectCount = correctCount;
    let nextIncorrectCount = incorrectCount;

    if (isCorrect) {
      nextBox = Math.min(currentBox + 1, MAX_LEITNER_BOX);
      nextStreak = currentStreak + 1;
      nextCorrectCount += 1;
    } else {
      nextBox = MIN_LEITNER_BOX;
      nextStreak = 0;
      nextIncorrectCount += 1;
    }

    const intervalDays = LEITNER_BOX_INTERVALS_DAYS[nextBox as LeitnerBoxNumber] ?? 1;

    const nextReviewAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    const status = this.determineStatus(nextBox, isCorrect, currentBox);

    return {
      nextBox,
      nextReviewAt,
      status,
      correctStreak: nextStreak,
      correctCount: nextCorrectCount,
      incorrectCount: nextIncorrectCount,
      lastReviewedAt: now,
    };
  }

  private static determineStatus(
    nextBox: number,
    isCorrect: boolean,
    previousBox: number,
  ): VocabProgressStatus {
    if (!isCorrect && previousBox >= 3) {
      return VocabProgressStatus.FORGOTTEN;
    }

    if (nextBox >= 5) {
      return VocabProgressStatus.MASTERED;
    }

    if (nextBox >= 3) {
      return VocabProgressStatus.KNOWN;
    }

    return VocabProgressStatus.LEARNING;
  }
}
