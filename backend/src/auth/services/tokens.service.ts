import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SecurityConfig } from 'src/common/configs/config.interface';
import { Token } from '../models/token.model';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class TokensService {
  constructor(
    private configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  public async generateTokens(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<Token> {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = await this.createRefreshToken(
      userId,
      userAgent,
      ipAddress,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  public generateAccessToken(userId: string): string {
    return this.jwtService.sign({ userId });
  }

  public async createRefreshToken(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    const token = randomUUID();

    // Parse refresh expiration (e.g., "7d" -> 7 days)
    const expiresIn = securityConfig.refreshIn;
    const expiresMs = this.parseExpiration(expiresIn);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + expiresMs),
        userAgent,
        ipAddress,
      },
    });

    return token;
  }

  public getUserFromToken(token: string): Promise<User | null> {
    const decoded = this.jwtService.decode(token);
    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      return null;
    }
    return this.prisma.user.findUnique({ where: { id: decoded.userId } });
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000; // Default: 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
