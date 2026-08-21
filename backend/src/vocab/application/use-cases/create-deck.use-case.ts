import { Injectable, Inject } from '@nestjs/common';
import { Deck } from '../../domain/entities/deck.entity';
import { CEFRLevel, DeckVisibility } from '../../domain/enums/vocab.enums';
import { DeckSlug } from '../../domain/value-objects/deck-slug.vo';
import { DeckRepositoryPort } from '../ports/deck-repository.port';

export interface CreateDeckCommand {
  ownerUserId: string;
  title: string;
  description?: string;
  language?: string;
  level?: CEFRLevel;
  tags?: string[];
  visibility?: DeckVisibility;
}

@Injectable()
export class CreateDeckUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
  ) {}

  async execute(command: CreateDeckCommand): Promise<Deck> {
    const baseSlug = DeckSlug.createFromTitle(command.title).value;
    let slug = baseSlug;
    let counter = 1;

    while (await this.deckRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const deck = Deck.create({
      ownerUserId: command.ownerUserId,
      title: command.title,
      slug,
      description: command.description,
      language: command.language || 'en',
      level: command.level,
      tags: command.tags || [],
      visibility: command.visibility || DeckVisibility.PRIVATE,
    });

    return this.deckRepository.save(deck);
  }
}
