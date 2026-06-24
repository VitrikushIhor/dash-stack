import { Injectable, Logger } from '@nestjs/common';
import { UnauthorizedException } from '../../../common/exceptions/domain.exception';
import { ConfigService } from '@nestjs/config';
import {
  Auth0ClientPort,
  Auth0UserInfo,
} from '../../application/ports/outgoing/auth0-client.port';
import { AUTH_ERRORS } from '../../domain/constants/auth-errors';

@Injectable()
export class Auth0ClientAdapter implements Auth0ClientPort {
  private readonly logger = new Logger(Auth0ClientAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async getUserInfo(token: string): Promise<Auth0UserInfo> {
    const domain = this.configService.get<string>('AUTH0_DOMAIN');

    if (!domain) {
      throw new UnauthorizedException(AUTH_ERRORS.AUTH0_DOMAIN_NOT_CONFIGURED);
    }

    const response = await fetch(`https://${domain}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      this.logger.warn(`Auth0 /userinfo failed with status ${response.status}`);
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_AUTH0_TOKEN);
    }

    const userInfo = await response.json();

    if (!userInfo.email) {
      throw new UnauthorizedException(AUTH_ERRORS.AUTH0_NO_EMAIL);
    }

    return userInfo;
  }
}
