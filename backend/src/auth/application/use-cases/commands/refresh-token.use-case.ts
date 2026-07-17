import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../../../../common/exceptions/domain.exception';
import { RefreshTokenRepositoryPort } from '../../ports/outgoing/refresh-token.repository.port';
import { TokenGeneratorPort } from '../../ports/outgoing/token-generator.port';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';

import { RefreshTokenCommand } from '../../commands/refresh-token.command';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('RefreshTokenRepositoryPort')
    private readonly refreshTokenRepo: RefreshTokenRepositoryPort,
    @Inject('TokenGeneratorPort')
    private readonly tokenGenerator: TokenGeneratorPort,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<{ accessToken: string }> {
    const refreshToken = await this.refreshTokenRepo.findByToken(command.token);

    if (!refreshToken) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.refreshTokenRepo.deleteById(refreshToken.id);
      throw new UnauthorizedException(AUTH_ERRORS.REFRESH_TOKEN_EXPIRED);
    }

    const accessToken = this.tokenGenerator.generateAccessToken(
      refreshToken.userId,
    );

    return { accessToken };
  }
}
