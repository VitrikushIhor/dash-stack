import { Flashcard as PrismaFlashcard } from '@prisma/client';
import { Flashcard } from '../../../domain/entities/flashcard.entity';

export class PrismaFlashcardMapper {
  static toDomain(raw: PrismaFlashcard): Flashcard {
    return Flashcard.reconstitute({
      id: raw.id,
      deckId: raw.deckId,
      term: raw.term,
      definition: raw.definition,
      example: raw.example,
      imageUrl: raw.imageUrl,
      position: raw.position,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: Flashcard): Omit<PrismaFlashcard, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      deckId: entity.deckId,
      term: entity.term,
      definition: entity.definition,
      example: entity.example ?? null,
      imageUrl: entity.imageUrl ?? null,
      position: entity.position,
    };
  }
}
