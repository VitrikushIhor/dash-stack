import { GetDueReviewsUseCase } from '../../../application/use-cases/get-due-reviews.use-case';
import { VocabProgressRepositoryPort } from '../../../application/ports/vocab-progress-repository.port';
import { DueReviewsReadModel } from '../../../application/read-models/due-reviews.read-model';

describe('GetDueReviewsUseCase', () => {
  let useCase: GetDueReviewsUseCase;
  let mockVocabProgressRepo: jest.Mocked<VocabProgressRepositoryPort>;

  beforeEach(() => {
    mockVocabProgressRepo = {
      findByUserAndCard: jest.fn(),
      findByUserAndDeck: jest.fn(),
      findByUserAndCardIds: jest.fn(),
      getStudyCards: jest.fn(),
      browseDeckCards: jest.fn(),
      getDueReviews: jest.fn(),
      save: jest.fn(),
      upsertBatch: jest.fn(),
    };

    useCase = new GetDueReviewsUseCase(mockVocabProgressRepo);
  });

  it('should return due reviews calculation from repository', async () => {
    const expectedResult: DueReviewsReadModel = {
      totalDue: 5,
      perDeck: [
        {
          deckId: 'deck-1',
          deckTitle: 'English B2',
          dueCount: 3,
        },
        {
          deckId: 'deck-2',
          deckTitle: 'IT Terms',
          dueCount: 2,
        },
      ],
    };

    mockVocabProgressRepo.getDueReviews.mockResolvedValue(expectedResult);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(mockVocabProgressRepo.getDueReviews).toHaveBeenCalledWith('user-1', undefined);
    expect(result).toEqual(expectedResult);
  });

  it('should filter due reviews by deckId when provided', async () => {
    const expectedResult: DueReviewsReadModel = {
      totalDue: 3,
      perDeck: [
        {
          deckId: 'deck-1',
          deckTitle: 'English B2',
          dueCount: 3,
        },
      ],
    };

    mockVocabProgressRepo.getDueReviews.mockResolvedValue(expectedResult);

    const result = await useCase.execute({ userId: 'user-1', deckId: 'deck-1' });

    expect(mockVocabProgressRepo.getDueReviews).toHaveBeenCalledWith('user-1', 'deck-1');
    expect(result).toEqual(expectedResult);
  });
});
