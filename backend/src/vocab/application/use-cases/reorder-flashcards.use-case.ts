import { Injectable, Inject } from '@nestjs/common';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { FlashcardRepositoryPort } from '../ports/flashcard-repository.port';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';

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

    await this.flashcardRepository.updatePositions(command.deckId, command.orderedCardIds);
  }
}
