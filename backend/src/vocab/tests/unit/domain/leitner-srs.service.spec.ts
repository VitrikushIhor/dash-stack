import { LeitnerSrsEngine } from '../../../domain/services/leitner-srs.service';
import { VocabProgressStatus } from '../../../domain/enums/vocab.enums';

describe('LeitnerSrsEngine', () => {
  const baseDate = new Date('2026-08-21T12:00:00.000Z');

  describe('approved transition matrix', () => {
    it.each([
      [1, true, 2, VocabProgressStatus.LEARNING, '2026-08-24T12:00:00.000Z'],
      [2, true, 3, VocabProgressStatus.KNOWN, '2026-08-28T12:00:00.000Z'],
      [3, true, 4, VocabProgressStatus.KNOWN, '2026-09-04T12:00:00.000Z'],
      [4, true, 5, VocabProgressStatus.MASTERED, '2026-09-20T12:00:00.000Z'],
      [5, true, 5, VocabProgressStatus.MASTERED, '2026-09-20T12:00:00.000Z'],
      [1, false, 1, VocabProgressStatus.LEARNING, '2026-08-22T12:00:00.000Z'],
      [2, false, 1, VocabProgressStatus.LEARNING, '2026-08-22T12:00:00.000Z'],
      [3, false, 1, VocabProgressStatus.FORGOTTEN, '2026-08-22T12:00:00.000Z'],
      [4, false, 1, VocabProgressStatus.FORGOTTEN, '2026-08-22T12:00:00.000Z'],
      [5, false, 1, VocabProgressStatus.FORGOTTEN, '2026-08-22T12:00:00.000Z'],
    ] as const)(
      'should_schedule_approved_state_when_box_is_%i_and_isCorrect_is_%s',
      (currentBox, isCorrect, nextBox, status, nextReviewAt) => {
        const input = {
          currentBox,
          isCorrect,
          currentStreak: 4,
          correctCount: 11,
          incorrectCount: 3,
          now: new Date(baseDate),
        };

        const result = LeitnerSrsEngine.calculateNextReview(input);

        expect(result).toEqual({
          nextBox,
          status,
          nextReviewAt: new Date(nextReviewAt),
          lastReviewedAt: baseDate,
          correctStreak: isCorrect ? 5 : 0,
          correctCount: isCorrect ? 12 : 11,
          incorrectCount: isCorrect ? 3 : 4,
        });
      },
    );
  });

  describe('box boundaries', () => {
    it.each([
      [1, false, VocabProgressStatus.LEARNING, '2026-08-23T12:00:00.000Z'],
      [5, true, VocabProgressStatus.MASTERED, '2026-10-20T12:00:00.000Z'],
    ] as const)(
      'should_remain_at_boundary_when_box_is_%i_and_isCorrect_is_%s_repeatedly',
      (currentBox, isCorrect, status, nextReviewAt) => {
        const first = LeitnerSrsEngine.calculateNextReview({
          currentBox,
          isCorrect,
          now: new Date(baseDate),
        });

        const second = LeitnerSrsEngine.calculateNextReview({
          currentBox: first.nextBox,
          isCorrect,
          currentStreak: first.correctStreak,
          correctCount: first.correctCount,
          incorrectCount: first.incorrectCount,
          now: first.nextReviewAt,
        });

        expect(second).toEqual({
          nextBox: currentBox,
          status,
          nextReviewAt: new Date(nextReviewAt),
          lastReviewedAt: first.nextReviewAt,
          correctStreak: isCorrect ? 2 : 0,
          correctCount: isCorrect ? 2 : 0,
          incorrectCount: isCorrect ? 0 : 2,
        });
      },
    );
  });

  it('should_return_identical_results_without_mutation_when_input_and_clock_are_fixed', () => {
    const input = Object.freeze({
      currentBox: 3,
      isCorrect: true,
      currentStreak: 2,
      correctCount: 7,
      incorrectCount: 1,
      now: new Date(baseDate),
    });

    const first = LeitnerSrsEngine.calculateNextReview(input);
    const second = LeitnerSrsEngine.calculateNextReview(input);

    expect(second).toEqual(first);
    expect(input.now).toEqual(baseDate);
  });

  describe('calculateNextReview - Correct Answers', () => {
    it('promotes from Box 1 to Box 2 with 3-day interval', () => {
      const result = LeitnerSrsEngine.calculateNextReview({
        currentBox: 1,
        isCorrect: true,
        currentStreak: 0,
        correctCount: 0,
        now: baseDate,
      });

      expect(result.nextBox).toBe(2);
      expect(result.status).toBe(VocabProgressStatus.LEARNING);
      expect(result.correctStreak).toBe(1);
      expect(result.correctCount).toBe(1);
      expect(result.incorrectCount).toBe(0);

      const expectedDate = new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      expect(result.nextReviewAt.toISOString()).toBe(expectedDate.toISOString());
    });

    it('promotes from Box 2 to Box 3 with 7-day interval and KNOWN status', () => {
      const result = LeitnerSrsEngine.calculateNextReview({
        currentBox: 2,
        isCorrect: true,
        currentStreak: 1,
        correctCount: 1,
        now: baseDate,
      });

      expect(result.nextBox).toBe(3);
      expect(result.status).toBe(VocabProgressStatus.KNOWN);
      expect(result.correctStreak).toBe(2);
      expect(result.correctCount).toBe(2);

      const expectedDate = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      expect(result.nextReviewAt.toISOString()).toBe(expectedDate.toISOString());
    });

    it('promotes from Box 4 to Box 5 with 30-day interval and MASTERED status', () => {
      const result = LeitnerSrsEngine.calculateNextReview({
        currentBox: 4,
        isCorrect: true,
        currentStreak: 3,
        correctCount: 3,
        now: baseDate,
      });

      expect(result.nextBox).toBe(5);
      expect(result.status).toBe(VocabProgressStatus.MASTERED);
      expect(result.correctStreak).toBe(4);
      expect(result.correctCount).toBe(4);

      const expectedDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      expect(result.nextReviewAt.toISOString()).toBe(expectedDate.toISOString());
    });

    it('caps at Box 5 on consecutive correct reviews', () => {
      const result = LeitnerSrsEngine.calculateNextReview({
        currentBox: 5,
        isCorrect: true,
        currentStreak: 5,
        correctCount: 5,
        now: baseDate,
      });

      expect(result.nextBox).toBe(5);
      expect(result.status).toBe(VocabProgressStatus.MASTERED);
      expect(result.correctStreak).toBe(6);
    });
  });

  describe('calculateNextReview - Incorrect Answers', () => {
    it('resets Box 2 to Box 1 with 1-day interval and resets streak', () => {
      const result = LeitnerSrsEngine.calculateNextReview({
        currentBox: 2,
        isCorrect: false,
        currentStreak: 3,
        correctCount: 3,
        incorrectCount: 1,
        now: baseDate,
      });

      expect(result.nextBox).toBe(1);
      expect(result.status).toBe(VocabProgressStatus.LEARNING);
      expect(result.correctStreak).toBe(0);
      expect(result.incorrectCount).toBe(2);

      const expectedDate = new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000);
      expect(result.nextReviewAt.toISOString()).toBe(expectedDate.toISOString());
    });

    it('demotes a previously KNOWN/MASTERED card (Box 4) to FORGOTTEN status', () => {
      const result = LeitnerSrsEngine.calculateNextReview({
        currentBox: 4,
        isCorrect: false,
        currentStreak: 4,
        correctCount: 4,
        incorrectCount: 0,
        now: baseDate,
      });

      expect(result.nextBox).toBe(1);
      expect(result.status).toBe(VocabProgressStatus.FORGOTTEN);
      expect(result.correctStreak).toBe(0);
      expect(result.incorrectCount).toBe(1);
    });
  });
});
