import { AuthSessionRepositoryPort } from '../../../../../src/auth/application/ports/outgoing/auth-session.repository.port';
import { SessionCredentialPort } from '../../../../../src/auth/application/ports/outgoing/session-credential.port';
import { LogoutUseCase } from '../../../../../src/auth/application/use-cases/commands/logout.use-case';
import { AUTH_ERRORS } from '../../../../../src/auth/domain/constants/auth-errors';
import { BadRequestException } from '../../../../../src/common/exceptions/domain.exception';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let authSessionRepo: jest.Mocked<AuthSessionRepositoryPort>;
  let sessionCredential: jest.Mocked<SessionCredentialPort>;

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

    useCase = new LogoutUseCase(authSessionRepo, sessionCredential);
  });

  it('should_revoke_auth_session_when_session_credential_is_valid', async () => {
    sessionCredential.hash.mockReturnValue('credential-hash');
    authSessionRepo.revokeByCredentialHash.mockResolvedValue({ count: 1 });

    const result = await useCase.execute({ refreshToken: 'session-credential' });

    expect(authSessionRepo.revokeByCredentialHash).toHaveBeenCalledWith(
      'credential-hash',
      expect.any(Date),
    );
    expect(result).toEqual({ message: AUTH_ERRORS.LOGOUT_SUCCESS });
  });

  it('should_reject_logout_when_session_is_not_found', async () => {
    sessionCredential.hash.mockReturnValue('unknown-hash');
    authSessionRepo.revokeByCredentialHash.mockResolvedValue({ count: 0 });

    await expect(useCase.execute({ refreshToken: 'unknown-token' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
