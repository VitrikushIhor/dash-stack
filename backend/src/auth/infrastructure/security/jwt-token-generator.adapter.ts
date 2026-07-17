import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { SecurityConfig } from '../../../common/configs/config.interface';
import { TokenGeneratorPort } from '../../application/ports/outgoing/token-generator.port';
import { RefreshTokenRepositoryPort } from '../../application/ports/outgoing/refresh-token.repository.port';
import { AuthTokens } from '../../shared/types/token.type';
import { Inject } from '@nestjs/common';
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
    @Inject('RefreshTokenRepositoryPort')
    private readonly refreshTokenRepo: RefreshTokenRepositoryPort,
  ) {}

  async generateTokens(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = await this.createRefreshToken(
      userId,
      userAgent,
      ipAddress,
    );

    return { accessToken, refreshToken };
  }

  generateAccessToken(userId: string): string {
    return this.jwtService.sign({ userId });
  }

  private async createRefreshToken(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    const token = randomUUID();
    const expiresMs = this.parseExpiration(securityConfig.refreshIn);

    await this.refreshTokenRepo.create({
      userId,
      token,
      expiresAt: new Date(Date.now() + expiresMs),
      userAgent,
      ipAddress,
    });

    return token;
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
