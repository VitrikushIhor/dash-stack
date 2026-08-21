import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '../../../common/exceptions/domain.exception';
import { Auth0ClientPort, Auth0UserInfo } from '../../application/ports/outgoing/auth0-client.port';
import { AUTH_ERRORS } from '../../domain/constants/auth-errors';

interface Auth0TokenExchangeResponse {
  access_token: string;
  id_token?: string;
  token_type?: string;
}

@Injectable()
export class Auth0ClientAdapter implements Auth0ClientPort {
  private readonly logger = new Logger(Auth0ClientAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async getUserInfo(tokenOrCode: string): Promise<Auth0UserInfo> {
    const domain = this.resolveDomain();

    // 1. Attempt direct user info fetch (assuming tokenOrCode is an access token)
    let userInfo = await this.fetchUserInfo(domain, tokenOrCode);

    // 2. If direct fetch fails (e.g. 401), attempt authorization code exchange
    if (!userInfo) {
      const accessToken = await this.exchangeCodeForAccessToken(domain, tokenOrCode);
      if (accessToken) {
        userInfo = await this.fetchUserInfo(domain, accessToken);
      }
    }

    if (!userInfo) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_AUTH0_TOKEN);
    }

    if (!userInfo.email) {
      throw new UnauthorizedException(AUTH_ERRORS.AUTH0_NO_EMAIL);
    }

    return userInfo;
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

  private async fetchUserInfo(domain: string, accessToken: string): Promise<Auth0UserInfo | null> {
    try {
      const response = await fetch(`https://${domain}/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) return null;
      return (await response.json()) as Auth0UserInfo;
    } catch (error) {
      this.logger.debug(`Auth0 /userinfo request failed: ${(error as Error)?.message}`);
      return null;
    }
  }

  private async exchangeCodeForAccessToken(domain: string, code: string): Promise<string | null> {
    const clientId =
      this.configService.get<string>('AUTH0_CLIENT_ID') ||
      process.env.AUTH0_CLIENT_ID ||
      process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

    if (!clientId) {
      this.logger.warn('AUTH0_CLIENT_ID is not configured for authorization code exchange');
      return null;
    }

    const clientSecret =
      this.configService.get<string>('AUTH0_CLIENT_SECRET') || process.env.AUTH0_CLIENT_SECRET;

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';

    try {
      const response = await fetch(`https://${domain}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: clientId,
          ...(clientSecret && { client_secret: clientSecret }),
          code,
          redirect_uri: `${frontendUrl}/oauth/callback`,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        this.logger.warn(`Auth0 token exchange failed (${response.status}): ${errorDetails}`);
        return null;
      }

      const payload = (await response.json()) as Auth0TokenExchangeResponse;
      return payload.access_token ?? null;
    } catch (error) {
      this.logger.error(`Auth0 token exchange exception: ${(error as Error)?.message}`);
      return null;
    }
  }
}
