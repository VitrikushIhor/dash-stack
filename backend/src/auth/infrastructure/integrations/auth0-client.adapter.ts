import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ServiceUnavailableException,
  UnauthorizedException,
  UpstreamServiceException,
} from '../../../common/exceptions/domain.exception';
import { Auth0ClientPort, Auth0UserInfo } from '../../application/ports/outgoing/auth0-client.port';
import { AUTH_ERRORS } from '../../domain/constants/auth-errors';

const AUTH0_REQUEST_TIMEOUT_MS = 5_000;

@Injectable()
export class Auth0ClientAdapter implements Auth0ClientPort {
  private readonly logger = new Logger(Auth0ClientAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async getUserInfo(accessToken: string): Promise<Auth0UserInfo> {
    const domain = this.resolveDomain();
    const response = await this.fetchUserInfo(domain, accessToken);

    if (response.status === 401 || response.status === 403) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_AUTH0_TOKEN);
    }

    if (!response.ok) {
      this.logger.warn(`Auth0 /userinfo unavailable with status ${response.status}`);
      throw new ServiceUnavailableException(AUTH_ERRORS.AUTH0_UNAVAILABLE);
    }

    return this.parseUserInfo(response);
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<Auth0UserInfo> {
    const domain = this.resolveDomain();
    const clientId = this.configService.get<string>('AUTH0_CLIENT_ID');
    const clientSecret = this.configService.get<string>('AUTH0_CLIENT_SECRET');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (!clientId || !clientSecret || !frontendUrl) {
      throw new ServiceUnavailableException(AUTH_ERRORS.AUTH0_NOT_CONFIGURED);
    }

    let response: Response;
    try {
      response = await fetch(`https://${domain}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code,
          code_verifier: codeVerifier,
          redirect_uri: `${frontendUrl.replace(/\/$/, '')}/api/auth/oauth/callback`,
        }),
        signal: AbortSignal.timeout(AUTH0_REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new ServiceUnavailableException(AUTH_ERRORS.AUTH0_UNAVAILABLE);
    }

    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_AUTH0_TOKEN);
    }
    if (!response.ok) {
      throw new ServiceUnavailableException(AUTH_ERRORS.AUTH0_UNAVAILABLE);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new UpstreamServiceException(AUTH_ERRORS.AUTH0_INVALID_RESPONSE);
    }

    if (
      typeof payload !== 'object' ||
      payload === null ||
      typeof Reflect.get(payload, 'access_token') !== 'string' ||
      !Reflect.get(payload, 'access_token')
    ) {
      throw new UpstreamServiceException(AUTH_ERRORS.AUTH0_INVALID_RESPONSE);
    }

    const accessToken: unknown = Reflect.get(payload, 'access_token');
    if (typeof accessToken !== 'string') {
      throw new UpstreamServiceException(AUTH_ERRORS.AUTH0_INVALID_RESPONSE);
    }
    return this.getUserInfo(accessToken);
  }

  private resolveDomain(): string {
    const rawDomain =
      this.configService.get<string>('AUTH0_DOMAIN') ||
      process.env.AUTH0_DOMAIN ||
      process.env.NEXT_PUBLIC_AUTH0_DOMAIN;

    if (!rawDomain) {
      this.logger.error('AUTH0_DOMAIN is missing from environment variables');
      throw new UnauthorizedException(AUTH_ERRORS.AUTH0_DOMAIN_NOT_CONFIGURED);
    }

    return rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  private async fetchUserInfo(domain: string, accessToken: string): Promise<Response> {
    try {
      return await fetch(`https://${domain}/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(AUTH0_REQUEST_TIMEOUT_MS),
      });
    } catch {
      this.logger.warn('Auth0 /userinfo request failed');
      throw new ServiceUnavailableException(AUTH_ERRORS.AUTH0_UNAVAILABLE);
    }
  }

  private async parseUserInfo(response: Response): Promise<Auth0UserInfo> {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new UpstreamServiceException(AUTH_ERRORS.AUTH0_INVALID_RESPONSE);
    }

    if (!this.isAuth0UserInfo(payload)) {
      throw new UpstreamServiceException(AUTH_ERRORS.AUTH0_INVALID_RESPONSE);
    }

    return payload;
  }

  private isAuth0UserInfo(value: unknown): value is Auth0UserInfo {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

    const sub: unknown = Reflect.get(value, 'sub');
    const email: unknown = Reflect.get(value, 'email');
    const name: unknown = Reflect.get(value, 'name');
    const picture: unknown = Reflect.get(value, 'picture');
    const emailVerified: unknown = Reflect.get(value, 'email_verified');

    return (
      typeof sub === 'string' &&
      sub.length > 0 &&
      typeof email === 'string' &&
      email.length > 0 &&
      (name === undefined || typeof name === 'string') &&
      (picture === undefined || typeof picture === 'string') &&
      (emailVerified === undefined || typeof emailVerified === 'boolean')
    );
  }
}
