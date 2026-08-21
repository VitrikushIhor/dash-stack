import { Injectable, Inject } from '@nestjs/common';
import { DeckRepositoryPort, SearchPublicDecksFilter } from '../ports/deck-repository.port';
import { PaginatedResult } from '../../../common/pagination/pagination.models';
import { Deck } from '../../domain/entities/deck.entity';

@Injectable()
export class SearchPublicDecksUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
  ) {}

  async execute(filter: SearchPublicDecksFilter): Promise<PaginatedResult<Deck>> {
    return this.deckRepository.searchPublicDecks(filter);
  }
}
