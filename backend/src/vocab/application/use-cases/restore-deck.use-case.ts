import { Injectable, Inject } from '@nestjs/common';
import { Deck } from '../../domain/entities/deck.entity';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';

interface RestoreDeckCommand {
  deckId: string;
  userId: string;
}

@Injectable()
export class RestoreDeckUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
  ) {}

  async execute(command: RestoreDeckCommand): Promise<Deck> {
    const deck = await this.deckRepository.findById(command.deckId);

    if (!deck) {
      throw new DeckNotFoundException(command.deckId);
    }

    if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.EDIT, command.userId)) {
      throw new DeckAccessForbiddenException();
    }

    deck.restore();

    return this.deckRepository.save(deck);
  }
}
