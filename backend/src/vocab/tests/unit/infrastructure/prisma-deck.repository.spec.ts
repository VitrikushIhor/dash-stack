import { PrismaService } from 'nestjs-prisma';
import { paginate } from '../../../../common/pagination/paginate';
import { PrismaDeckRepository } from '../../../../vocab/infrastructure/persistence/prisma-deck.repository';

jest.mock('../../../../common/pagination/paginate', () => ({
  paginate: jest.fn(),
}));

describe('PrismaDeckRepository.searchPublicDecks', () => {
  it('filters public decks by language', async () => {
    jest.mocked(paginate).mockResolvedValueOnce({
      data: [],
      meta: {
        currentPage: 1,
        perPage: 12,
        total: 0,
        lastPage: 1,
        prev: 0,
        next: 0,
      },
    });
    const deck = {} as PrismaService['deck'];
    const repository = new PrismaDeckRepository({ deck } as PrismaService);

    await repository.searchPublicDecks({
      language: 'uk',
    } as Parameters<PrismaDeckRepository['searchPublicDecks']>[0]);

    expect(paginate).toHaveBeenCalledWith(
      deck,
      expect.objectContaining({
        where: expect.objectContaining({ language: 'uk' }),
      }),
      expect.anything(),
    );
  });
});
