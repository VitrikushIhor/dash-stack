import { AuthSessionRepositoryPort } from '../../../../../src/auth/application/ports/outgoing/auth-session.repository.port';
import { SessionCredentialPort } from '../../../../../src/auth/application/ports/outgoing/session-credential.port';
import { TokenGeneratorPort } from '../../../../../src/auth/application/ports/outgoing/token-generator.port';
import { RefreshTokenUseCase } from '../../../../../src/auth/application/use-cases/commands/refresh-token.use-case';
import { UnauthorizedException } from '../../../../../src/common/exceptions/domain.exception';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let authSessionRepo: jest.Mocked<AuthSessionRepositoryPort>;
  let sessionCredential: jest.Mocked<SessionCredentialPort>;
  let tokenGenerator: jest.Mocked<TokenGeneratorPort>;

  beforeEach(() => {
    authSessionRepo = {
      recordActivity: jest.fn(),
      create: jest.fn(),
      findByCredentialHash: jest.fn(),
      findById: jest.fn(),
      revokeByCredentialHash: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };
    sessionCredential = {
      create: jest.fn(),
      hash: jest.fn(),
    };
    tokenGenerator = {
      generateTokens: jest.fn(),
      generateAccessToken: jest.fn(),
      getSessionExpiresAt: jest.fn(),
    };

    useCase = new RefreshTokenUseCase(authSessionRepo, sessionCredential, tokenGenerator);
  });

  it('should_return_new_access_token_with_same_session_credential_when_session_is_active', async () => {
    sessionCredential.hash.mockReturnValue('credential-hash');
    authSessionRepo.findByCredentialHash.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      credentialHash: 'credential-hash',
      expiresAt: new Date(Date.now() + 10_000),
      revokedAt: null,
      lastUsedAt: new Date(),
    });
    tokenGenerator.generateAccessToken.mockReturnValue('new-access-token');

    const result = await useCase.execute({ token: 'stable-session-credential' });

    expect(tokenGenerator.generateAccessToken).toHaveBeenCalledWith('user-1', 'session-1');
    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'stable-session-credential',
    });
  });

  it('should_reject_session_credential_when_session_is_revoked', async () => {
    sessionCredential.hash.mockReturnValue('credential-hash');
    authSessionRepo.findByCredentialHash.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      credentialHash: 'credential-hash',
      expiresAt: new Date(Date.now() + 10_000),
      revokedAt: new Date(),
      lastUsedAt: new Date(),
    });

    await expect(useCase.execute({ token: 'revoked-session-credential' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(tokenGenerator.generateAccessToken).not.toHaveBeenCalled();
  });

  it('should_reject_session_credential_when_session_is_expired', async () => {
    sessionCredential.hash.mockReturnValue('credential-hash');
    authSessionRepo.findByCredentialHash.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      credentialHash: 'credential-hash',
      expiresAt: new Date(Date.now() - 10_000),
      revokedAt: null,
      lastUsedAt: new Date(),
    });

    await expect(useCase.execute({ token: 'expired-session-credential' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(tokenGenerator.generateAccessToken).not.toHaveBeenCalled();
  });

  it('should_reject_unknown_credential_when_no_session_exists', async () => {
    sessionCredential.hash.mockReturnValue('unknown-hash');
    authSessionRepo.findByCredentialHash.mockResolvedValue(null);

    await expect(useCase.execute({ token: 'unknown-token' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
