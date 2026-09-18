import { SetCardStarUseCase } from '../../../application/use-cases/set-card-star.use-case';
import { StudyProgressTransactionContext } from '../../../application/ports/study-progress-transaction.port';
import { Deck } from '../../../domain/entities/deck.entity';
import { Flashcard } from '../../../domain/entities/flashcard.entity';
import { VocabProgress } from '../../../domain/entities/vocab-progress.entity';
import { DeckStatus, DeckVisibility } from '../../../domain/enums/vocab.enums';
import {
  DeckAccessForbiddenException,
  FlashcardNotFoundException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

describe('SetCardStarUseCase', () => {
  let useCase: SetCardStarUseCase;
  let deck: Deck;
  let card: Flashcard | null;
  let records: Map<string, VocabProgress>;

  beforeEach(() => {
    records = new Map();
    deck = Deck.create({
      id: 'deck-1',
      ownerUserId: 'owner-1',
      title: 'Shared deck',
      visibility: DeckVisibility.PUBLIC,
      status: DeckStatus.PUBLISHED,
    });
    card = Flashcard.reconstitute({
      id: 'card-1',
      deckId: 'deck-1',
      term: 'Word',
      definition: 'Meaning',
      example: null,
      imageUrl: null,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const context: StudyProgressTransactionContext = {
      deckRepository: { findById: async () => deck },
      flashcardRepository: { findById: async () => card, findByDeckId: jest.fn() },
      studyAttemptRepository: { find: jest.fn(), save: jest.fn() },
      vocabProgressRepository: {
        findByUserAndCard: async (userId, deckId, cardId) =>
          records.get(`${userId}:${deckId}:${cardId}`) ?? null,
        findByUserAndCardIds: jest.fn(),
        upsertBatch: jest.fn(),
        save: async (progress) => {
          records.set(`${progress.userId}:${progress.deckId}:${progress.flashcardId}`, progress);

          return progress;
        },
      },
    };

    useCase = new SetCardStarUseCase({ run: (work) => work(context) });
  });

  it.each([true, false])(
    'should_preserve_desired_%s_when_request_is_repeated',
    async (isStarred) => {
      const command = { userId: 'user-1', flashcardId: 'card-1', isStarred };

      expect(await useCase.execute(command)).toEqual({ flashcardId: 'card-1', isStarred });
      expect(await useCase.execute(command)).toEqual({ flashcardId: 'card-1', isStarred });
      expect(records.size).toBe(1);
      expect(records.get('user-1:deck-1:card-1')?.isStarred).toBe(isStarred);
    },
  );

  it('should_create_unreviewed_progress_when_progress_is_missing', async () => {
    await useCase.execute({ userId: 'user-1', flashcardId: 'card-1', isStarred: true });
    expect(records.get('user-1:deck-1:card-1')?.toSnapshot()).toMatchObject({
      isStarred: true,
      box: 1,
      correctCount: 0,
      incorrectCount: 0,
      correctStreak: 0,
      lastReviewedAt: null,
      nextReviewAt: null,
    });
  });

  it('should_keep_personal_stars_when_another_user_sets_the_same_card', async () => {
    await useCase.execute({ userId: 'user-1', flashcardId: 'card-1', isStarred: true });
    await useCase.execute({ userId: 'user-2', flashcardId: 'card-1', isStarred: false });
    expect(records.get('user-1:deck-1:card-1')?.isStarred).toBe(true);
    expect(records.get('user-2:deck-1:card-1')?.isStarred).toBe(false);
    expect(records.size).toBe(2);
  });

  it('should_preserve_review_fields_when_setting_a_star', async () => {
    const progress = VocabProgress.createNew('user-1', 'deck-1', 'card-1');

    progress.recordReview(true, new Date('2026-09-15T12:00:00Z'));
    records.set('user-1:deck-1:card-1', progress);
    const before = progress.toSnapshot();

    await useCase.execute({ userId: 'user-1', flashcardId: 'card-1', isStarred: true });
    expect(records.get('user-1:deck-1:card-1')?.toSnapshot()).toEqual({
      ...before,
      isStarred: true,
      updatedAt: expect.any(Date),
    });
  });

  it('should_recheck_access_when_a_previously_accessible_deck_becomes_private', async () => {
    await useCase.execute({ userId: 'user-1', flashcardId: 'card-1', isStarred: true });
    deck = Deck.create({
      id: 'deck-1',
      ownerUserId: 'owner-1',
      title: 'Private',
      visibility: DeckVisibility.PRIVATE,
      status: DeckStatus.PUBLISHED,
    });
    await expect(
      useCase.execute({ userId: 'user-1', flashcardId: 'card-1', isStarred: false }),
    ).rejects.toThrow(DeckAccessForbiddenException);
    expect(records.get('user-1:deck-1:card-1')?.isStarred).toBe(true);
  });

  it('should_reject_when_card_does_not_exist', async () => {
    card = null;
    await expect(
      useCase.execute({ userId: 'user-1', flashcardId: 'missing', isStarred: true }),
    ).rejects.toThrow(FlashcardNotFoundException);
    expect(records.size).toBe(0);
  });
});
