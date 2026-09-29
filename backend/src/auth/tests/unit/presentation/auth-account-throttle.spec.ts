import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Writable } from 'node:stream';
import { LoggerModule } from 'nestjs-pino';
import {
  serializeHttpRequest,
  serializeHttpResponse,
} from '../../../../common/configs/http-log-serializers';
import { ThrottlerModule } from '@nestjs/throttler';
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

describe('Auth account throttling HTTP', () => {
  let app: INestApplication;
  let origin: string;
  const login = jest.fn().mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
  const entries: string[] = [];
  const sessionTokens = { accessToken: 'ACCESS_SECRET', refreshToken: 'REFRESH_SECRET' };
  const verifyEmail = jest.fn().mockResolvedValue(sessionTokens);
  const refreshToken = jest.fn().mockResolvedValue(sessionTokens);
  const oauthCode = jest.fn().mockResolvedValue(sessionTokens);
  const resetPassword = jest.fn().mockResolvedValue({ message: 'done' });

  beforeAll(async () => {
    const stream = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        entries.push(chunk.toString());
        callback();
      },
    });
    const module = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        LoggerModule.forRoot({
          pinoHttp: {
            autoLogging: true,
            serializers: { req: serializeHttpRequest, res: serializeHttpResponse },
            stream,
          },
        }),
      ],
      controllers: [AuthController],
      providers: [
        { provide: SignupUseCase, useValue: { execute: jest.fn() } },
        { provide: LoginUseCase, useValue: { execute: login } },
        { provide: VerifyEmailUseCase, useValue: { execute: verifyEmail } },
        { provide: RefreshTokenUseCase, useValue: { execute: refreshToken } },
        { provide: LogoutUseCase, useValue: { execute: jest.fn() } },
        { provide: LogoutAllUseCase, useValue: { execute: jest.fn() } },
        { provide: ForgotPasswordUseCase, useValue: { execute: jest.fn() } },
        { provide: ResetPasswordUseCase, useValue: { execute: resetPassword } },
        { provide: OAuthExchangeUseCase, useValue: { executeCode: oauthCode } },
      ],
    }).compile();

    app = module.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.listen(0, '127.0.0.1');
    origin = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  const attempt = (email: string, forwardedFor?: string) =>
    fetch(`${origin}/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
      },
      body: JSON.stringify({ email, password: 'password123' }),
      signal: AbortSignal.timeout(5000),
    });

  it('should_return_429_for_repeated_attempts_to_one_account_without_blocking_another', async () => {
    login.mockClear();

    for (let index = 0; index < 5; index += 1) {
      const response = await attempt('Target@Example.com', `192.0.2.${index + 1}`);
      expect(response.status).toBe(200);
    }

    const blocked = await attempt('target@example.com', '198.51.100.1');
    const otherAccount = await attempt('other@example.com');

    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(otherAccount.status).toBe(200);
    expect(login).toHaveBeenCalledTimes(6);
  });

  it('should_omit_credentials_and_email_from_successful_login_log', async () => {
    entries.length = 0;
    login.mockResolvedValueOnce({
      accessToken: 'ACCESS_SECRET',
      refreshToken: 'REFRESH_SECRET',
    });

    const response = await fetch(`${origin}/auth/login?token=QUERY_SECRET`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'private@example.com',
        password: 'PASSWORD_SECRET',
      }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('ACCESS_SECRET');
    expect(await response.json()).toEqual({ authenticated: true });
    const logged = entries.join('');
    expect(logged).toContain('/auth/login');
    for (const secret of [
      'ACCESS_SECRET',
      'REFRESH_SECRET',
      'PASSWORD_SECRET',
      'QUERY_SECRET',
      'private@example.com',
    ]) {
      expect(logged).not.toContain(secret);
    }
  });

  it.each([
    ['verify-email', { token: 'VERIFY_INPUT_SECRET' }, undefined],
    ['oauth/code', { code: 'OAUTH_CODE_SECRET', codeVerifier: 'v'.repeat(43) }, undefined],
    ['refresh', { token: 'REFRESH_INPUT_SECRET' }, 'refresh_token=REFRESH_INPUT_SECRET'],
  ])('should_omit_credentials_from_successful_%s_log', async (path, body, cookie) => {
    entries.length = 0;

    const response = await fetch(`${origin}/auth/${path}?token=QUERY_SECRET`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('ACCESS_SECRET');
    expect(await response.json()).toEqual({ authenticated: true });
    const logged = entries.join('');
    expect(logged).toContain(`/auth/${path}`);
    for (const secret of [
      'ACCESS_SECRET',
      'REFRESH_SECRET',
      'VERIFY_INPUT_SECRET',
      'OAUTH_CODE_SECRET',
      'REFRESH_INPUT_SECRET',
      'QUERY_SECRET',
    ]) {
      expect(logged).not.toContain(secret);
    }
  });

  it.each([
    ['verify-email', { token: 'verify-rate-limit-token' }, { token: 'other-verify-token' }],
    [
      'reset-password',
      { token: 'reset-rate-limit-token', password: 'newpassword123' },
      { token: 'other-reset-token', password: 'newpassword123' },
    ],
    [
      'oauth/code',
      { code: 'rate-limit-code', codeVerifier: 'v'.repeat(43) },
      { code: 'other-code', codeVerifier: 'v'.repeat(43) },
    ],
  ])(
    'should_limit_repeated_%s_credentials_without_blocking_another',
    async (path, body, otherBody) => {
      const attemptCredential = (payload: Record<string, string>, forwardedFor?: string) =>
        fetch(`${origin}/auth/${path}`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
          },
          body: JSON.stringify(payload),
        });

      for (let index = 0; index < 5; index += 1) {
        const response = await attemptCredential(body, `192.0.2.${index + 1}`);
        expect(response.status).toBe(200);
      }

      const blocked = await attemptCredential(body, '198.51.100.1');
      const other = await attemptCredential(otherBody);

      expect(blocked.status).toBe(429);
      expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
      expect(other.status).toBe(200);
    },
  );

  it.each([
    [
      'signup',
      5,
      {
        email: 'signup@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      },
    ],
    ['forgot-password', 3, { email: 'forgot@example.com' }],
  ])('should_return_429_for_repeated_%s_requests', async (path, limit, body) => {
    for (let index = 0; index < limit; index += 1) {
      const response = await fetch(`${origin}/auth/${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      expect(response.status).toBeLessThan(400);
    }

    const blocked = await fetch(`${origin}/auth/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    expect(blocked.status).toBe(429);
  });
});
