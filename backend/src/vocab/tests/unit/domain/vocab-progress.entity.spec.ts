import { VocabProgress } from '../../../domain/entities/vocab-progress.entity';
import { VocabProgressStatus } from '../../../domain/enums/vocab.enums';
import { InvalidVocabProgressDataException } from '../../../domain/exceptions/vocab-domain.exceptions';
import { VOCAB_ERRORS } from '../../../domain/constants/vocab-errors';

describe('VocabProgress Entity', () => {
  const fixedDate = new Date('2026-08-22T10:00:00.000Z');

  describe('createNew', () => {
    it('should initialize a new VocabProgress with proper default values', () => {
      const progress = VocabProgress.createNew('user-1', 'deck-1', 'card-1', fixedDate, 'prog-1');

      expect(progress.id).toBe('prog-1');
      expect(progress.userId).toBe('user-1');
      expect(progress.deckId).toBe('deck-1');
      expect(progress.flashcardId).toBe('card-1');
      expect(progress.status).toBe(VocabProgressStatus.NEW);
      expect(progress.box).toBe(1);
      expect(progress.isStarred).toBe(false);
      expect(progress.correctStreak).toBe(0);
      expect(progress.correctCount).toBe(0);
      expect(progress.incorrectCount).toBe(0);
      expect(progress.lastReviewedAt).toBeNull();
      expect(progress.nextReviewAt).toBeNull();
      expect(progress.createdAt).toEqual(fixedDate);
      expect(progress.updatedAt).toEqual(fixedDate);
    });
  });

  describe('validation', () => {
    it('should throw when box is less than 1', () => {
      expect(() => {
        VocabProgress.reconstitute({
          id: 'prog-1',
          userId: 'user-1',
          deckId: 'deck-1',
          flashcardId: 'card-1',
          status: VocabProgressStatus.LEARNING,
          box: 0,
          isStarred: false,
          correctStreak: 0,
          correctCount: 0,
          incorrectCount: 0,
          lastReviewedAt: null,
          nextReviewAt: null,
          createdAt: fixedDate,
          updatedAt: fixedDate,
        });
      }).toThrow(new InvalidVocabProgressDataException(VOCAB_ERRORS.VOCAB_PROGRESS_INVALID_BOX));
    });

    it('should throw when box is greater than 5', () => {
      expect(() => {
        VocabProgress.reconstitute({
          id: 'prog-1',
          userId: 'user-1',
          deckId: 'deck-1',
          flashcardId: 'card-1',
          status: VocabProgressStatus.LEARNING,
          box: 6,
          isStarred: false,
          correctStreak: 0,
          correctCount: 0,
          incorrectCount: 0,
          lastReviewedAt: null,
          nextReviewAt: null,
          createdAt: fixedDate,
          updatedAt: fixedDate,
        });
      }).toThrow(new InvalidVocabProgressDataException(VOCAB_ERRORS.VOCAB_PROGRESS_INVALID_BOX));
    });

    it('should throw when userId is missing', () => {
      expect(() => {
        VocabProgress.reconstitute({
          id: 'prog-1',
          userId: '',
          deckId: 'deck-1',
          flashcardId: 'card-1',
          status: VocabProgressStatus.LEARNING,
          box: 1,
          isStarred: false,
          correctStreak: 0,
          correctCount: 0,
          incorrectCount: 0,
          lastReviewedAt: null,
          nextReviewAt: null,
          createdAt: fixedDate,
          updatedAt: fixedDate,
        });
      }).toThrow(new InvalidVocabProgressDataException(VOCAB_ERRORS.VOCAB_PROGRESS_USER_REQUIRED));
    });

    it('should throw when correctCount is negative', () => {
      expect(() => {
        VocabProgress.reconstitute({
          id: 'prog-1',
          userId: 'user-1',
          deckId: 'deck-1',
          flashcardId: 'card-1',
          status: VocabProgressStatus.LEARNING,
          box: 1,
          isStarred: false,
          correctStreak: 0,
          correctCount: -1,
          incorrectCount: 0,
          lastReviewedAt: null,
          nextReviewAt: null,
          createdAt: fixedDate,
          updatedAt: fixedDate,
        });
      }).toThrow(
        new InvalidVocabProgressDataException(VOCAB_ERRORS.VOCAB_PROGRESS_NEGATIVE_CORRECT_COUNT),
      );
    });
  });

  describe('recordReview', () => {
    it('should advance box and streak on correct review', () => {
      const progress = VocabProgress.createNew('user-1', 'deck-1', 'card-1', fixedDate, 'prog-1');

      progress.recordReview(true, fixedDate);

      expect(progress.box).toBe(2);
      expect(progress.correctStreak).toBe(1);
      expect(progress.correctCount).toBe(1);
      expect(progress.incorrectCount).toBe(0);
      expect(progress.status).toBe(VocabProgressStatus.LEARNING);
      expect(progress.lastReviewedAt).toEqual(fixedDate);
      expect(progress.nextReviewAt).toEqual(
        new Date(fixedDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      );
    });

    it('should reset box and streak on incorrect review', () => {
      const progress = VocabProgress.reconstitute({
        id: 'prog-1',
        userId: 'user-1',
        deckId: 'deck-1',
        flashcardId: 'card-1',
        status: VocabProgressStatus.KNOWN,
        box: 4,
        isStarred: false,
        correctStreak: 4,
        correctCount: 4,
        incorrectCount: 0,
        lastReviewedAt: fixedDate,
        nextReviewAt: null,
        createdAt: fixedDate,
        updatedAt: fixedDate,
      });

      progress.recordReview(false, fixedDate);

      expect(progress.box).toBe(1);
      expect(progress.correctStreak).toBe(0);
      expect(progress.correctCount).toBe(4);
      expect(progress.incorrectCount).toBe(1);
      expect(progress.status).toBe(VocabProgressStatus.FORGOTTEN);
      expect(progress.nextReviewAt).toEqual(
        new Date(fixedDate.getTime() + 1 * 24 * 60 * 60 * 1000),
      );
    });
  });

  describe('star toggling', () => {
    it('should toggle star status', () => {
      const progress = VocabProgress.createNew('user-1', 'deck-1', 'card-1', fixedDate, 'prog-1');
      expect(progress.isStarred).toBe(false);

      progress.toggleStar();
      expect(progress.isStarred).toBe(true);

      progress.toggleStar();
      expect(progress.isStarred).toBe(false);
    });

    it('should set specific star status', () => {
      const progress = VocabProgress.createNew('user-1', 'deck-1', 'card-1', fixedDate, 'prog-1');
      progress.setStar(true);
      expect(progress.isStarred).toBe(true);

      progress.setStar(true);
      expect(progress.isStarred).toBe(true);

      progress.setStar(false);
      expect(progress.isStarred).toBe(false);
    });
  });

  describe('toSnapshot', () => {
    it('should return a snapshot copy of props', () => {
      const progress = VocabProgress.createNew('user-1', 'deck-1', 'card-1', fixedDate, 'prog-1');
      const snapshot = progress.toSnapshot();

      expect(snapshot).toEqual({
        id: 'prog-1',
        userId: 'user-1',
        deckId: 'deck-1',
        flashcardId: 'card-1',
        status: VocabProgressStatus.NEW,
        box: 1,
        isStarred: false,
        correctStreak: 0,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewedAt: null,
        nextReviewAt: null,
        createdAt: fixedDate,
        updatedAt: fixedDate,
      });
    });
  });
});
