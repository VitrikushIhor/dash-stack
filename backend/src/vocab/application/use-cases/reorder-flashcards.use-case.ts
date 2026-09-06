import { Injectable, Inject } from '@nestjs/common';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
  InvalidFlashcardDataException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { FlashcardRepositoryPort } from '../ports/flashcard-repository.port';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { VOCAB_ERRORS } from '../../domain/constants/vocab-errors';

export interface ReorderFlashcardsCommand {
  deckId: string;
  userId: string;
  orderedCardIds: string[];
}

@Injectable()
export class ReorderFlashcardsUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
    @Inject('FlashcardRepositoryPort')
    private readonly flashcardRepository: FlashcardRepositoryPort,
  ) {}

  async execute(command: ReorderFlashcardsCommand): Promise<void> {
    const deck = await this.deckRepository.findById(command.deckId);

    if (!deck) {
      throw new DeckNotFoundException(command.deckId);
    }

    if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.EDIT, command.userId)) {
      throw new DeckAccessForbiddenException();
    }

    const cards = await this.flashcardRepository.findByDeckId(command.deckId);
    const persistedCardIds = new Set(cards.map((card) => card.id));
    const submittedCardIds = new Set(command.orderedCardIds);

    if (
      command.orderedCardIds.length !== cards.length ||
      submittedCardIds.size !== cards.length ||
      [...submittedCardIds].some((cardId) => !persistedCardIds.has(cardId))
    ) {
      throw new InvalidFlashcardDataException(
        VOCAB_ERRORS.FLASHCARD_ORDER_MUST_BE_EXACT_PERMUTATION,
      );
    }

    await this.flashcardRepository.updatePositions(command.deckId, command.orderedCardIds);
  }
}
