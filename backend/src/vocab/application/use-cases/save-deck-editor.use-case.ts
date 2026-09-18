import { Inject, Injectable } from '@nestjs/common';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import {
  DeckEditorCardInput,
  DeckEditorMetadataInput,
  DeckEditorRepositoryPort,
} from '../ports/deck-editor-repository.port';
import { Deck } from '../../domain/entities/deck.entity';
import { Flashcard } from '../../domain/entities/flashcard.entity';

interface SaveDeckEditorCommand {
  deckId: string;
  userId: string;
  metadata: DeckEditorMetadataInput;
  cards: DeckEditorCardInput[];
  deletedCardIds: string[];
}

@Injectable()
export class SaveDeckEditorUseCase {
  constructor(
    @Inject('DeckRepositoryPort') private readonly deckRepository: DeckRepositoryPort,
    @Inject('DeckEditorRepositoryPort') private readonly editorRepository: DeckEditorRepositoryPort,
  ) {}

  async execute(command: SaveDeckEditorCommand): Promise<Deck> {
    const deck = await this.deckRepository.findById(command.deckId);
    if (!deck) throw new DeckNotFoundException(command.deckId);
    if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.EDIT, command.userId)) {
      throw new DeckAccessForbiddenException();
    }

    deck.updateMetadata(command.metadata);
    command.cards.forEach((card, position) => {
      Flashcard.create({
        id: card.id,
        deckId: command.deckId,
        term: card.term,
        definition: card.definition,
        example: card.example,
        imageUrl: card.imageUrl,
        position,
      });
    });

    return this.editorRepository.save({
      deck,
      cards: command.cards,
      deletedCardIds: command.deletedCardIds,
    });
  }
}
