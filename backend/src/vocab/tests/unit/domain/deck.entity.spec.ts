import { Deck } from '../../../domain/entities/deck.entity';
import { CEFRLevel, DeckStatus, DeckType, DeckVisibility } from '../../../domain/enums/vocab.enums';
import {
  DeckPublishInvalidException,
  InvalidDeckDataException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

describe('Deck Entity', () => {
  const defaultProps = {
    ownerUserId: 'user-1',
    title: 'Spanish Basics',
    description: 'Basic vocabulary for Spanish learners',
    language: 'es',
    level: CEFRLevel.A1,
    tags: ['spanish', 'beginner'],
    visibility: DeckVisibility.PRIVATE,
  };

  it('should create a deck with default DRAFT status and USER_GENERATED type', () => {
    const deck = Deck.create(defaultProps);

    expect(deck.title).toBe('Spanish Basics');
    expect(deck.ownerUserId).toBe('user-1');
    expect(deck.status).toBe(DeckStatus.DRAFT);
    expect(deck.type).toBe(DeckType.USER_GENERATED);
    expect(deck.visibility).toBe(DeckVisibility.PRIVATE);
    expect(deck.language).toBe('es');
    expect(deck.tags).toEqual(['spanish', 'beginner']);
    expect(deck.cardCount).toBe(0);
  });

  it('should throw an error when title is empty', () => {
    expect(() => {
      Deck.create({ ...defaultProps, title: '   ' });
    }).toThrow(InvalidDeckDataException);
  });

  it('should throw an error when title exceeds 100 characters', () => {
    expect(() => {
      Deck.create({ ...defaultProps, title: 'a'.repeat(101) });
    }).toThrow(InvalidDeckDataException);
  });

  it('should throw an error when ownerUserId is missing', () => {
    expect(() => {
      Deck.create({ ...defaultProps, ownerUserId: '' });
    }).toThrow(InvalidDeckDataException);
  });

  it('should update metadata properly', () => {
    const deck = Deck.create(defaultProps);
    deck.updateMetadata({
      title: 'Advanced Spanish',
      level: CEFRLevel.B2,
      visibility: DeckVisibility.PUBLIC,
    });

    expect(deck.title).toBe('Advanced Spanish');
    expect(deck.level).toBe(CEFRLevel.B2);
    expect(deck.visibility).toBe(DeckVisibility.PUBLIC);
  });

  describe('Publish Invariant', () => {
    it('should throw DeckPublishInvalidException when publishing with fewer than 2 cards', () => {
      const deck = Deck.create(defaultProps);
      expect(() => deck.publish(0)).toThrow(DeckPublishInvalidException);
      expect(() => deck.publish(1)).toThrow(DeckPublishInvalidException);
    });

    it('should successfully publish when deck has 2 or more cards', () => {
      const deck = Deck.create(defaultProps);
      deck.publish(2);
      expect(deck.status).toBe(DeckStatus.PUBLISHED);

      const deck2 = Deck.create(defaultProps);
      deck2.publish(15);
      expect(deck2.status).toBe(DeckStatus.PUBLISHED);
    });
  });

  describe('Lifecycle State Transitions', () => {
    it('should unpublish a published deck back to DRAFT', () => {
      const deck = Deck.create(defaultProps);
      deck.publish(5);
      expect(deck.status).toBe(DeckStatus.PUBLISHED);

      deck.unpublish();
      expect(deck.status).toBe(DeckStatus.DRAFT);
    });

    it('should archive and restore a deck', () => {
      const deck = Deck.create(defaultProps);
      deck.archive();
      expect(deck.status).toBe(DeckStatus.ARCHIVED);

      deck.restore();
      expect(deck.status).toBe(DeckStatus.DRAFT);
    });
  });

  describe('Access and Ownership Checks', () => {
    it('should correctly identify owner', () => {
      const deck = Deck.create(defaultProps);
      expect(deck.isOwnedBy('user-1')).toBe(true);
      expect(deck.isOwnedBy('user-2')).toBe(false);
    });

    it('should allow public access for PUBLIC or UNLISTED decks', () => {
      const publicDeck = Deck.create({ ...defaultProps, visibility: DeckVisibility.PUBLIC });
      expect(publicDeck.isAccessibleBy(null)).toBe(true);
      expect(publicDeck.isAccessibleBy('anonymous')).toBe(true);

      const unlistedDeck = Deck.create({ ...defaultProps, visibility: DeckVisibility.UNLISTED });
      expect(unlistedDeck.isAccessibleBy(null)).toBe(true);
      expect(unlistedDeck.isAccessibleBy('user-2')).toBe(true);
    });

    it('should restrict PRIVATE deck access strictly to the owner', () => {
      const privateDeck = Deck.create({ ...defaultProps, visibility: DeckVisibility.PRIVATE });
      expect(privateDeck.isAccessibleBy('user-1')).toBe(true);
      expect(privateDeck.isAccessibleBy('user-2')).toBe(false);
      expect(privateDeck.isAccessibleBy(null)).toBe(false);
    });
  });

  describe('Deck.fork', () => {
    it('should create a valid forked deck copy with new owner and DRAFT PRIVATE status', () => {
      const sourceDeck = Deck.create({
        ...defaultProps,
        title: 'Original Deck',
        visibility: DeckVisibility.PUBLIC,
        status: DeckStatus.PUBLISHED,
      });

      const forked = Deck.fork(sourceDeck, 'user-2', 'copy-of-original-deck-abc');

      expect(forked.ownerUserId).toBe('user-2');
      expect(forked.title).toBe('Copy of Original Deck');
      expect(forked.slug).toBe('copy-of-original-deck-abc');
      expect(forked.visibility).toBe(DeckVisibility.PRIVATE);
      expect(forked.status).toBe(DeckStatus.DRAFT);
      expect(forked.forkedFromDeckId).toBe(sourceDeck.id);
      expect(forked.tags).toEqual(['spanish', 'beginner']);
    });
  });
});
