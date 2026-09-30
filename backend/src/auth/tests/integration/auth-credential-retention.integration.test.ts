import {
  createIsolatedPostgres,
  IsolatedPostgres,
} from '../../../common/testing/isolated-postgres';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { TokenType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import {
  AuthCredentialRetentionService,
  RATE_LIMIT_CLEANUP_BATCH_SIZE,
} from '../../infrastructure/maintenance/auth-credential-retention.service';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for auth retention integration tests');

describe('Auth credential retention PostgreSQL', () => {
  let database: IsolatedPostgres;
  let prisma: PrismaService;
  let retention: AuthCredentialRetentionService;
  let userId: string;
  let email: string;

  beforeAll(async () => {
    database = await createIsolatedPostgres(databaseUrl);
    prisma = database.prisma;
    retention = new AuthCredentialRetentionService(prisma);
  });

  beforeEach(async () => {
    userId = `retention-${randomUUID()}`;
    email = `${userId}@example.test`;
    await prisma.user.create({ data: { id: userId, email } });
  });

  afterEach(async () => {
    await prisma.verificationToken.deleteMany({ where: { email } });
    await prisma.user.delete({ where: { id: userId } });
  });

  afterAll(async () => {
    await database.close();
  });

  it('should_delete_only_expired_credentials_in_bounded_batches', async () => {
    const expired = new Date('2000-01-01T00:00:00.000Z');
    const retained = new Date('2002-01-01T00:00:00.000Z');
    for (const [index, expiresAt] of [expired, expired, retained].entries()) {
      await prisma.authSession.create({
        data: { userId, credentialHash: `${index}`.padStart(64, 'a'), expiresAt },
      });
      await prisma.verificationToken.create({
        data: {
          email,
          token: `${userId}-verify-${index}`,
          type: TokenType.EMAIL_VERIFICATION,
          expires: expiresAt,
        },
      });
    }

    const cutoff = new Date('2001-01-01T00:00:00.000Z');
    await expect(retention.hasBacklog(cutoff)).resolves.toBe(true);
    await expect(retention.run(cutoff, 1)).resolves.toMatchObject({
      sessions: 1,
      verificationTokens: 1,
    });
    await expect(retention.run(cutoff, 1)).resolves.toMatchObject({
      sessions: 1,
      verificationTokens: 1,
    });
    await expect(retention.run(cutoff, 1)).resolves.toMatchObject({
      sessions: 0,
      verificationTokens: 0,
    });
    expect(await prisma.authSession.count({ where: { userId } })).toBe(1);
    expect(await prisma.verificationToken.count({ where: { email } })).toBe(1);
  });

  it('should_not_double_delete_when_cleanup_workers_run_concurrently', async () => {
    const cutoff = new Date('2001-01-01T00:00:00.000Z');
    for (let index = 0; index < 2; index += 1) {
      await prisma.authSession.create({
        data: { userId, credentialHash: `${index}`.padStart(64, 'b'), expiresAt: cutoff },
      });
    }

    const results = await Promise.all([retention.run(cutoff, 1), retention.run(cutoff, 1)]);

    expect(results.map((result) => result.sessions).sort()).toEqual([1, 1]);
    expect(await prisma.authSession.count({ where: { userId } })).toBe(0);
  });

  it('should_delete_expired_throttle_rows_without_waiting_for_credential_retention', async () => {
    const expiredKey = `throttle-expired-${userId}`;
    const activeKey = `throttle-active-${userId}`;
    await prisma.$executeRaw`
      INSERT INTO "auth_rate_limits" ("key", "hits", "expiresAt")
      VALUES (${expiredKey}, 1, NOW() - INTERVAL '1 second'),
             (${activeKey}, 1, NOW() + INTERVAL '1 hour')
    `;

    try {
      const result = await retention.run(new Date('2001-01-01T00:00:00.000Z'), 100);
      expect(result.rateLimits).toBeGreaterThanOrEqual(1);
      const rows = await prisma.$queryRaw<Array<{ key: string }>>`
        SELECT "key" FROM "auth_rate_limits" WHERE "key" IN (${expiredKey}, ${activeKey})
      `;
      expect(rows).toEqual([{ key: activeKey }]);
    } finally {
      await prisma.$executeRaw`
        DELETE FROM "auth_rate_limits" WHERE "key" IN (${expiredKey}, ${activeKey})
      `;
    }
  });

  it('should_clean_a_full_rate_limit_batch_independently_of_credential_batch_size', async () => {
    const prefix = `throttle-batch-${userId}-`;
    await prisma.$executeRaw`
      INSERT INTO "auth_rate_limits" ("key", "hits", "expiresAt")
      SELECT ${prefix} || sequence::text, 1, NOW() - INTERVAL '1 second'
      FROM generate_series(1, ${RATE_LIMIT_CLEANUP_BATCH_SIZE + 1}) AS sequence
    `;

    try {
      const result = await retention.run(new Date('2001-01-01T00:00:00.000Z'), 1);
      expect(result.rateLimits).toBe(RATE_LIMIT_CLEANUP_BATCH_SIZE);
      const remaining = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) AS count FROM "auth_rate_limits" WHERE "key" LIKE ${prefix + '%'}
      `;
      expect(remaining[0].count).toBe(1n);
    } finally {
      await prisma.$executeRaw`DELETE FROM "auth_rate_limits" WHERE "key" LIKE ${prefix + '%'}`;
    }
  });

  it('should_reject_unbounded_or_invalid_cleanup', async () => {
    await expect(retention.run(new Date('invalid'), 100)).rejects.toThrow();
    await expect(retention.run(new Date(), 101)).rejects.toThrow();
  });
});
