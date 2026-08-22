import { Inject, Injectable } from '@nestjs/common';
import { VocabProgressRepositoryPort } from '../ports/vocab-progress-repository.port';
import { GetDueReviewsQuery } from '../queries/get-due-reviews.query';
import { DueReviewsReadModel } from '../read-models/due-reviews.read-model';

@Injectable()
export class GetDueReviewsUseCase {
  constructor(
    @Inject('VocabProgressRepositoryPort')
    private readonly vocabProgressRepository: VocabProgressRepositoryPort,
  ) {}

  public async execute(query: GetDueReviewsQuery): Promise<DueReviewsReadModel> {
    return this.vocabProgressRepository.getDueReviews(query.userId, query.deckId);
  }
}
