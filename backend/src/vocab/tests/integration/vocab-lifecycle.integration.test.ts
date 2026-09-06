import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient, DeckStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaService } from 'nestjs-prisma';
import { ArchiveDeckUseCase } from '../../application/use-cases/archive-deck.use-case';
import { DeleteFlashcardUseCase } from '../../application/use-cases/delete-flashcard.use-case';
import { PublishDeckUseCase } from '../../application/use-cases/publish-deck.use-case';
import { ReorderFlashcardsUseCase } from '../../application/use-cases/reorder-flashcards.use-case';
import { RestoreDeckUseCase } from '../../application/use-cases/restore-deck.use-case';
import { SaveDeckEditorUseCase } from '../../application/use-cases/save-deck-editor.use-case';
import { UnpublishDeckUseCase } from '../../application/use-cases/unpublish-deck.use-case';
import {
  DeckLifecycleInvalidTransitionException,
  InvalidFlashcardDataException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { PrismaDeckRepository } from '../../infrastructure/persistence/prisma-deck.repository';
import { PrismaDeckEditorRepository } from '../../infrastructure/persistence/prisma-deck-editor.repository';
import { PrismaFlashcardRepository } from '../../infrastructure/persistence/prisma-flashcard.repository';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run Vocabulary integration tests');
}

