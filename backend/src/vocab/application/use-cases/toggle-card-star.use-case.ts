import { Injectable, Inject } from '@nestjs/common';
import { VocabProgress } from '../../domain/entities/vocab-progress.entity';
import {
  DeckAccessForbiddenException,
  FlashcardNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { FlashcardRepositoryPort } from '../ports/flashcard-repository.port';
import { VocabProgressRepositoryPort } from '../ports/vocab-progress-repository.port';
import { ToggleCardStarCommand } from '../commands/toggle-card-star.command';

export interface ToggleCardStarResult {
  flashcardId: string;
  isStarred: boolean;
}

@Injectable()
export class ToggleCardStarUseCase {
  constructor(
    @Inject('FlashcardRepositoryPort')
    private readonly flashcardRepository: FlashcardRepositoryPort,
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
    @Inject('VocabProgressRepositoryPort')
    private readonly vocabProgressRepository: VocabProgressRepositoryPort,
  ) {}

  public async execute(command: ToggleCardStarCommand): Promise<ToggleCardStarResult> {
    const { userId, flashcardId } = command;

    const flashcard = await this.flashcardRepository.findById(flashcardId);
    if (!flashcard) {
      throw new FlashcardNotFoundException(flashcardId);
    }

    const deck = await this.deckRepository.findById(flashcard.deckId);
    if (!deck || !DeckAccessPolicy.canAccess(deck, DeckAccessAction.STAR, userId)) {
      throw new DeckAccessForbiddenException();
    }

    let progress = await this.vocabProgressRepository.findByUserAndCard(
      userId,
      flashcard.deckId,
      flashcardId,
    );

    if (!progress) {
      progress = VocabProgress.createNew(userId, flashcard.deckId, flashcardId);
      progress.setStar(true);
    } else {
      progress.toggleStar();
    }

    const saved = await this.vocabProgressRepository.save(progress);

    return {
      flashcardId: saved.flashcardId,
      isStarred: saved.isStarred,
    };
  }
}
