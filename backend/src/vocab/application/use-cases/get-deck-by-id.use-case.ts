import { Injectable, Inject } from '@nestjs/common';
import { Deck } from '../../domain/entities/deck.entity';
import { DeckNotFoundException } from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { DeckRepositoryPort } from '../ports/deck-repository.port';

export interface GetDeckByIdQuery {
  deckId: string;
  userId?: string | null;
}

@Injectable()
export class GetDeckByIdUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
  ) {}

  async execute(query: GetDeckByIdQuery): Promise<Deck> {
    const deck = await this.deckRepository.findById(query.deckId);

    if (!deck || !DeckAccessPolicy.canAccess(deck, DeckAccessAction.VIEW, query.userId)) {
      throw new DeckNotFoundException(query.deckId);
    }

    return deck;
  }
}
