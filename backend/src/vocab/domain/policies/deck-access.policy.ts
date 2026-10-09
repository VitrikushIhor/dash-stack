import { Deck } from '../entities/deck.entity';
import { DeckStatus, DeckVisibility } from '../enums/vocab.enums';

export const DeckAccessAction = {
  VIEW: 'VIEW',
  STUDY: 'STUDY',
  EDIT: 'EDIT',
  FORK: 'FORK',
  STAR: 'STAR',
  EXPORT: 'EXPORT',
  SUBMIT_PROGRESS: 'SUBMIT_PROGRESS',
  SUBMIT_MATCH_SCORE: 'SUBMIT_MATCH_SCORE',
} as const;

export type DeckAccessAction = (typeof DeckAccessAction)[keyof typeof DeckAccessAction];

export class DeckAccessPolicy {
  static canAccess(deck: Deck, action: DeckAccessAction, userId?: string | null): boolean {
    if (userId && deck.isOwnedBy(userId)) {
      return true;
    }

    if (deck.status !== DeckStatus.PUBLISHED) {
      return false;
    }

    const isSharedDeck =
      deck.visibility === DeckVisibility.PUBLIC || deck.visibility === DeckVisibility.UNLISTED;

    if (!isSharedDeck) {
      return false;
    }

    if (action === DeckAccessAction.VIEW || action === DeckAccessAction.STUDY) {
      return true;
    }

    if (!userId) {
      return false;
    }

    return (
      action === DeckAccessAction.FORK ||
      action === DeckAccessAction.STAR ||
      action === DeckAccessAction.SUBMIT_PROGRESS ||
      action === DeckAccessAction.SUBMIT_MATCH_SCORE
    );
  }
}
