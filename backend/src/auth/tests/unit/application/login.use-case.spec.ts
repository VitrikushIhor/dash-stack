import { LoginUseCase } from '../../../../../src/auth/application/use-cases/commands/login.use-case';
import {
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '../../../../../src/common/exceptions/domain.exception';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepoMock: any;
  let passwordHasherMock: any;
  let tokenGeneratorMock: any;

  beforeEach(() => {
    userRepoMock = {
      findByEmail: jest.fn(),
    };
    passwordHasherMock = {
      validatePassword: jest.fn(),
    };
    tokenGeneratorMock = {
      generateTokens: jest.fn(),
    };

    useCase = new LoginUseCase(
      userRepoMock,
      passwordHasherMock,
      tokenGeneratorMock,
    );
  });

  it('should successfully log in a verified user', async () => {
    userRepoMock.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password: 'hashed_password',
      emailVerified: new Date(),
    });
    passwordHasherMock.validatePassword.mockResolvedValue(true);
    tokenGeneratorMock.generateTokens.mockReturnValue({
      accessToken: 'acc_token',
      refreshToken: 'ref_token',
    });

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(userRepoMock.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(passwordHasherMock.validatePassword).toHaveBeenCalledWith(
      'password123',
      'hashed_password',
    );
    expect(tokenGeneratorMock.generateTokens).toHaveBeenCalledWith('1');
    expect(result).toEqual({
      accessToken: 'acc_token',
      refreshToken: 'ref_token',
    });
  });

  it('should throw UnauthorizedException if user not found', async () => {
    userRepoMock.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'pwd' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw BadRequestException if user has no password (social login)', async () => {
    userRepoMock.findByEmail.mockResolvedValue({
      id: '1',
      password: null,
    });

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'pwd' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw UnauthorizedException on wrong password', async () => {
    userRepoMock.findByEmail.mockResolvedValue({
      id: '1',
      password: 'hashed_password',
    });
    passwordHasherMock.validatePassword.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if email not verified', async () => {
    userRepoMock.findByEmail.mockResolvedValue({
      id: '1',
      password: 'hashed_password',
      emailVerified: null,
    });
    passwordHasherMock.validatePassword.mockResolvedValue(true);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'pwd' }),
    ).rejects.toThrow(ForbiddenException);
  });
});
