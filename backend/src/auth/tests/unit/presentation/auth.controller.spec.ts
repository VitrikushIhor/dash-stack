import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
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
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUseCase = () => ({ execute: jest.fn() });

  let signupUseCase: any;
  let loginUseCase: any;
  let verifyEmailUseCase: VerifyEmailUseCase;
  let refreshTokenUseCase: RefreshTokenUseCase;
  let oauthExchangeUseCase: OAuthExchangeUseCase;
  let logoutUseCase: LogoutUseCase;
  let logoutAllUseCase: LogoutAllUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])],
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
        {
          provide: OAuthExchangeUseCase,
          useFactory: () => ({ execute: jest.fn(), executeCode: jest.fn() }),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    signupUseCase = module.get<SignupUseCase>(SignupUseCase);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    verifyEmailUseCase = module.get<VerifyEmailUseCase>(VerifyEmailUseCase);
    refreshTokenUseCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    oauthExchangeUseCase = module.get<OAuthExchangeUseCase>(OAuthExchangeUseCase);
    logoutUseCase = module.get<LogoutUseCase>(LogoutUseCase);
    logoutAllUseCase = module.get<LogoutAllUseCase>(LogoutAllUseCase);
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
    loginUseCase.execute.mockResolvedValue({ accessToken: 'acc', refreshToken: 'session' });
    const mockRes = { cookie: jest.fn(), clearCookie: jest.fn() } as unknown as Response;
    const result = await controller.login(
      {
        email: 'a@b.com',
        password: 'pwd',
      },
      mockRes,
      { headers: { 'user-agent': 'Browser test agent' } },
    );
    expect(loginUseCase.execute).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pwd',
      userAgent: 'Browser test agent',
    });
    expect(result).toEqual({ authenticated: true });
    expect(JSON.stringify(result)).not.toContain('acc');
    expect(JSON.stringify(result)).not.toContain('session');
  });

  it('should_not_return_credentials_from_verify_refresh_or_oauth_code_responses', async () => {
    const tokens = { accessToken: 'access-secret', refreshToken: 'session-secret' };
    const response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;

    jest.spyOn(verifyEmailUseCase, 'execute').mockResolvedValue(tokens);
    jest.spyOn(refreshTokenUseCase, 'execute').mockResolvedValue(tokens);
    jest.spyOn(oauthExchangeUseCase, 'executeCode').mockResolvedValue(tokens);

    const results = await Promise.all([
      controller.verifyEmail({ token: 'verification-token' }, response),
      controller.refreshToken('session-secret', response),
      controller.oauthCode({ code: 'oauth-code', codeVerifier: 'v'.repeat(43) }, response),
    ]);

    expect(results).toEqual([
      { authenticated: true },
      { authenticated: true },
      { authenticated: true },
    ]);
    expect(JSON.stringify(results)).not.toContain('access-secret');
    expect(JSON.stringify(results)).not.toContain('session-secret');
  });

  it('should_reject_legacy_oauth_access_token_exchange', async () => {
    const response = { cookie: jest.fn() } as unknown as Response;
    const execute = jest.spyOn(oauthExchangeUseCase, 'execute');

    await expect(controller.oauthExchange({ token: 'access-token' }, response)).rejects.toThrow();
    expect(execute).not.toHaveBeenCalled();
    expect(response.cookie).not.toHaveBeenCalled();
  });

  it('should_not_clear_auth_cookies_when_server_revocation_fails', async () => {
    const response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;

    jest.spyOn(logoutUseCase, 'execute').mockRejectedValueOnce(new Error('Database unavailable'));

    await expect(controller.logout('session-credential', response)).rejects.toThrow(
      'Database unavailable',
    );
    expect(response.clearCookie).not.toHaveBeenCalled();
  });

  it('should_reject_logout_when_refresh_token_is_missing', async () => {
    const response = { clearCookie: jest.fn() } as unknown as Response;

    await expect(controller.logout('', response)).rejects.toThrow();
    expect(response.clearCookie).not.toHaveBeenCalled();
    expect(jest.spyOn(logoutUseCase, 'execute')).not.toHaveBeenCalled();
  });

  it('should_not_clear_auth_cookies_when_logout_all_revocation_fails', async () => {
    const request = { user: { id: 'user-1' } } as Parameters<AuthController['logoutAll']>[0];
    const response = { clearCookie: jest.fn() } as unknown as Response;
    jest
      .spyOn(logoutAllUseCase, 'execute')
      .mockRejectedValueOnce(new Error('Database unavailable'));

    await expect(controller.logoutAll(request, response)).rejects.toThrow('Database unavailable');
    expect(response.clearCookie).not.toHaveBeenCalled();
  });
});
