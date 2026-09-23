import { PrismaService } from 'nestjs-prisma';
import { paginate } from '../../../../common/pagination/paginate';
import { PrismaDeckRepository } from '../../../../vocab/infrastructure/persistence/prisma-deck.repository';

jest.mock('../../../../common/pagination/paginate', () => ({
  paginate: jest.fn(),
}));

describe('PrismaDeckRepository.searchPublicDecks', () => {
  it('loads_creator_and_counts_for_deck_details', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const repository = new PrismaDeckRepository({
      deck: { findUnique },
    } as unknown as PrismaService);

    await repository.findById('deck-1');

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          owner: { select: { firstName: true, lastName: true, avatar: true } },
          _count: { select: { flashcards: true, forks: true } },
        }),
      }),
    );
  });

  it('loads only deck columns for an access check', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const repository = new PrismaDeckRepository({
      deck: { findUnique },
    } as unknown as PrismaService);

    await repository.findForAccess('deck-1');

    expect(findUnique).toHaveBeenCalledWith({ where: { id: 'deck-1' } });
  });

  it('loads_public_creator_card_and_fork_counts_in_one_query', async () => {
    jest.mocked(paginate).mockResolvedValueOnce({
      data: [],
      meta: { currentPage: 1, perPage: 12, total: 0, lastPage: 1, prev: null, next: null },
    });
    const deck = {} as PrismaService['deck'];
    const repository = new PrismaDeckRepository({ deck } as PrismaService);

    await repository.searchPublicDecks({ page: 1, perPage: 12 });

    expect(paginate).toHaveBeenCalledWith(
      deck,
      expect.objectContaining({
        orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
        include: {
          owner: { select: { firstName: true, lastName: true, avatar: true } },
          _count: { select: { flashcards: true, forks: true } },
        },
      }),
      { page: 1, perPage: 12 },
    );
  });

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