describe('Vocabulary lifecycle integration', () => {
  let pool: Pool;
  let prisma: PrismaClient;
  let deckRepository: PrismaDeckRepository;
  let flashcardRepository: PrismaFlashcardRepository;
  let deckEditorRepository: PrismaDeckEditorRepository;
  let ownerUserId: string;

  const createDeck = async (cardCount: number) => {
    return prisma.deck.create({
      data: {
        ownerUserId,
        title: `Lifecycle integration ${randomUUID()}`,
        language: 'en',
        flashcards: {
          create: Array.from({ length: cardCount }, (_, index) => ({
            term: `Term ${index}`,
            definition: `Definition ${index}`,
            position: index,
          })),
        },
      },
      include: { flashcards: { orderBy: { position: 'asc' } } },
    });
  };

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
    prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
    const prismaService = prisma as unknown as PrismaService;
    deckRepository = new PrismaDeckRepository(prismaService);
    flashcardRepository = new PrismaFlashcardRepository(prismaService);
    deckEditorRepository = new PrismaDeckEditorRepository(prismaService);
  });

  beforeEach(async () => {
    ownerUserId = `vocab-lifecycle-${randomUUID()}`;
    await prisma.user.create({
      data: {
        id: ownerUserId,
        email: `${ownerUserId}@example.test`,
      },
    });
  });

  afterEach(async () => {
    await prisma.user.delete({ where: { id: ownerUserId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it('persists every approved lifecycle command', async () => {
    const deck = await createDeck(2);
    const publishDeck = new PublishDeckUseCase(deckRepository);
    const unpublishDeck = new UnpublishDeckUseCase(deckRepository);
    const archiveDeck = new ArchiveDeckUseCase(deckRepository);
    const restoreDeck = new RestoreDeckUseCase(deckRepository);

    await publishDeck.execute({ deckId: deck.id, userId: ownerUserId });
    expect((await prisma.deck.findUniqueOrThrow({ where: { id: deck.id } })).status).toBe(
      DeckStatus.PUBLISHED,
    );

    await unpublishDeck.execute({ deckId: deck.id, userId: ownerUserId });
    await publishDeck.execute({ deckId: deck.id, userId: ownerUserId });
    await archiveDeck.execute({ deckId: deck.id, userId: ownerUserId });
    expect((await prisma.deck.findUniqueOrThrow({ where: { id: deck.id } })).status).toBe(
      DeckStatus.ARCHIVED,
    );

    await restoreDeck.execute({ deckId: deck.id, userId: ownerUserId });
    expect((await prisma.deck.findUniqueOrThrow({ where: { id: deck.id } })).status).toBe(
      DeckStatus.DRAFT,
    );
  });

  it('does not persist an invalid lifecycle command', async () => {
    const deck = await createDeck(2);
    const archiveDeck = new ArchiveDeckUseCase(deckRepository);

    await expect(archiveDeck.execute({ deckId: deck.id, userId: ownerUserId })).rejects.toThrow(
      DeckLifecycleInvalidTransitionException,
    );
    expect((await prisma.deck.findUniqueOrThrow({ where: { id: deck.id } })).status).toBe(
      DeckStatus.DRAFT,
    );
  });

  it('atomically deletes a card and demotes a published deck below the publish minimum', async () => {
    const deck = await createDeck(2);
    const publishDeck = new PublishDeckUseCase(deckRepository);
    const deleteFlashcard = new DeleteFlashcardUseCase(deckRepository, flashcardRepository);

    await publishDeck.execute({ deckId: deck.id, userId: ownerUserId });
    await deleteFlashcard.execute({
      deckId: deck.id,
      cardId: deck.flashcards[0].id,
      userId: ownerUserId,
    });

    const persistedDeck = await prisma.deck.findUniqueOrThrow({ where: { id: deck.id } });
    const remainingCards = await prisma.flashcard.count({ where: { deckId: deck.id } });
    expect(persistedDeck.status).toBe(DeckStatus.DRAFT);
    expect(remainingCards).toBe(1);
  });

  it('persists only an exact, zero-based reorder permutation', async () => {
    const deck = await createDeck(3);
    const reorderFlashcards = new ReorderFlashcardsUseCase(deckRepository, flashcardRepository);
    const orderedCardIds = [deck.flashcards[2].id, deck.flashcards[0].id, deck.flashcards[1].id];

    await reorderFlashcards.execute({
      deckId: deck.id,
      userId: ownerUserId,
      orderedCardIds,
    });

    const persistedOrder = await prisma.flashcard.findMany({
      where: { deckId: deck.id },
      orderBy: { position: 'asc' },
    });
    expect(persistedOrder.map((card) => card.id)).toEqual(orderedCardIds);
    expect(persistedOrder.map((card) => card.position)).toEqual([0, 1, 2]);

    await expect(
      reorderFlashcards.execute({
        deckId: deck.id,
        userId: ownerUserId,
        orderedCardIds: [orderedCardIds[0], orderedCardIds[0], orderedCardIds[1]],
      }),
    ).rejects.toThrow(InvalidFlashcardDataException);

    const unchangedOrder = await prisma.flashcard.findMany({
      where: { deckId: deck.id },
      orderBy: { position: 'asc' },
    });
    expect(unchangedOrder.map((card) => card.id)).toEqual(orderedCardIds);
  });

  it('atomically saves metadata and the complete flashcard editor snapshot', async () => {
    const deck = await createDeck(3);
    const saveEditor = new SaveDeckEditorUseCase(deckRepository, deckEditorRepository);

    await saveEditor.execute({
      deckId: deck.id,
      userId: ownerUserId,
      metadata: { title: 'Updated atomically', description: 'Saved with cards' },
      cards: [
        {
          id: deck.flashcards[1].id,
          term: 'Updated term',
          definition: 'Updated definition',
        },
        {
          id: deck.flashcards[0].id,
          term: deck.flashcards[0].term,
          definition: deck.flashcards[0].definition,
        },
        { term: 'New term', definition: 'New definition' },
      ],
      deletedCardIds: [deck.flashcards[2].id],
    });

    const saved = await prisma.deck.findUniqueOrThrow({
      where: { id: deck.id },
      include: { flashcards: { orderBy: { position: 'asc' } } },
    });
    expect(saved.title).toBe('Updated atomically');
    expect(saved.description).toBe('Saved with cards');
    expect(saved.flashcards.map((card) => card.position)).toEqual([0, 1, 2]);
    expect(saved.flashcards.map((card) => card.term)).toEqual([
      'Updated term',
      deck.flashcards[0].term,
      'New term',
    ]);
    expect(saved.flashcards.some((card) => card.id === deck.flashcards[2].id)).toBe(false);
  });

  it('does not persist editor metadata when the card snapshot is invalid', async () => {
    const deck = await createDeck(2);
    const saveEditor = new SaveDeckEditorUseCase(deckRepository, deckEditorRepository);

    await expect(
      saveEditor.execute({
        deckId: deck.id,
        userId: ownerUserId,
        metadata: { title: 'Must not persist' },
        cards: [
          {
            id: deck.flashcards[0].id,
            term: deck.flashcards[0].term,
            definition: deck.flashcards[0].definition,
          },
        ],
        deletedCardIds: [],
      }),
    ).rejects.toThrow(InvalidFlashcardDataException);

    const unchanged = await prisma.deck.findUniqueOrThrow({
      where: { id: deck.id },
      include: { flashcards: true },
    });
    expect(unchanged.title).toBe(deck.title);
    expect(unchanged.flashcards).toHaveLength(2);
  });
});

describe('Database reset guard integration', () => {
  it('rejects a destructive reset in production before executing reset operations', () => {
    const backendRoot = resolve(__dirname, '../../../../');

    try {
      execFileSync(process.execPath, ['-r', 'ts-node/register', 'prisma/reset.ts', '--confirm'], {
        cwd: backendRoot,
        env: { ...process.env, NODE_ENV: 'production' },
        encoding: 'utf8',
        stdio: 'pipe',
      });
      throw new Error('Expected the production reset guard to terminate the process');
    } catch (error: unknown) {
      const processError = error as Error & { status?: number; stderr?: string | Buffer };
      expect(processError.status).toBe(1);
      expect(processError.stderr?.toString()).toContain('FATAL: Running destructive reset');
    }
  });
});
