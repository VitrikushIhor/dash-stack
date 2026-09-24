import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { Deck } from '../../domain/entities/deck.entity';
import { DeckSlug } from '../../domain/value-objects/deck-slug.vo';
import { DeckNotFoundException } from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { DeckRepositoryPort } from '../ports/deck-repository.port';

interface ForkDeckCommand {
  deckId: string;
  targetUserId: string;
}

@Injectable()
export class ForkDeckUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: DeckRepositoryPort,
  ) {}

  async execute(command: ForkDeckCommand): Promise<Deck> {
    const sourceDeck = await this.deckRepository.findById(command.deckId);

    if (
      !sourceDeck ||
      !DeckAccessPolicy.canAccess(sourceDeck, DeckAccessAction.FORK, command.targetUserId)
    ) {
      throw new DeckNotFoundException(command.deckId);
    }

    const baseTitle = `Copy of ${sourceDeck.title}`;
    const baseSlug = DeckSlug.createFromTitle(baseTitle).value;

    // Generate collision-resistant unique slug
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    let candidateSlug = `${baseSlug}-${randomSuffix}`;

    // Verify availability; in the rare case of collision, append timestamp
    const existing = await this.deckRepository.findBySlug(candidateSlug);
    if (existing) {
      candidateSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    const forkedDeck = Deck.fork(sourceDeck, command.targetUserId, candidateSlug);

    return this.deckRepository.forkDeck(sourceDeck.id, forkedDeck);
  }
}
