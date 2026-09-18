import { Injectable, Inject } from '@nestjs/common';
import { VocabProgress } from '../../domain/entities/vocab-progress.entity';
import {
  DeckAccessForbiddenException,
  FlashcardNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { StudyProgressTransactionPort } from '../ports/study-progress-transaction.port';
import { SetCardStarCommand } from '../commands/set-card-star.command';

export interface SetCardStarResult {
  flashcardId: string;
  isStarred: boolean;
}

@Injectable()
export class SetCardStarUseCase {
  constructor(
    @Inject('StudyProgressTransactionPort')
    private readonly transaction: StudyProgressTransactionPort,
  ) {}

  public async execute(command: SetCardStarCommand): Promise<SetCardStarResult> {
    return this.update(command, command.isStarred);
  }

  public async toggle(command: Omit<SetCardStarCommand, 'isStarred'>): Promise<SetCardStarResult> {
    return this.update(command);
  }

  private async update(
    command: Omit<SetCardStarCommand, 'isStarred'>,
    isStarred?: boolean,
  ): Promise<SetCardStarResult> {
    const { userId, flashcardId } = command;

    return this.transaction.run(
      async ({ deckRepository, flashcardRepository, vocabProgressRepository }) => {
        const flashcard = await flashcardRepository.findById(flashcardId);

        if (!flashcard) {
          throw new FlashcardNotFoundException(flashcardId);
        }

        const deck = await deckRepository.findById(flashcard.deckId);

        if (!deck || !DeckAccessPolicy.canAccess(deck, DeckAccessAction.STAR, userId)) {
          throw new DeckAccessForbiddenException();
        }

        let progress = await vocabProgressRepository.findByUserAndCard(
          userId,
          flashcard.deckId,
          flashcardId,
        );

        if (!progress) {
          progress = VocabProgress.createNew(userId, flashcard.deckId, flashcardId);
        }
        progress.setStar(isStarred ?? !progress.isStarred);

        const saved = await vocabProgressRepository.save(progress);

        return {
          flashcardId: saved.flashcardId,
          isStarred: saved.isStarred,
        };
      },
    );
  }
}
