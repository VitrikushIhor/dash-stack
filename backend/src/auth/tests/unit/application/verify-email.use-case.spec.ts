import { VerifyEmailUseCase } from '../../../../../src/auth/application/use-cases/commands/verify-email.use-case';
import { BadRequestException } from '../../../../../src/common/exceptions/domain.exception';
import { AuthTokenType } from '../../../../../src/auth/domain/enums/token-type.enum';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;
  let verificationTokenRepoMock: any;
  let userRepoMock: any;
  let tokenGeneratorMock: any;

  beforeEach(() => {
    verificationTokenRepoMock = {
      findByToken: jest.fn(),
      deleteById: jest.fn(),
    };
    userRepoMock = {
      updateEmailVerified: jest.fn(),
    };
    tokenGeneratorMock = {
      generateTokens: jest.fn(),
    };

    useCase = new VerifyEmailUseCase(
      verificationTokenRepoMock,
      userRepoMock,
      tokenGeneratorMock,
    );
  });

  it('should successfully verify email and generate tokens', async () => {
    verificationTokenRepoMock.findByToken.mockResolvedValue({
      id: 'token-1',
      email: 'test@example.com',
      type: AuthTokenType.EMAIL_VERIFICATION,
      expires: new Date(Date.now() + 10000),
    });
    userRepoMock.updateEmailVerified.mockResolvedValue({ id: 'user-1' });
    tokenGeneratorMock.generateTokens.mockReturnValue({ accessToken: 'acc' });

    const result = await useCase.execute({ token: 'valid' });

    expect(userRepoMock.updateEmailVerified).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(Date),
    );
    expect(verificationTokenRepoMock.deleteById).toHaveBeenCalledWith(
      'token-1',
    );
    expect(tokenGeneratorMock.generateTokens).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ accessToken: 'acc' });
  });

  it('should throw BadRequestException if token not found', async () => {
    verificationTokenRepoMock.findByToken.mockResolvedValue(null);
    await expect(useCase.execute({ token: 'invalid' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
