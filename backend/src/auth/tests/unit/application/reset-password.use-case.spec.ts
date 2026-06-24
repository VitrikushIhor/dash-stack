import { ResetPasswordUseCase } from '../../../../../src/auth/application/use-cases/commands/reset-password.use-case';
import { BadRequestException } from '../../../../../src/common/exceptions/domain.exception';
import { AuthTokenType } from '../../../../../src/auth/domain/enums/token-type.enum';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let verificationTokenRepoMock: any;
  let userRepoMock: any;
  let refreshTokenRepoMock: any;
  let passwordHasherMock: any;

  beforeEach(() => {
    verificationTokenRepoMock = {
      findByToken: jest.fn(),
      deleteById: jest.fn(),
    };
    userRepoMock = {
      updatePassword: jest.fn(),
      findByEmail: jest.fn(),
    };
    refreshTokenRepoMock = {
      deleteAllByUserId: jest.fn(),
    };
    passwordHasherMock = {
      hashPassword: jest.fn(),
    };

    useCase = new ResetPasswordUseCase(
      verificationTokenRepoMock,
      userRepoMock,
      refreshTokenRepoMock,
      passwordHasherMock,
    );
  });

  it('should successfully reset password and invalidate refresh tokens', async () => {
    verificationTokenRepoMock.findByToken.mockResolvedValue({
      id: 'token-1',
      email: 'test@example.com',
      type: AuthTokenType.PASSWORD_RESET,
      expires: new Date(Date.now() + 10000), // future
    });
    passwordHasherMock.hashPassword.mockResolvedValue('new_hash');
    userRepoMock.findByEmail.mockResolvedValue({ id: 'user-1' });

    await useCase.execute({ token: 'valid-token', newPassword: 'new-pwd' });

    expect(passwordHasherMock.hashPassword).toHaveBeenCalledWith('new-pwd');
    expect(userRepoMock.updatePassword).toHaveBeenCalledWith(
      'test@example.com',
      'new_hash',
    );
    expect(verificationTokenRepoMock.deleteById).toHaveBeenCalledWith(
      'token-1',
    );
    expect(refreshTokenRepoMock.deleteAllByUserId).toHaveBeenCalledWith(
      'user-1',
    );
  });

  it('should throw BadRequestException for invalid token', async () => {
    verificationTokenRepoMock.findByToken.mockResolvedValue(null);
    await expect(
      useCase.execute({ token: 'bad', newPassword: 'pwd' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if token type is wrong', async () => {
    verificationTokenRepoMock.findByToken.mockResolvedValue({
      type: AuthTokenType.EMAIL_VERIFICATION,
    });
    await expect(
      useCase.execute({ token: 'bad', newPassword: 'pwd' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if token is expired', async () => {
    verificationTokenRepoMock.findByToken.mockResolvedValue({
      type: AuthTokenType.PASSWORD_RESET,
      expires: new Date(Date.now() - 10000), // past
    });
    await expect(
      useCase.execute({ token: 'bad', newPassword: 'pwd' }),
    ).rejects.toThrow(BadRequestException);
  });
});
