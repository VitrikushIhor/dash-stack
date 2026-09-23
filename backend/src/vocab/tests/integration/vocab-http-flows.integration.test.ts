import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { Pool } from 'pg';
import { ValidateUserUseCase } from '../../../auth/application/use-cases/queries/validate-user.use-case';
import { PrismaUserRepository } from '../../../auth/infrastructure/persistence/prisma-user.repository';
import { JwtStrategy } from '../../../auth/presentation/guards/jwt.strategy';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter';
import { VocabModule } from '../../vocab.module';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error('DATABASE_URL required');

type DeckIdentity = {
  id: string;
};

function expectDeckIdentity(value: unknown): DeckIdentity {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    typeof value.id !== 'string'
  ) {
    throw new Error(`Invalid deck response: ${JSON.stringify(value)}`);
  }

  return { id: value.id };
}

describe('Vocabulary critical HTTP flows integration', () => {
  let app: INestApplication;
  let pool: Pool;
  let prisma: PrismaService;
  let jwt: JwtService;
  let origin: string;
  let ownerId: string;
  let learnerId: string;
  let ownerToken: string;
  let learnerToken: string;

  const request = (
    path: string,
    options: { method?: string; body?: unknown; bearer?: string | null } = {},
  ): Promise<Response> =>
    fetch(`${origin}/api/v1/vocab/${path}`, {
      method: options.method ?? 'GET',
      headers: {
        ...(options.bearer ? { authorization: `Bearer ${options.bearer}` } : {}),
        'content-type': 'application/json',
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(5000),
    });

  const createDeck = async (
    visibility: 'PRIVATE' | 'UNLISTED' | 'PUBLIC',
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    title: string,
  ) =>
    prisma.deck.create({
      data: {
        ownerUserId: ownerId,
        title,
        visibility,
        status,
        flashcards: {
          create: Array.from({ length: 6 }, (_, position) => ({
            term: `${title} term ${position}`,
            definition: `${title} definition ${position}`,
            position,
          })),
        },
      },
      include: { flashcards: { orderBy: { position: 'asc' } } },
    });

  beforeAll(async () => {
    pool = new Pool({ connectionString: databaseUrl });
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        PrismaModule.forRoot({
          isGlobal: true,
          prismaServiceOptions: { prismaOptions: { adapter: new PrismaPg(pool) } },
        }),
        VocabModule,
      ],
      providers: [
        JwtStrategy,
        ValidateUserUseCase,
        PrismaUserRepository,
        { provide: 'UserRepositoryPort', useExisting: PrismaUserRepository },
      ],
    }).compile();

    app = module.createNestApplication({ logger: false });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        whitelist: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.listen(0, '127.0.0.1');
    origin = await app.getUrl();
    prisma = app.get(PrismaService);
    jwt = new JwtService({
      secret: app.get(ConfigService).getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  });

  beforeEach(async () => {
    ownerId = `vocab-http-owner-${randomUUID()}`;
    learnerId = `vocab-http-learner-${randomUUID()}`;
    await prisma.user.createMany({
      data: [
        { id: ownerId, email: `${ownerId}@example.test` },
        { id: learnerId, email: `${learnerId}@example.test` },
      ],
    });
    ownerToken = jwt.sign({ userId: ownerId });
    learnerToken = jwt.sign({ userId: learnerId });
  });

  afterEach(async () => {
    if (prisma) {
      await prisma.user.deleteMany({ where: { id: { in: [ownerId, learnerId] } } });
    }
  });

  afterAll(async () => {
    if (app) await app.close();
    if (pool) await pool.end();
  });

  it('should_enforce_the_deck_access_matrix_and_catalog_visibility', async () => {
    const publicDeck = await createDeck('PUBLIC', 'PUBLISHED', 'Public catalog deck');
    const unlistedDeck = await createDeck('UNLISTED', 'PUBLISHED', 'Unlisted direct deck');
    const privateDeck = await createDeck('PRIVATE', 'PUBLISHED', 'Private deck');
    const draftDeck = await createDeck('PUBLIC', 'DRAFT', 'Public draft deck');
    const archivedDeck = await createDeck('PUBLIC', 'ARCHIVED', 'Public archived deck');

    for (const deckId of [publicDeck.id, unlistedDeck.id]) {
      expect((await request(`decks/${deckId}`)).status).toBe(200);
      expect((await request(`decks/${deckId}/study`)).status).toBe(200);
      expect((await request(`decks/${deckId}`, { bearer: learnerToken })).status).toBe(200);
    }

    for (const deckId of [privateDeck.id, draftDeck.id, archivedDeck.id]) {
      expect((await request(`decks/${deckId}`)).status).toBe(404);
      expect((await request(`decks/${deckId}`, { bearer: learnerToken })).status).toBe(404);
      expect((await request(`decks/${deckId}`, { bearer: ownerToken })).status).toBe(200);
    }

    expect((await request(`decks/${publicDeck.id}/study?onlyDue=true`)).status).toBe(400);
    expect((await request(`decks/${publicDeck.id}/study?onlyStarred=true`)).status).toBe(400);

    const catalogResponse = await request('decks/public?perPage=100');
    expect(catalogResponse.status).toBe(200);
    const catalogText = await catalogResponse.text();
    expect(catalogText).toContain(publicDeck.id);
    expect(catalogText).not.toContain(unlistedDeck.id);
    expect(catalogText).not.toContain(privateDeck.id);
    expect(catalogText).not.toContain(draftDeck.id);
    expect(catalogText).not.toContain(archivedDeck.id);
  });

  it.each(['PUBLIC', 'UNLISTED'] as const)(
    'should_fork_and_independently_edit_a_%s_deck',
    async (visibility) => {
      const source = await createDeck(visibility, 'PUBLISHED', `${visibility} source`);
      const forkResponse = await request(`decks/${source.id}/fork`, {
        method: 'POST',
        body: {},
        bearer: learnerToken,
      });
      expect(forkResponse.status).toBe(201);
      const fork = expectDeckIdentity(await forkResponse.json());
      const createdFork = await prisma.deck.findUniqueOrThrow({
        where: { id: fork.id },
        include: { flashcards: { orderBy: { position: 'asc' } } },
      });

      const editResponse = await request(`decks/${fork.id}/editor`, {
        method: 'PUT',
        bearer: learnerToken,
        body: {
          operationId: randomUUID(),
          expectedUpdatedAt: createdFork.updatedAt.toISOString(),
          metadata: { title: 'Independent fork edit' },
          cards: createdFork.flashcards.map((card, index) => ({
            id: card.id,
            term: index === 0 ? 'Fork-only term' : card.term,
            definition: card.definition,
            example: card.example,
            imageUrl: card.imageUrl,
          })),
          deletedCardIds: [],
        },
      });
      expect(editResponse.status).toBe(200);

      const storedFork = await prisma.deck.findUniqueOrThrow({
        where: { id: fork.id },
        include: { flashcards: { orderBy: { position: 'asc' } } },
      });
      const storedSource = await prisma.deck.findUniqueOrThrow({
        where: { id: source.id },
        include: { flashcards: { orderBy: { position: 'asc' } } },
      });

      expect(storedFork).toMatchObject({
        ownerUserId: learnerId,
        visibility: 'PRIVATE',
        status: 'DRAFT',
        forkedFromDeckId: source.id,
        title: 'Independent fork edit',
      });
      expect(storedFork.flashcards[0].term).toBe('Fork-only term');
      expect(storedSource.flashcards[0].term).toBe(source.flashcards[0].term);
      expect(new Set(storedFork.flashcards.map((card) => card.id))).not.toEqual(
        new Set(storedSource.flashcards.map((card) => card.id)),
      );
    },
  );

  it('should_move_a_due_flashcard_through_progress_and_out_of_the_due_counter', async () => {
    const deck = await createDeck('PUBLIC', 'PUBLISHED', 'Due study flow');
    const dueCard = deck.flashcards[0];
    await prisma.vocabProgress.create({
      data: {
        userId: learnerId,
        deckId: deck.id,
        flashcardId: dueCard.id,
        nextReviewAt: new Date('2000-01-01T00:00:00.000Z'),
      },
    });

    const dueBefore = await request(`reviews/due?deckId=${deck.id}`, { bearer: learnerToken });
    expect(dueBefore.status).toBe(200);
    expect(await dueBefore.json()).toMatchObject({ totalDue: 1 });

    const studyResponse = await request(`decks/${deck.id}/study?onlyDue=true`, {
      bearer: learnerToken,
    });
    expect(studyResponse.status).toBe(200);
    const studyCards: unknown = await studyResponse.json();
    expect(Array.isArray(studyCards) ? studyCards : []).toHaveLength(1);

    const progressResponse = await request(`decks/${deck.id}/progress`, {
      method: 'POST',
      bearer: learnerToken,
      body: { results: [{ flashcardId: dueCard.id, isCorrect: true }] },
    });
    expect(progressResponse.status).toBe(200);

    const dueAfter = await request(`reviews/due?deckId=${deck.id}`, { bearer: learnerToken });
    expect(dueAfter.status).toBe(200);
    expect(await dueAfter.json()).toMatchObject({ totalDue: 0 });
  });

  it('should_set_a_star_idempotently_and_return_only_the_starred_card', async () => {
    const deck = await createDeck('PUBLIC', 'PUBLISHED', 'Starred study flow');
    const cardId = deck.flashcards[4].id;

    for (const isStarred of [true, true]) {
      const starResponse = await request(`cards/${cardId}/star`, {
        method: 'PUT',
        bearer: learnerToken,
        body: { isStarred },
      });
      expect(starResponse.status).toBe(200);
      expect(await starResponse.json()).toEqual({ flashcardId: cardId, isStarred });
    }

    const studyResponse = await request(`decks/${deck.id}/study?onlyStarred=true`, {
      bearer: learnerToken,
    });
    expect(studyResponse.status).toBe(200);
    const cards: unknown = await studyResponse.json();
    expect(Array.isArray(cards) ? cards : []).toHaveLength(1);
    expect(JSON.stringify(cards)).toContain(cardId);
  });
});
