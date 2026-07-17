import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../../../src/auth/presentation/controllers/auth.controller';
import { SignupUseCase } from '../../../../../src/auth/application/use-cases/commands/signup.use-case';
import { LoginUseCase } from '../../../../../src/auth/application/use-cases/commands/login.use-case';
import { VerifyEmailUseCase } from '../../../../../src/auth/application/use-cases/commands/verify-email.use-case';
import { RefreshTokenUseCase } from '../../../../../src/auth/application/use-cases/commands/refresh-token.use-case';
import { LogoutUseCase } from '../../../../../src/auth/application/use-cases/commands/logout.use-case';
import { LogoutAllUseCase } from '../../../../../src/auth/application/use-cases/commands/logout-all.use-case';
import { ForgotPasswordUseCase } from '../../../../../src/auth/application/use-cases/commands/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../../../../src/auth/application/use-cases/commands/reset-password.use-case';
import { OAuthExchangeUseCase } from '../../../../../src/auth/application/use-cases/commands/oauth-exchange.use-case';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUseCase = () => ({ execute: jest.fn() });

  let signupUseCase: any;
  let loginUseCase: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: SignupUseCase, useFactory: mockUseCase },
        { provide: LoginUseCase, useFactory: mockUseCase },
        { provide: VerifyEmailUseCase, useFactory: mockUseCase },
        { provide: RefreshTokenUseCase, useFactory: mockUseCase },
        { provide: LogoutUseCase, useFactory: mockUseCase },
        { provide: LogoutAllUseCase, useFactory: mockUseCase },
        { provide: ForgotPasswordUseCase, useFactory: mockUseCase },
        { provide: ResetPasswordUseCase, useFactory: mockUseCase },
        { provide: OAuthExchangeUseCase, useFactory: mockUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    signupUseCase = module.get<SignupUseCase>(SignupUseCase);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should map signup DTO to Command and call UseCase', async () => {
    signupUseCase.execute.mockResolvedValue({ message: 'Success' });
    const result = await controller.signup({
      email: 'a@b.com',
      password: 'pwd',
      first_name: 'John',
      last_name: 'Doe',
    });
    expect(signupUseCase.execute).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pwd',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result).toEqual({ message: 'Success' });
  });

  it('should map login DTO to Command and call UseCase', async () => {
    loginUseCase.execute.mockResolvedValue({ accessToken: 'acc' });
    const result = await controller.login({
      email: 'a@b.com',
      password: 'pwd',
    });
    expect(loginUseCase.execute).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pwd',
    });
    expect(result).toEqual({ accessToken: 'acc' });
  });
});
