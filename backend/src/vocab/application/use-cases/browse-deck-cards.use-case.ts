import { Inject, Injectable } from '@nestjs/common';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { VocabProgressRepositoryPort } from '../ports/vocab-progress-repository.port';
import { BrowseDeckCardsQuery } from '../queries/browse-deck-cards.query';
import { BrowsedDeckCardsReadModel } from '../read-models/browsed-deck-cards.read-model';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';

@Injectable()
export class BrowseDeckCardsUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
    @Inject('VocabProgressRepositoryPort')
    private readonly progressRepository: VocabProgressRepositoryPort,
  ) {}

  async execute(query: BrowseDeckCardsQuery): Promise<BrowsedDeckCardsReadModel> {
    const deck = await this.deckRepository.findForAccess(query.deckId);

    if (!deck) throw new DeckNotFoundException(query.deckId);
    if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.VIEW, query.userId)) {
      throw new DeckAccessForbiddenException();
    }

    return this.progressRepository.browseDeckCards(query.userId, query.deckId, {
      search: query.search,
      page: query.page,
      perPage: query.perPage,
    });
  }
}
