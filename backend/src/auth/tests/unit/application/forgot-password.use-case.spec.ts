import { ForgotPasswordUseCase } from '../../../../../src/auth/application/use-cases/commands/forgot-password.use-case';
import { AuthTokenType } from '../../../../../src/auth/domain/enums/token-type.enum';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let userRepoMock: any;
  let verificationTokenRepoMock: any;
  let mailerMock: any;

  beforeEach(() => {
    userRepoMock = {
      findByEmail: jest.fn(),
    };
    verificationTokenRepoMock = {
      deleteManyByEmailAndType: jest.fn(),
      create: jest.fn(),
    };
    mailerMock = {
      sendPasswordResetEmail: jest.fn(),
    };

    useCase = new ForgotPasswordUseCase(
      userRepoMock,
      verificationTokenRepoMock,
      mailerMock,
    );
  });

  it('should delete old tokens, create a new one, and send email if user exists', async () => {
    userRepoMock.findByEmail.mockResolvedValue({ id: '1' });

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(
      verificationTokenRepoMock.deleteManyByEmailAndType,
    ).toHaveBeenCalledWith('test@example.com', AuthTokenType.PASSWORD_RESET);
    expect(verificationTokenRepoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        type: AuthTokenType.PASSWORD_RESET,
      }),
    );
    expect(mailerMock.sendPasswordResetEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String),
    );
    expect(result.message).toBeDefined();
  });

  it('should silently succeed if user does not exist (prevent enumeration)', async () => {
    userRepoMock.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({ email: 'notfound@example.com' });

    expect(verificationTokenRepoMock.create).not.toHaveBeenCalled();
    expect(mailerMock.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(result.message).toBeDefined();
  });
});
