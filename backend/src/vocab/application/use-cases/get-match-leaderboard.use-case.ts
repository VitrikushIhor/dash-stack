import { Inject, Injectable } from '@nestjs/common';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { MatchTransactionPort } from '../ports/match-transaction.port';
import { GetMatchLeaderboardQuery } from '../queries/get-match-leaderboard.query';
import { MatchLeaderboardReadModel } from '../read-models/match.read-model';

@Injectable()
export class GetMatchLeaderboardUseCase {
  constructor(@Inject('MatchTransactionPort') private readonly transaction: MatchTransactionPort) {}

  async execute(query: GetMatchLeaderboardQuery): Promise<MatchLeaderboardReadModel> {
    return this.transaction.run(async ({ deckRepository, matchRepository }) => {
      const deck = await deckRepository.findById(query.deckId);
      if (!deck) throw new DeckNotFoundException(query.deckId);
      if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.VIEW, query.userId)) {
        throw new DeckAccessForbiddenException();
      }
      return matchRepository.getLeaderboard(query);
    });
  }
}
