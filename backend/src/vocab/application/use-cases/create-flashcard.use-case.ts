import { Injectable, Inject } from '@nestjs/common';
import { Flashcard } from '../../domain/entities/flashcard.entity';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { FlashcardRepositoryPort } from '../ports/flashcard-repository.port';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';

interface CreateFlashcardItem {
  term: string;
  definition: string;
  example?: string | null;
  imageUrl?: string | null;
}

interface CreateFlashcardCommand {
  deckId: string;
  userId: string;
  cards: CreateFlashcardItem[];
}

@Injectable()
export class CreateFlashcardUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
    @Inject('FlashcardRepositoryPort')
    private readonly flashcardRepository: FlashcardRepositoryPort,
  ) {}

  async execute(command: CreateFlashcardCommand): Promise<Flashcard[]> {
    const deck = await this.deckRepository.findById(command.deckId);

    if (!deck) {
      throw new DeckNotFoundException(command.deckId);
    }

    if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.EDIT, command.userId)) {
      throw new DeckAccessForbiddenException();
    }

    const currentMaxPos = await this.flashcardRepository.getMaxPositionByDeckId(command.deckId);
    const flashcardsToCreate = command.cards.map((cardItem, index) =>
      Flashcard.create({
        deckId: command.deckId,
        term: cardItem.term,
        definition: cardItem.definition,
        example: cardItem.example,
        imageUrl: cardItem.imageUrl,
        position: currentMaxPos + index + 1,
      }),
    );

    return this.flashcardRepository.saveMany(flashcardsToCreate);
  }
}
