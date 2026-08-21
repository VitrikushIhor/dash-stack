import { DeckStatus } from '../enums/vocab.enums';
import { DeckPublishInvalidException } from '../exceptions/vocab-domain.exceptions';

export class DeckLifecyclePolicy {
  static readonly MIN_CARDS_FOR_PUBLISH = 2;

  static validatePublishEligibility(cardCount: number): void {
    if (cardCount < this.MIN_CARDS_FOR_PUBLISH) {
      throw new DeckPublishInvalidException(cardCount);
    }
  }

  static canTransition(from: DeckStatus, to: DeckStatus): boolean {
    switch (from) {
      case DeckStatus.DRAFT:
        return to === DeckStatus.PUBLISHED || to === DeckStatus.ARCHIVED;
      case DeckStatus.PUBLISHED:
        return to === DeckStatus.DRAFT || to === DeckStatus.ARCHIVED;
      case DeckStatus.ARCHIVED:
        return to === DeckStatus.DRAFT;
      default:
        return false;
    }
  }
}
