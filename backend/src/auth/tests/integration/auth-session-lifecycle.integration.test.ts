import {
  createIsolatedPostgres,
  IsolatedPostgres,
} from '../../../common/testing/isolated-postgres';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaService } from 'nestjs-prisma';
import { PrismaAuthSessionRepository } from '../../infrastructure/persistence/prisma-auth-session.repository';
import { SessionCredentialAdapter } from '../../infrastructure/security/session-credential.adapter';
import { RefreshTokenUseCase } from '../../application/use-cases/commands/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/commands/logout.use-case';
import { LogoutAllUseCase } from '../../application/use-cases/commands/logout-all.use-case';
import { TokenGeneratorPort } from '../../application/ports/outgoing/token-generator.port';
import { ConfigService } from '@nestjs/config';
import { PrismaUserRepository } from '../../infrastructure/persistence/prisma-user.repository';
import { ValidateUserUseCase } from '../../application/use-cases/queries/validate-user.use-case';
import { JwtStrategy } from '../../presentation/guards/jwt.strategy';
import { PrismaPasswordResetTransaction } from '../../infrastructure/persistence/prisma-password-reset-transaction';
import { TokenType } from '@prisma/client';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for auth integration tests');

describe('Auth session lifecycle PostgreSQL integration', () => {
  let database: IsolatedPostgres;
  let prisma: PrismaService;
  let sessions: PrismaAuthSessionRepository;
  let refresh: RefreshTokenUseCase;
  let logout: LogoutUseCase;
  let logoutAll: LogoutAllUseCase;
  let userId: string;
  const credentialAdapter = new SessionCredentialAdapter();
  const generator: TokenGeneratorPort = {
    generateTokens: async () => ({ accessToken: 'unused', refreshToken: 'unused' }),
    generateAccessToken: (userId, sessionId) => `${userId}:${sessionId}`,
    getSessionExpiresAt: (now) => new Date(now.getTime() + 60_000),
  };

  beforeAll(async () => {
    database = await createIsolatedPostgres(databaseUrl);
    prisma = database.prisma;
    sessions = new PrismaAuthSessionRepository(prisma);
    refresh = new RefreshTokenUseCase(sessions, credentialAdapter, generator);
    logout = new LogoutUseCase(sessions, credentialAdapter);
    logoutAll = new LogoutAllUseCase(sessions);
  });
  beforeEach(async () => {
    userId = `auth-integration-${randomUUID()}`;
    await prisma.user.create({ data: { id: userId, email: `${userId}@example.test` } });
  });
  afterEach(async () => {
    await prisma.user.delete({ where: { id: userId } });
  });
  afterAll(async () => {
    await database.close();
  });

  it('should_return_the_same_credential_for_parallel_refreshes_and_reject_after_logout', async () => {
    const credential = credentialAdapter.create();
    const session = await sessions.create({
      userId,
      credentialHash: credential.hash,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const results = await Promise.all(
      Array.from({ length: 10 }, () => refresh.execute({ token: credential.raw })),
    );
    expect(results).toHaveLength(10);
    expect(results.every((result) => result.refreshToken === credential.raw)).toBe(true);
    expect(results.every((result) => result.accessToken === `${userId}:${session.id}`)).toBe(true);
    expect(await prisma.authSession.count({ where: { userId } })).toBe(1);

    await logout.execute({ refreshToken: credential.raw });
    await expect(refresh.execute({ token: credential.raw })).rejects.toThrow();
    expect((await sessions.findById(session.id))?.revokedAt).not.toBeNull();
  });

  it('should_reject_access_from_refresh_that_read_session_before_logout', async () => {
    const credential = credentialAdapter.create();
    const session = await sessions.create({
      userId,
      credentialHash: credential.hash,
      expiresAt: new Date(Date.now() + 60_000),
    });
    let releaseRead: (() => void) | undefined;
    let signalRead: (() => void) | undefined;
    const readPaused = new Promise<void>((resolve) => {
      signalRead = resolve;
    });
    const resumeRead = new Promise<void>((resolve) => {
      releaseRead = resolve;
    });
    const originalRead = sessions.findByCredentialHash.bind(sessions);
    const readSpy = jest
      .spyOn(sessions, 'findByCredentialHash')
      .mockImplementation(async (hash) => {
        const result = await originalRead(hash);
        signalRead?.();
        await resumeRead;
        return result;
      });
    try {
      const pendingRefresh = refresh.execute({ token: credential.raw });
      await readPaused;
      await logout.execute({ refreshToken: credential.raw });
      releaseRead?.();
      const result = await pendingRefresh;
      expect(result.accessToken).toBe(`${userId}:${session.id}`);

      const strategy = new JwtStrategy(
        new ValidateUserUseCase(new PrismaUserRepository(prisma)),
        sessions,
        new ConfigService({ JWT_ACCESS_SECRET: 'integration-test-secret' }),
      );
      await expect(
        strategy.validate({
          userId,
          sessionId: session.id,
          tokenUse: 'access',
          iss: 'dash-stack-auth',
          aud: 'dash-stack-api',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60,
        }),
      ).rejects.toThrow();
      expect((await sessions.findById(session.id))?.revokedAt).not.toBeNull();
    } finally {
      releaseRead?.();
      readSpy.mockRestore();
    }
  });

  it('should_leave_session_revoked_when_refresh_and_password_reset_overlap', async () => {
    const credential = credentialAdapter.create();
    const session = await sessions.create({
      userId,
      credentialHash: credential.hash,
      expiresAt: new Date(Date.now() + 60_000),
    });
    const email = `${userId}@example.test`;
    const token = await prisma.verificationToken.create({
      data: {
        email,
        token: `reset-${randomUUID()}`,
        type: TokenType.PASSWORD_RESET,
        expires: new Date(Date.now() + 60_000),
      },
    });
    try {
      const [refreshResult, resetResult] = await Promise.allSettled([
        refresh.execute({ token: credential.raw }),
        new PrismaPasswordResetTransaction(prisma).complete({
          tokenId: token.id,
          tokenHash: token.token,
          email,
          hashedPassword: 'new-hash',
          now: new Date(),
        }),
      ]);

      expect(resetResult).toEqual({ status: 'fulfilled', value: true });
      expect((await sessions.findById(session.id))?.revokedAt).not.toBeNull();
      expect((await prisma.user.findUniqueOrThrow({ where: { id: userId } })).password).toBe(
        'new-hash',
      );
      await expect(refresh.execute({ token: credential.raw })).rejects.toThrow();
      if (refreshResult.status === 'fulfilled') {
        expect(refreshResult.value.accessToken).toBe(`${userId}:${session.id}`);
      }
    } finally {
      await prisma.verificationToken.deleteMany({ where: { email } });
    }
  });

  it('should_revoke_every_session_on_logout_all', async () => {
    const credentials = [credentialAdapter.create(), credentialAdapter.create()];
    for (const credential of credentials) {
      await sessions.create({
        userId,
        credentialHash: credential.hash,
        expiresAt: new Date(Date.now() + 60_000),
      });
    }

    await logoutAll.execute({ userId });

    expect(await prisma.authSession.count({ where: { userId, revokedAt: null } })).toBe(0);
    await Promise.all(
      credentials.map((credential) =>
        expect(refresh.execute({ token: credential.raw })).rejects.toThrow(),
      ),
    );
  });
});
