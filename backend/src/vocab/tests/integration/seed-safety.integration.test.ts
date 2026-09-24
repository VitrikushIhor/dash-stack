import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { Pool } from 'pg';
import { systemDecks } from '../../../../prisma/seeds/vocabulary-data';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error('DATABASE_URL required');

jest.setTimeout(30_000);

describe('Database seed safety integration', () => {
  let pool: Pool;
  let prisma: PrismaClient;

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
    prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it('should_be_idempotent_and_preserve_existing_user_data', async () => {
    const backendRoot = resolve(__dirname, '../../../../');
    const protectedUserId = `seed-safety-${randomUUID()}`;
    const protectedDeck = await prisma.user.create({
      data: {
        id: protectedUserId,
        email: `${protectedUserId}@example.test`,
        decks: {
          create: {
            title: 'Phase 10 protected user deck',
            flashcards: {
              create: { term: 'preserve', definition: 'must remain', position: 0 },
            },
          },
        },
      },
      include: { decks: { include: { flashcards: true } } },
    });

    try {
      for (let run = 0; run < 2; run += 1) {
        execFileSync(process.execPath, ['-r', 'ts-node/register', 'prisma/seed.ts'], {
          cwd: backendRoot,
          env: process.env,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      }

      expect(await prisma.user.findUnique({ where: { id: protectedUserId } })).not.toBeNull();
      expect(
        await prisma.deck.findUnique({ where: { id: protectedDeck.decks[0].id } }),
      ).toMatchObject({ title: 'Phase 10 protected user deck' });
      expect(
        await prisma.flashcard.findMany({ where: { deckId: protectedDeck.decks[0].id } }),
      ).toHaveLength(1);

      for (const seedDeck of systemDecks) {
        const stored = await prisma.deck.findUniqueOrThrow({
          where: { slug: seedDeck.slug },
          include: { flashcards: true },
        });
        expect(stored.flashcards).toHaveLength(seedDeck.flashcards.length);
      }
    } finally {
      await prisma.user.delete({ where: { id: protectedUserId } });
    }
  });

  it('should_reject_a_system_slug_collision_without_mutating_a_user_deck', async () => {
    const backendRoot = resolve(__dirname, '../../../../');
    const protectedUserId = `seed-collision-${randomUUID()}`;
    const systemDeck = systemDecks[0];

    if (!systemDeck) throw new Error('System seed data is required for this test');

    await prisma.deck.delete({ where: { slug: systemDeck.slug } });

    const user = await prisma.user.create({
      data: {
        id: protectedUserId,
        email: `${protectedUserId}@example.test`,
        decks: {
          create: {
            title: 'Private user deck with a colliding slug',
            slug: systemDeck.slug,
            visibility: 'PRIVATE',
            flashcards: {
              create: { term: 'private term', definition: 'private definition', position: 0 },
            },
          },
        },
      },
      include: { decks: { include: { flashcards: true } } },
    });

    try {
      expect(() =>
        execFileSync(process.execPath, ['-r', 'ts-node/register', 'prisma/seed.ts'], {
          cwd: backendRoot,
          env: process.env,
          encoding: 'utf8',
          stdio: 'pipe',
        }),
      ).toThrow();

      const persisted = await prisma.deck.findUniqueOrThrow({
        where: { id: user.decks[0].id },
        include: { flashcards: true },
      });
      expect(persisted).toMatchObject({
        title: 'Private user deck with a colliding slug',
        visibility: 'PRIVATE',
        type: 'USER_GENERATED',
      });
      expect(persisted.flashcards).toHaveLength(1);
    } finally {
      await prisma.user.delete({ where: { id: protectedUserId } });
    }
  });
});
