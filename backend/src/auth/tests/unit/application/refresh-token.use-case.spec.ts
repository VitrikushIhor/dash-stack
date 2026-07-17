import { RefreshTokenUseCase } from '../../../../../src/auth/application/use-cases/commands/refresh-token.use-case';
import { UnauthorizedException } from '../../../../../src/common/exceptions/domain.exception';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let refreshTokenRepoMock: any;
  let tokenGeneratorMock: any;

  beforeEach(() => {
    refreshTokenRepoMock = {
      findByToken: jest.fn(),
      deleteById: jest.fn(),
    };
    tokenGeneratorMock = {
      generateAccessToken: jest.fn(),
    };

    useCase = new RefreshTokenUseCase(refreshTokenRepoMock, tokenGeneratorMock);
  });

  it('should generate new access token for valid refresh token', async () => {
    refreshTokenRepoMock.findByToken.mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 10000),
    });
    tokenGeneratorMock.generateAccessToken.mockReturnValue('new-acc-token');

    const result = await useCase.execute({ token: 'valid-ref' });

    expect(tokenGeneratorMock.generateAccessToken).toHaveBeenCalledWith(
      'user-1',
    );
    expect(result).toEqual({ accessToken: 'new-acc-token' });
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    refreshTokenRepoMock.findByToken.mockResolvedValue(null);
    await expect(useCase.execute({ token: 'invalid' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should delete token and throw if it is expired', async () => {
    refreshTokenRepoMock.findByToken.mockResolvedValue({
      id: 'token-1',
      expiresAt: new Date(Date.now() - 10000), // past
    });

    await expect(useCase.execute({ token: 'expired' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(refreshTokenRepoMock.deleteById).toHaveBeenCalledWith('token-1');
  });
});
