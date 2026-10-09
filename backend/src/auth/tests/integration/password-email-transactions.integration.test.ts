import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaService } from 'nestjs-prisma';
import { TokenType } from '@prisma/client';
import { PrismaPasswordResetTransaction } from '../../infrastructure/persistence/prisma-password-reset-transaction';
import { PrismaEmailVerificationTransaction } from '../../infrastructure/persistence/prisma-email-verification-transaction';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for auth integration tests');

const createCredentialHash = (): string => createHash('sha256').update(randomUUID()).digest('hex');

describe('Password and email transactions PostgreSQL integration', () => {
  let pool: Pool;
  let prisma: PrismaService;
  let reset: PrismaPasswordResetTransaction;
  let verify: PrismaEmailVerificationTransaction;
  let userId: string;
  let email: string;
  const now = new Date();
  const expires = new Date(now.getTime() + 60_000);

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
    prisma = new PrismaService({ prismaOptions: { adapter: new PrismaPg(pool) } });
    reset = new PrismaPasswordResetTransaction(prisma);
    verify = new PrismaEmailVerificationTransaction(prisma);
  });
  beforeEach(async () => {
    userId = `auth-integration-${randomUUID()}`;
    email = `${userId}@example.test`;
    await prisma.user.create({ data: { id: userId, email, password: 'old-hash' } });
  });
  afterEach(async () => {
    await prisma.verificationToken.deleteMany({ where: { email } });
    await prisma.user.delete({ where: { id: userId } });
  });
  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it('should_reset_once_and_revoke_sessions_when_same_token_is_submitted_concurrently', async () => {
    const token = await prisma.verificationToken.create({
      data: { email, token: `reset-${randomUUID()}`, type: TokenType.PASSWORD_RESET, expires },
    });
    await prisma.authSession.create({
      data: { userId, credentialHash: createCredentialHash(), expiresAt: expires },
    });
    const data = {
      tokenId: token.id,
      tokenHash: token.token,
      email,
      hashedPassword: 'new-hash',
      now,
    };

    const outcomes = await Promise.all([reset.complete(data), reset.complete(data)]);

    expect(outcomes.sort()).toEqual([false, true]);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: userId } })).password).toBe(
      'new-hash',
    );
    expect(await prisma.authSession.count({ where: { userId, revokedAt: null } })).toBe(0);
    expect(await prisma.verificationToken.count({ where: { id: token.id } })).toBe(0);
  });

  it('should_verify_once_and_create_one_session_when_same_token_is_submitted_concurrently', async () => {
    const token = await prisma.verificationToken.create({
      data: { email, token: `verify-${randomUUID()}`, type: TokenType.EMAIL_VERIFICATION, expires },
    });
    const data = {
      tokenId: token.id,
      tokenHash: token.token,
      email,
      sessionExpiresAt: expires,
      now,
    };

    const outcomes = await Promise.all([
      verify.complete({ ...data, credentialHash: createCredentialHash() }),
      verify.complete({ ...data, credentialHash: createCredentialHash() }),
    ]);

    expect(outcomes.filter((outcome) => outcome !== null)).toHaveLength(1);
    expect(await prisma.authSession.count({ where: { userId } })).toBe(1);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: userId } })).emailVerified).toEqual(
      now,
    );
    expect(await prisma.verificationToken.count({ where: { id: token.id } })).toBe(0);
  });

  it('should_not_create_a_second_session_when_email_is_already_verified', async () => {
    await prisma.user.update({ where: { id: userId }, data: { emailVerified: now } });
    const token = await prisma.verificationToken.create({
      data: { email, token: `verify-${randomUUID()}`, type: TokenType.EMAIL_VERIFICATION, expires },
    });

    const result = await verify.complete({
      tokenId: token.id,
      tokenHash: token.token,
      email,
      credentialHash: createCredentialHash(),
      sessionExpiresAt: expires,
      now,
    });

    expect(result).toBeNull();
    expect(await prisma.authSession.count({ where: { userId } })).toBe(0);
  });

  it('should_rollback_verification_token_and_user_when_session_insert_fails', async () => {
    const token = await prisma.verificationToken.create({
      data: { email, token: `verify-${randomUUID()}`, type: TokenType.EMAIL_VERIFICATION, expires },
    });
    const credentialHash = createCredentialHash();
    await prisma.authSession.create({ data: { userId, credentialHash, expiresAt: expires } });

    await expect(
      verify.complete({
        tokenId: token.id,
        tokenHash: token.token,
        email,
        credentialHash,
        sessionExpiresAt: expires,
        now,
      }),
    ).rejects.toThrow();

    expect(await prisma.verificationToken.count({ where: { id: token.id } })).toBe(1);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: userId } })).emailVerified,
    ).toBeNull();
    expect(await prisma.authSession.count({ where: { userId } })).toBe(1);
  });
});
