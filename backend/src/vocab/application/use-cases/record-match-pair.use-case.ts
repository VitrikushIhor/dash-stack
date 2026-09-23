import { Inject, Injectable } from '@nestjs/common';
import { RecordMatchPairCommand } from '../commands/match-session.command';
import { MatchClockPort } from '../ports/match-clock.port';
import { MatchTransactionPort } from '../ports/match-transaction.port';
import {
  MatchAuthenticationRequiredException,
  MatchPairInvalidException,
  MatchSessionExpiredException,
  MatchSessionNotFoundException,
} from '../../domain/exceptions/match-domain.exceptions';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { createHash } from 'node:crypto';
import { PayloadHash } from '../constants/payload-hash.constants';

@Injectable()
export class RecordMatchPairUseCase {
  constructor(
    @Inject('MatchTransactionPort') private readonly transaction: MatchTransactionPort,
    @Inject('MatchClockPort') private readonly clock: MatchClockPort,
  ) {}
  async execute(command: RecordMatchPairCommand): Promise<void> {
    if (!command.userId) throw new MatchAuthenticationRequiredException();
    const userId = command.userId;
    await this.transaction.run(async ({ deckRepository, matchRepository }) => {
      const deck = await deckRepository.findById(command.deckId);

      if (!deck) throw new DeckNotFoundException(command.deckId);
      if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.STUDY, userId))
        throw new DeckAccessForbiddenException();
      const session = await matchRepository.findSession({
        sessionId: command.sessionId,
        deckId: command.deckId,
        userId,
      });

      if (!session) throw new MatchSessionNotFoundException();
      const snapshot = session.toSnapshot();
      const matchedAt = this.clock.now();

      if (matchedAt >= snapshot.expiresAt) throw new MatchSessionExpiredException();
      const selected = [command.first.cardId, command.second.cardId];

      if (
        snapshot.completedAt ||
        selected.some((cardId) => !snapshot.selectedCardIds.includes(cardId)) ||
        (command.first.cardId === command.second.cardId &&
          command.first.side === command.second.side)
      )
        throw new MatchPairInvalidException();
      const isCorrect =
        command.first.cardId === command.second.cardId &&
        command.first.side !== command.second.side;
      const payloadHash = createHash(PayloadHash.algorithm)
        .update(JSON.stringify({ first: command.first, second: command.second }))
        .digest(PayloadHash.encoding);

      if (
        !(await matchRepository.recordMatchedPair({
          sessionId: command.sessionId,
          deckId: command.deckId,
          userId,
          attemptId: command.attemptId,
          payloadHash,
          cardId: isCorrect ? command.first.cardId : null,
          isCorrect,
          matchedAt,
        }))
      )
        throw new MatchPairInvalidException();
    });
  }
}
