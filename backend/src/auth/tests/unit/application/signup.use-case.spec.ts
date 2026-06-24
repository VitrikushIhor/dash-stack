import { SignupUseCase } from '../../../../../src/auth/application/use-cases/commands/signup.use-case';
import { ConflictException } from '../../../../../src/common/exceptions/domain.exception';
import { AUTH_ERRORS } from '../../../../../src/auth/domain/constants/auth-errors';
import { AuthTokenType } from '../../../../../src/auth/domain/enums/token-type.enum';

describe('SignupUseCase', () => {
  let useCase: SignupUseCase;
  let userRepoMock: any;
  let verificationTokenRepoMock: any;
  let passwordHasherMock: any;
  let mailerMock: any;

  beforeEach(() => {
    userRepoMock = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    verificationTokenRepoMock = {
      create: jest.fn(),
    };
    passwordHasherMock = {
      hashPassword: jest.fn(),
    };
    mailerMock = {
      sendVerificationEmail: jest.fn(),
    };

    useCase = new SignupUseCase(
      userRepoMock,
      verificationTokenRepoMock,
      passwordHasherMock,
      mailerMock,
    );
  });

  it('should successfully register a user and send verification email', async () => {
    userRepoMock.findByEmail.mockResolvedValue(null);
    passwordHasherMock.hashPassword.mockResolvedValue('hashed_password');
    userRepoMock.create.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(userRepoMock.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(passwordHasherMock.hashPassword).toHaveBeenCalledWith('password123');
    expect(userRepoMock.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'hashed_password',
      firstName: 'John',
      lastName: 'Doe',
      emailVerified: null,
    });
    expect(verificationTokenRepoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        type: AuthTokenType.EMAIL_VERIFICATION,
        token: expect.any(String),
      }),
    );
    expect(mailerMock.sendVerificationEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String),
    );
    expect(result).toEqual({ message: AUTH_ERRORS.SIGNUP_SUCCESS });
  });

  it('should throw ConflictException if user already exists', async () => {
    userRepoMock.findByEmail.mockResolvedValue({ id: '1' });

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);

    expect(userRepoMock.create).not.toHaveBeenCalled();
    expect(mailerMock.sendVerificationEmail).not.toHaveBeenCalled();
  });
});
