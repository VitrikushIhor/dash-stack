import { Inject, Injectable } from '@nestjs/common';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { VocabProgressRepositoryPort } from '../ports/vocab-progress-repository.port';
import { GetStudyCardsQuery } from '../queries/get-study-cards.query';
import { StudyCardReadModel } from '../read-models/study-card.read-model';
import {
  DeckNotFoundException,
  DeckAccessForbiddenException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckVisibility } from '../../domain/enums/vocab.enums';

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

    const deck = await this.deckRepository.findById(deckId);
    if (!deck) {
      throw new DeckNotFoundException(deckId);
    }

    // Access check: PRIVATE decks can only be studied by their owner
    if (deck.visibility === DeckVisibility.PRIVATE && (!userId || deck.ownerUserId !== userId)) {
      throw new DeckAccessForbiddenException();
    }

    return this.vocabProgressRepository.getStudyCards(userId, deckId, {
      onlyStarred: !!onlyStarred,
      onlyDue: !!onlyDue,
    });
  }
}
