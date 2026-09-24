import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { VocabModule } from '../../vocab.module';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter';
import { JwtStrategy } from '../../../auth/presentation/guards/jwt.strategy';
import { ValidateUserUseCase } from '../../../auth/application/use-cases/queries/validate-user.use-case';
import { PrismaUserRepository } from '../../../auth/infrastructure/persistence/prisma-user.repository';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error('DATABASE_URL required');

describe('Match HTTP integration', () => {
  let app: INestApplication;
  let pool: Pool;
  let prisma: PrismaService;
  let jwt: JwtService;
  let origin: string;
  let userId: string;
  let token: string;
  let deckId: string;
  const request = (path: string, method = 'GET', body?: unknown, bearer = token) =>
    fetch(`${origin}/api/v1/vocab/decks/${path}`, {
      method,
      headers: {
        ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  const start = async () => {
    const response = await request(`${deckId}/match/sessions`, 'POST', {});
    expect(response.status).toBe(201);
    const body: unknown = await response.json();

    if (typeof body !== 'object' || body === null || !('id' in body) || typeof body.id !== 'string')
      throw new Error('Invalid session response');

    return body.id;
  };
  const recordAllPairs = async (sessionId: string) => {
    const cards = await prisma.matchSessionCard.findMany({ where: { sessionId } });
    for (const card of cards) {
      expect(
        (
          await request(`${deckId}/match/sessions/${sessionId}/pairs`, 'POST', {
            cardId: card.flashcardId,
          })
        ).status,
      ).toBe(204);
    }
    expect(
      (
        await request(`${deckId}/match/sessions/${sessionId}/pairs`, 'POST', {
          cardId: cards[0].flashcardId,
        })
      ).status,
    ).toBe(204);
  };

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
        forbidNonWhitelisted: false,
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
    userId = `match-http-${randomUUID()}`;
    await prisma.user.create({ data: { id: userId, email: `${userId}@example.test` } });
    token = jwt.sign({ userId });
    const deck = await prisma.deck.create({
      data: {
        ownerUserId: userId,
        title: 'Match HTTP',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        flashcards: {
          create: Array.from({ length: 6 }, (_, position) => ({
            term: `Term ${position}`,
            definition: `Definition ${position}`,
            position,
          })),
        },
      },
    });
    deckId = deck.id;
  });
  afterEach(async () => {
    await prisma.user.delete({ where: { id: userId } });
  });
  afterAll(async () => {
    if (app) await app.close();
    if (pool) await pool.end();
  });

  it('should_require_jwt_when_creating_or_completing_sessions', async () => {
    expect((await request(`${deckId}/match/sessions`, 'POST', {}, '')).status).toBe(401);
    expect((await request(`${deckId}/match/sessions/forged/complete`, 'POST', {}, '')).status).toBe(
      401,
    );
  });
  it('should_publish_server_result_when_session_is_completed', async () => {
    const id = await start();
    expect((await request(`${deckId}/match/sessions/${id}/complete`, 'POST')).status).toBe(409);
    await recordAllPairs(id);
    const response = await request(`${deckId}/match/sessions/${id}/complete`, 'POST');
    expect(response.status).toBe(200);
    const result: unknown = await response.json();
    expect(result).toMatchObject({ sessionId: id, cardCount: 6, durationMs: expect.any(Number) });
    const replay = await request(`${deckId}/match/sessions/${id}/complete`, 'POST');
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toEqual(result);
    const board = await request(`${deckId}/leaderboard?page=1&perPage=1`, 'GET', undefined, '');
    expect(board.status).toBe(200);
    const body: unknown = await board.json();
    expect(body).toMatchObject({
      data: [{ userId, cardCount: 6 }],
      currentUserBest: null,
      meta: { total: 1, perPage: 1 },
    });
  });
  it.each(['durationMs', 'score', 'cardCount', 'selectedCardIds', 'deckId', 'userId'])(
    'should_reject_completion_when_client_supplies_%s',
    async (key) => {
      const id = await start();
      expect(
        (await request(`${deckId}/match/sessions/${id}/complete`, 'POST', { [key]: 1 })).status,
      ).toBe(400);
      expect(
        (await prisma.matchSession.findUniqueOrThrow({ where: { id } })).completedAt,
      ).toBeNull();
    },
  );
  it('should_reject_creation_when_deck_has_fewer_than_six_cards', async () => {
    const card = await prisma.flashcard.findFirstOrThrow({ where: { deckId } });
    await prisma.flashcard.delete({ where: { id: card.id } });
    expect((await request(`${deckId}/match/sessions`, 'POST', {})).status).toBe(400);
    expect(await prisma.matchSession.count({ where: { deckId } })).toBe(0);
  });
  it('should_reject_expired_cross_user_cross_deck_and_forged_sessions', async () => {
    const id = await start();
    const otherDeck = await prisma.deck.create({ data: { title: 'Other', ownerUserId: userId } });
    expect((await request(`${otherDeck.id}/match/sessions/${id}/complete`, 'POST')).status).toBe(
      404,
    );
    expect((await request(`${deckId}/match/sessions/forged/complete`, 'POST')).status).toBe(404);
    const stranger = await prisma.user.create({
      data: { email: `match-stranger-${randomUUID()}@example.test` },
    });
    try {
      expect(
        (
          await request(
            `${deckId}/match/sessions/${id}/complete`,
            'POST',
            undefined,
            jwt.sign({ userId: stranger.id }),
          )
        ).status,
      ).toBe(404);
    } finally {
      await prisma.user.delete({ where: { id: stranger.id } });
    }
    const expiredAt = Date.now() - 1000;
    await prisma.matchSession.update({
      where: { id },
      data: { startedAt: new Date(expiredAt - 1800000), expiresAt: new Date(expiredAt) },
    });
    expect((await request(`${deckId}/match/sessions/${id}/complete`, 'POST')).status).toBe(409);
  });
});
