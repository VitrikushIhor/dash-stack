import { Inject, Injectable } from '@nestjs/common';
import { Deck } from '../../domain/entities/deck.entity';
import { DeckNotFoundException } from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { DeckMetadataRepositoryPort } from '../ports/deck-repository.port';

interface GetDeckMetadataQuery {
  deckId: string;
  userId?: string | null;
}

@Injectable()
export class GetDeckMetadataUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckMetadataRepositoryPort,
  ) {}

  async execute(query: GetDeckMetadataQuery): Promise<Deck> {
    const deck = await this.deckRepository.findMetadataById(query.deckId);

    if (!deck || !DeckAccessPolicy.canAccess(deck, DeckAccessAction.VIEW, query.userId)) {
      throw new DeckNotFoundException(query.deckId);
    }

    return deck;
  }
}
