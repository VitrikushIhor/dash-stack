import { Flashcard } from '../../domain/entities/flashcard.entity';
import { FlashcardResponseDto } from '../dtos/flashcard-response.dto';

export class FlashcardPresentationMapper {
  static toResponse(card: Flashcard): FlashcardResponseDto {
    return {
      id: card.id,
      deckId: card.deckId,
      term: card.term,
      definition: card.definition,
      example: card.example ?? null,
      imageUrl: card.imageUrl ?? null,
      position: card.position,
      createdAt: card.createdAt.toISOString(),
      updatedAt: card.updatedAt.toISOString(),
    };
  }

  static toResponseList(cards: Flashcard[]): FlashcardResponseDto[] {
    return cards.map((card) => this.toResponse(card));
  }
}
