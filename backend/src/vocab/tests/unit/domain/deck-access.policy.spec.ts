import { Deck } from '../../../domain/entities/deck.entity';
import { DeckStatus, DeckType, DeckVisibility } from '../../../domain/enums/vocab.enums';
import { DeckAccessAction, DeckAccessPolicy } from '../../../domain/policies/deck-access.policy';

describe('DeckAccessPolicy', () => {
  const createDeck = (visibility: DeckVisibility, status: DeckStatus): Deck =>
    Deck.create({
      id: 'deck-1',
      ownerUserId: 'owner-1',
      title: 'Vocabulary deck',
      language: 'en',
      tags: [],
      visibility,
      status,
      type: DeckType.USER_GENERATED,
    });

  it('denies a guest from viewing a public draft deck', () => {
    const deck = createDeck(DeckVisibility.PUBLIC, DeckStatus.DRAFT);

    expect(DeckAccessPolicy.canAccess(deck, DeckAccessAction.VIEW, null)).toBe(false);
  });

  it('denies an authenticated non-owner from studying an unlisted archived deck', () => {
    const deck = createDeck(DeckVisibility.UNLISTED, DeckStatus.ARCHIVED);

    expect(DeckAccessPolicy.canAccess(deck, DeckAccessAction.STUDY, 'user-2')).toBe(false);
  });

  it('allows an owner to view a private draft deck', () => {
    const deck = createDeck(DeckVisibility.PRIVATE, DeckStatus.DRAFT);

    expect(DeckAccessPolicy.canAccess(deck, DeckAccessAction.VIEW, 'owner-1')).toBe(true);
  });

  it('allows a guest to view a published public deck', () => {
    const deck = createDeck(DeckVisibility.PUBLIC, DeckStatus.PUBLISHED);

    expect(DeckAccessPolicy.canAccess(deck, DeckAccessAction.VIEW, null)).toBe(true);
  });
});
