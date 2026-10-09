import { Injectable, Inject } from '@nestjs/common';
import { VOCAB_ERRORS } from '../../domain/constants/vocab-errors';
import { VocabProgress } from '../../domain/entities/vocab-progress.entity';
import {
  DeckNotFoundException,
  DeckAccessForbiddenException,
  FlashcardNotInDeckException,
  InvalidVocabProgressDataException,
  StudyAttemptConflictException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { StudyProgressTransactionPort } from '../ports/study-progress-transaction.port';
import { SubmitStudyProgressCommand } from '../commands/submit-study-progress.command';
import { VocabProgressReadModel } from '../read-models/vocab-progress.read-model';

@Injectable()
export class SubmitStudyProgressUseCase {
  constructor(
    @Inject('StudyProgressTransactionPort')
    private readonly transaction: StudyProgressTransactionPort,
  ) {}

  public async execute(command: SubmitStudyProgressCommand): Promise<VocabProgressReadModel[]> {
    const { userId, deckId, results, attemptId } = command;

    if (!results || results.length === 0) {
      throw new InvalidVocabProgressDataException(VOCAB_ERRORS.PROGRESS_RESULTS_REQUIRED);
    }

    if (new Set(results.map((result) => result.flashcardId)).size !== results.length) {
      throw new InvalidVocabProgressDataException(VOCAB_ERRORS.PROGRESS_RESULTS_UNIQUE_FLASHCARDS);
    }

    if (attemptId !== undefined && results.length !== 1) {
      throw new InvalidVocabProgressDataException(VOCAB_ERRORS.STUDY_ATTEMPT_SINGLE_ANSWER);
    }

    return this.transaction.run(
      async ({
        deckRepository,
        flashcardRepository,
        vocabProgressRepository,
        studyAttemptRepository,
      }) => {
        const deck = await deckRepository.findById(deckId);
        if (!deck) {
          throw new DeckNotFoundException(deckId);
        }

        if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.SUBMIT_PROGRESS, userId)) {
          throw new DeckAccessForbiddenException();
        }

        const deckCards = await flashcardRepository.findByDeckId(deckId);
        const validCardIdSet = new Set(deckCards.map((c) => c.id));

        for (const result of results) {
          if (!validCardIdSet.has(result.flashcardId)) {
            throw new FlashcardNotInDeckException(result.flashcardId, deckId);
          }
        }

        const receipt = attemptId ? await studyAttemptRepository.find(userId, attemptId) : null;
        if (
          receipt &&
          (receipt.deckId !== deckId ||
            receipt.flashcardId !== results[0].flashcardId ||
            receipt.isCorrect !== results[0].isCorrect)
        ) {
          throw new StudyAttemptConflictException();
        }

        const cardIds = results.map((r) => r.flashcardId);
        const existingProgressList = await vocabProgressRepository.findByUserAndCardIds(
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

          if (!receipt) progress.recordReview(result.isCorrect, now);
          updatedEntities.push(progress);
        }

        const savedEntities = receipt
          ? existingProgressList
          : await vocabProgressRepository.upsertBatch(updatedEntities);
        if (attemptId && !receipt) {
          await studyAttemptRepository.save({ userId, deckId, attemptId, ...results[0] });
        }

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
      },
    );
  }
}
