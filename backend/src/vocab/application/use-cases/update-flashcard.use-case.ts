import { Injectable, Inject } from '@nestjs/common';
import { Flashcard } from '../../domain/entities/flashcard.entity';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
  FlashcardNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { FlashcardRepositoryPort } from '../ports/flashcard-repository.port';

export interface UpdateFlashcardCommand {
  deckId: string;
  cardId: string;
  userId: string;
  term?: string;
  definition?: string;
  example?: string | null;
  imageUrl?: string | null;
}

@Injectable()
export class UpdateFlashcardUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
    @Inject('FlashcardRepositoryPort')
    private readonly flashcardRepository: FlashcardRepositoryPort,
  ) {}

  async execute(command: UpdateFlashcardCommand): Promise<Flashcard> {
    const deck = await this.deckRepository.findById(command.deckId);

    if (!deck) {
      throw new DeckNotFoundException(command.deckId);
    }

    if (!deck.isOwnedBy(command.userId)) {
      throw new DeckAccessForbiddenException();
    }

    const flashcard = await this.flashcardRepository.findById(command.cardId);

    if (!flashcard || flashcard.deckId !== command.deckId) {
      throw new FlashcardNotFoundException(command.cardId);
    }

    flashcard.updateContent({
      term: command.term,
      definition: command.definition,
      example: command.example,
      imageUrl: command.imageUrl,
    });

    return this.flashcardRepository.save(flashcard);
  }
}
