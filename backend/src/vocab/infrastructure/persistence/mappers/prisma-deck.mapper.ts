import { Deck as PrismaDeck, Flashcard as PrismaFlashcard } from '@prisma/client';
import { Deck } from '../../../domain/entities/deck.entity';
import { CEFRLevel, DeckStatus, DeckType, DeckVisibility } from '../../../domain/enums/vocab.enums';
import { PrismaFlashcardMapper } from './prisma-flashcard.mapper';

export type PrismaDeckWithRelations = PrismaDeck & {
  flashcards?: PrismaFlashcard[];
  _count?: {
    flashcards: number;
    forks?: number;
  };
  owner?: { firstName: string | null; lastName: string | null; avatar: string | null };
};

export class PrismaDeckMapper {
  static toDomain(raw: PrismaDeckWithRelations): Deck {
    const flashcards = raw.flashcards?.map((f) => PrismaFlashcardMapper.toDomain(f));
    const cardCount = raw._count?.flashcards ?? raw.flashcards?.length ?? 0;
    const displayName = [raw.owner?.firstName, raw.owner?.lastName].filter(Boolean).join(' ');

    return Deck.reconstitute({
      id: raw.id,
      ownerUserId: raw.ownerUserId,
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      language: raw.language,
      level: raw.level as CEFRLevel | null,
      tags: raw.tags,
      visibility: raw.visibility as DeckVisibility,
      status: raw.status as DeckStatus,
      type: raw.type as DeckType,
      forkedFromDeckId: raw.forkedFromDeckId,
      cardCount,
      forkCount: raw._count?.forks ?? 0,
      creator: raw.owner
        ? { displayName: displayName || null, avatarUrl: raw.owner.avatar }
        : undefined,
      flashcards,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: Deck): Omit<PrismaDeck, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      ownerUserId: entity.ownerUserId,
      title: entity.title,
      slug: entity.slug ?? null,
      description: entity.description ?? null,
      language: entity.language,
      level: (entity.level as any) ?? null,
      tags: entity.tags,
      visibility: entity.visibility as any,
      status: entity.status as any,
      type: entity.type as any,
      forkedFromDeckId: entity.forkedFromDeckId ?? null,
    };
  }
}
