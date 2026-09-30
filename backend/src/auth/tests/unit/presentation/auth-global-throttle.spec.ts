import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
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

describe('Auth cross-credential abuse throttle HTTP', () => {
  let app: INestApplication;
  let origin: string;
  const login = jest.fn().mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          { name: 'default', ttl: 60000, limit: 600 },
          { name: 'abuse', ttl: 60000, limit: 3, getTracker: () => 'all' },
        ]),
      ],
      controllers: [AuthController],
      providers: [
        { provide: SignupUseCase, useValue: { execute: jest.fn() } },
        { provide: LoginUseCase, useValue: { execute: login } },
        { provide: VerifyEmailUseCase, useValue: { execute: jest.fn() } },
        { provide: RefreshTokenUseCase, useValue: { execute: jest.fn() } },
        { provide: LogoutUseCase, useValue: { execute: jest.fn() } },
        { provide: LogoutAllUseCase, useValue: { execute: jest.fn() } },
        { provide: ForgotPasswordUseCase, useValue: { execute: jest.fn() } },
        { provide: ResetPasswordUseCase, useValue: { execute: jest.fn() } },
        { provide: OAuthExchangeUseCase, useValue: { executeCode: jest.fn() } },
      ],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: false },
      }),
    );
    await app.listen(0, '127.0.0.1');
    origin = await app.getUrl();
  });

  afterAll(async () => app.close());

  it('should_reject_distinct_account_attempts_after_global_limit_without_trusting_forwarded_headers', async () => {
    for (let index = 0; index < 3; index += 1) {
      const response = await fetch(`${origin}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': `192.0.2.${index}` },
        body: JSON.stringify({ email: `user-${index}@example.test`, password: 'password123' }),
      });
      expect(response.status).toBe(200);
    }

    const blocked = await fetch(`${origin}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.99' },
      body: JSON.stringify({ email: 'another@example.test', password: 'password123' }),
    });
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after-abuse'))).toBeGreaterThan(0);
    expect(login).toHaveBeenCalledTimes(3);
  });
});
