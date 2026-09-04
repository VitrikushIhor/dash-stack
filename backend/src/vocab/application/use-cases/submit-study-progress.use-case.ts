import { Injectable, Inject } from '@nestjs/common';
import { VocabProgress } from '../../domain/entities/vocab-progress.entity';
import {
  DeckNotFoundException,
  DeckAccessForbiddenException,
  FlashcardNotInDeckException,
  InvalidVocabProgressDataException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { FlashcardRepositoryPort } from '../ports/flashcard-repository.port';
import { VocabProgressRepositoryPort } from '../ports/vocab-progress-repository.port';
import { SubmitStudyProgressCommand } from '../commands/submit-study-progress.command';
import { VocabProgressReadModel } from '../read-models/vocab-progress.read-model';

@Injectable()
export class SubmitStudyProgressUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
    @Inject('FlashcardRepositoryPort')
    private readonly flashcardRepository: FlashcardRepositoryPort,
    @Inject('VocabProgressRepositoryPort')
    private readonly vocabProgressRepository: VocabProgressRepositoryPort,
  ) {}

  public async execute(command: SubmitStudyProgressCommand): Promise<VocabProgressReadModel[]> {
    const { userId, deckId, results } = command;

    if (!results || results.length === 0) {
      throw new InvalidVocabProgressDataException('Results array cannot be empty');
    }

    const deck = await this.deckRepository.findById(deckId);
    if (!deck) {
      throw new DeckNotFoundException(deckId);
    }

    if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.SUBMIT_PROGRESS, userId)) {
      throw new DeckAccessForbiddenException();
    }

    const deckCards = await this.flashcardRepository.findByDeckId(deckId);
    const validCardIdSet = new Set(deckCards.map((c) => c.id));

    for (const result of results) {
      if (!validCardIdSet.has(result.flashcardId)) {
        throw new FlashcardNotInDeckException(result.flashcardId, deckId);
      }
    }

    const cardIds = results.map((r) => r.flashcardId);
    const existingProgressList = await this.vocabProgressRepository.findByUserAndCardIds(
      userId,
      deckId,
      cardIds,
    );

    const progressMap = new Map<string, VocabProgress>();
    for (const p of existingProgressList) {
      progressMap.set(p.flashcardId, p);
    }

    const now = new Date();
    const updatedEntities: VocabProgress[] = [];

    for (const result of results) {
      let progress = progressMap.get(result.flashcardId);

      if (!progress) {
        progress = VocabProgress.createNew(userId, deckId, result.flashcardId, now);
        progressMap.set(result.flashcardId, progress);
      }

      progress.recordReview(result.isCorrect, now);
      updatedEntities.push(progress);
    }

    const savedEntities = await this.vocabProgressRepository.upsertBatch(updatedEntities);

    return savedEntities.map((e) => {
      const snap = e.toSnapshot();
      return {
        id: snap.id,
        userId: snap.userId,
        deckId: snap.deckId,
        flashcardId: snap.flashcardId,
        status: snap.status,
        box: snap.box,
        isStarred: snap.isStarred,
        correctStreak: snap.correctStreak,
        correctCount: snap.correctCount,
        incorrectCount: snap.incorrectCount,
        lastReviewedAt: snap.lastReviewedAt,
        nextReviewAt: snap.nextReviewAt,
        createdAt: snap.createdAt,
        updatedAt: snap.updatedAt,
      };
    });
  }
}
