import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '../../../../common/exceptions/domain.exception';
import { AuthSessionRepositoryPort } from '../../../../../src/auth/application/ports/outgoing/auth-session.repository.port';
import { UserRepositoryPort } from '../../../../../src/auth/application/ports/outgoing/user.repository.port';
import { ValidateUserUseCase } from '../../../../../src/auth/application/use-cases/queries/validate-user.use-case';
import { JwtStrategy } from '../../../../../src/auth/presentation/guards/jwt.strategy';
import { extractAccessToken } from '../../../presentation/guards/access-token-extractor';
import type { Request } from 'express';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authSessionRepo: jest.Mocked<AuthSessionRepositoryPort>;
  const recordActivity = jest.fn();
  let userRepo: jest.Mocked<UserRepositoryPort>;

  const user = {
    id: 'user-1',
    email: 'user@example.com',
    firstName: null,
    lastName: null,
    avatar: null,
    emailVerified: new Date(),
    dob: null,
    bio: null,
    urls: [],
  };

  beforeEach(() => {
    recordActivity.mockReset();
    authSessionRepo = {
      recordActivity,
      create: jest.fn(),
      findByCredentialHash: jest.fn(),
      findById: jest.fn(),
      revokeByCredentialHash: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };
    userRepo = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateEmailVerified: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
    };

    strategy = new JwtStrategy(
      new ValidateUserUseCase(userRepo),
      authSessionRepo,
      new ConfigService({ JWT_ACCESS_SECRET: 'test-access-secret' }),
    );
  });

  it('should_return_user_and_verified_session_id_when_claims_and_session_are_valid', async () => {
    authSessionRepo.findById.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      credentialHash: 'credential-hash',
      expiresAt: new Date(Date.now() + 10_000),
      revokedAt: null,
      lastUsedAt: new Date(),
    });
    userRepo.findById.mockResolvedValue(user);

    await expect(
      strategy.validate({
        userId: 'user-1',
        sessionId: 'session-1',
        tokenUse: 'access',
        iss: 'dash-stack-auth',
        aud: 'dash-stack-api',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    ).resolves.toEqual({ ...user, sessionId: 'session-1' });
  });

  it.each([
    [299999, false],
    [300000, true],
    [300001, true],
  ])('should_record_activity_only_when_five_minutes_elapsed_%s', async (elapsed, expected) => {
    const now = new Date('2026-09-29T12:00:00Z');
    jest.useFakeTimers().setSystemTime(now);
    try {
      authSessionRepo.findById.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        credentialHash: 'hash',
        expiresAt: new Date(now.getTime() + 60000),
        revokedAt: null,
        lastUsedAt: new Date(now.getTime() - elapsed),
      });
      userRepo.findById.mockResolvedValue(user);

      await strategy.validate({
        userId: 'user-1',
        sessionId: 'session-1',
        tokenUse: 'access',
        iss: 'dash-stack-auth',
        aud: 'dash-stack-api',
        iat: 1,
        exp: 2,
      });

      if (expected) expect(recordActivity).toHaveBeenCalledWith('session-1', 'user-1', now);
      else expect(recordActivity).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it.each([
    ['missing exp', { userId: 'user-1', sessionId: 'session-1', iat: 1 }],
    ['missing sessionId', { userId: 'user-1', iat: 1, exp: 2 }],
    ['wrong userId type', { userId: 1, sessionId: 'session-1', iat: 1, exp: 2 }],
  ])('should_reject_payload_when_%s', async (_caseName, payload: unknown) => {
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    expect(authSessionRepo.findById).not.toHaveBeenCalled();
  });

  it('should_reject_access_token_when_session_is_revoked', async () => {
    authSessionRepo.findById.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      credentialHash: 'credential-hash',
      expiresAt: new Date(Date.now() + 10_000),
      revokedAt: new Date(),
      lastUsedAt: new Date(),
    });

    await expect(
      strategy.validate({
        userId: 'user-1',
        sessionId: 'session-1',
        tokenUse: 'access',
        iss: 'dash-stack-auth',
        aud: 'dash-stack-api',
        iat: 1,
        exp: 2,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepo.findById).not.toHaveBeenCalled();
    expect(recordActivity).not.toHaveBeenCalled();
  });

  it('should_reject_access_token_when_server_session_is_expired', async () => {
    authSessionRepo.findById.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      credentialHash: 'credential-hash',
      expiresAt: new Date(Date.now() - 1_000),
      revokedAt: null,
      lastUsedAt: new Date(),
    });

    await expect(
      strategy.validate({
        userId: 'user-1',
        sessionId: 'session-1',
        tokenUse: 'access',
        iss: 'dash-stack-auth',
        aud: 'dash-stack-api',
        iat: 1,
        exp: 2,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepo.findById).not.toHaveBeenCalled();
    expect(recordActivity).not.toHaveBeenCalled();
  });

  it('should_reject_access_token_when_session_belongs_to_another_user', async () => {
    authSessionRepo.findById.mockResolvedValue({
      id: 'session-1',
      userId: 'another-user',
      credentialHash: 'credential-hash',
      expiresAt: new Date(Date.now() + 10_000),
      revokedAt: null,
      lastUsedAt: new Date(),
    });

    await expect(
      strategy.validate({
        userId: 'user-1',
        sessionId: 'session-1',
        tokenUse: 'access',
        iss: 'dash-stack-auth',
        aud: 'dash-stack-api',
        iat: 1,
        exp: 2,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

describe('Access credential transport', () => {
  const request = (cookie?: unknown, authorization?: string): Request =>
    ({
      cookies: cookie === undefined ? {} : { access_token: cookie },
      headers: authorization ? { authorization } : {},
    }) as Request;

  it('should_use_cookie_when_only_cookie_credential_is_present', () => {
    expect(extractAccessToken(request('cookie-access'))).toBe('cookie-access');
  });

  it('should_use_bearer_when_only_bearer_credential_is_present', () => {
    expect(extractAccessToken(request(undefined, 'Bearer bearer-access'))).toBe('bearer-access');
  });

  it('should_reject_ambiguous_cookie_and_bearer_credentials', () => {
    expect(extractAccessToken(request('cookie-access', 'Bearer bearer-access'))).toBeNull();
  });

  it('should_reject_non_string_access_cookie_even_with_bearer', () => {
    expect(
      extractAccessToken(request({ token: 'cookie-access' }, 'Bearer bearer-access')),
    ).toBeNull();
  });
});
