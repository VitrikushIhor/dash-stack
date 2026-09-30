import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SecurityConfig } from '../../../common/configs/config.interface';
import { TokenGeneratorPort } from '../../application/ports/outgoing/token-generator.port';
import { AuthSessionRepositoryPort } from '../../application/ports/outgoing/auth-session.repository.port';
import { SessionCredentialPort } from '../../application/ports/outgoing/session-credential.port';
import { AuthTokens } from '../../shared/types/token.type';
import {
  ACCESS_JWT_AUDIENCE,
  ACCESS_JWT_ISSUER,
  ACCESS_JWT_USE,
} from '../../shared/constants/access-jwt.constants';

import {
  DEFAULT_REFRESH_TOKEN_TTL,
  MS_IN_SECOND,
  MS_IN_MINUTE,
  MS_IN_HOUR,
  MS_IN_DAY,
} from '../../domain/constants/auth.constants';

@Injectable()
export class JwtTokenGeneratorAdapter implements TokenGeneratorPort {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject('AuthSessionRepositoryPort')
    private readonly authSessionRepo: AuthSessionRepositoryPort,
    @Inject('SessionCredentialPort')
    private readonly sessionCredential: SessionCredentialPort,
  ) {}

  async generateTokens(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const credential = this.sessionCredential.create();
    const expiresAt = this.getSessionExpiresAt(new Date());
    const session = await this.authSessionRepo.create({
      userId,
      credentialHash: credential.hash,
      expiresAt,
      userAgent,
      ipAddress,
    });
    const accessToken = this.generateAccessToken(userId, session.id);

    return { accessToken, refreshToken: credential.raw };
  }

  generateAccessToken(userId: string, sessionId: string): string {
    return this.jwtService.sign(
      { userId, sessionId, tokenUse: ACCESS_JWT_USE },
      {
        algorithm: 'HS256',
        issuer: ACCESS_JWT_ISSUER,
        audience: ACCESS_JWT_AUDIENCE,
      },
    );
  }

  getSessionExpiresAt(now: Date): Date {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return new Date(now.getTime() + this.parseExpiration(securityConfig.refreshIn));
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return DEFAULT_REFRESH_TOKEN_TTL;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * MS_IN_SECOND;
      case 'm':
        return value * MS_IN_MINUTE;
      case 'h':
        return value * MS_IN_HOUR;
      case 'd':
        return value * MS_IN_DAY;
      default:
        return DEFAULT_REFRESH_TOKEN_TTL;
    }
  }
}
