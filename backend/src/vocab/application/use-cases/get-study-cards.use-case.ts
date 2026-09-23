import { Inject, Injectable } from '@nestjs/common';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { VocabProgressRepositoryPort } from '../ports/vocab-progress-repository.port';
import { GetStudyCardsQuery, StudyMode } from '../queries/get-study-cards.query';
import { StudyCardReadModel } from '../read-models/study-card.read-model';
import {
  DeckNotFoundException,
  DeckAccessForbiddenException,
  PersonalizedStudyFilterAuthRequiredException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { LEARN_SESSION_MAX_CARDS } from '../constants/import-limits';

@Injectable()
export class GetStudyCardsUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
    @Inject('VocabProgressRepositoryPort')
    private readonly vocabProgressRepository: VocabProgressRepositoryPort,
  ) {}

  public async execute(query: GetStudyCardsQuery): Promise<StudyCardReadModel[]> {
    const { userId, deckId, onlyStarred, onlyDue } = query;

    const deck = await this.deckRepository.findForAccess(deckId);

    if (!deck) {
      throw new DeckNotFoundException(deckId);
    }

    if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.STUDY, userId)) {
      throw new DeckAccessForbiddenException();
    }

    if (!userId && (onlyStarred || onlyDue)) {
      throw new PersonalizedStudyFilterAuthRequiredException();
    }

    return this.vocabProgressRepository.getStudyCards(userId, deckId, {
      onlyStarred: !!onlyStarred,
      onlyDue: !!onlyDue,
      ...(query.mode === StudyMode.LEARN ? { limit: LEARN_SESSION_MAX_CARDS } : {}),
    });
  }
}
