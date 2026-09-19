import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { Pool } from 'pg';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { ValidateUserUseCase } from '../../../auth/application/use-cases/queries/validate-user.use-case';
import { PrismaUserRepository } from '../../../auth/infrastructure/persistence/prisma-user.repository';
import { JwtStrategy } from '../../../auth/presentation/guards/jwt.strategy';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter';
import { VocabModule } from '../../vocab.module';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error('DATABASE_URL required');

interface ImportResponse {
  importId: string;
  cardIds: string[];
  importedCount: number;
  idempotent: boolean;
}

function isImportResponse(value: unknown): value is ImportResponse {
  return !(
    typeof value !== 'object' ||
    value === null ||
    !('importId' in value) ||
    !('cardIds' in value) ||
    !('importedCount' in value) ||
    !('idempotent' in value) ||
    typeof value.importId !== 'string' ||
    !Array.isArray(value.cardIds) ||
    !value.cardIds.every((id) => typeof id === 'string') ||
    typeof value.importedCount !== 'number' ||
    typeof value.idempotent !== 'boolean'
  );
}

function expectImportResponse(value: unknown): ImportResponse {
  if (!isImportResponse(value)) {
    throw new Error(`Invalid import response: ${JSON.stringify(value)}`);
  }

  return value;
}

describe('Vocabulary import/export HTTP integration', () => {
  let app: INestApplication;
  let pool: Pool;
  let prisma: PrismaService;
  let jwt: JwtService;
  let origin: string;
  let userId: string;
  let token: string;
  let deckId: string;
  const request = (
    path: string,
    method = 'GET',
    body?: unknown,
    bearer = token,
  ): Promise<Response> =>
    fetch(`${origin}/api/v1/vocab/decks/${path}`, {
      method,
      headers: {
        ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
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
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.listen(0, '127.0.0.1');
    origin = await app.getUrl();
    prisma = app.get(PrismaService);
    jwt = new JwtService({
      secret: app.get(ConfigService).getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  });

  beforeEach(async () => {
    userId = `import-export-${randomUUID()}`;
    await prisma.user.create({ data: { id: userId, email: `${userId}@example.test` } });
    token = jwt.sign({ userId });
    const deck = await prisma.deck.create({
      data: { ownerUserId: userId, title: 'Café export' },
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

  it('should_append_an_atomic_ordered_import_and_return_the_same_receipt_on_retry', async () => {
    const body = {
      importId: `import-${randomUUID()}`,
      cards: [
        { term: 'first', definition: 'one' },
        { term: 'second', definition: 'two', example: 'two example' },
      ],
    };
    const initial = await request(`${deckId}/import`, 'POST', body);

    expect(initial.status).toBe(201);
    expect(expectImportResponse(await initial.json())).toMatchObject({
      importedCount: 2,
      idempotent: false,
    });

    const retry = await request(`${deckId}/import`, 'POST', body);

    expect(retry.status).toBe(201);
    expect(expectImportResponse(await retry.json())).toMatchObject({
      importedCount: 2,
      idempotent: true,
    });

    const cards = await prisma.flashcard.findMany({
      where: { deckId },
      orderBy: { position: 'asc' },
    });

    expect(cards.map((card) => card.term)).toEqual(['first', 'second']);
    expect(cards.map((card) => card.position)).toEqual([0, 1]);
  });

  it('should_reject_invalid_or_conflicting_imports_without_creating_cards', async () => {
    expect(
      (await request(`${deckId}/import`, 'POST', { importId: 'invalid', cards: [] })).status,
    ).toBe(400);

    const importId = `import-${randomUUID()}`;

    expect(
      (
        await request(`${deckId}/import`, 'POST', {
          importId,
          cards: [{ term: 'first', definition: 'one' }],
        })
      ).status,
    ).toBe(201);
    expect(
      (
        await request(`${deckId}/import`, 'POST', {
          importId,
          cards: [{ term: 'changed', definition: 'two' }],
        })
      ).status,
    ).toBe(409);
    expect(await prisma.flashcard.count({ where: { deckId } })).toBe(1);
  });

  it('should_accept_2000_cards_and_reject_2001_without_partial_writes', async () => {
    const maximumCards = Array.from({ length: 2000 }, (_, position) => ({
      term: `term ${position}`,
      definition: `definition ${position}`,
    }));
    const accepted = await request(`${deckId}/import`, 'POST', {
      importId: `maximum-${randomUUID()}`,
      cards: maximumCards,
    });

    expect(accepted.status).toBe(201);
    expect(expectImportResponse(await accepted.json())).toMatchObject({
      importedCount: 2000,
    });
    expect(await prisma.flashcard.count({ where: { deckId } })).toBe(2000);

    const rejectionDeck = await prisma.deck.create({
      data: { ownerUserId: userId, title: 'Over import limit' },
    });
    const rejected = await request(`${rejectionDeck.id}/import`, 'POST', {
      importId: `over-maximum-${randomUUID()}`,
      cards: [...maximumCards, { term: 'term 2000', definition: 'definition 2000' }],
    });

    expect(rejected.status).toBe(400);
    expect(await prisma.flashcard.count({ where: { deckId: rejectionDeck.id } })).toBe(0);
  });

  it('should_require_the_owner_to_import_or_export', async () => {
    const stranger = await prisma.user.create({
      data: { email: `import-export-stranger-${randomUUID()}@example.test` },
    });
    const strangerToken = jwt.sign({ userId: stranger.id });

    try {
      expect(
        (
          await request(
            `${deckId}/import`,
            'POST',
            {
              importId: `import-${randomUUID()}`,
              cards: [{ term: 'term', definition: 'definition' }],
            },
            strangerToken,
          )
        ).status,
      ).toBe(403);
      expect(
        (await request(`${deckId}/export?format=json`, 'GET', undefined, strangerToken)).status,
      ).toBe(403);
    } finally {
      await prisma.user.delete({ where: { id: stranger.id } });
    }
  });

  it('should_export_a_versioned_json_backup_and_formula_safe_csv_in_card_order', async () => {
    await prisma.flashcard.createMany({
      data: [
        {
          deckId,
          term: '=SUM(A1)',
          definition: 'line one\nline two',
          example: '"quoted"',
          position: 1,
        },
        {
          deckId,
          term: 'Привіт',
          definition: 'Unicode',
          imageUrl: 'https://example.test/image.png',
          position: 0,
        },
      ],
    });

    const json = await request(`${deckId}/export?format=json`);

    expect(json.status).toBe(200);
    expect(json.headers.get('content-type')).toContain('application/json');
    expect(json.headers.get('content-disposition')).toContain(
      'attachment; filename="cafe-export.json"',
    );
    expect(await json.json()).toEqual({
      schemaVersion: 1,
      cards: [
        {
          term: 'Привіт',
          definition: 'Unicode',
          example: null,
          imageUrl: 'https://example.test/image.png',
        },
        { term: '=SUM(A1)', definition: 'line one\nline two', example: '"quoted"', imageUrl: null },
      ],
    });

    const csv = await request(`${deckId}/export?format=csv`);

    expect(csv.status).toBe(200);
    expect(csv.headers.get('content-type')).toContain('text/csv');
    expect(await csv.text()).toContain("'=SUM(A1)");
  });
});
