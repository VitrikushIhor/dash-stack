import { InternalErrorException } from './../../../../common/exceptions/domain.exception';
import {
  calculateTestScore,
  ScoreContribution,
} from '../../../domain/scoring/calculate-test-score';
import { LEARNING_ERRORS } from '../../../domain/constant/learning-errors';

describe('calculateTestScore', () => {
  it('should_correctly_aggregate_multiple_results_and_calculate_percentage_with_rounding', () => {
    const result: ScoreContribution[] = [
      { earnedPoints: 1, maxPoints: 1 },
      { earnedPoints: 0, maxPoints: 1 },
      { earnedPoints: 1, maxPoints: 1 },
    ];

    expect(calculateTestScore(result)).toEqual({
      earnedPoints: 2,
      maxPoints: 3,
      percentage: 67,
    });
  });

  it('should_calculate_correct_percentage_for_fractional_division_results', () => {
    const result: ScoreContribution[] = [{ earnedPoints: 1, maxPoints: 8 }];

    expect(calculateTestScore(result)).toEqual({
      earnedPoints: 1,
      maxPoints: 8,
      percentage: 13,
    });
  });

  it('should_return_0_percent_when_earned_points_are_zero', () => {
    const result: ScoreContribution[] = [{ earnedPoints: 0, maxPoints: 3 }];

    expect(calculateTestScore(result)).toEqual({
      earnedPoints: 0,
      maxPoints: 3,
      percentage: 0,
    });
  });

  it('should_return_100_percent_when_all_points_are_earned', () => {
    const result: ScoreContribution[] = [{ earnedPoints: 3, maxPoints: 3 }];

    expect(calculateTestScore(result)).toEqual({
      earnedPoints: 3,
      maxPoints: 3,
      percentage: 100,
    });
  });

  it('should_throw_internal_error_exception_when_results_array_is_empty', () => {
    const result: ScoreContribution[] = [];

    expect(() => calculateTestScore(result)).toThrow(
      new InternalErrorException(LEARNING_ERRORS.EMPTY_SCORE_CONTRIBUTIONS),
    );
  });

  const nonSafeIntegerScenarios: ReadonlyArray<{
    reason: string;
    result: ScoreContribution[];
  }> = [
    { reason: 'earned_points_are_float', result: [{ earnedPoints: 2.5, maxPoints: 10 }] },
    { reason: 'max_points_are_float', result: [{ earnedPoints: 5, maxPoints: 10.2 }] },
    { reason: 'earned_points_are_nan', result: [{ earnedPoints: NaN, maxPoints: 10 }] },
    { reason: 'max_points_are_infinity', result: [{ earnedPoints: 5, maxPoints: Infinity }] },
  ];

  it.each(nonSafeIntegerScenarios)(
    'should_throw_error_when_points_are_not_safe_integers_and_$reason',
    ({ result }) => {
      expect(() => calculateTestScore(result)).toThrow(InternalErrorException);
    },
  );

  const boundaryViolationScenarios: ReadonlyArray<{
    reason: string;
    result: ScoreContribution[];
  }> = [
    { reason: 'earned_points_are_negative', result: [{ earnedPoints: -5, maxPoints: 10 }] },
    { reason: 'max_points_are_negative', result: [{ earnedPoints: 5, maxPoints: -10 }] },
    { reason: 'max_points_are_zero', result: [{ earnedPoints: 0, maxPoints: 0 }] },
    { reason: 'earned_points_exceed_max', result: [{ earnedPoints: 12, maxPoints: 10 }] },
    {
      reason: 'earned_points_exceed_max_in_multiple_items',
      result: [
        { earnedPoints: 5, maxPoints: 5 },
        { earnedPoints: 6, maxPoints: 4 },
      ],
    },
  ];

  it.each(boundaryViolationScenarios)(
    'should_throw_error_on_boundary_violation_when_$reason',
    ({ result }) => {
      expect(() => calculateTestScore(result)).toThrow(InternalErrorException);
    },
  );
});
