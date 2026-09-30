import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthSessionRepositoryPort } from '../../../../../src/auth/application/ports/outgoing/auth-session.repository.port';
import { SessionCredentialPort } from '../../../../../src/auth/application/ports/outgoing/session-credential.port';
import { JwtTokenGeneratorAdapter } from '../../../../../src/auth/infrastructure/security/jwt-token-generator.adapter';

describe('JwtTokenGeneratorAdapter', () => {
  let authSessionRepo: jest.Mocked<AuthSessionRepositoryPort>;
  let sessionCredential: jest.Mocked<SessionCredentialPort>;
  let jwtService: JwtService;
  let adapter: JwtTokenGeneratorAdapter;

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
    jwtService = new JwtService({
      secret: 'test-access-secret',
      signOptions: { expiresIn: '2m' },
    });
    adapter = new JwtTokenGeneratorAdapter(
      new ConfigService({ security: { refreshIn: '7d' } }),
      jwtService,
      authSessionRepo,
      sessionCredential,
    );
  });

  it('should_store_only_credential_hash_and_bind_access_token_to_session', async () => {
    sessionCredential.create.mockReturnValue({
      raw: 'raw-session-credential',
      hash: 'credential-hash',
    });
    authSessionRepo.create.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      credentialHash: 'credential-hash',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      lastUsedAt: new Date(),
    });

    const result = await adapter.generateTokens('user-1', 'test-agent', '127.0.0.1');
    const payload: unknown = jwtService.verify(result.accessToken);

    expect(authSessionRepo.create).toHaveBeenCalledWith({
      userId: 'user-1',
      credentialHash: 'credential-hash',
      expiresAt: expect.any(Date),
      userAgent: 'test-agent',
      ipAddress: '127.0.0.1',
    });
    expect(authSessionRepo.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ credentialHash: 'raw-session-credential' }),
    );
    expect(result.refreshToken).toBe('raw-session-credential');
    expect(payload).toEqual(
      expect.objectContaining({
        userId: 'user-1',
        sessionId: 'session-1',
        tokenUse: 'access',
        iss: 'dash-stack-auth',
        aud: 'dash-stack-api',
      }),
    );
  });
});
