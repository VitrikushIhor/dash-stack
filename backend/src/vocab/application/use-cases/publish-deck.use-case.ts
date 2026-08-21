import { Injectable, Inject } from '@nestjs/common';
import { Deck } from '../../domain/entities/deck.entity';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckRepositoryPort } from '../ports/deck-repository.port';

export interface PublishDeckCommand {
  deckId: string;
  userId: string;
}

@Injectable()
export class PublishDeckUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
  ) {}

  async execute(command: PublishDeckCommand): Promise<Deck> {
    const deck = await this.deckRepository.findById(command.deckId);

    if (!deck) {
      throw new DeckNotFoundException(command.deckId);
    }

    if (!deck.isOwnedBy(command.userId)) {
      throw new DeckAccessForbiddenException();
    }

    const cardCount = await this.deckRepository.countFlashcardsByDeckId(command.deckId);
    deck.publish(cardCount);

    return this.deckRepository.save(deck);
  }
}
