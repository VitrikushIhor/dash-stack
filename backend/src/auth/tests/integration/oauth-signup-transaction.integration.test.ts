import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import {
  createIsolatedPostgres,
  IsolatedPostgres,
} from '../../../common/testing/isolated-postgres';
import { PrismaOAuthSignupTransaction } from '../../infrastructure/persistence/prisma-oauth-signup-transaction';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for OAuth integration tests');

describe('OAuth signup PostgreSQL transaction', () => {
  let database: IsolatedPostgres;
  let signup: PrismaOAuthSignupTransaction;
  beforeAll(async () => {
    database = await createIsolatedPostgres(databaseUrl);
    signup = new PrismaOAuthSignupTransaction(database.prisma);
  });
  afterAll(async () => {
    await database.close();
  });

  it('should_rollback_user_and_allow_retry_when_provider_account_insert_fails', async () => {
    const prisma = database.prisma;
    const email = `oauth-${randomUUID()}@example.test`;
    const existing = await prisma.user.create({
      data: { email: `existing-${randomUUID()}@example.test` },
    });
    const occupied = await prisma.account.create({
      data: { userId: existing.id, provider: 'google', providerAccountId: 'occupied' },
    });
    const data = {
      user: { email, emailVerified: new Date() },
      provider: 'google',
      providerAccountId: 'occupied',
    };

    await expect(signup.create(data)).rejects.toThrow();
    expect(await prisma.user.findUnique({ where: { email } })).toBeNull();
    expect(
      await prisma.account.count({ where: { provider: 'google', providerAccountId: 'occupied' } }),
    ).toBe(1);

    await prisma.account.delete({ where: { id: occupied.id } });
    const id = await signup.create(data);
    expect(
      await prisma.account.findUnique({
        where: {
          provider_providerAccountId: { provider: 'google', providerAccountId: 'occupied' },
        },
      }),
    ).toMatchObject({ userId: id });
    expect(await prisma.user.count({ where: { email } })).toBe(1);
  });
});
