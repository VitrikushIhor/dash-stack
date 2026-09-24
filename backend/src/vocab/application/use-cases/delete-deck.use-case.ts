import { Injectable, Inject } from '@nestjs/common';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';

interface DeleteDeckCommand {
  deckId: string;
  userId: string;
}

@Injectable()
export class DeleteDeckUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
  ) {}

  async execute(command: DeleteDeckCommand): Promise<void> {
    const deck = await this.deckRepository.findById(command.deckId);

    if (!deck) {
      throw new DeckNotFoundException(command.deckId);
    }

    if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.EDIT, command.userId)) {
      throw new DeckAccessForbiddenException();
    }

    await this.deckRepository.delete(command.deckId);
  }
}
