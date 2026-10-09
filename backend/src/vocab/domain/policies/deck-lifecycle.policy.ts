import { DeckLifecycleAction, DeckStatus } from '../enums/vocab.enums';
import {
  DeckLifecycleInvalidTransitionException,
  DeckPublishInvalidException,
} from '../exceptions/vocab-domain.exceptions';

export class DeckLifecyclePolicy {
  static readonly MIN_CARDS_FOR_PUBLISH = 2;

  private static readonly ALLOWED_ACTIONS: Record<DeckStatus, readonly DeckLifecycleAction[]> = {
    [DeckStatus.DRAFT]: [DeckLifecycleAction.PUBLISH],
    [DeckStatus.PUBLISHED]: [DeckLifecycleAction.UNPUBLISH, DeckLifecycleAction.ARCHIVE],
    [DeckStatus.ARCHIVED]: [DeckLifecycleAction.RESTORE],
  };

  private static readonly ACTION_TARGET_STATUS: Record<DeckLifecycleAction, DeckStatus> = {
    [DeckLifecycleAction.PUBLISH]: DeckStatus.PUBLISHED,
    [DeckLifecycleAction.UNPUBLISH]: DeckStatus.DRAFT,
    [DeckLifecycleAction.ARCHIVE]: DeckStatus.ARCHIVED,
    [DeckLifecycleAction.RESTORE]: DeckStatus.DRAFT,
  };

  static validatePublishEligibility(cardCount: number): void {
    if (cardCount < this.MIN_CARDS_FOR_PUBLISH) {
      throw new DeckPublishInvalidException(cardCount);
    }
  }

  static assertCanPerform(action: DeckLifecycleAction, currentStatus: DeckStatus): void {
    if (!this.ALLOWED_ACTIONS[currentStatus].includes(action)) {
      throw new DeckLifecycleInvalidTransitionException(
        currentStatus,
        this.ACTION_TARGET_STATUS[action],
      );
    }
  }
}
