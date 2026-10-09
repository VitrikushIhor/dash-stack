import { SignupUseCase } from '../../../../../src/auth/application/use-cases/commands/signup.use-case';
import { AUTH_ERRORS } from '../../../../../src/auth/domain/constants/auth-errors';
import { AuthTokenType } from '../../../../../src/auth/domain/enums/token-type.enum';

describe('SignupUseCase', () => {
  let useCase: SignupUseCase;
  let userRepoMock: any;
  let signupTransactionMock: any;
  let verificationTokenRepoMock: any;
  let passwordHasherMock: any;
  let mailerMock: any;
  let oneTimeTokenMock: any;

  beforeEach(() => {
    userRepoMock = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      create: jest.fn(),
    };
    signupTransactionMock = { createPending: jest.fn().mockResolvedValue(true) };
    verificationTokenRepoMock = { issueLatest: jest.fn() };
    passwordHasherMock = {
      hashPassword: jest.fn(),
      validatePassword: jest.fn(),
    };
    mailerMock = {
      sendVerificationEmail: jest.fn(),
    };
    oneTimeTokenMock = {
      create: jest.fn().mockReturnValue({ raw: 'raw-token', hash: 'token-hash' }),
    };

    useCase = new SignupUseCase(
      userRepoMock,
      signupTransactionMock,
      verificationTokenRepoMock,
      passwordHasherMock,
      mailerMock,
      oneTimeTokenMock,
    );
  });

  it('should successfully register a user and send verification email', async () => {
    userRepoMock.findByEmailWithPassword.mockResolvedValue(null);
    passwordHasherMock.hashPassword.mockResolvedValue('hashed_password');

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(userRepoMock.findByEmailWithPassword).toHaveBeenCalledWith('test@example.com');
    expect(passwordHasherMock.hashPassword).toHaveBeenCalledWith('password123');
    expect(signupTransactionMock.createPending).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        emailVerified: null,
      },
      expect.objectContaining({
        email: 'test@example.com',
        type: AuthTokenType.EMAIL_VERIFICATION,
        token: 'token-hash',
      }),
    );
    expect(mailerMock.sendVerificationEmail).toHaveBeenCalledWith('test@example.com', 'raw-token');
    expect(result).toEqual({ message: AUTH_ERRORS.SIGNUP_SUCCESS });
  });

  it('should_not_send_a_second_email_when_concurrent_signup_loses_unique_email_race', async () => {
    userRepoMock.findByEmailWithPassword.mockResolvedValue(null);
    passwordHasherMock.hashPassword.mockResolvedValue('hashed_password');
    signupTransactionMock.createPending.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'password123' }),
    ).resolves.toEqual({ message: AUTH_ERRORS.SIGNUP_SUCCESS });
    expect(mailerMock.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('should_resend_verification_when_unverified_user_retries_with_correct_password', async () => {
    userRepoMock.findByEmailWithPassword.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password: 'existing-hash',
      emailVerified: null,
    });
    passwordHasherMock.validatePassword.mockResolvedValue(true);

    const result = await useCase.execute({ email: 'test@example.com', password: 'password123' });

    expect(verificationTokenRepoMock.issueLatest).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com', token: 'token-hash' }),
    );
    expect(signupTransactionMock.createPending).not.toHaveBeenCalled();
    expect(mailerMock.sendVerificationEmail).toHaveBeenCalledWith('test@example.com', 'raw-token');
    expect(result).toEqual({ message: AUTH_ERRORS.SIGNUP_SUCCESS });
  });

  it('should_allow_retry_after_verification_email_delivery_fails', async () => {
    userRepoMock.findByEmailWithPassword.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: '1',
      email: 'test@example.com',
      password: 'hashed_password',
      emailVerified: null,
    });
    passwordHasherMock.hashPassword.mockResolvedValue('hashed_password');
    passwordHasherMock.validatePassword.mockResolvedValue(true);
    mailerMock.sendVerificationEmail.mockRejectedValueOnce(new Error('mail unavailable'));
    const command = { email: 'test@example.com', password: 'password123' };

    await expect(useCase.execute(command)).rejects.toThrow('mail unavailable');
    await expect(useCase.execute(command)).resolves.toEqual({
      message: AUTH_ERRORS.SIGNUP_SUCCESS,
    });

    expect(signupTransactionMock.createPending).toHaveBeenCalledTimes(1);
    expect(verificationTokenRepoMock.issueLatest).toHaveBeenCalledTimes(1);
    expect(mailerMock.sendVerificationEmail).toHaveBeenCalledTimes(2);
  });

  it('should_return_generic_success_without_sending_when_existing_password_is_wrong', async () => {
    userRepoMock.findByEmailWithPassword.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password: 'existing-hash',
      emailVerified: null,
    });
    passwordHasherMock.validatePassword.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'wrong-password' }),
    ).resolves.toEqual({ message: AUTH_ERRORS.SIGNUP_SUCCESS });
    expect(verificationTokenRepoMock.issueLatest).not.toHaveBeenCalled();
    expect(mailerMock.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it('should_return_generic_success_without_sending_for_verified_user', async () => {
    userRepoMock.findByEmailWithPassword.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password: 'existing-hash',
      emailVerified: new Date(),
    });

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'password123' }),
    ).resolves.toEqual({ message: AUTH_ERRORS.SIGNUP_SUCCESS });
    expect(verificationTokenRepoMock.issueLatest).not.toHaveBeenCalled();
    expect(mailerMock.sendVerificationEmail).not.toHaveBeenCalled();
  });
});
