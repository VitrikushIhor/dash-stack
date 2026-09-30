import { Controller, Get, INestApplication, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import type { NextFunction, Request, Response } from 'express';
import { ValidateUserUseCase } from '../../../application/use-cases/queries/validate-user.use-case';
import { JwtAuthGuard } from '../../../presentation/guards/jwt-auth.guard';
import { JwtStrategy } from '../../../presentation/guards/jwt.strategy';
import { DomainExceptionFilter } from '../../../../common/filters/domain-exception.filter';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';

@Controller('protected-test')
@UseGuards(JwtAuthGuard)
class ProtectedController {
  @Get()
  currentUser(@Req() request: Request & { user: { id: string } }) {
    return { id: request.user.id };
  }
}

describe('JWT credential transport HTTP', () => {
  let app: INestApplication;
  let origin: string;
  let token: string;
  const findSession = jest.fn();
  const validateUser = jest.fn();

  beforeAll(async () => {
    const secret = 'test-http-access-secret';
    token = new JwtService({ secret }).sign(
      { userId: 'user-1', sessionId: 'session-1', tokenUse: 'access' },
      { expiresIn: '1m', issuer: 'dash-stack-auth', audience: 'dash-stack-api' },
    );
    findSession.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      lastUsedAt: new Date(),
    });
    validateUser.mockResolvedValue({ id: 'user-1' });
    const module = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ProtectedController],
      providers: [
        JwtAuthGuard,
        JwtStrategy,
        { provide: ConfigService, useValue: { getOrThrow: () => secret } },
        { provide: ValidateUserUseCase, useValue: { execute: validateUser } },
        { provide: 'AuthSessionRepositoryPort', useValue: { findById: findSession } },
      ],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalFilters(new DomainExceptionFilter());
    app.use((request: Request, _response: Response, next: NextFunction) => {
      const access = request.headers.cookie?.match(/(?:^|;\s*)access_token=([^;]+)/)?.[1];
      request.cookies = access ? { access_token: access } : {};
      next();
    });
    await app.listen(0, '127.0.0.1');
    origin = await app.getUrl();
  });

  beforeEach(() => {
    findSession.mockClear();
    validateUser.mockClear();
  });
  afterAll(async () => app.close());

  it.each([
    ['cookie', (access: string) => ({ cookie: `access_token=${access}` })],
    ['bearer', (access: string) => ({ authorization: `Bearer ${access}` })],
  ])('should_accept_valid_%s_credential', async (_kind, headers) => {
    const response = await fetch(`${origin}/protected-test`, { headers: headers(token) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 'user-1' });
    expect(findSession).toHaveBeenCalledTimes(1);
  });

  it('should_return_auth_error_when_access_credential_is_missing', async () => {
    const response = await fetch(`${origin}/protected-test`);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual(
      expect.objectContaining({ message: AUTH_ERRORS.INVALID_ACCESS_TOKEN }),
    );
    expect(findSession).not.toHaveBeenCalled();
  });

  it('should_reject_mixed_cookie_and_bearer_before_session_lookup', async () => {
    const response = await fetch(`${origin}/protected-test`, {
      headers: { cookie: `access_token=${token}`, authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(401);
    expect(findSession).not.toHaveBeenCalled();
    expect(validateUser).not.toHaveBeenCalled();
  });

  it.each([
    [
      'missing token use',
      { userId: 'user-1', sessionId: 'session-1' },
      'dash-stack-auth',
      'dash-stack-api',
    ],
    [
      'refresh token use',
      { userId: 'user-1', sessionId: 'session-1', tokenUse: 'refresh' },
      'dash-stack-auth',
      'dash-stack-api',
    ],
    [
      'wrong issuer',
      { userId: 'user-1', sessionId: 'session-1', tokenUse: 'access' },
      'another-issuer',
      'dash-stack-api',
    ],
    [
      'wrong audience',
      { userId: 'user-1', sessionId: 'session-1', tokenUse: 'access' },
      'dash-stack-auth',
      'another-api',
    ],
  ])('should_reject_access_when_%s', async (_caseName, payload, issuer, audience) => {
    const candidate = new JwtService({ secret: 'test-http-access-secret' }).sign(payload, {
      expiresIn: '1m',
      issuer,
      audience,
    });

    const response = await fetch(`${origin}/protected-test`, {
      headers: { authorization: `Bearer ${candidate}` },
    });

    expect(response.status).toBe(401);
    expect(findSession).not.toHaveBeenCalled();
    expect(validateUser).not.toHaveBeenCalled();
  });

  it.each([
    [
      'wrong signature',
      () =>
        new JwtService({ secret: 'different-secret' }).sign(
          { userId: 'user-1', sessionId: 'session-1', tokenUse: 'access' },
          { expiresIn: '1m', issuer: 'dash-stack-auth', audience: 'dash-stack-api' },
        ),
    ],
    [
      'wrong algorithm',
      () =>
        new JwtService({ secret: 'test-http-access-secret' }).sign(
          { userId: 'user-1', sessionId: 'session-1', tokenUse: 'access' },
          {
            algorithm: 'HS384',
            expiresIn: '1m',
            issuer: 'dash-stack-auth',
            audience: 'dash-stack-api',
          },
        ),
    ],
    [
      'expired',
      () =>
        new JwtService({ secret: 'test-http-access-secret' }).sign(
          { userId: 'user-1', sessionId: 'session-1', tokenUse: 'access' },
          { expiresIn: '-1s', issuer: 'dash-stack-auth', audience: 'dash-stack-api' },
        ),
    ],
    [
      'future nbf',
      () =>
        new JwtService({ secret: 'test-http-access-secret' }).sign(
          { userId: 'user-1', sessionId: 'session-1', tokenUse: 'access' },
          {
            expiresIn: '2h',
            notBefore: '1h',
            issuer: 'dash-stack-auth',
            audience: 'dash-stack-api',
          },
        ),
    ],
    [
      'missing exp',
      () =>
        new JwtService({ secret: 'test-http-access-secret' }).sign(
          { userId: 'user-1', sessionId: 'session-1', tokenUse: 'access' },
          { issuer: 'dash-stack-auth', audience: 'dash-stack-api' },
        ),
    ],
  ])('should_reject_access_when_%s', async (_caseName, createToken) => {
    const response = await fetch(`${origin}/protected-test`, {
      headers: { authorization: `Bearer ${createToken()}` },
    });

    expect(response.status).toBe(401);
    expect(findSession).not.toHaveBeenCalled();
    expect(validateUser).not.toHaveBeenCalled();
  });

  it('should_reject_access_when_session_is_missing', async () => {
    findSession.mockResolvedValueOnce(null);

    const response = await fetch(`${origin}/protected-test`, {
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(401);
    expect(validateUser).not.toHaveBeenCalled();
  });

  it('should_reject_access_when_user_is_deleted', async () => {
    validateUser.mockResolvedValueOnce(null);

    const response = await fetch(`${origin}/protected-test`, {
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(401);
    expect(findSession).toHaveBeenCalledTimes(1);
  });
});
