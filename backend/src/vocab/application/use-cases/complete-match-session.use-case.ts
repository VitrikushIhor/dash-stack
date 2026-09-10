import { Inject, Injectable } from '@nestjs/common';
import {
  MatchAuthenticationRequiredException,
  MatchSessionAlreadyCompletedException,
  MatchSessionNotFoundException,
} from '../../domain/exceptions/match-domain.exceptions';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { MatchResultPolicy } from '../../domain/policies/match-result.policy';
import { CompleteMatchSessionCommand } from '../commands/match-session.command';
import { MatchClockPort } from '../ports/match-clock.port';
import { MatchTransactionPort } from '../ports/match-transaction.port';
import { MatchCompletionReadModel } from '../read-models/match.read-model';

@Injectable()
export class CompleteMatchSessionUseCase {
  constructor(
    @Inject('MatchTransactionPort') private readonly transaction: MatchTransactionPort,
    @Inject('MatchClockPort') private readonly clock: MatchClockPort,
  ) {}

  async execute(command: CompleteMatchSessionCommand): Promise<MatchCompletionReadModel> {
    const { deckId, userId, sessionId } = command;
    if (!userId) throw new MatchAuthenticationRequiredException();
    return this.transaction.run(async ({ deckRepository, matchRepository }) => {
      const deck = await deckRepository.findById(deckId);
      if (!deck) throw new DeckNotFoundException(deckId);
      if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.STUDY, userId)) {
        throw new DeckAccessForbiddenException();
      }
      const session = await matchRepository.findSession({ sessionId, deckId, userId });
      if (!session) throw new MatchSessionNotFoundException();
      const result = session.complete(deckId, userId, this.clock.now());
      if (!(await matchRepository.completeSession(session))) {
        throw new MatchSessionAlreadyCompletedException();
      }
      const previous = await matchRepository.findBest(deckId, userId);
      const bestResult =
        previous !== null && !MatchResultPolicy.isBetter(result, previous)
          ? previous
          : await matchRepository.saveBest(result);
      return {
        sessionId,
        durationMs: result.durationMs,
        cardCount: result.cardCount,
        completedAt: result.createdAt,
        bestResult,
      };
    });
  }
}
