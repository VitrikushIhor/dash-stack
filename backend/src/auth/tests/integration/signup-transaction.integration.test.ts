import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaService } from 'nestjs-prisma';
import { AuthTokenType } from '../../domain/enums/token-type.enum';
import { PrismaSignupTransaction } from '../../infrastructure/persistence/prisma-signup-transaction';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for auth integration tests');

describe('Signup PostgreSQL transaction', () => {
  let pool: Pool;
  let prisma: PrismaService;
  let signup: PrismaSignupTransaction;
  let email: string;
  const expires = new Date('2030-01-01T00:00:00.000Z');

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
    prisma = new PrismaService({ prismaOptions: { adapter: new PrismaPg(pool) } });
    signup = new PrismaSignupTransaction(prisma);
  });
  beforeEach(() => {
    email = `signup-integration-${randomUUID()}@example.test`;
  });
  afterEach(async () => {
    await prisma.verificationToken.deleteMany({ where: { email } });
    await prisma.user.deleteMany({ where: { email } });
  });
  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it('should_create_user_and_verification_token_together', async () => {
    const token = `signup-${randomUUID()}`;

    await signup.createPending(
      { email, password: 'hashed-password', emailVerified: null },
      { email, token, type: AuthTokenType.EMAIL_VERIFICATION, expires },
    );

    expect(await prisma.user.count({ where: { email } })).toBe(1);
    expect(await prisma.verificationToken.count({ where: { email, token } })).toBe(1);
  });

  it('should_return_one_created_outcome_for_concurrent_signup_of_same_email', async () => {
    const outcomes = await Promise.all([
      signup.createPending(
        { email, password: 'hashed-password', emailVerified: null },
        { email, token: `signup-${randomUUID()}`, type: AuthTokenType.EMAIL_VERIFICATION, expires },
      ),
      signup.createPending(
        { email, password: 'hashed-password', emailVerified: null },
        { email, token: `signup-${randomUUID()}`, type: AuthTokenType.EMAIL_VERIFICATION, expires },
      ),
    ]);

    expect(outcomes.sort()).toEqual([false, true]);
    expect(await prisma.user.count({ where: { email } })).toBe(1);
    expect(await prisma.verificationToken.count({ where: { email } })).toBe(1);
  });

  it('should_rollback_user_when_verification_token_insert_fails', async () => {
    const token = `conflict-${randomUUID()}`;
    const conflict = await prisma.verificationToken.create({
      data: {
        email: `other-${randomUUID()}@example.test`,
        token,
        type: AuthTokenType.EMAIL_VERIFICATION,
        expires,
      },
    });
    try {
      await expect(
        signup.createPending(
          { email, password: 'hashed-password', emailVerified: null },
          { email, token, type: AuthTokenType.EMAIL_VERIFICATION, expires },
        ),
      ).rejects.toThrow();
      expect(await prisma.user.count({ where: { email } })).toBe(0);
      expect(await prisma.verificationToken.count({ where: { email } })).toBe(0);
    } finally {
      await prisma.verificationToken.delete({ where: { id: conflict.id } });
    }
  });
});
