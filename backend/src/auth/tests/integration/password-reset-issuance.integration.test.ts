import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaService } from 'nestjs-prisma';
import { TokenType } from '@prisma/client';
import { AuthTokenType } from '../../domain/enums/token-type.enum';
import { PrismaVerificationTokenRepository } from '../../infrastructure/persistence/prisma-verification-token.repository';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for auth integration tests');

describe('Password-reset issuance PostgreSQL integration', () => {
  let pool: Pool;
  let prisma: PrismaService;
  let repository: PrismaVerificationTokenRepository;
  let email: string;
  const expires = new Date('2030-01-01T00:00:00.000Z');

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
    prisma = new PrismaService({ prismaOptions: { adapter: new PrismaPg(pool) } });
    repository = new PrismaVerificationTokenRepository(prisma);
  });
  beforeEach(() => {
    email = `auth-integration-${randomUUID()}@example.test`;
  });
  afterEach(async () => {
    await prisma.verificationToken.deleteMany({ where: { email } });
  });
  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it('should_leave_only_one_valid_reset_token_when_issuance_is_concurrent', async () => {
    await Promise.all(
      Array.from({ length: 5 }, (_, index) =>
        repository.issueLatest({
          email,
          token: `hashed-reset-${randomUUID()}-${index}`,
          type: AuthTokenType.PASSWORD_RESET,
          expires,
        }),
      ),
    );

    const tokens = await prisma.verificationToken.findMany({
      where: { email, type: TokenType.PASSWORD_RESET },
    });
    expect(tokens).toHaveLength(1);
  });

  it('should_preserve_old_token_when_new_token_insert_fails', async () => {
    const old = await repository.issueLatest({
      email,
      token: `old-${randomUUID()}`,
      type: AuthTokenType.PASSWORD_RESET,
      expires,
    });
    const conflicting = await prisma.verificationToken.create({
      data: {
        email: `other-${randomUUID()}@example.test`,
        token: `conflict-${randomUUID()}`,
        type: TokenType.PASSWORD_RESET,
        expires,
      },
    });
    try {
      await expect(
        repository.issueLatest({
          email,
          token: conflicting.token,
          type: AuthTokenType.PASSWORD_RESET,
          expires,
        }),
      ).rejects.toThrow();
      const tokens = await prisma.verificationToken.findMany({ where: { email } });
      expect(tokens).toHaveLength(1);
      expect(tokens[0].id).toBe(old.id);
    } finally {
      await prisma.verificationToken.delete({ where: { id: conflicting.id } });
    }
  });
});
