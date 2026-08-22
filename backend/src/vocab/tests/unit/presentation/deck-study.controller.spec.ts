import { DeckStudyController } from '../../../presentation/controllers/deck-study.controller';
import { GetStudyCardsUseCase } from '../../../application/use-cases/get-study-cards.use-case';
import { SubmitStudyProgressUseCase } from '../../../application/use-cases/submit-study-progress.use-case';
import { AuthUser } from '../../../../common/decorators/user.decorator';
import { VocabProgressStatus } from '../../../domain/enums/vocab.enums';

describe('DeckStudyController', () => {
  let controller: DeckStudyController;
  let mockGetStudyCardsUseCase: jest.Mocked<GetStudyCardsUseCase>;
  let mockSubmitStudyProgressUseCase: jest.Mocked<SubmitStudyProgressUseCase>;

  const mockUser: AuthUser = {
    id: 'user-1',
    email: 'user1@example.com',
  };

  beforeEach(() => {
    mockGetStudyCardsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetStudyCardsUseCase>;

    mockSubmitStudyProgressUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SubmitStudyProgressUseCase>;

    controller = new DeckStudyController(mockGetStudyCardsUseCase, mockSubmitStudyProgressUseCase);
  });

  it('should call GetStudyCardsUseCase and return mapped response list', async () => {
    const fixedDate = new Date('2026-08-22T10:00:00.000Z');
    mockGetStudyCardsUseCase.execute.mockResolvedValue([
      {
        id: 'card-1',
        deckId: 'deck-1',
        term: 'Algorithm',
        definition: 'Step-by-step procedure',
        example: null,
        imageUrl: null,
        position: 1,
        progress: {
          id: 'prog-1',
          status: VocabProgressStatus.LEARNING,
          box: 2,
          isStarred: false,
          correctStreak: 1,
          correctCount: 1,
          incorrectCount: 0,
          lastReviewedAt: fixedDate,
          nextReviewAt: fixedDate,
        },
      },
    ]);

    const response = await controller.getStudyCards(
      'deck-1',
      { mode: 'flashcards', onlyStarred: false, onlyDue: true },
      mockUser,
    );

    expect(mockGetStudyCardsUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      deckId: 'deck-1',
      mode: 'flashcards',
      onlyStarred: false,
      onlyDue: true,
    });
    expect(response).toHaveLength(1);
    expect(response[0].id).toBe('card-1');
    expect(response[0].progress.status).toBe(VocabProgressStatus.LEARNING);
    expect(response[0].progress.lastReviewedAt).toBe(fixedDate.toISOString());
  });

  it('should call SubmitStudyProgressUseCase and return mapped response list', async () => {
    const fixedDate = new Date('2026-08-22T10:00:00.000Z');
    mockSubmitStudyProgressUseCase.execute.mockResolvedValue([
      {
        id: 'prog-1',
        userId: 'user-1',
        deckId: 'deck-1',
        flashcardId: 'card-1',
        status: VocabProgressStatus.LEARNING,
        box: 2,
        isStarred: false,
        correctStreak: 1,
        correctCount: 1,
        incorrectCount: 0,
        lastReviewedAt: fixedDate,
        nextReviewAt: fixedDate,
        createdAt: fixedDate,
        updatedAt: fixedDate,
      },
    ]);

    const response = await controller.submitProgress(
      'deck-1',
      { results: [{ flashcardId: 'card-1', isCorrect: true }] },
      mockUser,
    );

    expect(mockSubmitStudyProgressUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      deckId: 'deck-1',
      results: [{ flashcardId: 'card-1', isCorrect: true }],
    });
    expect(response).toHaveLength(1);
    expect(response[0].flashcardId).toBe('card-1');
    expect(response[0].box).toBe(2);
    expect(response[0].status).toBe(VocabProgressStatus.LEARNING);
  });
});
