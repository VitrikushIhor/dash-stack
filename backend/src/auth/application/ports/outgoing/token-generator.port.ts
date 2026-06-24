import { AuthTokens } from '../../../shared/types/token.type';

export interface TokenGeneratorPort {
  generateTokens(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokens>;
  generateAccessToken(userId: string): string;
}
