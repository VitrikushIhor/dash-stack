import { LogoutAllUseCase } from '../../../../../src/auth/application/use-cases/commands/logout-all.use-case';
import { AUTH_ERRORS } from '../../../../../src/auth/domain/constants/auth-errors';

describe('LogoutAllUseCase', () => {
  let useCase: LogoutAllUseCase;
  let refreshTokenRepoMock: any;

  beforeEach(() => {
    refreshTokenRepoMock = {
      deleteAllByUserId: jest.fn(),
    };
    useCase = new LogoutAllUseCase(refreshTokenRepoMock);
  });

  it('should delete all refresh tokens for a user', async () => {
    const result = await useCase.execute({ userId: 'user-1' });

    expect(refreshTokenRepoMock.deleteAllByUserId).toHaveBeenCalledWith(
      'user-1',
    );
    expect(result).toEqual({ message: AUTH_ERRORS.LOGOUT_ALL_SUCCESS });
  });
});
