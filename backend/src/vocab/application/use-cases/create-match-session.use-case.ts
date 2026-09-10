import { Inject, Injectable } from '@nestjs/common';
import { MATCH_MAX_CARDS, MatchSession } from '../../domain/entities/match-session.entity';
import {
  InvalidMatchSessionException,
  MatchAuthenticationRequiredException,
} from '../../domain/exceptions/match-domain.exceptions';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { CreateMatchSessionCommand } from '../commands/match-session.command';
import { MatchClockPort } from '../ports/match-clock.port';
import { MatchTransactionPort } from '../ports/match-transaction.port';
import { MatchSessionReadModel } from '../read-models/match.read-model';

@Injectable()
export class CreateMatchSessionUseCase {
  constructor(
    @Inject('MatchTransactionPort') private readonly transaction: MatchTransactionPort,
    @Inject('MatchClockPort') private readonly clock: MatchClockPort,
  ) {}

  async execute(command: CreateMatchSessionCommand): Promise<MatchSessionReadModel> {
    const { deckId, userId } = command;
    if (!userId) throw new MatchAuthenticationRequiredException();
    return this.transaction.run(async ({ deckRepository, matchRepository }) => {
      const deck = await deckRepository.findById(deckId);
      if (!deck) throw new DeckNotFoundException(deckId);
      if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.STUDY, userId)) {
        throw new DeckAccessForbiddenException();
      }
      const now = this.clock.now();
      const cards = await matchRepository.selectCards({
        deckId,
        userId,
        onlyDue: !!command.onlyDue,
        onlyStarred: !!command.onlyStarred,
        now,
        limit: MATCH_MAX_CARDS,
      });
      if (cards.some((card) => card.deckId !== deckId)) throw new InvalidMatchSessionException();
      const session = MatchSession.create(
        {
          deckId,
          userId,
          selectedCardIds: cards.map((card) => card.id),
        },
        now,
      );
      const saved = (await matchRepository.createSession(session)).toSnapshot();
      return {
        id: saved.id,
        deckId: saved.deckId,
        startedAt: saved.startedAt,
        expiresAt: saved.expiresAt,
        cards,
      };
    });
  }
}
