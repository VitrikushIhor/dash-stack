import { Injectable, Inject } from '@nestjs/common';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
  FlashcardNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckLifecyclePolicy } from '../../domain/policies/deck-lifecycle.policy';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { FlashcardRepositoryPort } from '../ports/flashcard-repository.port';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';

interface DeleteFlashcardCommand {
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

    if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.EDIT, command.userId)) {
      throw new DeckAccessForbiddenException();
    }

    const flashcard = await this.flashcardRepository.findById(command.cardId);

    if (!flashcard || flashcard.deckId !== command.deckId) {
      throw new FlashcardNotFoundException(command.cardId);
    }

    await this.flashcardRepository.deleteAndDemotePublishedDeckIfBelowMinimum({
      cardId: command.cardId,
      deckId: command.deckId,
      minimumCardCount: DeckLifecyclePolicy.MIN_CARDS_FOR_PUBLISH,
    });
  }
}
