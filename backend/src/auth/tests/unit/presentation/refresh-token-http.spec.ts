import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { json } from 'express';
import * as cookieParser from 'cookie-parser';
import { AuthController } from '../../../presentation/controllers/auth.controller';
import { SignupUseCase } from '../../../application/use-cases/commands/signup.use-case';
import { LoginUseCase } from '../../../application/use-cases/commands/login.use-case';
import { VerifyEmailUseCase } from '../../../application/use-cases/commands/verify-email.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/commands/refresh-token.use-case';
import { LogoutUseCase } from '../../../application/use-cases/commands/logout.use-case';
import { LogoutAllUseCase } from '../../../application/use-cases/commands/logout-all.use-case';
import { ForgotPasswordUseCase } from '../../../application/use-cases/commands/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../../application/use-cases/commands/reset-password.use-case';
import { OAuthExchangeUseCase } from '../../../application/use-cases/commands/oauth-exchange.use-case';
import { DomainExceptionFilter } from '../../../../common/filters/domain-exception.filter';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';

describe('Refresh token HTTP boundary', () => {
  let app: INestApplication;
  let origin: string;
  const login = jest.fn();
  const refresh = jest.fn();
  const logout = jest.fn();
  const verify = jest.fn();
  const reset = jest.fn();
  const oauthCode = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])],
      controllers: [AuthController],
      providers: [
        { provide: SignupUseCase, useValue: { execute: jest.fn() } },
        { provide: LoginUseCase, useValue: { execute: login } },
        { provide: VerifyEmailUseCase, useValue: { execute: verify } },
        { provide: RefreshTokenUseCase, useValue: { execute: refresh } },
        { provide: LogoutUseCase, useValue: { execute: logout } },
        { provide: LogoutAllUseCase, useValue: { execute: jest.fn() } },
        { provide: ForgotPasswordUseCase, useValue: { execute: jest.fn() } },
        { provide: ResetPasswordUseCase, useValue: { execute: reset } },
        { provide: OAuthExchangeUseCase, useValue: { executeCode: oauthCode } },
      ],
    }).compile();

    app = module.createNestApplication({ logger: false });
    app.use(json());
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: false },
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.listen(0, '127.0.0.1');
    origin = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    login.mockReset();
    refresh.mockReset();
    logout.mockReset();
    verify.mockReset();
    reset.mockReset();
    oauthCode.mockReset();
  });

  const request = (
    path: 'refresh' | 'logout' | 'verify-email' | 'reset-password' | 'oauth/code',
    body: unknown,
    cookie?: string,
  ) =>
    fetch(`${origin}/auth/${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

  it.each([null, {}, [], 42, true, { nested: 'token' }])(
    'should_reject_malformed_refresh_token_when_body_value_is_%p',
    async (token) => {
      const response = await request('refresh', { token });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      expect(refresh).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['verify-email', { token: 42 }, verify],
    ['reset-password', { token: 42, password: 'secret42' }, reset],
    ['oauth/code', { code: 42, codeVerifier: 'a'.repeat(43) }, oauthCode],
  ] as const)('should_reject_numeric_credential_in_%s_body', async (path, body, useCase) => {
    const response = await request(path, body);

    expect(response.status).toBe(400);
    expect(useCase).not.toHaveBeenCalled();
  });

  it('should_reject_unknown_auth_body_fields_before_login_use_case', async () => {
    const response = await fetch(`${origin}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.test', password: 'password123', role: 'OWNER' }),
    });

    expect(response.status).toBe(400);
  });

  it.each([
    [],
    ['unexpected'],
    { token: 'valid-body-token', role: 'OWNER' },
    { token: 'a', refreshToken: 'b' },
  ])('should_reject_invalid_refresh_body_shape_even_with_cookie_%p', async (body) => {
    const response = await request('refresh', body, 'refresh_token=valid-cookie-token');

    expect(response.status).toBe(400);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('should_not_accept_auth_credentials_from_query_parameters', async () => {
    const loginResponse = await fetch(`${origin}/auth/login?email=attacker@example.test`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'password123' }),
    });
    const refreshResponse = await fetch(`${origin}/auth/refresh?token=query-token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });

    expect(loginResponse.status).toBe(400);
    expect(refreshResponse.status).toBe(401);
    expect(login).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('should_reject_malformed_logout_cookie_without_revoking_a_session', async () => {
    const response = await request('logout', {}, 'refresh_token=%7Bbad%7D');

    expect(response.status).toBe(400);
    expect(logout).not.toHaveBeenCalled();
  });

  it('should_return_auth_error_for_invalid_refresh_body', async () => {
    const response = await request('refresh', { token: 'a', refreshToken: 'b' });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({ message: AUTH_ERRORS.INVALID_REFRESH_TOKEN_BODY }),
    );
    expect(refresh).not.toHaveBeenCalled();
  });

  it('should_return_401_for_missing_refresh_token_without_calling_use_case', async () => {
    const response = await request('refresh', {});

    expect(response.status).toBe(401);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('should_reject_oversized_refresh_token_before_use_case', async () => {
    const response = await request('refresh', { token: 'a'.repeat(4097) });

    expect(response.status).toBe(400);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('should_reject_invalid_body_token_even_with_valid_cookie', async () => {
    const response = await request('refresh', { token: {} }, 'refresh_token=valid-cookie-token');

    expect(response.status).toBe(400);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('should_allow_ten_parallel_refresh_requests_for_one_session', async () => {
    refresh.mockResolvedValue({ accessToken: 'access', refreshToken: 'parallel-session' });

    const responses = await Promise.all(
      Array.from({ length: 10 }, () => request('refresh', { token: 'parallel-session' })),
    );

    expect(responses.map((response) => response.status)).toEqual(Array(10).fill(200));
    expect(refresh).toHaveBeenCalledTimes(10);
  });

  it.each(['body', 'cookie'])(
    'should_limit_repeated_%s_refresh_without_blocking_another_session',
    async (transport) => {
      refresh.mockResolvedValue({ accessToken: 'access', refreshToken: 'stable-session' });
      const attempt = (credential: string) =>
        transport === 'body'
          ? request('refresh', { token: credential })
          : request('refresh', {}, `refresh_token=${credential}`);

      for (let index = 0; index < 20; index += 1) {
        const response = await attempt(`${transport}-limited-session`);
        expect(response.status).toBe(200);
      }

      const blocked = await attempt(`${transport}-limited-session`);
      const other = await attempt(`${transport}-other-session`);

      expect(blocked.status).toBe(429);
      expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
      expect(other.status).toBe(200);
      expect(refresh).toHaveBeenCalledTimes(21);
    },
  );

  it('should_accept_cookie_refresh_token_when_body_has_no_token', async () => {
    refresh.mockResolvedValue({ accessToken: 'access', refreshToken: 'cookie-token' });

    const response = await request('refresh', {}, 'refresh_token=cookie-token');

    expect(response.status).toBe(200);
    expect(refresh).toHaveBeenCalledWith({ token: 'cookie-token' });
  });
});
