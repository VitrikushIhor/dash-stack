import { LeitnerSrsEngine } from '../../../domain/services/leitner-srs.service';
import { VocabProgressStatus } from '../../../domain/enums/vocab.enums';

describe('LeitnerSrsEngine', () => {
  const baseDate = new Date('2026-08-21T12:00:00.000Z');

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
