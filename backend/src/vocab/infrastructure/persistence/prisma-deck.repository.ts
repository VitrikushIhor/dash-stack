import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, CEFRLevel } from '@prisma/client';
import { Deck } from '../../domain/entities/deck.entity';
import {
  DeckRepositoryPort,
  FindMyDecksFilter,
  SearchPublicDecksFilter,
} from '../../application/ports/deck-repository.port';
import { PrismaDeckMapper, PrismaDeckWithRelations } from './mappers/prisma-deck.mapper';
import { DeckStatus, DeckVisibility } from '../../domain/enums/vocab.enums';
import { OrderDirection } from '../../../common/order/order-direction';
import { paginate } from '../../../common/pagination/paginate';
import { PaginatedResult } from '../../../common/pagination/pagination.models';

@Injectable()
export class PrismaDeckRepository implements DeckRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(deck: Deck): Promise<Deck> {
    const raw = PrismaDeckMapper.toPersistence(deck);

    const saved = await this.prisma.deck.upsert({
      where: { id: deck.id || 'new-deck-placeholder' },
      create: {
        ownerUserId: raw.ownerUserId,
        title: raw.title,
        slug: raw.slug,
        description: raw.description,
        language: raw.language,
        level: raw.level,
        tags: raw.tags,
        visibility: raw.visibility,
        status: raw.status,
        type: raw.type,
        forkedFromDeckId: raw.forkedFromDeckId,
      },
      update: {
        title: raw.title,
        description: raw.description,
        language: raw.language,
        level: raw.level,
        tags: raw.tags,
        visibility: raw.visibility,
        status: raw.status,
        forkedFromDeckId: raw.forkedFromDeckId,
      },
      include: {
        _count: {
          select: { flashcards: true },
        },
      },
    });

    return PrismaDeckMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Deck | null> {
    const raw = await this.prisma.deck.findUnique({
      where: { id },
      include: {
        flashcards: {
          orderBy: { position: OrderDirection.asc },
        },
        _count: {
          select: { flashcards: true },
        },
      },
    });

    return raw ? PrismaDeckMapper.toDomain(raw) : null;
  }

  async findBySlug(slug: string): Promise<Deck | null> {
    const raw = await this.prisma.deck.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { flashcards: true },
        },
      },
    });

    return raw ? PrismaDeckMapper.toDomain(raw) : null;
  }

  async findMyDecks(filter: FindMyDecksFilter): Promise<Deck[]> {
    const where: Prisma.DeckWhereInput = {
      ownerUserId: filter.ownerUserId,
    };

    if (filter.status) {
      where.status = filter.status;
    }

    const rawDecks = await this.prisma.deck.findMany({
      where,
      orderBy: { updatedAt: OrderDirection.desc },
      include: {
        _count: {
          select: { flashcards: true },
        },
      },
    });

    return rawDecks.map((d) => PrismaDeckMapper.toDomain(d));
  }

  async searchPublicDecks(filter: SearchPublicDecksFilter): Promise<PaginatedResult<Deck>> {
    const where: Prisma.DeckWhereInput = {
      visibility: DeckVisibility.PUBLIC,
      status: DeckStatus.PUBLISHED,
    };

    if (filter.query && filter.query.trim().length > 0) {
      const q = filter.query.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
      ];
    }

    if (filter.level) {
      where.level = filter.level as CEFRLevel;
    }

    if (filter.tags && filter.tags.length > 0) {
      where.tags = {
        hasSome: filter.tags.map((t) => t.toLowerCase()),
      };
    }

    const paginated = await paginate<PrismaDeckWithRelations, Prisma.DeckFindManyArgs>(
      this.prisma.deck,
      {
        where,
        orderBy: { updatedAt: OrderDirection.desc },
        include: {
          _count: {
            select: { flashcards: true },
          },
        },
      },
      {
        page: filter.page,
        perPage: filter.perPage ?? filter.limit,
      },
    );

    return {
      data: paginated.data.map((d) => PrismaDeckMapper.toDomain(d)),
      meta: paginated.meta,
    };
  }

  async countFlashcardsByDeckId(deckId: string): Promise<number> {
    return this.prisma.flashcard.count({
      where: { deckId },
    });
  }

  async forkDeck(sourceDeckId: string, forkedDeck: Deck): Promise<Deck> {
    const raw = PrismaDeckMapper.toPersistence(forkedDeck);

    return this.prisma.$transaction(
      async (tx) => {
        const createdDeck = await tx.deck.create({
          data: {
            ownerUserId: raw.ownerUserId,
            title: raw.title,
            slug: raw.slug,
            description: raw.description,
            language: raw.language,
            level: raw.level,
            tags: raw.tags,
            visibility: raw.visibility,
            status: raw.status,
            type: raw.type,
            forkedFromDeckId: raw.forkedFromDeckId,
          },
        });

        // Pure SQL direct clone (zero V8 memory allocation & sub-millisecond execution)
        await tx.$executeRaw`
          INSERT INTO "flashcards" ("id", "deckId", "term", "definition", "example", "imageUrl", "position", "createdAt", "updatedAt")
          SELECT gen_random_uuid()::text, ${createdDeck.id}, "term", "definition", "example", "imageUrl", "position", NOW(), NOW()
          FROM "flashcards"
          WHERE "deckId" = ${sourceDeckId}
        `;

        const result = await tx.deck.findUniqueOrThrow({
          where: { id: createdDeck.id },
          include: {
            _count: {
              select: { flashcards: true },
            },
          },
        });

        return PrismaDeckMapper.toDomain(result);
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deck.delete({
      where: { id },
    });
  }
}
