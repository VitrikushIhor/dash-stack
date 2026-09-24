import { SetCardStarUseCase } from '../../../application/use-cases/set-card-star.use-case';
import { VocabProgressController } from '../../../presentation/controllers/vocab-progress.controller';
import { GetDueReviewsUseCase } from '../../../application/use-cases/get-due-reviews.use-case';
import { ToggleCardStarUseCase } from '../../../application/use-cases/toggle-card-star.use-case';
import { AuthUser } from '../../../../common/decorators/user.decorator';

describe('VocabProgressController', () => {
  let controller: VocabProgressController;
  let mockGetDueReviewsUseCase: jest.Mocked<GetDueReviewsUseCase>;
  let mockToggleCardStarUseCase: jest.Mocked<ToggleCardStarUseCase>;
  let mockSetCardStarUseCase: jest.Mocked<SetCardStarUseCase>;
  const mockUser: AuthUser = {
    id: 'user-1',
    email: 'user1@example.com',
  };

  beforeEach(() => {
    mockGetDueReviewsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetDueReviewsUseCase>;

    mockToggleCardStarUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ToggleCardStarUseCase>;

    mockSetCardStarUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SetCardStarUseCase>;

    controller = new VocabProgressController(
      mockGetDueReviewsUseCase,
      mockToggleCardStarUseCase,
      mockSetCardStarUseCase,
    );
  });

  it('should call GetDueReviewsUseCase and return mapped response', async () => {
    mockGetDueReviewsUseCase.execute.mockResolvedValue({
      totalDue: 5,
      perDeck: [
        {
          deckId: 'deck-1',
          deckTitle: 'Deck 1',
          dueCount: 5,
        },
      ],
    });

    const response = await controller.getDueReviews(mockUser, { deckId: 'deck-1' });

    expect(mockGetDueReviewsUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      deckId: 'deck-1',
    });
    expect(response).toEqual({
      totalDue: 5,
      perDeck: [
        {
          deckId: 'deck-1',
          deckTitle: 'Deck 1',
          dueCount: 5,
        },
      ],
    });
  });

  it('should call ToggleCardStarUseCase and return mapped response', async () => {
    mockToggleCardStarUseCase.execute.mockResolvedValue({
      flashcardId: 'card-1',
      isStarred: true,
    });

    const response = await controller.toggleCardStar(mockUser, 'card-1');

    expect(mockToggleCardStarUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      flashcardId: 'card-1',
    });
    expect(response).toEqual({
      flashcardId: 'card-1',
      isStarred: true,
    });
  });

  it('should call SetCardStarUseCase with the requested state', async () => {
    mockSetCardStarUseCase.execute.mockResolvedValue({
      flashcardId: 'card-1',
      isStarred: false,
    });

    const response = await controller.setCardStar(mockUser, 'card-1', {
      isStarred: false,
    });

    expect(mockSetCardStarUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      flashcardId: 'card-1',
      isStarred: false,
    });
    expect(response).toEqual({ flashcardId: 'card-1', isStarred: false });
  });
});
