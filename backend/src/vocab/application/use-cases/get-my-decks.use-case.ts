import { Injectable, Inject } from '@nestjs/common';
import { Deck } from '../../domain/entities/deck.entity';
import { DeckStatus } from '../../domain/enums/vocab.enums';
import { DeckRepositoryPort } from '../ports/deck-repository.port';

export interface GetMyDecksQuery {
  userId: string;
  status?: DeckStatus;
}

@Injectable()
export class GetMyDecksUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
  ) {}

  async execute(query: GetMyDecksQuery): Promise<Deck[]> {
    return this.deckRepository.findMyDecks({
      ownerUserId: query.userId,
      status: query.status,
    });
  }
}
