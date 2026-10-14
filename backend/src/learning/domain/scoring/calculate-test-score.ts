import { LEARNING_ERRORS } from '../constant/learning-errors';
import { InternalErrorException } from './../../../common/exceptions/domain.exception';

export type ScoreContribution = {
  readonly earnedPoints: number;
  readonly maxPoints: number;
};

export type TestScore = {
  readonly earnedPoints: number;
  readonly maxPoints: number;
  readonly percentage: number;
};

export function calculateTestScore(results: readonly ScoreContribution[]): TestScore {
  if (!results.length) throw new InternalErrorException(LEARNING_ERRORS.EMPTY_SCORE_CONTRIBUTIONS);

  let totalMaxPoints = 0;
  let totalEarnedPoints = 0;

  for (const result of results) {
    const { earnedPoints, maxPoints } = result;

    if (!Number.isSafeInteger(earnedPoints) || !Number.isSafeInteger(maxPoints)) {
      throw new InternalErrorException(
        LEARNING_ERRORS.INVALID_SCORE_POINTS(earnedPoints, maxPoints),
      );
    }

    if (maxPoints <= 0) {
      throw new InternalErrorException(LEARNING_ERRORS.INVALID_MAX_POINTS(maxPoints));
    }

    if (earnedPoints < 0 || earnedPoints > maxPoints) {
      throw new InternalErrorException(
        LEARNING_ERRORS.EARNED_POINTS_BOUNDARIES(earnedPoints, maxPoints),
      );
    }
    totalEarnedPoints += earnedPoints;
    totalMaxPoints += maxPoints;
  }

  const percentage = Math.round((totalEarnedPoints / totalMaxPoints) * 100);
  return {
    earnedPoints: totalEarnedPoints,
    maxPoints: totalMaxPoints,
    percentage,
  };
}
