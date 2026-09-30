import { AuthSessionRepositoryPort } from '../../../../../src/auth/application/ports/outgoing/auth-session.repository.port';
import { LogoutAllUseCase } from '../../../../../src/auth/application/use-cases/commands/logout-all.use-case';
import { AUTH_ERRORS } from '../../../../../src/auth/domain/constants/auth-errors';

describe('LogoutAllUseCase', () => {
  let useCase: LogoutAllUseCase;
  let authSessionRepo: jest.Mocked<AuthSessionRepositoryPort>;

  beforeEach(() => {
    authSessionRepo = {
      recordActivity: jest.fn(),
      create: jest.fn(),
      findByCredentialHash: jest.fn(),
      findById: jest.fn(),
      revokeByCredentialHash: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };

    useCase = new LogoutAllUseCase(authSessionRepo);
  });

  it('should_revoke_all_sessions_for_user', async () => {
    const result = await useCase.execute({ userId: 'user-1' });

    expect(authSessionRepo.revokeAllByUserId).toHaveBeenCalledWith('user-1', expect.any(Date));
    expect(result).toEqual({ message: AUTH_ERRORS.LOGOUT_ALL_SUCCESS });
  });
});
