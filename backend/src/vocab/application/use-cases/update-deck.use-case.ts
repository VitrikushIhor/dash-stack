import { Injectable, Inject } from '@nestjs/common';
import { Deck } from '../../domain/entities/deck.entity';
import { CEFRLevel, DeckVisibility } from '../../domain/enums/vocab.enums';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckRepositoryPort } from '../ports/deck-repository.port';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';

interface UpdateDeckCommand {
  deckId: string;
  userId: string;
  title?: string;
  description?: string | null;
  language?: string;
  level?: CEFRLevel | null;
  tags?: string[];
  visibility?: DeckVisibility;
}

@Injectable()
export class UpdateDeckUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
  ) {}

  async execute(command: UpdateDeckCommand): Promise<Deck> {
    const deck = await this.deckRepository.findById(command.deckId);

    if (!deck) {
      throw new DeckNotFoundException(command.deckId);
    }

    if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.EDIT, command.userId)) {
      throw new DeckAccessForbiddenException();
    }

    deck.updateMetadata({
      title: command.title,
      description: command.description,
      language: command.language,
      level: command.level,
      tags: command.tags,
      visibility: command.visibility,
    });

    return this.deckRepository.updateMetadata(command.deckId, {
      title: command.title,
      description: command.description,
      language: command.language,
      level: command.level,
      tags: command.tags,
      visibility: command.visibility,
    });
  }
}
