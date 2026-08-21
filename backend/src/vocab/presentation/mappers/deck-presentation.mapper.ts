import { Deck } from '../../domain/entities/deck.entity';
import { DeckResponseDto } from '../dtos/deck-response.dto';
import { FlashcardPresentationMapper } from './flashcard-presentation.mapper';
import { PaginatedResult } from '../../../common/pagination/pagination.models';

export class DeckPresentationMapper {
  static toResponse(deck: Deck): DeckResponseDto {
    return {
      id: deck.id,
      ownerUserId: deck.ownerUserId,
      title: deck.title,
      slug: deck.slug ?? null,
      description: deck.description ?? null,
      language: deck.language,
      level: deck.level ?? null,
      tags: deck.tags,
      visibility: deck.visibility,
      status: deck.status,
      type: deck.type,
      forkedFromDeckId: deck.forkedFromDeckId ?? null,
      cardCount: deck.cardCount,
      flashcards: deck.flashcards
        ? FlashcardPresentationMapper.toResponseList(deck.flashcards)
        : undefined,
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
    };
  }

  static toResponseList(decks: Deck[]): DeckResponseDto[] {
    return decks.map((deck) => this.toResponse(deck));
  }

  static toPaginatedResponse(paginated: PaginatedResult<Deck>): PaginatedResult<DeckResponseDto> {
    return {
      data: this.toResponseList(paginated.data),
      meta: paginated.meta,
    };
  }
}
