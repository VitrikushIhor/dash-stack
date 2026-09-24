import { Deck } from '../../../domain/entities/deck.entity';
import { DeckStatus, DeckType, DeckVisibility } from '../../../domain/enums/vocab.enums';
import { DeckAccessAction, DeckAccessPolicy } from '../../../domain/policies/deck-access.policy';

const ownerUserId = 'owner-1';
const nonOwnerUserId = 'user-2';
const allActions: DeckAccessAction[] = [
  DeckAccessAction.VIEW,
  DeckAccessAction.STUDY,
  DeckAccessAction.EDIT,
  DeckAccessAction.FORK,
  DeckAccessAction.STAR,
  DeckAccessAction.EXPORT,
  DeckAccessAction.SUBMIT_PROGRESS,
  DeckAccessAction.SUBMIT_MATCH_SCORE,
];
const guestSharedActions: DeckAccessAction[] = [DeckAccessAction.VIEW, DeckAccessAction.STUDY];
const authenticatedSharedActions: DeckAccessAction[] = [
  ...guestSharedActions,
  DeckAccessAction.FORK,
  DeckAccessAction.STAR,
  DeckAccessAction.SUBMIT_PROGRESS,
  DeckAccessAction.SUBMIT_MATCH_SCORE,
];

describe('DeckAccessPolicy', () => {
  const createDeck = (visibility: DeckVisibility, status: DeckStatus): Deck =>
    Deck.create({
      id: 'deck-1',
      ownerUserId,
      title: 'Vocabulary deck',
      language: 'en',
      tags: [],
      visibility,
      status,
      type: DeckType.USER_GENERATED,
    });

  const expectActions = (deck: Deck, userId: string | null, allowedActions: DeckAccessAction[]) => {
    for (const action of allActions) {
      expect(DeckAccessPolicy.canAccess(deck, action, userId)).toBe(
        allowedActions.includes(action),
      );
    }
  };

  describe.each([DeckVisibility.PUBLIC, DeckVisibility.UNLISTED])(
    'for a published %s deck',
    (visibility) => {
      const deck = createDeck(visibility, DeckStatus.PUBLISHED);

      it('allows every action for the owner', () => {
        expectActions(deck, ownerUserId, allActions);
      });

      it('allows read-only study for a guest', () => {
        expectActions(deck, null, guestSharedActions);
      });

      it('allows personalized actions for an authenticated non-owner', () => {
        expectActions(deck, nonOwnerUserId, authenticatedSharedActions);
      });
    },
  );

  describe.each([
    [DeckVisibility.PRIVATE, DeckStatus.PUBLISHED],
    [DeckVisibility.PRIVATE, DeckStatus.DRAFT],
    [DeckVisibility.PRIVATE, DeckStatus.ARCHIVED],
    [DeckVisibility.PUBLIC, DeckStatus.DRAFT],
    [DeckVisibility.PUBLIC, DeckStatus.ARCHIVED],
    [DeckVisibility.UNLISTED, DeckStatus.DRAFT],
    [DeckVisibility.UNLISTED, DeckStatus.ARCHIVED],
  ])('for a %s %s deck', (visibility, status) => {
    const deck = createDeck(visibility, status);

    it('allows every action for the owner', () => {
      expectActions(deck, ownerUserId, allActions);
    });

    it('denies every action for a guest', () => {
      expectActions(deck, null, []);
    });

    it('denies every action for an authenticated non-owner', () => {
      expectActions(deck, nonOwnerUserId, []);
    });
  });
});
