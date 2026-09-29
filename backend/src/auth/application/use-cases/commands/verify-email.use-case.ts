import { Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { VerificationTokenRepositoryPort } from '../../ports/outgoing/verification-token.repository.port';
import { TokenGeneratorPort } from '../../ports/outgoing/token-generator.port';
import { TokenExpiryPolicy } from '../../../domain/policies/token-expiry.policy';
import { AUTH_ERRORS } from '../../../domain/constants/auth-errors';
import { AuthTokens } from '../../../shared/types/token.type';
import { AuthTokenType } from '../../../domain/enums/token-type.enum';
import { OneTimeTokenPort } from '../../ports/outgoing/one-time-token.port';
import { SessionCredentialPort } from '../../ports/outgoing/session-credential.port';
import { EmailVerificationTransactionPort } from '../../ports/outgoing/email-verification-transaction.port';

import { VerifyEmailCommand } from '../../commands/verify-email.command';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject('VerificationTokenRepositoryPort')
    private readonly verificationTokenRepo: VerificationTokenRepositoryPort,
    @Inject('TokenGeneratorPort')
    private readonly tokenGenerator: TokenGeneratorPort,
    @Inject('OneTimeTokenPort')
    private readonly oneTimeToken: OneTimeTokenPort,
    @Inject('SessionCredentialPort')
    private readonly sessionCredential: SessionCredentialPort,
    @Inject('EmailVerificationTransactionPort')
    private readonly emailVerificationTransaction: EmailVerificationTransactionPort,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<AuthTokens> {
    const verificationToken = await this.verificationTokenRepo.findByToken(
      this.oneTimeToken.hash(command.token),
    );

    if (!verificationToken) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_VERIFICATION_TOKEN);
    }

    if (verificationToken.type !== AuthTokenType.EMAIL_VERIFICATION) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_TOKEN_TYPE);
    }

    TokenExpiryPolicy.assertNotExpired(
      verificationToken.expires,
      AUTH_ERRORS.VERIFICATION_TOKEN_EXPIRED,
    );

    const now = new Date();
    const credential = this.sessionCredential.create();
    const completed = await this.emailVerificationTransaction.complete({
      tokenId: verificationToken.id,
      tokenHash: verificationToken.token,
      email: verificationToken.email,
      credentialHash: credential.hash,
      sessionExpiresAt: this.tokenGenerator.getSessionExpiresAt(now),
      now,
    });

    if (!completed) {
      throw new BadRequestException(AUTH_ERRORS.INVALID_VERIFICATION_TOKEN);
    }

    return {
      accessToken: this.tokenGenerator.generateAccessToken(completed.userId, completed.sessionId),
      refreshToken: credential.raw,
    };
  }
}
