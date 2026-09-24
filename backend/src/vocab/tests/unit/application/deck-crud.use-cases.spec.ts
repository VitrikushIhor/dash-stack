import { CreateDeckUseCase } from '../../../application/use-cases/create-deck.use-case';
import { GetMyDecksUseCase } from '../../../application/use-cases/get-my-decks.use-case';
import { GetDeckByIdUseCase } from '../../../application/use-cases/get-deck-by-id.use-case';
import { UpdateDeckUseCase } from '../../../application/use-cases/update-deck.use-case';
import { DeleteDeckUseCase } from '../../../application/use-cases/delete-deck.use-case';
import { PublishDeckUseCase } from '../../../application/use-cases/publish-deck.use-case';
import { DeckRepositoryPort } from '../../../application/ports/deck-repository.port';
import { Deck } from '../../../domain/entities/deck.entity';
import { CEFRLevel, DeckStatus, DeckVisibility } from '../../../domain/enums/vocab.enums';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
  DeckPublishInvalidException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

describe('Deck Use Cases', () => {
  let mockDeckRepository: jest.Mocked<DeckRepositoryPort>;
  let createDeckUseCase: CreateDeckUseCase;
  let getMyDecksUseCase: GetMyDecksUseCase;
  let getDeckByIdUseCase: GetDeckByIdUseCase;
  let updateDeckUseCase: UpdateDeckUseCase;
  let deleteDeckUseCase: DeleteDeckUseCase;
  let publishDeckUseCase: PublishDeckUseCase;

  beforeEach(() => {
    mockDeckRepository = {
      save: jest.fn((deck: Deck) => Promise.resolve(deck)),
      updateMetadata: jest.fn((_, metadata) => {
        const deck = Deck.create({
          id: 'deck-1',
          ownerUserId: 'user-1',
          title: metadata.title ?? 'Old Title',
        });

        return Promise.resolve(deck);
      }),
      publish: jest.fn((deckId: string) =>
        Promise.resolve(
          Deck.create({
            id: deckId,
            ownerUserId: 'user-1',
            title: 'Ready Deck',
            status: DeckStatus.PUBLISHED,
          }),
        ),
      ),
      findForAccess: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findMyDecks: jest.fn(),
      searchPublicDecks: jest.fn(),
      countFlashcardsByDeckId: jest.fn(),
      forkDeck: jest.fn(),
      delete: jest.fn(),
    };

    createDeckUseCase = new CreateDeckUseCase(mockDeckRepository);
    getMyDecksUseCase = new GetMyDecksUseCase(mockDeckRepository);
    getDeckByIdUseCase = new GetDeckByIdUseCase(mockDeckRepository);
    updateDeckUseCase = new UpdateDeckUseCase(mockDeckRepository);
    deleteDeckUseCase = new DeleteDeckUseCase(mockDeckRepository);
    publishDeckUseCase = new PublishDeckUseCase(mockDeckRepository);
  });

  describe('CreateDeckUseCase', () => {
    it('should create a deck with slug and save it', async () => {
      mockDeckRepository.findBySlug.mockResolvedValueOnce(null);

      const result = await createDeckUseCase.execute({
        ownerUserId: 'user-1',
        title: 'Essential IT Terms',
        level: CEFRLevel.B1,
      });

      expect(result.title).toBe('Essential IT Terms');
      expect(result.slug).toBe('essential-it-terms');
      expect(mockDeckRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should append a suffix if the slug already exists', async () => {
      mockDeckRepository.findBySlug
        .mockResolvedValueOnce(Deck.create({ ownerUserId: 'user-2', title: 'Test' }))
        .mockResolvedValueOnce(null);

      const result = await createDeckUseCase.execute({
        ownerUserId: 'user-1',
        title: 'Essential IT Terms',
      });

      expect(result.slug).toBe('essential-it-terms-1');
    });
  });

  describe('GetMyDecksUseCase', () => {
    it('should return all decks for the user', async () => {
      const mockDecks = [
        Deck.create({ id: 'deck-1', ownerUserId: 'user-1', title: 'Deck 1' }),
        Deck.create({ id: 'deck-2', ownerUserId: 'user-1', title: 'Deck 2' }),
      ];
      mockDeckRepository.findMyDecks.mockResolvedValueOnce(mockDecks);

      const result = await getMyDecksUseCase.execute({ userId: 'user-1' });

      expect(result).toHaveLength(2);
      expect(mockDeckRepository.findMyDecks).toHaveBeenCalledWith({
        ownerUserId: 'user-1',
        status: undefined,
      });
    });
  });

  describe('GetDeckByIdUseCase', () => {
    it('should return deck if public for unauthenticated user', async () => {
      const deck = Deck.create({
        id: 'deck-pub',
        ownerUserId: 'user-1',
        title: 'Public Deck',
        visibility: DeckVisibility.PUBLIC,
        status: DeckStatus.PUBLISHED,
      });
      mockDeckRepository.findById.mockResolvedValueOnce(deck);

      const result = await getDeckByIdUseCase.execute({ deckId: 'deck-pub', userId: null });
      expect(result.id).toBe('deck-pub');
    });

    it('should throw NotFoundException if deck is PRIVATE and user is not owner', async () => {
      const deck = Deck.create({
        id: 'deck-priv',
        ownerUserId: 'user-1',
        title: 'Private Deck',
        visibility: DeckVisibility.PRIVATE,
      });
      mockDeckRepository.findById.mockResolvedValueOnce(deck);

      await expect(
        getDeckByIdUseCase.execute({ deckId: 'deck-priv', userId: 'user-2' }),
      ).rejects.toThrow(DeckNotFoundException);
    });

    it('should return PRIVATE deck if requester is the owner', async () => {
      const deck = Deck.create({
        id: 'deck-priv',
        ownerUserId: 'user-1',
        title: 'Private Deck',
        visibility: DeckVisibility.PRIVATE,
      });
      mockDeckRepository.findById.mockResolvedValueOnce(deck);

      const result = await getDeckByIdUseCase.execute({ deckId: 'deck-priv', userId: 'user-1' });
      expect(result.id).toBe('deck-priv');
    });
  });

  describe('UpdateDeckUseCase', () => {
    it('should update metadata when owner requests it', async () => {
      const deck = Deck.create({ id: 'deck-1', ownerUserId: 'user-1', title: 'Old Title' });
      mockDeckRepository.findById.mockResolvedValueOnce(deck);

      const result = await updateDeckUseCase.execute({
        deckId: 'deck-1',
        userId: 'user-1',
        title: 'New Title',
      });

      expect(result.title).toBe('New Title');
      expect(mockDeckRepository.updateMetadata).toHaveBeenCalledWith('deck-1', {
        title: 'New Title',
        description: undefined,
        language: undefined,
        level: undefined,
        tags: undefined,
        visibility: undefined,
      });
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      const deck = Deck.create({ id: 'deck-1', ownerUserId: 'user-1', title: 'Old Title' });
      mockDeckRepository.findById.mockResolvedValueOnce(deck);

      await expect(
        updateDeckUseCase.execute({
          deckId: 'deck-1',
          userId: 'user-2',
          title: 'Hacked Title',
        }),
      ).rejects.toThrow(DeckAccessForbiddenException);
    });
  });

  describe('DeleteDeckUseCase', () => {
    it('should delete deck when owner requests it', async () => {
      const deck = Deck.create({ id: 'deck-1', ownerUserId: 'user-1', title: 'To Delete' });
      mockDeckRepository.findById.mockResolvedValueOnce(deck);

      await deleteDeckUseCase.execute({ deckId: 'deck-1', userId: 'user-1' });
      expect(mockDeckRepository.delete).toHaveBeenCalledWith('deck-1');
    });

    it('should throw ForbiddenException if non-owner tries to delete', async () => {
      const deck = Deck.create({ id: 'deck-1', ownerUserId: 'user-1', title: 'To Delete' });
      mockDeckRepository.findById.mockResolvedValueOnce(deck);

      await expect(
        deleteDeckUseCase.execute({ deckId: 'deck-1', userId: 'user-2' }),
      ).rejects.toThrow(DeckAccessForbiddenException);
    });
  });

  describe('PublishDeckUseCase', () => {
    it('should publish when deck has at least 2 cards', async () => {
      const deck = Deck.create({ id: 'deck-1', ownerUserId: 'user-1', title: 'Ready Deck' });
      mockDeckRepository.findById.mockResolvedValueOnce(deck);
      const result = await publishDeckUseCase.execute({ deckId: 'deck-1', userId: 'user-1' });

      expect(result.status).toBe(DeckStatus.PUBLISHED);
      expect(mockDeckRepository.publish).toHaveBeenCalledWith('deck-1');
    });

    it('should throw DeckPublishInvalidException when deck has fewer than 2 cards', async () => {
      const deck = Deck.create({ id: 'deck-1', ownerUserId: 'user-1', title: 'Empty Deck' });
      mockDeckRepository.findById.mockResolvedValueOnce(deck);
      mockDeckRepository.publish.mockRejectedValueOnce(new DeckPublishInvalidException(1));

      await expect(
        publishDeckUseCase.execute({ deckId: 'deck-1', userId: 'user-1' }),
      ).rejects.toThrow(DeckPublishInvalidException);
    });
  });
});
