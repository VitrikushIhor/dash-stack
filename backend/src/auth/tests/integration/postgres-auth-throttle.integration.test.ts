import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaService } from 'nestjs-prisma';
import { PostgresThrottlerStorage } from '../../infrastructure/throttling/postgres-throttler-storage';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for auth throttle integration tests');

describe('Auth throttle PostgreSQL storage', () => {
  let pool: Pool;
  let prisma: PrismaService;
  let secondPool: Pool;
  let secondPrisma: PrismaService;
  let first: PostgresThrottlerStorage;
  let second: PostgresThrottlerStorage;
  let key: string;

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
    prisma = new PrismaService({ prismaOptions: { adapter: new PrismaPg(pool) } });
    secondPool = new Pool({ connectionString: databaseUrl });
    secondPrisma = new PrismaService({ prismaOptions: { adapter: new PrismaPg(secondPool) } });
    first = new PostgresThrottlerStorage(prisma);
    second = new PostgresThrottlerStorage(secondPrisma);
  });

  beforeEach(() => {
    key = `auth-throttle-test-${randomUUID()}`;
  });

  afterEach(async () => {
    await prisma.$executeRaw`DELETE FROM "auth_rate_limits" WHERE "key" LIKE 'auth-throttle-test-%'`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await secondPrisma.$disconnect();
    await pool.end();
    await secondPool.end();
  });

  it('should_share_an_atomic_limit_between_two_instances', async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        (index % 2 === 0 ? first : second).increment(key, 60_000, 5, 60_000, 'default'),
      ),
    );

    expect(results.filter((result) => !result.isBlocked)).toHaveLength(5);
    expect(results.filter((result) => result.isBlocked)).toHaveLength(5);
    expect(
      results.filter((result) => result.isBlocked).every((result) => result.timeToBlockExpire > 0),
    ).toBe(true);
    const rows = await prisma.$queryRaw<Array<{ hits: number }>>`
      SELECT "hits" FROM "auth_rate_limits" WHERE "key" = ${key}
    `;
    expect(rows).toEqual([{ hits: 6 }]);
    expect((await second.increment(`${key}-other`, 60_000, 5, 60_000, 'default')).isBlocked).toBe(
      false,
    );
  });

  it('should_reset_the_counter_after_expiry', async () => {
    await prisma.$executeRaw`
      INSERT INTO "auth_rate_limits" ("key", "hits", "expiresAt")
      VALUES (${key}, 5, NOW() - INTERVAL '1 second')
    `;

    const result = await first.increment(key, 60_000, 5, 60_000, 'default');

    expect(result.totalHits).toBe(1);
    expect(result.isBlocked).toBe(false);
  });

  it('should_fail_closed_for_unsupported_duration', async () => {
    await expect(first.increment(key, 60_000, 5, 120_000, 'default')).rejects.toThrow(
      'Unsupported auth throttle configuration',
    );
  });
});
