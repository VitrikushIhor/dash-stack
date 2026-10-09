import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import {
  createIsolatedPostgres,
  IsolatedPostgres,
} from '../../../common/testing/isolated-postgres';
import { PrismaLinkedAccountsRepository } from '../../infrastructure/persistence/prisma-linked-accounts.repository';
import { PrismaAccountRepository } from '../../infrastructure/persistence/prisma-account.repository';
import { PrismaUserRepository } from '../../infrastructure/persistence/prisma-user.repository';
import { PrismaOAuthSignupTransaction } from '../../infrastructure/persistence/prisma-oauth-signup-transaction';
import { OAuthExchangeUseCase } from '../../application/use-cases/commands/oauth-exchange.use-case';
import { ConflictException } from '../../../common/exceptions/domain.exception';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for account linking integration tests');

describe('Linked accounts PostgreSQL', () => {
  let database: IsolatedPostgres;
  let accounts: PrismaLinkedAccountsRepository;
  let userId: string;
  let otherUserId: string;
  beforeAll(async () => {
    database = await createIsolatedPostgres(databaseUrl);
    accounts = new PrismaLinkedAccountsRepository(database.prisma);
  });
  beforeEach(async () => {
    userId = (
      await database.prisma.user.create({ data: { email: `${randomUUID()}@example.test` } })
    ).id;
    otherUserId = (
      await database.prisma.user.create({ data: { email: `${randomUUID()}@example.test` } })
    ).id;
  });
  afterEach(async () => {
    await database.prisma.user.deleteMany({ where: { id: { in: [userId, otherUserId] } } });
  });
  afterAll(async () => {
    await database.close();
  });

  it('should_sign_in_to_the_same_user_after_explicit_linking', async () => {
    await accounts.link(userId, 'google', 'provider-identity');
    await accounts.link(userId, 'google', 'provider-identity');
    const oauth = new OAuthExchangeUseCase(
      new PrismaUserRepository(database.prisma),
      new PrismaAccountRepository(database.prisma),
      {
        generateTokens: async (id) => ({ accessToken: id, refreshToken: 'session' }),
        generateAccessToken: () => 'unused',
        getSessionExpiresAt: () => new Date(),
      },
      {
        getUserInfo: async () => ({
          sub: 'google-oauth2|provider-identity',
          email: 'different-provider-email@example.test',
          email_verified: true,
        }),
        exchangeCode: async () => {
          throw new Error('Unused');
        },
      },
      new PrismaOAuthSignupTransaction(database.prisma),
    );
    await expect(oauth.execute({ auth0Token: 'provider-token' })).resolves.toEqual({
      accessToken: userId,
      refreshToken: 'session',
    });
    expect(await accounts.list(userId)).toEqual(['google']);
    expect(await database.prisma.account.count({ where: { userId } })).toBe(1);
  });

  it('should_reject_transfer_of_another_users_provider_account', async () => {
    await accounts.link(otherUserId, 'github', 'occupied');
    await expect(accounts.link(userId, 'github', 'occupied')).rejects.toThrow(ConflictException);
    expect(await accounts.list(userId)).toEqual([]);
    expect(await accounts.list(otherUserId)).toEqual(['github']);
  });

  it('should_link_only_one_identity_when_two_users_claim_it_concurrently', async () => {
    const results = await Promise.allSettled([
      accounts.link(userId, 'google', 'shared'),
      accounts.link(otherUserId, 'google', 'shared'),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(await database.prisma.account.count({ where: { providerAccountId: 'shared' } })).toBe(1);
  });

  it('should_connect_only_one_account_per_provider_under_concurrent_requests', async () => {
    const results = await Promise.allSettled([
      accounts.link(userId, 'google', 'first'),
      accounts.link(userId, 'google', 'second'),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(await database.prisma.account.count({ where: { userId, provider: 'google' } })).toBe(1);
  });
});
