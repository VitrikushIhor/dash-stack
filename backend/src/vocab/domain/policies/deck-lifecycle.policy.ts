import { DeckStatus } from '../enums/vocab.enums';
import { DeckPublishInvalidException } from '../exceptions/vocab-domain.exceptions';

export class DeckLifecyclePolicy {
  static readonly MIN_CARDS_FOR_PUBLISH = 2;

  private static readonly ALLOWED_TRANSITIONS: Record<DeckStatus, readonly DeckStatus[]> = {
    [DeckStatus.DRAFT]: [DeckStatus.PUBLISHED, DeckStatus.ARCHIVED],
    [DeckStatus.PUBLISHED]: [DeckStatus.DRAFT, DeckStatus.ARCHIVED],
    [DeckStatus.ARCHIVED]: [DeckStatus.DRAFT],
  };

  static validatePublishEligibility(cardCount: number): void {
    if (cardCount < this.MIN_CARDS_FOR_PUBLISH) {
      throw new DeckPublishInvalidException(cardCount);
    }
  }

  static canTransition(from: DeckStatus, to: DeckStatus): boolean {
    return this.ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }
}
