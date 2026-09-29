import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../../../../common/exceptions/domain.exception';
import { AuthSessionRepositoryPort } from '../../ports/outgoing/auth-session.repository.port';
import { SessionCredentialPort } from '../../ports/outgoing/session-credential.port';
import { TokenGeneratorPort } from '../../ports/outgoing/token-generator.port';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';
import { AuthTokens } from '../../../shared/types/token.type';
import { RefreshTokenCommand } from '../../commands/refresh-token.command';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('AuthSessionRepositoryPort')
    private readonly authSessionRepo: AuthSessionRepositoryPort,
    @Inject('SessionCredentialPort')
    private readonly sessionCredential: SessionCredentialPort,
    @Inject('TokenGeneratorPort')
    private readonly tokenGenerator: TokenGeneratorPort,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthTokens> {
    const credentialHash = this.sessionCredential.hash(command.token);
    const session = await this.authSessionRepo.findByCredentialHash(credentialHash);

    if (!session) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }
    if (session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException(AUTH_ERRORS.REFRESH_TOKEN_EXPIRED);
    }

    return {
      accessToken: this.tokenGenerator.generateAccessToken(session.userId, session.id),
      refreshToken: command.token,
    };
  }
}
