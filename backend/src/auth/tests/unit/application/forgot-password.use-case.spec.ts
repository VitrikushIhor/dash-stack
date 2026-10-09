import { ForgotPasswordUseCase } from '../../../../../src/auth/application/use-cases/commands/forgot-password.use-case';
import { AuthTokenType } from '../../../../../src/auth/domain/enums/token-type.enum';
import { AUTH_ERRORS } from '../../../../../src/auth/domain/constants/auth-errors';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let userRepoMock: any;
  let verificationTokenRepoMock: any;
  let mailerMock: any;
  let oneTimeTokenMock: any;

  beforeEach(() => {
    userRepoMock = {
      findByEmail: jest.fn(),
    };
    verificationTokenRepoMock = {
      deleteManyByEmailAndType: jest.fn(),
      create: jest.fn(),
      issueLatest: jest.fn(),
    };
    mailerMock = {
      sendPasswordResetEmail: jest.fn(),
    };
    oneTimeTokenMock = {
      create: jest.fn().mockReturnValue({ raw: 'raw-token', hash: 'token-hash' }),
    };

    useCase = new ForgotPasswordUseCase(
      userRepoMock,
      verificationTokenRepoMock,
      mailerMock,
      oneTimeTokenMock,
    );
  });

  it('should delete old tokens, create a new one, and send email if user exists', async () => {
    userRepoMock.findByEmail.mockResolvedValue({ id: '1' });

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(verificationTokenRepoMock.issueLatest).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        type: AuthTokenType.PASSWORD_RESET,
        token: 'token-hash',
      }),
    );
    expect(verificationTokenRepoMock.deleteManyByEmailAndType).not.toHaveBeenCalled();
    expect(verificationTokenRepoMock.create).not.toHaveBeenCalled();
    expect(mailerMock.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com', 'raw-token');
    expect(result.message).toBeDefined();
  });

  it('should silently succeed if user does not exist (prevent enumeration)', async () => {
    userRepoMock.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({ email: 'notfound@example.com' });

    expect(verificationTokenRepoMock.create).not.toHaveBeenCalled();
    expect(mailerMock.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(result.message).toBeDefined();
  });

  it('should_return_generic_success_when_password_reset_delivery_fails', async () => {
    userRepoMock.findByEmail.mockResolvedValue({ id: '1' });
    mailerMock.sendPasswordResetEmail.mockRejectedValue(new Error('SMTP unavailable'));

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result).toEqual({ message: AUTH_ERRORS.FORGOT_PASSWORD_SUCCESS });
  });
});
