import { Injectable, Inject } from '@nestjs/common';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
  FlashcardNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckStatus } from '../../domain/enums/vocab.enums';
import { DeckLifecyclePolicy } from '../../domain/policies/deck-lifecycle.policy';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { FlashcardRepositoryPort } from '../ports/flashcard-repository.port';

export interface DeleteFlashcardCommand {
  deckId: string;
  cardId: string;
  userId: string;
}

@Injectable()
export class DeleteFlashcardUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
    @Inject('FlashcardRepositoryPort')
    private readonly flashcardRepository: FlashcardRepositoryPort,
  ) {}

  async execute(command: DeleteFlashcardCommand): Promise<void> {
    const deck = await this.deckRepository.findById(command.deckId);

    if (!deck) {
      throw new DeckNotFoundException(command.deckId);
    }

    if (!deck.isOwnedBy(command.userId)) {
      throw new DeckAccessForbiddenException();
    }

    const flashcard = await this.flashcardRepository.findById(command.cardId);

    if (!flashcard || flashcard.deckId !== command.deckId) {
      throw new FlashcardNotFoundException(command.cardId);
    }

    await this.flashcardRepository.delete(command.cardId);

    // Invariant check: if a published deck falls below minimum required cards, demote to DRAFT
    if (deck.status === DeckStatus.PUBLISHED) {
      const remainingCount = await this.deckRepository.countFlashcardsByDeckId(command.deckId);
      if (remainingCount < DeckLifecyclePolicy.MIN_CARDS_FOR_PUBLISH) {
        deck.unpublish();
        await this.deckRepository.save(deck);
      }
    }
  }
}
