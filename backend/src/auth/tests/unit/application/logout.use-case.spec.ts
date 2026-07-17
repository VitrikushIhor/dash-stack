import { LogoutUseCase } from '../../../../../src/auth/application/use-cases/commands/logout.use-case';
import { BadRequestException } from '../../../../../src/common/exceptions/domain.exception';
import { AUTH_ERRORS } from '../../../../../src/auth/domain/constants/auth-errors';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let refreshTokenRepoMock: any;

  beforeEach(() => {
    refreshTokenRepoMock = {
      deleteByToken: jest.fn(),
    };
    useCase = new LogoutUseCase(refreshTokenRepoMock);
  });

  it('should delete the refresh token and return success', async () => {
    refreshTokenRepoMock.deleteByToken.mockResolvedValue({ count: 1 });

    const result = await useCase.execute({ refreshToken: 'valid-token' });

    expect(refreshTokenRepoMock.deleteByToken).toHaveBeenCalledWith(
      'valid-token',
    );
    expect(result).toEqual({ message: AUTH_ERRORS.LOGOUT_SUCCESS });
  });

  it('should throw BadRequestException if token not found (count 0)', async () => {
    refreshTokenRepoMock.deleteByToken.mockResolvedValue({ count: 0 });

    await expect(useCase.execute({ refreshToken: 'invalid' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
